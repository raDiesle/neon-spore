import {
  colFromX,
  hitCircle,
  type Layout,
  type Stage,
  showsCannon,
  showsShield,
} from "@neon-spore/render";
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
  /** The phone-shaped rectangle the game is drawn into. Touches are relative to it. */
  stage: () => Stage;
  isOver: () => boolean;
  onPauseToggle: () => void;
  /** Wave step, for the test keys. Positive is forwards. */
  onWaveStep: (delta: number) => void;
}

/**
 * Both players on one device — the test setup, not the finished game. The two
 * strips answer to separate pointers, so two thumbs on one phone already play
 * the real split: player 1 has the cannon and the trigger, player 2 has the
 * shield and the colours.
 */
export function bindControls({
  canvas,
  buffer,
  layout,
  stage,
  isOver,
  onPauseToggle,
  onWaveStep,
}: Bindings): () => void {
  let cannonPointer: number | null = null;
  let shieldPointer: number | null = null;

  const down = (id: number, x: number, y: number): void => {
    if (isOver()) {
      buffer.push(1, { kind: "restart" });
      return;
    }
    const l = layout();
    if (y < l.bandTop) return;

    if (showsCannon(l.role)) {
      if (Math.abs(y - l.cannonStrip.y) <= l.cannonStrip.height * 0.75) {
        cannonPointer = id;
        buffer.push(1, { kind: "cannonCol", col: colFromX(l, x) });
        return;
      }
      if (hitCircle(l.guardButton, x, y)) {
        buffer.push(1, { kind: "guard" });
        return;
      }
      if (hitCircle(l.intakeButton, x, y)) {
        buffer.push(1, { kind: "intake" });
        return;
      }
    }
    if (showsShield(l.role)) {
      if (Math.abs(y - l.shieldStrip.y) <= l.shieldStrip.height * 0.75) {
        shieldPointer = id;
        buffer.push(2, { kind: "shieldCol", col: colFromX(l, x) });
        return;
      }
      for (const b of l.fireButtons) {
        if (hitCircle(b.circle, x, y)) {
          buffer.push(2, { kind: "fire", color: b.color });
          return;
        }
      }
    }
  };

  /**
   * Screen to stage. The game is drawn into a phone-shaped rectangle, so on a
   * wide window a touch is offset by the same amount the picture is — and a
   * touch beside the rectangle belongs to nothing.
   */
  const inStage = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const p = inStage(e);
    if (!p) return;
    canvas.setPointerCapture(e.pointerId);
    down(e.pointerId, p.x, p.y);
  });
  canvas.addEventListener("pointermove", (e) => {
    e.preventDefault();
    const p = inStage(e);
    if (!p) return;
    const l = layout();
    if (cannonPointer === e.pointerId) buffer.push(1, { kind: "cannonCol", col: colFromX(l, p.x) });
    if (shieldPointer === e.pointerId) buffer.push(2, { kind: "shieldCol", col: colFromX(l, p.x) });
  });
  const up = (e: PointerEvent): void => {
    if (cannonPointer === e.pointerId) cannonPointer = null;
    if (shieldPointer === e.pointerId) shieldPointer = null;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  /**
   * Keyboard, for playing both roles alone at a desk. A/D slide the cannon
   * *and* the shield together, W fires red and opens the guard window in one
   * press, E fires cyan, S opens the maw, so one hand drives a whole test run.
   * J/L still move the shield alone and I still guards on its own, for the
   * moments a test needs the two apart. The keys stay live in every view — the
   * view switch decides what is *shown*, not what a single tester can reach.
   * The arrows step between waves.
   *
   * `guard` is still player 1's command whichever key sends it: the trigger and
   * the shield being in different hands is the rule the whole defence rests on.
   */
  return bindKeys({ buffer, layout, isOver, onPauseToggle, onWaveStep });
}

interface KeyBindings {
  buffer: InputBuffer;
  layout: () => Layout;
  isOver: () => boolean;
  onPauseToggle: () => void;
  onWaveStep: (delta: number) => void;
}

/** Ticks (at `cfg.tickHz`, currently 120) before a held move key starts repeating. */
const KEY_REPEAT_DELAY_TICKS = 24;
/** Ticks between repeats once a held move key is repeating. */
const KEY_REPEAT_INTERVAL_TICKS = 8;

/**
 * A/D slide the cannon *and* the shield together, J/L move the shield alone.
 * Holding any of them keeps sliding: one step on keydown, then steps on a
 * repeat timer driven by `tick()` — the sim tick, not wall-clock time, so a
 * held key is exactly as reproducible as everything else in `sim`.
 */
function bindKeys({ buffer, layout, isOver, onPauseToggle, onWaveStep }: KeyBindings): () => void {
  let cannon = -1;
  let shield = -1;
  const held = new Set<string>();
  const repeatTicks = new Map<string, number>();

  const moveCannon = (delta: number): void => {
    const cols = layout().cols;
    cannon = Math.min(cols - 1, Math.max(0, cannon + delta));
    buffer.push(1, { kind: "cannonCol", col: cannon });
  };
  const moveShield = (delta: number): void => {
    const cols = layout().cols;
    shield = Math.min(cols - 1, Math.max(0, shield + delta));
    buffer.push(2, { kind: "shieldCol", col: shield });
  };
  const moveKeys: Record<string, () => void> = {
    KeyA: () => {
      moveCannon(-1);
      moveShield(-1);
    },
    KeyD: () => {
      moveCannon(1);
      moveShield(1);
    },
    KeyJ: () => moveShield(-1),
    KeyL: () => moveShield(1),
  };

  window.addEventListener("keydown", (e) => {
    if (held.has(e.code)) return;
    held.add(e.code);
    const cols = layout().cols;
    if (cannon < 0) cannon = Math.floor(cols / 2);
    if (shield < 0) shield = Math.floor(cols / 2);

    const moveKey = moveKeys[e.code];
    if (moveKey) {
      moveKey();
      repeatTicks.set(e.code, KEY_REPEAT_DELAY_TICKS);
      return;
    }
    switch (e.code) {
      case "KeyI":
        buffer.push(1, { kind: "guard" });
        break;
      case "KeyS":
        buffer.push(1, { kind: "intake" });
        break;
      case "KeyW":
        buffer.push(2, { kind: "fire", color: "red" });
        buffer.push(1, { kind: "guard" });
        break;
      case "KeyE":
        buffer.push(2, { kind: "fire", color: "cyan" });
        break;
      case "ArrowRight":
        e.preventDefault();
        onWaveStep(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        onWaveStep(-1);
        break;
      case "KeyP":
        onPauseToggle();
        break;
      case "Enter":
        if (isOver()) buffer.push(1, { kind: "restart" });
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    repeatTicks.delete(e.code);
  });

  /** Called once per sim tick to advance held-key repeats. */
  return function tick(): void {
    for (const [code, remaining] of repeatTicks) {
      if (remaining > 1) {
        repeatTicks.set(code, remaining - 1);
        continue;
      }
      moveKeys[code]?.();
      repeatTicks.set(code, KEY_REPEAT_INTERVAL_TICKS);
    }
  };
}
