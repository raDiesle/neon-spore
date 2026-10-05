import type { World } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import { drawFlue } from "./flue-draw.js";
import { drawGovernor } from "./governor-draw.js";
import { drawLamprey } from "./lamprey-draw.js";
import type { Layout } from "./layout.js";
import { drawMimic } from "./mimic-draw.js";
import type { ViewState } from "./renderer.js";

/**
 * **The clock bosses, drawn — page five**: the pairs from THE FLUE on, each
 * two halves of one fight with one half to a seat, as page four's are.
 *
 * Cut from `boss-draw-clocks-d.ts` on 2 October 2026, when every boss there
 * taking the bolts it stops (`bolt-stop.ts`) had brought that page to within
 * thirty lines of the ceiling. The cut is where the page was full, and the
 * next pair appends here.
 *
 * **The order inside is the order they were built in** and nothing depends on
 * it: every arm returns, and no two of these bosses are ever installed at once.
 */

/** Whichever boss is installed, once the null is out of the way. */
type Installed = NonNullable<World["boss"]>;

/** The kinds this file draws. Appended, like every list of boss kinds. */
export const LATEST_PAIR_KINDS = ["flue", "governor", "lamprey", "mimic"] as const;

export type LatestPairBoss = Extract<Installed, { kind: (typeof LATEST_PAIR_KINDS)[number] }>;

/** Whether this is one of them — a guard, for `isClockBoss`'s reason. */
export function isLatestPairBoss(boss: Installed): boss is LatestPairBoss {
  return (LATEST_PAIR_KINDS as readonly string[]).includes(boss.kind);
}

export function drawLatestPairBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: LatestPairBoss,
  /** Whichever of `effects.boss` is this boss's (`effects-boss.ts`). */
  effects: Effects,
): void {
  const { world } = view;
  const { beat } = world;
  const { beatPhase, time } = view;

  // THE FLUE: a slotted flue across the field, its ember running end to end
  // on the pilot's screen alone, and a sight over the held cannon where the
  // navigator's shot must meet it (`flue-draw.ts`); a hit's flash and a
  // stud's flare are `flue-fx.ts`.
  if (boss.kind === "flue") {
    drawFlue(ctx, l, world, boss, beat, beatPhase, time, effects.boss.flue);
    return;
  }

  // THE GOVERNOR: a flywheel's needle sweeping on its own under a flyball
  // governor, braked by one seat's chord on the yoke and tapped by the other
  // on the lit mark, the hub it turns on shot (`governor-draw.ts`); its
  // marks' verdicts on a touch are `governor-verdicts.ts`.
  if (boss.kind === "governor") {
    drawGovernor(ctx, l, world, boss, beat, beatPhase, time, effects.boss.governor, effects.bolts);
    return;
  }

  // THE LAMPREY: an eel bitten onto the hull and crawling along it, held
  // under by one seat while the other taps its lit tooth out, then reared
  // with its gullet lit and shot (`lamprey-draw.ts`); its marks' verdicts on
  // a touch are `lamprey-verdicts.ts`.
  if (boss.kind === "lamprey") {
    drawLamprey(ctx, l, world, boss, beat, beatPhase, time, effects.boss.lamprey);
    return;
  }

  // THE MIMIC: a mantle over the top of the field wearing a sign on one
  // screen and mottle on the other, the pad on the drawer's, split on its
  // lit core at the last (`mimic-draw.ts`); its receipts are `mimic-fx.ts`.
  drawMimic(ctx, l, world, boss, beat, beatPhase, time, effects.boss.mimic);
}
