# Backend GamerStore

Servidor Node.js con Express para manejar el formulario de contacto y actuar como proxy para la API de FreeToGame.

## Instalación

```powershell
cd backend
npm install
```

## Configuración

1. Copiá el archivo `.env.example` a `.env`:
```powershell
copy .env.example .env
```

2. Editá `.env` con tus credenciales SMTP:
   - Para Gmail, necesitás una "contraseña de aplicación" (no tu contraseña normal)
   - Instrucciones: https://support.google.com/accounts/answer/185833

## Ejecución

```powershell
npm start
```

O con auto-reload:
```powershell
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints

- `POST /contact` - Enviar mensaje del formulario
- `GET /api/games` - Proxy para FreeToGame API
- `GET /health` - Health check

## Ejemplo de uso (PowerShell)

```powershell
# Probar envío de mensaje
$body = @{
    name = "Test User"
    email = "test@example.com"
    message = "Mensaje de prueba"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/contact -Method POST -Body $body -ContentType "application/json"

# Probar proxy de API
Invoke-RestMethod -Uri "http://localhost:3000/api/games?platform=pc&sort-by=popularity"
```
