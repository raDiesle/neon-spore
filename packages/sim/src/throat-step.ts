import type { SimConfig } from "./config.js";
import { removeCreatures } from "./field.js";
import { gumIsFlung } from "./gum.js";
import { rockHeading } from "./rock-cross.js";
import { openSlow } from "./slow.js";
import { occupiesCol } from "./span.js";
import {
  THROAT_PHASES,
  type ThroatPhase,
  type ThroatState,
  throatEvertBeatsLeft,
  throatHomeCol,
  throatInhales,
  throatMouthCol,
  throatMouthRow,
  throatSnap,
  throatSpent,
  throatStride,
} from "./throat.js";
import { throatHasHold, throatLift } from "./throat-pull.js";
import type { World } from "./world.js";

/**
 * THE THROAT's clock, and the two things that change its health.
 *
 * **The two are opposite gestures, and that is the boss.** A gum flung into
 * the mouth chokes a ring (`throatChoked`); anything else the mouth takes
 * re-tightens one (`throatFed`). So the pair's habit of clearing the field is
 * the thing healing it, and the answer is the one body on the field that
 * neither the cannon nor the plate can touch.
 *
 * It runs on the **beat** and from `stepBoss`, because every number in this
 * fight is a count somebody says out loud: the beats to the next inhale and
 * the column the mouth will be in. A pull that happened between beats would
 * be a pull nobody could name a moment for.
 *
 * **Order inside a beat is the pair's window**, and it is the whole reason the
 * lift is not in the fall loop. `beat.ts` runs the fall, which `throatHolds`
 * has already refused for anything the throat has hold of; then this steps,
 * and it **swallows before it lifts**. A body hauled up into the mouth
 * therefore stands in it for a whole inhale before it goes down — which is
 * the window player 2 fires her colour into, and the design's step 7 is
 * nothing but that window missed.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installThroat(world: World): ThroatState {
  return {
    kind: "throat",
    phase: "still",
    phaseBeat: world.beat,
    slack: 0,
    mouthFrom: throatHomeCol(world.cfg),
    chokedBeat: -1,
    fedBeat: -1,
  };
}

/**
 * The phase this many slack rings has **earned**, which is not always the
 * phase the fight is in.
 *
 * `stepThroat` only ever moves forward through `THROAT_PHASES`, and that is a
 * decision rather than an oversight: a swallowed creature re-tightens a ring,
 * and a tube that un-tightened its way back to a standing mouth would undo
 * work the pair can *see* it has done. What a heal costs is rings — which is
 * to say the fight is longer than it was — and never the ground gained.
 */
export function throatPhaseFor(cfg: SimConfig, slack: number): ThroatPhase {
  if (slack >= cfg.throatRings) return "everts";
  if (slack >= cfg.throatRings - 1) return "open";
  if (slack >= 2) return "quick";
  return slack >= 1 ? "slide" : "still";
}

/**
 * One beat of the gullet: the eversion if it is beaten, then the phase it has
 * earned, then the inhale — swallow, and after that lift.
 */
export function stepThroat(world: World, b: ThroatState): void {
  const cfg = world.cfg;
  if (b.phase === "everts") {
    // The tube is through its own mouth and so is the boss. Nulled here rather
    // than on the last choke, so the picture has the whole eversion to run
    // before the wave is allowed to end under it (`bossHoldsWave`).
    if (throatEvertBeatsLeft(cfg, b, world.beat) <= 0) world.boss = null;
    return;
  }
  // A fling that arrived this beat, before the phase is read off the rings:
  // the ring it chokes is what may have just earned the eversion.
  throatChoked(world, b);
  if (advance(world, b) === "everts") {
    // The payoff, slowed: a closed contour turning through its own opening is
    // the one thing in this fight nobody may press anything during, which is
    // exactly what THE SLOW is for (`docs/decisions.md` #33).
    openSlow(world, cfg.throatEvertBeats);
    return;
  }
  if (!throatInhales(cfg, b, world.beat)) return;
  throatFed(world, b);
  throatLift(world, b);
}

