import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type SimEvent, step, type World } from "@neon-spore/sim";
import { Fingers } from "../src/fingers.js";
import { drawVerdictRing } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
import { marksDrawn, noteMark, watchMarks } from "../src/mark-spots.js";
import { PALETTE } from "../src/palette.js";
import {
  AURA_LINGER_SECONDS,
  AURA_ONSET_SECONDS,
  auraRadius,
  auraTouch,
  ThumbAuras,
} from "../src/thumb-aura.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { asking, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The ring round a boss's mark under this device's thumb** — the owner,
 * 2 October 2026, generic: the progress ring is under the thumb, so a ring
 * round the mark grows *first quick and then very slow*, beats green, and goes
 * red when the mark is judged wrong; and on the first cut, *it should slowly
 * grow exactly green circle where center is the red circle* (`thumb-aura.ts`).
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

/** Every colour the canvas was handed as a stroke or a gradient stop. */
function colours(log: readonly string[]): string {
  return log
    .filter((e) => e.startsWith("set strokeStyle") || e.startsWith("set fillStyle"))
    .join("|");
}

/** The mark every ring below is held on, in the stage's frame — up and to
 * the right of the thumb, the way a thumb lands off a mark's centre. */
const MARK = { x: 110, y: 190, r: 12 };

/**
 * A thumb at (100, 200) held `seconds` on `MARK`, drawn once at the end, with
 * a verdict thrown at `(vx, vy)` on the last frame if `good` is given — both
 * drawn in a frame shifted by (40, -30), the way a boss draws in its own.
 * Hands back the log of that last frame.
 */
function held(seconds: number, verdict?: { good: boolean; vx: number; vy: number }): string[] {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  const c = ctx as unknown as CanvasRenderingContext2D;
  const auras = new ThumbAuras();
  const thumb = [{ id: 1, x: 100, y: 200 }];
  const dt = 1 / 30;
  ctx.translate(10, 20);
  const boss = (last: boolean) => {
    watchMarks(c);
    ctx.save();
    ctx.translate(40, -30);
    noteMark(c, MARK.x - 40, MARK.y + 30, MARK.r);
    if (last && verdict) {
      drawVerdictRing(c, verdict.vx - 40, verdict.vy + 30, 20, { good: verdict.good, age: 0 });
    }
    ctx.restore();
  };
  for (let t = dt; t < seconds; t += dt) {
    boss(false);
    auras.frame(c, L, { world: playing(), thumbs: thumb, dt, beatPhase: 0.5 });
  }
  boss(true);
  ctx.log = log;
  auras.frame(c, L, { world: playing(), thumbs: thumb, dt, beatPhase: 0.5 });
  return log;
}

/** The crisp circle's centre and radius: the last arc a ring draws. */
function circle(log: readonly string[]): { x: number; y: number; r: number } {
  const arc = log.filter((e) => e.startsWith("arc(")).at(-1) ?? "";
  const [x = NaN, y = NaN, r = NaN] = arc.slice(4, -1).split(", ").map(Number);
  return { x, y, r };
}

