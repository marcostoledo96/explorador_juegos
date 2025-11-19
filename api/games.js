// Serverless function (Vercel) para proxy de FreeToGame
// Soporta query params: platform, category, sort-by
// Añade CORS abierto (ajustar si necesitás restringir)

export default async function handler(req, res) {
  try {
    const { platform = 'pc', category = '', sort-by: sortBy = 'popularity' } = req.query;

    // Construir URL destino
    const params = new URLSearchParams();
    if (platform && platform !== 'all') params.set('platform', platform);
    if (category && category !== 'all') params.set('category', category);
    if (sortBy) params.set('sort-by', sortBy);
    const target = `https://www.freetogame.com/api/games${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(target);
    if (!response.ok) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(response.status).json({ error: 'Error al obtener datos', status: response.status });
    }
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (e) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Fallo interno', message: e.message });
  }
}