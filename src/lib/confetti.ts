import confetti from "canvas-confetti";

export function celebrate(intensity: "small" | "big" = "big") {
  const colors = ["#C6FF3D", "#FF5A5F", "#3DA9FF", "#FFD23F"];
  if (intensity === "small") {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors, scalar: 0.9 });
    return;
  }
  const end = Date.now() + 800;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 65, origin: { x: 0, y: 0.8 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 65, origin: { x: 1, y: 0.8 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
