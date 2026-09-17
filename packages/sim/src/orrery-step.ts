import { NO_BEARING } from "./bearing.js";
import {
  ORRERY_RINGS,
  type OrreryState,
  orreryAnchors,
  orreryCoreCol,
  orreryOrbit,
  orreryShaftOpen,
} from "./orrery.js";
import { orreryGapCol } from "./orrery-gap.js";
import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE ORRERY's clock: the core's own fire, the organs that come off a broken
 * ring, and the going out.
 *
 * It runs on the **beat** and from `stepBoss`, because every number in this
 * fight is one somebody says out loud — which beat the gaps meet on, how many
 * beats until they do. Nothing here decides where a gap is; that is
 * arithmetic over the anchors and it is `orrery.ts`.
 *
 * **What it puts on the field, it puts there as ordinary rocks.** A ring that
 * comes off sheds organs and the core spits its own, and both are meteors —
 * so every rule that meets one is a rule that already exists, and the pair's
 * answer is the plate they have had since wave four. THE BATON's shed
 * segments are the shipped precedent for a boss dropping its own body as a
 * meteor.
 *
 * **This is the one boss on that page that spawns**, against the rule THE
 * DIASTOLE's lane wrote down, and the page asks for the exception to be said
 * out loud with its reason. Neither the beat a ring breaks on nor the column
 * its organs come off in is writable by a wave author: both are decided by
 * when the pair managed to agree, which is the whole of what this fight is
 * about. An author cannot write down debris from an event they cannot place.
 */

/**
 * The boss as installed: three orbits anchored so their gaps first meet
 * `orreryFirstBeats` after the wave puts it up, and a colour the pair has to
 * read off the core.
 */
export function installOrrery(world: World): OrreryState {
  const cfg = world.cfg;
  return {
    kind: "orrery",
    phase: "rings",
    phaseBeat: world.beat,
    broken: 0,
    from: orreryAnchors(cfg, cfg.orreryFirstBeats),
    anchorBeat: world.beat,
    // Seeded, so both devices show the same core and a replay of this wave is
    // the same fight — and not fixed, so the first shot of every run is not
    // the same colour.
    color: nextInt(world.rng, 2) === 0 ? "red" : "cyan",
    brokeBeat: -1,
    spatBeat: -1,
    // No hand on it, and nothing banked against the outer ring's first detent
    // (`orrery-hand.ts`).
    handAtMilli: NO_BEARING,
    windMilli: 0,
  };
}

/** One beat of it. */
export function stepOrrery(world: World, b: OrreryState): void {
  const cfg = world.cfg;
  if (b.phase === "out") {
    // Beaten, and going out from the centre outward. Nothing about the rings
    // is stepped: the picture is reading the beats since `phaseBeat`.
    if (world.beat - b.phaseBeat >= cfg.orreryOutBeats) world.boss = null;
    return;
  }
  spit(world, b);
  // **THE SLOW, opened on the beat before an alignment** and running through
  // it, so a window one beat wide is three seconds of real time for a pair to
  // say *now* across a voice delay. The concept THE SLOW was ruled in for
  // (`docs/decisions.md` #33): the rings keep their integer cadences and it is
  // the second that stretches.
  if (b.phase !== "naked" && orreryShaftOpen(cfg, b, world.beat + 1)) {
    openSlow(world, cfg.orrerySlowBeats);
  }
}

/**
 * The core's own fire, once a ring is off it: a rock down the column the
 * innermost ring still standing is pointing at.
 *
 * **Never down its own column**, and the rule pays for itself twice. A meteor
 * cannot be shot, so a rock spat down the shaft would stand in the only
 * column the pair is allowed to fire up, for the fifteen beats it takes to
 * fall, with nothing either of them could do about it. And a core aiming at
 * the seat directly under it is a boss that does not have to be read.
 *
 * It is silent on a beat the shaft is open, for the same reason said about
 * the moment instead of the place: the beat the pair can reach the core is
 * the one beat the core does not reach them.
 */
function spit(world: World, b: OrreryState): void {
  const cfg = world.cfg;
  if (b.phase === "rings") return;
  if (b.spatBeat >= 0 && world.beat - b.spatBeat < cfg.orrerySpitBeats) return;
  if (b.broken < ORRERY_RINGS && orreryShaftOpen(cfg, b, world.beat)) return;
  const ring = Math.min(b.broken, ORRERY_RINGS - 1);
  const col = orreryGapCol(cfg, b, ring, world.beat);
  if (col === orreryCoreCol(cfg)) return;
  b.spatBeat = world.beat;
  dropOrgan(world, col);
}

/**
 * A ring comes off: the outermost one still standing, its organs loose and
 * falling, and the core showing the other colour from here on.
 *
 * Called from `orrery-shot.ts`, which is the only thing that can do it.
 */
export function orreryBreak(world: World, b: OrreryState): void {
  const ring = b.broken;
  b.broken += 1;
  b.brokeBeat = world.beat;
  b.color = b.color === "red" ? "cyan" : "red";
  b.phase = b.broken >= ORRERY_RINGS ? "naked" : "spitting";
  b.phaseBeat = world.beat;
  // Whatever the pilot had wound against *this* ring's detent goes with it. A
  // bank carried inward would hand the next ring a free part-organ the thumb
  // earned against something that is no longer there (`orrery-hand.ts`).
  b.windMilli = 0;
  shed(world, b, ring);
}

/**
 * The organs of a broken ring, drifting off the orbit and falling as ordinary
 * rocks.
 *
 * `orreryDebris` of them rather than the ring's whole count, which is the
 * design's own number and would be eight rocks on one beat — a wave rather
 * than a consequence. They come down spread across the field and never in the
 * core's column, which is where they were: an organ was out at the ring's
 * radius, and the middle of the ring is the one place none of them ever
 * stood.
 */
function shed(world: World, b: OrreryState, ring: number): void {
  const cfg = world.cfg;
  const core = orreryCoreCol(cfg);
  const count = Math.max(0, cfg.orreryDebris);
  const orbit = orreryOrbit(cfg, ring);
  for (let i = 0; i < count; i++) {
    // Spread across the field by the arithmetic that already says where this
    // ring's organs are: the slots of its own orbit, taken evenly.
    const slot = Math.round((i * orbit) / count);
    let col = orreryGapCol(cfg, b, ring, b.anchorBeat + slot);
    if (col === core) col = core + (i % 2 === 0 ? 1 : -1);
    dropOrgan(world, Math.max(0, Math.min(cfg.cols - 1, col)));
  }
}

/** One organ, falling from the top of the field as the rock it now is. */
function dropOrgan(world: World, col: number): void {
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    span: 1,
    col,
    row: 0,
    fromRow: 0,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
}
