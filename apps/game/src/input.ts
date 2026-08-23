import { colFromX, hitCircle, type Layout } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";

/**
 * Collects commands until the next tick consumes them. Later this is also where
 * the local timestamp is taken — the moment the screen is touched, never the
 * moment a packet arrives (docs/architecture.md, "Network").
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
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  /** Read fresh on every event — the layout changes when the screen does. */
  layout: () => Layout;
  isOver: () => boolean;
  onPauseToggle: () => void;
}

/**
 * Both players on one device — the test setup, not the finished game. The two
 * strips answer to separate pointers, so two thumbs on one phone already play
 * the real split: player 1 has the cannon and the trigger, player 2 has the
 * shield and the colours.
 */
export function bindControls({ canvas, buffer, layout, isOver, onPauseToggle }: Bindings): void {
  let cannonPointer: number | null = null;
  let shieldPointer: number | null = null;

  const down = (id: number, x: number, y: number): void => {
    if (isOver()) {
      buffer.push(1, { kind: "restart" });
      return;
    }
    const l = layout();
    if (y < l.bandTop) return;

    if (Math.abs(y - l.cannonStrip.y) <= l.cannonStrip.height * 0.75) {
      cannonPointer = id;
      buffer.push(1, { kind: "cannonCol", col: colFromX(l, x) });
      return;
    }
    if (Math.abs(y - l.shieldStrip.y) <= l.shieldStrip.height * 0.75) {
      shieldPointer = id;
      buffer.push(2, { kind: "shieldCol", col: colFromX(l, x) });
      return;
    }
    if (hitCircle(l.guardButton, x, y)) {
      buffer.push(1, { kind: "guard" });
      return;
    }
    for (const b of l.fireButtons) {
      if (hitCircle(b.circle, x, y)) {
        buffer.push(2, { kind: "fire", color: b.color });
        return;
      }
    }
  };

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    down(e.pointerId, e.clientX, e.clientY);
  });
  canvas.addEventListener("pointermove", (e) => {
    e.preventDefault();
    const l = layout();
    if (cannonPointer === e.pointerId)
      buffer.push(1, { kind: "cannonCol", col: colFromX(l, e.clientX) });
    if (shieldPointer === e.pointerId)
      buffer.push(2, { kind: "shieldCol", col: colFromX(l, e.clientX) });
  });
  const up = (e: PointerEvent): void => {
    if (cannonPointer === e.pointerId) cannonPointer = null;
    if (shieldPointer === e.pointerId) shieldPointer = null;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // Keyboard, for testing both roles alone at a desk.
  let cannon = -1;
  let shield = -1;
  const held = new Set<string>();
  window.addEventListener("keydown", (e) => {
    if (held.has(e.code)) return;
    held.add(e.code);
    const cols = layout().cols;
    if (cannon < 0) cannon = Math.floor(cols / 2);
    if (shield < 0) shield = Math.floor(cols / 2);
    switch (e.code) {
      case "KeyQ":
        cannon = Math.max(0, cannon - 1);
        buffer.push(1, { kind: "cannonCol", col: cannon });
        break;
      case "KeyE":
        cannon = Math.min(cols - 1, cannon + 1);
        buffer.push(1, { kind: "cannonCol", col: cannon });
        break;
      case "ArrowLeft":
        shield = Math.max(0, shield - 1);
        buffer.push(2, { kind: "shieldCol", col: shield });
        break;
      case "ArrowRight":
        shield = Math.min(cols - 1, shield + 1);
        buffer.push(2, { kind: "shieldCol", col: shield });
        break;
      case "Space":
        e.preventDefault();
        buffer.push(1, { kind: "guard" });
        break;
      case "Digit1":
        buffer.push(2, { kind: "fire", color: "red" });
        break;
      case "Digit2":
        buffer.push(2, { kind: "fire", color: "cyan" });
        break;
      case "KeyP":
        onPauseToggle();
        break;
      case "Enter":
        if (isOver()) buffer.push(1, { kind: "restart" });
        break;
    }
  });
  window.addEventListener("keyup", (e) => held.delete(e.code));
}
