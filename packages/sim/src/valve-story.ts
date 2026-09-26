import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { ValvePhase, ValveState } from "./valve.js";
import type { World } from "./world.js";

/**
 * **THE VALVE's story between the pins** (§25 rows 5–6, 12–13, 17–19): four
 * states that turn three pulls into a drum that answers each one.
 *
 * - **The jet.** The first pin's empty socket blows back. Either thumb taps
 *   the pin — an edge, a thumb already resting there lifts first — inside
 *   `valveJetBeats`, and the jet is capped; the spark leaks after it. Left
 *   open, it blows against the hull and blows again.
 * - **The brace.** The second pin out and the drum shudders. Both thumbs
 *   hold the pin together for `valveBraceBeats` beats in a row, counted on
 *   the beat, and it stills. Unbraced by `valveShudderBeats`, a plate shakes
 *   loose against the hull and the shudder starts again.
 * - **The wipe.** The last pin out and a film weeps over the face. Either
 *   thumb rubs the pin back and forth, `valveWipeRubs` reversals between
 *   them, and the face runs dry. Still slick after `valveWipeBeats`, it
 *   smears against the hull and the film comes back whole.
 * - **The seal.** Wiped, the bare seal strains. Both thumbs hold the pin for
 *   `valveSealBeats` beats and the face opens clean; run out
 *   `valveStrainBeats` and it blows open rough, against the hull. Either way
 *   the face is open — the fight's end is not taken away, only its price.
 *
 * Every window opens whenever a pin comes out, mid-beat, so each closes once
 * `since` is *past* its beats and THE SLOW is opened one beat longer — the
 * rule the freeze and the pull already keep (`valve-step.ts`).
 */

/** A new phase, from this beat, with both chord and film counted afresh. */
function enter(world: World, s: ValveState, phase: ValvePhase): void {
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.chordBeats = 0;
}

/** The first pin is out: its socket blows back. */
export function openJet(world: World, s: ValveState): void {
  enter(world, s, "jet");
  openSlow(world, world.cfg.valveJetBeats + 1, "ask");
  world.events.push({ type: "valveJet", col: midCol(world.cfg) });
}

/** The second pin is out: the drum shudders. */
export function openBrace(world: World, s: ValveState): void {
  enter(world, s, "brace");
  openSlow(world, world.cfg.valveShudderBeats + 1, "ask");
  world.events.push({ type: "valveShudder", col: midCol(world.cfg) });
}

/** The last pin is out: a film weeps over the face. */
export function openWipe(world: World, s: ValveState): void {
  enter(world, s, "wipe");
  s.wiped = 0;
  openSlow(world, world.cfg.valveWipeBeats + 1, "ask");
  world.events.push({ type: "valveFilm", col: midCol(world.cfg) });
}

function openSeal(world: World, s: ValveState): void {
  enter(world, s, "seal");
  openSlow(world, world.cfg.valveStrainBeats + 1, "ask");
  world.events.push({ type: "valveStrain", col: midCol(world.cfg) });
}

/** A tap on the pin while the jet blows: capped, and the spark leaks after it. */
export function valveCapped(world: World, s: ValveState, leak: () => void): void {
  closeSlow(world);
  world.events.push({ type: "valveCap", col: midCol(world.cfg) });
  leak();
  enter(world, s, "list");
}

/** A beat of the jet: run out, it blows against the hull and again. */
export function stepJet(world: World, s: ValveState, since: number): void {
  if (since <= world.cfg.valveJetBeats) return;
  const mid = midCol(world.cfg);
  world.events.push({ type: "valveBlow", col: mid });
  bossStrikesHull(world, "valve", mid);
  openJet(world, s);
}

/** A beat of the brace: the chord counted, then stilled, run out, or neither. */
export function stepBrace(world: World, s: ValveState, since: number): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  s.chordBeats = s.held[0] && s.held[1] ? s.chordBeats + 1 : 0;
  if (s.chordBeats >= cfg.valveBraceBeats) {
    closeSlow(world);
    world.events.push({ type: "valveBrace", col: mid });
    enter(world, s, "list");
    return;
  }
  if (since <= cfg.valveShudderBeats) return;
  world.events.push({ type: "valveShake", col: mid });
  bossStrikesHull(world, "valve", mid);
  openBrace(world, s);
}

/**
 * Reversals rubbed on the pin while the film is on: `fresh` of them since
 * the last report (`valve-hand.ts`). Enough between both thumbs and the face
 * runs dry, and the seal is next.
 */
export function valveRubbed(world: World, s: ValveState, fresh: number): void {
  if (s.phase !== "wipe" || fresh <= 0) return;
  s.wiped = Math.min(world.cfg.valveWipeRubs, s.wiped + fresh);
  if (s.wiped < world.cfg.valveWipeRubs) return;
  closeSlow(world);
  world.events.push({ type: "valveDry", col: midCol(world.cfg) });
  openSeal(world, s);
}

/** A beat of the wipe: still slick at the end of it, the film comes back whole. */
export function stepWipe(world: World, s: ValveState, since: number): void {
  if (since <= world.cfg.valveWipeBeats) return;
  const mid = midCol(world.cfg);
  world.events.push({ type: "valveSmear", col: mid });
  bossStrikesHull(world, "valve", mid);
  openWipe(world, s);
}

/** A beat of the seal: held long enough it opens clean, run out it blows rough. */
export function stepSeal(world: World, s: ValveState, since: number): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  s.chordBeats = s.held[0] && s.held[1] ? s.chordBeats + 1 : 0;
  if (s.chordBeats >= cfg.valveSealBeats) {
    closeSlow(world);
    world.events.push({ type: "valveSeal", col: mid });
    valveOpens(world, s);
    return;
  }
  if (since <= cfg.valveStrainBeats) return;
  closeSlow(world);
  world.events.push({ type: "valveRough", col: mid });
  bossStrikesHull(world, "valve", mid);
  valveOpens(world, s);
}

/** The face falls open: the fight is over. */
function valveOpens(world: World, s: ValveState): void {
  enter(world, s, "open");
  world.events.push({ type: "valveOpen", col: midCol(world.cfg) });
}
