"use strict";

(() => {
  const services = {
    organizador: {
      title: "Organizador de asiento",
      description:
        "Sumá espacio de guardado y mantené ordenado el interior de tu auto.",
      features: [
        "Confeccionado en materiales resistentes y fáciles de limpiar.",
        "Distribución de bolsillos adaptada al uso cotidiano.",
        "Colores y terminaciones disponibles para combinar con el interior.",
      ],
      images: ["../assets/clientes/trabajos/organizador-asiento.jpg"],
      whatsapp:
        "Hola, quiero consultar por un organizador de asiento para mi auto.",
    },

    timon: {
      title: "Tapizado de timón",
      description:
        "Renová el agarre y la apariencia del timón con una terminación hecha a medida.",
      features: [
        "Materiales resistentes al uso diario.",
        "Colores y costuras disponibles para elegir.",
        "El diseño final se confirma antes de realizar el trabajo.",
      ],
      images: [
        "../assets/clientes/trabajos/volante-01.jpg",
        "../assets/clientes/trabajos/volante-02.jpg",
      ],
      whatsapp: "Hola, quiero consultar por el tapizado del timón de mi auto.",
    },

    piso: {
      title: "Tapizado de piso",
      description:
        "Protegé y renová el piso del vehículo con una cobertura adaptada a su interior.",
      features: [
        "Confección ajustada a la forma y los sectores del vehículo.",
        "Material resistente y de fácil mantenimiento.",
        "Diseños y terminaciones disponibles para elegir.",
      ],
      images: [
        "../assets/clientes/trabajos/piso-01.jpg",
        "../assets/clientes/trabajos/piso-02.jpg",
        "../assets/clientes/trabajos/piso-03.jpg",
        "../assets/clientes/trabajos/piso-04.jpg",
      ],
      whatsapp: "Hola, quiero consultar por el tapizado de piso para mi auto.",
    },

    techo: {
      title: "Tapizado de techo",
      description:
        "Recuperá el aspecto del interior renovando el revestimiento del techo.",
      features: [
        "Materiales y colores disponibles según el vehículo.",
        "Retiro y colocación realizados cuidadosamente.",
        "El estado y la terminación final se confirman antes del trabajo.",
      ],
      images: [
        "../assets/clientes/trabajos/techo-01.jpg",
        "../assets/clientes/trabajos/techo-02.jpg",
        "../assets/clientes/trabajos/techo-03.jpg",
      ],
      whatsapp: "Hola, quiero consultar por el tapizado del techo de mi auto.",
    },

    limpieza: {
      title: "Limpieza de auto",
      description:
        "Limpieza interior y exterior para recuperar el cuidado y la presentación del vehículo.",
      features: [
        "Limpieza de asientos, tapicería y superficies interiores.",
        "Tratamiento de paneles y sectores de uso frecuente.",
        "Opciones de limpieza exterior según el estado del vehículo.",
      ],
      images: [
        "../assets/clientes/trabajos/limpieza-01.jpg",
        "../assets/clientes/trabajos/limpieza-02.jpeg",
        "../assets/clientes/trabajos/limpieza-03.jpg",
        "../assets/clientes/trabajos/limpieza-04.webp",
      ],
      whatsapp:
        "Hola, quiero consultar por el servicio de limpieza para mi auto.",
    },
  };

  const viewport = document.querySelector("[data-extras-viewport]");
  const track = document.querySelector("[data-extras-track]");
  const modal = document.querySelector("[data-extras-modal]");
  const dialog = modal?.querySelector("[data-extras-modal-dialog]");
  const modalMedia = modal?.querySelector("[data-extras-modal-media]");
  const modalImage = modal?.querySelector("[data-extras-modal-image]");
  const imageButton = modal?.querySelector("[data-extras-modal-zoom]");
  const modalTitle = modal?.querySelector("[data-extras-modal-title]");
  const modalDescription = modal?.querySelector(
    "[data-extras-modal-description]",
  );
  const modalFeatures = modal?.querySelector("[data-extras-modal-features]");
  const modalDots = modal?.querySelector("[data-extras-modal-dots]");
  const whatsappButton = modal?.querySelector("[data-extras-modal-whatsapp]");
  const previousButton = modal?.querySelector(
    '[data-action="previous-extra-image"]',
  );
  const nextButton = modal?.querySelector('[data-action="next-extra-image"]');
  const closeControls = modal?.querySelectorAll(
    '[data-action="close-extras-modal"]',
  );
  const dashboardCarousel = document.querySelector("[data-dashboard-carousel]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (
    !viewport ||
    !track ||
    !modal ||
    !dialog ||
    !modalMedia ||
    !modalImage ||
    !imageButton ||
    !modalTitle ||
    !modalDescription ||
    !modalFeatures ||
    !modalDots ||
    !whatsappButton
  ) {
    return;
  }

  const originalItems = Array.from(track.children);
  const originalCards = originalItems
    .map((item) => item.querySelector("[data-extra-card]"))
    .filter(Boolean);

  modal.id ||= "extras-modal";

  originalCards.forEach((card) => {
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-controls", modal.id);
  });

  let hovered = false;
  let focused = false;
  let modalOpen = false;
  let activeService = null;
  let activeImageIndex = 0;
  let previouslyFocused = null;
  let closeTimer = null;
  let touchStartX = null;
  let touchStartY = null;
  let suppressZoomClick = false;

  const shouldPause = () =>
    hovered ||
    focused ||
    modalOpen ||
    document.visibilityState !== "visible" ||
    reducedMotion.matches;

  const updatePauseState = () => {
    track.classList.toggle("is-paused", shouldPause());
    track.classList.toggle("is-reduced-motion", reducedMotion.matches);
  };

  const cloneItemsForLoop = () => {
    const fragment = document.createDocumentFragment();

    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);

      clone.dataset.extraClone = "true";
      clone.setAttribute("aria-hidden", "true");

      clone.querySelectorAll("button, a, [tabindex]").forEach((control) => {
        control.tabIndex = -1;
      });

      fragment.appendChild(clone);
    });

    track.appendChild(fragment);
  };

  const updateLoopMeasurements = () => {
    const firstOriginal = originalItems[0];
    const firstClone = track.querySelector("[data-extra-clone]");

    if (!firstOriginal || !firstClone) {
      return;
    }

    const distance = firstClone.offsetLeft - firstOriginal.offsetLeft;

    if (distance <= 0) {
      track.classList.remove("is-ready");
      return;
    }

    track.style.setProperty("--extras-loop-distance", `${distance}px`);

    track.style.setProperty(
      "--extras-loop-duration",
      `${Math.max(36, distance / 18)}s`,
    );

    track.classList.add("is-ready");
  };

  const showCardSlide = (serviceKey, requestedIndex) => {
    const service = services[serviceKey];

    if (!service) {
      return;
    }

    const index =
      (requestedIndex + service.images.length) % service.images.length;

    track
      .querySelectorAll(`[data-extra-service="${serviceKey}"]`)
      .forEach((card) => {
        const slides = Array.from(
          card.querySelectorAll("[data-extra-card-slide]"),
        );

        slides.forEach((slide, slideIndex) => {
          const isActive = slideIndex === index;

          slide.classList.toggle("is-active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
        });
      });
  };

  const startCardSlides = () => {
    Object.entries(services).forEach(([serviceKey, service], position) => {
      if (service.images.length < 2) {
        return;
      }

      let index = 0;

      window.setInterval(
        () => {
          if (shouldPause()) {
            return;
          }

          index = (index + 1) % service.images.length;
          showCardSlide(serviceKey, index);
        },
        3400 + position * 420,
      );
    });
  };

  const resetZoom = () => {
    imageButton.classList.remove("is-zoomed");
    imageButton.setAttribute("aria-label", "Ampliar imagen");
    imageButton.scrollTo?.({ top: 0, left: 0 });
  };

  const showModalImage = (requestedIndex) => {
    if (!activeService) {
      return;
    }

    const service = services[activeService];
    const totalImages = service.images.length;

    activeImageIndex = (requestedIndex + totalImages) % totalImages;

    resetZoom();

    modalImage.src = service.images[activeImageIndex];
    modalImage.alt = `${service.title}. Imagen ${activeImageIndex + 1} de ${totalImages}.`;

    const hasSeveralImages = totalImages > 1;

    if (previousButton) {
      previousButton.hidden = !hasSeveralImages;
    }

    if (nextButton) {
      nextButton.hidden = !hasSeveralImages;
    }

    modalDots.hidden = !hasSeveralImages;

    Array.from(modalDots.children).forEach((dot, index) => {
      const isActive = index === activeImageIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  const createModalDots = (totalImages) => {
    modalDots.replaceChildren();

    for (let index = 0; index < totalImages; index += 1) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "extras-modal__dot";
      dot.setAttribute("aria-label", `Ver imagen ${index + 1}`);

      dot.addEventListener("click", () => {
        showModalImage(index);
      });

      modalDots.appendChild(dot);
    }
  };

  const getOriginalCard = (serviceKey) =>
    originalCards.find((card) => card.dataset.extraService === serviceKey);

  const openModal = (serviceKey, trigger) => {
    const service = services[serviceKey];

    if (!service) {
      return;
    }

    window.clearTimeout(closeTimer);

    activeService = serviceKey;
    activeImageIndex = 0;

    previouslyFocused =
      trigger.closest("[data-extra-clone]") !== null
        ? getOriginalCard(serviceKey)
        : trigger;

    modalTitle.textContent = service.title;
    modalDescription.textContent = service.description;

    modalFeatures.replaceChildren(
      ...service.features.map((feature) => {
        const item = document.createElement("li");

        item.textContent = feature;
        return item;
      }),
    );

    whatsappButton.href = `https://wa.me/5491132016031?text=${encodeURIComponent(
      service.whatsapp,
    )}`;

    createModalDots(service.images.length);
    showModalImage(0);

    modal.hidden = false;
    modalOpen = true;

    document.body.classList.add("is-extras-modal-open");

    dashboardCarousel?.dispatchEvent(new Event("dashboard:pause"));

    updatePauseState();

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      dialog.focus({ preventScroll: true });
    });
  };

  const closeModal = () => {
    if (modal.hidden || !modalOpen) {
      return;
    }

    modalOpen = false;
    modal.classList.remove("is-open");

    document.body.classList.remove("is-extras-modal-open");

    dashboardCarousel?.dispatchEvent(new Event("dashboard:resume"));

    updatePauseState();
    resetZoom();

    const restoreFocus = previouslyFocused;

    previouslyFocused = null;
    activeService = null;

    closeTimer = window.setTimeout(
      () => {
        if (modalOpen) {
          return;
        }

        modal.hidden = true;

        restoreFocus?.focus({
          preventScroll: true,
        });
      },
      reducedMotion.matches ? 0 : 220,
    );
  };

  const handleModalKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (
      event.key === "ArrowLeft" &&
      !imageButton.classList.contains("is-zoomed")
    ) {
      event.preventDefault();
      showModalImage(activeImageIndex - 1);
      return;
    }

    if (
      event.key === "ArrowRight" &&
      !imageButton.classList.contains("is-zoomed")
    ) {
      event.preventDefault();
      showModalImage(activeImageIndex + 1);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hidden && element.offsetParent !== null);

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  cloneItemsForLoop();

  viewport.addEventListener("click", (event) => {
    const card = event.target.closest("[data-extra-card]");

    if (!card || !viewport.contains(card)) {
      return;
    }

    openModal(card.dataset.extraService, card);
  });

  viewport.addEventListener("mouseenter", () => {
    hovered = true;
    updatePauseState();
  });

  viewport.addEventListener("mouseleave", () => {
    hovered = false;
    updatePauseState();
  });

  viewport.addEventListener("focusin", () => {
    focused = true;
    updatePauseState();
  });

  viewport.addEventListener("focusout", () => {
    window.setTimeout(() => {
      focused = viewport.contains(document.activeElement);

      updatePauseState();
    }, 0);
  });

  previousButton?.addEventListener("click", () => {
    showModalImage(activeImageIndex - 1);
  });

  nextButton?.addEventListener("click", () => {
    showModalImage(activeImageIndex + 1);
  });

  closeControls?.forEach((control) => {
    control.addEventListener("click", closeModal);
  });

  imageButton.addEventListener("click", () => {
    if (suppressZoomClick) {
      return;
    }

    const isZoomed = imageButton.classList.toggle("is-zoomed");

    imageButton.setAttribute(
      "aria-label",
      isZoomed ? "Reducir imagen" : "Ampliar imagen",
    );

    if (!isZoomed) {
      imageButton.scrollTo?.({
        top: 0,
        left: 0,
      });
    }
  });

  modalMedia.addEventListener(
    "touchstart",
    (event) => {
      if (imageButton.classList.contains("is-zoomed")) {
        return;
      }

      touchStartX = event.touches[0]?.clientX ?? null;

      touchStartY = event.touches[0]?.clientY ?? null;
    },
    { passive: true },
  );

  modalMedia.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null || touchStartY === null) {
        return;
      }

      const touch = event.changedTouches[0];
      const travelledX = touch.clientX - touchStartX;
      const travelledY = touch.clientY - touchStartY;

      touchStartX = null;
      touchStartY = null;

      if (
        Math.abs(travelledX) < 45 ||
        Math.abs(travelledX) <= Math.abs(travelledY)
      ) {
        return;
      }

      suppressZoomClick = true;

      showModalImage(
        travelledX < 0 ? activeImageIndex + 1 : activeImageIndex - 1,
      );

      window.setTimeout(() => {
        suppressZoomClick = false;
      }, 350);
    },
    { passive: true },
  );

  modalMedia.addEventListener("touchcancel", () => {
    touchStartX = null;
    touchStartY = null;
    suppressZoomClick = false;
  });

  modal.addEventListener("keydown", handleModalKeydown);

  document.addEventListener("visibilitychange", updatePauseState);

  const handleMotionPreference = () => {
    updatePauseState();
    updateLoopMeasurements();
  };

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotion.addListener(handleMotionPreference);
  }

  const resizeObserver =
    "ResizeObserver" in window
      ? new ResizeObserver(updateLoopMeasurements)
      : null;

  resizeObserver?.observe(viewport);

  window.addEventListener("resize", updateLoopMeasurements);

  window.addEventListener("load", updateLoopMeasurements, { once: true });

  window.requestAnimationFrame(updateLoopMeasurements);

  Object.keys(services).forEach((serviceKey) => {
    showCardSlide(serviceKey, 0);
  });

  startCardSlides();
  updatePauseState();
})();
