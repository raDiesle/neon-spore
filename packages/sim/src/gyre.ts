import { hullRow, msToTicks } from "./config.js";
import { removeCreatures } from "./field.js";
import {
  GYRE_MOUNTS,
  GYRE_RADIUS,
  GYRE_TURN_MILLI,
  gyreAt,
  gyreClick,
  gyreStep,
  mountColor,
  mountOffset,
} from "./gyre-rim.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GYRE: six bodies on the rim of a turning wheel, and the first creature
 * whose colour and column are the *same* fact changing together.
 *
 * Everything else on the field holds one of the two still. A slick keeps its
 * lane and its colour the whole way down, so "red in four" stays true until it
 * lands. THE DART moves the column and keeps the colour; THE VEIL turns the
 * colour over and keeps the column. This one turns them into each other: the
 * six mounts alternate slick, bulb, slick, bulb around the rim, so the body
 * standing in a column *is* a different colour a beat later, and the sentence
 * the pair has said all game expires before it has finished being said.
 *
 * **So they stop naming a place and start naming a moment.** The only call
 * that survives the voice delay is one about where the wheel will have got to,
 * and the one thing either of them can do about that is player 1's maw.
 *
 * ## The suck
 *
 * The wheel is wind, and the ship can pull against it. Opening the maw
 * (`intake`) slows the turn to `gyreSuckSpinMilli` for `gyreSuckMs`, wherever
 * the cannon happens to be standing: the pull is not aimed and never was, so
 * it costs player 1 a thumb and not a column. That is deliberately the shape
 * the ward already has against THE CLASP — a control with one job acquiring a
 * second one against a body, rather than a new button on the panel — with the
 * single difference that a ward has to be *in* the column and this does not.
 *
 * What it buys is a landable call. The turn goes on accelerating underneath
 * (`gyreSpinPerBeat`), so the maw is relief and never a reset: the pair spends
 * it on the beat they have agreed to fire on, not on the wheel in general.
 *
 * ## The route
 *
 * It falls to the middle of the field and then stops falling. From there it
 * walks a diamond — a column and a row a beat, four corners, eight beats a lap
 * — and every completed lap drops the whole circuit one row (`gyreSinkLaps`).
 * So the wheel never arrives and never leaves: what being slow costs is that
 * the bottom of the rim eventually grinds along the ship, and whichever mount
 * is at the foot of the wheel when it does is a mount that reached the hull.
 *
 * The hub is not a target and does not stop a shot (`firstAlong` in
 * bullets.ts). There is nothing on it to shoot at — the six mounts are
 * ordinary bodies answered by the ordinary rule — and when the last of them is
 * gone the wheel breaks and goes with it (`breakSpentGyres`).
 */

/**
 * Whether this body is one of the six on a rim. The kind is the whole of it,
 * exactly as it is for a clasp: a mount is never anything else, and it does
 * not stop being one when the wheel breaks, because the wheel breaking *is*
 * the last mount going.
 */
export function isMount(c: Creature): boolean {
  return c.kind === "mount";
}

/** Ticks the maw stays open against a wheel, from `gyreSuckMs` at this rate. */
export function gyreSuckTicks(world: World): number {
  return msToTicks(world.cfg, world.cfg.gyreSuckMs);
}

/**
 * Whether the ship is pulling on the wheel this instant.
 *
 * **No column, and that is the whole difference from the ward.** The shield
 * has to be standing in a clasp's own lane before the trigger means anything;
 * the maw is a mouth on the front of the ship and what it pulls on is the air
 * in front of it. So a pair that has agreed to slow the wheel does not also
 * have to agree where — which is what keeps player 1's cannon free for the
 * column they were told, on the one beat they are going to need it.
 */
export function gyreSucked(world: World): boolean {
  const since = world.tick - world.intakeTick;
  return since >= 0 && since <= gyreSuckTicks(world);
}

/**
 * Thousandths of a click the wheel turns on this beat.
 *
 * It climbs with the wheel's own age and stops at `gyreSpinCapMilli`, which is
 * one click a beat. The cap is not a taste: a wheel turning a whole click
 * between two beats already moves every mount to the neighbouring tile, and
 * anything faster would step a mount *past* one — the pair would be firing at
 * a column no body was ever in, and two mounts would swap places without
 * either crossing the ground between.
 *
 * The maw replaces the number rather than subtracting from it, so a wheel
 * under a pull turns at one speed however old it is. What goes on ageing
 * underneath is what it returns to.
 */
export function gyreSpinPerBeat(world: World, c: Creature): number {
  const cfg = world.cfg;
  if (gyreSucked(world)) return cfg.gyreSuckSpinMilli;
  return Math.min(cfg.gyreSpinCapMilli, cfg.gyreSpinMilli + cfg.gyreSpinGainMilli * gyreStep(c));
}

