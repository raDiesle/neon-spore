import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { type SimEvent, step } from "@neon-spore/sim";
import { BossHurt } from "../src/boss-hurt.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { fourBeatsIn, HURT_ROWS, type Row } from "./boss-hurt-rows.js";
import { HURT_ROWS_B } from "./boss-hurt-rows-b.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A boss the pair got the better of shows it took the blow — the owner's
 * generic rule of 24 September 2026 (`boss-hurt.ts`): a shake and a red
 * glow on the body for a moment after a sequence lands, and nothing after
 * one part of it alone.
 *
 * **One row per boss that wears it.** A row names the event that means *a
 * sequence landed*, one that is only a part of one, and where its fx class
 * keeps the blow. The frame case runs the same play twice with the landing
 * pushed both times, once with `hit()` stubbed out, so the red it counts is
 * the blow's and not a burst the same event throws.
 */

beforeAll(installCanvasGlobals);
afterEach(() => {
  hitOff?.mockRestore();
  hitOff = null;
});

let hitOff: ReturnType<typeof spyOn> | null = null;

const L = computeLayout(VIEWPORT, CFG, "test");

const ROWS: Row[] = [...HURT_ROWS, ...HURT_ROWS_B];

describe("the blow a boss takes", () => {
  it("shows at once and is over within half a second", () => {
    const hurt = new BossHurt();
    expect(hurt.value).toBe(0);
    expect(Math.abs(hurt.shakeX(1, 40))).toBe(0);
    hurt.hit();
    expect(hurt.value).toBe(1);
    for (let i = 0; i < 29; i++) hurt.update(1 / 60);
    expect(hurt.value).toBeGreaterThan(0);
    for (let i = 0; i < 2; i++) hurt.update(1 / 60);
    expect(hurt.value).toBe(0);
  });

  for (const row of ROWS) {
    describe(row.boss, () => {
      it("is dealt by a landed sequence, not by one part of it, and forgotten on a restart", () => {
        for (const e of row.land) {
          const fx = new Effects();
          fx.ingest(row.part, L, 0, () => 0, CFG);
          expect(row.hurt(fx).value).toBe(0);
          fx.ingest([e], L, 0, () => 0, CFG);
          expect(row.hurt(fx).value).toBe(1);
          fx.reset();
          expect(fx).toEqual(new Effects());
        }
      });

      it("washes the body red on the frames after a landing", () => {
        const rims = (dealt: boolean): number => {
          if (!dealt) hitOff = spyOn(BossHurt.prototype, "hit").mockImplementation(() => {});
          const world = (row.world ?? fourBeatsIn(row.boss))();
          const log: string[] = [];
          runFrames(world, "p1", 6, {
            every: 3,
            onCanvas: (c) => {
              c.log = log;
            },
            onTick: (tick, w) => {
              step(w, []);
              if (tick === 0) w.events.push(row.land[0] as SimEvent);
            },
          });
          hitOff?.mockRestore();
          hitOff = null;
          return log.join("|").split(PALETTE.redRim).length;
        };
        expect(rims(true)).toBeGreaterThan(rims(false));
      });
    });
  }
});
