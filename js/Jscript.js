// Yo: este archivo maneja la navegación móvil y el carrusel estático de index.html
// Agrego protección contra elementos nulos para evitar errores en páginas sin estos elementos

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const carousel = document.querySelector('.carousel');
const images = document.querySelectorAll('.carousel img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// Yo: solo configuro el menú hamburguesa si existe en la página
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
    });
}

// Yo: lógica del carrusel estático (solo si existen los elementos)
if (carousel && images.length > 0 && prevBtn && nextBtn) {
    let index = 0;

    function updateCarousel() {
        carousel.style.transform = `translateX(${-index * 100}%)`;
    }

    nextBtn.addEventListener('click', () => {
        index = (index + 1) % images.length;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        index = (index - 1 + images.length) % images.length;
        updateCarousel();
    });
}
