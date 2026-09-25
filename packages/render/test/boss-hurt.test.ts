import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  instarBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { BossHurt } from "../src/boss-hurt.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A boss the pair got the better of shows it took the blow — the owner's
 * generic rule of 24 September 2026 (`boss-hurt.ts`): a shake and a red
 * glow on the body for a moment after a sequence lands, and nothing after
 * one part of it alone.
 *
 * **One row per boss that wears it.** A row names the event that means *a
 * sequence landed*, one that is only a part of one, and where its fx class
 * keeps the blow. The frame case runs the same play twice with the landing
 * pushed both times, once with `hit()` stubbed out, so the red it counts is
 * the blow's and not a burst the same event throws.
 */

beforeAll(installCanvasGlobals);
afterEach(() => {
  hitOff?.mockRestore();
  hitOff = null;
});

let hitOff: ReturnType<typeof spyOn> | null = null;

const L = computeLayout(VIEWPORT, CFG, "test");

interface Row {
  boss: Parameters<typeof waveWith>[0];
  /** The events that mean a sequence landed; each deals the blow. */
  land: SimEvent[];
  /** One part of a sequence, which does not. */
  part: SimEvent[];
  hurt: (fx: Effects) => BossHurt;
  /** The world on a frame where the body is up; four beats in if not given. */
  world?: () => World;
}

const ROWS: Row[] = [
  {
    boss: "instar",
    land: [
      { type: "instarLand", step: 0, col: 3 },
      { type: "instarDown", col: 3 },
    ],
    part: [{ type: "instarDone", mark: 0, part: "jaw", col: 3 }],
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
    hurt: (fx) => fx.boss.warden.hurt,
  },
  {
    boss: "spool",
    land: [
      { type: "spoolRib", ribs: 3, col: 3 },
      { type: "spoolSlack", col: 3 },
    ],
    part: [{ type: "spoolLeg", leg: 0, col: 3 }],
    hurt: (fx) => fx.boss.spool.hurt,
  },
  {
    boss: "hasp",
    land: [{ type: "haspOpen", hasps: 2, col: 3 }],
    part: [{ type: "haspGrip", col: 3 }],
    hurt: (fx) => fx.boss.hasp.hurt,
  },
  {
    boss: "sinew",
    land: [
      { type: "sinewPart", fibres: 2, row: 3, col: 3 },
      { type: "sinewFall", row: 3, col: 3 },
    ],
    part: [{ type: "sinewEnter", col: 3 }],
    hurt: (fx) => fx.boss.sinew.hurt,
  },
  {
    boss: "gimbal",
    land: [
      { type: "gimbalShear", teeth: 2, col: 3 },
      { type: "gimbalHatch", col: 3 },
    ],
    part: [{ type: "gimbalTrue", col: 3 }],
    hurt: (fx) => fx.boss.gimbal.hurt,
  },
  {
    boss: "ratchet",
    land: [
      { type: "ratchetClick", teeth: 6, clean: 1, col: 5 },
      { type: "ratchetOpen", col: 5 },
    ],
    part: [{ type: "ratchetSet", col: 5 }],
    hurt: (fx) => fx.boss.ratchet.hurt,
  },
  {
    boss: "hive",
    land: [
      { type: "hiveSeal", left: 3, col: 3 },
      { type: "hiveDown", col: 3 },
    ],
    part: [{ type: "hiveOpen", color: "red", col: 3 }],
    hurt: (fx) => fx.boss.hive.hurt,
  },
  {
    boss: "gorge",
    land: [
      { type: "gorgeRupture", left: 3, col: 3 },
      { type: "gorgeOut", beads: 0, col: 3 },
    ],
    part: [{ type: "gorgeNick", color: "red", owed: 1, col: 3 }],
    hurt: (fx) => fx.boss.gorge.hurt,
  },
  {
    boss: "surge",
    land: [
      { type: "surgeVent", notches: 1, row: 3, col: 5 },
      { type: "surgeEvert", row: 4, col: 5 },
    ],
    part: [{ type: "surgeNear", col: 5 }],
    hurt: (fx) => fx.boss.surge.hurt,
  },
  {
    boss: "taster",
    land: [
      { type: "tasterShear", left: 5, col: 3 },
      { type: "tasterOut", color: "red", col: 3 },
    ],
    part: [{ type: "tasterPare", layers: 1, col: 3 }],
    hurt: (fx) => fx.boss.taster.hurt,
  },
  {
    boss: "undertow",
    land: [
      { type: "undertowTaken", col: 3 },
      { type: "undertowSwallowed", col: 5 },
    ],
    part: [{ type: "undertowBow", col: 3 }],
    hurt: (fx) => fx.boss.undertow.hurt,
    world: undertowStanding,
  },
  {
    boss: "antiphon",
    land: [
      { type: "antiphonPit", shape: 0, pits: 1, col: 3 },
      { type: "antiphonBurst", pits: 4, col: 5 },
    ],
    part: [{ type: "antiphonGrow", shape: 0, organs: 1, col: 3 }],
    hurt: (fx) => fx.boss.antiphon.hurt,
  },
  {
    boss: "ledger",
    land: [
      { type: "ledgerSeam", seam: 1, color: "red", col: 5 },
      { type: "ledgerWhip", seam: 2, col: 5 },
      { type: "ledgerTear", col: 5 },
    ],
    part: [
      { type: "ledgerWard", col: 5 },
      { type: "ledgerRefused", col: 5 },
    ],
    hurt: (fx) => fx.boss.ledger.hurt,
  },
  {
    boss: "lead",
    land: [
      { type: "leadHit", segments: 3, col: 5 },
      { type: "leadDown", col: 5 },
    ],
    part: [
      { type: "leadFlight", dueBeat: 9, col: 5 },
      { type: "leadMiss", col: 5 },
    ],
    hurt: (fx) => fx.boss.lead.hurt,
  },
  {
    boss: "curtain",
    land: [
      { type: "curtainCoreHit", left: 2, col: 5 },
      { type: "curtainOut", col: 5 },
    ],
    part: [
      { type: "curtainLobeOff", left: 6, col: 5 },
      { type: "curtainShove", dir: 1, stride: 1, col: 3 },
    ],
    hurt: (fx) => fx.boss.curtain.hurt,
  },
  {
    boss: "scuttle",
    land: [
      { type: "scuttleStruck", socket: 0, left: 3, col: 4 },
      { type: "scuttleDown", col: 5 },
    ],
    part: [{ type: "scuttleRebuff", col: 4 }],
    hurt: (fx) => fx.boss.scuttle.hurt,
  },
  {
    boss: "fleet",
    land: [
      { type: "fleetWreck", col: 3, row: 2 },
      { type: "fleetSunk", col: 3, row: 2, len: 3, left: 2 },
    ],
    part: [
      { type: "fleetRake", col: 3, row: 2 },
      { type: "fleetHit", col: 3, row: 2 },
    ],
    hurt: (fx) => fx.boss.fleet.hurt,
  },
  {
    boss: "queen",
    land: [{ type: "petal", col: 5, row: 2, left: 3 }],
    part: [{ type: "queenFlinch", col: 4, row: 2, side: -1 }],
    hurt: (fx) => fx.ship.queenHurt,
  },
  {
    boss: "throat",
    land: [
      { type: "throatChoke", col: 3 },
      { type: "throatEvert", col: 3 },
    ],
    part: [
      { type: "throatCinch", col: 3 },
      { type: "throatHaul", col: 3 },
    ],
    hurt: (fx) => fx.boss.blows.throat,
  },
];

