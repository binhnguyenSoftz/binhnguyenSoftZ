/* ==========================================================================
   Scroll reveal — fades elements in as they enter the viewport
   ========================================================================== */
(function () {
  'use strict';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document
    .querySelectorAll('.fade-up')
    .forEach((el) => observer.observe(el));
})();
