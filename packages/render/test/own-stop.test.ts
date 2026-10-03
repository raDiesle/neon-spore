import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  antiphonVerdict,
  type BossState,
  type Color,
  type CoreVerdict,
  createWorld,
  hiveVerdict,
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
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for the bosses whose shot is not a core
 * over the middle column and whose stopper is their own: each fight left to
 * run with no one at the controls, drawn on every screen with the bolts'
 * stops, and asked every few beats about every column in both colours. Each
 * spans the field, so every column meets it; the hit is what its verdict
 * says; and the stop is within a bolt's reach — a drawn bolt climbs no
 * higher than half a tile over the top row (`bullets.ts`).
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const BEATS = 40;
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

interface Row {
  name: string;
  kind: "antiphon" | "hive";
  verdict: (world: World, col: number, color: Color) => CoreVerdict;
  draw: (l: Layout, world: World, stops: BoltStops) => void;
}

const ROWS: Row[] = [
  {
    name: "THE ANTIPHON",
    kind: "antiphon",
    verdict: antiphonVerdict,
    draw: (l, w, stops) =>
      drawAntiphon(paper(), l, w, boss(w, "antiphon"), w.beat, 0.5, 0, new AntiphonFx(), stops),
  },
  {
    name: "THE HIVE",
    kind: "hive",
    verdict: hiveVerdict,
    draw: (l, w, stops) =>
      drawHive(paper(), l, w, boss(w, "hive"), w.beat, 0.5, 0, new HiveFx(), stops),
  },
];

function boss<K extends BossState["kind"]>(w: World, kind: K): Extract<BossState, { kind: K }> {
  const b = w.boss;
  if (b === null || b.kind !== kind) throw new Error(`no ${kind}`);
  return b as Extract<BossState, { kind: K }>;
}

const said = (v: CoreVerdict): BoltHit => (v === "target" || v === "wrong" ? v : "body");

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
          expect([beat, col, at?.hit]).toEqual([beat, col, said(row.verdict(world, col, color))]);
          expect(at?.y ?? 0).toBeGreaterThan(l.gridTop - l.tile * 0.5);
          expect(at?.y ?? 0).toBeLessThan(l.gridTop);
          if (at) hits.add(at.hit);
        }
      }
    }
    expect(hits.has("target")).toBe(true);
  });
});
