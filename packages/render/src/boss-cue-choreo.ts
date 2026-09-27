import type { BossState, World } from "@neon-spore/sim";
import { viseCues } from "./boss-cue-read-zf.js";
import { rimeCues } from "./boss-cue-read-zg.js";
import { trivetCues } from "./boss-cue-read-zh.js";
import { cystCues } from "./boss-cue-read-zi.js";
import { grindstoneCues } from "./boss-cue-read-zj.js";
import { halterCues } from "./boss-cue-read-zk.js";
import { capstanCues } from "./boss-cue-read-zl.js";
import { gallCues } from "./boss-cue-read-zm.js";
import { burgeeCues } from "./boss-cue-read-zn.js";
import { flueCues } from "./boss-cue-read-zo.js";
import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";
import { plumbCues } from "./plumb-marks.js";

/**
 * **The choreographed bosses' half of `bossCue`'s switch**, from THE VISE on.
 * Cut out of `boss-cue.ts` on 27 September 2026, when THE BURGEE's page would
 * have taken it past 250 lines. Every kind here is still named in that switch,
 * because a boss left to its `default` is a boss nobody has read; this file
 * only holds the pages each one is sent to.
 */
export function choreoCues(
  l: Layout,
  world: World,
  boss: BossState,
  beatPhase: number,
): readonly BossCue[] {
  switch (boss.kind) {
    // THE VISE's, a word on each lobe a lit pinch asks for, gone once it is shut, and one under the lit kernel (`boss-cue-read-zf.ts`).
    case "vise":
      return viseCues(l, world, boss, beatPhase);
    // THE RIME's, a word under the lit core and one where the shield is wanted (`boss-cue-read-zg.ts`).
    case "rime":
      return rimeCues(l, world, boss);
    // THE TRIVET's, a word on each foot a lit chord asks for, gone once it is held, and one under the lit hub (`boss-cue-read-zh.ts`).
    case "trivet":
      return trivetCues(l, world, boss, beatPhase);
    // THE PLUMB's, `LEVEL` on the glass a seat's phone is asked level,
    // `BOTH` across the pair once a step asks both, and `FIRE` once the core
    // is lit (`plumb-marks.ts`).
    case "plumb":
      return plumbCues(l, world, boss, beatPhase);
    // THE CYST's, a tap on the lit mark then a pinch on its flank, a pair on a swell, and one at the hull (`boss-cue-read-zi.ts`).
    case "cyst":
      return cystCues(l, world, boss, beatPhase);
    // THE GRINDSTONE's, a rub on the lit flat, a word on each jaw a clamp asks for, gone once it is held, and one under the lit axle (`boss-cue-read-zj.ts`).
    case "grindstone":
      return grindstoneCues(l, world, boss, beatPhase);
    // THE HALTER's, a word between the lit grips to the seat that grips, gone once it is held, nothing to the rester, and one under the bared centre (`boss-cue-read-zk.ts`).
    case "halter":
      return halterCues(l, world, boss, beatPhase);
    // THE CAPSTAN's, a lean to the seat that steers until the band is round, a rub to the other on the bared face, and one under the bared core (`boss-cue-read-zl.ts`).
    case "capstan":
      return capstanCues(l, world, boss, beatPhase);
    // THE GALL's, a pinch on the nodule to the seat whose half it sits on, jumping with it, gone once it is shut, and one under the bared root (`boss-cue-read-zm.ts`).
    case "gall":
      return gallCues(l, world, boss);
    // THE BURGEE's, a tap on the ring to the freezer until the flag is still, a swipe on the track to the seat that draws, and one under the lit spindle (`boss-cue-read-zn.ts`).
    case "burgee":
      return burgeeCues(l, world, boss);
    // THE FLUE's, a word at its middle to each seat asked to keep still, a tap on the ember to the tapper once it has stopped, and one under the bared core (`boss-cue-read-zo.ts`).
    case "flue":
      return flueCues(l, world, boss);
    default:
      return [];
  }
}
