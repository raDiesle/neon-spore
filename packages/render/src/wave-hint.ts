import {
  type ControlSet,
  controlSetForWave,
  type HintLine,
  type HintWhen,
  type SceneStep,
  WAVE_HINTS,
  WAVES,
} from "@neon-spore/content";
import { type Creature, OPENING_PLAY, type World } from "@neon-spore/sim";
import { anchorPoint } from "./caption-anchor.js";
import { GUIDE_LOOK } from "./guide-look.js";
import { captionBox } from "./guide-tide-caption-box.js";
import { CORNER } from "./guide-tide-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatOf } from "./view-role.js";

/**
 * **A wave's tutorial, played on the field rather than in front of it.**
 *
 * The owner, 19 October 2026: *replace tutorial mode before wave starts in a
 * way that it is giving hints during gameplay of the related wave but players
 * can interact already (so it is not a separate step) — right now it is
 * unclear for players that it is tutorial.* A wave that names `Wave.hints`
 * opens on its introduction and is played at once, and this is what its field
 * says while it is. The lines are data (`content/src/hints/`); this reads the
 * world to say which of them is true now.
 *
 * **The words are the film's.** A hint is drawn by the caption a page of film
 * is drawn by (`guide-tide-caption.ts`) — the amber plate, the turning ring
 * round its subject and the leader between them — so what a pair learnt to
 * read as *the tutorial talking* is the same thing on the live field. Two
 * things change, and both because the field is being played: nothing is
 * dimmed round the subject (`live`), and the plate wears a TUTORIAL tab, which
 * is the band across the top of a film page said where the eye already is.
 *
 * **One line per screen, on the seat it is for**: the first of that seat's
 * lines that holds now and whose subject this screen can find. `test` — both
 * halves on one screen — shows the first acting line instead.
 *
 * **A reading of `World` and nothing else**, `boss-cue.ts`'s rule: nothing in
 * `packages/sim`, `hashWorld` or the wire. What the pair has done is read off
 * the world too — `spawned` less what is still standing is what has left the
 * field on this try, shot, warded or taken, and a try begun again puts it back
 * to nought (`sim/wave-start.ts`), so a pair who lost the wave is taught it
 * again.
 */

/**
 * How many bodies leave the field before it stops saying how. One — the
 * owner, 19 October 2026: *one enemy is enough*.
 */
export const HINTS_UNTIL = 1;

/** Whether a hinted wave is still teaching: in play, no boss, not yet learnt. */
export function hinting(world: World): boolean {
  if (WAVES[world.wave]?.hints === undefined) return false;
  if (world.brief.phase !== OPENING_PLAY || world.boss !== null || world.over) return false;
  return world.spawned - world.creatures.length < HINTS_UNTIL;
}

/** Every line of this wave's that holds now, in its authored order. */
export function waveHintsNow(world: World): readonly HintLine[] {
  const id = WAVES[world.wave]?.hints;
  if (id === undefined || !hinting(world)) return [];
  const next = lowest(world);
  if (next === null) return [];
  return WAVE_HINTS[id].filter((h) => holds(h.when ?? "always", world, next));
}

/** The line this screen shows, or nothing. */
export function waveHint(
  l: Layout,
  world: World,
  beatPhase: number,
  set: ControlSet = controlSetForWave(world.wave),
): HintLine | null {
  const found = (h: HintLine) => anchorPoint(l, world, set, h.anchor, beatPhase) !== null;
  for (const h of waveHintsNow(world)) {
    const mine = l.role === "test" ? h.acts !== false : h.seat === seatOf(l.role);
    if (mine && found(h)) return h;
  }
  return null;
}

const WHEN: Record<HintWhen, (world: World, next: Creature) => boolean> = {
  always: () => true,
  offColumn: (world, next) => world.cannonCol !== next.col,
  onColumn: (world, next) => world.cannonCol === next.col,
};

function holds(when: HintWhen, world: World, next: Creature): boolean {
  return WHEN[when](world, next);
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
 * This screen's line, drawn. `set` is the panel this frame draws, so a caption
 * on a button finds the button actually there (`ViewState.controls`).
 */
export function drawWaveHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  set: ControlSet = controlSetForWave(world.wave),
): void {
  const hint = waveHint(l, world, beatPhase, set);
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
