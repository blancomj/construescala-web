// Page Loader Animation
export function initLoader() {
  const loader = document.getElementById('page-loader');
  const loaderPaths = document.querySelectorAll('.loader-path');
  const loaderProgress = document.querySelector('.loader-progress');
  
  // Animate SVG paths
  loaderPaths.forEach((path, i) => {
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = String(pathLength);
    path.style.strokeDashoffset = String(pathLength);
    path.style.animation = `drawPath 1.5s ease forwards ${i * 0.2}s`;
  });

  // Animate progress bar
  if (loaderProgress) {
    loaderProgress.style.animation = 'loadProgress 1.8s ease forwards';
  }

  // Hide loader after animation
  setTimeout(() => {
    if (loader) {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }, 2000);
}
