/*
  Este es el cerebro de nuestra página. Se encarga de toda la lógica:
  cargar los juegos, mostrarlos en pantalla y hacer que los filtros funcionen.
*/

// --- ESTADO DE LA APLICACIÓN ---
// Estas variables guardan los datos mientras la página está abierta.
let todosLosJuegos = []; // Acá vamos a guardar la lista completa de juegos.
let generos = []; // Acá guardamos la lista de géneros únicos para el filtro.

// --- ELEMENTOS DEL DOM ---
// Para no tener que buscar los elementos del HTML a cada rato, los guardamos en variables.
const grillaJuegos = document.getElementById('grilla-juegos');
const filtroGenero = document.getElementById('filtro-genero');
const contadorJuegos = document.getElementById('contador-juegos');
const mensajeCargando = document.getElementById('mensaje-cargando');

// --- EVENTOS ---

// Apenas se carga el contenido del HTML, arranca todo.
document.addEventListener('DOMContentLoaded', () => {
    buscarJuegos();
});

// Nos quedamos escuchando si el usuario cambia el valor del filtro de géneros.
filtroGenero.addEventListener('change', () => {
    const generoSeleccionado = filtroGenero.value;
    filtrarJuegosPorGenero(generoSeleccionado);
});


// --- FUNCIONES PRINCIPALES ---

/**
 * Busca los juegos desde la API de FreeToGame.
 */
async function buscarJuegos() {
    mostrarCargando(true);

    try {
        // Intentamos la llamada a la API a través de un proxy para evitar problemas de CORS.
        const respuesta = await fetch("https://api.allorigins.win/raw?url=https://www.freetogame.com/api/games?platform=pc");

        if (!respuesta.ok) {
            // Si la respuesta no es exitosa (ej: error 404 o 500), generamos un error.
            throw new Error(`La respuesta de la red no fue buena.`);
        }
        
        const datos = await respuesta.json();

        // Verificamos que la API nos haya devuelto una lista.
        if (!Array.isArray(datos)) {
            throw new Error("Los datos recibidos de la API no tienen el formato esperado.");
        }

        todosLosJuegos = datos;

    } catch (error) {
        // Si hubo cualquier problema en el 'try', lo mostramos en la consola.
        // La lista de juegos quedará vacía, y se mostrará el mensaje correspondiente.
        console.error("Falló la llamada a la API:", error);
    } finally {
        // Esto se ejecuta siempre, funcione o no la llamada a la API.
        configurarGeneros();
        renderizarJuegos(todosLosJuegos);
        mostrarCargando(false);
    }
}

/**
 * Arma la lista de géneros únicos y los agrega al menú desplegable.
 */
function configurarGeneros() {
    // Usamos un Set para que los géneros no se repitan y lo convertimos a un array ordenado.
    const generosUnicos = new Set(todosLosJuegos.map(juego => juego.genre));
    generos = Array.from(generosUnicos).sort();

    // Limpiamos el filtro por si tenía opciones de antes.
    filtroGenero.innerHTML = '<option value="all">Todos los géneros</option>';

    // Por cada género, creamos una opción en el HTML.
    generos.forEach(genero => {
        const opcion = document.createElement('option');
        opcion.value = genero;
        opcion.textContent = genero;
        filtroGenero.appendChild(opcion);
    });
}

/**
 * Recibe una lista de juegos y los dibuja en la grilla del HTML.
 * @param {Array} juegosParaRenderizar - La lista de juegos que se va a mostrar.
 */
function renderizarJuegos(juegosParaRenderizar) {
    // Limpiamos la grilla para no acumular juegos de filtros anteriores.
    grillaJuegos.innerHTML = '';

    if (juegosParaRenderizar.length === 0) {
        grillaJuegos.innerHTML = '<p class="mensaje-no-juegos">No se encontraron juegos. La API puede estar fuera de servicio.</p>';
    } else {
        juegosParaRenderizar.forEach(juego => {
            const tarjeta = crearTarjetaJuego(juego);
            grillaJuegos.appendChild(tarjeta);
        });
    }

    actualizarContadorJuegos(juegosParaRenderizar.length);
}

/**
 * Crea el elemento HTML para una sola tarjeta de juego.
 * @param {Object} juego - El objeto con los datos del juego.
 * @returns {HTMLElement} El elemento <a> de la tarjeta, listo para agregar a la página.
 */
function crearTarjetaJuego(juego) {
    // La tarjeta entera es un link que abre en una pestaña nueva.
    const enlace = document.createElement('a');
    enlace.href = juego.game_url;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.className = 'enlace-tarjeta-juego';

    // El contenido visual de la tarjeta.
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-juego';

    const divMiniatura = document.createElement('div');
    divMiniatura.className = 'miniatura';
    const img = document.createElement('img');
    img.src = juego.thumbnail;
    img.alt = juego.title;
    divMiniatura.appendChild(img);

    const divContenido = document.createElement('div');
    divContenido.className = 'contenido';

    const titulo = document.createElement('h3');
    titulo.className = 'titulo';
    titulo.textContent = juego.title;

    const genero = document.createElement('p');
    genero.className = 'genero';
    genero.textContent = juego.genre;

    divContenido.appendChild(titulo);
    divContenido.appendChild(genero);

    tarjeta.appendChild(divMiniatura);
    tarjeta.appendChild(divContenido);

    enlace.appendChild(tarjeta);

    return enlace;
}

/**
 * Filtra la lista de juegos según el género seleccionado.
 * @param {String} genero - El género elegido (o "all" para todos).
 */
function filtrarJuegosPorGenero(genero) {
    let juegosFiltrados;

    if (genero === 'all') {
        juegosFiltrados = todosLosJuegos;
    } else {
        juegosFiltrados = todosLosJuegos.filter(juego => juego.genre === genero);
    }

    renderizarJuegos(juegosFiltrados);
}

/**
 * Muestra u oculta el mensaje de "Cargando...".
 * @param {boolean} estaCargando - Si es true, se muestra; si es false, se oculta.
 */
function mostrarCargando(estaCargando) {
    mensajeCargando.style.display = estaCargando ? 'block' : 'none';
}

/**
 * Actualiza el texto que dice cuántos juegos se están mostrando.
 * @param {number} cantidad - La cantidad de juegos.
 */
function actualizarContadorJuegos(cantidad) {
    const etiqueta = cantidad === 1 ? 'juego' : 'juegos';
    contadorJuegos.textContent = `${cantidad} ${etiqueta}`;
}