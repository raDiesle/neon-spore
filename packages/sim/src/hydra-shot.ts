import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken } from "./core-verdict.js";
import { HYDRA_SPAN, hydraBoss, hydraDone, hydraLitStep, hydraMawCol, hydraNext } from "./hydra.js";
import { hydraTakes } from "./hydra-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE HYDRA's shot**, met where it leaves the top of the field
 * (`shot-out.ts`, `lance-burn.ts`).
 *
 * - **The open maw**: its column, in the colour of the fire in it. The wrong
 *   colour loses the wave (`boss-wrong-colour.ts`, the owner's default of 10
 *   October 2026), so the colour the pilot sees is the word the navigator
 *   needs — and the column the navigator sees is the word the pilot needs.
 * - Anything else of the hydra — its body, a shut maw, a neck — is hide:
 *   met, and nothing.
 *
 * What it says of a bolt is `hydraVerdict`, which the picture asks too.
 */
export function hydraStruck(world: World, bullet: Bullet): boolean {
  const s = hydraBoss(world);
  const verdict = hydraVerdict(world, bullet.col, bullet.color);
  if (s === null || verdict === null) return false;
  const target = hydraTarget(world);
  const asked = target === null ? null : { ask: "fire", color: target.color };
  if (!coreTaken(world, verdict, asked) || target === null) return true;
  world.events.push({ type: "hydraQuench", piece: target.piece, col: bullet.col });
  hydraTakes(world, s, target.piece);
  return true;
}

/** What the lit level asks a bolt to hit: the open maw, its column and its fire's colour. */
export function hydraTarget(world: World): { piece: number; col: number; color: Color } | null {
  const s = hydraBoss(world);
  const step = s === null ? null : hydraLitStep(s);
  if (s === null || step?.head !== "maw") return null;
  const piece = hydraNext(s);
  const color = step.colors?.[piece];
  return piece < 0 || color === undefined
    ? null
    : { piece, col: hydraMawCol(world, s, piece), color };
}

/**
 * What a bolt of `color` in `col` meets of the hydra: the open maw in its
 * fire's colour, the wrong colour in it, hide anywhere else the body covers,
 * or nothing past its edge. Pure, so the picture asks it where a bolt stops.
 */
export function hydraVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = hydraBoss(world);
  if (s === null || hydraDone(s) || s.phase === "enter") return null;
  if (Math.abs(col - midCol(world.cfg)) > HYDRA_SPAN) return null;
  const target = hydraTarget(world);
  if (target === null || target.col !== col) return "armour";
  return target.color === color ? "target" : "wrong";
}
