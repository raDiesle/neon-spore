import type { BossState, World } from "@neon-spore/sim";
import { viseCues } from "./boss-cue-read-zf.js";
import { rimeCues } from "./boss-cue-read-zg.js";
import { capstanCues } from "./boss-cue-read-zl.js";
import { gallCues } from "./boss-cue-read-zm.js";
import { trapezeCues } from "./boss-cue-read-zn.js";
import { flueCues } from "./boss-cue-read-zo.js";
import { valveCues } from "./boss-cue-read-zp.js";
import { governorCues } from "./boss-cue-read-zq.js";
import { seamCues } from "./boss-cue-read-zr.js";
import { lampreyCues } from "./boss-cue-read-zs.js";
import { mimicCues } from "./boss-cue-read-zt.js";
import { latchCues } from "./boss-cue-read-zu.js";
import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";
import { plumbCues } from "./plumb-marks.js";

/**
 * **The choreographed bosses, from THE VISE on, each read**: a boss left to
 * `bossCues`'s `default` is a boss nobody has read, so a kind is named here
 * only once its page is written. The list moved out of `boss-cue.ts`'s switch
 * on 8 October 2026, when THE LATCH would have taken that file near 250 lines.
 */
const CHOREO_KINDS: ReadonlySet<BossState["kind"]> = new Set([
  "vise",
  "rime",
  "plumb",
  "capstan",
  "gall",
  "trapeze",
  "flue",
  "valve",
  "governor",
  "seam",
  "lamprey",
  "mimic",
  "latch",
]);

/** Whether `boss` is one of the choreographed kinds whose page is in this file. */
export function isChoreo(boss: BossState): boolean {
  return CHOREO_KINDS.has(boss.kind);
}

/**
 * **The choreographed bosses' half of `bossCue`'s switch**, cut out of
 * `boss-cue.ts` on 27 September 2026, when THE TRAPEZE's page would have
 * taken it past 250 lines.
 */
export function choreoCues(
  l: Layout,
  world: World,
  boss: BossState,
  beatPhase: number,
  /** This device's input delay, in ticks, for a cue that rides something drawn ahead (`ViewState.leadTicks`). */
  lead = 0,
): readonly BossCue[] {
  switch (boss.kind) {
    // THE VISE's, a word on each lobe a lit step asks to be dragged shut, gone once it is shut, and one under the lit kernel (`boss-cue-read-zf.ts`).
    case "vise":
      return viseCues(l, world, boss, beatPhase);
    // THE RIME's, a word under the lit core and one where the shield is wanted (`boss-cue-read-zg.ts`).
    case "rime":
      return rimeCues(l, world, boss, beatPhase);
    // THE PLUMB's, `LEVEL` on the glass a seat's phone is asked level,
    // `BOTH` across the pair once a step asks both, and `FIRE` once the core
    // is lit (`plumb-marks.ts`).
    case "plumb":
      return plumbCues(l, world, boss, beatPhase);
    // THE CAPSTAN's, a lean to the seat that steers until the band is round, a rub to the other on the bared face, and one under the bared core (`boss-cue-read-zl.ts`).
    case "capstan":
      return capstanCues(l, world, boss, beatPhase);
    // THE GALL's, a pinch on the nodule to the seat whose half it sits on, jumping with it, gone once it is shut, and one under the bared root (`boss-cue-read-zm.ts`).
    case "gall":
      return gallCues(l, world, boss);
    // THE TRAPEZE's, a tap on the ring to the freezer until the flag is still, a swipe on the track to the seat that draws, and one under the lit spindle (`boss-cue-read-zn.ts`).
    case "trapeze":
      return trapezeCues(l, world, boss);
    // THE FLUE's, a call at the sight to the pilot who sees the ember, and a shot at it to the navigator who fires (`boss-cue-read-zo.ts`).
    case "flue":
      return flueCues(l, world, boss);
    // THE VALVE's, a turn on the wheel to the pilot, a freeze on the socket to the navigator, a pull on the live pin to either, and one under the spark (`boss-cue-read-zp.ts`).
    case "valve":
      return valveCues(l, world, boss, beatPhase);
    // THE GOVERNOR's, a tap on each seat's open mark to that seat, and one under the lit hub (`boss-cue-read-zq.ts`).
    case "governor":
      return governorCues(l, world, boss, beatPhase, lead);
    // THE SEAM's, a shield under the ridge while grit falls and a fire under the lit point or the rock, and nothing on the false point or the dark (`boss-cue-read-zr.ts`).
    case "seam":
      return seamCues(l, world, boss, beatPhase);
    // THE LAMPREY's, a hold on the jaw's band to the pinner until the thumb is on it, a tap on the lit tooth to the tapper, and one under the lit gullet (`boss-cue-read-zs.ts`).
    case "lamprey":
      return lampreyCues(l, world, boss, beatPhase);
    // THE MIMIC's, a call over the sign to the seat that sees it, a draw on the pad to the seat that owes it, and one under the bare core (`boss-cue-read-zt.ts`).
    case "mimic":
      return mimicCues(l, world, boss, beatPhase);
    // THE LATCH's, a pull on the grip whose turn it is and a hold on the other, both a hold while it rears (`boss-cue-read-zu.ts`).
    case "latch":
      return latchCues(l, world, boss);
    default:
      return [];
  }
}
