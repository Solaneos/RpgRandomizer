interface GeminiErrorResponse {
  error?: string;
}

async function postToGemini<TResponse>(body: Record<string, unknown>): Promise<TResponse> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & GeminiErrorResponse;
  if (!response.ok) {
    throw new Error(data.error || "Não foi possível chamar o serviço de IA.");
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
  description: string,
  inputImage?: {
    base64: string;
    mimeType: string;
  }
): Promise<string | null> {
  if (!description.trim() || !monsterName.trim()) {
    console.warn("Descrição ou nome do monstro ausente para geração de imagem.");
    return null;
  }

  try {
    const response = await postToGemini<{ imageBase64: string }>({
      action: "image",
      monsterName,
      description,
      inputImage,
    });
    return response.imageBase64 || null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error("Erro ao gerar imagem com Gemini:", errorMessage);
    return null;
  }
}


