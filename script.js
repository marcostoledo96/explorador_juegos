/**
 * ============================================
 * GAMERSTORE - SCRIPT PRINCIPAL
 * ============================================
 * 
 * Este archivo contiene toda la lógica de negocio del catálogo de juegos.
 * 
 * Funcionalidades implementadas:
 * - Carga de juegos desde FreeToGame API
 * - Sistema de filtros combinables (género, plataforma, búsqueda)
 * - Ordenamiento por popularidad, fecha y alfabético
 * - Carruseles interactivos en la página principal
 * - Detección de parámetros URL para filtros pre-aplicados
 * - Renderizado dinámico de tarjetas de juegos
 * 
 * @author Marcos Toledo
 * @version 2.0
 */

// ============================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================================

/**
 * Almaceno la lista completa de juegos obtenidos de la API.
 * Este array se carga una sola vez al iniciar y se reutiliza para todos los filtros,
 * evitando llamadas innecesarias a la API.
 */
let todosLosJuegos = [];

/**
 * Lista de géneros únicos extraídos de los juegos.
 * Se genera dinámicamente para poblar el select de filtro de género.
 */
let generos = [];

/**
 * Lista de plataformas únicas extraídas de los juegos.
 * Se genera dinámicamente para poblar el select de filtro de plataforma.
 */
let plataformas = [];

// ============================================
// REFERENCIAS A ELEMENTOS DEL DOM
// ============================================

/**
 * Capturo todas las referencias a elementos del DOM al inicio para evitar
 * búsquedas repetitivas con getElementById durante la ejecución.
 * Esto mejora el performance y hace el código más mantenible.
 */

/** Contenedor principal donde se renderizan las tarjetas de juegos */
const grillaJuegos = document.getElementById('grilla-juegos');

/** Select para filtrar juegos por género */
const filtroGenero = document.getElementById('filtro-genero');

/** Select para filtrar juegos por plataforma (PC, Browser, All) */
const filtroPlataforma = document.getElementById('filtro-plataforma');

/** Input de texto para búsqueda en tiempo real por título */
const inputBusqueda = document.getElementById('busqueda-titulo');

/** Select para ordenar juegos (popularidad, fecha, alfabético) */
const filtroOrdenamiento = document.getElementById('filtro-ordenamiento');

/** Span que muestra la cantidad de juegos visibles */
const contadorJuegos = document.getElementById('contador-juegos');

/** Div con el mensaje de "Cargando juegos..." mientras se consulta la API */
const mensajeCargando = document.getElementById('mensaje-cargando');

// ============================================
// CONFIGURACIÓN DE EVENT LISTENERS
// ============================================

/**
 * Inicio la carga de juegos cuando el DOM está completamente cargado.
 * Este evento se dispara antes de que las imágenes y recursos externos terminen de cargar,
 * lo que permite mostrar contenido más rápido al usuario.
 */
document.addEventListener('DOMContentLoaded', () => {
    buscarJuegos();
});

/**
 * Listener para el filtro de género.
 * Cuando el usuario cambia la selección, aplico todos los filtros activos.
 */
if (filtroGenero) {
    filtroGenero.addEventListener('change', aplicarFiltros);
}

/**
 * Listener para el filtro de plataforma.
 * Similar al de género, reaplica todos los filtros al cambiar.
 */
if (filtroPlataforma) {
    filtroPlataforma.addEventListener('change', aplicarFiltros);
}

/**
 * Listener para la búsqueda por título con técnica de debounce.
 * 
 * El debounce espera 300ms después de que el usuario deja de escribir
 * antes de ejecutar la búsqueda. Esto evita hacer filtrados en cada tecla presionada,
 * mejorando el performance y la experiencia de usuario.
 */
if (inputBusqueda) {
    let timeoutBusqueda;
    inputBusqueda.addEventListener('input', () => {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(aplicarFiltros, 300);
    });
}

/**
 * Listener para el select de ordenamiento.
 * Cuando cambia el criterio de orden, reaplicó todos los filtros con el nuevo orden.
 */
if (filtroOrdenamiento) {
    filtroOrdenamiento.addEventListener('change', () => {
        const orden = filtroOrdenamiento.value;
        ordenarYRenderizar(orden);
    });
}

