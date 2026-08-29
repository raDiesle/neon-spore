import type { ControlSet } from "@neon-spore/content";
import {
  type Field,
  type Hold,
  type Layout,
  type Stage,
  touchDown,
  touchMove,
  touchUp,
} from "@neon-spore/render";
import type { Command, Creature, MazeState, SimConfig } from "@neon-spore/sim";
import { showKeyHint } from "./key-hint.js";
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
  /** The numbers the hit test needs: a tether's row, a drum's width. */
  cfg: SimConfig;
  /**
   * THE MAZE, if it is the boss running. Read fresh and stated rather than
   * defaulted, for the reason `Field` gives: without it the handle on the
   * wheel's string is drawn and answers nothing.
   */
  maze: () => MazeState | null;
  /**
   * The panel this wave is played on, read fresh: a control the wave's set does
   * not name has no button and must not answer a thumb (`render/touch.ts`).
   */
  controls: () => ControlSet;
  /** The field, for hit-testing a finger against what is falling. */
  creatures: () => readonly Creature[];
  /** 0..1 within the beat, so a grab lands on the creature as drawn, not as
   * it stood on the last beat. */
  beatPhase: () => number;
  /**
   * Whether the guide is up — passed straight through to the keyboard rig,
   * which needs it to keep Space from skipping the introduction ahead of the
   * guide (`keys.ts`).
   */
  guideHolds: () => boolean;
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
  cfg,
  maze,
  controls,
  creatures,
  beatPhase,
  guideHolds,
  onPauseToggle,
  onWaveStep,
}: Bindings): () => void {
  /** Which finger is doing what. What each one *means* is `touch.ts`'s. */
  const holding = new Map<number, Hold>();
  const field = (): Field => ({
    creatures: creatures(),
    beatPhase: beatPhase(),
    seat: player(),
    cfg,
    maze: maze(),
    controls: controls(),
  });

  const down = (id: number, x: number, y: number): void => {
    if (isOver()) {
      buffer.push(1, { kind: "restart" });
      return;
    }
    const t = touchDown(layout(), x, y, field());
    if (!t) return;
    if (t.hold) holding.set(id, t.hold);
    buffer.push(t.player, t.command);
  };

  /**
   * Every hold this device is carrying, let go at once. A finger that leaves
   * the glass always fires `pointerup` — the OS delivers it to the page that
   * owns the touch. A mouse dragged off the *window* is not the same: once the
   * cursor is over another application (or another monitor with no browser
   * under it), this page stops receiving pointer events altogether, capture or
   * not, and a held cannon or a held lance would stay held forever. This is
   * the phone's `up`, called for every id still down, from whichever of the
   * two ways a PC actually loses a pointer this way (`window.blur` and the
   * pointer crossing the edge of the document) fires first.
   */
  const releaseAll = (): void => {
    for (const [id, hold] of holding) {
      holding.delete(id);
      const t = touchUp(hold, field());
      if (t) buffer.push(t.player, t.command);
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
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    const t = touchMove(layout(), hold, p.x);
    if (t) buffer.push(t.player, t.command);
  });
  const up = (e: PointerEvent): void => {
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    holding.delete(e.pointerId);
    const t = touchUp(hold, field());
    if (t) buffer.push(t.player, t.command);
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  // The window losing focus (alt-tab, a click on another application) and the
  // pointer crossing the outer edge of the document (dragged past the browser
  // chrome) are the two ways a held mouse button actually goes silent on a PC.
  // Neither can happen with a finger, which is why nothing above already
  // covers this.
  window.addEventListener("blur", releaseAll);
  document.documentElement.addEventListener("pointerleave", releaseAll);

  showKeyHint(canvas);

  /**
   * Keyboard, for playing both roles alone at a desk. A/D slide the cannon
   * *and* the shield together, W fires red and opens the guard window in one
   * press, Q fires red alone, E fires cyan, S opens the maw, F holds the
   * lance, so one hand drives a whole test run.
   * J/L still move the shield alone and I still guards on its own, for the
   * moments a test needs the two apart. The keys stay live in every view — the
   * view switch decides what is *shown*, not what a single tester can reach.
   * The arrows step between waves.
   *
   * `guard` is still player 1's command whichever key sends it: the trigger and
   * the shield being in different hands is the rule the whole defence rests on.
   */
  return bindKeys({ buffer, layout, isOver, creatures, guideHolds, onPauseToggle, onWaveStep });
}
