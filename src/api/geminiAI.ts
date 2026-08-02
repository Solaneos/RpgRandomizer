import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_TEXT_MAX_OUTPUT_TOKENS = 2048;

if (!apiKey || apiKey.trim() === '') {
  console.error('Erro: VITE_GEMINI_API_KEY não está configurada no ambiente.');
}

// ✅ Texto
export async function generateMonsterEncounterText(
  monsterName: string,
  userPrompt: string
): Promise<string> {
  if (!monsterName || !userPrompt) return '';

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: GEMINI_TEXT_MODEL,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: GEMINI_TEXT_MAX_OUTPUT_TOKENS,
    },
  });

  const fullPrompt = `Crie uma descrição imersiva para um encontro de RPG de mesa com o monstro "${monsterName}". ${userPrompt}.
Foque na atmosfera, nos sentidos (visão, som, cheiro) e no impacto emocional do monstro. Não inclua regras de jogo ou estatísticas.`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text || '';
  } catch (error: any) {
    console.error('Erro ao gerar texto com Gemini:', error.message || error);
    return '';
  }
}

// ✅ Imagem


export async function generateMonsterEncounterImage(
  monsterName: string,
  description: string,
  inputImage?: {
    base64: string;
    mimeType: string;
  }
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    console.error("Erro: VITE_GEMINI_API_KEY não está configurada.");
    return null;
  }

  if (!description.trim() || !monsterName.trim()) {
    console.warn("Descrição ou nome do monstro ausente para geração de imagem.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Essa é a descrição do monstro: "${description}", gere uma imagem épica e detalhada do monstro chamado "${monsterName}". 
    Considere clima, iluminação e impacto visual cinematográfico e principalmente a descrição que eu estou enviando.`;

    const requestParts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [{ text: prompt }];

    if (inputImage?.base64 && inputImage?.mimeType) {
      requestParts.push({
        inlineData: {
          data: inputImage.base64,
          mimeType: inputImage.mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: [{ role: "user", parts: requestParts }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    const candidateParts = candidates?.[0]?.content?.parts;
    if (!candidateParts) return null;

    for (const part of candidateParts) {
      const imageData = part.inlineData?.data;
      const mimeType = part.inlineData?.mimeType;

      if (imageData && mimeType?.startsWith("image/")) {
        return imageData;
      }
    }

    return null;
  } catch (error: any) {
    console.error("Erro ao gerar imagem com Gemini:", error.message || error);
    return null;
  }
}