describe("the ring round a boss's mark under the thumb", () => {
  it("grows quickly at first, then slowly, and the slow part can still be seen", () => {
    const at = (t: number) => auraRadius(t);
    // Starts just outside the mark, not a tile out past the thumb.
    expect(at(0)).toBeGreaterThan(1.1);
    expect(at(0)).toBeLessThan(1.5);
    // Quick: more in the first half second than in the whole second after it.
    expect(at(0.5) - at(0)).toBeGreaterThan(at(1.5) - at(0.5));
    // Slow, and still moving: a tenth of a radius and more between 2 s and 3 s.
    expect(at(3) - at(2)).toBeGreaterThan(0.1);
    expect(at(3) - at(2)).toBeLessThan(at(0.5) - at(0));
    expect(at(600)).toBeLessThan(3.1);
  });

  it("is centred on the mark, not the thumb, and sized by the mark", () => {
    const early = circle(held(0.1));
    expect(early.x).toBeCloseTo(MARK.x, 3);
    expect(early.y).toBeCloseTo(MARK.y, 3);
    expect(early.r).toBeGreaterThan(MARK.r);
    expect(early.r).toBeLessThan(MARK.r * 1.8);
    const later = circle(held(3));
    expect(later.x).toBeCloseTo(MARK.x, 3);
    expect(later.r).toBeGreaterThan(early.r + MARK.r * 0.5);
  });

  it("keeps a small ring on the finger where no mark is drawn", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const log: string[] = [];
    ctx.log = log;
    watchMarks(c);
    new ThumbAuras().frame(c, L, {
      world: playing(),
      thumbs: [{ id: 1, x: 100, y: 200 }],
      dt: 0.1,
      beatPhase: 0,
    });
    const ring = circle(log);
    expect([ring.x, ring.y]).toEqual([100, 200]);
    expect(ring.r).toBeLessThan(L.tile);
    expect(marksDrawn(c)).toEqual([]);
  });

  it("is white while the press is still on its way to being judged, then green", () => {
    const early = colours(held(AURA_ONSET_SECONDS / 2));
    expect(early).toContain(rgbaPrefix(PALETTE.text));
    expect(early).not.toContain(rgbaPrefix(PALETTE.good));
    const later = colours(held(1));
    expect(later).toContain(rgbaPrefix(PALETTE.good));
    expect(later).not.toContain(rgbaPrefix(PALETTE.red));
  });

  it("goes red when its mark is judged wrong, wherever the boss drew it", () => {
    const red = colours(held(1, { good: false, vx: MARK.x, vy: MARK.y }));
    expect(red).toContain(rgbaPrefix(PALETTE.red));
  });

  it("does not take a verdict on another mark", () => {
    const far = colours(held(1, { good: false, vx: 300, vy: 600 }));
    expect(far).not.toContain(rgbaPrefix(PALETTE.red));
  });

  it("does not take a verdict given before the thumb landed", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const auras = new ThumbAuras();
    const thumb = [{ id: 1, x: 100, y: 200 }];
    auras.update(thumb, 0.1);
    watchMarks(c);
    drawVerdictRing(c, 100, 200, 20, { good: false, age: 0.4 });
    const log: string[] = [];
    ctx.log = log;
    auras.frame(c, L, { world: playing(), thumbs: thumb, dt: 0, beatPhase: 0.5 });
    expect(colours(log)).not.toContain(rgbaPrefix(PALETTE.red));
  });

  it("fades out after the lift, and is gone after the linger", () => {
    const auras = new ThumbAuras();
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    auras.update([{ id: 1, x: 100, y: 200 }], 0.5);
    auras.update([], 0.1);
    const log: string[] = [];
    ctx.log = log;
    auras.draw(c, L, 0);
    expect(log.length).toBeGreaterThan(0);
    auras.update([], AURA_LINGER_SECONDS);
    log.length = 0;
    auras.draw(c, L, 0);
    expect(log).toEqual([]);
  });

  it("is not drawn once a hit holds the field or the wave is over, though the thumb is still down", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const auras = new ThumbAuras();
    const thumbs = [{ id: 1, x: 100, y: 200 }];
    auras.update(thumbs, 0.5);
    const log: string[] = [];
    ctx.log = log;
    auras.frame(c, L, { world: struck(), thumbs, dt: 0.1, beatPhase: 0 });
    auras.draw(c, L, 0);
    expect(log).toEqual([]);
    auras.frame(c, L, { world: lost(), thumbs, dt: 0.1, beatPhase: 0 });
    expect(log).toEqual([]);
    // The wave starts over under the same thumb: still nothing, until it lifts.
    auras.frame(c, L, { world: playing(), thumbs, dt: 0.1, beatPhase: 0 });
    expect(log).toEqual([]);
    auras.frame(c, L, { world: playing(), thumbs: [], dt: 0.1, beatPhase: 0 });
    auras.frame(c, L, { world: playing(), thumbs, dt: 0.1, beatPhase: 0 });
    expect(log.length).toBeGreaterThan(0);
  });

  it("is worn by a press a boss's drag answered, held or refused, and not by one on the ship", () => {
    const drag = { kind: "drag", target: "instarMark", on: true, fromMilli: 0 } as const;
    const hold = { kind: "drag", target: "instarMark", player: 1, originX: 0, originY: 0 } as const;
    expect(auraTouch({ command: drag, hold })).toBe(true);
    expect(auraTouch({ command: drag, hold: null })).toBe(true);
    expect(auraTouch({ command: { kind: "cannonCol", col: 3 }, hold: { kind: "cannon" } })).toBe(
      false,
    );
    const f = new Fingers();
    f.down(L, 1, [hold], 5, 6, true);
    f.down(L, 2, [{ kind: "cannon" }], 7, 8);
    f.move(L, 1, 9, 10);
    expect(f.thumbs).toEqual([{ id: 1, x: 9, y: 10 }]);
    f.up(1);
    expect(f.thumbs).toEqual([]);
  });

  it("draws over a boss's whole frame without the canvas refusing a value", () => {
    const world = hung();
    asking(world, 0);
    const refused: SimEvent = { type: "instarRefuse", mark: 0, player: 2, col: 5 };
    const { ctx } = runFrames(world, "test", 30, {
      every: 3,
      thumbs: [{ id: 1, x: L.width / 2, y: L.playHeight / 2 }],
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 6) w.events.push(refused);
      },
    });
    expect(ctx.calls).toBeGreaterThan(100);
  });
});

/** A boss up and asking, and the same lost. */
function playing(): World {
  const w = hung();
  asking(w, 0);
  return w;
}
function lost(): World {
  const w = playing();
  w.over = true;
  return w;
}
/** A hit holding the field still, under the lost screen. */
function struck(): World {
  const w = playing();
  w.failTick = w.tick;
  return w;
}

/** `rgba(hex, …)` up to its alpha, so any alpha matches. */
function rgbaPrefix(hex: string): string {
  return rgba(hex, 0.5).replace(/[\d.]+\)$/, "");
}
