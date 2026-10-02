import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type SimEvent, step, type World } from "@neon-spore/sim";
import { Fingers } from "../src/fingers.js";
import { drawVerdictRing, watchVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout } from "../src/layout.js";
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
 * **The glow round a thumb on a boss's mark** — the owner, 2 October 2026,
 * generic: the progress ring is under the thumb, so a ring round the thumb
 * itself grows *first quick and then very slow*, beats green, and goes red
 * when the mark under it is judged wrong (`thumb-aura.ts`).
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

/** Every colour the canvas was handed as a stroke or a gradient stop. */
function colours(log: readonly string[]): string {
  return log
    .filter((e) => e.startsWith("set strokeStyle") || e.startsWith("set fillStyle"))
    .join("|");
}

/** A ring held `seconds`, drawn once at the end, with a verdict thrown at
 * `(vx, vy)` on the last frame if `good` is given — drawn in a frame shifted
 * by `shift`, the way a boss draws in its own. */
function held(seconds: number, verdict?: { good: boolean; vx: number; vy: number }): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  const c = ctx as unknown as CanvasRenderingContext2D;
  const auras = new ThumbAuras();
  const thumb = [{ id: 1, x: 100, y: 200 }];
  const dt = 1 / 30;
  for (let t = 0; t < seconds; t += dt) auras.update(thumb, dt);
  ctx.log = log;
  ctx.translate(10, 20);
  watchVerdicts(c);
  if (verdict) {
    ctx.save();
    ctx.translate(40, -30);
    drawVerdictRing(c, verdict.vx - 40, verdict.vy + 30, 20, { good: verdict.good, age: 0 });
    ctx.restore();
  }
  log.length = 0;
  auras.frame(c, L, { world: playing(), thumbs: thumb, dt, beatPhase: 0.5 });
  return colours(log);
}

describe("the glow round a thumb on a boss's mark", () => {
  it("grows quickly at first and then very slowly, and never past its cap", () => {
    const at = (t: number) => auraRadius(t);
    expect(at(0.2) - at(0)).toBeGreaterThan(0.5);
    expect(at(2) - at(1)).toBeGreaterThan(0);
    expect(at(2) - at(1)).toBeLessThan(0.15);
    expect(at(10)).toBeGreaterThan(at(5));
    expect(at(600)).toBeLessThanOrEqual(3);
  });

  it("is white while the press is still on its way to being judged, then green", () => {
    const early = held(AURA_ONSET_SECONDS / 2);
    expect(early).toContain(rgbaPrefix(PALETTE.text));
    expect(early).not.toContain(rgbaPrefix(PALETTE.good));
    const later = held(1);
    expect(later).toContain(rgbaPrefix(PALETTE.good));
    expect(later).not.toContain(rgbaPrefix(PALETTE.red));
  });

  it("goes red when the mark under the thumb is judged wrong, wherever the boss drew it", () => {
    expect(held(1, { good: false, vx: 105, vy: 195 })).toContain(rgbaPrefix(PALETTE.red));
  });

  it("does not take a verdict on a mark far from the thumb", () => {
    expect(held(1, { good: false, vx: 300, vy: 600 })).not.toContain(rgbaPrefix(PALETTE.red));
  });

  it("does not take a verdict given before the thumb landed", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const auras = new ThumbAuras();
    const thumb = [{ id: 1, x: 100, y: 200 }];
    auras.update(thumb, 0.1);
    watchVerdicts(c);
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
