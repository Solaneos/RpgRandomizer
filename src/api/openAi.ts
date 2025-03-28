//import axios from 'axios';

//const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export async function getMonsterFlavorText(prompt: string): Promise<string> {
  console.log('[MOCK ATIVO] Prompt recebido:', prompt);

  // MOCK: texto simulado (você pode alterar esse conteúdo à vontade)
  return Promise.resolve(
    `Este monstro é conhecido por sua ferocidade nas regiões montanhosas. Dizem que suas garras afiadas são capazes de cortar até mesmo o aço.`
  );

  // Caso queira reativar a chamada real, remova o comentário abaixo:
  /*
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 200
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
  */
}
