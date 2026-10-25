"use strict";

(() => {
  const setupShowroomMenu = () => {
    const menuButton = document.querySelector("[data-showroom-menu-button]");
    const menu = document.querySelector("[data-showroom-menu]");

    if (!menuButton || !menu) {
      return;
    }

    const setMenuOpen = (isOpen) => {
      menu.hidden = !isOpen;
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú",
      );
    };

    menuButton.addEventListener("click", () => {
      setMenuOpen(menu.hidden);
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("click", (event) => {
      const header = menuButton.closest(".clientes-showroom__header");

      if (!menu.hidden && header && !header.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || menu.hidden) {
        return;
      }

      setMenuOpen(false);
      menuButton.focus();
    });
  };

  const setupDashboardCarousel = () => {
    const carousel = document.querySelector("[data-dashboard-carousel]");

    if (!carousel) {
      return;
    }

    const viewport = carousel.querySelector(".clientes-dashboard__viewport");
    const slides = Array.from(
      carousel.querySelectorAll("[data-dashboard-slide]"),
    );
    const dots = Array.from(carousel.querySelectorAll("[data-dashboard-dot]"));
    const previousButton = carousel.querySelector("[data-dashboard-previous]");
    const nextButton = carousel.querySelector("[data-dashboard-next]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!viewport || slides.length === 0) {
      return;
    }

    let activeIndex = Math.max(
      0,
      slides.findIndex((slide) => slide.classList.contains("is-active")),
    );
    let autoplayTimer = null;
    let pointerStartX = null;

    const showSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;

        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;

        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", String(isActive));
      });
    };

    const stopAutoplay = () => {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const startAutoplay = () => {
      stopAutoplay();

      if (
        reducedMotion.matches ||
        document.visibilityState !== "visible" ||
        slides.length < 2
      ) {
        return;
      }

      autoplayTimer = window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 4800);
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    previousButton?.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      restartAutoplay();
    });

    nextButton?.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      restartAutoplay();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const requestedIndex = Number(dot.dataset.dashboardDot);

        if (!Number.isInteger(requestedIndex)) {
          return;
        }

        showSlide(requestedIndex);
        restartAutoplay();
      });
    });

    viewport.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
      stopAutoplay();
    });

    viewport.addEventListener("pointerup", (event) => {
      if (pointerStartX === null) {
        return;
      }

      const travelledDistance = event.clientX - pointerStartX;

      if (Math.abs(travelledDistance) >= 45) {
        showSlide(travelledDistance < 0 ? activeIndex + 1 : activeIndex - 1);
      }

      pointerStartX = null;
      startAutoplay();
    });

    viewport.addEventListener("pointercancel", () => {
      pointerStartX = null;
      startAutoplay();
    });

    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!carousel.contains(document.activeElement)) {
          startAutoplay();
        }
      }, 0);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    });

    reducedMotion.addEventListener?.("change", startAutoplay);

    showSlide(activeIndex);
    startAutoplay();
  };

  setupShowroomMenu();
  setupDashboardCarousel();
})();
