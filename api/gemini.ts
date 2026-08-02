import { GoogleGenAI } from "@google/genai";

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const CLOUDFLARE_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const GEMINI_TEXT_MAX_OUTPUT_TOKENS = 768;
const MAX_MONSTER_NAME_LENGTH = 120;
const MAX_PROMPT_LENGTH = 4_000;
const MAX_DESCRIPTION_LENGTH = 8_000;
const CLOUDFLARE_IMAGE_PROMPT_MAX_LENGTH = 2_048;
const CLOUDFLARE_IMAGE_STEPS = 4;

type JsonRecord = Record<string, unknown>;

class ProviderRequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ProviderRequestError";
    this.statusCode = statusCode;
  }
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return String(error);
}

function getErrorStatus(error: unknown, message: string): number | null {
  if (isRecord(error)) {
    const status = error.statusCode ?? error.status ?? error.code;
    if (typeof status === "number") return status;
    if (typeof status === "string" && /^\d{3}$/.test(status)) return Number(status);
  }

  const statusMatch = message.match(/(?:^|\D)(400|401|403|404|429|500|502|503)(?:\D|$)/);
  return statusMatch ? Number(statusMatch[1]) : null;
}

function getPublicGenerationError(
  error: unknown,
  isImageRequest: boolean,
): { code: string; message: string; status: number } {
  const errorMessage = getErrorMessage(error);
  const normalizedMessage = errorMessage.toUpperCase();
  const providerStatus = getErrorStatus(error, errorMessage);

  if (
    providerStatus === 429 ||
    normalizedMessage.includes("RESOURCE_EXHAUSTED") ||
    normalizedMessage.includes("QUOTA")
  ) {
    return {
      code: isImageRequest ? "CLOUDFLARE_DAILY_LIMIT" : "GEMINI_QUOTA_EXCEEDED",
      message: isImageRequest
        ? "A cota gratuita diária de imagens da Cloudflare foi atingida."
        : "A cota do Gemini foi excedida. Tente novamente mais tarde.",
      status: 429,
    };
  }

  if (
    providerStatus === 401 ||
    providerStatus === 403 ||
    normalizedMessage.includes("PERMISSION_DENIED")
  ) {
    return {
      code: isImageRequest ? "CLOUDFLARE_AUTH_FAILED" : "GEMINI_PERMISSION_DENIED",
      message: isImageRequest
        ? "O token da Cloudflare é inválido ou não tem permissão para Workers AI."
        : "A chave do Gemini não tem permissão para usar este modelo.",
      status: 403,
    };
  }

  if (providerStatus === 404 || normalizedMessage.includes("NOT_FOUND")) {
    return {
      code: isImageRequest ? "CLOUDFLARE_MODEL_NOT_FOUND" : "GEMINI_MODEL_NOT_FOUND",
      message: isImageRequest
        ? "O modelo de imagem da Cloudflare não está disponível."
        : "O modelo solicitado não está disponível para este projeto.",
      status: 502,
    };
  }

  if (providerStatus === 400 || normalizedMessage.includes("INVALID_ARGUMENT")) {
    return {
      code: isImageRequest ? "CLOUDFLARE_INVALID_REQUEST" : "GEMINI_INVALID_REQUEST",
      message: isImageRequest
        ? "A Cloudflare recusou os dados enviados para geração da imagem."
        : "O Gemini recusou os dados enviados para geração.",
      status: 400,
    };
  }

  return {
    code: isImageRequest ? "CLOUDFLARE_GENERATION_FAILED" : "GEMINI_GENERATION_FAILED",
    message: isImageRequest
      ? "Não foi possível gerar a imagem com a Cloudflare."
      : "Não foi possível gerar o conteúdo com o Gemini.",
    status: 502,
  };
}

function getCloudflareErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.errors)) return null;

  const messages = payload.errors
    .map((error) => isRecord(error) && typeof error.message === "string" ? error.message : null)
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join("; ") : null;
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

