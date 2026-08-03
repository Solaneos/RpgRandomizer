import type {
  CityEnvironmentOption,
  CitySizeOption,
  CityThemeOption,
  GeneratedCity,
} from "../utils/cities/generateCity";

interface GeminiErrorResponse {
  error?: string;
}

export interface HumanEnemyGroupRequest {
  groupType: string;
  technologyLevel: string;
  magicLevel: string;
  quantity: number;
  difficulty: number;
  context: string;
}

export interface GeneratedHumanEnemy {
  nome: string;
  funcao: string;
  aparencia: string;
  armas: string[];
  magias: string[];
  ataque: number;
  defesa: number;
}

export interface GeneratedHumanEnemyGroup {
  nomeDoGrupo: string;
  descricao: string;
  estrategia: string;
  inimigos: GeneratedHumanEnemy[];
}

export interface CityAIRequest {
  size: CitySizeOption;
  environment: CityEnvironmentOption;
  theme: CityThemeOption;
  details: string;
}

async function postToGemini<TResponse>(body: Record<string, unknown>): Promise<TResponse> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let data: (TResponse & GeminiErrorResponse) | null = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText) as TResponse & GeminiErrorResponse;
    } catch {
      throw new Error(`O serviço de IA retornou uma resposta inválida (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Não foi possível chamar o serviço de IA (HTTP ${response.status}).`);
  }

  if (!data) {
    throw new Error("O serviço de IA retornou uma resposta vazia.");
  }

  return data;
}

export async function generateMonsterEncounterText(
  monsterName: string,
  userPrompt: string
): Promise<string> {
  if (!monsterName || !userPrompt) return '';

  try {
    const response = await postToGemini<{ text: string }>({
      action: "text",
      monsterName,
      userPrompt,
    });
    return response.text?.trim() || '';
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error('Erro ao gerar texto com Gemini:', errorMessage);
    return '';
  }
}

export async function generateMonsterEncounterImage(
  monsterName: string,
  scenario: string,
): Promise<{ base64: string; mimeType: string } | null> {
  if (!scenario.trim() || !monsterName.trim()) {
    console.warn("Cenário ou nome do monstro ausente para geração de imagem.");
    return null;
  }

  const response = await postToGemini<{ imageBase64: string; mimeType: string }>({
    action: "image",
    monsterName,
    scenario,
  });

  if (!response.imageBase64) return null;

  return {
    base64: response.imageBase64,
    mimeType: response.mimeType || "image/jpeg",
  };
}

export async function generateHumanEnemyGroup(
  request: HumanEnemyGroupRequest,
): Promise<GeneratedHumanEnemyGroup> {
  const response = await postToGemini<{ group: GeneratedHumanEnemyGroup }>({
    action: "human-group",
    ...request,
  });

  if (!response.group || !Array.isArray(response.group.inimigos)) {
    throw new Error("O Gemini retornou um grupo em formato inválido.");
  }

  return response.group;
}

export async function generateCityWithAI(request: CityAIRequest): Promise<GeneratedCity> {
  const response = await postToGemini<{ city: GeneratedCity }>({
    action: "city",
    ...request,
  });

  if (!response.city || !Array.isArray(response.city.distritos)) {
    throw new Error("O Gemini retornou uma cidade em formato inválido.");
  }

  return response.city;
}


