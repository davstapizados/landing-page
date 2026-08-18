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

    asientos: true,
    piso: false,
    apoyabrazos: false,
    volante: false,

    marca: "",
    modelo: "",
    anio: "",
    version: "",
  };

  let currentStepIndex = 0;
  let editingFromSummary = false;

  const startButton = document.querySelector(
    '[data-action="start-configurator"]',
  );

  const configurator = document.querySelector("#configurador");

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
  const renewButtons = document.querySelectorAll("[data-renew]");
  const vehicleInputs = document.querySelectorAll("[data-vehicle]");
  const photoGuides = document.querySelectorAll("[data-photo-for]");
  const seatRender = document.querySelector("[data-seat-render]");
  const bordadoNote = document.querySelector("[data-bordado-note]");

  const summaryDesign = document.querySelector("[data-summary-design]");
  const summaryWork = document.querySelector("[data-summary-work]");
  const summaryVehicle = document.querySelector("[data-summary-vehicle]");
  const summaryPhotos = document.querySelector("[data-summary-photos]");
  const editButtons = document.querySelectorAll("[data-edit-step]");
  const configuratorProgress = document.querySelector(
    "[data-configurator-progress]",
  );
  const configuratorTitle = document.querySelector("[data-configurator-title]");

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

  const openConfigurator = () => {
    siteHeader.hidden = true;
    hero.hidden = true;
    otherServices.hidden = true;
    footer.hidden = true;

    configurator.hidden = false;

    updateRenewButtons();

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  const closeConfigurator = () => {
    configurator.hidden = true;

    siteHeader.hidden = false;
    hero.hidden = false;
    otherServices.hidden = false;
    footer.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
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

  const updateRenewButtons = () => {
    renewButtons.forEach((button) => {
      const renewType = button.dataset.renew;

      const isSelected =
        renewType === "asientos"
          ? state.asientos
          : renewType === "piso"
            ? state.piso
            : renewType === "apoyabrazos"
              ? state.apoyabrazos
              : renewType === "volante"
                ? state.volante
                : false;

      button.setAttribute("aria-pressed", String(isSelected));
    });
  };

  const toggleRenew = (button) => {
    const renewType = button.dataset.renew;

    if (!renewType) {
      return;
    }

    if (renewType === "asientos") {
      return;
    }

    if (renewType === "piso") {
      state.piso = !state.piso;
    }

    if (renewType === "apoyabrazos") {
      state.apoyabrazos = !state.apoyabrazos;
    }

    if (renewType === "volante") {
      state.volante = !state.volante;
    }

    updateRenewButtons();
    updateNavigationState();
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

  const isPhotoTypeSelected = (type) => {
    if (type === "asientos") {
      return state.asientos;
    }

    if (type === "piso") {
      return state.piso;
    }

    if (type === "apoyabrazos") {
      return state.apoyabrazos;
    }

    if (type === "volante") {
      return state.volante;
    }

    return false;
  };

  const updatePhotoGuides = () => {
    photoGuides.forEach((guide) => {
      const type = guide.dataset.photoFor;

      guide.hidden = !isPhotoTypeSelected(type);
    });
  };

  const buildWorkSummary = () => {
    const items = [];

    if (state.asientos) {
      items.push("Juego completo de asientos");
    }

    if (state.piso) {
      items.push("Piso");
    }

    if (state.apoyabrazos) {
      items.push("Apoyabrazos");
    }

    if (state.volante) {
      items.push("Volante");
    }

    return items.join(" · ");
  };

  const buildPhotoSummary = () => {
    const items = [];

    if (state.asientos) {
      items.push(
        "Butacas delanteras",
        "Asiento trasero",
        "Detalles particulares",
      );
    }

    if (state.piso) {
      items.push("Piso delantero", "Piso trasero");
    }

    if (state.apoyabrazos) {
      items.push("Apoyabrazos");
    }

    if (state.volante) {
      items.push("Volante completo", "Detalle del volante");
    }

    return items.join(" · ");
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

    if (summaryWork) {
      summaryWork.textContent = buildWorkSummary();
    }

    if (summaryVehicle) {
      const vehicleParts = [state.marca, state.modelo, state.anio];

      if (state.version) {
        vehicleParts.push(state.version);
      }

      summaryVehicle.textContent = vehicleParts.join(" · ");
    }

    if (summaryPhotos) {
      summaryPhotos.textContent = buildPhotoSummary();
    }
  };

  const updateNavigationState = () => {
    if (previousButton) {
      previousButton.disabled = currentStepIndex === 0;
    }

    if (!nextButton) {
      return;
    }

    nextButton.hidden = false;

    if (whatsappButton) {
      whatsappButton.hidden = true;
    }

    if (currentStepIndex === 0) {
      nextButton.disabled = !state.estilo;
      return;
    }

    if (currentStepIndex === 1) {
      nextButton.disabled = !state.material;
      return;
    }

    if (currentStepIndex === 2) {
      nextButton.disabled = !(
        state.colorPrincipal &&
        state.colorLateral &&
        state.colorCentro &&
        state.colorCostura
      );

      return;
    }

    if (currentStepIndex === 3) {
      nextButton.disabled = !state.diseno;
      return;
    }

    if (currentStepIndex === 4) {
      nextButton.disabled = !(
        state.asientos ||
        state.piso ||
        state.apoyabrazos ||
        state.volante
      );

      return;
    }

    if (currentStepIndex === 5) {
      nextButton.disabled = !isVehicleValid();
      return;
    }

    if (currentStepIndex === 6) {
      nextButton.disabled = false;
      return;
    }

    if (currentStepIndex === 7) {
      nextButton.hidden = true;

      if (whatsappButton) {
        whatsappButton.hidden = false;
      }

      return;
    }

    nextButton.disabled = true;
  };
  const updateConfiguratorHeader = (stepName) => {
    const headerMap = {
      style: {
        progress: "1 DE 5 · DISEÑO 1/4",
        title: "Creá tu idea",
      },

      material: {
        progress: "1 DE 5 · DISEÑO 2/4",
        title: "Creá tu idea",
      },

      colors: {
        progress: "1 DE 5 · DISEÑO 3/4",
        title: "Creá tu idea",
      },

      details: {
        progress: "1 DE 5 · DISEÑO 4/4",
        title: "Creá tu idea",
      },

      renew: {
        progress: "2 DE 5 · QUÉ RENOVAR",
        title: "Elegí qué renovar",
      },

      vehicle: {
        progress: "3 DE 5 · TU AUTO",
        title: "Tu auto",
      },

      photos: {
        progress: "4 DE 5 · FOTOS",
        title: "Prepará las fotos",
      },

      summary: {
        progress: "5 DE 5 · TU IDEA",
        title: "Tu idea",
      },
    };

    const header = headerMap[stepName];

    if (!header) {
      return;
    }

    if (configuratorProgress) {
      configuratorProgress.textContent = header.progress;
    }

    if (configuratorTitle) {
      configuratorTitle.textContent = header.title;
    }
  };

  const showStep = (index) => {
    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === index;

      step.hidden = !isActive;
      step.classList.toggle("is-active", isActive);
    });

    currentStepIndex = index;

    const stepName = steps[index]?.dataset.step;
    updateConfiguratorHeader(stepName);

    if (stepName === "photos") {
      updatePhotoGuides();
    }

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

    editingFromSummary = true;

    showStep(targetIndex);

    if (nextButton) {
      nextButton.textContent = "Guardar cambios";
    }
  };

  const WHATSAPP_NUMBER = "5491132016031";

  const buildWhatsAppMessage = () => {
    const trabajos = [];

    if (state.asientos) {
      trabajos.push("Juego completo de asientos");
    }

    if (state.piso) {
      trabajos.push("Piso");
    }

    if (state.apoyabrazos) {
      trabajos.push("Apoyabrazos");
    }

    if (state.volante) {
      trabajos.push("Volante");
    }

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
      ...trabajos,
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

  startButton.addEventListener("click", openConfigurator);

  if (exitButton) {
    exitButton.addEventListener("click", closeConfigurator);
  }

  styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectStyle(button);
    });
  });

  materialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectMaterial(button);
    });
  });

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectColor(button);
    });
  });

  designButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectDesign(button);
    });
  });

  extraButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleExtra(button);
    });
  });

  renewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleRenew(button);
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

  updateRenewButtons();
  showStep(0);
})();
