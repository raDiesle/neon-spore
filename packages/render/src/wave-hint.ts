import {
  type ControlSet,
  controlSetForWave,
  type SceneAnchor,
  type SceneStep,
  WAVES,
  type WaveHintsId,
} from "@neon-spore/content";
import { type Creature, OPENING_PLAY, type World } from "@neon-spore/sim";
import { GUIDE_LOOK } from "./guide-look.js";
import { captionBox } from "./guide-tide-caption-box.js";
import { CORNER } from "./guide-tide-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatOf, type ViewRole } from "./view-role.js";

/**
 * **A wave's tutorial, played on the field rather than in front of it.**
 *
 * The owner, 19 October 2026: *replace tutorial mode before wave starts in a
 * way that it is giving hints during gameplay of the related wave but players
 * can interact already (so it is not a separate step) — right now it is
 * unclear for players that it is tutorial.* A wave that names `Wave.hints`
 * opens on its introduction and is played at once, and this is what its field
 * says while it is.
 *
 * **The words are the film's.** A hint is drawn by the caption a page of film
 * is drawn by (`guide-tide-caption.ts`) — the amber plate, the turning ring
 * round its subject and the leader between them — so what a pair learnt to
 * read as *the tutorial talking* is the same thing on the live field. Two
 * things change, and both because the field is being played: nothing is
 * dimmed round the subject (`live`), and the plate wears a TUTORIAL tab, which
 * is the band across the top of a film page said where the eye already is.
 *
 * **One hint per screen, on the seat it is for.** Each reading says what both
 * seats are told and which of them acts now; a phone shows its own seat's,
 * and `test` — both halves on one screen — shows the one who acts.
 *
 * **A reading of `World` and nothing else**, `boss-cue.ts`'s rule: nothing in
 * `packages/sim`, `hashWorld` or the wire. What the pair has done is read off
 * the world too — `spawned` less what is still standing is what they have
 * cleared on this try, and a try begun again puts it back to nought
 * (`sim/wave-start.ts`), so a pair who lost the wave is taught it again.
 */

/** How many bodies the pair clears before the field stops saying how. */
export const HINTS_UNTIL = 3;

/** One thing a seat is told, beside the thing it is about. */
export interface WaveHint {
  seat: 1 | 2;
  /** Whether this seat's thumb is the one wanted now. */
  acts: boolean;
  /** At most 28 characters, the film's own limit. */
  text: string;
  anchor: SceneAnchor;
}

/** Whether a hinted wave is still teaching: in play, no boss, not yet learnt. */
export function hinting(world: World): boolean {
  if (WAVES[world.wave]?.hints === undefined) return false;
  if (world.brief.phase !== OPENING_PLAY || world.boss !== null || world.over) return false;
  return world.spawned - world.creatures.length < HINTS_UNTIL;
}

/** What both seats are told right now, or nothing. */
export function waveHints(world: World): readonly WaveHint[] {
  const id = WAVES[world.wave]?.hints;
  if (id === undefined || !hinting(world)) return [];
  return READINGS[id](world);
}

/** The hint this screen shows, or nothing. */
export function waveHint(world: World, role: ViewRole): WaveHint | null {
  const hints = waveHints(world);
  if (role === "test") return hints.find((h) => h.acts) ?? null;
  return hints.find((h) => h.seat === seatOf(role)) ?? null;
}

const READINGS: Record<WaveHintsId, (world: World) => readonly WaveHint[]> = {
  firstStep: firstStepHints,
};

const CANNON: SceneAnchor = { at: "ship", control: "cannon" };

/**
 * FIRST STEP: a column and a colour, one per person — the lesson its film
 * taught, on the real enemy.
 *
 * The body it is about is **the lowest one**, the next to reach the hull,
 * because that is the one a mistake is made on. While the cannon is not under
 * it, player 1 is told to move it and player 2 to wait; once it is, player 2
 * is told to fire and player 1 to say so, out loud. Talking is the control
 * scheme, and the first thing the game teaches is that one of them has to
 * tell the other.
 *
 * Both of player 1's hints stand on the cannon, and the film's companion ring
 * comes up round the body over it the moment there is one
 * (`guide-tide-companion.ts`) — so *under* is shown as well as said.
 */
function firstStepHints(world: World): readonly WaveHint[] {
  const body = lowest(world);
  if (body === null) return [];
  if (world.cannonCol !== body.col) {
    return [
      { seat: 1, acts: true, text: "MOVE CANNON UNDER ENEMY", anchor: CANNON },
      { seat: 2, acts: false, text: "WAIT FOR THE CANNON", anchor: CANNON },
    ];
  }
  return [
    { seat: 2, acts: true, text: "FIRE RED NOW", anchor: { at: "control", control: "fireRed" } },
    { seat: 1, acts: false, text: "TELL PLAYER 2: FIRE!", anchor: CANNON },
  ];
}

/** The body nearest the hull, or nothing on an empty field. */
function lowest(world: World): Creature | null {
  let low: Creature | null = null;
  for (const c of world.creatures) {
    if (!low || c.row > low.row) low = c;
  }
  return low;
}

const TAB_FONT = '700 10px "Courier New",monospace';
const TAB_H = 15;
const TAB_PAD = 7;

/**
 * This screen's hint, drawn. `set` is the panel this frame draws, so a caption
 * on a button finds the button actually there (`ViewState.controls`).
 */
export function drawWaveHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  set: ControlSet = controlSetForWave(world.wave),
): void {
  const hint = waveHint(world, l.role);
  if (hint === null) return;
  // A page that opened long ago: the film's fade-in is a page arriving, and a
  // hint is not a page — it is the field's state, said while it holds.
  const step: SceneStep = { tick: 0, seat: hint.seat, text: hint.text, anchor: hint.anchor };
  GUIDE_LOOK.caption(ctx, l, world, set, step, world.tick, beatPhase, undefined, undefined, true);
  const box = captionBox(ctx, l, world, set, step, beatPhase);
  if (box !== null) tab(ctx, box.x, box.y);
}

/** TUTORIAL, on a tab standing on the plate's top edge at its left. */
function tab(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.font = TAB_FONT;
  const w = ctx.measureText("TUTORIAL").width + TAB_PAD * 2;
  const top = y - TAB_H + 3;
  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.roundRect(x + CORNER, top, w, TAB_H, [4, 4, 0, 0]);
  ctx.fill();
  ctx.fillStyle = "rgba(7,5,18,.97)";
  ctx.textBaseline = "middle";
  ctx.fillText("TUTORIAL", x + CORNER + TAB_PAD, top + TAB_H / 2 + 1);
  ctx.textBaseline = "alphabetic";
}
