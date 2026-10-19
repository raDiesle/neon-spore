import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVE_HINTS, WAVES } from "@neon-spore/content";
import { step } from "@neon-spore/sim";
import { handedRole } from "../src/handover.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawWaveHint, HINTS_UNTIL, hinting, waveHint, waveHintsNow } from "../src/wave-hint.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";
import {
  body,
  CFG,
  eachArrival,
  FIRST,
  HINTED,
  PHONE,
  played,
  playedOnce,
  SIZES,
  said,
  started,
  states,
} from "./wave-hint-world.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A wave's tutorial on its own field (`wave-hint.ts`): what each seat is told,
 * that the one who acts is the one told to, that it stops once the pair has
 * shown it can, and that it is drawn — TUTORIAL and the words, on the screen,
 * on every size. FIRST STEP stands for every hinted wave where a test needs
 * one; the last block holds for all of them.
 */

beforeAll(installCanvasGlobals);

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

  it("counts only the body a lesson is about, where it names one", () => {
    // TAP opens on a body it does not teach, and teaches a blister (`HINTS_ABOUT`).
    const world = started(WAVES.findIndex((w) => w.id === "tapBlisters"));
    for (let i = 0; i < 2000 && world.creatures.length === 0; i++) step(world, []);
    expect(world.creatures.map((c) => c.kind)).not.toContain("blister");
    world.creatures = [];
    expect(hinting(world)).toBe(true);
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
      eachArrival(i, (world) => {
        for (const _ of states(world)) {
          for (const role of ["p1", "p2"] as const) {
            const h = said(world, role);
            if (h) seen.add(`${h.seat}${h.text}`);
          }
        }
      });
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
            const l = computeLayout(size, CFG, handedRole(role, world));
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
