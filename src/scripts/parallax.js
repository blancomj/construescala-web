// Parallax Effect
export function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-img');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(el => {
      const speed = 0.3;
      const container = el.closest('.parallax-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (visible) {
        const yPos = -(scrollY - container.offsetTop) * speed;
        el.style.transform = `translateY(${yPos}px) scale(1.1)`;
      }
    });
  });
}
