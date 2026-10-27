(() => {
  const carousels = document.querySelectorAll("[data-benefits-carousel]");

  carousels.forEach((carousel) => {
    const slides = Array.from(
      carousel.querySelectorAll("[data-benefits-slide]"),
    );

    const dots = Array.from(carousel.querySelectorAll("[data-benefits-dot]"));

    if (slides.length < 2) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let currentIndex = 0;
    let timer = null;
    let isVisible = false;

    const showSlide = (nextIndex) => {
      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        const isActive = index === currentIndex;

        slide.classList.toggle("is-active", isActive);

        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;

        dot.classList.toggle("is-active", isActive);

        dot.setAttribute("aria-current", String(isActive));
      });
    };

    const stopAutoplay = () => {
      window.clearInterval(timer);
      timer = null;
    };

    const canAutoplay = () =>
      isVisible &&
      !reducedMotion.matches &&
      !document.hidden &&
      !carousel.matches(":hover") &&
      !carousel.contains(document.activeElement);

    const startAutoplay = () => {
      stopAutoplay();

      if (!canAutoplay()) {
        return;
      }

      timer = window.setInterval(() => {
        showSlide(currentIndex + 1);
      }, 4800);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startAutoplay();
      });
    });

    carousel.addEventListener("pointerenter", stopAutoplay);

    carousel.addEventListener("pointerleave", startAutoplay);

    carousel.addEventListener("focusin", stopAutoplay);

    carousel.addEventListener("focusout", () => {
      window.requestAnimationFrame(startAutoplay);
    });

    document.addEventListener("visibilitychange", startAutoplay);

    reducedMotion.addEventListener?.("change", startAutoplay);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(carousel);
  });
})();
