/**
 * GAMERSTORE - Script Principal
 * 
 * Contiene la lógica del catálogo de juegos con las siguientes funcionalidades:
 * - Carga de juegos desde FreeToGame API a través de proxy serverless
 * - Sistema de filtros combinables (género, plataforma, búsqueda)
 * - Ordenamiento por popularidad, fecha y alfabético
 * - Carruseles interactivos en la página principal
 * - Detección de parámetros URL para filtros pre-aplicados
 * - Renderizado dinámico de tarjetas de juegos
 * - Cache de 1 hora y reintentos automáticos para mejor performance
 * 
 */

// Estado global de la aplicación
let todosLosJuegos = [];
let generos = [];
let plataformas = [];

// Referencias a elementos del DOM
const grillaJuegos = document.getElementById('grilla-juegos');
const filtroGenero = document.getElementById('filtro-genero');
const filtroPlataforma = document.getElementById('filtro-plataforma');
const inputBusqueda = document.getElementById('busqueda-titulo');
const filtroOrdenamiento = document.getElementById('filtro-ordenamiento');
const contadorJuegos = document.getElementById('contador-juegos');
const mensajeCargando = document.getElementById('mensaje-cargando');

// === Navegación móvil (menú hamburguesa) ===
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
    });
}

// Inicio la carga cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    buscarJuegos();
});

// Listener para el filtro de género
if (filtroGenero) {
    filtroGenero.addEventListener('change', aplicarFiltros);
}

// Listener para el filtro de plataforma
if (filtroPlataforma) {
    filtroPlataforma.addEventListener('change', aplicarFiltros);
}

/**
 * Listener para búsqueda por título con debounce.
 * Espera 300ms después de que el usuario deja de escribir antes de filtrar,
 * evitando hacer búsquedas en cada tecla presionada.
 */
if (inputBusqueda) {
    let timeoutBusqueda;
    inputBusqueda.addEventListener('input', () => {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(aplicarFiltros, 300);
    });
}

// Listener para el ordenamiento
if (filtroOrdenamiento) {
    filtroOrdenamiento.addEventListener('change', () => {
        const orden = filtroOrdenamiento.value;
        ordenarYRenderizar(orden);
    });
}

// Detección de parámetros en la URL para aplicar filtros automáticamente
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    
    if (sortParam && filtroOrdenamiento) {
        filtroOrdenamiento.value = sortParam;
    }
});

/**
 * Realiza petición HTTP a FreeToGame API a través del proxy serverless.
 * En producción usa /api/games (con cache de 1h), en desarrollo usa AllOrigins.
 * Incluye timeout de 12s y hasta 2 reintentos automáticos.
 */
