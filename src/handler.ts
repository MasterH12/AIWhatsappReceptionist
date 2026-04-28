import 'dotenv/config';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleVerify, handleMessage } from './webhook';

/**
 * AWS Lambda entry point.
 * Recibe eventos de API Gateway y los despacha a los mismos handlers
 * que usa Express, sin modificar la lógica de negocio.
 *
 * Para desplegar:
 *   1. npm run build
 *   2. Subir dist/ a Lambda
 *   3. Handler: handler.handler
 *   4. Trigger: API Gateway (HTTP API)
 *   5. Ruta: GET /webhook  y  POST /webhook
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;

  if (method === 'GET') {
    const q = event.queryStringParameters ?? {};
    return handleVerify({
      mode: q['hub.mode'] ?? undefined,
      token: q['hub.verify_token'] ?? undefined,
      challenge: q['hub.challenge'] ?? undefined,
    });
  }

  if (method === 'POST') {
    const body = JSON.parse(event.body ?? '{}');
    return handleMessage(body);
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
