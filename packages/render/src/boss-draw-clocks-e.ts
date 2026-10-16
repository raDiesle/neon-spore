import type { World } from "@neon-spore/sim";
import { drawBastion } from "./bastion-draw.js";
import { drawBrood } from "./brood-draw.js";
import { drawChrysalis } from "./chrysalis-draw.js";
import type { Effects } from "./effects.js";
import { drawFlue } from "./flue-draw.js";
import { drawGeode } from "./geode-draw.js";
import { drawGovernor } from "./governor-draw.js";
import { drawHydra } from "./hydra-draw.js";
import { drawLamprey } from "./lamprey-draw.js";
import { lampreyStopper } from "./lamprey-stop.js";
import { drawLatch } from "./latch-draw.js";
import type { Layout } from "./layout.js";
import { drawMatron } from "./matron-draw.js";
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
export const LATEST_PAIR_KINDS = [
  "flue",
  "governor",
  "lamprey",
  "mimic",
  "latch",
  "bastion",
  "chrysalis",
  "hydra",
  "brood",
  "matron",
  "geode",
] as const;

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
  // governor, each seat tapping its own mark as the needle crosses it, the
  // hub it turns on shot as it points down (`governor-draw.ts`); its
  // marks' verdicts on a touch are `governor-verdicts.ts`.
  if (boss.kind === "governor") {
    const lead = view.leadTicks ?? 0;
    drawGovernor(
      ctx,
      l,
      world,
      boss,
      { beat, beatPhase, time, lead },
      effects.boss.governor,
      effects.bolts,
    );
    return;
  }

  // THE LAMPREY: an eel bitten onto the hull and crawling along it, held
  // under by one seat while the other taps its lit tooth out, then reared
  // with its gullet lit and shot, a bolt stopping in it (`lamprey-stop.ts`,
  // `lamprey-draw.ts`); its marks' verdicts on
  // a touch are `lamprey-verdicts.ts`.
  if (boss.kind === "lamprey") {
    const p = drawLamprey(ctx, l, world, boss, beat, beatPhase, time, effects.boss.lamprey);
    effects.bolts.aim(lampreyStopper(world, boss, p));
    return;
  }

  // THE MIMIC: a mantle over the top of the field wearing a sign on one
  // screen and mottle on the other, the pad on the drawer's, split on its
  // lit core at the last (`mimic-draw.ts`); its receipts are `mimic-fx.ts`.
  if (boss.kind === "mimic") {
    drawMimic(ctx, l, world, boss, beat, beatPhase, time, effects.boss.mimic);
    return;
  }

  // THE LATCH: a colony hung over the field by a tendril hooked into the
  // hull, hauled down hand over hand on its two grips, a body torn off it at
  // every knot (`latch-draw.ts`); its grips' verdicts on a touch are
  // `latch-verdicts.ts`.
  if (boss.kind === "latch") {
    drawLatch(ctx, l, world, boss, beat, beatPhase, time, effects.boss.latch);
    return;
  }

  // THE BASTION: a metal moon in four shells, each its own metal and its
  // own machine, taken off from the outside in (`bastion-draw.ts`); its
  // receipts are `bastion-fx.ts`, and a bolt stops on it (`bastion-stop.ts`).
  if (boss.kind === "bastion") {
    drawBastion(ctx, l, world, boss, beat, beatPhase, time, effects.boss.bastion, effects.bolts);
    return;
  }

  // THE CHRYSALIS: a living cocoon in four skins, each its own tissue and
  // its own job, peeled from the outside in (`chrysalis-draw.ts`); its
  // receipts are `chrysalis-fx.ts`, and a bolt stops on it (`chrysalis-stop.ts`).
  if (boss.kind === "chrysalis") {
    drawChrysalis(
      ctx,
      l,
      world,
      boss,
      beat,
      beatPhase,
      time,
      effects.boss.chrysalis,
      effects.bolts,
    );
    return;
  }

  // THE BROOD: a sac of slime over the middle growing slicks and bulbs on
  // stalks off its belly, each shot in its colour before it drops
  // (`brood-draw.ts`); its receipts are `brood-fx.ts`.
  if (boss.kind === "brood") {
    drawBrood(ctx, l, world, boss, beat, beatPhase, time, effects.boss.brood);
    return;
  }

  // THE MATRON: a mother slime over the middle, a lobe down to every pod she
  // holds and the eggs of the clutches to come inside her (`matron-draw.ts`);
  // her receipts are `matron-fx.ts`.
  if (boss.kind === "matron") {
    drawMatron(ctx, l, world, boss, beat, beatPhase, time, effects.boss.matron);
    return;
  }

  // THE GEODE: a slab of stone as wide as the field, cut by the lance a
  // level of pieces at a time down to its crystal heart, a bolt stopping on
  // it as grit (`geode-draw.ts`); its receipts are `geode-fx.ts`.
  if (boss.kind === "geode") {
    drawGeode(ctx, l, world, boss, beat, beatPhase, time, effects.boss.geode, effects.bolts);
    return;
  }

  // THE HYDRA: a slime with many heads, each level its own kind of head and
  // its own gesture (`hydra-draw.ts`); its receipts are `hydra-fx.ts`.
  drawHydra(ctx, l, world, boss, beat, beatPhase, time, effects.boss.hydra, effects.bolts);
}
