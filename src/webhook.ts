import { Router, Request, Response } from 'express';
import axios from 'axios';
import { getAIResponse } from './openai';

export interface HandlerResult {
  statusCode: number;
  body: string;
}

// --- Pure handlers (Lambda-ready) ---

export async function handleVerify(params: {
  mode?: string;
  token?: string;
  challenge?: string;
}): Promise<HandlerResult> {
  const { mode, token, challenge } = params;
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return { statusCode: 200, body: challenge ?? '' };
  }
  return { statusCode: 403, body: 'Forbidden' };
}

export async function handleMessage(body: unknown): Promise<HandlerResult> {
  const payload = body as Record<string, unknown>;
  const message = (payload as any)?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return { statusCode: 200, body: 'OK' };

  const from: string = message.from;
  const text: string = message?.text?.body;

  if (!text) return { statusCode: 200, body: 'OK' };

  const aiReply = await getAIResponse(text);
  await sendWhatsAppMessage(from, aiReply);

  return { statusCode: 200, body: 'OK' };
}

// --- Private helper ---

async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  await axios.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

// --- Express adapter ---

export const webhookRouter = Router();

webhookRouter.get('/', async (req: Request, res: Response) => {
  const result = await handleVerify({
    mode: req.query['hub.mode'] as string,
    token: req.query['hub.verify_token'] as string,
    challenge: req.query['hub.challenge'] as string,
  });
  res.status(result.statusCode).send(result.body);
});

webhookRouter.post('/', async (req: Request, res: Response) => {
  const result = await handleMessage(req.body);
  res.status(result.statusCode).send(result.body);
});
