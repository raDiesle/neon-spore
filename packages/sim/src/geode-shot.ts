import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken } from "./core-verdict.js";
import { GEODE_SPAN, geodeBoss, geodeCracksIn, geodeDone, geodeLitStep } from "./geode.js";
import { geodeCuts } from "./geode-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GEODE's shot**, met where it leaves the top of the field
 * (`shot-out.ts`) or where the beam burns its column (`lance-burn.ts`).
 *
 * - **A beam down a crack in its colour** cuts every whole piece of that
 *   colour whose crack runs down the column — two stacked are two cut, one
 *   beam, which is THE LANCE's own lesson.
 * - **A beam down a crack of the other colour only**: a colour missed, and the
 *   wave lost for it (`boss-wrong-colour.ts`, the owner's default of 10
 *   October 2026). A column with both colours in it is never wrong: the beam
 *   takes its own.
 * - **A bolt, anywhere on the stone, or a beam where no crack runs**: chipped
 *   rock, met and nothing. Only the lance cuts stone.
 *
 * What it says of a shot is `geodeVerdict`, which the picture asks too.
 */
export function geodeStruck(world: World, bullet: Bullet): boolean {
  const s = geodeBoss(world);
  const verdict = geodeVerdict(world, bullet.col, bullet.color, bullet.lance);
  if (s === null || verdict === null) return false;
  const col = bullet.col;
  const asked = { ask: "fire", color: bullet.color };
  if (verdict === "armour") {
    world.events.push({ type: "geodeChip", lance: bullet.lance, col });
    return true;
  }
  if (!coreTaken(world, verdict, asked)) {
    world.events.push({ type: "geodeWrong", color: bullet.color, col });
    return true;
  }
  const level = s.cursor;
  const step = geodeLitStep(s);
  for (const i of geodeCracksIn(world, s, col)) {
    if (step?.cracks[i]?.color !== bullet.color) continue;
    world.events.push({ type: "geodeCleave", level, piece: i, color: bullet.color, col });
    geodeCuts(world, s, i);
  }
  return true;
}

/**
 * What a shot of `color` in `col` meets of the geode: a crack of its colour
 * (`"target"`, a beam only), a crack of the other colour alone (`"wrong"`, a
 * beam only), stone anywhere else it covers (`"armour"`), or nothing while it
 * is still sinking in or once it is shattered. Pure, so the picture asks it
 * where a bolt stops.
 */
export function geodeVerdict(world: World, col: number, color: Color, lance: boolean): CoreVerdict {
  const s = geodeBoss(world);
  if (s === null || geodeDone(s) || s.phase === "enter") return null;
  if (Math.abs(col - midCol(world.cfg)) > GEODE_SPAN) return null;
  const step = geodeLitStep(s);
  if (!lance || step === null) return "armour";
  const here = geodeCracksIn(world, s, col);
  if (here.length === 0) return "armour";
  return here.some((i) => step.cracks[i]?.color === color) ? "target" : "wrong";
}
