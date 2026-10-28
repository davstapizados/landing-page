(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector("[data-site-menu-button]");
  const menu = document.querySelector("[data-site-menu]");

  if (!header || !menuButton || !menu) {
    return;
  }

  const setMenuOpen = (isOpen) => {
    menu.hidden = !isOpen;
    header.classList.toggle("is-menu-open", isOpen);

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú",
    );
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    setMenuOpen(!isOpen);
  });

  const desktopHoverQuery = window.matchMedia(
    "(min-width: 901px) and (hover: hover) and (pointer: fine)",
  );

  let hoverCloseTimer = null;

  const cancelHoverClose = () => {
    window.clearTimeout(hoverCloseTimer);
    hoverCloseTimer = null;
  };

  const openOnDesktopHover = () => {
    if (!desktopHoverQuery.matches) {
      return;
    }

    cancelHoverClose();
    setMenuOpen(true);
  };

  const scheduleHoverClose = () => {
    if (!desktopHoverQuery.matches) {
      return;
    }

    cancelHoverClose();

    hoverCloseTimer = window.setTimeout(() => {
      const pointerInside =
        menuButton.matches(":hover") || menu.matches(":hover");

      const focusInside =
        document.activeElement === menuButton ||
        menu.contains(document.activeElement);

      if (!pointerInside && !focusInside) {
        setMenuOpen(false);
      }
    }, 3000);
  };

  menuButton.addEventListener("mouseenter", openOnDesktopHover);
  menuButton.addEventListener("mouseleave", scheduleHoverClose);
  menuButton.addEventListener("focus", openOnDesktopHover);
  menuButton.addEventListener("blur", scheduleHoverClose);

  menu.addEventListener("mouseenter", openOnDesktopHover);
  menu.addEventListener("mouseleave", scheduleHoverClose);
  menu.addEventListener("focusin", openOnDesktopHover);
  menu.addEventListener("focusout", scheduleHoverClose);

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const wasOpen = menuButton.getAttribute("aria-expanded") === "true";

    setMenuOpen(false);

    if (wasOpen) {
      menuButton.focus();
    }
  });
})();
