import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, controlSet, WAVES } from "@neon-spore/content";
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
 *
 * **Every run starts cold.** `installCanvasGlobals` empties render's baked
 * caches (`src/baked.ts`), so each frame-0 row below pays for its own bake.
 * Before it did, the first run to ask for a size baked the panel's sheet and
 * every run after it was handed one free: p1's row carried fourteen
 * `new Path2D` that p2's did not, at the same size, and reordering the two
 * seats would have failed the test for a reason that had nothing to do with
 * the frame.
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
      // One of them is the seat's own light in the water above the ship: one
      // rect over the backdrop, one save for the composite mode it needs, and
      // one gradient on the first frame at a size and none after
      // (`ship-air.ts`).
      fillRect: 66,
      // Five fewer than before the membrane's lit rim came off: `strokeGlow`
      // is four passes and the pale thread over it was the fifth
      // (`band-seam.ts`, and the owner's *remove the line*).
      stroke: 40,
      fill: 26,
      clip: 5,
      save: 23,
      drawImage: 23,
      createLinearGradient: 14,
      createRadialGradient: 3,
      // Fourteen of these are the panel's own sheet, painted here and only
      // here: it depends on the size of the band and nothing else, so the
      // first frame at a size pays for every cell and vein in it and no frame
      // after that pays anything (`band-ground.ts`). The row below is the
      // proof — same seat, same size, one frame later, and back down.
      "new Path2D": 25,
      fillText: 4,
    },
    {
      fillRect: 66,
      stroke: 42,
      fill: 26,
      clip: 5,
      save: 23,
      drawImage: 23,
      // Down from frame 0: the layout-only gradients (`gradient-slot.ts`'s
      // sites in field.ts and backdrop.ts, key-light.ts's own slot, and the
      // channels' three in band-control.ts) are cache hits from the second
      // frame on.
      createLinearGradient: 5,
      createRadialGradient: 1,
      "new Path2D": 11,
      fillText: 4,
    },
  ],
  p2: [
    {
      fillRect: 66,
      // The seam's rim off (five, as on p1) and the fire buttons rebuilt: each
      // one lost a crosshair's two strokes and gained the outline round its
      // contour plus `strokeGlow`'s four passes round the creature inside it,
      // which is how the field draws that body and the whole of what the owner
      // asked for (`controls.ts`).
      stroke: 48,
      // Three more, and all three are `drawDetails`: the bulb's one core and
      // the slick's two, drawn on the buttons now that the silhouettes are
      // bodies rather than stencils.
      fill: 31,
      clip: 5,
      // Two fewer: a fire button's face is one `paintLobe` doing fill and
      // stroke together where it used to be a fill and then a crosshair.
      save: 25,
      drawImage: 25,
      createLinearGradient: 14,
      createRadialGradient: 3,
      // Two more than p1's frame 0: the sheet, and the fire buttons'
      // silhouettes, which are on this seat's panel alone.
      "new Path2D": 27,
      fillText: 2,
    },
    {
      fillRect: 66,
      stroke: 50,
      fill: 31,
      clip: 5,
      save: 25,
      drawImage: 25,
      createLinearGradient: 5,
      createRadialGradient: 1,
      // Back level with p1's second frame, and the two it came down by are the
      // fire buttons' silhouettes: every argument to them is a constant of the
      // colour, so `controls.ts` keeps the two paths rather than rebuilding
      // both every frame.
      "new Path2D": 11,
      fillText: 2,
    },
  ],
};
/**
 * The scene every row above was measured on: ALTERNATING, stepped to the first
 * tick with three creatures on the field.
 *
 * **The wave is found by id, not by index.** It used to be `2`, and a wave
 * inserted earlier in act one moved a two-entry wave into that slot — where
 * the loop below, waiting for a third creature that was never coming, simply
 * ran for ever. A number here was a hidden claim about the order of the whole
 * campaign; the id is the handle nothing renames (`Wave.id`).
 *
 * The `while` is bounded for the same reason. A budget test that hangs is
 * worse than one that fails: it takes the whole suite with it and says
 * nothing about which line was wrong.
 */
function busyWorld(): World {
  const world = createWorld(CFG, 3, []);
  const index = WAVES.findIndex((w) => w.id === "alternating");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let t = 0; world.creatures.length < 3; t++) {
    if (t > ticksPerBeat(CFG) * 32)
      throw new Error("wave alternating never put three on the field");
    step(world, []);
  }
  return world;
}

describe("a busy frame's op count", () => {
  for (const role of ["p1", "p2"] as const) {
    it(`stays inside the measured budget for two consecutive frames on ${role}`, () => {
      installCanvasGlobals();
      const world = busyWorld();

      const rows = BUDGETS[role];
      let measured = 0;
      runFrames(world, role as ViewRole, rows.length * 4, {
        viewport: { width: 390, height: 844, dpr: 3 },
        // The panel is named rather than inferred. Every row above is a
        // ceiling on the renderer's work, so it has to be weighed against the
        // *fullest* band — and the wave this scene comes from is played on a
        // rung of the standard ladder, which is fewer buttons than the game
        // draws from wave nine on (`control-sets-table.ts`).
        controls: controlSet("default"),
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

/** THE WARDEN's rope, carried that far **down** from where the hand grabbed —
 * the one direction the field always has room for from where it hangs
 * (`sim/handle-pull.ts`). */
function rope(fromYMilli: number) {
  return { kind: "drag", target: "wardenTether", on: true, fromMilli: 0, fromYMilli } as const;
}

const EYE_BUDGETS: Readonly<Record<string, readonly Budget[]>> = {
  "THE WARDEN's eye": [
    {
      fillRect: 66,
      // Two more than the plates alone would take: the opening below the eye
      // splits the plate it stands under into the two pieces either side of
      // it, and a plate is a stroke (`render/warden.ts`).
      stroke: 85,
      fill: 28,
      clip: 5,
      save: 27,
      drawImage: 15,
      createLinearGradient: 14,
      createRadialGradient: 3,
      // Fourteen of them the panel's sheet, as on every frame 0 here.
      "new Path2D": 37,
      fillText: 4,
    },
    {
      fillRect: 66,
      stroke: 87,
      fill: 28,
      clip: 5,
      save: 27,
      drawImage: 15,
      createLinearGradient: 5,
      createRadialGradient: 1,
      "new Path2D": 23,
      fillText: 4,
    },
  ],
  "THE LID": [
    {
      fillRect: 68,
      stroke: 72,
      fill: 24,
      clip: 6,
      save: 27,
      drawImage: 15,
      createLinearGradient: 14,
      createRadialGradient: 3,
      "new Path2D": 34,
      fillText: 4,
    },
    {
      fillRect: 68,
      stroke: 74,
      fill: 24,
      clip: 6,
      save: 27,
      drawImage: 15,
      createLinearGradient: 5,
      // The eye builds none of its own: the wash around it is a `halo` sprite
      // cached by colour and radius, and the one left is `key-light.ts`'s
      // layout-only slot (`render/eye.ts`).
      createRadialGradient: 1,
      "new Path2D": 20,
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
