import type { Field, Layout, Stage, Viewport } from "@neon-spore/render";
import { type TimedCommand, ticksPerBeat, type World } from "@neon-spore/sim";
import { AutopilotGhosts, type Finger } from "./autopilot-ghost.js";
import { autopilotHand } from "./autopilot-hands.js";

/**
 * **AUTO: the machine plays a seat, live, while you play the other.**
 *
 * The owner, 25 September 2026: *I still have problems how to test my game
 * alone … when at the same time players need to press and pull at the same
 * time controls, e.g. THE FILAMENT.* `3` presses the marks a boss draws and
 * carries nothing on the field (`stage-cue-key.ts`), and one mouse is one
 * thumb. The director already had a hand that plays every boss right — the
 * poses reach each state with it (`boss-hands-*.ts`) — and only ever ran it
 * off screen, to stand a picture up. This runs the same hand on the stage's
 * own tick, at the stage's own tempo, for the seats this row names:
 *
 * - **OFF** — nothing, the default.
 * - **BOTH** — the hand plays the whole boss; watch it played right.
 * - **P1 / P2** — the hand plays that seat and you the other. Your mouse is
 *   taken off the autopilot's seat, so a press under TEST is always yours.
 *
 * What it sends is a device's commands on this tick, into the same `step` the
 * mouse's go through, so the simulation cannot tell the autopilot from a
 * thumb. Its finger is drawn over the field (`autopilot-ghost.ts`).
 */

export type AutoMode = "off" | "both" | "p1" | "p2";

export interface StageAutopilotDeps {
  /** The layout the stage's hit tests are answered in, read fresh. */
  layout: () => Layout;
  /** The field as a seat sees it — the same one the mouse is tested against. */
  field: (seat: 1 | 2) => Field;
}

export interface StageAutopilot {
  /** This tick's commands for the seats AUTO plays, stamped with the tick. */
  commands(w: World): TimedCommand[];
  /** The seats the mouse may speak for, less the ones AUTO is playing. */
  seats(mouse: readonly (1 | 2)[]): readonly (1 | 2)[];
  /** The fingers, over a frame the renderer has just drawn. */
  paint(canvas: HTMLCanvasElement, viewport: Viewport, stage: Stage, w: World): void;
  /** A fresh world: no finger is on anything. */
  reset(): void;
  mode(): AutoMode;
  /** What the row's buttons do, for whoever has no page to click. */
  setMode(m: AutoMode): void;
  /** Where each of AUTO's thumbs is, in layout pixels. */
  fingers(): readonly Finger[];
}

/** The phone's one button, one press a step. */
const CYCLE: readonly AutoMode[] = ["off", "both", "p1", "p2"];

const PLAYS: Record<AutoMode, readonly (1 | 2)[]> = { off: [], both: [1, 2], p1: [1], p2: [2] };

export function stageAutopilot(deps: StageAutopilotDeps, doc?: Document): StageAutopilot {
  let mode: AutoMode = "off";
  const ghosts = new AutopilotGhosts();

  const note = doc?.getElementById("autoNote") ?? null;
  const paintNote = (w: World | null): void => {
    if (!note) return;
    const none = mode !== "off" && w !== null && autopilotHand(w) === null;
    note.textContent = none ? (w?.boss ? "no hand for this boss" : "bosses only") : "";
  };

  const setMode = (m: AutoMode): void => {
    mode = m;
    ghosts.clear();
    // By mode, not by element: RUN's row and the phone's one button both say it.
    for (const b of doc?.querySelectorAll<HTMLElement>("button.auto") ?? []) {
      b.classList.toggle("on", b.dataset.auto === mode);
    }
    for (const b of doc?.querySelectorAll<HTMLElement>("button.auto-cycle") ?? []) {
      b.textContent = mode === "off" ? "AUTO" : `A:${mode.toUpperCase()}`;
      b.classList.toggle("on", mode !== "off");
    }
  };
  for (const b of doc?.querySelectorAll<HTMLElement>("button.auto") ?? []) {
    b.addEventListener("click", () => setMode((b.dataset.auto as AutoMode | undefined) ?? "off"));
  }
  for (const b of doc?.querySelectorAll<HTMLElement>("button.auto-cycle") ?? []) {
    b.addEventListener("click", () =>
      setMode(CYCLE[(CYCLE.indexOf(mode) + 1) % CYCLE.length] ?? "off"),
    );
  }

  return {
    mode: () => mode,
    setMode,
    fingers: () => ghosts.fingers(),
    commands(w) {
      const plays = PLAYS[mode];
      paintNote(w);
      if (plays.length === 0) return [];
      const hand = autopilotHand(w);
      if (!hand) return [];
      const sent = hand(w).filter((c) => plays.includes(c.player));
      ghosts.observe(deps.layout(), deps.field, w.tick, ticksPerBeat(w.cfg), sent);
      return sent.map((c) => ({ ...c, tick: w.tick }));
    },
    seats(mouse) {
      const plays = PLAYS[mode];
      const left = mouse.filter((s) => !plays.includes(s));
      // Both seats on the autopilot, or the view is the autopilot's own seat:
      // the mouse keeps what it had rather than going dead.
      return left.length > 0 ? left : mouse;
    },
    paint(canvas, viewport, stage, w) {
      if (mode === "off") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
      ctx.translate(stage.left, stage.top);
      ghosts.paint(ctx, deps.layout(), w.tick, ticksPerBeat(w.cfg));
      ctx.restore();
    },
    reset() {
      ghosts.clear();
    },
  };
}
