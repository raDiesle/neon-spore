import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { queueFromWave, WAVE_HINTS, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawWaveHint, HINT_BEATS, HINTS_UNTIL, waveHint, waveHintsNow } from "../src/wave-hint.js";
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

const PLAYED = new Map<number, World>();

/** `played`, once per wave: the readings below change the world and put it back. */
function playedOnce(wave: number): World {
  const found = PLAYED.get(wave) ?? played(wave);
  PLAYED.set(wave, found);
  return found;
}

/**
 * Every state a line can be true in, one after another: each column for the
 * cannon, the next body free and held, and enough beats for every line of a
 * seat to take its turn.
 */
function* states(world: World): Generator<void> {
  const [col, grip, beat] = [world.cannonCol, world.gripP1, world.beat];
  const next = world.creatures.reduce((a, c) => (c.row > a.row ? c : a));
  for (let c = 0; c < CFG.cols; c++) {
    for (const held of [false, true]) {
      for (let turn = 0; turn < 8; turn++) {
        world.cannonCol = c;
        world.gripP1 = held ? next.id : grip;
        world.beat = turn * HINT_BEATS;
        yield;
      }
    }
  }
  [world.cannonCol, world.gripP1, world.beat] = [col, grip, beat];
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
    // FIRST STEP's own next wave played again, a regular wave with no lesson.
    const plain = WAVES.findIndex((w) => w.variant && w.id.startsWith("firstStep"));
    expect(WAVES[plain]?.hints).toBeUndefined();
    expect(waveHintsNow(played(plain))).toEqual([]);
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
      const world = playedOnce(i);
      for (const _ of states(world)) {
        for (const role of ["p1", "p2"] as const) {
          const h = said(world, role);
          if (h) seen.add(`${h.seat}${h.text}`);
        }
      }
      for (const h of WAVE_HINTS[id]) {
        expect(seen.has(`${h.seat}${h.text}`), `${id}: "${h.text}"`).toBe(true);
      }
    }
  });
});

describe("a body one seat is not shown", () => {
  for (const id of ["theGhost", "theWisp"]) {
    it(`${id}: never has a line on player 1's screen stand on it`, () => {
      const world = playedOnce(WAVES.findIndex((w) => w.id === id));
      for (const _ of states(world)) {
        const at = said(world, "p1")?.anchor.at;
        expect(at === "body" || at === "held", `${id} p1 col ${world.cannonCol}`).toBe(false);
      }
    });
  }

  it("is not ringed as the body over the cannon when the cannon is under it", () => {
    const world = playedOnce(WAVES.findIndex((w) => w.id === "theGhost"));
    const l = computeLayout(PHONE, CFG, "p1");
    const ellipses = (col: number) => {
      world.cannonCol = col;
      const { ctx } = stubCanvas();
      drawWaveHint(ctx as unknown as CanvasRenderingContext2D, l, world, 0.5);
      return ctx.tally.get("ellipse") ?? 0;
    };
    const ghost = body(world).col;
    expect(ellipses(ghost)).toBe(ellipses(ghost === 0 ? 1 : 0));
  });
});

describe("a hint, drawn", () => {
  const ROLES: ViewRole[] = ["p1", "p2", "test"];
  for (const role of ROLES) {
    it(`says TUTORIAL and its words on the screen for ${role}, on every size`, () => {
      for (const i of HINTED) {
        for (const size of SIZES) {
          const world = playedOnce(i);
          for (const _ of states(world)) {
            const l = computeLayout(size, CFG, role);
            const want = waveHint(l, world, 0.5)?.text;
            if (want === undefined) continue;
            const { ctx } = stubCanvas();
            ctx.texts = [];
            drawWaveHint(ctx as unknown as CanvasRenderingContext2D, l, world, 0.5);
            const texts = ctx.texts as TextBox[];
            const at = `${WAVES[i]!.name} ${size.width} ${role} col ${world.cannonCol}`;
            // A narrow plate wraps its words, so they are the lines drawn
            // that are part of them, read in order.
            const lines = texts.filter((x) => x.text !== "" && want.includes(x.text));
            expect(lines.map((x) => x.text).join(" "), `${at}: words`).toBe(want);
            const tab = texts.find((x) => x.text === "TUTORIAL");
            expect(tab, `${at}: no TUTORIAL`).toBeDefined();
            for (const t of [tab!, ...lines]) {
              expect(t.x, at).toBeGreaterThanOrEqual(0);
              expect(t.x + t.w, at).toBeLessThanOrEqual(l.width);
              expect(t.y, at).toBeGreaterThanOrEqual(0);
              expect(t.y + t.h, at).toBeLessThanOrEqual(l.height);
            }
          }
        }
      }
    });
  }
});
