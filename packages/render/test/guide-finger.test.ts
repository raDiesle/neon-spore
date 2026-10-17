import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { guideScene, sceneScript } from "@neon-spore/content";
import {
  type BlisterGesture,
  blisterGestureOf,
  type Creature,
  DEFAULT_CONFIG,
  SceneRun,
  type SimEvent,
} from "@neon-spore/sim";
import { bodyOnTileOf } from "../src/blister-bodies.js";
import { comboBodyOf } from "../src/blister-combo.js";
import { leverBodyOf } from "../src/blister-lever.js";
import { rubBodyOf } from "../src/blister-rub.js";
import { swipeBodyOf } from "../src/blister-swipe-body.js";
import { tapBodyOf } from "../src/blister-tap-body.js";
import type { Body } from "../src/creature-body-in.js";
import { drawBlisterHands } from "../src/guide-finger.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The controls' films, drawn: the hand is on the screen of the seat whose
 * hand it is, and only there, through the whole of every gesture — and every
 * body each control is drawn as comes up in its film (the owner, 17 October
 * 2026: *it should also show all visuals the control can have in the game*).
 */

const FILMS = [
  "tapBlisters",
  "holdBlisters",
  "swipeBlisters",
  "turnBlisters",
  "rubBlisters",
  "comboBlisters",
  "leverBlisters",
] as const;

/** Which body a blister wears, and how many a gesture has — `blister-bodies.ts`' table. */
const BODY: Record<BlisterGesture, { of: (c: Creature) => number; count: number }> = {
  tap: { of: (c) => tapBodyOf(c.id), count: 3 },
  hold: { of: (c) => bodyOnTileOf({ c } as Body), count: 2 },
  swipe: { of: (c) => swipeBodyOf(c.id), count: 2 },
  turn: { of: (c) => bodyOnTileOf({ c } as Body), count: 2 },
  rub: { of: (c) => rubBodyOf(c.id), count: 3 },
  combo: { of: (c) => comboBodyOf(c.id), count: 2 },
  lever: { of: (c) => leverBodyOf(c.id), count: 3 },
};

beforeAll(installCanvasGlobals);

describe("the hand on a blister", () => {
  for (const id of FILMS) {
    it(`${id}: is drawn on its own seat's screen through every gesture, and every body comes up`, () => {
      const scene = guideScene(id);
      const run = new SceneRun(sceneScript(id, 0, DEFAULT_CONFIG));
      const size = { width: 390, height: 844, dpr: 2 };
      const layouts = {
        1: computeLayout(size, run.world.cfg, "p1"),
        2: computeLayout(size, run.world.cfg, "p2"),
      } as const;
      const bodies = new Set<number>();
      let gesture: BlisterGesture | null = null;
      const events: SimEvent[] = [];
      for (let t = 0; t < scene.ticks - 1; t++) {
        for (const c of run.world.creatures) {
          if (c.kind !== "blister") continue;
          gesture = blisterGestureOf(c);
          bodies.add(BODY[gesture].of(c));
        }
        const act = scene.acts.find((a) => a.blister !== undefined && a.tick === t);
        if (act?.blister) {
          for (const seat of [1, 2] as const) {
            const { ctx } = stubCanvas();
            ctx.calls = 0;
            const draw = ctx as unknown as CanvasRenderingContext2D;
            drawBlisterHands(draw, layouts[seat], run.world, scene, t, seat, 0);
            if (seat === act.blister)
              expect(ctx.calls, `${id}: no hand at ${t}`).toBeGreaterThan(0);
            else expect(ctx.calls, `${id}: the other seat's hand at ${t}`).toBe(0);
          }
        }
        run.advance(events);
      }
      expect(gesture).not.toBeNull();
      expect(bodies.size, `${id} shows ${[...bodies]}`).toBe(BODY[gesture!].count);
    });
  }
});
