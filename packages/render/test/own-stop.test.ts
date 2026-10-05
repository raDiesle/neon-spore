import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type BossState,
  type Color,
  type CoreVerdict,
  createWorld,
  hiveVerdict,
  leadVerdict,
  ledgerVerdict,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawAntiphon } from "../src/antiphon-draw.js";
import { AntiphonFx } from "../src/antiphon-fx.js";
import { type BoltHit, BoltStops } from "../src/bolt-stop.js";
import { drawHive } from "../src/hive-draw.js";
import { HiveFx } from "../src/hive-fx.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { drawLead } from "../src/lead-draw.js";
import { LeadFx } from "../src/lead-fx.js";
import { leadRidgeY } from "../src/lead-shape.js";
import { drawLedger } from "../src/ledger-draw.js";
import { LedgerFx } from "../src/ledger-fx.js";
import { ledgerBodyY } from "../src/ledger-shape.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for the bosses whose shot is not a core
 * over the middle column and whose stopper is their own: each fight left to
 * run with no one at the controls, drawn on every screen with the bolts'
 * stops, and asked every few beats about every column in both colours. The
 * hit is what its verdict says, and nothing is met where it says nothing;
 * the stop is within a bolt's reach — a drawn bolt climbs no higher than
 * half a tile over the top row (`bullets.ts`) — and no lower than the body
 * reaches into the field.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const BEATS = 40;
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

interface Row {
  name: string;
  kind: "antiphon" | "hive" | "lead" | "ledger";
  /** What the picture shows a bolt meeting, by the boss's verdict; `null` for clear air. */
  hit: (world: World, col: number, color: Color) => BoltHit | null;
  draw: (l: Layout, world: World, stops: BoltStops) => void;
  /** The screen y of the body's lowest edge, the lowest a stop may be; the top row's edge if unsaid. */
  reach?: (l: Layout) => number;
  /** What a fight left to run shows at least once. */
  shows: BoltHit;
}

/** A body spanning the field: every column meets it, armour or nothing as its shell. */
const spans =
  (verdict: (world: World, col: number, color: Color) => CoreVerdict) =>
  (w: World, col: number, color: Color): BoltHit => {
    const v = verdict(w, col, color);
    return v === "target" || v === "wrong" ? v : "body";
  };

const ROWS: Row[] = [
  {
    // Nothing on it is shot since the redesign of 5 October 2026: every
    // column meets the body's underside, and nothing more.
    name: "THE ANTIPHON",
    kind: "antiphon",
    hit: () => "body",
    draw: (l, w, stops) =>
      drawAntiphon(paper(), l, w, boss(w, "antiphon"), w.beat, 0.5, 0, new AntiphonFx(), stops),
    shows: "body",
  },
  {
    name: "THE HIVE",
    kind: "hive",
    hit: spans(hiveVerdict),
    draw: (l, w, stops) =>
      drawHive(paper(), l, w, boss(w, "hive"), w.beat, 0.5, 0, new HiveFx(), stops),
    shows: "target",
  },
  {
    // The ridge spans the field; a bolt in flight is drawn on out of it.
    name: "THE LEAD",
    kind: "lead",
    hit: (w, col) => (leadVerdict(w, col) === "flight" ? "pass" : "body"),
    draw: (l, w, stops) =>
      drawLead(paper(), l, w, boss(w, "lead"), w.beat, 0.5, 0, new LeadFx(), stops),
    // Short of room above the grid, the ridge comes down into the top row.
    reach: (l) => leadRidgeY(l, CFG).bottom + l.tile * 0.05,
    shows: "pass",
  },
  {
    name: "THE LEDGER",
    kind: "ledger",
    hit: (w, col, color) => {
      const v = ledgerVerdict(w, col, color);
      return v === null ? null : spans(ledgerVerdict)(w, col, color);
    },
    draw: (l, w, stops) =>
      drawLedger(paper(), l, w, boss(w, "ledger"), w.beat, 0.5, 0, new LedgerFx(), stops),
    reach: (l) => ledgerBodyY(l).bottom,
    shows: "target",
  },
];

function boss<K extends BossState["kind"]>(w: World, kind: K): Extract<BossState, { kind: K }> {
  const b = w.boss;
  if (b === null || b.kind !== kind) throw new Error(`no ${kind}`);
  return b as Extract<BossState, { kind: K }>;
}

describe.each(ROWS)("$name stops a bolt", (row) => {
  it.each(ROLES)("on what it draws over each column, as its verdict says, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const world = createWorld({ ...CFG }, 3);
    startWave(world, 6, [], [], { kind: row.kind });
    const hits = new Set<BoltHit>();
    for (let beat = 0; beat < BEATS; beat++) {
      for (let t = 0; t < TPB; t++) step(world, []);
      if (beat % 4 !== 3) continue;
      const stops = new BoltStops();
      row.draw(l, world, stops);
      for (let col = 0; col < CFG.cols; col++) {
        for (const color of ["red", "cyan"] as const) {
          const at = stops.meets(col, tileCX(l, col), color);
          expect([beat, col, at?.hit ?? null]).toEqual([beat, col, row.hit(world, col, color)]);
          if (at === null) continue;
          expect(at.y).toBeGreaterThan(l.gridTop - l.tile * 0.5);
          expect(at.y).toBeLessThanOrEqual(row.reach?.(l) ?? l.gridTop);
          hits.add(at.hit);
        }
      }
    }
    expect(hits.has(row.shows)).toBe(true);
  });
});
