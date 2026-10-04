import { describe, expect, it } from "bun:test";
import { antiphonStruck, antiphonVerdict } from "../src/antiphon-shot.js";
import { DEFAULT_CONFIG, midCol } from "../src/config.js";
import { curtainStruck, curtainVerdict } from "../src/curtain-shot.js";
import { gimbalBoss } from "../src/gimbal.js";
import { gimbalStruck, gimbalVerdict } from "../src/gimbal-shot.js";
import { hashWorld } from "../src/hash.js";
import { haspBoss } from "../src/hasp.js";
import { haspStruck, haspVerdict } from "../src/hasp-shot.js";
import { hiveStruck, hiveVerdict } from "../src/hive-shot.js";
import { createWorld, startWave, step, ticksPerBeat } from "../src/index.js";
import { type KeelState, keelBoss } from "../src/keel.js";
import { keelStruck, keelVerdict } from "../src/keel-shot.js";
import { leadBoss } from "../src/lead.js";
import { leadStruck, leadVerdict } from "../src/lead-shot.js";
import { ledgerStruck, ledgerVerdict } from "../src/ledger-shot.js";
import { mantleBoss } from "../src/mantle.js";
import { mantleStruck, mantleVerdict } from "../src/mantle-shot.js";
import { ratchetBoss } from "../src/ratchet.js";
import { ratchetStruck, ratchetVerdict } from "../src/ratchet-shot.js";
import { instarStruck, instarVerdict, nettleStruck, nettleVerdict } from "../src/scene-panel.js";
import { scuttleStruck, scuttleVerdict } from "../src/scuttle-shot.js";
import { stareStruck, stareVerdict } from "../src/stare-shot.js";
import type { Bullet, Color } from "../src/types.js";
import { valveBoss } from "../src/valve.js";
import { valveStruck, valveVerdict } from "../src/valve-shot.js";
import type { World } from "../src/world.js";
import { MARKS } from "./gimbal-harness.js";

/**
 * **A boss's verdict is its shot asked, not acted on**, for every boss in
 * `CASES` whose shot is not `core-verdict.ts`'s: the picture stops a bolt
 * where it meets the body with the answer the shot will give it at row 0, so
 * the two must never disagree, and asking must change nothing. Each fight is
 * left to run with no one at the controls and asked, every beat, about every
 * column in both colours, on a copy of the world.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const BEATS = 48;

interface Case {
  name: string;
  kind:
    | "antiphon"
    | "curtain"
    | "gimbal"
    | "hasp"
    | "hive"
    | "instar"
    | "keel"
    | "lead"
    | "ledger"
    | "mantle"
    | "nettle"
    | "ratchet"
    | "scuttle"
    | "stare"
    | "valve";
  /** What the wave authors for a boss that will not start without it. */
  authored?: object;
  /** Set before the fight is run, for a state no one at the controls would reach. */
  arrange?: (world: World) => void;
  verdict: (world: World, col: number, color: Color) => string | null;
  struck: (world: World, bullet: Bullet) => boolean;
}

const lead: Omit<Case, "name"> = {
  kind: "lead",
  verdict: (w, col) => leadVerdict(w, col),
  struck: leadStruck,
};

/** THE KEEL, set as `arrange` says the beat the fight starts: no one at the controls reaches none of its targets. */
const keel = (name: string, arrange: (s: KeelState, world: World) => void): Case => ({
  name: `THE KEEL, ${name}`,
  kind: "keel",
  authored: { socket: "cyan", reprise: [4, 0] },
  arrange: (world) => {
    const s = keelBoss(world);
    if (s !== null) arrange(s, world);
  },
  verdict: keelVerdict,
  struck: keelStruck,
});

/**
 * A scene of one step with two SHOOT marks, one wanting cyan and one either
 * colour, held up a long window: no one at the controls never reaches a
 * SHOOT step of the real script, so the step is authored and its marks
 * raised by hand, as the scene raises them (`instar-step.ts`).
 */
const scene = (kind: "instar" | "nettle", pose: string, part: string): Omit<Case, "name"> => ({
  kind,
  authored: {
    steps: [
      {
        pose,
        arrive: "stay",
        morphBeats: 1,
        windowBeats: 60,
        landBeats: 2,
        marks: [
          {
            seat: "both",
            part,
            gesture: "shoot",
            xMilli: 318,
            yMilli: 300,
            need: 3,
            color: "cyan",
          },
          { seat: "both", part, gesture: "shoot", xMilli: 681, yMilli: 300, need: 3 },
        ],
      },
    ],
  },
  arrange: (world) => {
    const s = world.boss;
    if (s?.kind !== kind) return;
    s.phase = "act";
    s.phaseBeat = world.beat;
  },
  verdict: kind === "instar" ? instarVerdict : nettleVerdict,
  struck: kind === "instar" ? instarStruck : nettleStruck,
});

