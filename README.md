# 🎮 GamerStore - Catálogo de Juegos Gratuitos

Sitio web interactivo que permite explorar y descubrir juegos gratuitos a través de una interfaz moderna con sistema de filtros, búsqueda y carruseles dinámicos.

---

## 📋 Descripción

GamerStore es una aplicación web que consume la [FreeToGame API](https://www.freetogame.com/api-doc) para mostrar un catálogo completo de juegos gratuitos. Los usuarios pueden:

- Explorar juegos organizados en carruseles (populares y recientes)
- Filtrar por género y plataforma
- Buscar por título
- Ordenar por popularidad, fecha de lanzamiento o alfabéticamente
- Acceder directamente a la página oficial de cada juego

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica del sitio
- **CSS3** - Estilos responsivos con Flexbox y Grid
- **JavaScript (ES6+)** - Lógica de negocio y manipulación del DOM
- **Google Fonts** - Tipografía Orbitron
- **Material Icons** - Iconografía moderna

### API Externa
- **FreeToGame API** - Fuente de datos de juegos gratuitos

### Herramientas de Desarrollo
- **Live Server** - Servidor de desarrollo local
- **Git** - Control de versiones
- **Vercel** - Plataforma de deployment

---

## ✨ Características Implementadas

### Página Principal (`index.html`)
- **Carruseles Interactivos:**
  - Juegos más populares
  - Juegos más recientes
  - Navegación con botones prev/next
  - Tarjeta "Ver más" que redirige al catálogo completo
- **Diseño Responsivo:** Adaptado para desktop, tablets y móviles

### Página de Catálogo (`games.html`)
- **Sistema de Filtros:**
  - Filtro por género (dinámicamente poblado desde la API)
  - Filtro por plataforma (PC, navegador, ambos)
  - Búsqueda en tiempo real por título (con debounce de 300ms)
  - Ordenamiento (popularidad, fecha, alfabético)
- **Grilla de Juegos:** Layout responsivo con tarjetas optimizadas
- **Detección de Parámetros URL:** Permite acceso directo con filtros pre-aplicados

### Página de Contacto (`contact.html`)
- **Formulario Funcional:** Envío de mensajes por email (requiere backend)
- **Validación de Campos:** Nombre, email y mensaje obligatorios
- **Feedback Visual:** Mensajes de éxito o error tras el envío

---

## 📂 Estructura del Proyecto

```
GamerStore/
├── index.html              # Página principal con carruseles
├── games.html              # Catálogo completo con filtros
├── contact.html            # Formulario de contacto
├── style.css               # Estilos globales y responsivos
├── script.js               # Lógica principal (API, filtros, carruseles)
├── Jscript.js              # Menú hamburguesa y navegación
├── vercel.json             # Configuración para deployment en Vercel
├── DEPLOY.md               # Guía de deployment a Vercel
├── README.md               # Documentación del proyecto
├── img/                    # Imágenes y recursos gráficos
│   ├── logo.svg
│   └── controlador-de-juego.png
└── backend/                # Backend opcional (Node + Express)
    ├── server.js           # Servidor proxy para CORS y contacto
    ├── package.json        # Dependencias del backend
    └── .env.example        # Template de variables de entorno
```

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

### Opción 1: Usar Live Server (Recomendado)

1. **Clonar o descargar el repositorio:**
   ```powershell
   git clone https://github.com/TU_USUARIO/gamerstore.git
   cd gamerstore
   ```

2. **Abrir el proyecto en VS Code:**
   ```powershell
   code .
   ```

3. **Instalar la extensión Live Server** (si no la tenés):
   - Ir a Extensions (Ctrl+Shift+X)
   - Buscar "Live Server" por Ritwick Dey
   - Hacer clic en "Install"

4. **Iniciar el servidor:**
   - Clic derecho en `index.html`
   - Seleccionar "Open with Live Server"
   - El sitio se abrirá en `http://127.0.0.1:5502`

### Opción 2: Servidor HTTP Simple (Python)

Si tenés Python instalado:

```powershell
# Python 3
python -m http.server 8000

# Abrir en el navegador
# http://localhost:8000
```

---

## 🌐 Deployment a Vercel

El proyecto está listo para ser desplegado en Vercel. Consultá la [Guía de Deployment](./DEPLOY.md) para instrucciones detalladas.

**Resumen rápido:**

1. Subir el código a GitHub
2. Conectar el repositorio en [vercel.com](https://vercel.com)
3. Vercel detectará automáticamente la configuración
4. Deploy automático en cada `git push`

---

## 🔧 Configuración de la API

### Uso del Proxy Público (Por Defecto)

El proyecto está configurado para usar **AllOrigins** como proxy público, lo que evita problemas de CORS sin necesidad de backend propio.

Esto está definido en `script.js`:

```javascript
const useLocalProxy = false; // Usa AllOrigins (proxy público)
```

### Uso del Backend Local (Opcional)

Si preferís usar el backend incluido:

1. **Instalar dependencias:**
   ```powershell
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**
   ```powershell
   cp .env.example .env
   # Editar .env con tus credenciales SMTP
   ```

3. **Iniciar el servidor:**
   ```powershell
   npm start
   # Servidor corriendo en http://localhost:3000
   ```

4. **Cambiar la configuración en `script.js`:**
   ```javascript
   const useLocalProxy = true; // Usa backend local
   ```

---

## 🎨 Diseño y Estilo

### Paleta de Colores
- **Fondo Principal:** `#000` (Negro)
- **Tarjetas:** `#1a1a1a` (Gris oscuro)
- **Acento Principal:** `#00FF99` (Verde neón)
- **Acento Secundario:** `#00CC7A` (Verde oscuro)
- **Texto Principal:** `#e0e0e0` (Gris claro)
- **Texto Secundario:** `#999` (Gris medio)

### Tipografía
- **Fuente Principal:** Orbitron (Google Fonts)
- **Iconos:** Material Icons Outlined

### Responsividad
El diseño es totalmente responsivo con breakpoints en:
- **1400px** - Pantallas grandes
- **1200px** - Pantallas medianas
- **1024px** - Tablets
- **900px** - Tablets pequeñas
- **768px** - Móviles grandes
- **600px** - Móviles pequeños
- **400px** - Móviles muy pequeños

---

## 📝 Funcionalidades Destacadas

### Sistema de Carruseles
- Navegación por flechas (prev/next)
- Muestra 3 juegos en desktop, 2 en tablet, 1 en móvil
- Tarjeta "Ver más" que redirige al catálogo con filtro pre-aplicado
- Animaciones suaves con `transform` y `transition`

### Sistema de Filtros Inteligente
- **Filtros Combinables:** Género + Plataforma + Búsqueda + Ordenamiento
- **Búsqueda con Debounce:** Evita llamadas excesivas mientras el usuario escribe
- **Contador Dinámico:** Muestra cantidad de juegos visibles en tiempo real
- **Parámetros URL:** Soporte para enlaces directos con filtros (ej: `?sort=popularity`)

### Optimización de Performance
- **Lazy Loading:** Imágenes cargan bajo demanda
- **Cache de Datos:** Los juegos se cargan una sola vez desde la API
- **Debounce en Búsqueda:** Reduce llamadas innecesarias

---

## 🐛 Solución de Problemas Comunes

### La API no carga los juegos

**Síntoma:** "Error al cargar juegos" en la grilla

**Soluciones:**
1. Verificar conexión a internet
2. Revisar la consola del navegador (F12) para errores CORS
3. Si AllOrigins está caído, cambiar a backend local (`useLocalProxy = true`)

### El backend local no arranca

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solución:**
```powershell
# Cerrar el proceso que usa el puerto 3000
netstat -ano | findstr :3000
taskkill /PID [NUMERO_DE_PID] /F
```

### Las imágenes no cargan en Vercel

**Síntoma:** Imágenes rotas tras deployment

**Solución:** Verificar que las rutas sean relativas (sin `/` inicial):
```html
<!-- ✅ Correcto -->
<img src="img/logo.svg">

<!-- ❌ Incorrecto -->
<img src="/img/logo.svg">
```

---

## 📚 Recursos Adicionales

- [Documentación FreeToGame API](https://www.freetogame.com/api-doc)
- [Guía de Deployment](./DEPLOY.md)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

## 👨‍💻 Desarrollo Futuro

Posibles mejoras a implementar:

- [ ] Sistema de favoritos con LocalStorage
- [ ] Modo oscuro/claro toggle
- [ ] Paginación para mejorar performance con muchos juegos
- [ ] Animaciones más avanzadas con Intersection Observer
- [ ] PWA (Progressive Web App) para uso offline
- [ ] Integración con backend propio para analytics

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit de tus cambios (`git commit -m 'Agrego nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir un Pull Request

---

## 📧 Contacto

Para consultas o sugerencias, usá el formulario de contacto del sitio o escribí a: **marcostoledo96@gmail.com**

---

🎮 **¡Disfrutá explorando miles de juegos gratuitos!**

