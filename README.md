# Red Pando Coffee — WhatsApp Bot MVP

Bot de WhatsApp para Red Pando Coffee usando Meta Cloud API y OpenAI.

## Requisitos

- Node.js 18+
- Docker
- Cuenta de Meta for Developers con WhatsApp Cloud API configurada
- API key de OpenAI

## Configuración

1. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Rellena los valores en `.env`:
   - `VERIFY_TOKEN`: token que defines tú para verificar el webhook en Meta
   - `WHATSAPP_TOKEN`: token de acceso de la app de Meta
   - `PHONE_NUMBER_ID`: ID del número de teléfono en Meta
   - `OPENAI_API_KEY`: clave de API de OpenAI

## Desarrollo local

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t bot .
docker run -p 3000:3000 --env-file .env bot
```

## Endpoints

| Método | Ruta       | Descripción                         |
|--------|------------|-------------------------------------|
| GET    | /webhook   | Verificación del webhook de Meta    |
| POST   | /webhook   | Recepción de mensajes de WhatsApp   |

## Configurar webhook en Meta

En el panel de Meta for Developers, configura la URL del webhook:
```
https://<tu-dominio>/webhook
```
Con el mismo `VERIFY_TOKEN` que definiste en `.env`.
# AIWhatsappReceptionist
