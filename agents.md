# 🤖 AGENTS.md — Red Pando Coffee WhatsApp Bot (MVP)

## 🎯 Objetivo

Generar un backend mínimo funcional que:

- Reciba mensajes desde WhatsApp (Meta Cloud API)
- Envíe el mensaje a OpenAI
- Responda automáticamente al usuario
- Corra dentro de un contenedor Docker

⚠️ Este es un MVP:
- Sin base de datos
- Sin máquina de estados compleja
- Sin lógica avanzada de negocio

---

## 🧱 Stack obligatorio

- Node.js (v18+)
- Express
- OpenAI API (gpt-4o-mini)
- Docker

---

## 📁 Estructura del proyecto

Generar la siguiente estructura:

project-root/
├── src/
│ ├── server.ts
│ ├── webhook.ts
│ └── openai.ts
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── README.md

---

## ⚙️ Variables de entorno

Crear `.env.example` con:

PORT=3000

VERIFY_TOKEN=your_verify_token
WHATSAPP_TOKEN=your_meta_token
PHONE_NUMBER_ID=your_phone_number_id

OPENAI_API_KEY=your_openai_key


---

## 🚀 Requisitos funcionales

### 1. Servidor Express

- Escuchar en `PORT`
- Usar `express.json()`
- Montar ruta `/webhook`

---

### 2. Webhook WhatsApp

Archivo: `src/webhook.ts`

Debe implementar:

#### GET /webhook
- Validar webhook de Meta:
  - comparar `hub.verify_token` con `VERIFY_TOKEN`
  - devolver `hub.challenge`

#### POST /webhook
- Leer mensaje entrante desde:
req.body.entry[0].changes[0].value.messages[0]
- Extraer:
- `from`
- `text.body`
- Si no hay mensaje → responder 200

- Llamar a OpenAI con el texto
- Enviar respuesta a WhatsApp

---

### 3. Integración con OpenAI

Archivo: `src/openai.ts`

- Usar SDK oficial de OpenAI
- Modelo: `gpt-4o-mini`

#### System prompt:

- Eres un asistente de Red Pando Coffee
- Respuestas cortas (máx 2 líneas)
- Tono cercano y amable
- Si hay problema → pedir más detalles
- NO inventar devoluciones

#### Función requerida:
getAIResponse(userMessage: string): Promise<string>

---

### 4. Envío de mensajes a WhatsApp

Usar:
POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages

Headers:{
    Authorization: Bearer WHATSAPP_TOKEN
    Content-Type: application/json
}
Body:
{
    "messaging_product": "whatsapp",
    "to": "<numero>",
    "type": "text",
    "text": {
        "body": "<respuesta>"
    }
}


---

### 5. server.ts

- Inicializar Express
- Usar JSON middleware
- Montar `/webhook`
- Escuchar en puerto

---

## 📦 package.json

Debe incluir:

### dependencias:
- express
- axios
- openai

### dev:
- typescript
- ts-node-dev
- @types/node
- @types/express

### scripts:
"dev": "ts-node-dev src/server.ts",
"build": "tsc",
"start": "node dist/server.js"


---

## ⚙️ tsconfig.json

Configuración básica:

- target: ES2020
- module: commonjs
- outDir: dist
- rootDir: src
- strict: true
- esModuleInterop: true

---

## 🐳 Dockerfile

Debe:

1. Usar `node:18`
2. Copiar archivos
3. Instalar dependencias
4. Exponer puerto 3000
5. Ejecutar app

Ejemplo esperado:
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


---

## 🧪 Comportamiento esperado

Ejemplo:

Usuario:
> "hola"

Bot:
> "Hola! ☕ ¿En qué puedo ayudarte?"

---

Usuario:
> "mi café no salió"

Bot:
> "Lo siento 🙏 ¿me puedes contar qué ocurrió exactamente?"

---

## ⚠️ Restricciones importantes

- No implementar base de datos
- No implementar máquina de estados
- No agregar lógica compleja
- Mantener código simple y claro

---

## 🧠 Objetivo del agente

Generar TODO el código necesario para que:
docker build -t bot .
docker run -p 3000:3000 --env-file .env bot

👉 El bot funcione inmediatamente

---

## 🚀 Futuro (NO implementar ahora)

- State machine
- Base de datos
- Redis
- Validaciones de negocio
- Manejo de devoluciones

---

## ☁️ Migración a AWS Lambda (próximo paso)

El código ya está preparado para migrar a AWS Lambda.
Los handlers de `webhook.ts` son funciones puras que no dependen de Express,
por lo que se pueden exportar directamente a Lambda sin modificar la lógica de negocio.

### Estructura Lambda lista

- `src/handler.ts` — Entry point Lambda (ya existe)
- `src/webhook.ts` — `handleVerify()` y `handleMessage()` son Lambda-ready
- `src/openai.ts` — Sin cambios necesarios

### Pasos para migrar

1. `npm run build` → genera `dist/`
2. Crear función Lambda en AWS (Node.js 18.x)
3. Subir `dist/` + `node_modules/` (o usar Lambda Layer)
4. Configurar handler: `handler.handler`
5. Trigger: API Gateway (HTTP API)
   - `GET /webhook`
   - `POST /webhook`
6. Variables de entorno en Lambda (las mismas del `.env`)

### Por qué funciona sin cambios

```
Express (ahora)           Lambda (futuro)
─────────────────         ─────────────────────────────
req.query → params   →   event.queryStringParameters
req.body  → body     →   JSON.parse(event.body)
res.send  → result   →   return { statusCode, body }
```

Los handlers `handleVerify` y `handleMessage` ya devuelven
`{ statusCode, body }` que es exactamente el formato que espera Lambda.

