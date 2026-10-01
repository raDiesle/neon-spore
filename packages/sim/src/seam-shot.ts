import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import {
  seamBoss,
  seamHoldsFire,
  seamLitStep,
  seamStepCol,
  seamWantsShield,
  seamWantsShot,
} from "./seam.js";
import { seamAnswered, seamFiredInto } from "./seam-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE SEAM's shot**: a lit point on the ridge, or a rock spat from it, where
 * a bolt leaves the top of the field.
 *
 * Only the lit step takes one, and only in its own column — the middle for a
 * point, the rock's for a rock. **A step with a colour wants that colour**,
 * THE KEEL's socket's rule: the other one is a colour missed on the balance
 * sheet and nothing else, and the step stays lit. A step authored `"either"`
 * takes both, the white point and the last rock.
 *
 * **The glow** takes either colour and more than one shot: it is answered
 * once `seamGlowShots` have landed, each a `seamQuench` with what is left.
 *
 * **The false point and the dark take a bolt too**, of either colour, up the
 * ridge's column — the one thing they ask is that none comes (`seamFiredInto`).
 */
export function seamStruck(world: World, bullet: Bullet): boolean {
  const verdict = seamVerdict(world, bullet.col, bullet.color);
  const s = seamBoss(world);
  const step = s === null ? null : seamLitStep(s);
  if (verdict === null || s === null || step === null) return false;
  if (verdict === "held") {
    seamFiredInto(world, s, step, bullet.col);
    return true;
  }
  if (verdict === "wrong") {
    missedColor(world);
    return true;
  }
  if (step.color !== "either") metColor(world);
  if (step.ask === "glow") {
    // The glow gathers until enough shots have landed on it; each one tells
    // the picture how much is left.
    s.quenched += 1;
    const left = Math.max(0, world.cfg.seamGlowShots - s.quenched);
    world.events.push({ type: "seamQuench", left, col: bullet.col });
    if (left > 0) return true;
  }
  s.shot = true;
  if (step.ask === "point") {
    if (step.seals) {
      s.sealed += 1;
      world.events.push({ type: "seamSeal", sealed: s.sealed, col: bullet.col });
    } else {
      world.events.push({ type: "seamDim", col: bullet.col });
    }
  } else if (step.ask !== "glow") {
    world.events.push({ type: "seamRockOut", col: bullet.col });
  }
  if (!seamWantsShield(s)) seamAnswered(world, s);
  return true;
}

/** What `seamVerdict` says a bolt would meet on the ridge. */
export type SeamVerdict = "target" | "wrong" | "held";

/**
 * **What a bolt in `col` of `color` would meet on the ridge right now**, and
 * nothing done about it: the lit target (`"target"`), the lit target in the
 * wrong colour (`"wrong"`), the false point or the dark up the middle
 * (`"held"`), or no lit step in that column at all (`null`).
 *
 * `seamStruck` is this verdict acted on. It is a function of its own so the
 * picture can stop a bolt where it meets the ridge, with the burst the
 * simulation is about to give it, without a second copy of which column
 * takes what (the owner, 1 October 2026: *a shot hits a graphic … it should
 * have some explosion or damage effect and shot disappears*).
 */
export function seamVerdict(world: World, col: number, color: Color): SeamVerdict | null {
  const s = seamBoss(world);
  if (s === null) return null;
  const step = seamLitStep(s);
  if (step !== null && seamHoldsFire(step) && col === midCol(world.cfg)) return "held";
  // Only a lit step stands in a column: a bolt anywhere else met nothing
  // (`shot-out.ts`).
  if (step === null || !seamWantsShot(s) || col !== seamStepCol(world, step)) return null;
  return step.color !== "either" && color !== step.color ? "wrong" : "target";
}