function buildCloudflareImagePrompt(
  monsterName: string,
  scenario: string,
  description: string,
): string {
  const prefix = `Create a cinematic dark-fantasy tabletop RPG encounter illustration.
Main creature: ${monsterName}.
Encounter scenario and environment (must be clearly represented): `;
  const separator = `
Creature appearance and behavior: `;
  const suffix = `
Keep the creature as the main subject, but visibly preserve the location, atmosphere, lighting, objects and action specified by the encounter scenario. Do not replace the requested setting with a generic background. Full-body creature when possible, highly detailed anatomy, dramatic composition, no text, no labels, no interface.`;
  const availableLength = Math.max(
    0,
    CLOUDFLARE_IMAGE_PROMPT_MAX_LENGTH - prefix.length - separator.length - suffix.length,
  );

  let scenarioLength = Math.min(scenario.length, Math.floor(availableLength * 0.4));
  let descriptionLength = Math.min(description.length, availableLength - scenarioLength);
  let remainingLength = availableLength - scenarioLength - descriptionLength;

  const additionalScenarioLength = Math.min(
    remainingLength,
    scenario.length - scenarioLength,
  );
  scenarioLength += additionalScenarioLength;
  remainingLength -= additionalScenarioLength;
  descriptionLength += Math.min(
    remainingLength,
    description.length - descriptionLength,
  );

  return `${prefix}${scenario.slice(0, scenarioLength)}${separator}${description.slice(0, descriptionLength)}${suffix}`;
}

async function generateImage(
  body: JsonRecord,
  accountId: string,
  apiToken: string,
): Promise<{ base64: string; mimeType: string } | null | undefined> {
  const monsterName = readRequiredString(body, "monsterName", MAX_MONSTER_NAME_LENGTH);
  const description = readRequiredString(body, "description", MAX_DESCRIPTION_LENGTH);
  const scenario = readRequiredString(body, "scenario", MAX_PROMPT_LENGTH);
  if (!monsterName || !description || !scenario) return undefined;

  const prompt = buildCloudflareImagePrompt(monsterName, scenario, description);

  const cloudflareResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        steps: CLOUDFLARE_IMAGE_STEPS,
      }),
    },
  );

  const payload: unknown = await cloudflareResponse.json().catch(() => null);
  if (!cloudflareResponse.ok) {
    throw new ProviderRequestError(
      cloudflareResponse.status,
      getCloudflareErrorMessage(payload) ?? `Cloudflare Workers AI HTTP ${cloudflareResponse.status}`,
    );
  }

  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.result)) {
    throw new ProviderRequestError(
      502,
      getCloudflareErrorMessage(payload) ?? "Resposta inválida da Cloudflare Workers AI.",
    );
  }

  const base64 = payload.result.image;
  if (typeof base64 !== "string" || !base64) {
    return null;
  }

  return {
    base64,
    mimeType: "image/jpeg",
  };
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

    try {
      if (body.action === "text") {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
          console.error("GEMINI_API_KEY não está configurada na Vercel.");
          return jsonResponse({ error: "Geração de texto não configurada." }, 500);
        }

        const ai = new GoogleGenAI({ apiKey });
        const text = await generateText(ai, body);
        if (!text) {
          return jsonResponse({ error: "Dados para geração de texto inválidos." }, 400);
        }

        return jsonResponse({ text }, 200);
      }

      if (body.action === "image") {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
        const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
        if (!accountId || !apiToken) {
          console.error("Credenciais da Cloudflare não estão configuradas na Vercel.");
          return jsonResponse({ error: "Geração de imagem não configurada." }, 500);
        }

        const image = await generateImage(body, accountId, apiToken);
        if (image === undefined) {
          return jsonResponse({ error: "Dados para geração de imagem inválidos." }, 400);
        }
        if (!image) {
          return jsonResponse({ error: "A Cloudflare não retornou uma imagem." }, 502);
        }

        return jsonResponse({
          imageBase64: image.base64,
          mimeType: image.mimeType,
        }, 200);
      }

      return jsonResponse({ error: "Ação inválida." }, 400);
    } catch (error: unknown) {
      const isImageRequest = body.action === "image";
      const secrets = [
        process.env.GEMINI_API_KEY?.trim(),
        process.env.CLOUDFLARE_API_TOKEN?.trim(),
      ].filter((secret): secret is string => Boolean(secret));
      const errorMessage = secrets.reduce(
        (message, secret) => message.replaceAll(secret, "[REDACTED]"),
        getErrorMessage(error),
      );
      const publicError = getPublicGenerationError(error, isImageRequest);
      console.error(`Erro ao chamar ${isImageRequest ? "Cloudflare" : "Gemini"}:`, errorMessage);
      return jsonResponse({
        error: publicError.message,
        code: publicError.code,
      }, publicError.status);
    }
  },
};