/**
 * Forward through `THROAT_PHASES` to whatever the rings have earned, and never
 * back — `throatPhaseFor` says why. It **returns** the phase it settled on
 * rather than leaving the caller to re-read the field, because a mutation
 * narrowing cannot be seen through: the eversion has to be answered on the
 * beat the last ring choked, not the beat after.
 *
 * Every change re-anchors both clocks: `phaseBeat` is the origin the inhale is
 * counted from and the beat the mouth's travel starts at, and `mouthFrom` is
 * snapped to a stop the new stride can reach (`throatSnap`). The mouth
 * therefore never jumps — it carries on from the column it was standing in —
 * and the count starts where the pair watched the tube change.
 */
function advance(world: World, b: ThroatState): ThroatPhase {
  const cfg = world.cfg;
  const want = throatPhaseFor(cfg, b.slack);
  if (THROAT_PHASES.indexOf(want) <= THROAT_PHASES.indexOf(b.phase)) return b.phase;
  const standing = throatMouthCol(cfg, b, world.beat);
  b.phase = want;
  b.phaseBeat = world.beat;
  b.mouthFrom = throatSnap(cfg, standing, throatStride(cfg, b));
  return want;
}

/**
 * **A gum a hand has flung, arriving at the mouth** — the only thing in the
 * game that hurts this boss, and one hit test rather than a mechanic
 * (`bosses-choreographed.md` §1, *Cost*).
 *
 * Called from `beat.ts` after the bodies have moved, so the gum has already
 * taken this beat's stride along its row (`stepRockAcross`). It lands if the
 * mouth's column is **inside the stride it just flew**: a gum crosses
 * `gumFlingCols` columns a beat and the mouth is one column wide, so a test
 * that asked only whether the two were equal would be a boss a fling flew
 * straight over two times in three. The sweep is read off where the gum
 * *landed* and the way it is going rather than off where it came from —
 * `fromCol` is a fact about the picture and outside the fingerprint, and a hit
 * test that read it would be a hit test two devices could disagree about.
 *
 * A gum that reaches the mouth is gone: the tube has it, and `slack` goes up
 * for good. Then THE SLOW, because the design asks for it by name — *the
 * fling is a SLOW* — and the beat it crosses its last column is the best shot
 * in the fight.
 */
function throatChoked(world: World, b: ThroatState): void {
  const cfg = world.cfg;
  if (b.phase === "everts") return;
  const mouth = throatMouthCol(cfg, b, world.beat);
  const row = throatMouthRow(cfg);
  const taken: number[] = [];
  for (const c of world.creatures) {
    if (!gumIsFlung(c) || c.row !== row) continue;
    const past = (c.col - mouth) * rockHeading(c);
    if (past < 0 || past >= cfg.gumFlingCols) continue;
    taken.push(c.id);
  }
  if (taken.length === 0) return;
  removeCreatures(world, taken);
  b.slack = Math.min(cfg.throatRings, b.slack + taken.length);
  b.chokedBeat = world.beat;
  if (throatSpent(cfg, b)) return;
  openSlow(world, cfg.slowBeats);
}

/**
 * **Whatever is standing in the mouth on an inhale beat**, swallowed — and
 * every one of them re-tightens a ring.
 *
 * All of them rather than one, which is the design's own step 10: *the throat
 * eats the pod and two rings re-tighten*. A boss that healed once however much
 * it was fed would make the field's own pressure free, and the field's pressure
 * is the entire threat here.
 *
 * `throatHasHold` rather than a column test written out again, so the body the
 * fall loop refused to drop and the body the mouth takes are decided by one
 * rule (`throat-pull.ts`).
 */
function throatFed(world: World, b: ThroatState): void {
  const row = throatMouthRow(world.cfg);
  const mouth = throatMouthCol(world.cfg, b, world.beat);
  const eaten: number[] = [];
  for (const c of world.creatures) {
    if (c.row !== row || !occupiesCol(c, mouth)) continue;
    if (!throatHasHold(world, b, c)) continue;
    eaten.push(c.id);
  }
  if (eaten.length === 0) return;
  removeCreatures(world, eaten);
  b.slack = Math.max(0, b.slack - eaten.length);
  b.fedBeat = world.beat;
}
