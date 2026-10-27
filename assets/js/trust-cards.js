(() => {
  const cards = Array.from(document.querySelectorAll(".trust-card"));

  if (cards.length === 0) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 640px)");

  const setCardFlipped = (card, isFlipped) => {
    const title =
      card.querySelector("h3")?.textContent.replace(/\s+/g, " ").trim() ||
      "beneficio";

    card.classList.toggle("is-flipped", isFlipped);
    card.setAttribute("aria-expanded", String(isFlipped));

    card.setAttribute(
      "aria-label",
      isFlipped ? `Volver a ${title}` : `Ver detalle: ${title}`,
    );
  };

  const syncCard = (card) => {
    card.classList.remove("is-flipped");

    if (mobileQuery.matches) {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      setCardFlipped(card, false);
      return;
    }

    card.removeAttribute("role");
    card.removeAttribute("tabindex");
    card.removeAttribute("aria-expanded");
    card.removeAttribute("aria-label");
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!mobileQuery.matches) {
        return;
      }

      setCardFlipped(card, !card.classList.contains("is-flipped"));
    });

    card.addEventListener("keydown", (event) => {
      const validKey = event.key === "Enter" || event.key === " ";

      if (!mobileQuery.matches || !validKey) {
        return;
      }

      event.preventDefault();

      setCardFlipped(card, !card.classList.contains("is-flipped"));
    });

    syncCard(card);
  });

  const syncAllCards = () => {
    cards.forEach(syncCard);
  };

  mobileQuery.addEventListener?.("change", syncAllCards);
})();
