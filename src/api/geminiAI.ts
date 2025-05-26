import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateMonsterEncounterText(
  monsterName: string,
  userPrompt: string
): Promise<string> {

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.error('Erro: REACT_APP_GEMINI_API_KEY não está configurada no ambiente.');
    return '';
  }

  if (!monsterName || monsterName.trim() === '') {
    console.warn('Aviso: Nome do monstro vazio. A descrição pode ser genérica.');
  }

  if (!userPrompt || userPrompt.trim() === '') {
    console.warn('Aviso: Prompt do usuário vazio. A descrição pode ser menos detalhada.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1000,      
    },
  });

  const fullPrompt = `Crie uma descrição imersiva para um encontro de RPG de mesa com o monstro "${monsterName}".
${userPrompt ? `Considere os seguintes detalhes: "${userPrompt}".` : ''}
Foque na atmosfera, nos sentidos (visão, som, cheiro) e no impacto emocional do monstro. Não inclua regras de jogo ou estatísticas.`;

  try {
    console.log('Chamando Gemini API com prompt:', fullPrompt);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
        console.warn('Gemini API retornou uma resposta vazia.');
        return '';
    }

    return text;
  } catch (error: any) {
    console.error('Erro ao gerar texto com a Gemini API:', error.message || error);
    return '';
  }
}