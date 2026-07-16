// Scroll Reveal Observer
export function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Stagger children animation
        const children = entry.target.querySelectorAll('[data-reveal-child]');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.1}s`;
          child.classList.add('visible');
        });
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .reveal-text, .reveal-image').forEach(el => {
    observer.observe(el);
  });

  // Text Reveal Animation - Split text into lines
  const revealTextElements = document.querySelectorAll('.split-text');
  revealTextElements.forEach(el => {
    const text = el.textContent || '';
    const words = text.split(' ');
    el.innerHTML = '';
    
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.style.transitionDelay = `${i * 0.05}s`;
      span.textContent = word + ' ';
      el.appendChild(span);
    });
  });
}
