import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { queueFromWave, WAVE_HINTS, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawWaveHint, HINTS_UNTIL, waveHint, waveHintsNow } from "../src/wave-hint.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A wave's tutorial on its own field (`wave-hint.ts`): what each seat is told,
 * that the one who acts is the one told to, that it stops once the pair has
 * shown it can, and that it is drawn — TUTORIAL and the words, on the screen,
 * on every size. FIRST STEP stands for every hinted wave where a test needs
 * one; the last block holds for all of them.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: false };
const FIRST = WAVES.findIndex((w) => w.id === "firstStep");
const PHONE = { width: 390, height: 844, dpr: 2 };
const SIZES = [PHONE, { width: 320, height: 568, dpr: 1 }, { width: 900, height: 1600, dpr: 2 }];
const HINTED = WAVES.flatMap((w, i) => (w.hints === undefined ? [] : [i]));

beforeAll(installCanvasGlobals);

/** A wave in play, stepped until its first body is on the field. */
function played(wave = FIRST): World {
  const world = createWorld(CFG, 7);
  const def = WAVES[wave]!;
  startWave(world, wave, queueFromWave(def, CFG.cols));
  for (let i = 0; i < 2000 && world.creatures.length === 0; i++) step(world, []);
  expect(world.creatures.length, `${def.name}: no body arrived`).toBeGreaterThan(0);
  return world;
}

function body(world: World) {
  return world.creatures[0]!;
}

function said(world: World, role: ViewRole) {
  return waveHint(computeLayout(PHONE, CFG, role), world, 0.5);
}

describe("FIRST STEP's hints", () => {
  it("is the wave that carries them, and carries no guide", () => {
    expect(WAVES[FIRST]?.hints).toBe("firstStep");
    expect(WAVES[FIRST]?.guide).toBeUndefined();
  });

  it("tells player 1 to move the cannon while it is not under the enemy", () => {
    const world = played();
    world.cannonCol = body(world).col === 0 ? 1 : 0;
    expect(said(world, "p1")?.text).toBe("MOVE CANNON UNDER ENEMY");
    expect(said(world, "p2")).toMatchObject({ acts: false, text: "WAIT FOR THE CANNON" });
    expect(said(world, "test")?.seat).toBe(1);
  });

  it("tells player 2 to fire, and player 1 to say so, once it is", () => {
    const world = played();
    world.cannonCol = body(world).col;
    expect(said(world, "p2")?.text).toBe("FIRE RED NOW");
    expect(said(world, "p2")?.anchor).toEqual({ at: "control", control: "fireRed" });
    expect(said(world, "p1")).toMatchObject({ acts: false, text: "TELL PLAYER 2: FIRE!" });
    expect(said(world, "test")?.seat).toBe(2);
  });

  it("stops once the pair has cleared one enemy", () => {
    expect(HINTS_UNTIL).toBe(1);
    const world = played();
    world.spawned = world.creatures.length;
    expect(waveHintsNow(world).length).toBeGreaterThan(0);
    world.spawned = world.creatures.length + 1;
    expect(waveHintsNow(world)).toEqual([]);
  });

  it("says nothing on a wave that does not carry them", () => {
    const cyan = WAVES.findIndex((w) => w.id === "cyan");
    expect(WAVES[cyan]?.hints).toBeUndefined();
    expect(waveHintsNow(played(cyan))).toEqual([]);
  });
});

describe("every hinted wave's lines", () => {
  it("are each one a film caption's length: 28 characters at most", () => {
    for (const lines of Object.values(WAVE_HINTS)) {
      for (const h of lines) expect(h.text.length, h.text).toBeLessThanOrEqual(28);
    }
  });

  it("are each one shown, on its own seat, in some state of its own wave", () => {
    for (const i of HINTED) {
      const id = WAVES[i]!.hints!;
      const seen = new Set<string>();
      const world = played(i);
      for (let col = 0; col < CFG.cols; col++) {
        world.cannonCol = col;
        for (const role of ["p1", "p2"] as const) {
          const h = said(world, role);
          if (h) seen.add(h.text);
        }
      }
      for (const h of WAVE_HINTS[id]) expect(seen.has(h.text), `${id}: "${h.text}"`).toBe(true);
    }
  });
});

describe("a hint, drawn", () => {
  const ROLES: ViewRole[] = ["p1", "p2", "test"];
  for (const role of ROLES) {
    it(`says TUTORIAL and its words on the screen for ${role}, on every size`, () => {
      for (const i of HINTED) {
        for (const size of SIZES) {
          for (let col = 0; col < CFG.cols; col++) {
            const world = played(i);
            world.cannonCol = col;
            const l = computeLayout(size, CFG, role);
            const want = waveHint(l, world, 0.5)?.text;
            if (want === undefined) continue;
            const { ctx } = stubCanvas();
            ctx.texts = [];
            drawWaveHint(ctx as unknown as CanvasRenderingContext2D, l, world, 0.5);
            const texts = ctx.texts as TextBox[];
            for (const word of ["TUTORIAL", want]) {
              const t = texts.find((x) => x.text === word);
              const at = `${WAVES[i]!.name} ${size.width} ${role} col ${col}`;
              expect(t, `${at}: no ${word}`).toBeDefined();
              expect(t!.x, at).toBeGreaterThanOrEqual(0);
              expect(t!.x + t!.w, at).toBeLessThanOrEqual(l.width);
              expect(t!.y, at).toBeGreaterThanOrEqual(0);
              expect(t!.y + t!.h, at).toBeLessThanOrEqual(l.height);
            }
          }
        }
      }
    });
  }
});
