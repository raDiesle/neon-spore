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
  // A class as well as the inline styles, so `menu.css` can put it away while
  // a sheet is over the field — see below.
  hint.className = "key-hint";
  hint.textContent =
    "Keyboard — A/D move · Q/W/E fire · S intake · F lance · G grip\n" +
    "On a guide — hold F and G, one seat each, or Space for both" +
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
    // Under every full-screen sheet and over everything else. It was 1000,
    // which put a paragraph of desk-only keys across the top of the main menu
    // the moment the menu became the front door.
    zIndex: "8",
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
  /**
   * The six seconds start when the toast is actually on screen, not when it is
   * made. The menu is the front door now (`menu.ts`) and it covers this, so a
   * countdown begun at load would spend itself behind a sheet and the one
   * player who needs to be told the keys exist would never be told.
   */
  const armWhenSeen = (): void => {
    if (dismissed) return;
    if (hint.offsetParent === null) {
      requestAnimationFrame(armWhenSeen);
      return;
    }
    setTimeout(dismiss, 6000);
  };
  requestAnimationFrame(armWhenSeen);
  window.addEventListener("keydown", dismiss, { once: true });
}
