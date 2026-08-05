export async function getMonsterFlavorText(
  userPrompt: string,
  apiKey?: string
): Promise<string> {
  if (!apiKey?.trim() || !userPrompt.trim()) {
    return Promise.resolve('');
  }

  const prompt = userPrompt;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 1.1,
        max_tokens: 600
      }),
    });
    if (!response.ok) return '';

    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('choices' in data) || !Array.isArray(data.choices)) {
      return '';
    }

    const firstChoice: unknown = data.choices[0];
    if (typeof firstChoice !== 'object' || firstChoice === null || !('message' in firstChoice)) return '';
    const message: unknown = firstChoice.message;
    if (typeof message !== 'object' || message === null || !('content' in message)) return '';
    return typeof message.content === 'string' ? message.content : '';
  } catch (error: unknown) {
    console.error('Erro ao chamar OpenAI:', error);
    return '';
  }
}