/**
 * Detección de parámetros en la URL para aplicar filtros automáticamente.
 * 
 * Esto permite crear enlaces directos con filtros pre-aplicados.
 * Por ejemplo: games.html?sort=release-date abrirá el catálogo ordenado por fecha.
 * 
 * La lógica espera a que buscarJuegos() termine de cargar los datos,
 * y luego aplicarFiltros() detecta automáticamente el valor del select.
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    
    if (sortParam && filtroOrdenamiento) {
        // Establezco el valor del select según el parámetro URL
        filtroOrdenamiento.value = sortParam;
        
        // El ordenamiento se aplicará automáticamente cuando buscarJuegos() termine
        // y llame a aplicarFiltros()
    }
});


// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Realizo una petición HTTP a la FreeToGame API para obtener juegos.
 * 
 * Esta función actúa como una capa de abstracción sobre fetch, permitiendo
 * configurar diferentes estrategias de acceso a la API:
 * 
 * 1. Backend Local (useLocalProxy = true):
 *    - Requiere tener el servidor Node.js corriendo en localhost:3000
 *    - Evita problemas de CORS ya que el backend hace la petición
 *    - Permite agregar lógica adicional (cache, rate limiting, etc.)
 * 
 * 2. Proxy Público AllOrigins (useLocalProxy = false):
 *    - No requiere backend propio
 *    - Puede tener límites de tasa o caídas ocasionales
 *    - Útil para desarrollo y deploy rápido
 * 
 * @param {Object} options - Opciones de filtrado
 * @param {string} options.platform - Plataforma ('pc', 'browser', 'all')
 * @param {string} options.category - Categoría/género del juego
 * @param {string} options.sortBy - Criterio de orden ('popularity', 'release-date', 'alphabetical')
 * @returns {Promise<Array>} Promesa que resuelve con un array de objetos de juego
 * @throws {Error} Si la petición HTTP falla
 */
async function fetchJuegos({ platform = 'pc', category = '', sortBy = 'popularity' } = {}) {
    // Configuración del proxy: cambiar a true si tenés el backend local corriendo
    const useLocalProxy = false;
    
    let url;
    
    if (useLocalProxy) {
        // Estrategia 1: Backend local (Node.js + Express)
        // Construyo la URL con parámetros de query
        const params = new URLSearchParams();
        if (platform && platform !== 'all') params.set('platform', platform);
        if (category && category !== 'all') params.set('category', category);
        if (sortBy) params.set('sort-by', sortBy);
        url = `http://localhost:3000/api/games?${params.toString()}`;
    } else {
        // Estrategia 2: Proxy público (AllOrigins)
        // AllOrigins hace la petición por nosotros y evita CORS
        const targetUrl = `https://www.freetogame.com/api/games?platform=${platform}${category ? '&category=' + category : ''}${sortBy ? '&sort-by=' + sortBy : ''}`;
        url = "https://api.allorigins.win/raw?url=" + encodeURIComponent(targetUrl);
    }
    
    // Realizo la petición HTTP
    const respuesta = await fetch(url);
    
    // Verifico que la respuesta sea exitosa (status 200-299)
    if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    
    // Parseo y retorno el JSON
    return await respuesta.json();
}

/**
 * Yo: cargo los juegos desde la API ordenados por popularidad por defecto
 */
/**
 * Yo: busco todos los juegos y los muestro con los filtros iniciales
 */
async function buscarJuegos() {
    try {
        mostrarCargando(true);
        
        // Yo: obtengo todos los juegos ordenados por popularidad
        todosLosJuegos = await fetchJuegos({ sortBy: 'popularity' });
        
        if (todosLosJuegos && todosLosJuegos.length > 0) {
            // Yo: configuro los filtros con los datos disponibles
            configurarFiltros();
            
            // Yo: aplico filtros (esto ya incluye el ordenamiento de URL si existe)
            aplicarFiltros();
        } else {
            grillaJuegos.innerHTML = '<p class="mensaje-no-juegos">No se encontraron juegos. La API puede estar fuera de servicio.</p>';
        }
    } catch (error) {
        console.error('Yo: error al buscar juegos', error);
        grillaJuegos.innerHTML = '<p class="mensaje-no-juegos">Error al cargar juegos. Intentá recargar la página.</p>';
    } finally {
        mostrarCargando(false);
    }
}

