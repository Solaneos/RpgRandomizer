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
    onTextGenerated,
  }: {
    monsterName: string;
    environment: string;
    prompt: string;
    onTextGenerated?: (text: string) => void;
  }): Promise<{
    text: string;
    imageBase64: string | null;
    imageMimeType?: string;
    imageError?: string;
  }> {
    if (!prompt.trim()) {
      return { text: "", imageBase64: null };
    }

    const envText =
      environment.toUpperCase() === "TODOS"
        ? ""
        : `O encontro acontece no ambiente de ${environment}. `;

    const finalPrompt = `Crie uma descrição imersiva para um encontro de RPG de mesa com o monstro "${monsterName}". ${envText} Considere os seguintes detalhes: "${prompt}". 
    Foque na atmosfera, nos sentidos (visão, som, cheiro) e no impacto emocional do monstro. Não inclua regras de jogo ou estatísticas.`;
    const imageScenario = `${envText}${prompt}`.trim();

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
        if (result) onTextGenerated?.(result);
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

      onTextGenerated?.(text);

      let imageBase64: string | null = null;
      let imageMimeType: string | undefined;
      let imageError: string | undefined;

      if (this.tryImageGeneration) {
        try {
          const image = await generateMonsterEncounterImage(
            monsterName,
            text,
            imageScenario,
          );
          imageBase64 = image?.base64 ?? null;
          imageMimeType = image?.mimeType;
        } catch (error: unknown) {
          imageError = error instanceof Error
            ? error.message
            : "Não foi possível gerar a imagem com o Gemini.";
          console.warn("Erro ao gerar imagem com Gemini:", imageError);
        }
      }

      return {
        text,
        imageBase64,
        imageMimeType,
        imageError,
      };
    } catch (error: unknown) {
      console.error("Erro na geração de texto:", error);
      return {
        text: "Erro ao gerar texto. Verifique sua conexão ou chave de API.",
        imageBase64: null,
      };
    }
  }
}
