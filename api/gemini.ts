import { GoogleGenAI, Modality } from "@google/genai";

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_TEXT_MAX_OUTPUT_TOKENS = 768;
const MAX_MONSTER_NAME_LENGTH = 120;
const MAX_PROMPT_LENGTH = 4_000;
const MAX_DESCRIPTION_LENGTH = 8_000;
const MAX_INPUT_IMAGE_LENGTH = 3_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type JsonRecord = Record<string, unknown>;

interface InputImage {
  base64: string;
  mimeType: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  body: JsonRecord,
  field: string,
  maxLength: number,
): string | null {
  const value = body[field];
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue.length > maxLength) return null;

  return trimmedValue;
}

function readInputImage(value: unknown): InputImage | null | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return null;

  const base64 = value.base64;
  const mimeType = value.mimeType;

  if (
    typeof base64 !== "string" ||
    !base64 ||
    base64.length > MAX_INPUT_IMAGE_LENGTH ||
    typeof mimeType !== "string" ||
    !ALLOWED_IMAGE_TYPES.has(mimeType)
  ) {
    return null;
  }

  return { base64, mimeType };
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function parseBody(request: Request): Promise<JsonRecord | null> {
  try {
    const parsedBody: unknown = await request.json();
    return isRecord(parsedBody) ? parsedBody : null;
  } catch {
    return null;
  }
}

function jsonResponse(body: JsonRecord, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function generateText(ai: GoogleGenAI, body: JsonRecord): Promise<string | null> {
  const monsterName = readRequiredString(body, "monsterName", MAX_MONSTER_NAME_LENGTH);
  const userPrompt = readRequiredString(body, "userPrompt", MAX_PROMPT_LENGTH);
  if (!monsterName || !userPrompt) return null;

  const fullPrompt = `Descreva o monstro "${monsterName}" durante um encontro de RPG de mesa.

Contexto adicional do usuário: ${userPrompt}

Concentre a descrição no próprio monstro: aparência, anatomia, tamanho, pele ou revestimento, olhos, membros, postura, movimentos, sons, cheiro, comportamento e detalhes marcantes. Mostre como ele observa, reage ou ameaça os personagens. Use o ambiente apenas em uma ou duas frases para situar a criatura, sem transformar o cenário no foco principal.

Escreva somente dois parágrafos curtos, entre 120 e 180 palavras no total. Termine o segundo parágrafo com uma frase completa e impactante. Não use títulos, listas, regras de jogo ou estatísticas.`;

  const geminiResponse = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: fullPrompt,
    config: {
      temperature: 0.9,
      maxOutputTokens: GEMINI_TEXT_MAX_OUTPUT_TOKENS,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  return geminiResponse.text?.trim() || null;
}

async function generateImage(
  ai: GoogleGenAI,
  body: JsonRecord,
): Promise<{ base64: string; mimeType: string } | null | undefined> {
  const monsterName = readRequiredString(body, "monsterName", MAX_MONSTER_NAME_LENGTH);
  const description = readRequiredString(body, "description", MAX_DESCRIPTION_LENGTH);
  const inputImage = readInputImage(body.inputImage);

  if (!monsterName || !description || inputImage === null) return undefined;

  const prompt = `Essa é a descrição do monstro: "${description}". Gere uma imagem épica e detalhada do monstro chamado "${monsterName}". Considere clima, iluminação e impacto visual cinematográfico, priorizando a descrição enviada.`;

  const requestParts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [{ text: prompt }];

  if (inputImage) {
    requestParts.push({
      inlineData: {
        data: inputImage.base64,
        mimeType: inputImage.mimeType,
      },
    });
  }

  const geminiResponse = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [{ role: "user", parts: requestParts }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const parts = geminiResponse.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    const base64 = part.inlineData?.data;
    const mimeType = part.inlineData?.mimeType;

    if (base64 && mimeType?.startsWith("image/")) {
      return { base64, mimeType };
    }
  }

  return null;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não permitido." }), {
        status: 405,
        headers: {
          "Allow": "POST",
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
      });
    }

    if (!isSameOriginRequest(request)) {
      return jsonResponse({ error: "Origem não permitida." }, 403);
    }

    const body = await parseBody(request);
    if (!body) {
      return jsonResponse({ error: "Corpo da requisição inválido." }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error("GEMINI_API_KEY não está configurada na Vercel.");
      return jsonResponse({ error: "Serviço de IA não configurado." }, 500);
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      if (body.action === "text") {
        const text = await generateText(ai, body);
        if (!text) {
          return jsonResponse({ error: "Dados para geração de texto inválidos." }, 400);
        }

        return jsonResponse({ text }, 200);
      }

      if (body.action === "image") {
        const image = await generateImage(ai, body);
        if (image === undefined) {
          return jsonResponse({ error: "Dados para geração de imagem inválidos." }, 400);
        }
        if (!image) {
          return jsonResponse({ error: "O Gemini não retornou uma imagem." }, 502);
        }

        return jsonResponse({
          imageBase64: image.base64,
          mimeType: image.mimeType,
        }, 200);
      }

      return jsonResponse({ error: "Ação inválida." }, 400);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erro ao chamar o Gemini:", errorMessage);
      return jsonResponse({ error: "Não foi possível gerar o conteúdo." }, 502);
    }
  },
};
