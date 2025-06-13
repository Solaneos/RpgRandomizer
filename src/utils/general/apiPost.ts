import { getMonsterFlavorText } from "../../api/openAi";
import {
  generateMonsterEncounterText,
  generateMonsterEncounterImage,
} from "../../api/geminiAI";

export class ApiPost {
  apiKey?: string;
  useOpenAI: boolean;
  tryImageGeneration: boolean;

  constructor(apiKey?: string, useOpenAI = false, tryImageGeneration = true) {
    this.apiKey = apiKey;
    this.useOpenAI = useOpenAI;
    this.tryImageGeneration = tryImageGeneration;
  }

  async generate({
    monsterName,
    environment,
    prompt,
  }: {
    monsterName: string;
    environment: string;
    prompt: string;
  }): Promise<{ text: string; imageBase64: string | null }> {
    if (!prompt.trim()) {
      return { text: "", imageBase64: null };
    }

    const envText =
      environment.toUpperCase() === "TODOS"
        ? ""
        : `O encontro acontece no ambiente de ${environment}. `;

    const finalPrompt = `Crie uma descrição imersiva para um encontro de RPG de mesa com o monstro "${monsterName}". ${envText} Considere os seguintes detalhes: "${prompt}". 
    Foque na atmosfera, nos sentidos (visão, som, cheiro) e no impacto emocional do monstro. Não inclua regras de jogo ou estatísticas.`;

    try {
      // OpenAI
      if (this.useOpenAI) {
        if (!this.apiKey || !this.apiKey.trim()) {
          return {
            text: "Erro: Chave da OpenAI ausente.",
            imageBase64: null,
          };
        }

        const result = await getMonsterFlavorText(finalPrompt, this.apiKey);
        return {
          text: result || "Não foi possível gerar o texto com a OpenAI.",
          imageBase64: null,
        };
      }

      // Gemini
      const text = await generateMonsterEncounterText(monsterName, finalPrompt);
      if (!text) {
        return {
          text: "Não foi possível gerar o texto com o Gemini.",
          imageBase64: null,
        };
      }

      let imageBase64: string | null = null;

      if (this.tryImageGeneration) {
        try {
          imageBase64 = await generateMonsterEncounterImage(monsterName, text);
        } catch (imgError) {
          console.warn("Erro ao gerar imagem com Gemini:", imgError);
        }
      }

      return {
        text,
        imageBase64,
      };
    } catch (error: any) {
      console.error("Erro na geração de texto:", error);
      return {
        text: "Erro ao gerar texto. Verifique sua conexão ou chave de API.",
        imageBase64: null,
      };
    }
  }
}
