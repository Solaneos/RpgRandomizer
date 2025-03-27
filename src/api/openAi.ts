import axios from 'axios';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export async function getMonsterFlavorText(prompt: string): Promise<string> {
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
  }
  