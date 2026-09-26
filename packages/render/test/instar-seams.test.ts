import { describe, expect, it } from "bun:test";
import type { InstarState, World } from "@neon-spore/sim";
import { instarFire } from "../src/instar-ebb.js";
import { type Figure, instarFigure, instarThreat } from "../src/instar-shape.js";
import { acting, hung, TPB } from "./instar-kit.js";

/**
 * **No step of THE INSTAR's script snaps into the next.** Walked a tick at a
 * time from the last beat of each window, through its landing, the next
 * step's morph and into its window, no part of the figure and not the fire in
 * the mouth moves further in one tick than a change ever moves it: the pose
 * that comes next is reached through its in-betweens (`instar-between.ts`),
 * and what a window built up ebbs over the landing (`instarEbb`).
 */

/** The most any value may move in one tick: positions in fields, the rest in their own 0..1. */
const STEP = 0.05;

type Frame = { f: Figure; fire: number; at: string };

function walk(world: World, s: InstarState, from: number): Frame[] {
  const out: Frame[] = [];
  let held = 0;
  const beats = (phase: InstarState["phase"], cursor: number, first: number, n: number) => {
    s.cursor = cursor;
    s.phase = phase;
    const start = world.beat;
    s.phaseBeat = start - first;
    for (let b = 0; b < n; b++)
      for (let k = 0; k < TPB; k++) {
        const beat = start + b;
        const f = instarFigure(s, beat, k / TPB, held);
        out.push({ f, fire: instarFire(s, f, beat, k / TPB, held), at: `${cursor} ${phase}` });
      }
  };
  const prev = s.steps[from]!;
  const next = s.steps[from + 1]!;
  s.progress = prev.marks.map((m) => m.need);
  beats("act", from, prev.windowBeats - 1, 1);
  // The window's run on its last tick is what the landing holds (`InstarFx.held`).
  s.phase = "act";
  s.phaseBeat = world.beat - (prev.windowBeats - 1);
  held = instarThreat(s, world.beat, (TPB - 1) / TPB);
  world.beat += 1;
  beats("land", from, 0, prev.landBeats);
  world.beat += prev.landBeats;
  held = 0;
  s.progress = next.marks.map(() => 0);
  beats("morph", from + 1, 0, next.morphBeats);
  world.beat += next.morphBeats;
  beats("act", from + 1, 0, 1);
  return out;
}

describe("THE INSTAR from one step to the next", () => {
  const world = hung();
  const s = acting(world, 0);
  const n = s.steps.length;

  it("moves every part and the fire by a little each tick, step after step", () => {
    const base = world.beat;
    for (let c = 0; c + 1 < n; c++) {
      world.beat = base;
      const frames = walk(world, s, c);
      for (let i = 1; i < frames.length; i++) {
        const a = frames[i - 1]!;
        const b = frames[i]!;
        const where = `${s.steps[c]!.pose} into ${s.steps[c + 1]!.pose}, ${a.at} to ${b.at}`;
        expect(Math.abs(b.fire - a.fire), `the fire, ${where}`).toBeLessThan(STEP);
        for (const k of Object.keys(a.f) as (keyof Figure)[]) {
          const unit = k.endsWith("X") || k.endsWith("Y") || k === "headR" ? 1000 : 1;
          expect(Math.abs(b.f[k] - a.f[k]) / unit, `${k}, ${where}`).toBeLessThan(STEP);
        }
      }
    }
  });
});
