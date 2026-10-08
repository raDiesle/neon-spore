import { markMoment } from "./balance.js";
import {
  BASTION_SPAN,
  bastionBoss,
  bastionCharging,
  bastionDone,
  bastionFrontGun,
  bastionLayerOn,
  bastionLitStep,
  bastionNext,
  bastionPieceCol,
} from "./bastion.js";
import { bastionTakes } from "./bastion-step.js";
import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken } from "./core-verdict.js";
import { isqrt } from "./handle-pull.js";
import { guardArmed } from "./hull-guard.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BASTION's shot**, met where the moon hangs (`core-along.ts`) up the
 * middle column and up the open port's, and anywhere else where it leaves the
 * top of the field (`shot-out.ts`).
 *
 * - **The ring**: the gun turned to the front, over the middle column, in
 *   its own colour. The wrong colour is a colour missed, and the gun stays.
 * - **The port**: the open port's column, in either colour — the bolt goes
 *   down it into the inner hull.
 * - Anything else of the moon, any shell, is armour: met, and nothing.
 *
 * What it says of a bolt is `bastionVerdict`, which the picture asks too.
 */
export function bastionStruck(world: World, bullet: Bullet): boolean {
  const s = bastionBoss(world);
  const verdict = bastionVerdict(world, bullet.col, bullet.color);
  if (s === null || verdict === null) return false;
  const step = bastionLitStep(s);
  const target = bastionTarget(world);
  const asked = step === null || target === null ? null : { ask: "fire", color: target.color };
  if (!coreTaken(world, verdict, asked) || step === null || target === null) return true;
  const type = step.layer === "ring" ? "bastionGun" : "bastionPort";
  world.events.push({ type, piece: target.piece, col: bullet.col });
  bastionTakes(world, s, target.piece);
  return true;
}

/** What the lit shell asks a bolt to hit: the piece, its column and its colour. */
export function bastionTarget(
  world: World,
): { piece: number; col: number; color: Color | "either" } | null {
  const s = bastionBoss(world);
  const step = s === null ? null : bastionLitStep(s);
  if (s === null || step === null) return null;
  if (step.layer === "ring") {
    const piece = bastionFrontGun(world, s);
    const color = step.colors?.[piece];
    return piece < 0 || color === undefined ? null : { piece, col: midCol(world.cfg), color };
  }
  if (step.layer !== "port") return null;
  const piece = bastionNext(s);
  return piece < 0 ? null : { piece, col: bastionPieceCol(world, s, piece), color: "either" };
}

/**
 * Where the moon is met up a column of its own (`core-along.ts`), in
 * thousandths of a row: the gun turned to the front up the middle while the
 * ring is lit, the open port up its column while the hull is, laid off the
 * moon's `centre`. Each is met `MEET_MILLI` short of this row, four tenths of
 * a row past where the picture stands it (`render/bastion-shape.ts`), so a
 * bolt is drawn reaching it on a frame before it is judged.
 */
export function bastionAside(world: World, centre: number): { col: number; milli: number } | null {
  const target = bastionTarget(world);
  const s = bastionBoss(world);
  const layer = s === null ? null : bastionLitStep(s)?.layer;
  if (target === null || s === null) return null;
  if (layer === "ring") return { col: target.col, milli: centre + BASTION_GUN_DOWN + BASTION_PAST };
  const offset = target.col - midCol(world.cfg);
  return { col: target.col, milli: centre + bastionPortDown(offset) + BASTION_PAST };
}

/** The hull's radius and the share of it down its face the ports sit on, as the picture lays them. */
const BASTION_PORT_R_MILLI = 2100;
const BASTION_PORT_FACE_MILLI = 600;
/** The gun at the front, under the centre by the ring's drop and its near half. */
const BASTION_GUN_DOWN = 1380;
/** The aside's row under its picture: `MEET_MILLI`, less four tenths of a row. */
const BASTION_PAST = 100;

/** How far under the centre a port `offset` columns out is drawn, on the hull's lower face. */
function bastionPortDown(offset: number): number {
  const dx = offset * 1000;
  const root = isqrt(Math.max(0, BASTION_PORT_R_MILLI ** 2 - dx * dx));
  return Math.round((root * BASTION_PORT_FACE_MILLI) / 1000);
}

/**
 * What a bolt of `color` in `col` meets of the moon: the target in its
 * colour, the wrong colour on it, armour anywhere else the moon covers, or
 * nothing past its edge. Pure, so the picture asks it where a bolt stops.
 */
export function bastionVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = bastionBoss(world);
  if (s === null || bastionDone(s)) return null;
  const layer = bastionLayerOn(s);
  const mid = midCol(world.cfg);
  if (layer === null || Math.abs(col - mid) > BASTION_SPAN[layer]) return null;
  const target = bastionTarget(world);
  if (target === null || target.col !== col) return "armour";
  return target.color === "either" || target.color === color ? "target" : "wrong";
}

/**
 * **THE BASTION's shield**, asked once a tick after the commands are heard —
 * THE SEAM's test (`seam-guard.ts`): a node charging is answered by the
 * shield standing under it while it is armed, raised after the node began to
 * charge. The lightning is thrown back up and the node bursts, on the tick.
 */
export function bastionGuarded(world: World): void {
  const s = bastionBoss(world);
  if (s === null || !bastionCharging(s)) return;
  const i = bastionNext(s);
  const col = bastionPieceCol(world, s, i);
  if (world.shieldCol !== col || !guardArmed(world) || world.guardTick < s.chargeTick) return;
  world.guard.tries += 1;
  world.guard.deflected += 1;
  markMoment(world, true);
  world.events.push({ type: "bastionBurst", piece: i, col });
  bastionTakes(world, s, i);
}
