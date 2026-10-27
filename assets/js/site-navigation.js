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
