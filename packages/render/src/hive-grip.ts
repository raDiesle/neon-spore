import {
  type HiveState,
  hiveClenched,
  hiveNext,
  hivePinched,
  hiveSwellingAt,
  hiveTwins,
  midCol,
  NO_PINCH,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { hiveClenchLeft, hiveClenchRise, hivePinchPhase } from "./hive-hold.js";
import { hiveSite, hiveUnderY, type Point } from "./hive-shape.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsHiveColor, showsHiveSwell } from "./view-role-clocks-b.js";

/**
 * **THE HIVE's one handle, offered to whichever seat the mass's state is
 * for** — the clenched underside the pilot hauls down, the swelling lobe the
 * navigator holds until the colour is out of it (`sim/hive-hand.ts`).
 *
 * One `hiveLobe` and two rings that are never up at once, because the two
 * states are never on at once: a lobe stops swelling the moment the mass
 * clenches (`hiveSwellingAt`), and a clench relaxed or hauled leaves the
 * swell where it was. So the seat each ring belongs to is decided by the
 * state and not by a rule of this file, which is the departure from
 * `scuttle-grip.ts`: there, two rings of the same kind had to be given to one
 * seat and withheld from the other.
 *
 * Whose each is, is what each seat is *drawn*. `showsHiveColor` gives the
 * pilot the mass with every breach in its colour, so the underside going up
 * out of his reach is his to pull back. `showsHiveSwell` gives the navigator
 * the swell and nobody else, so the lobe about to open is hers to squeeze —
 * a ring on the pilot's screen over a lobe he is not shown swelling would be
 * a handle on a thing he cannot see, and the simulation drops his hand there
 * without a sound anyway (`hive-hand.ts`).
 */

/**
 * Where the clenched underside is grabbed: the middle of the mass, at the
 * height it has been drawn up to this frame.
 *
 * **Wider than a lobe's ring**, by `HAUL_GRAB`, because the handle is the
 * whole underside rather than a part of it: it is hauled with a palm and the
 * mass is a tile and a half wide at that height. It follows the rise, which
 * is the same rule THE SCUTTLE's sliding parts are answered by — a handle is
 * hit-tested where it is drawn, and never where it was.
 */
const HAUL_GRAB = 1.8;

export function hiveHaulCircle(
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  beat: number,
  beatPhase: number,
): Circle {
  const rise = hiveClenchRise(s, cfg, beat, beatPhase);
  return {
    x: tileCX(l, midCol(cfg)),
    y: hiveUnderY(l) - rise * l.tile,
    r: handleRadius(l, cfg) * HAUL_GRAB,
  };
}

/** Where lobe `i` is held: its site, lifted with the mass if the mass is up. */
export function hiveLobeCircle(
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  i: number,
  beat: number,
  beatPhase: number,
): Circle {
  const at: Point = hiveSite(l, s, i);
  const rise = hiveClenchRise(s, cfg, beat, beatPhase);
  return { x: at.x, y: at.y - rise * l.tile, r: handleRadius(l, cfg) };
}

/**
 * Where the navigator's thumb is standing on a pinched lobe, or null with none
 * held: the ghost hand a rehearsal draws over her wring (`guide-hand.ts`).
 * Read off the world, like the haul's, so it lifts with the mass.
 */
export function hivePinchCircle(l: Layout, world: World, beatPhase: number): Circle | null {
  const s = world.boss?.kind === "hive" ? world.boss : null;
  if (s === null || hivePinched(s) === NO_PINCH) return null;
  return hiveLobeCircle(l, world.cfg, s, hivePinched(s), world.beat, beatPhase);
}

/**
 * A press on the underside or on a swelling lobe: a `drag` on `hiveLobe`,
 * carrying the lobe as its `id` when it is a lobe, because two swell at once
 * late in the fight and the simulation is told which (`drag-targets-d.ts`).
 *
 * The haul carries no `id` and needs none: there is one mass. What it does
 * carry is `fromYMilli`, filled in by the drag as the thumb moves — a press
 * alone hauls nothing, which is why the grab is worth the same whether it
 * lands on the middle of the underside or at the edge of the circle.
 */
export function hiveLobeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "hive");
  if (s === null) return null;
  const { cfg, beat, beatPhase } = field;
  if (hiveClenched(s)) {
    if (field.seat !== 1) return null;
    if (!hitCircle(hiveHaulCircle(l, cfg, s, beat, beatPhase), x, y)) return null;
    return {
      player: 1,
      command: { kind: "drag", target: "hiveLobe", on: true, fromMilli: 0, fromYMilli: 0 },
      hold: { kind: "drag", target: "hiveLobe", player: 1, originX: x, originY: y },
    };
  }
  if (field.seat !== 2) return null;
  // The nearest of the two swelling lobes wins, which is `creatureAt`'s rule
  // and for its reason: a thumb covers more than a handle.
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const i of swellingLobes(s, cfg, beat)) {
    const c = hiveLobeCircle(l, cfg, s, i, beat, beatPhase);
    if (!hitCircle(c, x, y)) continue;
    const d = Math.hypot(x - c.x, y - c.y);
    if (d >= bestDist) continue;
    best = i;
    bestDist = d;
  }
  if (best === null) return null;
  return {
    player: 2,
    command: { kind: "drag", target: "hiveLobe", on: true, fromMilli: 0, fromYMilli: 0, id: best },
    hold: { kind: "drag", target: "hiveLobe", player: 2, originX: x, originY: y, id: best },
  };
}

/** Which lobes are swelling right now: the next, and the one after it once openings come in pairs. */
function swellingLobes(s: HiveState, cfg: SimConfig, beat: number): number[] {
  const next = hiveNext(s);
  if (next < 0) return [];
  const out: number[] = [];
  for (let i = next; i < next + (hiveTwins(s, cfg) ? 2 : 1); i++) {
    if (hiveSwellingAt(s, cfg, beat, i)) out.push(i);
  }
  return out;
}

/**
 * The rings, drawn after the body so each stands over its own wax — and at
 * most one kind of them, on at most one screen.
 *
 * Both wear a dial, and the two dials count opposite ways on purpose: the
 * pilot's empties as the clench runs out, because what he is racing is the
 * backlog the relax beat drops (`hive-step.ts`), and hers fills as her hold
 * goes on, because what she is waiting for is the end of it.
 */
export function drawHiveGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (s.downBeat >= 0) return;
  if (hiveClenched(s)) {
    if (!showsHiveColor(l.role)) return;
    const c = hiveHaulCircle(l, cfg, s, beat, beatPhase);
    const hauled = s.haulMilli > 0;
    drawGripRing(ctx, c.x, c.y, c.r, hauled, time);
    drawGripDial(ctx, c.x, c.y, c.r, hiveClenchLeft(s, cfg, beat, beatPhase));
    return;
  }
  if (!showsHiveSwell(l.role)) return;
  const phase = hivePinchPhase(s, cfg, beat, beatPhase);
  for (const i of swellingLobes(s, cfg, beat)) {
    const c = hiveLobeCircle(l, cfg, s, i, beat, beatPhase);
    const held = i === s.pinch;
    drawGripRing(ctx, c.x, c.y, c.r, held, time);
    if (held) drawGripDial(ctx, c.x, c.y, c.r, phase);
  }
}
