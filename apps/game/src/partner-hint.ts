import { PARTNER_WORDS } from "@neon-spore/content";

/**
 * **A press on the other phone's control says whose it is, and to talk.**
 *
 * The owner, 19 October 2026: on the first rungs each phone draws the
 * partner's controls dead (`render/band-partner.ts`), and a player who presses
 * one is told it is the other player's job and that the two of them have to
 * coordinate. It sends nothing — the control is not this seat's, and the
 * simulation is never asked.
 *
 * A toast over the field, above the thumb that pressed, the way the desk's key
 * hint is (`key-hint.ts`): pointer-events off, so it is never in the way of
 * the next press, and gone by itself after a moment. One element, shown again
 * by every press, so a player tapping the grey buttons over and over is read
 * the same line rather than a stack of them.
 */
export class PartnerHint {
  private el: HTMLDivElement | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  /** Show the line for `seat`'s control, its bottom just above `clientY`. */
  show(seat: 1 | 2, clientY: number): void {
    const el = this.el ?? this.make();
    const words = PARTNER_WORDS[seat === 1 ? "p1" : "p2"];
    el.replaceChildren(strong(words.title), document.createTextNode(words.what));
    el.style.top = `max(12px, calc(${clientY}px - 56px))`;
    // On at once, under the thumb that asked; only the going is eased.
    el.style.transition = "none";
    el.style.opacity = "1";
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      el.style.transition = "opacity 0.4s";
      el.style.opacity = "0";
    }, 2600);
  }

  private make(): HTMLDivElement {
    const el = document.createElement("div");
    el.className = "partner-hint";
    Object.assign(el.style, {
      position: "fixed",
      left: "50%",
      transform: "translate(-50%, -100%)",
      width: "min(84vw, 340px)",
      padding: "10px 14px",
      background: "rgba(7, 4, 15, 0.92)",
      border: "1px solid #7A6FA8",
      borderRadius: "10px",
      color: "#fff",
      font: '14px/1.35 "Space Grotesk", sans-serif',
      textAlign: "center",
      pointerEvents: "none",
      // Under every full-screen sheet, as the key hint is.
      zIndex: "8",
      opacity: "0",
    });
    document.body.appendChild(el);
    this.el = el;
    return el;
  }
}

function strong(text: string): HTMLElement {
  const b = document.createElement("div");
  b.textContent = text;
  Object.assign(b.style, { font: '700 12px "Courier New", monospace', letterSpacing: "0.08em" });
  b.style.marginBottom = "4px";
  return b;
}