/**
 * Yo: configuro los selectores de género y plataforma con datos de la lista
 */
function configurarFiltros() {
    // Yo: extraigo géneros únicos y los ordeno
    const generosUnicos = new Set(todosLosJuegos.map(juego => juego.genre));
    generos = Array.from(generosUnicos).sort();

    // Yo: extraigo plataformas únicas
    const plataformasUnicas = new Set(todosLosJuegos.map(juego => juego.platform));
    plataformas = Array.from(plataformasUnicas).sort();

    // Yo: populo el select de género si existe
    if (filtroGenero) {
        filtroGenero.innerHTML = '<option value="all">Todos los géneros</option>';
        generos.forEach(genero => {
            const opcion = document.createElement('option');
            opcion.value = genero;
            opcion.textContent = genero;
            filtroGenero.appendChild(opcion);
        });
    }

    // Yo: populo el select de plataforma si existe
    if (filtroPlataforma) {
        filtroPlataforma.innerHTML = '<option value="all">Todas las plataformas</option>';
        plataformas.forEach(plataforma => {
            const opcion = document.createElement('option');
            opcion.value = plataforma;
            opcion.textContent = plataforma;
            filtroPlataforma.appendChild(opcion);
        });
    }
}

/**
 * Yo: aplico todos los filtros activos (género, plataforma, búsqueda)
 */
function aplicarFiltros() {
    let juegosFiltrados = todosLosJuegos;

    // Yo: filtro por género si no es "all"
    if (filtroGenero && filtroGenero.value !== 'all') {
        juegosFiltrados = juegosFiltrados.filter(juego => juego.genre === filtroGenero.value);
    }

    // Yo: filtro por plataforma si no es "all"
    if (filtroPlataforma && filtroPlataforma.value !== 'all') {
        juegosFiltrados = juegosFiltrados.filter(juego => juego.platform === filtroPlataforma.value);
    }

    // Yo: filtro por búsqueda de título (case-insensitive)
    if (inputBusqueda && inputBusqueda.value.trim() !== '') {
        const termino = inputBusqueda.value.trim().toLowerCase();
        juegosFiltrados = juegosFiltrados.filter(juego => 
            juego.title.toLowerCase().includes(termino)
        );
    }

    // Yo: aplico el ordenamiento si existe el filtro
    if (filtroOrdenamiento) {
        const orden = filtroOrdenamiento.value;
        juegosFiltrados = ordenarJuegos(juegosFiltrados, orden);
    }

    // Yo: vuelvo a renderizar con los juegos filtrados
    renderizarJuegos(juegosFiltrados);
}

/**
 * Yo: ordeno los juegos según el criterio seleccionado
 * @param {Array} juegos - Lista de juegos a ordenar
 * @param {string} criterio - 'popularity', 'release-date', 'alphabetical'
 * @returns {Array} Juegos ordenados
 */
function ordenarJuegos(juegos, criterio) {
    const copiaJuegos = [...juegos];
    
    switch(criterio) {
        case 'release-date':
            // Yo: ordeno por fecha de lanzamiento (más recientes primero)
            return copiaJuegos.sort((a, b) => {
                return new Date(b.release_date) - new Date(a.release_date);
            });
        
        case 'alphabetical':
            // Yo: ordeno alfabéticamente por título
            return copiaJuegos.sort((a, b) => {
                return a.title.localeCompare(b.title, 'es');
            });
        
        case 'popularity':
        default:
            // Yo: ordeno por popularidad (ya viene ordenado por default de la API)
            return copiaJuegos;
    }
}

/**
 * Yo: ordeno y renderizo los juegos actuales
 * @param {string} criterio - Criterio de ordenamiento
 */
function ordenarYRenderizar(criterio) {
    // Yo: obtengo los juegos actualmente filtrados desde la grilla
    let juegosActuales = todosLosJuegos;
    
    // Yo: reaplico todos los filtros y luego ordeno
    aplicarFiltros();
}

/**
 * Yo: renderizo la lista de juegos en la grilla
 * @param {Array} juegosParaRenderizar - Lista de juegos a mostrar
 */
