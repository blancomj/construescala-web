// Page Transition on Link Click
export function initPageTransition() {
  const transition = document.getElementById('page-transition');
  const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto"]):not([href^="tel"])');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && href !== window.location.pathname) {
        e.preventDefault();
        
        if (transition) {
          transition.classList.add('active');
          
          setTimeout(() => {
            window.location.href = href;
          }, 600);
        }
      }
    });
  });
}
