// Carousel functionality
const carouselPositions = {
    'europe': 0,
    'north-america': 0,
    'asia': 0,
    'africa': 0,
    'south-america': 0,
    'australia-oceania': 0
};

function scrollCarousel(continent, direction) {
    const track = document.getElementById(`${continent}-track`);
    if (!track) return;
    
    // === THIS IS THE FIX ===
    // card width (300px) + margins (1rem * 2 = 32px)
    const cardWidth = 332; 
    // ======================
    
    const container = track.parentElement;
    if (!container) return;

    const visibleCards = Math.floor(container.offsetWidth / cardWidth);
    const maxCards = track.children.length;

    // Don't scroll if all cards are visible
    if (visibleCards >= maxCards) {
        track.style.transform = `translateX(0px)`;
        carouselPositions[continent] = 0;
        return;
    }

    const maxScroll = -(maxCards - visibleCards) * cardWidth;
    
    if (isNaN(carouselPositions[continent])) {
        carouselPositions[continent] = 0;
    }
    
    carouselPositions[continent] += direction * cardWidth;
    
    // Clamp the position between 0 (start) and maxScroll (end)
    carouselPositions[continent] = Math.max(maxScroll, Math.min(0, carouselPositions[continent]));
    
    track.style.transform = `translateX(${carouselPositions[continent]}px)`;
}

