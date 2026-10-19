import {
  type ControlSet,
  controlSetForWave,
  HINTS_ABOUT,
  type HintLine,
  type HintWhen,
  type SceneAnchor,
  type SceneStep,
  WAVE_HINTS,
  WAVES,
} from "@neon-spore/content";
import { type Creature, gripCount, OPENING_PLAY, spanOf, type World } from "@neon-spore/sim";
import { anchorPoint } from "./caption-anchor.js";
import { GUIDE_LOOK } from "./guide-look.js";
import { captionBox } from "./guide-tide-caption-box.js";
import { CORNER } from "./guide-tide-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatOf } from "./view-role.js";
import { hintSubject, secretShown, seenOn } from "./wave-hint-seen.js";

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
 * **One line per screen, on the seat it is for**: of that seat's lines that
 * hold now and whose subject this screen can find, one at a time, each for
 * `HINT_BEATS`. `test` — both halves on one screen — takes turns among the
 * acting lines instead.
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

/** Beats a line holds the plate before the next of its seat's takes it. */
export const HINT_BEATS = 4;

/**
 * A line as this screen shows it: its subject found, and the world it was
 * found in — this screen's, or only the body a `secret` line is about.
 */
export interface ShownHint extends HintLine {
  anchor: SceneAnchor;
  world: World;
}

/** Whether a hinted wave is still teaching: in play, no boss, not yet learnt. */
export function hinting(world: World): boolean {
  const id = WAVES[world.wave]?.hints;
  if (id === undefined) return false;
  if (world.brief.phase !== OPENING_PLAY || world.boss !== null || world.over) return false;
  return gone(world, HINTS_ABOUT[id]) < HINTS_UNTIL;
}

/**
 * Bodies that have left the field on this try — of `kind` where a lesson
 * names the body it is about (`HINTS_ABOUT`), else of any: the script's
 * spawned rows of it, less what of it still stands.
 */
function gone(world: World, kind: Creature["kind"] | undefined): number {
  if (kind === undefined) return world.spawned - world.creatures.length;
  let sent = 0;
  for (let i = 0; i < world.spawned; i++) if (world.queue[i]?.kind === kind) sent++;
  return sent - world.creatures.filter((c) => c.kind === kind).length;
}

/**
 * Every line of this wave's that holds now, in its authored order. Asked
 * without a screen, a state about one (`seesIt`, `toldIt`) is taken to hold:
 * this is every line some screen could be showing.
 */
export function waveHintsNow(world: World, l?: Layout): readonly HintLine[] {
  const id = WAVES[world.wave]?.hints;
  if (id === undefined || !hinting(world)) return [];
  const r: Reading = { world, next: lowest(world), l };
  return WAVE_HINTS[id].filter((h) => [h.when ?? "always"].flat().every((w) => WHEN[w](r)));
}

/** The line this screen shows, or nothing. */
export function waveHint(
  l: Layout,
  world: World,
  beatPhase: number,
  set: ControlSet = controlSetForWave(world.wave),
): ShownHint | null {
  const next = lowest(world);
  const shown: ShownHint[] = [];
  const seen = seenOn(l, world);
  for (const h of waveHintsNow(world, l)) {
    const mine = l.role === "test" ? h.acts !== false : h.seat === seatOf(l.role);
    const found = mine ? hintSubject(l, seen, h.anchor, next) : null;
    if (found && anchorPoint(l, found.world, set, found.anchor, beatPhase) !== null) {
      shown.push({ ...h, ...found });
    }
  }
  if (shown.length === 0) return null;
  // `beat` starts again with a try, so the first line is the first said.
  return shown[Math.floor(Math.max(0, world.beat) / HINT_BEATS) % shown.length] ?? null;
}

/** Whether a column is under a body, any column of its width (`spanOf`). */
function under(col: number, c: Creature): boolean {
  const half = (spanOf(c) - 1) / 2;
  return col >= c.col - half && col <= c.col + half;
}

const handOn = (world: World) => world.creatures.some((c) => gripCount(world, c.id) > 0);

/** What a state is read off: the world, its next body, and the screen if there is one. */
interface Reading {
  world: World;
  next: Creature | null;
  l?: Layout | undefined;
}

/** Whether some body's secret is drawn on this screen (`true`) or kept from it (`false`). */
function secret(r: Reading, shown: boolean): boolean {
  const { l, world } = r;
  if (l === undefined) return true;
  return world.creatures.some((c) => secretShown(l, world, c) === shown);
}

const WHEN: Record<HintWhen, (r: Reading) => boolean> = {
  always: () => true,
  offColumn: ({ world, next }) => next !== null && !under(world.cannonCol, next),
  onColumn: ({ world, next }) => next !== null && under(world.cannonCol, next),
  shieldOff: ({ world, next }) => next !== null && !under(world.shieldCol, next),
  shieldOn: ({ world, next }) => next !== null && under(world.shieldCol, next),
  held: ({ world }) => handOn(world),
  free: ({ world, next }) => next !== null && !handOn(world),
  seesIt: (r) => secret(r, true),
  toldIt: (r) => secret(r, false),
};

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
  const at = hint.world;
  GUIDE_LOOK.caption(ctx, l, at, set, step, world.tick, beatPhase, undefined, undefined, true);
  const box = captionBox(ctx, l, at, set, step, beatPhase);
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
