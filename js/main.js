// Carousel functionality
const carouselPositions = {};

function scrollCarousel(continent, direction) {
    const track = document.getElementById(`${continent}-track`);
    if (!track) return;

    // 1. Get the container width to calculate how much is visible
    const container = track.parentElement;
    const containerWidth = container.offsetWidth;
    
    // 2. Dynamically calculate card width (width + margins)
    // This is safer than hardcoding 332
    const firstCard = track.querySelector('.marathon-card');
    if (!firstCard) return;
    
    // Get style to include margins in calculation
    const style = window.getComputedStyle(firstCard);
    const cardWidth = firstCard.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);

    // 3. Calculate limits
    const totalWidth = track.scrollWidth;
    // The maximum we can scroll to the left (a negative number)
    const maxScroll = -(totalWidth - containerWidth);

    // Initialize position if not set
    if (carouselPositions[continent] === undefined) {
        carouselPositions[continent] = 0;
    }

    // 4. Update Position
    // We subtract because "Next" (1) needs to make the X value more negative
    // We add when "Prev" (-1) to make the X value closer to 0
    carouselPositions[continent] -= direction * cardWidth;

    // 5. Clamp the position
    // Ensure we don't scroll past the start (0) or past the end (maxScroll)
    if (carouselPositions[continent] > 0) {
        carouselPositions[continent] = 0;
    }
    if (carouselPositions[continent] < maxScroll) {
        carouselPositions[continent] = maxScroll;
    }
    
    // Apply the transform
    track.style.transform = `translateX(${carouselPositions[continent]}px)`;
}