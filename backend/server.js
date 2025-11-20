// Servidor backend para GamerStore
// Maneja el envío de emails del formulario de contacto y actúa como proxy para la API de juegos

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuro middlewares básicos
app.use(cors({
  origin: ['http://127.0.0.1:5502', 'http://localhost:5502'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuro el transportador de nodemailer para enviar emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verifico la configuración del transportador al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al verificar configuración SMTP:', error);
  } else {
    console.log('Servidor SMTP listo para enviar emails');
  }
});

// Endpoint para recibir mensajes del formulario de contacto
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Valido que los campos requeridos estén presentes
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: name, email, message'
    });
  }

  // Configuro el email que voy a enviar
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.RECIPIENT_EMAIL || 'marcostoledo96@gmail.com',
    subject: `Nuevo mensaje de ${name} - GamerStore`,
    text: `
      Nombre: ${name}
      Email: ${email}
      
      Mensaje:
      ${message}
    `,
    html: `
      <h2>Nuevo mensaje desde GamerStore</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  try {
    // Envío el email
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: 'Mensaje enviado correctamente'
    });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje. Por favor, intentá más tarde.'
    });
  }
});

// Endpoint proxy para la API de FreeToGame (evita problemas de CORS)
app.get('/api/games', async (req, res) => {
  try {
    const { platform, category, 'sort-by': sortBy } = req.query;
    const params = new URLSearchParams();
    
    if (platform && platform !== 'all') params.set('platform', platform);
    if (category && category !== 'all') params.set('category', category);
    if (sortBy) params.set('sort-by', sortBy);
    
    const url = `https://www.freetogame.com/api/games${params.toString() ? '?' + params.toString() : ''}`;
    
    // Uso fetch nativo de Node (requiere Node 18+) o node-fetch en versiones anteriores
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de juegos'
    });
  }
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend GamerStore funcionando' });
});

// Inicio el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`  POST http://localhost:${PORT}/contact - Enviar mensaje de contacto`);
  console.log(`  GET  http://localhost:${PORT}/api/games - Proxy para FreeToGame API`);
  console.log(`  GET  http://localhost:${PORT}/health - Health check`);
});
