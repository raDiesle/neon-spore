import { metColor, missedColor } from "./balance.js";
import {
  DIASTOLE_SIDES,
  type DiastoleSide,
  type DiastoleState,
  diastoleBeating,
  diastoleBridgeCol,
  diastoleChamberCol,
  diastoleCoincides,
  diastoleColor,
  diastoleContracts,
} from "./diastole.js";
import { openSlow } from "./slow.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * THE DIASTOLE's clock, and the one shot that takes a chamber.
 *
 * The clock is four phases and nothing else stored: which beat each phase
 * began on is the origin of both counts, and whether a chamber is contracting
 * on any given beat is arithmetic against that origin (`diastole.ts`). It runs
 * on the **beat** and from `stepBoss`, because every number in this boss is a
 * count a pair says out loud — there is nothing here a finer clock would make
 * fairer, and a contraction that landed between two beats would be a
 * contraction nobody could count to.
 *
 * **The strike arrives from the top of the field**, next to THE VANE's, and
 * that is not a convenience: the twin lobe hangs above the grid, so a shot
 * reaches it only by leaving through the top of a column nothing was standing
 * in. The boss defends itself with whatever the wave is sending down the
 * column the pair needs (`bullets.ts`, `lance-burn.ts`).
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installDiastole(world: World): DiastoleState {
  const cfg = world.cfg;
  return {
    kind: "diastole",
    phase: "one",
    phaseBeat: world.beat,
    leftHits: cfg.diastoleChamberHits,
    rightHits: cfg.diastoleChamberHits,
    leftEvery: cfg.diastoleLeftBeats,
    // Set from the first beat although the right chamber does not beat until
    // phase `two`: `diastoleBeating` is what decides whether a cadence is
    // being kept, and a number that arrived late would be a second place the
    // answer lived.
    rightEvery: cfg.diastoleRightBeats,
    struckBeat: -1,
    struckSide: 0,
  };
}

/** The boss, if it is the one installed. Narrowing in one place rather than four. */
export function diastoleBoss(world: World): DiastoleState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "diastole" ? boss : null;
}

/**
 * One beat of the two hearts.
 *
 * Only the phases: a contraction is derived and needs nothing done to it, and
 * a hit arrives on the tick a shot leaves the field rather than here. Each
 * change moves `phaseBeat`, which re-anchors both counts — and that is the
 * point of a phase rather than a side effect of one. Each seat can see its own
 * chamber contract, so a re-anchored count is a count its owner watches move.
 */
export function stepDiastole(world: World, b: DiastoleState): void {
  const cfg = world.cfg;
  if (b.phase === "burst") {
    // The bridge is spent and so is the boss. Nulled here rather than at the
    // last hit, so the picture has the whole burst to run before the wave is
    // allowed to end under it (`bossHoldsWave`).
    if (world.beat - b.phaseBeat >= cfg.diastoleBurstBeats) world.boss = null;
    return;
  }
  if (b.rightHits === 0 && b.leftHits === 0) {
    enter(world, b, "burst");
    // The payoff, slowed: a bridge distending from both ends and splitting in
    // the middle column is the one thing in this fight nobody may press
    // anything during, which is exactly what THE SLOW is for
    // (`docs/decisions.md` #33).
    openSlow(world, cfg.diastoleBurstBeats);
    return;
  }
  if (b.phase === "one" && b.leftHits <= 1) {
    // The right wakes. From here a single chamber cannot be taken at all: each
    // contraction closes the other's window, and the only answer is the beam
    // in the bridge on the beat both of them are closed on at once.
    enter(world, b, "two");
    return;
  }
  if (b.phase === "two" && b.leftHits === 0) {
    enter(world, b, "alone");
    // And the count the pair spent half the fight learning is not the count
    // that finishes it: seven against nothing, with no second rhythm left to
    // hold it against (`config-diastole.ts`).
    b.rightEvery = cfg.diastoleRightAloneBeats;
  }
}

function enter(world: World, b: DiastoleState, phase: DiastoleState["phase"]): void {
  b.phase = phase;
  b.phaseBeat = world.beat;
}

