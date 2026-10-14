import { type CoreVerdict, coreTaken } from "./core-verdict.js";
import {
  lampreyAsks,
  lampreyBoss,
  lampreyFiring,
  lampreyHeadPull,
  lampreyStep,
} from "./lamprey.js";
import { lampreyRecoiled } from "./lamprey-step.js";
import { lampreyTowAt } from "./lamprey-tow.js";
import type { LampreyState } from "./lamprey-types.js";
import type { Bullet, Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE LAMPREY's shot**: the lit gullet, met where the eel rears — in the
 * column of its tile, on its tile's row (`core-along.ts`) — so the bolt bursts
 * in the mouth and the eel takes it there, rather than flying on through the
 * head to be judged past the top of the field. The owner, 10 October 2026:
 * *the shot should not go through, and in the exact moment of hitting
 * indicate the boss was damaged.*
 *
 * **Anywhere else its head stands, the head is armour**: crawling, bitten
 * into a tile, pulled up off it or recoiling from a hit, a bolt up the head's
 * column bursts on it, costs nothing and is not a wasted shot. Until 14
 * October 2026 it flew on through, and a second bolt fired a moment after a
 * hit met the eel recoiling and was drawn going straight through its head to
 * the top — the owner's complaint, and on HARD a wasted shot that lost the
 * wave. Leaping, crawling in and spent, the head is in no tile, and a bolt
 * meets nothing.
 *
 * **A step with a colour wants that colour**, THE SEAM's rule
 * (`seam-shot.ts`): the other is a colour missed on the balance sheet and the
 * gullet stays lit. The last step is authored `"either"`, the white gullet,
 * and takes both.
 */
export function lampreyStruck(world: World, bullet: Bullet): boolean {
  const s = lampreyBoss(world);
  const head = s === null ? null : lampreyHead(world, s);
  // A bolt already above the head when the gullet lit, or the head came into
  // its column, has gone past it, and reaches the top having met nothing.
  if (s === null || head === null || bullet.row * MILLI < head.milli) return false;
  const verdict = lampreyVerdict(world, bullet.col, bullet.color);
  if (!coreTaken(world, verdict, lampreyStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "lampreyHit", hits: s.hits, col: bullet.col });
  lampreyRecoiled(world, s);
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the eel (`core-verdict.ts`): the
 * lit gullet in its tile's column while it rears, the head's armour in the
 * head's column in any other phase it stands on the field, nothing anywhere
 * else. Pure, so the picture asks it where a bolt stops (`render/lamprey-stop.ts`).
 */
export function lampreyVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = lampreyBoss(world);
  const head = s === null ? null : lampreyHead(world, s);
  if (s === null || head === null || col !== head.col) return null;
  const step = lampreyFiring(s) ? lampreyStep(s) : null;
  if (step === null) return "armour";
  return step.color === "either" || color === step.color ? "target" : "wrong";
}

/** The column and row a bolt meets the head at, for `core-along.ts`, or null while it is in no tile. */
export function lampreyAside(world: World): { col: number; milli: number } | null {
  const s = lampreyBoss(world);
  return s === null ? null : lampreyHead(world, s);
}

/**
 * The head's column, and the highest row it is drawn at this beat in
 * thousandths (`render/lamprey-pose.ts`) — so the simulation meets a bolt at
 * or past where the picture shows it bursting, never short of it, which would
 * be a bolt vanishing in the air. Pulled up off its tile by a thumb, by as
 * much as the pull; towed, wherever along the curve the head has been pulled
 * to; recoiling, at the top of the jerk; crawling, the higher of the tile it
 * left and the tile it is reaching in the beat it moves. Null while it leaps,
 * crawls in from the side or falls away spent.
 */
function lampreyHead(world: World, s: LampreyState): { col: number; milli: number } | null {
  const row = s.row * MILLI;
  switch (s.phase) {
    case "entering":
    case "leap":
    case "spent":
      return null;
    case "feeding":
    case "roam": {
      const from = s.trailRow[0];
      const moving = world.beat === s.headBeat && from !== undefined;
      return { col: s.col, milli: moving ? Math.min(row, from * MILLI) : row };
    }
    case "bite": {
      if (lampreyAsks(s) !== "tow") return { col: s.col, milli: row - lampreyHeadPull(s) };
      const at = lampreyTowAt(world.cfg, s, s.towMilli);
      return { col: s.col + Math.round(at.x / MILLI), milli: row + at.y };
    }
    case "recoil":
      return { col: s.col, milli: row - world.cfg.lampreyRecoilLiftMilli };
    default:
      return { col: s.col, milli: row };
  }
}
