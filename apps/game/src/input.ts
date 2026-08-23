import type { Color, Command } from "@neon-spore/sim";

/**
 * Collects commands until the next tick consumes them. Later this is also where
 * the local timestamp is taken — the moment the screen is touched, never the
 * moment a packet arrives (docs/spec/network.md).
 */
export class InputBuffer {
  private pending: { player: 1 | 2; command: Command }[] = [];

  push(player: 1 | 2, command: Command): void {
    this.pending.push({ player, command });
  }

  drain(tick: number): { tick: number; player: 1 | 2; command: Command }[] {
    const out = this.pending.map((p) => ({ tick, player: p.player, command: p.command }));
    this.pending.length = 0;
    return out;
  }
}

export interface Bindings {
  cols: number;
  buffer: InputBuffer;
}

/** Both players on one device — the test setup, not the finished game. */
export function bindControls({ cols, buffer }: Bindings): void {
  const strip = (id: string, player: 1 | 2, kind: "cannonCol" | "shieldCol"): void => {
    const el = document.getElementById(id);
    if (!el) return;
    const toCol = (clientX: number): number => {
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(cols - 1, Math.floor(((clientX - r.left) / r.width) * cols)));
    };
    let dragging = false;
    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      buffer.push(player, { kind, col: toCol(e.clientX) });
    });
    el.addEventListener("pointermove", (e) => {
      if (dragging) buffer.push(player, { kind, col: toCol(e.clientX) });
    });
    el.addEventListener("pointerup", () => (dragging = false));
    el.addEventListener("pointercancel", () => (dragging = false));
  };

  strip("cannonStrip", 1, "cannonCol");
  strip("shieldStrip", 2, "shieldCol");

  document.getElementById("guard")?.addEventListener("click", () => buffer.push(1, { kind: "guard" }));
  const fire = (color: Color) => () => buffer.push(2, { kind: "fire", color });
  document.getElementById("fireRed")?.addEventListener("click", fire("red"));
  document.getElementById("fireCyan")?.addEventListener("click", fire("cyan"));

  // Keyboard, for testing both roles alone at a desk.
  let cannon = Math.floor(cols / 2);
  let shield = Math.floor(cols / 2);
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "q": buffer.push(1, { kind: "cannonCol", col: (cannon = Math.max(0, cannon - 1)) }); break;
      case "e": buffer.push(1, { kind: "cannonCol", col: (cannon = Math.min(cols - 1, cannon + 1)) }); break;
      case "ArrowLeft": buffer.push(2, { kind: "shieldCol", col: (shield = Math.max(0, shield - 1)) }); break;
      case "ArrowRight": buffer.push(2, { kind: "shieldCol", col: (shield = Math.min(cols - 1, shield + 1)) }); break;
      case " ": buffer.push(1, { kind: "guard" }); break;
      case "1": buffer.push(2, { kind: "fire", color: "red" }); break;
      case "2": buffer.push(2, { kind: "fire", color: "cyan" }); break;
    }
  });
}
