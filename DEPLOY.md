# 🚀 Guía de Deployment a Vercel

Esta guía describe cómo subir **GamerStore** a Vercel para tener el sitio web accesible públicamente.

---

## 📋 Requisitos Previos

1. **Cuenta en Vercel**  
   Creá una cuenta gratuita en [vercel.com](https://vercel.com) (podés usar tu cuenta de GitHub, GitLab o Bitbucket).

2. **Git instalado**  
   Asegurate de tener Git instalado en tu computadora.

3. **Repositorio en GitHub** (recomendado)  
   Subí el proyecto a un repositorio de GitHub para que Vercel pueda detectar cambios automáticamente.

---

## 🛠️ Pasos para Deployment

### **Opción 1: Deploy desde GitHub (Recomendado)**

Esta opción permite actualizaciones automáticas cada vez que hacés un `git push`.

#### **1. Subir el proyecto a GitHub**

Si aún no lo hiciste, seguí estos pasos:

```powershell
# Inicializar repositorio Git (si no lo hiciste antes)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Versión inicial de GamerStore"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU_USUARIO/gamerstore.git

# Subir el código
git push -u origin main
```

#### **2. Conectar Vercel con GitHub**

1. Ingresá a [vercel.com](https://vercel.com) y hacé clic en **"Add New Project"**.
2. Elegí **"Import Git Repository"**.
3. Autorizá a Vercel a acceder a tus repositorios de GitHub.
4. Seleccioná el repositorio `gamerstore` de la lista.

#### **3. Configurar el proyecto**

Vercel detectará automáticamente que es un proyecto HTML/CSS/JS estático. Configurá lo siguiente:

- **Framework Preset:** `Other` (o dejalo en "None")
- **Build Command:** Dejalo vacío (no es necesario para sitios estáticos)
- **Output Directory:** Dejalo vacío (el root es el directorio de salida)
- **Install Command:** Dejalo vacío

#### **4. Configurar variables de entorno (Opcional)**

Si en el futuro querés usar el backend local en producción, podés agregar variables de entorno en Vercel:

- Ir a **Settings → Environment Variables**
- Agregar las variables necesarias (por ejemplo, `API_URL`)

#### **5. Deploy**

Hacé clic en **"Deploy"** y esperá a que Vercel construya y publique el sitio. Al finalizar, te dará una URL pública como:

```
https://gamerstore.vercel.app
```

---

### **Opción 2: Deploy Manual (CLI de Vercel)**

Si preferís hacerlo desde la terminal sin GitHub:

#### **1. Instalar Vercel CLI**

```powershell
npm install -g vercel
```

#### **2. Login en Vercel**

```powershell
vercel login
```

Seguí las instrucciones para autenticarte (te enviará un email de confirmación).

#### **3. Deploy del proyecto**

Desde la carpeta raíz del proyecto, ejecutá:

```powershell
vercel
```

Respondé las preguntas que te haga:

- **Set up and deploy?** → `Y`
- **Which scope?** → Elegí tu cuenta
- **Link to existing project?** → `N` (es la primera vez)
- **What's your project's name?** → `gamerstore` (o el nombre que prefieras)
- **In which directory is your code located?** → `.` (directorio actual)

Vercel comenzará el deployment y te dará una URL de producción.

#### **4. Deployments futuros**

Para actualizar el sitio después de hacer cambios:

```powershell
vercel --prod
```

---

## ⚙️ Configuración Avanzada

### **Archivo `vercel.json`**

Ya creé un archivo `vercel.json` en la raíz del proyecto con la siguiente configuración:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

Esto asegura que:
- Se sirvan correctamente todos los archivos estáticos.
- Las rutas funcionen correctamente.
- Se permita CORS para las llamadas a la API externa.

---

## 🌐 Configurar Dominio Personalizado (Opcional)

Si tenés un dominio propio (ej: `www.gamerstore.com`):

1. Ir a **Settings → Domains** en el dashboard de Vercel.
2. Agregar tu dominio personalizado.
3. Seguir las instrucciones para configurar los registros DNS (A/CNAME) en tu proveedor de dominio.

---

## 🔄 Actualizaciones Automáticas (GitHub)

Si usaste la Opción 1 (GitHub), cada vez que hagas cambios y los subas:

```powershell
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel detectará automáticamente el push y hará un nuevo deployment sin que tengas que hacer nada más.

---

## 🐛 Solución de Problemas

### **Error: "Cannot GET /"**

Asegurate de que `index.html` esté en la raíz del proyecto (no dentro de una subcarpeta).

### **Las imágenes o archivos CSS no cargan**

Verificá que las rutas en tu HTML sean relativas:
```html
<!-- ✅ Correcto -->
<link rel="stylesheet" href="style.css">

<!-- ❌ Incorrecto -->
<link rel="stylesheet" href="/style.css">
```

### **La API no funciona (CORS)**

Si estás usando la API externa directamente desde el frontend, el archivo `vercel.json` ya incluye headers CORS. Si seguís teniendo problemas, considerá usar el proxy de AllOrigins que ya está configurado en `script.js`.

---

## 📊 Monitoreo y Analytics

Vercel ofrece **Analytics** gratuito para monitorear el tráfico de tu sitio. Podés habilitarlo desde:

**Dashboard → Analytics → Enable**

---

## 📚 Recursos Adicionales

- [Documentación oficial de Vercel](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## ✅ Checklist Final

Antes de hacer el deployment, verificá:

- [ ] Todos los archivos están en la raíz del proyecto (index.html, style.css, script.js, etc.)
- [ ] Las rutas de imágenes y archivos son relativas
- [ ] El archivo `vercel.json` está en la raíz
- [ ] Probaste el sitio localmente con Live Server y funciona correctamente
- [ ] Subiste el código a GitHub (si usás Opción 1)
- [ ] Ejecutaste `vercel` o conectaste el repo en vercel.com

---

🎮 **¡Listo! Tu sitio GamerStore estará en línea y accesible para todo el mundo.**
