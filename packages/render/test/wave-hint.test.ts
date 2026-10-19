import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { queueFromWave, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawWaveHint, HINTS_UNTIL, waveHint, waveHints } from "../src/wave-hint.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * FIRST STEP's tutorial on its own field (`wave-hint.ts`): what each seat is
 * told, that the one who acts is the one told to, that it stops once the pair
 * has shown it can, and that it is drawn — TUTORIAL and the words, on the
 * screen, on every size.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: false };
const FIRST = WAVES.findIndex((w) => w.id === "firstStep");
const SIZES = [
  { width: 390, height: 844, dpr: 2 },
  { width: 320, height: 568, dpr: 1 },
  { width: 900, height: 1600, dpr: 2 },
];

beforeAll(installCanvasGlobals);

/** FIRST STEP in play, stepped until its first body is on the field. */
function played(wave = FIRST): World {
  const world = createWorld(CFG, 7);
  const def = WAVES[wave]!;
  startWave(world, wave, queueFromWave(def, CFG.cols));
  for (let i = 0; i < 2000 && world.creatures.length === 0; i++) step(world, []);
  expect(world.creatures.length, "no body arrived").toBeGreaterThan(0);
  return world;
}

function body(world: World) {
  return world.creatures[0]!;
}

describe("FIRST STEP's hints", () => {
  it("is the wave that carries them, and carries no guide", () => {
    expect(WAVES[FIRST]?.hints).toBe("firstStep");
    expect(WAVES[FIRST]?.guide).toBeUndefined();
  });

  it("tells player 1 to move the cannon while it is not under the enemy", () => {
    const world = played();
    world.cannonCol = body(world).col === 0 ? 1 : 0;
    expect(waveHint(world, "p1")).toMatchObject({ acts: true, text: "MOVE CANNON UNDER ENEMY" });
    expect(waveHint(world, "p2")).toMatchObject({ acts: false, text: "WAIT FOR THE CANNON" });
    expect(waveHint(world, "test")?.seat).toBe(1);
  });

  it("tells player 2 to fire, and player 1 to say so, once it is", () => {
    const world = played();
    world.cannonCol = body(world).col;
    expect(waveHint(world, "p2")).toMatchObject({ acts: true, text: "FIRE RED NOW" });
    expect(waveHint(world, "p2")?.anchor).toEqual({ at: "control", control: "fireRed" });
    expect(waveHint(world, "p1")).toMatchObject({ acts: false, text: "TELL PLAYER 2: FIRE!" });
    expect(waveHint(world, "test")?.seat).toBe(2);
  });

  it("stops once the pair has cleared enough of them", () => {
    const world = played();
    world.spawned = world.creatures.length + HINTS_UNTIL - 1;
    expect(waveHints(world).length).toBeGreaterThan(0);
    world.spawned = world.creatures.length + HINTS_UNTIL;
    expect(waveHints(world)).toEqual([]);
  });

  it("says nothing on a wave that does not carry them", () => {
    const cyan = WAVES.findIndex((w) => w.id === "cyan");
    expect(waveHints(played(cyan))).toEqual([]);
  });

  it("keeps every line to the film's 28 characters", () => {
    const world = played();
    for (const col of [body(world).col, body(world).col === 0 ? 1 : 0]) {
      world.cannonCol = col;
      for (const h of waveHints(world)) expect(h.text.length).toBeLessThanOrEqual(28);
    }
  });
});

describe("a hint, drawn", () => {
  const ROLES: ViewRole[] = ["p1", "p2", "test"];
  for (const role of ROLES) {
    it(`says TUTORIAL and its words on the screen for ${role}, on every size`, () => {
      for (const size of SIZES) {
        for (const aligned of [false, true]) {
          const world = played();
          world.cannonCol = aligned ? body(world).col : body(world).col === 0 ? 1 : 0;
          const want = waveHint(world, role)!.text;
          const { ctx } = stubCanvas();
          const l = computeLayout(size, CFG, role);
          ctx.texts = [];
          drawWaveHint(ctx as unknown as CanvasRenderingContext2D, l, world, 0.5);
          const texts = ctx.texts as TextBox[];
          for (const word of ["TUTORIAL", want]) {
            const t = texts.find((x) => x.text === word);
            expect(t, `${size.width} ${role}: no ${word}`).toBeDefined();
            expect(t!.x).toBeGreaterThanOrEqual(0);
            expect(t!.x + t!.w).toBeLessThanOrEqual(l.width);
            expect(t!.y).toBeGreaterThanOrEqual(0);
            expect(t!.y + t!.h).toBeLessThanOrEqual(l.height);
          }
        }
      }
    });
  }
});