function renderizarJuegos(juegosParaRenderizar) {
    // Yo: limpio el contenedor
    if (!grillaJuegos) return;
    
    grillaJuegos.innerHTML = '';

    if (juegosParaRenderizar.length === 0) {
        grillaJuegos.innerHTML = '<p class="mensaje-no-juegos">No se encontraron juegos con los filtros seleccionados.</p>';
    } else {
        juegosParaRenderizar.forEach(juego => {
            const tarjeta = crearTarjetaJuego(juego);
            grillaJuegos.appendChild(tarjeta);
        });
    }

    actualizarContadorJuegos(juegosParaRenderizar.length);
}

/**
 * Yo: creo una tarjeta de juego con toda su estructura HTML
 * @param {Object} juego - Datos del juego desde la API
 * @returns {HTMLElement} Elemento enlace con la tarjeta completa
 */
function crearTarjetaJuego(juego) {
    // Yo: la tarjeta completa es un enlace que abre en nueva pestaña
    const enlace = document.createElement('a');
    enlace.href = juego.game_url;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.className = 'enlace-tarjeta-juego';

    // Yo: creo el contenedor de la tarjeta
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-juego';

    // Yo: sección de miniatura
    const divMiniatura = document.createElement('div');
    divMiniatura.className = 'miniatura';
    const img = document.createElement('img');
    img.src = juego.thumbnail;
    img.alt = juego.title;
    img.loading = 'lazy'; // Yo: cargo lazy para mejorar performance
    divMiniatura.appendChild(img);

    // Yo: sección de contenido
    const divContenido = document.createElement('div');
    divContenido.className = 'contenido';

    const titulo = document.createElement('h3');
    titulo.className = 'titulo';
    titulo.textContent = juego.title;

    const genero = document.createElement('p');
    genero.className = 'genero';
    genero.textContent = juego.genre;

    // Yo: agrego plataforma y fecha de lanzamiento en líneas separadas
    const plataforma = document.createElement('p');
    plataforma.className = 'meta-info';
    plataforma.textContent = `Plataforma: ${juego.platform}`;

    const fecha = document.createElement('p');
    fecha.className = 'meta-info';
    fecha.textContent = `Lanzamiento: ${juego.release_date}`;

    divContenido.appendChild(titulo);
    divContenido.appendChild(genero);
    divContenido.appendChild(plataforma);
    divContenido.appendChild(fecha);

    tarjeta.appendChild(divMiniatura);
    tarjeta.appendChild(divContenido);

    enlace.appendChild(tarjeta);

    return enlace;
}

/**
 * Yo: muestro u oculto el mensaje de cargando
 * @param {boolean} estaCargando - true para mostrar, false para ocultar
 */
function mostrarCargando(estaCargando) {
    if (mensajeCargando) {
        mensajeCargando.style.display = estaCargando ? 'block' : 'none';
    }
}

/**
 * Yo: actualizo el contador de juegos mostrados
 * @param {number} cantidad - Número de juegos visibles
 */
function actualizarContadorJuegos(cantidad) {
    if (contadorJuegos) {
        const etiqueta = cantidad === 1 ? 'juego' : 'juegos';
        contadorJuegos.textContent = `${cantidad} ${etiqueta}`;
    }
}

// Yo: función auxiliar para eliminar la función obsoleta
function filtrarJuegosPorGenero(genero) {
    // Yo: esta función ahora está integrada en aplicarFiltros()
    console.warn('filtrarJuegosPorGenero está deprecada, use aplicarFiltros()');
    aplicarFiltros();
}

// --- FUNCIONES PARA CARRUSELES EN INDEX.HTML ---

/**
 * Yo: inicializo los carruseles de juegos populares y recientes en index.html
 * Esta función se ejecuta solo en la página principal
 */
async function inicializarCarruseles() {
    // Yo: verifico que estemos en la página de inicio
    const contenedorPopulares = document.getElementById('carrusel-populares');
    const contenedorRecientes = document.getElementById('carrusel-recientes');
    
    if (!contenedorPopulares && !contenedorRecientes) {
        return; // Yo: no estamos en index.html, no hago nada
    }

    try {
        // Yo: cargo todos los juegos
        const juegos = await fetchJuegos();
        
        if (juegos && juegos.length > 0) {
            // Yo: creo carrusel de populares (ordenado por popularidad, primeros 10)
            if (contenedorPopulares) {
                const populares = juegos.slice(0, 10);
                crearCarrusel(contenedorPopulares, populares, 'populares');
            }

            // Yo: creo carrusel de recientes (ordenado por fecha de lanzamiento, primeros 10)
            if (contenedorRecientes) {
                const ordenadosPorFecha = [...juegos].sort((a, b) => {
                    return new Date(b.release_date) - new Date(a.release_date);
                });
                const recientes = ordenadosPorFecha.slice(0, 10);
                crearCarrusel(contenedorRecientes, recientes, 'recientes');
            }
        }
    } catch (error) {
        console.error('Yo: error al cargar carruseles', error);
    }
}

