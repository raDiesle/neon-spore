import { type Creature, CURTAIN_COLS, type CurtainState, type SimConfig } from "@neon-spore/sim";
import { CURTAIN_HEM_DROP, CURTAIN_RAIL_RISE } from "./curtain-sheet.js";
import { drawnCol } from "./depth.js";
import { drawHandleRest, drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE CURTAIN's hem**: the one part of this boss a single thumb takes hold
 * of, drawn and answered in one file for `gorge-grip.ts`' reason — the circle
 * a thumb is answered at is the circle the ring is drawn from.
 *
 * The sheet itself is carried by both hands at once and has no handle: it is
 * seven columns of cloth and the grip pass rings the middle of it
 * (`curtain-draw.ts`). The hem is the other gesture. While a hit has jammed
 * the rail the shove is refused whole, and the pilot lifts the bottom edge and
 * **holds** it to open a gap over the core (`sim/curtain-hand.ts`). So this is
 * the one state of the fight with a handle in it, and the ring is the one
 * every shipped boss draws.
 *
 * **It rests in the middle of the sheet, not over the core.** The core is the
 * navigator's to see — the pilot is shown the soft lobes and nothing of the
 * shadow (`view-role-clocks.ts`) — so a handle hanging in the core's column
 * would tell him where it is, on his own screen, and the split of eyes that is
 * the whole boss would be over. The middle of whatever part of the sheet is on
 * the field is the same reckoning the grip ring already uses, and it says the
 * true thing: *the cloth, here*.
 *
 * **The lift is remapped and not one-to-one.** A handle that is a point can
 * sit exactly under the thumb; a hem the simulation calls high
 * has to *look* gathered, which is `stare-lid.ts`' case. Half a tile of thumb
 * is not a sheet's worth of hem, so the full `curtainLiftMilli` draws the edge
 * up `HEM_DROP + RAIL_RISE - HEM_GATHER` tiles — to a sliver of cloth under the
 * rail, which is what a curtain gathered to the top looks like. The gap over
 * the core opens for nothing else: the core is drawn first and the sheet over
 * it (`curtain-draw.ts`), so cloth lifted off a column is a column seen.
 *
 * **The ring is on both screens**, because the gauge closing is the navigator's cue, because the instant it
 * closes is the instant her shot up that column is worth something. Whose
 * thumb it is is said by the field's own word, `LIFT`.
 *
 * **Held is read off the carry**, which is all the simulation keeps: a thumb
 * resting at the bottom of the hem looks like no thumb at all. That is the
 * truth of it — nothing has been lifted yet.
 */

/** How far short of the rail a fully gathered hem stops, in tiles: the sliver
 * of cloth that says the sheet is still hanging rather than gone. */
const HEM_GATHER = 0.18;

/** The pixels a full lift carries the hem up. */
export function curtainHemReach(l: Layout): number {
  return l.tile * (CURTAIN_HEM_DROP + CURTAIN_RAIL_RISE - HEM_GATHER);
}

/** How far the hem is drawn up right now, in pixels. */
export function curtainHemLift(l: Layout, cfg: SimConfig, c: CurtainState): number {
  return curtainHemReach(l) * curtainHemPull(cfg, c);
}

/** The carry as a fraction of the whole, which is what the gauge reads. */
export function curtainHemPull(cfg: SimConfig, c: CurtainState): number {
  if (cfg.curtainLiftMilli <= 0) return 0;
  return Math.min(1, c.liftMilli / cfg.curtainLiftMilli);
}

/**
 * The middle of the part of the sheet standing on the field, or `null` with
 * none of it on: a sheet shoved to the wall has nowhere to be held by.
 * `curtain-draw.ts` rings the grip at the same point, so the two hands on this
 * boss meet at one place rather than at two that drifted apart.
 */
export function curtainSheetMidX(l: Layout, cfg: SimConfig, at: number): number | null {
  const x0 = tileCX(l, at) - l.tile * 0.5;
  const left = Math.max(x0, tileCX(l, 0) - l.tile * 0.5);
  const right = Math.min(x0 + CURTAIN_COLS * l.tile, tileCX(l, cfg.cols - 1) + l.tile * 0.5);
  return right <= left ? null : (left + right) / 2;
}

/** Where the ring rests, with no thumb on the hem: the hem's own line. */
export function curtainHemRest(
  l: Layout,
  cfg: SimConfig,
  body: Creature,
  beatPhase: number,
): Circle | null {
  const x = curtainSheetMidX(l, cfg, drawnCol(body, beatPhase));
  if (x === null) return null;
  return { x, y: tileCY(l, cfg.curtainRow) + l.tile * CURTAIN_HEM_DROP, r: handleRadius(l, cfg) };
}

/** Where the ring is standing: on the edge, wherever the thumb has carried it. */
export function curtainHemAt(
  l: Layout,
  cfg: SimConfig,
  c: CurtainState,
  body: Creature,
  beatPhase: number,
): Circle | null {
  const rest = curtainHemRest(l, cfg, body, beatPhase);
  return rest === null ? null : { ...rest, y: rest.y - curtainHemLift(l, cfg, c) };
}

/**
 * The grab, and the pilot's alone: a lift sent from her seat is dropped
 * without a sound in the rule itself (`sim/curtain-hand.ts`), so a ring she
 * could take hold of would be a control that did nothing. Only while the rail
 * is `pinned`, for the same reason the rule is: a sheet free to slide gives
 * sideways, and a hem liftable from `hung` would be a quieter way to do the
 * shove's job with one hand instead of two.
 *
 * Answered at the **rest** and never where the hem has got to, which is the
 * rule for every handle on this field (`handles.ts`).
 */
export function curtainHemUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const c = bossOf(field, "curtain");
  if (c === null || c.phase !== "pinned" || field.seat !== 1) return null;
  const body = field.creatures.find((b) => b.id === c.creatureId);
  if (body === undefined) return null;
  const rest = curtainHemRest(l, field.cfg, body, field.beatPhase);
  if (rest === null || !hitCircle(rest, x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "curtainHem", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "curtainHem", player: 1, originX: x, originY: y },
  };
}

/**
 * The ring, over the sheet, on both screens — and nothing at all in the three
 * states that are not `pinned`: a handle drawn while the rail slides would be
 * a control four beats before one may be taken hold of.
 *
 * Violet, because it is cloth. Everything a hand holds on this field takes the
 * colour of the thing it holds, and the sheet is hull violet at a fraction of
 * its alpha (`curtain-sheet.ts`).
 */
export function drawCurtainHem(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: CurtainState,
  body: Creature,
  beatPhase: number,
  time: number,
): void {
  if (c.phase !== "pinned") return;
  const rest = curtainHemRest(l, cfg, body, beatPhase);
  if (rest === null) return;
  const held = c.liftMilli > 0;
  if (held) drawHandleRest(ctx, rest, PALETTE.hull);
  drawHandleRing(ctx, {
    x: rest.x,
    y: rest.y - curtainHemLift(l, cfg, c),
    r: rest.r,
    hex: PALETTE.hull,
    rim: PALETTE.hullRim,
    held,
    pull: curtainHemPull(cfg, c),
    time,
  });
}
