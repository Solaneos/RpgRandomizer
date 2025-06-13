import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1000,
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
  description: string
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

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    const parts = candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
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


