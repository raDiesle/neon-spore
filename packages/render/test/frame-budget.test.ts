import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, runFrames, waveWith } from "./frame-harness.js";

/**
 * An op-count budget, not a frame-rate one — see `.claude/skills/render-perf`.
 * `ctx.tally` counts every canvas call a frame made; this pins the count so a
 * change that adds work back (a gradient rebuilt every frame, a clip opened
 * twice) fails a test instead of a phone.
 *
 * Two frames, not one: several of the savings pinned here only pay off from
 * the *second* frame onward — `gradient-slot.ts`'s cached gradients, and the
 * fire buttons' silhouette paths — so a budget built on frame 1 alone would
 * let them regress silently. Both seats, not one: the fire buttons are on
 * player 2's panel, and player 1's budget would never notice either of them
 * coming back. Every row is an exact number measured after the change that
 * earned it, not padded — lower them whenever a further saving lands, in the
 * same commit as the change.
 *
 * If a legitimate change to the scene raises one of these, remeasure with
 * `ctx.tally` (log it, or `console.log(ctx.tally)` in a scratch run of this
 * same setup) and update the row that changed — do not pad it "to be safe".
 */

type Budget = Partial<
  Record<
    | "fillRect"
    | "stroke"
    | "fill"
    | "clip"
    | "save"
    | "drawImage"
    | "createLinearGradient"
    | "createRadialGradient"
    | "new Path2D"
    | "fillText",
    number
  >
>;

// Wave 2, stepped to its first tick with 3+ creatures on the field, a
// phone-sized 390x844 dpr 3 stage — busy enough that every pass in
// `frame-passes.ts` has something to draw. Each seat runs its own world, so
// its two rows are consecutive frames of the same run.
const BUDGETS: Readonly<Record<"p1" | "p2", readonly Budget[]>> = {
  p1: [
    {
      fillRect: 64,
      stroke: 35,
      fill: 20,
      clip: 3,
      save: 17,
      drawImage: 18,
      createLinearGradient: 8,
      createRadialGradient: 2,
      "new Path2D": 7,
      fillText: 4,
    },
    {
      fillRect: 64,
      stroke: 37,
      fill: 20,
      clip: 3,
      save: 17,
      drawImage: 18,
      // Down from frame 0: the layout-only gradients (`gradient-slot.ts`'s
      // sites in field.ts and backdrop.ts, and key-light.ts's own slot) are
      // cache hits from the second frame on.
      createLinearGradient: 4,
      createRadialGradient: 1,
      "new Path2D": 7,
      fillText: 4,
    },
  ],
  p2: [
    {
      fillRect: 64,
      stroke: 35,
      fill: 22,
      clip: 3,
      save: 21,
      drawImage: 20,
      createLinearGradient: 8,
      createRadialGradient: 2,
      "new Path2D": 9,
      fillText: 2,
    },
    {
      fillRect: 64,
      stroke: 37,
      fill: 22,
      clip: 3,
      save: 21,
      drawImage: 20,
      createLinearGradient: 4,
      createRadialGradient: 1,
      // Two fewer than frame 0, and the two are the fire buttons' silhouettes:
      // every argument to them is a constant of the colour, so `controls.ts`
      // keeps the two paths rather than rebuilding both every frame.
      "new Path2D": 7,
      fillText: 2,
    },
  ],
};

describe("a busy frame's op count", () => {
  for (const role of ["p1", "p2"] as const) {
    it(`stays inside the measured budget for two consecutive frames on ${role}`, () => {
      installCanvasGlobals();
      const world = createWorld(CFG, 3, []);
      const index = 2;
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      while (world.creatures.length < 3) step(world, []);

      const rows = BUDGETS[role];
      let measured = 0;
      runFrames(world, role as ViewRole, rows.length * 4, {
        viewport: { width: 390, height: 844, dpr: 3 },
        onDrawn: (ctx, frame) => {
          const budget = rows[frame] as Budget;
          for (const [key, max] of Object.entries(budget)) {
            expect(ctx.tally.get(key) ?? 0, `${role} frame ${frame} ${key}`).toBeLessThanOrEqual(
              max as number,
            );
          }
          // Zeroed between frames: each row is one frame's own count, and the
          // second row is lower only because the first left the caches warm.
          ctx.tally.clear();
          measured++;
        },
      });
      // Both rows were actually weighed: a run that drew one frame would let
      // the second budget pass by never being asked.
      expect(measured).toBe(rows.length);
    });
  }
});

