import { type MimicState, midCol, mimicFiring, type World } from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";
import { mimicTileAt } from "./mimic-board.js";
import { mimicPose } from "./mimic-pose.js";
import { CORE } from "./mimic-shape.js";

/**
 * **What THE MIMIC is asking for**, page forty-six of the readings: **`TAP`
 * on the core while it is bare**, to either seat, ringing it; its colour is
 * never named.
 *
 * **Nothing round the picture.** `TILES` with `TELL P2 WHERE` to the seat
 * that saw it and `TAP` with `WHERE P1 SAYS` to the seat that owed it were a
 * box round the frame on each screen until 6 October 2026, when the owner
 * asked for the box gone so a picture has the room to grow, and the words on
 * the siren top right instead (`comms-mimic.ts`). The frame the mantle holds
 * says *these tiles* on its own (`mimic-frame-look.ts`).
 *
 * Nothing is said while it slaps into shape, shows a picture, sits mottled,
 * flinches, rolls, clenches or falls.
 */
export function mimicCues(
  l: Layout,
  world: World,
  s: MimicState,
  beatPhase: number,
): readonly BossCue[] {
  if (!mimicFiring(s)) return [];
  const cfg = world.cfg;
  const p = mimicPose(l, cfg, s, world.beat, beatPhase);
  const at = mimicTileAt(l, midCol(cfg), cfg.mimicCoreRow);
  const aim = { x: p.x, y: p.y, r: CORE * p.r };
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  return [{ seat: null, kind: "PRESS", word: "TAP", ...at, ...frame, aim, seed: 230 }];
}
