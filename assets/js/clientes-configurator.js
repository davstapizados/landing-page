"use strict";

(() => {
  const state = {
    estilo: null,
    material: null,

    colorPrincipal: null,
    colorLateral: null,
    colorCentro: null,
    colorCostura: null,

    diseno: null,
    bordado: false,
    vivos: false,

    marca: "",
    modelo: "",
    anio: "",
    version: "",
  };

  let currentStepIndex = 0;
  let editingFromSummary = false;
  let vehicleStateBeforeEdit = null;
  let introPreviouslyFocused = null;
  let seatZoomPreviouslyFocused = null;
  let configuratorInertBeforeZoom = false;

  const startButton = document.querySelector(
    '[data-action="start-configurator"]',
  );

  const configurator = document.querySelector("#configurador");
  const introModal = document.querySelector("[data-configurator-intro]");
  const introDialog = document.querySelector(
    "[data-configurator-intro-dialog]",
  );
  const introCloseControls = document.querySelectorAll(
    '[data-action="close-configurator-intro"]',
  );
  const introConfirmButton = document.querySelector(
    '[data-action="confirm-configurator-intro"]',
  );

  const siteHeader = document.querySelector(".clientes-header");
  const hero = document.querySelector(".clientes-hero");
  const otherServices = document.querySelector(".other-services");
  const footer = document.querySelector(".clientes-footer");

  const exitButton = document.querySelector(
    '[data-action="exit-configurator"]',
  );

  const nextButton = document.querySelector('[data-action="next-step"]');
  const whatsappButton = document.querySelector(
    '[data-action="send-whatsapp"]',
  );
  const previousButton = document.querySelector(
    '[data-action="previous-step"]',
  );

  const steps = Array.from(document.querySelectorAll(".configurator-step"));

  const styleButtons = document.querySelectorAll("[data-style]");
  const materialButtons = document.querySelectorAll("[data-material]");
  const colorButtons = document.querySelectorAll("[data-color-group]");
  const designButtons = document.querySelectorAll("[data-design]");
  const extraButtons = document.querySelectorAll("[data-extra]");
  const vehicleInputs = document.querySelectorAll("[data-vehicle]");
  const seatRender = document.querySelector("[data-seat-render]");
  const bordadoNote = document.querySelector("[data-bordado-note]");
  const seatZoomButton = document.querySelector(
    '[data-action="open-seat-zoom"]',
  );
  const seatZoomModal = document.querySelector("[data-seat-zoom]");
  const seatZoomDialog = document.querySelector("[data-seat-zoom-dialog]");
  const seatZoomMount = document.querySelector("[data-seat-zoom-mount]");
  const seatZoomCloseControls = document.querySelectorAll(
    '[data-action="close-seat-zoom"]',
  );
  const miniScrollAfterSelection = (button) => {
    if (!window.matchMedia("(max-width: 820px)").matches) {
      return;
    }

    if (button.getAttribute("aria-pressed") !== "true") {
      return;
    }

    const activeStep = button.closest(".configurator-step");

    if (!activeStep || activeStep.scrollHeight <= activeStep.clientHeight) {
      return;
    }

    window.setTimeout(() => {
      const remainingScroll =
        activeStep.scrollHeight -
        activeStep.clientHeight -
        activeStep.scrollTop;

      if (remainingScroll <= 0) {
        return;
      }

      activeStep.scrollBy({
        top: Math.min(76, remainingScroll),
        behavior: "smooth",
      });
    }, 120);
  };

  const summaryDesign = document.querySelector("[data-summary-design]");
  const summaryVehicle = document.querySelector("[data-summary-vehicle]");
  const editButtons = document.querySelectorAll("[data-edit-step]");
  const progressBar = document.querySelector("[data-configurator-progressbar]");
  const progressSegments = document.querySelectorAll(
    ".configurator-progress__segment",
  );

  const focusVisibleConfiguratorStep = () => {
    const activeStep = steps[currentStepIndex];

    if (!activeStep) {
      exitButton?.focus({ preventScroll: true });
      return;
    }

    const firstControl = activeStep.querySelector(
      [
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "a[href]",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", "),
    );

    if (firstControl instanceof HTMLElement) {
      firstControl.focus({ preventScroll: true });
      return;
    }

    const title = activeStep.querySelector("h3");

    if (title instanceof HTMLElement) {
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
      return;
    }

    exitButton?.focus({ preventScroll: true });
  };

  if (!startButton || !configurator) {
    return;
  }

  const labels = {
    estilos: {
      sobrio: "Sobrio",
      deportivo: "Deportivo",
      premium: "Premium",
      personalizado: "Personalizado",
    },

    materiales: {
      sintetico: "Cuero sintético",
      genuino: "Cuero genuino",
    },

    colores: {
      negro: "Negro",
      gris: "Gris",
      marron: "Marrón",
      rojo: "Rojo",
      negra: "Negra",
      roja: "Roja",
      clara: "Clara",
    },

    disenos: {
      liso: "Liso",
      rombos: "Rombos",
      canelones: "Canelones",
    },
  };

  const updateSeatPreview = () => {
    if (!seatRender) {
      return;
    }

    seatRender.dataset.material = state.material || "";
    seatRender.dataset.principal = state.colorPrincipal || "";
    seatRender.dataset.lateral = state.colorLateral || "";
    seatRender.dataset.center = state.colorCentro || "";
    seatRender.dataset.stitching = state.colorCostura || "";
    seatRender.dataset.pattern = state.diseno || "";

    seatRender.dataset.piping = state.vivos ? "on" : "off";
    seatRender.dataset.embroidery = state.bordado ? "on" : "off";
  };

  const getSeatZoomFocusableElements = () => {
    if (!seatZoomDialog) {
      return [];
    }

    return Array.from(
      seatZoomDialog.querySelectorAll(
        [
          "button:not([disabled])",
          "a[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          '[tabindex]:not([tabindex="-1"])',
        ].join(", "),
      ),
    ).filter(
      (element) =>
        element instanceof HTMLElement && element.offsetParent !== null,
    );
  };

  const openSeatZoom = () => {
    if (
      !seatZoomModal ||
      !seatZoomDialog ||
      !seatZoomMount ||
      !seatRender ||
      !seatZoomModal.hidden ||
      configurator.hidden ||
      (introModal && !introModal.hidden)
    ) {
      return;
    }

    const seatClone = seatRender.cloneNode(true);

    seatClone.removeAttribute("data-seat-render");
    seatClone.setAttribute("data-seat-render-clone", "");
    seatClone.setAttribute("aria-hidden", "true");

    seatClone.querySelectorAll("[id]").forEach((element) => {
      element.removeAttribute("id");
    });

    seatZoomMount.replaceChildren(seatClone);

    seatZoomPreviouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : seatZoomButton;

    configuratorInertBeforeZoom = configurator.inert;
    configurator.inert = true;

    seatZoomModal.hidden = false;
    document.body.classList.add("is-seat-zoom-open");
    seatZoomButton?.setAttribute("aria-expanded", "true");

    window.requestAnimationFrame(() => {
      const firstFocusable = getSeatZoomFocusableElements()[0];
      const focusTarget = firstFocusable || seatZoomDialog;

      focusTarget.focus({ preventScroll: true });
    });
  };

  const closeSeatZoom = ({ restoreFocus = true } = {}) => {
    if (!seatZoomModal || seatZoomModal.hidden) {
      return;
    }

    const previousFocusCanBeRestored =
      seatZoomPreviouslyFocused instanceof HTMLElement &&
      seatZoomPreviouslyFocused.isConnected &&
      !(
        configurator.hidden && configurator.contains(seatZoomPreviouslyFocused)
      );

    const focusTarget = previousFocusCanBeRestored
      ? seatZoomPreviouslyFocused
      : configurator.hidden
        ? startButton
        : seatZoomButton;

    seatZoomModal.hidden = true;
    document.body.classList.remove("is-seat-zoom-open");
    seatZoomButton?.setAttribute("aria-expanded", "false");

    configurator.inert = configuratorInertBeforeZoom;
    configuratorInertBeforeZoom = false;

    seatZoomMount?.replaceChildren();
    seatZoomPreviouslyFocused = null;

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        focusTarget?.focus({ preventScroll: true });
      });
    }
  };

  const handleSeatZoomKeydown = (event) => {
    if (!seatZoomModal || seatZoomModal.hidden || !seatZoomDialog) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeSeatZoom();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getSeatZoomFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      seatZoomDialog.focus({ preventScroll: true });
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentIndex = focusableElements.indexOf(document.activeElement);

    if (event.shiftKey && currentIndex <= 0) {
      event.preventDefault();
      lastElement.focus({ preventScroll: true });
      return;
    }

    if (
      !event.shiftKey &&
      (currentIndex === -1 || currentIndex === focusableElements.length - 1)
    ) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
    }
  };

  const openConfigurator = () => {
    siteHeader.hidden = true;
    hero.hidden = true;
    otherServices.hidden = true;
    footer.hidden = true;

    configurator.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  const closeConfigurator = () => {
    closeSeatZoom({ restoreFocus: false });

    configurator.hidden = true;
    siteHeader.hidden = false;
    hero.hidden = false;
    otherServices.hidden = false;
    footer.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    window.requestAnimationFrame(() => {
      startButton.focus({ preventScroll: true });
    });
  };

  const setIntroBackgroundInert = (isInert) => {
    [siteHeader, hero, otherServices, footer].forEach((element) => {
      if (element) {
        element.inert = isInert;
      }
    });
  };

  const openConfiguratorIntro = () => {
    if (!introModal || !introDialog) {
      openConfigurator();
      return;
    }

    if (!introModal.hidden) {
      return;
    }

    introPreviouslyFocused = document.activeElement;

    introModal.hidden = false;
    document.body.classList.add("is-configurator-intro-open");
    setIntroBackgroundInert(true);

    window.requestAnimationFrame(() => {
      introDialog.focus({ preventScroll: true });
    });
  };

  const closeConfiguratorIntro = ({ restoreFocus = true } = {}) => {
    if (!introModal || introModal.hidden) {
      return;
    }

    introModal.hidden = true;
    document.body.classList.remove("is-configurator-intro-open");
    setIntroBackgroundInert(false);

    const focusTarget =
      introPreviouslyFocused instanceof HTMLElement
        ? introPreviouslyFocused
        : startButton;

    introPreviouslyFocused = null;

    if (restoreFocus) {
      focusTarget?.focus({ preventScroll: true });
    }
  };

  const confirmConfiguratorIntro = () => {
    closeConfiguratorIntro({ restoreFocus: false });
    openConfigurator();

    window.requestAnimationFrame(focusVisibleConfiguratorStep);
  };

  const handleConfiguratorIntroKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeConfiguratorIntro();
      return;
    }

    if (event.key !== "Tab" || !introDialog) {
      return;
    }

    const focusableElements = Array.from(
      introDialog.querySelectorAll("button:not([disabled])"),
    ).filter((element) => element.offsetParent !== null);

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentIndex = focusableElements.indexOf(document.activeElement);

    if (event.shiftKey && currentIndex <= 0) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      (currentIndex === -1 || currentIndex === focusableElements.length - 1)
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const selectStyle = (button) => {
    const selectedStyle = button.dataset.style;

    if (!selectedStyle) {
      return;
    }

    state.estilo = selectedStyle;

    styleButtons.forEach((styleButton) => {
      styleButton.setAttribute(
        "aria-pressed",
        String(styleButton.dataset.style === selectedStyle),
      );
    });

    updateNavigationState();
  };

  const selectMaterial = (button) => {
    const selectedMaterial = button.dataset.material;

    if (!selectedMaterial) {
      return;
    }

    state.material = selectedMaterial;

    materialButtons.forEach((materialButton) => {
      materialButton.setAttribute(
        "aria-pressed",
        String(materialButton.dataset.material === selectedMaterial),
      );
    });
    updateSeatPreview();
    updateNavigationState();
  };

  const selectColor = (button) => {
    const group = button.dataset.colorGroup;
    const color = button.dataset.color;

    if (!group || !color) {
      return;
    }

    if (group === "principal") {
      state.colorPrincipal = color;
    }
    if (group === "lateral") {
      state.colorLateral = color;
    }
    if (group === "centro") {
      state.colorCentro = color;
    }

    if (group === "costura") {
      state.colorCostura = color;
    }

    colorButtons.forEach((colorButton) => {
      if (colorButton.dataset.colorGroup !== group) {
        return;
      }

      colorButton.setAttribute(
        "aria-pressed",
        String(colorButton.dataset.color === color),
      );
    });
    updateSeatPreview();
    updateNavigationState();
  };

  const selectDesign = (button) => {
    const selectedDesign = button.dataset.design;

    if (!selectedDesign) {
      return;
    }

    state.diseno = selectedDesign;

    designButtons.forEach((designButton) => {
      designButton.setAttribute(
        "aria-pressed",
        String(designButton.dataset.design === selectedDesign),
      );
    });
    updateSeatPreview();
    updateNavigationState();
  };

  const toggleExtra = (button) => {
    const extra = button.dataset.extra;

    if (!extra) {
      return;
    }

    if (extra === "bordado") {
      state.bordado = !state.bordado;

      button.setAttribute("aria-pressed", String(state.bordado));

      if (bordadoNote) {
        bordadoNote.hidden = !state.bordado;
      }
    }

    if (extra === "vivos") {
      state.vivos = !state.vivos;

      button.setAttribute("aria-pressed", String(state.vivos));
    }
    updateSeatPreview();
  };

  const normalizeText = (value) => {
    return value.trim().replace(/\s+/g, " ");
  };

  const updateVehicleState = (input) => {
    const field = input.dataset.vehicle;

    if (!field) {
      return;
    }

    if (field === "marca") {
      state.marca = normalizeText(input.value);
    }

    if (field === "modelo") {
      state.modelo = normalizeText(input.value);
    }

    if (field === "anio") {
      state.anio = input.value.trim();
    }

    if (field === "version") {
      state.version = normalizeText(input.value);
    }

    updateNavigationState();
  };

  const isVehicleValid = () => {
    const year = Number(state.anio);

    return Boolean(
      state.marca &&
      state.modelo &&
      Number.isInteger(year) &&
      year >= 1980 &&
      year <= 2030,
    );
  };

  const captureVehicleState = () => ({
    marca: state.marca,
    modelo: state.modelo,
    anio: state.anio,
    version: state.version,
  });

  const restoreVehicleStateBeforeEdit = () => {
    if (!vehicleStateBeforeEdit) {
      return;
    }

    Object.assign(state, vehicleStateBeforeEdit);

    vehicleInputs.forEach((input) => {
      const field = input.dataset.vehicle;

      if (field && field in vehicleStateBeforeEdit) {
        input.value = vehicleStateBeforeEdit[field];
      }
    });

    vehicleStateBeforeEdit = null;
  };

  const updateSummary = () => {
    if (summaryDesign) {
      const details = [
        labels.estilos[state.estilo] || state.estilo,
        labels.materiales[state.material] || state.material,
        `${labels.colores[state.colorPrincipal]} + ${labels.colores[state.colorLateral]} + ${labels.colores[state.colorCentro]}`,
        `Costura ${labels.colores[state.colorCostura]}`,
        labels.disenos[state.diseno] || state.diseno,
      ];

      if (state.bordado) {
        details.push("Bordado");
      }

      if (state.vivos) {
        details.push("Vivos");
      }

      summaryDesign.textContent = details.join(" · ");
    }

    if (summaryVehicle) {
      const vehicleParts = [state.marca, state.modelo, state.anio];

      if (state.version) {
        vehicleParts.push(state.version);
      }

      summaryVehicle.textContent = vehicleParts.join(" · ");
    }
  };

  const updateNavigationState = () => {
    if (previousButton) {
      previousButton.disabled = currentStepIndex === 0;
    }

    if (!nextButton) {
      return;
    }

    const stepName = steps[currentStepIndex]?.dataset.step;

    nextButton.hidden = false;

    if (whatsappButton) {
      whatsappButton.hidden = true;
    }

    if (stepName === "summary") {
      nextButton.hidden = true;

      if (whatsappButton) {
        whatsappButton.hidden = false;
      }

      return;
    }

    if (stepName === "style") {
      nextButton.disabled = !state.estilo;
      return;
    }

    if (stepName === "material") {
      nextButton.disabled = !state.material;
      return;
    }

    if (stepName === "colors") {
      nextButton.disabled = !(
        state.colorPrincipal &&
        state.colorLateral &&
        state.colorCentro &&
        state.colorCostura
      );
      return;
    }

    if (stepName === "details") {
      nextButton.disabled = !state.diseno;
      return;
    }

    if (stepName === "vehicle") {
      nextButton.disabled = !isVehicleValid();
      return;
    }

    if (stepName === "photos") {
      nextButton.disabled = false;
      return;
    }

    nextButton.disabled = true;
  };
  const progressLabels = {
    style: "Estilo",
    material: "Material",
    colors: "Colores",
    details: "Detalles",
    vehicle: "Tu auto",
    photos: "Fotos",
    summary: "Tu idea",
  };

  const updateStepProgress = (index) => {
    const currentStep = index + 1;
    const stepName = steps[index]?.dataset.step;
    const stepLabel = progressLabels[stepName] ?? "Etapa";

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", String(currentStep));
      progressBar.setAttribute(
        "aria-valuetext",
        `${stepLabel}, paso ${currentStep} de 7`,
      );
    }

    progressSegments.forEach((segment, segmentIndex) => {
      segment.classList.toggle("is-reached", segmentIndex <= index);
    });
  };

  const showStep = (index) => {
    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === index;

      step.hidden = !isActive;
      step.classList.toggle("is-active", isActive);
    });

    currentStepIndex = index;

    const stepName = steps[index]?.dataset.step;
    updateStepProgress(index);

    if (stepName === "summary") {
      updateSummary();
    }

    updateNavigationState();
  };

  const goToNextStep = () => {
    if (editingFromSummary) {
      const summaryIndex = steps.findIndex(
        (step) => step.dataset.step === "summary",
      );

      if (summaryIndex === -1) {
        return;
      }

      vehicleStateBeforeEdit = null;
      editingFromSummary = false;

      showStep(summaryIndex);

      if (nextButton) {
        nextButton.textContent = "Continuar";
      }

      return;
    }

    if (currentStepIndex >= steps.length - 1) {
      return;
    }

    showStep(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    if (editingFromSummary) {
      const summaryIndex = steps.findIndex(
        (step) => step.dataset.step === "summary",
      );

      if (summaryIndex === -1) {
        return;
      }

      restoreVehicleStateBeforeEdit();
      editingFromSummary = false;

      showStep(summaryIndex);

      if (nextButton) {
        nextButton.textContent = "Continuar";
      }

      return;
    }

    if (currentStepIndex <= 0) {
      return;
    }

    showStep(currentStepIndex - 1);
  };

  const goToNamedStep = (stepName) => {
    const targetIndex = steps.findIndex(
      (step) => step.dataset.step === stepName,
    );

    if (targetIndex === -1) {
      return;
    }

    vehicleStateBeforeEdit =
      stepName === "vehicle" ? captureVehicleState() : null;

    editingFromSummary = true;

    showStep(targetIndex);

    if (nextButton) {
      nextButton.textContent = "Guardar cambios";
    }
  };

  const WHATSAPP_NUMBER = "5491132016031";

  const buildWhatsAppMessage = () => {
    const messageLines = [
      "Hola, quiero solicitar un presupuesto.",
      "",
      "VEHÍCULO",
      `Marca: ${state.marca}`,
      `Modelo: ${state.modelo}`,
      `Año: ${state.anio}`,
    ];

    if (state.version) {
      messageLines.push(`Versión: ${state.version}`);
    }

    messageLines.push(
      "",
      "TRABAJO SOLICITADO",
      "Juego completo de asientos",
      "",
      "DISEÑO DE LAS FUNDAS",
      `Estilo: ${labels.estilos[state.estilo] || state.estilo}`,
      `Material: ${labels.materiales[state.material] || state.material}`,
      `Color principal: ${labels.colores[state.colorPrincipal] || state.colorPrincipal}`,
      `Color lateral: ${labels.colores[state.colorLateral] || state.colorLateral}`,
      `Color del centro: ${labels.colores[state.colorCentro] || state.colorCentro}`,
      `Costura: ${labels.colores[state.colorCostura] || state.colorCostura}`,
      `Diseño: ${labels.disenos[state.diseno] || state.diseno}`,
      `Bordado: ${state.bordado ? "Sí" : "No"}`,
      `Vivos: ${state.vivos ? "Sí" : "No"}`,
      "",
      "Adjunto las fotos del vehículo para que puedan evaluarlo.",
    );

    return messageLines.join("\n");
  };

  const openWhatsApp = () => {
    const message = buildWhatsAppMessage();

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  startButton.addEventListener("click", openConfiguratorIntro);

  introCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
      closeConfiguratorIntro();
    });
  });

  if (introConfirmButton) {
    introConfirmButton.addEventListener("click", confirmConfiguratorIntro);
  }

  if (introModal) {
    introModal.addEventListener("keydown", handleConfiguratorIntroKeydown);
  }

  if (seatZoomButton) {
    seatZoomButton.addEventListener("click", openSeatZoom);
  }

  seatZoomCloseControls.forEach((control) => {
    control.addEventListener("click", () => {
      closeSeatZoom();
    });
  });

  if (seatZoomModal) {
    seatZoomModal.addEventListener("keydown", handleSeatZoomKeydown);
  }

  if (seatZoomDialog) {
    seatZoomDialog.addEventListener("click", (event) => {
      if (event.target === seatZoomDialog) {
        closeSeatZoom();
      }
    });
  }

  if (exitButton) {
    exitButton.addEventListener("click", closeConfigurator);
  }

  styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectStyle(button);
      miniScrollAfterSelection(button);
    });
  });

  materialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectMaterial(button);
      miniScrollAfterSelection(button);
    });
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectColor(button);
      miniScrollAfterSelection(button);
    });
  });

  designButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectDesign(button);
      miniScrollAfterSelection(button);
    });
  });

  extraButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleExtra(button);
      miniScrollAfterSelection(button);
    });
  });

  vehicleInputs.forEach((input) => {
    input.addEventListener("input", () => {
      updateVehicleState(input);
    });
  });
  const versionInput = document.querySelector('[data-vehicle="version"]');

  if (versionInput) {
    versionInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();

      if (!isVehicleValid()) {
        return;
      }

      goToNextStep();
    });
  }

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const stepName = button.dataset.editStep;

      if (!stepName) {
        return;
      }

      goToNamedStep(stepName);
    });
  });

  if (whatsappButton) {
    whatsappButton.addEventListener("click", openWhatsApp);
  }
  if (nextButton) {
    nextButton.addEventListener("click", goToNextStep);
  }

  if (previousButton) {
    previousButton.addEventListener("click", goToPreviousStep);
  }

  showStep(0);
})();
