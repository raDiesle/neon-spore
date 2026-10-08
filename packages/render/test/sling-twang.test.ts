import { describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  type SlingState,
  type SlingStep,
  slingBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { slingTip } from "../src/sling-shape.js";
import { SLING_TWANG, SlingRing, slingRung, slingTwang } from "../src/sling-twang.js";
import { FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SLING's tines (`sling-twang.ts`): a true loose rings them through the
 * rest that follows, their tips travelling more than half a tile on the
 * first swing, mirrored, and still before the next step lights; a draw
 * sprung slack or a shot rings nothing.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");
const SCRIPT: readonly SlingStep[] = [
  { ask: "left", aim: "left", color: "either", beats: 2 },
  { ask: "left", aim: "right", color: "either", beats: 2 },
];

function sling(world: World): SlingState {
  const s = slingBoss(world);
  if (s === null) throw new Error("no sling");
  return s;
}

/** Tick until `until`, feeding every event to `ring`. */
function run(world: World, ring: SlingRing, until: (s: SlingState) => boolean): void {
  for (let n = 0; n < TPB * 40 && !until(sling(world)); n++) {
    step(world, []);
    ring.ingest(world.events);
  }
}

function drag(world: World, ring: SlingRing, on: boolean, fromMilli: number): void {
  step(world, [
    {
      tick: world.tick,
      player: 1,
      command: { kind: "drag", target: "slingDrawLeft", on, fromMilli },
    },
  ]);
  ring.ingest(world.events);
}

/** The first step lit, the pilot's arm held its beats, and lifted with `swipe`. */
function loosed(swipe: number): { world: World; s: SlingState; ring: SlingRing } {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "sling", steps: SCRIPT });
  const ring = new SlingRing();
  run(world, ring, (s) => s.phase === "lit");
  drag(world, ring, true, 0);
  run(world, ring, (s) => s.drawnBeats[0] >= 2);
  drag(world, ring, false, swipe);
  return { world, s: sling(world), ring };
}

/** The pilot's tip's travel off its rest, in tiles, signed by the turn, a quarter beat apart through the rest. */
function travel(s: SlingState, rung: boolean): number[] {
  const tip = slingTip(L, 0, 1);
  return Array.from({ length: 40 }, (_, q) => {
    const at = q / 40;
    const ring = slingTwang(s, CFG, rung, s.phaseBeat, at);
    const p = slingRung(tip, 0, ring);
    return (Math.sign(ring) * Math.hypot(p.x - tip.x, p.y - tip.y)) / L.tile;
  });
}

describe("THE SLING's tines ring after a true loose", () => {
  it("rings through the rest, more than half a tile at the first swing, never past the cap", () => {
    const { s, ring } = loosed(-600);
    expect(s.phase).toBe("rest");
    expect(ring.rung).toBe(true);
    const t = travel(s, ring.rung);
    expect(Math.max(...t.map(Math.abs))).toBeGreaterThan(0.5);
    expect(Math.min(...t)).toBeLessThan(0);
    expect(Math.max(...t)).toBeGreaterThan(0);
    const reach = Math.hypot(slingTip(L, 0, 1).x, slingTip(L, 0, 1).y) / L.tile;
    expect(Math.max(...t.map(Math.abs))).toBeLessThanOrEqual(2 * reach * Math.sin(SLING_TWANG / 2));
  });

  it("is still by the time the next draw is asked for", () => {
    const { world, s, ring } = loosed(-600);
    expect(slingTwang(s, CFG, ring.rung, s.phaseBeat + CFG.slingRestBeats, 0)).toBe(0);
    run(world, ring, (x) => x.phase === "lit");
    expect(ring.rung).toBe(false);
    expect(slingTwang(s, CFG, ring.rung, world.beat, 0.1)).toBe(0);
  });

  it("swings the two tines as mirrors", () => {
    const { s, ring } = loosed(-600);
    const turn = slingTwang(s, CFG, ring.rung, s.phaseBeat, 0.1);
    const a = slingRung(slingTip(L, 0, 1), 0, turn);
    const b = slingRung(slingTip(L, 1, 1), 1, turn);
    expect(b.x).toBeCloseTo(-a.x, 9);
    expect(b.y).toBeCloseTo(a.y, 9);
  });

  it("rings nothing for a draw sprung slack the wrong way", () => {
    const { s, ring } = loosed(600);
    expect(ring.rung).toBe(false);
    expect(slingTwang(s, CFG, ring.rung, s.phaseBeat, 0.1)).toBe(0);
  });

  it("is cleared by a shot, a miss and the next step lighting", () => {
    const enders: SimEvent[] = [
      { type: "slingHit", hits: 1, col: 5 },
      { type: "slingMiss", col: 5 },
      { type: "slingLight", ask: "left", aim: "left", col: 5 },
    ];
    for (const end of enders) {
      const ring = new SlingRing();
      ring.ingest([{ type: "slingLoose", side: 0, draws: 1, col: 5 }]);
      expect(ring.rung).toBe(true);
      ring.ingest([end]);
      expect(ring.rung).toBe(false);
    }
  });
});
