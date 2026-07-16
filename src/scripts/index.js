// Main entry point for all scripts
import { initLoader } from './loader.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initParallax } from './parallax.js';
import { initPageTransition } from './page-transition.js';
import { initMagnetic } from './magnetic.js';
import { initCursor } from './cursor.js';

// Initialize all scripts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initScrollReveal();
  initParallax();
  initPageTransition();
  initMagnetic();
  initCursor();
});
