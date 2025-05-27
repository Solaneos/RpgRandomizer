import { getMonsterFlavorText } from "../../api/openAi";
import { generateMonsterEncounterText } from "../../api/geminiAI";

export class ApiPost {
  apiKey?: string;
  useOpenAI: boolean;

  constructor(apiKey?: string, useOpenAI = false) {
    this.apiKey = apiKey;
    this.useOpenAI = useOpenAI;
  }

  async generate({
    monsterName,
    environment,
    prompt,
  }: {
    monsterName: string;
    environment: string;
    prompt: string;
  }): Promise<string> {
    if (!prompt.trim()) {
      return "";
    }

    const envText =
      environment.toUpperCase() === "TODOS"
        ? ""
        : `O encontro acontece no ambiente de ${environment}. `;

    const finalPrompt = `Crie uma descrição imersiva para um encontro de RPG de mesa com o monstro "${monsterName}". ${envText} Considere os seguintes detalhes: "${prompt}". 
    Foque na atmosfera, nos sentidos (visão, som, cheiro) e no impacto emocional do monstro. Não inclua regras de jogo ou estatísticas.`;

    try {
      if (this.useOpenAI) {
        if (!this.apiKey || !this.apiKey.trim()) {
          return "Erro: Chave da OpenAI ausente.";
        }

        const result = await getMonsterFlavorText(finalPrompt, this.apiKey);
        return result || "Não foi possível gerar o texto com a OpenAI.";
      } else {
        const result = await generateMonsterEncounterText(monsterName, finalPrompt);
        return result || "Não foi possível gerar o texto com o Gemini.";
      }
    } catch (error: any) {
      console.error("Erro na geração de texto:", error);
      return "Erro ao gerar texto. Verifique sua conexão ou chave de API.";
    }
  }
}