describe("the blow a boss takes", () => {
  it("shows at once and is over within half a second", () => {
    const hurt = new BossHurt();
    expect(hurt.value).toBe(0);
    expect(Math.abs(hurt.shakeX(1, 40))).toBe(0);
    hurt.hit();
    expect(hurt.value).toBe(1);
    for (let i = 0; i < 29; i++) hurt.update(1 / 60);
    expect(hurt.value).toBeGreaterThan(0);
    for (let i = 0; i < 2; i++) hurt.update(1 / 60);
    expect(hurt.value).toBe(0);
  });

  for (const row of ROWS) {
    describe(row.boss, () => {
      it("is dealt by a landed sequence, not by one part of it, and forgotten on a restart", () => {
        for (const e of row.land) {
          const fx = new Effects();
          fx.ingest(row.part, L, 0, () => 0, CFG);
          expect(row.hurt(fx).value).toBe(0);
          fx.ingest([e], L, 0, () => 0, CFG);
          expect(row.hurt(fx).value).toBe(1);
          fx.reset();
          expect(fx).toEqual(new Effects());
        }
      });

      it("washes the body red on the frames after a landing", () => {
        const rims = (dealt: boolean): number => {
          if (!dealt) hitOff = spyOn(BossHurt.prototype, "hit").mockImplementation(() => {});
          const world = (row.world ?? fourBeatsIn(row.boss))();
          const log: string[] = [];
          runFrames(world, "p1", 6, {
            every: 3,
            onCanvas: (c) => {
              c.log = log;
            },
            onTick: (tick, w) => {
              step(w, []);
              if (tick === 0) w.events.push(row.land[0] as SimEvent);
            },
          });
          hitOff?.mockRestore();
          hitOff = null;
          return log.join("|").split(PALETTE.redRim).length;
        };
        expect(rims(true)).toBeGreaterThan(rims(false));
      });
    });
  }
});

function fourBeatsIn(boss: Row["boss"]): () => World {
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

/** THE UNDERTOW with a lobe up in a breach: nothing of it shows otherwise. */
function undertowStanding(): World {
  const world = fourBeatsIn("undertow")();
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow wave installed no floor");
  u.breaches.push({
    col: 3,
    stage: "standing",
    stageBeat: world.beat - 2,
    tall: false,
    widthMilli: 0,
    widened: false,
  });
  return world;
}
