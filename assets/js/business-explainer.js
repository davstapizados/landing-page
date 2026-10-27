(() => {
  const openButton = document.querySelector("[data-explainer-open]");
  const explainer = document.querySelector("[data-business-explainer]");
  const dialog = explainer?.querySelector("[data-explainer-dialog]");
  const closeButtons = explainer?.querySelectorAll("[data-explainer-close]");
  const scenes = Array.from(
    explainer?.querySelectorAll("[data-explainer-scene]") || [],
  );
  const previousButton = explainer?.querySelector("[data-explainer-previous]");
  const nextButton = explainer?.querySelector("[data-explainer-next]");
  const toggleButton = explainer?.querySelector("[data-explainer-toggle]");
  const progress = explainer?.querySelector("[data-explainer-progress]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!openButton || !explainer || !dialog || scenes.length === 0) {
    return;
  }

  const SCENE_DURATION = 6000;

  let activeIndex = 0;
  let sceneTimer = null;
  let isPlaying = false;
  let previousFocus = null;

  const clearSceneTimer = () => {
    window.clearTimeout(sceneTimer);
    sceneTimer = null;
  };

  const showScene = (nextIndex) => {
    activeIndex = (nextIndex + scenes.length) % scenes.length;

    scenes.forEach((scene, index) => {
      const isActive = index === activeIndex;

      scene.hidden = !isActive;
      scene.classList.toggle("is-active", isActive);
    });

    if (progress) {
      progress.style.width = `${((activeIndex + 1) / scenes.length) * 100}%`;
    }
  };

  const stopPlayback = () => {
    clearSceneTimer();
    isPlaying = false;

    if (toggleButton) {
      toggleButton.textContent = "Reproducir";
    }
  };

  const scheduleNextScene = () => {
    clearSceneTimer();

    if (!isPlaying) {
      return;
    }

    sceneTimer = window.setTimeout(() => {
      if (activeIndex >= scenes.length - 1) {
        stopPlayback();
        return;
      }

      showScene(activeIndex + 1);
      scheduleNextScene();
    }, SCENE_DURATION);
  };

  const startPlayback = () => {
    if (activeIndex >= scenes.length - 1) {
      showScene(0);
    }

    isPlaying = true;

    if (toggleButton) {
      toggleButton.textContent = "Pausar";
    }

    scheduleNextScene();
  };

  const openExplainer = () => {
    previousFocus = document.activeElement;

    explainer.hidden = false;
    document.body.classList.add("is-explainer-open");

    showScene(0);
    dialog.focus();

    if (reducedMotion.matches) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const closeExplainer = () => {
    stopPlayback();

    explainer.hidden = true;
    document.body.classList.remove("is-explainer-open");

    previousFocus?.focus();
  };

  openButton.addEventListener("click", openExplainer);

  closeButtons?.forEach((button) => {
    button.addEventListener("click", closeExplainer);
  });

  previousButton?.addEventListener("click", () => {
    showScene(activeIndex - 1);

    if (isPlaying) {
      scheduleNextScene();
    }
  });

  nextButton?.addEventListener("click", () => {
    showScene(activeIndex + 1);

    if (isPlaying) {
      scheduleNextScene();
    }
  });

  toggleButton?.addEventListener("click", () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (explainer.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeExplainer();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      dialog.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    );

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
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" && !explainer.hidden) {
      stopPlayback();
    }
  });

  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches) {
      stopPlayback();
    }
  });

  showScene(0);
})();