const CASES: Case[] = [
  { name: "THE ANTIPHON", kind: "antiphon", verdict: antiphonVerdict, struck: antiphonStruck },
  { name: "THE CURTAIN", kind: "curtain", verdict: curtainVerdict, struck: curtainStruck },
  { name: "THE HIVE", kind: "hive", verdict: hiveVerdict, struck: hiveStruck },
  { name: "THE LEAD, pacing", ...lead },
  {
    name: "THE LEAD, down to the segment only the beam takes",
    ...lead,
    arrange: (world) => {
      const s = leadBoss(world);
      if (s !== null) s.segments = 1;
    },
  },
  { name: "THE LEDGER", kind: "ledger", verdict: ledgerVerdict, struck: ledgerStruck },
  {
    name: "THE GIMBAL, leaking",
    kind: "gimbal",
    authored: { marks: MARKS },
    // No one at the controls never shears a tooth, so the seam is opened by
    // hand, as its last shear opens it (`gimbal-step.ts`).
    arrange: (world) => {
      const s = gimbalBoss(world);
      if (s === null) return;
      s.seamCol = midCol(world.cfg);
      s.seamBeat = world.beat;
    },
    verdict: gimbalVerdict,
    struck: gimbalStruck,
  },
  {
    name: "THE HASP, its bolt loose",
    kind: "hasp",
    // No one at the controls never swings the second hasp, so its spring is
    // thrown by hand, as `hasp-step.ts` throws it.
    arrange: (world) => {
      const s = haspBoss(world);
      if (s === null) return;
      s.boltCol = midCol(world.cfg);
      s.boltBeat = world.beat;
    },
    verdict: haspVerdict,
    struck: haspStruck,
  },
  keel("its socket open", (s, world) => {
    s.phase = "socket";
    s.phaseBeat = world.beat;
  }),
  keel("its marrow lit, one half in", (s, world) => {
    s.phase = "marrow";
    s.phaseBeat = world.beat;
    s.marrow = [true, false];
  }),
  keel("its rock thrown", (s, world) => {
    s.rockCol = 2;
    s.rockBeat = world.beat;
  }),
  {
    name: "THE MANTLE, leaking",
    kind: "mantle",
    authored: { thresholds: [1400, 1700] },
    // No one at the controls never shears a pair, so the spark is leaked by
    // hand, as a shear leaks it (`mantle-step.ts`).
    arrange: (world) => {
      const s = mantleBoss(world);
      if (s === null) return;
      s.sparkCol = midCol(world.cfg);
      s.sparkBeat = world.beat;
    },
    verdict: mantleVerdict,
    struck: mantleStruck,
  },
  {
    name: "THE RATCHET, its bolt loose",
    kind: "ratchet",
    // No one at the controls never winds the spring, so the bolt is thrown by
    // hand, as the half-wound spring throws it (`ratchet-step.ts`).
    arrange: (world) => {
      const s = ratchetBoss(world);
      if (s === null) return;
      s.boltCol = midCol(world.cfg);
      s.boltBeat = world.beat;
    },
    verdict: ratchetVerdict,
    struck: ratchetStruck,
  },
  { name: "THE INSTAR, its SHOOT marks up", ...scene("instar", "breath", "jaw") },
  { name: "THE NETTLE, its SHOOT marks up", ...scene("nettle", "gaze", "spot") },
  { name: "THE SCUTTLE", kind: "scuttle", verdict: scuttleVerdict, struck: scuttleStruck },
  {
    name: "THE STARE",
    kind: "stare",
    authored: { levels: ["x.x."] },
    verdict: stareVerdict,
    struck: stareStruck,
  },
  {
    name: "THE VALVE, leaking",
    kind: "valve",
    authored: { marks: [250, 600] },
    // No one at the controls never pulls a pin, so the spark is leaked by
    // hand, as a pulled pin leaks it (`valve-step.ts`).
    arrange: (world) => {
      const s = valveBoss(world);
      if (s === null) return;
      s.sparkCol = midCol(world.cfg);
      s.sparkBeat = world.beat;
    },
    verdict: valveVerdict,
    struck: valveStruck,
  },
];

function bolt(col: number, color: Color): Bullet {
  return { id: 999, col, row: 0, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

describe.each(CASES)("$name's verdict", (c) => {
  it("changes nothing, and agrees with its shot on every column, colour and beat", () => {
    const world = createWorld({ ...CFG }, 3);
    startWave(world, 6, [], [], { kind: c.kind, ...c.authored } as never);
    c.arrange?.(world);
    const seen = new Set<string | null>();
    for (let beat = 0; beat < BEATS; beat++) {
      for (let t = 0; t < TPB; t++) step(world, []);
      for (let col = 0; col < CFG.cols; col++) {
        for (const color of ["red", "cyan"] as const) {
          const copy = structuredClone(world);
          const before = hashWorld(copy);
          const v = c.verdict(copy, col, color);
          expect(hashWorld(copy)).toBe(before);
          seen.add(v);
          expect([beat, col, color, c.struck(copy, bolt(col, color))]).toEqual([
            beat,
            col,
            color,
            v !== null,
          ]);
        }
      }
    }
    // Something was met on the way: the test asked a boss that was there.
    expect([...seen].some((v) => v !== null)).toBe(true);
  });
});
