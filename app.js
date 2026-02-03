const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    button.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(0.97)", opacity: 0.8 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 220, easing: "ease-out" }
    );
  });
});