/**
 * Yo: creo un carrusel con navegación prev/next
 * @param {HTMLElement} contenedor - Div donde insertar el carrusel
 * @param {Array} juegos - Lista de juegos (máx 10)
 * @param {string} id - Identificador único para este carrusel
 */
function crearCarrusel(contenedor, juegos, id) {
    // Yo: limpio el contenedor
    contenedor.innerHTML = '';

    // Yo: creo las tarjetas de juegos
    const tarjetasJuegos = juegos.map(juego => crearTarjetaCarrusel(juego)).join('');
    
    // Yo: creo la tarjeta "Ver más" según el tipo de carrusel
    const parametroOrden = id === 'populares' ? 'popularity' : 'release-date';
    const tarjetaVerMas = `
        <a href="games.html?sort=${parametroOrden}" class="carrusel-item carrusel-ver-mas">
            <div class="carrusel-tarjeta tarjeta-ver-mas">
                <div class="ver-mas-contenido">
                    <span class="material-icons-outlined">arrow_forward</span>
                    <h4>Ver más</h4>
                    <p>Explorar catálogo completo</p>
                </div>
            </div>
        </a>
    `;

    // Yo: estructura del carrusel con las 10 tarjetas + la de "Ver más"
    const carruselHTML = `
        <div class="carrusel" data-carrusel="${id}">
            <button class="carrusel-btn prev" data-direccion="prev">‹</button>
            <div class="carrusel-pista">
                ${tarjetasJuegos}
                ${tarjetaVerMas}
            </div>
            <button class="carrusel-btn next" data-direccion="next">›</button>
        </div>
    `;

    contenedor.innerHTML = carruselHTML;

    // Yo: configuro navegación del carrusel
    const btnPrev = contenedor.querySelector('.prev');
    const btnNext = contenedor.querySelector('.next');
    const pista = contenedor.querySelector('.carrusel-pista');

    let indiceActual = 0;
    const itemsVisibles = 3; // Yo: mostramos 3 juegos en desktop
    const totalItems = juegos.length + 1; // Yo: +1 por la tarjeta "Ver más"
    const maxIndice = Math.max(0, totalItems - itemsVisibles);

    // Yo: función para actualizar la posición del carrusel
    const actualizarCarrusel = () => {
        const desplazamiento = -indiceActual * (100 / itemsVisibles);
        pista.style.transform = `translateX(${desplazamiento}%)`;

        // Yo: deshabilito botones cuando llego al límite
        btnPrev.disabled = indiceActual === 0;
        btnNext.disabled = indiceActual >= maxIndice;
    };

    // Yo: eventos de navegación
    btnPrev.addEventListener('click', () => {
        if (indiceActual > 0) {
            indiceActual--;
            actualizarCarrusel();
        }
    });

    btnNext.addEventListener('click', () => {
        if (indiceActual < maxIndice) {
            indiceActual++;
            actualizarCarrusel();
        }
    });

    // Yo: inicializo posición
    actualizarCarrusel();
}

/**
 * Yo: creo el HTML de una tarjeta para el carrusel
 * @param {Object} juego - Datos del juego
 * @returns {string} HTML string de la tarjeta
 */
function crearTarjetaCarrusel(juego) {
    return `
        <a href="${juego.game_url}" target="_blank" rel="noopener noreferrer" class="carrusel-item">
            <div class="carrusel-tarjeta">
                <img src="${juego.thumbnail}" alt="${juego.title}" loading="lazy">
                <div class="carrusel-info">
                    <h4>${juego.title}</h4>
                    <p>${juego.genre}</p>
                </div>
            </div>
        </a>
    `;
}

// Yo: si estamos en index.html, inicializo los carruseles
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarCarruseles);
} else {
    inicializarCarruseles();
}

