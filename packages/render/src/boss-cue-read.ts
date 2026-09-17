import {
  type CandleState,
  CURTAIN_COLS,
  type CurtainState,
  candleEating,
  carryIsReady,
  curtainBody,
  curtainCoreBare,
  type GorgeState,
  gorgeFull,
  gorgeNearestFull,
  gorgePhase,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { candleGlowY } from "./candle-glow.js";
import { gorgeIntakeY } from "./gorge-draw.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * **What THE CANDLE, THE GORGE and THE CURTAIN are asking for**, read off
 * their own state and turned into at most one word each.
 *
 * The rules every reading here obeys are `boss-cue.ts`'s, and the one worth
 * repeating beside the code is the third: **a mark stands only on something
 * this seat is already shown**. Each cue below names the `showsX` predicate
 * that makes it true, because that is the line between a cue and the pair's
 * own sentence — a frame is a *place*, and a place handed to the seat that
 * was not given it is the other half of their picture, taken.
 *
 * Nothing here is held between frames, nothing here reaches `world`, and
 * every number it reads is one the simulation already keeps.
 */

/** How far a cue's frame reaches, in tiles: THE CHOIR's, which is the one
 * shipped frame of this shape and the size a pair has already met. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/** A frame around one tile's worth of a thing. */
function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  wide = 1,
): BossCue {
  return {
    seat,
    kind,
    word,
    x,
    y,
    halfW: l.tile * HALF_W * wide,
    halfH: l.tile * HALF_H,
    seed,
  };
}

/**
 * THE CANDLE. Two things are ever wanted of this fight, and they are the two
 * halves of it: somebody has to fire up the column the light is in, and the
 * pilot has to be somewhere else when it is eating.
 *
 * `FIRE` hangs on the glow, which is **both** seats' picture — the halo is
 * drawn on every screen (`candle-glow.ts`), and it is the only light there
 * is. `MOVE` hangs on the cannon and is the pilot's alone, for the reason the
 * cone is (`showsCandleFace`): he is the seat shown the column the flame is
 * turned to, so a cue about standing in it says nothing his own screen has
 * not already told him. It says `MOVE` and not which way, which is the
 * sentence the fight exists to cause.
 */
export function candleCues(l: Layout, world: World, c: CandleState): readonly BossCue[] {
  if (c.phase === "dark" || c.phase === "out") return [];
  const out: BossCue[] = [];
  // Most urgent: a flash the boss is about to swallow, and the pilot is the
  // only one who can see it coming.
  if (candleEating(c) && world.cannonCol === c.faceCol) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 31));
  }
  out.push(markAt(2, "PRESS", "FIRE", tileCX(l, c.col), candleGlowY(l), l, 32));
  return out;
}

/**
 * THE GORGE. The fight is *stop shooting*, so the cue is silent while it is
 * being fed: there is nothing to do, and a word standing over a sack that
 * wants to be left alone would be the boss asking for its own dinner.
 *
 * It speaks at the two moments something is owed. `PIERCE` over the intake
 * that has come full, and `BURN` over the mouth — both on the navigator, who
 * is the seat that fires, holds the lance, and is already shown which intake
 * is nearest (`showsGorgeNearest`).
 */
export function gorgeCues(l: Layout, world: World, g: GorgeState): readonly BossCue[] {
  const cfg = world.cfg;
  const phase = gorgePhase(g, cfg);
  if (phase === "out") return [];
  const y = gorgeIntakeY(l, g, cfg);
  if (phase === "gorged" && g.mouth >= 0) {
    return [markAt(2, "HOLD", "BURN", tileCX(l, g.col + g.mouth), y, l, 33)];
  }
  const near = gorgeNearestFull(g);
  const intake = near < 0 ? undefined : g.intakes[near];
  if (intake === undefined || !gorgeFull(intake, cfg)) return [];
  return [markAt(2, "PRESS", "PIERCE", tileCX(l, g.col + near), y, l, 34)];
}

/**
 * THE CURTAIN. Two words, and the whole encounter is which of them is true.
 *
 * `SHOVE` is **either seat's**, because the carry is (`grip-push.ts`): a
 * thumb on the fabric moves it whoever it belongs to, and the frame stands on
 * the sheet, which both screens are drawn. It is silent while the body is in
 * the beat of quiet a carry costs (`carryIsReady`), so the word appears only
 * on a beat a hand can actually spend.
 *
 * `FIRE` is the navigator's, and it stands on the core — which is *her*
 * picture and not his (`showsCurtainShadow`). On the pilot's screen, where
 * the core is only a suspicion, there is no mark and no word.
 */
export function curtainCues(l: Layout, world: World, c: CurtainState): readonly BossCue[] {
  if (c.outBeat >= 0) return [];
  const y = tileCY(l, world.cfg.curtainRow);
  if (curtainCoreBare(world, c)) {
    return [markAt(2, "PRESS", "FIRE", tileCX(l, c.coreCol), y, l, 35)];
  }
  const body = curtainBody(world, c);
  if (body === undefined || !carryIsReady(world, body)) return [];
  return [
    markAt(null, "CARRY", "SHOVE", tileCX(l, body.col + (CURTAIN_COLS - 1) / 2), y, l, 36, 2),
  ];
}
