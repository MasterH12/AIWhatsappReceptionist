import OpenAI from 'openai';

const SYSTEM_PROMPT = `Eres un asistente de Red Pando Coffee. 
Responde siempre de forma corta (máximo 2 líneas), con un tono cercano y amable. 
Si el cliente tiene un problema, pídele más detalles para poder ayudarle. 
No inventes ni confirmes devoluciones.`;

export async function getAIResponse(userMessage: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  });

  return response.choices[0].message.content ?? '';
}
