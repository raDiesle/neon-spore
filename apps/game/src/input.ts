import {
  colFromX,
  creatureAt,
  hitCircle,
  type Layout,
  type Stage,
  showsCannon,
  showsShield,
} from "@neon-spore/render";
import { type Command, type Creature, NO_GRIP } from "@neon-spore/sim";
import { bindKeys } from "./keys.js";

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
  /**
   * Which seat this device holds. The field belongs to both players, so a
   * finger on a creature has to be signed with whoever is sitting here — the
   * strips below can be told apart by where they are, and this cannot.
   */
  player: () => 1 | 2;
  /** The field, for hit-testing a finger against what is falling. */
  creatures: () => readonly Creature[];
  /** 0..1 within the beat, so a grab lands on the creature as drawn, not as
   * it stood on the last beat. */
  beatPhase: () => number;
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
  player,
  creatures,
  beatPhase,
  onPauseToggle,
  onWaveStep,
}: Bindings): () => void {
  let cannonPointer: number | null = null;
  let shieldPointer: number | null = null;
  /** The one finger that is on the field. One hand per player — see grip.ts. */
  let gripPointer: number | null = null;

  const down = (id: number, x: number, y: number): void => {
    if (isOver()) {
      buffer.push(1, { kind: "restart" });
      return;
    }
    const l = layout();
    // Above the band is the field, and the field answers both players: a
    // finger held on something falling drags at it (`grip` in sim/grip.ts).
    if (y < l.bandTop) {
      const held = creatureAt(l, creatures(), x, y, beatPhase());
      if (!held) return;
      gripPointer = id;
      buffer.push(player(), { kind: "grip", id: held.id });
      return;
    }

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
    // A grip lasts exactly as long as the finger does. Nothing decays it in
    // the simulation, so the lift has to be sent.
    if (gripPointer === e.pointerId) {
      gripPointer = null;
      buffer.push(player(), { kind: "grip", id: NO_GRIP });
    }
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  /**
   * Keyboard, for playing both roles alone at a desk. A/D slide the cannon
   * *and* the shield together, W fires red and opens the guard window in one
   * press, Q fires red alone, E fires cyan, S opens the maw, so one hand
   * drives a whole test run.
   * J/L still move the shield alone and I still guards on its own, for the
   * moments a test needs the two apart. The keys stay live in every view — the
   * view switch decides what is *shown*, not what a single tester can reach.
   * The arrows step between waves.
   *
   * `guard` is still player 1's command whichever key sends it: the trigger and
   * the shield being in different hands is the rule the whole defence rests on.
   */
  return bindKeys({ buffer, layout, isOver, creatures, onPauseToggle, onWaveStep });
}
