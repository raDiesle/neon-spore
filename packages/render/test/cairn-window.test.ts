import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { blobRadiusMul, buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CairnState,
  type Creature,
  createWorld,
  startWave,
  type World,
} from "@neon-spore/sim";
import { cairnBody, cairnUnits } from "../src/cairn.js";
import { pilePath } from "../src/cairn-units.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawRockBody } from "../src/meteor.js";
import { meteorLookFor } from "../src/meteor-looks.js";
import { seenFrom, WHOLE, type Window } from "../src/rock-window.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CAIRN's pile, drawn with and without telling each stone's fire where
 * the clip is — and the proof `.claude/skills/render-perf` asks for, that the
 * second picture is the first one: the ordered log of every call the canvas
 * received, with the window, is the log without it **minus whole marks**.
 *
 * A mark skipped is a gradient, a path and a fill that never happen; a mark
 * kept is the same calls with the same arguments in the same order, so a
 * diff that is only removals is a picture that is only what the clip already
 * threw away. The `heldGradient` cache is warmed by the run without the
 * window first, so a gradient built on its first use is built in the same
 * place in both logs.
 */

beforeAll(installCanvasGlobals);

function cairnWorld(units: number): { world: World; body: Creature; boss: CairnState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("cairn");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "cairn") throw new Error("the cairn wave installed no cairn");
  world.boss.units = units;
  const body = cairnBody(world, world.boss);
  if (!body) throw new Error("the cairn wave installed no pile");
  return { world, body, boss: world.boss };
}

/** `livePile`'s loop, with the window chosen by the test rather than by the pile. */
function pileLog(role: ViewRole, units: number, time: number, window: boolean): string[] {
  const { body, boss } = cairnWorld(units);
  const l = computeLayout({ width: 390, height: 844, dpr: 3 }, CFG, role);
  const stack = cairnUnits(l, body, boss.units, time);
  const look = meteorLookFor(body.id);
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  ctx.log = [];
  c.save();
  c.clip(pilePath(stack));
  for (const u of stack) {
    const w: Window = window ? seenFrom(stack, u.x, u.y) : WHOLE;
    drawRockBody(c, u.x, u.y, u.r, time, body.id * 31 + u.slot, 0, look, w);
  }
  c.restore();
  return ctx.log;
}

/** Whether `part` is `whole` with some lines taken out and nothing else changed. */
function isSubsequence(part: readonly string[], whole: readonly string[]): boolean {
  let j = 0;
  for (const line of whole) if (j < part.length && part[j] === line) j++;
  return j === part.length;
}

describe("THE CAIRN's fire, told where the clip is", () => {
  const cases: [ViewRole, number, number][] = [
    ["p1", 7, 0.7],
    ["p2", 7, 1.07],
    ["p1", 5, 1.44],
    ["p2", 3, 1.81],
    ["p1", 1, 2.18],
  ];
  for (const [role, units, time] of cases) {
    it(`draws the same pile with fewer calls — ${units} stones, ${role}`, () => {
      const whole = pileLog(role, units, time, false);
      const windowed = pileLog(role, units, time, true);
      expect(windowed.length).toBeLessThan(whole.length);
      expect(
        isSubsequence(windowed, whole),
        "the window changed a call rather than removing one",
      ).toBe(true);
      // A skipped mark is a whole mark: what goes is never a `fill` on its own,
      // whose `set fillStyle` stayed behind to reach the next one. Every fill
      // kept still has a style set for it since the last save or set.
      let j = 0;
      let styled = false;
      for (const line of whole) {
        const kept = j < windowed.length && windowed[j] === line;
        if (kept) j++;
        if (kept && line.startsWith("set fillStyle")) styled = true;
        if (kept && (line === "save" || line === "restore")) styled = false;
        if (line === "fill" || line.startsWith("fill(")) {
          if (kept) expect(styled, `a fill kept without the style set for it:\n${line}`).toBe(true);
        }
      }
    });
  }

  it("skips a mark only when its whole circle misses every stone", () => {
    const w = seenFrom(
      [
        { x: 0, y: 0, r: 10 },
        { x: 30, y: 0, r: 10 },
      ],
      0,
      0,
    );
    expect(w.shows(0, -15, 6)).toBe(true); // reaches the first stone
    expect(w.shows(0, -15, 4)).toBe(false); // a little short of it
    expect(w.shows(15, 0, 6)).toBe(true); // reaches both
    expect(w.shows(15, 20, 5)).toBe(false); // between them, above
    expect(w.shows(-100, -100, 1)).toBe(false);
    // Asked from a rock that is not at the origin, the same circle in its own frame.
    const from = seenFrom([{ x: 0, y: 0, r: 10 }], 30, 0);
    expect(from.shows(-30, 0, 1)).toBe(true);
    expect(from.shows(0, 0, 1)).toBe(false);
    expect(WHOLE.shows(1e9, 1e9, 0)).toBe(true);
  });

  it("bounds a flame's contour by what blobRadiusMul can reach", () => {
    // `rock-wake-fire.ts`'s `BOIL`, at the depth and wobble a flame is drawn
    // with — the one constant a skipped flame's safety rests on.
    let peak = 0;
    for (let seed = 0; seed < 40; seed += 0.37) {
      for (let t = 0; t < 60; t += 0.11) {
        for (let i = 0; i < 96; i++) {
          const m = blobRadiusMul((i / 96) * Math.PI * 2, 5, 0.2, 0.16, t, seed);
          if (m > peak) peak = m;
        }
      }
    }
    expect(peak).toBeLessThan(1.7);
    expect(peak).toBeGreaterThan(1.5); // the bound is close, not padded
  });
});
