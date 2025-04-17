import axios from 'axios';

export async function getMonsterFlavorText(
  monsterName: string,
  userPrompt: string,
  apiKey?: string
): Promise<string> {
  if (!apiKey?.trim() || !userPrompt.trim()) {
    return Promise.resolve('');
  }

  const prompt = `Descreva o encontro com o seguinte monstro para um RPG de mesa: "${monsterName}"\n\n${userPrompt}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 1.1,
        max_tokens: 600
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices?.[0]?.message?.content ?? '';
  } catch (error: any) {
    console.error('Erro ao chamar OpenAI:', error?.response || error);
    return '';
  }
}
