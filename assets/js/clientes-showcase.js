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
        slide.tabIndex = isActive ? 0 : -1;
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

    carousel.addEventListener("dashboard:pause", stopAutoplay);
    carousel.addEventListener("dashboard:resume", startAutoplay);

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
  const setupProtectorModal = () => {
    const carousel = document.querySelector("[data-dashboard-carousel]");
    const modal = document.querySelector("[data-protector-modal]");
    const dialog = modal?.querySelector("[data-protector-modal-dialog]");
    const poster = modal?.querySelector("[data-protector-modal-poster]");
    const video = modal?.querySelector("[data-protector-modal-video]");
    const closeControls = modal?.querySelectorAll(
      '[data-action="close-protector-modal"]',
    );

    const slides = Array.from(
      carousel?.querySelectorAll("[data-dashboard-slide]") ?? [],
    );

    if (!carousel || !modal || !dialog || slides.length === 0) {
      return;
    }

    let previouslyFocused = null;
    let pointerStartX = null;
    let dragged = false;

    const openModal = (slide) => {
      const selectedImage = slide.querySelector("img");

      if (poster && selectedImage) {
        poster.src = selectedImage.currentSrc || selectedImage.src;
        poster.alt = selectedImage.alt;
      }

      previouslyFocused = slide;

      modal.hidden = false;
      document.body.classList.add("is-protector-modal-open");
      carousel.dispatchEvent(new Event("dashboard:pause"));
      window.requestAnimationFrame(() => {
        dialog.focus({ preventScroll: true });
      });
    };

    const closeModal = () => {
      if (modal.hidden) {
        return;
      }

      video?.pause();

      if (video && Number.isFinite(video.duration)) {
        video.currentTime = 0;
      }

      modal.hidden = true;
      document.body.classList.remove("is-protector-modal-open");
      carousel.dispatchEvent(new Event("dashboard:resume"));
      const activeSlide =
        carousel.querySelector("[data-dashboard-slide].is-active") ||
        previouslyFocused;

      previouslyFocused = null;

      activeSlide?.focus({ preventScroll: true });
    };

    const handleModalKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll(
          'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    slides.forEach((slide) => {
      const originalLabel = slide.getAttribute("aria-label");
      const imageDescription = slide.querySelector("img")?.alt;

      slide.tabIndex = slide.classList.contains("is-active") ? 0 : -1;
      slide.setAttribute("role", "button");
      slide.setAttribute("aria-haspopup", "dialog");
      slide.setAttribute("aria-controls", "protector-modal");

      slide.setAttribute(
        "aria-label",
        [originalLabel, "Ver modelos y características", imageDescription]
          .filter(Boolean)
          .join(". "),
      );

      slide.addEventListener("pointerdown", (event) => {
        pointerStartX = event.clientX;
        dragged = false;
      });

      slide.addEventListener("pointermove", (event) => {
        if (
          pointerStartX !== null &&
          Math.abs(event.clientX - pointerStartX) > 12
        ) {
          dragged = true;
        }
      });

      slide.addEventListener("pointerup", () => {
        pointerStartX = null;

        window.setTimeout(() => {
          dragged = false;
        }, 0);
      });

      slide.addEventListener("pointercancel", () => {
        pointerStartX = null;
        dragged = false;
      });

      slide.addEventListener("click", (event) => {
        if (dragged) {
          event.preventDefault();
          return;
        }

        openModal(slide);
      });

      slide.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        openModal(slide);
      });
    });

    closeControls?.forEach((control) => {
      control.addEventListener("click", closeModal);
    });

    modal.addEventListener("keydown", handleModalKeydown);
  };
  setupShowroomMenu();
  setupDashboardCarousel();
  setupProtectorModal();
})();
