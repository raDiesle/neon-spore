import { describe, expect, it } from "bun:test";
import { GLYPHS } from "@neon-spore/sim";
import { recogniseGlyph, type StrokePoint } from "../src/glyph-stroke.js";

/**
 * THE MIMIC's recogniser: a stroke on the glass is the nearest of the five
 * signs, or nothing (`glyph-stroke.ts`). The strokes here are drawn the way a
 * thumb draws, not the way the templates are: a different size, a different
 * place to start, the other way round, tilted, stretched and shaking — and a
 * tap, a line and a scribble are none of the five.
 */

const sign = (name: (typeof GLYPHS)[number]): number => GLYPHS.indexOf(name);

/** A polyline through `corners`, ten points to a side, the way a pointer samples one. */
function through(corners: [number, number][]): StrokePoint[] {
  const out: StrokePoint[] = [];
  for (let i = 1; i < corners.length; i++) {
    const [ax, ay] = corners[i - 1] as [number, number];
    const [bx, by] = corners[i] as [number, number];
    for (let k = 0; k < 10; k++)
      out.push({ x: ax + (k / 10) * (bx - ax), y: ay + (k / 10) * (by - ay) });
  }
  const [lx, ly] = corners[corners.length - 1] as [number, number];
  out.push({ x: lx, y: ly });
  return out;
}

/** Tilted, stretched and shaking: a thumb's copy, deterministic. */
function shaky(at: StrokePoint[], tilt = 0.15, stretch = 1.1, shake = 6): StrokePoint[] {
  const [c, s] = [Math.cos(tilt), Math.sin(tilt)];
  return at.map((p, i) => ({
    x: p.x * stretch * c - p.y * s + shake * Math.sin(i * 1.7),
    y: p.x * stretch * s + p.y * c + shake * Math.cos(i * 2.3),
  }));
}

function ring(start: number, way: 1 | -1, of = 1): StrokePoint[] {
  return Array.from({ length: 41 }, (_, i) => {
    const a = start + way * (i / 40) * Math.PI * 2 * of;
    return { x: 100 + 90 * Math.cos(a), y: 100 + 80 * Math.sin(a) };
  });
}

const wave = (way: 1 | -1): StrokePoint[] =>
  Array.from({ length: 40 }, (_, i) => ({
    x: i * 6,
    y: 60 - way * 50 * Math.sin((i / 39) * Math.PI * 2),
  }));

const hook = (): StrokePoint[] => [
  ...through([
    [150, 0],
    [150, 130],
  ]),
  ...Array.from({ length: 15 }, (_, i) => ({
    x: 100 + 50 * Math.cos((i / 14) * Math.PI),
    y: 130 + 45 * Math.sin((i / 14) * Math.PI),
  })),
];

describe("a stroke is the nearest of the five", () => {
  it("knows a ring, round either way, begun anywhere, and not quite closed", () => {
    expect(recogniseGlyph(ring(0, 1))).toBe(sign("ring"));
    expect(recogniseGlyph(ring(1, -1))).toBe(sign("ring"));
    expect(recogniseGlyph(ring(0, 1, 0.9))).toBe(sign("ring"));
    expect(recogniseGlyph(shaky(ring(2, 1)))).toBe(sign("ring"));
  });

  it("knows a triangle from its apex or a corner", () => {
    const apex = through([
      [100, 0],
      [200, 170],
      [0, 170],
      [100, 0],
    ]);
    const corner = through([
      [0, 170],
      [100, 0],
      [200, 170],
      [0, 170],
    ]);
    expect(recogniseGlyph(apex)).toBe(sign("triangle"));
    expect(recogniseGlyph(corner)).toBe(sign("triangle"));
    expect(recogniseGlyph(shaky(apex))).toBe(sign("triangle"));
  });

  it("knows a zigzag, a W or an M", () => {
    const w = through([
      [0, 0],
      [60, 110],
      [100, 10],
      [160, 120],
      [200, 0],
    ]);
    const m = through([
      [0, 120],
      [50, 0],
      [100, 120],
      [150, 0],
      [200, 120],
    ]);
    expect(recogniseGlyph(w)).toBe(sign("zigzag"));
    expect(recogniseGlyph(m)).toBe(sign("zigzag"));
    expect(recogniseGlyph(shaky(w))).toBe(sign("zigzag"));
  });

  it("knows a wave, starting up or down", () => {
    expect(recogniseGlyph(wave(1))).toBe(sign("wave"));
    expect(recogniseGlyph(wave(-1))).toBe(sign("wave"));
    expect(recogniseGlyph(shaky(wave(1)))).toBe(sign("wave"));
  });

  it("knows a hook, either way round", () => {
    expect(recogniseGlyph(hook())).toBe(sign("hook"));
    expect(recogniseGlyph(hook().map((p) => ({ x: 200 - p.x, y: p.y })))).toBe(sign("hook"));
    expect(recogniseGlyph(shaky(hook()))).toBe(sign("hook"));
  });
});

describe("a stroke that is no sign sends nothing", () => {
  it("is a tap, or a twitch too short to be a sign", () => {
    expect(recogniseGlyph([{ x: 10, y: 10 }])).toBe(-1);
    expect(recogniseGlyph([])).toBe(-1);
    expect(
      recogniseGlyph(
        through([
          [0, 0],
          [10, 5],
          [3, 8],
        ]),
      ),
    ).toBe(-1);
  });

  it("is a straight line or a scribble, far from all five", () => {
    expect(
      recogniseGlyph(
        through([
          [0, 0],
          [200, 5],
        ]),
      ),
    ).toBe(-1);
    expect(
      recogniseGlyph(
        through([
          [0, 0],
          [3, 200],
        ]),
      ),
    ).toBe(-1);
    const scribble = Array.from({ length: 60 }, (_, i) => ({
      x: 100 + 80 * Math.sin(i * 0.9),
      y: 100 + 80 * Math.cos(i * 1.37),
    }));
    expect(recogniseGlyph(scribble)).toBe(-1);
  });
});