async function fetchJuegos({ platform = '', category = '', sortBy = 'popularity' } = {}, reintentos = 2) {
    // SIEMPRE usar proxy serverless en producción (cualquier dominio que no sea localhost)
    const esLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    let url;
    
    if (!esLocal) {
        // Producción: usar proxy serverless de Vercel con cache
        const params = new URLSearchParams();
        if (platform && platform !== 'all') params.set('platform', platform);
        if (category && category !== 'all') params.set('category', category);
        if (sortBy) params.set('sort-by', sortBy);
        url = `/api/games?${params.toString()}`;
    } else {
        // Desarrollo local: usar AllOrigins
        const targetUrl = `https://www.freetogame.com/api/games?platform=${platform}${category ? '&category=' + category : ''}${sortBy ? '&sort-by=' + sortBy : ''}`;
        url = "https://api.allorigins.win/raw?url=" + encodeURIComponent(targetUrl);
    }
    
    // Petición con timeout y reintentos
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        
        const respuesta = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        return await respuesta.json();
    } catch (error) {
        if (reintentos > 0 && (error.name === 'AbortError' || error.message.includes('HTTP'))) {
            console.warn(`Reintentando (${reintentos} restantes)...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchJuegos({ platform, category, sortBy }, reintentos - 1);
        }
        throw error;
    }
}

async function buscarJuegos() {
    try {
        mostrarCargando(true);
        
        todosLosJuegos = await fetchJuegos({ sortBy: 'popularity' });
        
        if (todosLosJuegos && todosLosJuegos.length > 0) {
            configurarFiltros();
            aplicarFiltros();
        } else {
            grillaJuegos.innerHTML = '<p class="mensaje-no-juegos">No se encontraron juegos. La API puede estar fuera de servicio.</p>';
        }
    } catch (error) {
        console.error('Error al buscar juegos:', error);
        grillaJuegos.innerHTML = '<p class="mensaje-no-juegos">Error al cargar juegos. Intentá recargar la página.</p>';
    } finally {
        mostrarCargando(false);
    }
}

// Configuro los selectores de género y plataforma con datos únicos
function configurarFiltros() {
    const generosUnicos = new Set(todosLosJuegos.map(juego => juego.genre));
    generos = Array.from(generosUnicos).sort();

    const plataformasUnicas = new Set(todosLosJuegos.map(juego => juego.platform));
    plataformas = Array.from(plataformasUnicas).sort();

    if (filtroGenero) {
        filtroGenero.innerHTML = '<option value="all">Todos los géneros</option>';
        generos.forEach(genero => {
            const opcion = document.createElement('option');
            opcion.value = genero;
            opcion.textContent = genero;
            filtroGenero.appendChild(opcion);
        });
    }

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

// Aplico todos los filtros activos (género, plataforma, búsqueda)
function aplicarFiltros() {
    let juegosFiltrados = todosLosJuegos;

    if (filtroGenero && filtroGenero.value !== 'all') {
        juegosFiltrados = juegosFiltrados.filter(juego => juego.genre === filtroGenero.value);
    }

    if (filtroPlataforma && filtroPlataforma.value !== 'all') {
        juegosFiltrados = juegosFiltrados.filter(juego => juego.platform === filtroPlataforma.value);
    }

    if (inputBusqueda && inputBusqueda.value.trim() !== '') {
        const termino = inputBusqueda.value.trim().toLowerCase();
        juegosFiltrados = juegosFiltrados.filter(juego => 
            juego.title.toLowerCase().includes(termino)
        );
    }

    if (filtroOrdenamiento) {
        const orden = filtroOrdenamiento.value;
        juegosFiltrados = ordenarJuegos(juegosFiltrados, orden);
    }

    renderizarJuegos(juegosFiltrados);
}

// Ordeno los juegos según el criterio seleccionado
function ordenarJuegos(juegos, criterio) {
    const copiaJuegos = [...juegos];
    
    switch(criterio) {
        case 'release-date':
            return copiaJuegos.sort((a, b) => {
                return new Date(b.release_date) - new Date(a.release_date);
            });
        
        case 'alphabetical':
            return copiaJuegos.sort((a, b) => {
                return a.title.localeCompare(b.title, 'es');
            });
        
        case 'popularity':
        default:
            return copiaJuegos;
    }
}

function ordenarYRenderizar(criterio) {
    aplicarFiltros();
}

// Renderizo la lista de juegos en la grilla
function renderizarJuegos(juegosParaRenderizar) {
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

// Creo una tarjeta de juego con toda su estructura HTML
function crearTarjetaJuego(juego) {
    const enlace = document.createElement('a');
    enlace.href = juego.game_url;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.className = 'enlace-tarjeta-juego';

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-juego';

    const divMiniatura = document.createElement('div');
    divMiniatura.className = 'miniatura';
    const img = document.createElement('img');
    img.src = juego.thumbnail;
    img.alt = juego.title;
    img.loading = 'lazy';
    divMiniatura.appendChild(img);

    const divContenido = document.createElement('div');
    divContenido.className = 'contenido';

    const titulo = document.createElement('h3');
    titulo.className = 'titulo';
    titulo.textContent = juego.title;

    const genero = document.createElement('p');
    genero.className = 'genero';
    genero.textContent = juego.genre;

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

function mostrarCargando(estaCargando) {
    if (mensajeCargando) {
        mensajeCargando.style.display = estaCargando ? 'block' : 'none';
    }
}

function actualizarContadorJuegos(cantidad) {
    if (contadorJuegos) {
        const etiqueta = cantidad === 1 ? 'juego' : 'juegos';
        contadorJuegos.textContent = `${cantidad} ${etiqueta}`;
    }
}

// Funciones para carruseles en index.html

// Inicializo los carruseles de juegos populares y recientes
async function inicializarCarruseles() {
    const contenedorPopulares = document.getElementById('carrusel-populares');
    const contenedorRecientes = document.getElementById('carrusel-recientes');
    
    if (!contenedorPopulares && !contenedorRecientes) {
        return;
    }

    try {
        const juegos = await fetchJuegos();
        
        if (juegos && juegos.length > 0) {
            if (contenedorPopulares) {
                const populares = juegos.slice(0, 10);
                crearCarrusel(contenedorPopulares, populares, 'populares');
            }

            if (contenedorRecientes) {
                const ordenadosPorFecha = [...juegos].sort((a, b) => {
                    return new Date(b.release_date) - new Date(a.release_date);
                });
                const recientes = ordenadosPorFecha.slice(0, 10);
                crearCarrusel(contenedorRecientes, recientes, 'recientes');
            }
        }
    } catch (error) {
        console.error('Error al cargar carruseles:', error);
    }
}

// Creo un carrusel con navegación prev/next
function crearCarrusel(contenedor, juegos, id) {
    contenedor.innerHTML = '';

    const tarjetasJuegos = juegos.map(juego => crearTarjetaCarrusel(juego)).join('');
    
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

    // Configuro navegación del carrusel
    const btnPrev = contenedor.querySelector('.prev');
    const btnNext = contenedor.querySelector('.next');
    const pista = contenedor.querySelector('.carrusel-pista');

    let indiceActual = 0;
    const totalItems = juegos.length + 1; // +1 por la tarjeta "Ver más"

    // Función para obtener cuántos items son visibles según el ancho de pantalla
    const obtenerItemsVisibles = () => {
        const ancho = window.innerWidth;
        if (ancho <= 600) return 1;
        if (ancho <= 900) return 2;
        return 3;
    };

    // Función para actualizar la posición del carrusel
    const actualizarCarrusel = () => {
        const itemsVisibles = obtenerItemsVisibles();
        const anchoItem = 100 / itemsVisibles;
        const desplazamiento = -indiceActual * anchoItem;
        pista.style.transform = `translateX(${desplazamiento}%)`;

        // Deshabilito botones cuando llego al límite
        const maxIndice = Math.max(0, totalItems - itemsVisibles);
        btnPrev.disabled = indiceActual === 0;
        btnNext.disabled = indiceActual >= maxIndice;
    };

    // Eventos de navegación
    btnPrev.addEventListener('click', () => {
        const itemsVisibles = obtenerItemsVisibles();
        if (indiceActual > 0) {
            indiceActual = Math.max(0, indiceActual - itemsVisibles);
            actualizarCarrusel();
        }
    });

    btnNext.addEventListener('click', () => {
        const itemsVisibles = obtenerItemsVisibles();
        const maxIndice = Math.max(0, totalItems - itemsVisibles);
        if (indiceActual < maxIndice) {
            indiceActual = Math.min(maxIndice, indiceActual + itemsVisibles);
            actualizarCarrusel();
        }
    });

    // Actualizo al redimensionar la ventana
    window.addEventListener('resize', actualizarCarrusel);

    // Inicializo posición
    actualizarCarrusel();
}

// Creo el HTML de una tarjeta para el carrusel
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

// Si estamos en index.html, inicializo los carruseles
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarCarruseles);
} else {
    inicializarCarruseles();
}

