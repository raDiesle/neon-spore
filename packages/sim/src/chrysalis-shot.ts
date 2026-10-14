import { markMoment } from "./balance.js";
import {
  CHRYSALIS_SPAN,
  chrysalisBoss,
  chrysalisDone,
  chrysalisLitStep,
  chrysalisNext,
  chrysalisPieceCol,
  chrysalisSkinOn,
  chrysalisSwelling,
} from "./chrysalis.js";
import { chrysalisTakes } from "./chrysalis-step.js";
import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken } from "./core-verdict.js";
import { guardArmed } from "./hull-guard.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CHRYSALIS's shot**, met where it leaves the top of the field
 * (`shot-out.ts`, `lance-burn.ts`).
 *
 * - **The heart**: its column, in the colour it beats in. The wrong colour
 *   loses the wave (`boss-wrong-colour.ts`, the owner's default of 10 October
 *   2026), so the colour the pilot sees is the word the navigator needs.
 * - Anything else of the cocoon, any skin, is hide: met, and nothing.
 *
 * What it says of a bolt is `chrysalisVerdict`, which the picture asks too.
 * A bolt is met where it hangs (`core-along.ts`): up the middle past the
 * innermost skin's foot, and up the heart's own column at its pore
 * (`chrysalisAside`).
 */
export function chrysalisStruck(world: World, bullet: Bullet): boolean {
  const s = chrysalisBoss(world);
  const verdict = chrysalisVerdict(world, bullet.col, bullet.color);
  if (s === null || verdict === null) return false;
  const target = chrysalisTarget(world);
  const asked = target === null ? null : { ask: "fire", color: target.color };
  if (!coreTaken(world, verdict, asked) || target === null) return true;
  world.events.push({ type: "chrysalisHeart", piece: target.piece, col: bullet.col });
  chrysalisTakes(world, s, target.piece);
  return true;
}

/** What the lit skin asks a bolt to hit: the heart's beat, its column and its colour. */
export function chrysalisTarget(world: World): { piece: number; col: number; color: Color } | null {
  const s = chrysalisBoss(world);
  const step = s === null ? null : chrysalisLitStep(s);
  if (s === null || step?.skin !== "heart") return null;
  const piece = chrysalisNext(s);
  const color = step.colors?.[piece];
  return piece < 0 || color === undefined
    ? null
    : { piece, col: chrysalisPieceCol(world, s, piece), color };
}

/**
 * What a bolt of `color` in `col` meets of the cocoon: the heart in its
 * colour, the wrong colour on it, hide anywhere else the cocoon covers, or
 * nothing past its edge. Pure, so the picture asks it where a bolt stops.
 */
export function chrysalisVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = chrysalisBoss(world);
  if (s === null || chrysalisDone(s)) return null;
  const skin = chrysalisSkinOn(s);
  if (skin === null || Math.abs(col - midCol(world.cfg)) > CHRYSALIS_SPAN[skin]) return null;
  const target = chrysalisTarget(world);
  if (target === null || target.col !== col) return "armour";
  return target.color === color ? "target" : "wrong";
}

/**
 * **THE CHRYSALIS's shield**, asked once a tick after the commands are heard
 * — THE BASTION's lattice (`bastionGuarded`): a sac swelling is answered by
 * the shield standing under it while it is armed, raised after the sac began
 * to swell. The spores are thrown back up and the sac bursts, on the tick.
 */
export function chrysalisGuarded(world: World): void {
  const s = chrysalisBoss(world);
  if (s === null || !chrysalisSwelling(s)) return;
  const i = chrysalisNext(s);
  const col = chrysalisPieceCol(world, s, i);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.swellTick) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "chrysalisBurst", piece: i, col });
  chrysalisTakes(world, s, i);
}

/** How far under the cocoon's centre the heart's pores are drawn, thousandths of a row (`render/chrysalis-shape.ts`). */
export const CHRYSALIS_PORE_DOWN_MILLI = 750;
/** The aside's row under its pore: THE BASTION's port's, `MEET_MILLI` less four tenths of a row. */
const CHRYSALIS_PAST = 100;

/** The heart's pore while it beats, up its own column at its own row, for `core-along.ts`. */
export function chrysalisAside(
  world: World,
  centre: number,
): { col: number; milli: number } | null {
  const target = chrysalisTarget(world);
  if (target === null) return null;
  return { col: target.col, milli: centre + CHRYSALIS_PORE_DOWN_MILLI + CHRYSALIS_PAST };
}