/** What a gyre arrives with: the foot of the rim upright, and no age. */
export function gyreOnSpawn(): { gyreTurnMilli: number; gyreStep: number } {
  return { gyreTurnMilli: 0, gyreStep: 0 };
}

/**
 * The six mounts a hub is born with. Built here rather than at the spawn site
 * so that "six bodies, alternating, two clicks apart, at the hub's own
 * position" is one sentence in one place — the spawn loop in `beat.ts` knows
 * only that a gyre brings bodies with it.
 */
export function mountsFor(world: World, hub: Creature): Creature[] {
  const born: Creature[] = [];
  for (let slot = 0; slot < GYRE_MOUNTS; slot++) {
    const [dcol, drow] = mountOffset(gyreClick(hub), slot);
    born.push({
      id: world.nextId++,
      kind: "mount",
      col: hub.col + dcol,
      row: hub.row + drow,
      // Out of the hub, so the first frame draws the wheel assembling itself
      // rather than six bodies appearing in a ring — the same glide THE ECHO's
      // halves come out of their parent on.
      fromRow: hub.fromRow,
      fromCol: hub.col,
      color: mountColor(slot),
      holes: 0,
      petals: 0,
      dragMilli: 0,
      shell: 0,
      gyreId: hub.id,
      gyreSlot: slot,
    });
  }
  return born;
}

/**
 * One beat of a wheel: it turns, it travels, and its mounts are carried.
 *
 * Called from `onBeat` in place of the fall every other body takes, for
 * `stepDart`'s reason — a hub that both walked its diamond and fell would be
 * moving in two directions on one beat. The mounts are carried here rather
 * than in a pass of their own, so a mount is never read at a position its hub
 * has already left.
 */
export function stepGyre(world: World, hub: Creature): void {
  hub.gyreStep = gyreStep(hub) + 1;
  hub.gyreTurnMilli = ((hub.gyreTurnMilli ?? 0) + gyreSpinPerBeat(world, hub)) % GYRE_TURN_MILLI;
  const at = gyreAt(world.cfg, gyreStep(hub));
  hub.col = at.col;
  // The hub stops two rows short of the ship, which is where `gyreSinkLaps`
  // already leaves it — the clamp is here so that a field shorter than the one
  // the game ships cannot put a hub on the hull row, where `resolveHull` would
  // breach for a body that is not on the field in the sense that rule means.
  hub.row = Math.min(at.row, hullRow(world.cfg) - GYRE_RADIUS);
  carryMounts(world, hub);
}

/**
 * Put every mount of this hub where the rim now says it is. The hub's own
 * `fromCol`/`fromRow` were set by the beat loop before it stepped, so a mount
 * glides from the tile it was in to the tile it is in and the whole wheel
 * turns as one picture.
 */
function carryMounts(world: World, hub: Creature): void {
  const click = gyreClick(hub);
  for (const c of world.creatures) {
    if (c.gyreId !== hub.id) continue;
    // A mount standing on the ship's row is off the wheel. It has arrived, and
    // `resolveHull` breaks the hull with it at the end of this same beat —
    // carried on around the rim it would be lifted back clear of the ship
    // during the very beat it is being drawn landing on it, and the wheel
    // would grind forever without ever costing the pair a thing.
    if (c.row >= hullRow(world.cfg)) {
      c.fromCol = c.col;
      c.fromRow = c.row;
      continue;
    }
    const [dcol, drow] = mountOffset(click, c.gyreSlot ?? 0);
    c.fromCol = c.col;
    c.fromRow = c.row;
    c.col = hub.col + dcol;
    c.row = hub.row + drow;
  }
}

/** How many bodies are still riding this hub. */
export function gyreMountsLeft(world: World, hubId: number): number {
  let left = 0;
  for (const c of world.creatures) if (c.gyreId === hubId) left += 1;
  return left;
}

/**
 * Take away every wheel with nothing left on it.
 *
 * Run on the beat rather than at the instant the last mount is shot, and the
 * delay is the picture: a bare hub standing for the rest of a beat is the
 * wheel coming apart, which is what the pair is owed for having cleared it.
 * Anything shorter and the last kill and the wheel's own end are one frame, so
 * the biggest thing on the field disappears without being seen to go.
 *
 * It has to happen *before* the wave asks whether the field is clear, or a
 * spent hub would hold a wave open with nothing left in it to shoot.
 */
export function breakSpentGyres(world: World): void {
  const spent = world.creatures.filter(
    (c) => c.kind === "gyre" && gyreMountsLeft(world, c.id) === 0,
  );
  if (spent.length === 0) return;
  for (const hub of spent) {
    world.score += world.cfg.scoreGyreBreak;
    world.events.push({ type: "gyreBroke", col: hub.col, row: hub.row });
  }
  removeCreatures(
    world,
    spent.map((c) => c.id),
  );
}
