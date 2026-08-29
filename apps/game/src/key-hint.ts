/**
 * A player who sits down at a PC has no panel to read the keys off. The game
 * draws the same phone-shaped field it always has, and there is no room on it
 * for a legend beside the strips it would be labelling — and the pair is
 * usually already mid-wave when a PC player first shows up, so anything that
 * held the field up to explain itself would be worse than saying nothing.
 *
 * So this is a toast, not a panel: it names the keys once, over the field,
 * pointer-events off so it is never in the way of a click underneath it, and
 * gets out of its own way — on the first key pressed, or on a timer if none
 * ever is. It is shown only where a mouse is the input, gated on `pointer:
 * fine` — the same signal that tells a fine pointer from a finger everywhere
 * else in CSS — so the same code that drives a phone never puts a paragraph
 * of desk-only keys over someone's thumb.
 *
 * Its own file rather than a tail on `input.ts`: it is DOM decoration with no
 * part in the control scheme, and `input.ts` is already the file that carries
 * the scheme itself.
 *
 * Nothing here replaces a shipped look: nothing today draws this at all.
 */
export function showKeyHint(canvas: HTMLCanvasElement): void {
  if (typeof window.matchMedia !== "function" || !window.matchMedia("(pointer: fine)").matches) {
    return;
  }
  const hint = document.createElement("div");
  hint.textContent =
    "Keyboard — A/D move · Q/W/E fire · S intake · F lance · G grip" +
    "   Mouse — drag a strip, click a lobe";
  Object.assign(hint.style, {
    position: "fixed",
    left: "50%",
    top: "10px",
    transform: "translateX(-50%)",
    padding: "6px 14px",
    background: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    font: "12px monospace",
    whiteSpace: "pre",
    borderRadius: "4px",
    pointerEvents: "none",
    zIndex: "1000",
    transition: "opacity 0.8s",
    opacity: "1",
  });
  (canvas.parentElement ?? document.body).appendChild(hint);
  let dismissed = false;
  const dismiss = (): void => {
    if (dismissed) return;
    dismissed = true;
    hint.style.opacity = "0";
    setTimeout(() => hint.remove(), 800);
  };
  setTimeout(dismiss, 6000);
  window.addEventListener("keydown", dismiss, { once: true });
}
