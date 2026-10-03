import { describe, expect, it } from "bun:test";
import { antiphonStruck, antiphonVerdict } from "../src/antiphon-shot.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { hiveStruck, hiveVerdict } from "../src/hive-shot.js";
import { createWorld, startWave, step, ticksPerBeat } from "../src/index.js";
import { leadBoss } from "../src/lead.js";
import { leadStruck, leadVerdict } from "../src/lead-shot.js";
import { ledgerStruck, ledgerVerdict } from "../src/ledger-shot.js";
import type { Bullet, Color } from "../src/types.js";
import type { World } from "../src/world.js";

/**
 * **A boss's verdict is its shot asked, not acted on**, for THE ANTIPHON,
 * HIVE, LEAD and LEDGER: the picture stops a bolt where it meets the body
 * with the answer the shot will give it at row 0, so the two must never
 * disagree, and asking must change nothing. Each fight is left to run with
 * no one at the controls and asked, every beat, about every column in both
 * colours, on a copy of the world.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const BEATS = 48;

interface Case {
  name: string;
  kind: "antiphon" | "hive" | "lead" | "ledger";
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

const CASES: Case[] = [
  { name: "THE ANTIPHON", kind: "antiphon", verdict: antiphonVerdict, struck: antiphonStruck },
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
];

function bolt(col: number, color: Color): Bullet {
  return { id: 999, col, row: 0, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

describe.each(CASES)("$name's verdict", (c) => {
  it("changes nothing, and agrees with its shot on every column, colour and beat", () => {
    const world = createWorld({ ...CFG }, 3);
    startWave(world, 6, [], [], { kind: c.kind });
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
