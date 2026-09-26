import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSetForWave } from "@neon-spore/content";
import { createWorld, startWave, step, type World } from "@neon-spore/sim";
import { handedLayout } from "../src/handover.js";
import {
  bandLobes,
  computeLayout,
  computeStage,
  frameLayout,
  type Layout,
  worldLayout,
} from "../src/layout.js";
import type { ViewState } from "../src/renderer.js";
import { type Field, touchDown } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **SNAKE's short hull and band** (`render/snake-layout.ts`). The owner, 25
 * September 2026: *have hull ship height around half of regular one, as we
 * have smaller controls.* The band moves every lobe, so the frame and the
 * finger have to move together: a press where a lobe is drawn is a press on
 * that lobe.
 */

function snakeWorld(): { world: World; index: number } {
  const world = createWorld(CFG, 5);
  const index = waveWith("snake");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  if (world.boss?.kind !== "snake") throw new Error("the snake's wave installed no snake");
  world.boss.phase = "play";
  return { world, index };
}

const STAGE = computeStage(VIEWPORT);
const VP = { width: STAGE.width, height: STAGE.height, dpr: VIEWPORT.dpr };

function drawn(world: World, role: "p1" | "p2"): Layout {
  const view: ViewState = {
    world,
    beatPhase: 0,
    role,
    time: 1,
    dt: 1 / 60,
    events: [],
    running: true,
  };
  return frameLayout(view, STAGE, VIEWPORT.dpr);
}

/** What `apps/game/src/field-input.ts` hit-tests against. */
function pressed(world: World, role: "p1" | "p2"): Layout {
  return worldLayout(handedLayout(computeLayout(VP, CFG, role), world), world);
}

function field(world: World, index: number, seat: 1 | 2): Field {
  return {
    creatures: [],
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: 0,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSetForWave(index),
    faults: [],
    well: false,
  };
}

describe("SNAKE's band", () => {
  it("stands at snakeHullPct of its usual height, and the hull with it", () => {
    const { world } = snakeWorld();
    const plain = computeLayout(VP, CFG, "p1");
    const l = drawn(world, "p1");
    expect(l.bandHeight).toBeCloseTo((plain.bandHeight * CFG.snakeHullPct) / 100);
    expect(l.hullScale).toBe(CFG.snakeHullPct / 100);
    expect(l.bandTop).toBeGreaterThan(plain.bandTop);
  });

  it("is the usual band on a wave with no snake", () => {
    const world = createWorld(CFG, 5);
    const plain = computeLayout(VP, CFG, "p1");
    expect(worldLayout(plain, world)).toBe(plain);
  });

  for (const [role, seat] of [
    ["p1", 1],
    ["p2", 2],
  ] as const) {
    it(`answers a press on ${role}'s lobes where they are drawn`, () => {
      const { world, index } = snakeWorld();
      const set = controlSetForWave(index);
      const lobes = bandLobes(drawn(world, role), set, seat);
      expect(lobes.length).toBeGreaterThan(0);
      // The touch reach is wider than the circle, so a press can land on a
      // band that is a little out: the circles themselves have to agree.
      const answered = bandLobes(pressed(world, role), set, seat);
      expect(answered.map((a) => a.circle)).toEqual(lobes.map((a) => a.circle));
      const plain = computeLayout(VP, CFG, role);
      const plainLobes = bandLobes(plain, set, seat);
      for (const [i, lobe] of lobes.entries()) {
        const { x, y } = lobe.circle;
        const hit = touchDown(pressed(world, role), x, y, field(world, index, seat));
        const home = plainLobes[i]?.circle;
        if (home === undefined) throw new Error(`no ${lobe.control.id} on the usual band`);
        const want = touchDown(plain, home.x, home.y, field(world, index, seat));
        expect(want).not.toBeNull();
        expect(hit?.command).toEqual(want?.command ?? null);
        // And the lobe did move, down with the band's top.
        expect(y).toBeGreaterThan(home.y);
      }
    });
  }
});
