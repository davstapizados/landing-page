const trustCards = document.querySelectorAll(".trust-card");

const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

trustCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!isMobile()) return;

    card.classList.toggle("is-flipped");
  });

  card.addEventListener("keydown", (event) => {
    if (!isMobile()) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.classList.toggle("is-flipped");
    }
  });
});
