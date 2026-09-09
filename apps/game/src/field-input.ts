import { controlSetForWave } from "@neon-spore/content";
import type { Layout, ViewRole } from "@neon-spore/render";
import { briefingHolds, guideHolds, mazeRound, type World } from "@neon-spore/sim";
import { type BriefingBinding, bindBriefing } from "./briefing.js";
import { bindControls, type Controls, type InputBuffer } from "./input.js";
import { bindRounds } from "./rounds.js";
import type { RunState } from "./run-state.js";
import { bindShake } from "./shake.js";

/**
 * Everything a finger on the glass reaches: the field itself, a shake, the
 * guide's pages and a boss round's own buttons.
 *
 * They are one file because they are one knot — four listeners on one canvas,
 * every one of them asking the same four questions (which seat is this, where
 * is the stage, is a guide up, is a round on) and every one of them answering
 * into the same buffer. Wired in `main.ts` that knot was sixty lines of
 * argument objects between the parts being built and the loop being started,
 * and it put the file on its 250-line ceiling exactly, so the next binding
 * anybody added there broke the build. `shell.ts` is the precedent: everything
 * *around* the field is a knot with a name, and this is everything *on* it.
 *
 * The order is not arbitrary. `bindControls` captures the pointer on the
 * stage, so it goes on first and the three after it see what it did not take.
 */
export interface FieldInputOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  run: RunState;
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  role: () => ViewRole;
  beatPhase: () => number;
  jumpToWave: (wave: number) => void;
  /** The guide, played again from its first page — the renderer owns the
   * playback, so this file only says when. */
  replayGuide: () => void;
}

/** The keyboard's per-tick call and the two things a frame reads off a
 * pointer, plus the one way anything outside puts the guide away. */
export interface FieldInput extends Controls {
  dismissBriefing: BriefingBinding["dismiss"];
}

export function bindFieldInput(o: FieldInputOptions): FieldInput {
  const { canvas, buffer, world, run, layout, inStage, role, beatPhase } = o;
  const controls = bindControls({
    canvas,
    buffer,
    layout,
    inStage,
    isOver: () => world.over,
    // The seat decides whose hand a finger on the field is. `test` is both
    // halves on one screen, so it grips as player 1 and G grips as player 2.
    player: () => (role() === "p2" ? 2 : 1),
    cfg: world.cfg,
    // THE MAZE's string is answered on the field like any other handle, so the
    // hit test has to know whether a wheel is up (`render/touch.ts`).
    maze: () => mazeRound(world),
    // And THE WARDEN's rope, for the same reason: its handle is a control drawn
    // on the field, and a hit test that did not know the boss was up would leave
    // the pilot pressing something that answers nothing.
    warden: () => (world.boss?.kind === "warden" ? world.boss : null),
    // Which panel is up follows from the wave (`content/control-sets.ts`).
    controls: () => controlSetForWave(world.wave),
    malfunction: () => world.malfunction,
    creatures: () => world.creatures,
    // The ship answers a finger where it is drawn, not only on the strips below.
    cannonCol: () => world.cannonCol,
    shieldCol: () => world.shieldCol,
    opening: () => briefingHolds(world),
    beatPhase,
    beat: () => world.beat,
    // Space at the keyboard must not be able to do what a tap on the field
    // already can't: put the introduction away before its timer does. See the
    // guard in `keys.ts`.
    guideHolds: () => guideHolds(world),
    onPauseToggle: () => run.hold("hand", !run.held("hand")),
    onWaveStep: (delta) => o.jumpToWave(world.wave + delta),
    onGuideReplay: o.replayGuide,
  });

  // THE CHOIR's own control, and the only input in the game that is not a
  // finger on the glass. It is bound unconditionally and never behind a
  // capability check — there is no reliable way to ask a browser whether a
  // shake can be reported, so the game offers this *and* the two arrows on the
  // field and lets the pilot use whichever their phone answers (`shake.ts`).
  bindShake(buffer);

  const brief = bindBriefing({
    canvas,
    buffer,
    world,
    layout,
    inStage,
    role,
    replay: o.replayGuide,
  });
  // Every round that is not the field brings its own buttons, on its own
  // listener — neither player's band is the answer (`rounds.ts`).
  bindRounds({ canvas, buffer, world, layout, inStage, role });

  return { ...controls, dismissBriefing: brief.dismiss };
}