/**
 * **A shot that nothing on the field stopped, leaving through the top** —
 * where the twin lobe hangs. Called by `bullets.ts` and `lance-burn.ts` at the
 * one moment a shot has run out of field, and a no-op unless THE DIASTOLE is
 * the boss.
 *
 * The rule is one sentence in two halves, and the halves are a phase apart.
 * While the left beats alone, an ordinary shot takes it the ordinary way:
 * its colour, its column, its contraction. From the moment the right wakes,
 * **only the beam in the bridge column on a coincidence beat lands** — and
 * with one chamber left that is that chamber's own beat, which is why it is
 * one rule rather than two.
 *
 * **`beat` is handed in and is not read off the world here**, because the two
 * callers are on opposite sides of `onBeat` in `step.ts`: a bolt is advanced
 * after the beat has been counted and a beam is released before it, so on a
 * boundary tick the same `world.beat` means two different beats to them. The
 * beam's answer is `beamBeat` (`lance-burn.ts`) and it is the one that
 * matters — a pair who starts the fill exactly `lancePrimeBeats` before the
 * coincidence they counted to has to be judged on that coincidence.
 */
export function diastoleStruck(world: World, bullet: Bullet, beat: number): void {
  const b = diastoleBoss(world);
  if (b === null || b.phase === "burst") return;
  if (b.phase === "one") {
    chamberStruck(world, b, bullet, beat, -1);
    return;
  }
  bridgeStruck(world, b, bullet, beat);
}

/**
 * The left chamber, shot the ordinary way, while it is the only thing beating.
 *
 * A shot into a slack chamber costs nothing — THE VANE's shut housing exactly:
 * the window is visibly not open on the screen of the seat that owns it, and
 * charging for a shot at something that is plainly not there would be charging
 * for the pair's own eyes. A shot inside the window in the *wrong* colour is a
 * colour miss and nothing else, because the chamber has carried its colour on
 * that screen the whole time.
 */
function chamberStruck(
  world: World,
  b: DiastoleState,
  bullet: Bullet,
  beat: number,
  side: DiastoleSide,
): void {
  if (bullet.col !== diastoleChamberCol(world.cfg, side)) return;
  if (!diastoleContracts(b, beat, side)) return;
  if (bullet.color !== diastoleColor(side)) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: 0 });
    return;
  }
  metColor(world);
  take(b, beat, [side]);
}

/**
 * The bridge, and the only thing that reaches it: **the lance**.
 *
 * An ordinary bolt passes between the vessels and is spent, which is not a
 * penalty but the geometry — the bridge is a bundle of tubes with the field
 * showing through it, and the thing that takes it is a beam that burns a whole
 * column at once and stands in it (`lance-burn.ts`, `lanceBeamBeats`). A fill
 * completed on a beat that is not the coincidence costs the pair the fill,
 * which is `lancePrimeBeats` of a cannon held still, and that is cost enough
 * without a charge on top of it.
 */
function bridgeStruck(world: World, b: DiastoleState, bullet: Bullet, beat: number): void {
  if (!bullet.lance) return;
  if (bullet.col !== diastoleBridgeCol(world.cfg)) return;
  if (!diastoleCoincides(b, beat)) return;
  metColor(world);
  take(
    b,
    beat,
    DIASTOLE_SIDES.filter((side) => diastoleBeating(b, side)),
  );
  // **The window opens here and on the burst, and nowhere else.** This is the
  // beat the two rhythms that have been fighting each other all fight stop at
  // the same instant, and stillness is what the pair earned by counting. The
  // ordinary hits of phase `one` get none: a slow on every shot of the
  // learning phase would be the brief's own refusal — *do not turn the entire
  // game into permanent slow motion* (`docs/decisions.md` #33).
  openSlow(world, world.cfg.slowBeats);
}

/**
 * One hit off each of these chambers, on this beat.
 *
 * `struckSide` is `0` for both at once, which is the state the picture needs
 * most: two chambers drawing their collapse off one beat is the whole payoff
 * of the count, and a field that only remembered the last of them would draw
 * half of it.
 */
function take(b: DiastoleState, beat: number, sides: readonly DiastoleSide[]): void {
  if (sides.length === 0) return;
  for (const side of sides) {
    if (side === -1) b.leftHits -= 1;
    else b.rightHits -= 1;
  }
  b.struckBeat = beat;
  b.struckSide = sides.length === 1 ? sides[0]! : 0;
}
