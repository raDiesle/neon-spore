import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { livingPoints, livingSilhouette } from "@neon-spore/content";
import { hitFor } from "../src/body-hit.js";
import { BREAK_LOOK, fallFrom, fractureFrom } from "../src/break-look.js";
import { livingScale } from "../src/creature-place.js";
import { Debris } from "../src/debris.js";
import { breakSparks } from "../src/effects-break.js";
import { computeLayout } from "../src/layout.js";
import { shatter } from "../src/shatter.js";
import { shardAt } from "../src/shatter-fall.js";
import {
  PINWHEEL,
  SPIN_BREAK,
  SPIN_BREAKS,
  spinBreakFor,
  TUMBLE,
  VORTEX,
  WRING,
} from "../src/spin-break.js";
import { tileSeed } from "../src/tile-seed.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SLICK's and THE BULB's turning deaths (`spin-break.ts`).
 *
 * Whether a whirl reads as cool is the owner's eye and `bun run breaks`. What
 * is held here is what can go wrong unseen: that both phones pick the same
 * one, that every one of them is reachable, that a whirl starts from the body
 * whole and ends with nothing left, and that the pinwheel really holds
 * together while it winds up.
 */

const SLICK = livingSilhouette("slick");
const OUTLINE = livingPoints(SLICK, 0);
const SCALE = livingScale(SLICK, 20);
const TILE = 40;

function piecesFor(seed: number) {
  return shatter(OUTLINE, fractureFrom(BREAK_LOOK, TILE / SCALE, seed));
}

beforeAll(() => installCanvasGlobals());

describe("which way a kill turns", () => {
  it("is the slick's and the bulb's, and nobody else's", () => {
    expect(hitFor("slick").pieces).toBe(SPIN_BREAK);
    expect(hitFor("bulb").pieces).toBe(SPIN_BREAK);
    expect(hitFor("dart").pieces).toBe(BREAK_LOOK);
    expect(hitFor("slick", "echo").pieces).toBe(BREAK_LOOK);
  });

  it("is the same look for the same tile, every time", () => {
    for (let col = 0; col < 5; col++) {
      const seed = tileSeed(col, 7);
      expect(spinBreakFor(seed)).toBe(spinBreakFor(seed));
      expect(SPIN_BREAK.pick?.(seed)).toBe(spinBreakFor(seed));
    }
  });

  it("reaches every look across a field of tiles", () => {
    const seen = new Set();
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 16; row++) seen.add(spinBreakFor(tileSeed(col, row)));
    }
    expect(seen.size).toBe(SPIN_BREAKS.length);
  });

  it("keeps the shipped flash", () => {
    const kill = { type: "destroy", col: 2, row: 9, color: "red", kind: "slick" } as const;
    expect(breakSparks(kill as never, 10)).toBe(Math.round(10 * BREAK_LOOK.sparkScale));
  });
});

describe("a whirl", () => {
  const fallOf = (look: typeof VORTEX) => fallFrom(look, TILE / SCALE);

  it("starts from the body whole, every look", () => {
    const pieces = piecesFor(41);
    for (const look of SPIN_BREAKS) {
      const flight = look.flight ?? shardAt;
      for (const s of pieces) {
        const p = flight(s, 0, fallOf(look));
        expect(p.x).toBeCloseTo(s.x, 6);
        expect(p.y).toBeCloseTo(s.y, 6);
        expect(p.alpha).toBe(1);
      }
    }
  });

  it("leaves nothing once its life is over", () => {
    const pieces = piecesFor(41);
    for (const look of [VORTEX, PINWHEEL, WRING]) {
      const flight = look.flight as NonNullable<typeof look.flight>;
      for (const s of pieces) {
        const p = flight(s, look.life + 0.5, fallOf(look));
        expect(p.alpha).toBe(0);
        expect(p.landed).toBe(false);
        expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
      }
    }
  });

  it("holds the pinwheel together while it winds up, then flings it", () => {
    const pieces = piecesFor(41);
    const flight = PINWHEEL.flight as NonNullable<typeof PINWHEEL.flight>;
    const f = fallOf(PINWHEEL);
    // The widest the break is: the farthest any two pieces are apart.
    const span = (t: number) => {
      const at = pieces.map((p) => flight(p, t, f));
      let most = 0;
      for (const a of at)
        for (const b of at) most = Math.max(most, Math.hypot(a.x - b.x, a.y - b.y));
      return most;
    };
    // Rigid through the hold: a turn moves every piece and parts none.
    expect(span(0.15)).toBeCloseTo(span(0), 6);
    expect(flight(pieces[0] as (typeof pieces)[number], 0.15, f).angle).not.toBe(0);
    // And apart after it.
    expect(span(0.8)).toBeGreaterThan(span(0) * 1.25);
  });

  it("wrings the core against the rind", () => {
    const pieces = piecesFor(41);
    const flight = WRING.flight as NonNullable<typeof WRING.flight>;
    const f = fallOf(WRING);
    const core = pieces.find((s) => s.depth < 0.5);
    const rind = pieces.find((s) => s.depth >= 0.5);
    expect(core && rind).toBeTruthy();
    const a = flight(core as never, 0.1, f).angle;
    const b = flight(rind as never, 0.1, f).angle;
    expect(Math.sign(a)).toBe(-Math.sign(b));
  });

  it("tumbles faster than the shipped drift", () => {
    expect(TUMBLE.spin).toBeGreaterThan(BREAK_LOOK.spin * 3);
  });
});

describe("a slick's death, through a canvas that refuses what a real one does", () => {
  const L = computeLayout(VIEWPORT, CFG, "test");

  it("draws its pieces while they turn and forgets them after", () => {
    for (const look of SPIN_BREAKS) {
      const debris = new Debris();
      debris.break({
        look,
        outline: OUTLINE,
        scale: SCALE,
        x: 100,
        y: 200,
        tile: L.tile,
        floor: L.hullY,
        hex: "#ff3366",
        dark: "#330011",
        seed: 41,
      });
      debris.update(0.3);
      const flying = stubCanvas();
      debris.draw(flying.ctx as unknown as CanvasRenderingContext2D);
      expect(flying.ctx.calls).toBeGreaterThan(0);
      debris.update(look.life);
      const gone = stubCanvas();
      debris.draw(gone.ctx as unknown as CanvasRenderingContext2D);
      expect(gone.ctx.calls).toBe(0);
    }
  });
});
