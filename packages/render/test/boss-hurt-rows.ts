import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  instarBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { BossHurt } from "../src/boss-hurt.js";
import type { Effects } from "../src/effects.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * **The rows of `boss-hurt.test.ts`**, one per boss that wears the blow, in
 * the order the bosses were built — cut out of the test when THE VANE's row
 * arrived and the file stood a hundred lines over its ceiling (26 September
 * 2026). This page runs to THE TASTER; `boss-hurt-rows-b.ts` has the rest,
 * and the test spreads the two in that order.
 */

export interface Row {
  boss: Parameters<typeof waveWith>[0];
  /** The events that mean a sequence landed; each deals the blow. */
  land: SimEvent[];
  /** One part of a sequence, which does not. */
  part: SimEvent[];
  /**
   * Each counted hit short of a landing, which deals the lighter blow
   * (`BossHurt.jab`) — the owner, 27 September 2026: *when correctly hit,
   * there must be a clear visual every time*. A boss whose landing is one hit
   * already, or a hold with no hit in it, says so here instead.
   */
  hit: SimEvent[] | string;
  hurt: (fx: Effects) => BossHurt;
  /** The world on a frame where the body is up; four beats in if not given. */
  world?: () => World;
}

export const HURT_ROWS: Row[] = [
  {
    boss: "instar",
    land: [
      { type: "instarLand", step: 0, col: 3 },
      { type: "instarDown", col: 3 },
    ],
    part: [{ type: "instarDone", mark: 0, part: "jaw", col: 3 }],
    hit: "an instarAnswer on a shoot mark, which only the placed marks know: instar-hurt.test.ts",
    hurt: (fx) => fx.boss.instar.hurt,
    world: instarMorphing,
  },
  {
    boss: "warden",
    land: [
      { type: "plate", col: 3, row: 2, left: 2, color: "red" },
      { type: "wardenDown", col: 3, row: 2 },
    ],
    part: [{ type: "wardenSlam", col: 3 }],
    hit: "one plate is one bolt, and landed",
    hurt: (fx) => fx.boss.warden.hurt,
  },
  {
    boss: "spool",
    land: [
      { type: "spoolRib", ribs: 3, col: 3 },
      { type: "spoolSlack", col: 3 },
    ],
    part: [{ type: "spoolLeg", leg: 0, col: 3 }],
    hit: "a movement is a hold, with no hit in it",
    hurt: (fx) => fx.boss.spool.hurt,
  },
  {
    boss: "hasp",
    land: [{ type: "haspOpen", hasps: 2, col: 3 }],
    part: [{ type: "haspGrip", col: 3 }],
    hit: "a hasp is a wind, with no hit in it",
    hurt: (fx) => fx.boss.hasp.hurt,
  },
  {
    boss: "sinew",
    land: [
      { type: "sinewPart", fibres: 2, row: 3, col: 3 },
      { type: "sinewFall", row: 3, col: 3 },
    ],
    part: [{ type: "sinewEnter", col: 3 }],
    hit: "a fibre is a hold, with no hit in it",
    hurt: (fx) => fx.boss.sinew.hurt,
  },
  {
    boss: "gimbal",
    land: [
      { type: "gimbalShear", teeth: 2, col: 3 },
      { type: "gimbalHatch", col: 3 },
    ],
    part: [{ type: "gimbalTrue", col: 3 }],
    hit: "a tooth pair is a hold, with no hit in it",
    hurt: (fx) => fx.boss.gimbal.hurt,
  },
  {
    boss: "ratchet",
    land: [
      { type: "ratchetClick", teeth: 6, clean: 1, col: 5 },
      { type: "ratchetOpen", col: 5 },
    ],
    part: [{ type: "ratchetSet", col: 5 }],
    hit: "one tooth is one press, and landed",
    hurt: (fx) => fx.boss.ratchet.hurt,
  },
  {
    boss: "hive",
    land: [
      { type: "hiveSeal", left: 3, col: 3 },
      { type: "hiveDown", col: 3 },
    ],
    part: [{ type: "hiveOpen", color: "red", col: 3 }],
    hit: "one seal is one bolt, and landed",
    hurt: (fx) => fx.boss.hive.hurt,
  },
  {
    boss: "gorge",
    // A bubble sated, a level cleared, the last level done.
    land: [
      { type: "gorgeFull", color: "red", row: 5, col: 3 },
      { type: "gorgeCleared", level: 0, row: 5, col: 3 },
      { type: "gorgeOut", beads: 0, row: 5, col: 3 },
    ],
    part: [{ type: "gorgeTap", left: 2, row: 7, col: 5 }],
    // A shot of its colour into a bubble that still wants more.
    hit: [{ type: "gorgeSwallow", color: "red", beads: 1, row: 5, col: 3 }],
    hurt: (fx) => fx.boss.gorge.hurt,
  },
  {
    boss: "surge",
    land: [
      { type: "surgeVent", notches: 1, row: 3, col: 5 },
      { type: "surgeEvert", row: 4, col: 5 },
    ],
    part: [{ type: "surgeNear", col: 5 }],
    hit: "a vent is a charge let go, with no hit in it",
    hurt: (fx) => fx.boss.surge.hurt,
  },
  {
    boss: "taster",
    land: [
      { type: "tasterShear", left: 5, col: 3 },
      { type: "tasterOut", color: "red", col: 3 },
    ],
    part: [{ type: "tasterPin", col: 3 }],
    // A layer off a thickened blade, a beam of the interlock's need; a cut in
    // the crest works toward the lift, which is no blow.
    hit: [
      { type: "tasterPare", layers: 1, col: 3 },
      { type: "tasterPryFill", color: "red", owed: 1, col: 3 },
    ],
    hurt: (fx) => fx.boss.taster.hurt,
  },
];

export function fourBeatsIn(boss: Row["boss"]): () => World {
  return () => {
    const world = createWorld(CFG, 3);
    const index = waveWith(boss);
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
    return world;
  };
}

/** THE INSTAR at the start of its second step's morph: no mark is up yet. */
function instarMorphing(): World {
  const world = fourBeatsIn("instar")();
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = 1;
  s.phase = "morph";
  s.phaseBeat = world.beat;
  return world;
}