/**
 * The eye's own budget, and it is a second `describe` rather than two more rows
 * above because the scene is different, not the seat: the busy field carries
 * neither of the two bodies that wear an eye, so the picture the owner asked to
 * be cheap had no budget at all.
 *
 * **Both are measured held open**, which is the expensive state: shut, the lens
 * and the pupil return before they draw anything, so a budget taken on a shut
 * eye would pass while the open one got slower. The pull is sent as a real
 * `drag` on the tick the run reaches it — the same command a thumb sends — so
 * what is weighed is the picture a player actually produces.
 */
const EYES: readonly { name: string; index: number; pull: (world: World) => TimedCommand[] }[] = [
  {
    name: "THE WARDEN's eye",
    index: waveWith("warden"),
    // The grab and the distance from it, in that order (`sim/warden.ts`).
    pull: (world) => [
      { tick: world.tick, player: 1, command: rope(0) },
      { tick: world.tick, player: 1, command: rope(CFG.wardenTautMilli) },
    ],
  },
  {
    name: "THE LID",
    index: WAVES.findIndex((w) => w.entries.some((e) => e.kind === "lid")),
    pull: (world) => {
      const body = world.creatures.find((c) => c.kind === "lid");
      if (!body) throw new Error("no lid on the field to hold open");
      return [
        {
          tick: world.tick,
          player: 1,
          command: {
            kind: "drag",
            target: "lidString",
            on: true,
            fromMilli: CFG.lidTautMilli,
            id: body.id,
          },
        },
      ];
    },
  },
];

/** THE WARDEN's rope, at a distance from where the hand grabbed. */
function rope(fromMilli: number) {
  return { kind: "drag", target: "wardenTether", on: true, fromMilli } as const;
}

const EYE_BUDGETS: Readonly<Record<string, readonly Budget[]>> = {
  "THE WARDEN's eye": [
    {
      fillRect: 64,
      // Two more than the plates alone would take: the opening below the eye
      // splits the plate it stands under into the two pieces either side of
      // it, and a plate is a stroke (`render/warden.ts`).
      stroke: 74,
      fill: 22,
      clip: 3,
      save: 21,
      drawImage: 10,
      createLinearGradient: 8,
      createRadialGradient: 2,
      "new Path2D": 18,
      fillText: 4,
    },
    {
      fillRect: 64,
      stroke: 76,
      fill: 22,
      clip: 3,
      save: 21,
      drawImage: 10,
      createLinearGradient: 4,
      createRadialGradient: 1,
      "new Path2D": 18,
      fillText: 4,
    },
  ],
  "THE LID": [
    {
      fillRect: 66,
      stroke: 60,
      fill: 18,
      clip: 4,
      save: 21,
      drawImage: 10,
      createLinearGradient: 8,
      createRadialGradient: 2,
      "new Path2D": 15,
      fillText: 4,
    },
    {
      fillRect: 66,
      stroke: 62,
      fill: 18,
      clip: 4,
      save: 21,
      drawImage: 10,
      createLinearGradient: 4,
      // The eye builds none of its own: the wash around it is a `halo` sprite
      // cached by colour and radius, and the one left is `key-light.ts`'s
      // layout-only slot (`render/eye.ts`).
      createRadialGradient: 1,
      "new Path2D": 15,
      fillText: 4,
    },
  ],
};

describe("an open eye's op count", () => {
  for (const eye of EYES) {
    it(`stays inside the measured budget — ${eye.name}`, () => {
      installCanvasGlobals();
      const world = createWorld(CFG, 3, []);
      expect(eye.index, eye.name).toBeGreaterThanOrEqual(0);
      startWave(
        world,
        eye.index,
        buildQueue(eye.index, CFG.cols),
        [],
        buildBoss(eye.index, CFG.cols),
      );
      // Six beats down, which is far enough that both waves have a body under
      // the eye and neither has run out of things to draw.
      for (let t = 0; t < ticksPerBeat(CFG) * 6; t++) step(world, []);

      const rows = EYE_BUDGETS[eye.name] as readonly Budget[];
      let measured = 0;
      let pulled = false;
      runFrames(world, "p1", rows.length * 4, {
        viewport: { width: 390, height: 844, dpr: 3 },
        onTick: (_tick, w) => {
          step(w, pulled ? [] : eye.pull(w));
          pulled = true;
        },
        onDrawn: (ctx, frame) => {
          const budget = rows[frame] as Budget;
          for (const [key, max] of Object.entries(budget)) {
            expect(
              ctx.tally.get(key) ?? 0,
              `${eye.name} frame ${frame} ${key}`,
            ).toBeLessThanOrEqual(max as number);
          }
          ctx.tally.clear();
          measured++;
        },
      });
      expect(measured).toBe(rows.length);
    });
  }
});
