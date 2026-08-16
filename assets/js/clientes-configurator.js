"use strict";

(() => {
  /* =======================================================
     ESTADO TEMPORAL
  ======================================================= */

  const state = {
    estilo: null,
    material: null,

    colorPrincipal: null,
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

  /* =======================================================
     ELEMENTOS
  ======================================================= */

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

  const bordadoNote = document.querySelector("[data-bordado-note]");

  if (!startButton || !configurator) {
    return;
  }

  /* =======================================================
     ABRIR / CERRAR
  ======================================================= */

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

  /* =======================================================
     ESTILO
  ======================================================= */

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

  /* =======================================================
     MATERIAL
  ======================================================= */

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

    updateNavigationState();
  };

  /* =======================================================
     COLORES
  ======================================================= */

  const selectColor = (button) => {
    const group = button.dataset.colorGroup;
    const color = button.dataset.color;

    if (!group || !color) {
      return;
    }

    if (group === "principal") {
      state.colorPrincipal = color;
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

    updateNavigationState();
  };

  /* =======================================================
     DISEÑO
  ======================================================= */

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

    updateNavigationState();
  };

  /* =======================================================
     DETALLES OPCIONALES
  ======================================================= */

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
  };

  /* =======================================================
     QUÉ RENOVAR
  ======================================================= */

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

  /* =======================================================
     VEHÍCULO
  ======================================================= */

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

  /* =======================================================
     FOTOS
  ======================================================= */

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

  /* =======================================================
     NAVEGACIÓN
  ======================================================= */

  const updateNavigationState = () => {
    if (previousButton) {
      previousButton.disabled = currentStepIndex === 0;
    }

    if (!nextButton) {
      return;
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

    nextButton.disabled = true;
  };

  const showStep = (index) => {
    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === index;

      step.hidden = !isActive;
      step.classList.toggle("is-active", isActive);
    });

    currentStepIndex = index;

    if (steps[index]?.dataset.step === "photos") {
      updatePhotoGuides();
    }

    updateNavigationState();
  };

  const goToNextStep = () => {
    if (currentStepIndex >= steps.length - 1) {
      return;
    }

    showStep(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    if (currentStepIndex <= 0) {
      return;
    }

    showStep(currentStepIndex - 1);
  };

  /* =======================================================
     EVENTOS
  ======================================================= */

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

  if (nextButton) {
    nextButton.addEventListener("click", goToNextStep);
  }

  if (previousButton) {
    previousButton.addEventListener("click", goToPreviousStep);
  }

  /* =======================================================
     ESTADO INICIAL
  ======================================================= */

  updateRenewButtons();
  showStep(0);
})();
