import { describe, expect, it, setDefaultTimeout } from "bun:test";
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
import { budgetRow } from "./budget-row.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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
 * If a legitimate change to the scene raises one of these, remeasure rather
 * than pad it "to be safe": set `MEASURE` to true, run this file, and paste
 * each printed row back over the one it replaces. The output is the object
 * literal the tables below hold, in their own order (`budget-row.ts`).
 *
 * **Every row moved on 7 September 2026, and one change moved all of them.**
 * Player 1's two action buttons stopped carrying words and started carrying
 * emblems (`src/action-face.ts`), which is a shape where a `fillText` used to
 * be: each button costs one membrane stroke plus `strokeGlow`'s four, so every
 * row that draws a full band is ten strokes, two saves and — for the maw's
 * three motes — three cached `drawImage` blits dearer, and two `fillText`
 * cheaper. Every number here was measured again after it, not adjusted by the
 * difference, which is why a few also came *down*: they were carrying slack a
 * ceiling test never notices.
 *
 * **Every run starts cold.** `installCanvasGlobals` empties render's baked
 * caches (`src/baked.ts`), so each frame-0 row below pays for its own bake.
 * Before it did, the first run to ask for a size baked the panel's sheet and
 * every run after it was handed one free: p1's row carried fourteen
 * `new Path2D` that p2's did not, at the same size, and reordering the two
 * seats would have failed the test for a reason that had nothing to do with
 * the frame. *
 * **Every row moved again on 8 September 2026, and two changes to one body
 * moved them all.** A living body's skin became flesh under the key light
 * (`src/living-skin.ts`) and the trail behind it became a plume
 * (`src/creature-detail.ts`), so each of the three creatures on this scene now
 * costs one more `clip`, one more `stroke`, two more `save` and four more
 * `drawImage`, and one fewer `fill`.
 *
 * **Two interiors moved every row again on 9 September 2026.** THE SLICK's two
 * dots became a nucleus with nine veins and a bright running out along them,
 * and THE BULB's one dot became eleven spheres packed three shells deep
 * (`body-bloom.ts`, `body-spores.ts`). Both are on more waves than anything
 * else in the game, so every scene in this file carries them. Drawn the way a
 * tool draws one body they were thirty-eight ops a slick and thirty-three a
 * bulb; batched by quantised brightness — `eye-iris.ts`'s *one path and one
 * stroke, not nine* — they are eight and five, and a spore is an ellipse
 * rather than a circle under a transform, which is where its saves went.
 *
 * **`createRadialGradient` did not move, and that was the point.** Both of
 * those looks want a soft radial falloff, and both take it from `haloSprite`'s
 * cache rather than building a gradient — a gradient per body per frame is
 * fifteen of them on THE ECHO, which is the shape of every performance
 * complaint in this repository. The trade is `drawImage`, which is a blit of
 * something already drawn.
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

// **The hull's own light moved every row here on 9 September 2026.** `litBox`
// ran the key ramp across the ship's box; `hull-barrel.ts` runs a cosine along
// the membrane's own normal and strokes a crown along the contour, clipped to
// it — so every frame in every budget file in this package carries one more
// `clip`, one more `stroke` and, on a cold cache, one more gradient.
//
// Wave 2, stepped to its first tick with 3+ creatures on the field, a
// phone-sized 390x844 dpr 3 stage — busy enough that every pass in
// `frame-passes.ts` has something to draw. Each seat runs its own world, so
// its two rows are consecutive frames of the same run.
/**
 * Dump each measured row instead of asserting it, as the object literal the
 * table below holds — so a remeasurement is a run and a paste rather than an
 * hour of hand-editing (`budget-row.ts`). Never committed as `true`.
 */
const MEASURE = false;

const BUDGETS: Readonly<Record<"p1" | "p2", readonly Budget[]>> = {
  p1: [
    {
      // One of them is the seat's own light in the water above the ship: one
      // rect over the backdrop, one save for the composite mode it needs, and
      // one gradient on the first frame at a size and none after
      // (`ship-air.ts`).
      fillRect: 65,
      // Ten of these are the two action buttons' emblems: one membrane stroke
      // and `strokeGlow`'s four passes over the lit crest, twice
      // (`action-face.ts`). They replaced two `fillText` calls, which is the
      // whole of the trade the owner chose — the word cost almost nothing and
      // could not be drawn at a sequence glyph's size at all.
      stroke: 60,
      fill: 28,
      clip: 9,
      save: 34,
      drawImage: 38,
      createLinearGradient: 15,
      createRadialGradient: 3,
      // Fourteen of these are the panel's own sheet, painted here and only
      // here: it depends on the size of the band and nothing else, so the
      // first frame at a size pays for every cell and vein in it and no frame
      // after that pays anything (`band-ground.ts`). Four more are the two
      // emblems' membrane and crest, baked the same way and by the same
      // mechanism (`action-face.ts`'s `bakedCache`). The row below is the
      // proof — same seat, same size, one frame later, and back down.
      "new Path2D": 29,
      fillText: 2,
    },
    {
      fillRect: 65,
      stroke: 62,
      fill: 28,
      clip: 9,
      save: 34,
      drawImage: 38,
      // Down from frame 0: the layout-only gradients (`gradient-slot.ts`'s
      // sites in field.ts and backdrop.ts, key-light.ts's own slot, and the
      // channels' three in band-control.ts) are cache hits from the second
      // frame on.
      createLinearGradient: 5,
      createRadialGradient: 1,
      "new Path2D": 11,
      fillText: 2,
    },
  ],
  p2: [
    {
      fillRect: 65,
      // The seam's rim off (five, as on p1) and the fire buttons rebuilt: each
      // one lost a crosshair's two strokes and gained the outline round its
      // contour plus `strokeGlow`'s four passes round the creature inside it,
      // which is how the field draws that body and the whole of what the owner
      // asked for (`controls.ts`).
      stroke: 64,
      // Three more, and all three are `drawDetails`: the bulb's one core and
      // the slick's two, drawn on the buttons now that the silhouettes are
      // bodies rather than stencils.
      fill: 35,
      clip: 9,
      // Two fewer: a fire button's face is one `paintLobe` doing fill and
      // stroke together where it used to be a fill and then a crosshair.
      save: 36,
      drawImage: 37,
      createLinearGradient: 15,
      createRadialGradient: 3,
      // Two more than p1's frame 0: the sheet, and the fire buttons'
      // silhouettes, which are on this seat's panel alone.
      "new Path2D": 27,
      fillText: 2,
    },
    {
      fillRect: 65,
      stroke: 66,
      fill: 35,
      clip: 9,
      save: 36,
      drawImage: 37,
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
          if (MEASURE) {
            console.log(`  ${role} frame ${frame}`, budgetRow(ctx.tally, budget));
          } else {
            for (const [key, max] of Object.entries(budget)) {
              expect(ctx.tally.get(key) ?? 0, `${role} frame ${frame} ${key}`).toBeLessThanOrEqual(
                max as number,
              );
            }
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
      // And the switch above is a switch for one run, never a commit: a file
      // left in measure mode asserts nothing at all, which is the one way this
      // convenience could quietly turn four budgets off (`fleet-budget.test.ts`
      // has carried this line since it had the only switch).
      expect(MEASURE, "MEASURE is left true").toBe(false);
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

/**
 * **The eye became a ball on 9 September 2026, and it moved two numbers.** The
 * owner asked for `eye:iris`'s two candidates combined rather than choosing
 * between them, so what is inside an aperture is now a lit dome, an iris placed
 * on it and travelling, and a wet point that stays where the light is
 * (`eye-ball.ts`). That is three `save` and two `drawImage` per eye, and
 * **nothing else** — in particular not one gradient, because both soft falloffs
 * are sprites baked once and blitted, which is the trade this whole file exists
 * to keep honest.
 *
 * **BEVEL moved the warden's rows and nothing else's**, on 9 September 2026: a
 * plate is a slab now rather than a stroked arc, so each of the nine is a wall,
 * a face, a lit outer edge and a contact seam. `fill` went from 32 to 44 and
 * `new Path2D` from 46 to 58 — two filled slabs a plate, against a stroke — and
 * `stroke` moved by three, which is the specular the light does not reach on
 * every plate plus the ship's own crown. THE LID is a different boss and takes
 * only the ship's share.
 */
const EYE_BUDGETS: Readonly<Record<string, readonly Budget[]>> = {
  "THE WARDEN's eye": [
    {
      fillRect: 65,
      // Two more than the plates alone would take: the opening below the eye
      // splits the plate it stands under into the two pieces either side of
      // it, and a plate is a stroke (`render/warden.ts`).
      //
      // **Nine of these are the skin**, and it is the whole of what it costs:
      // two `strokeGlow`s at four passes each — the cilia off the rim and the
      // veins under it — and one plain stroke round however many eyelets are
      // open, which is deliberately not a glow (`warden-skin.ts`). Sixteen
      // eyelets, forty hairs and five veins are three paths between them, so
      // none of these rows moves when one of those counts does.
      // One more than the plates and the skin between them account for: the
      // two lids over the hole carry a fold each, and both folds are one path
      // stroked once rather than a stroke apiece (`warden-eye.ts`).
      // **Four of these are the iris**: the aperture ring and every spoke go
      // into one path stroked once, so this row does not move when the spoke
      // count does (`eye-iris.ts`).
      stroke: 107,
      // Four more: the two patches of the wet film, the eyelids and their
      // pupils. Flat, whatever the openness.
      fill: 44,
      // Two more than the body's own: the film and the veins share a single
      // clip to it, and the lens opens one of its own so the lids can cut the
      // pupil instead of the pupil being sized to miss them (`eye-lens.ts`).
      clip: 8,
      // Three of these are the ball: the dome, the iris on its own tangent
      // plane, and the wet point, each in a frame of its own (`eye-ball.ts`).
      save: 34,
      // Two of these are the ball as well, and they are the whole of what it
      // costs: the dome is a sprite baked once per colour and size, and the wet
      // point is `halo`'s. Neither builds a gradient, which is why the two
      // gradient rows below did not move at all.
      drawImage: 20,
      createLinearGradient: 15,
      createRadialGradient: 3,
      // Fourteen of them the panel's sheet, as on every frame 0 here. Four are
      // the skin's, and there are four of them however much of it is showing.
      // One is the lids' folds, and it is one however far apart they stand.
      "new Path2D": 58,
      fillText: 2,
    },
    {
      fillRect: 65,
      stroke: 109,
      fill: 44,
      clip: 8,
      save: 34,
      drawImage: 20,
      createLinearGradient: 5,
      createRadialGradient: 1,
      "new Path2D": 40,
      fillText: 2,
    },
  ],
  "THE LID": [
    {
      fillRect: 67,
      // Five under the row that stood here, and none of the five was spent by
      // this change: they were slack left behind by a saving that landed
      // without lowering the row, which a ceiling test never notices. Measured
      // again, and put where the frame actually is.
      // **Four of these are the iris**: the aperture ring and every spoke go
      // into one path stroked once, so this row does not move when the spoke
      // count does (`eye-iris.ts`).
      stroke: 82,
      fill: 24,
      // The one op this body's share of the new lens costs: the clip the lids
      // cut the pupil through (`eye-lens.ts`).
      clip: 8,
      save: 32,
      drawImage: 20,
      createLinearGradient: 15,
      createRadialGradient: 3,
      "new Path2D": 38,
      fillText: 2,
    },
    {
      fillRect: 67,
      stroke: 84,
      fill: 24,
      clip: 8,
      save: 32,
      drawImage: 20,
      createLinearGradient: 5,
      // The eye builds none of its own: the wash around it is a `halo` sprite
      // cached by colour and radius, and the one left is `key-light.ts`'s
      // layout-only slot (`render/eye.ts`).
      createRadialGradient: 1,
      "new Path2D": 20,
      fillText: 2,
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
          if (MEASURE) {
            console.log(`  ${eye.name} frame ${frame}`, budgetRow(ctx.tally, budget));
          } else {
            for (const [key, max] of Object.entries(budget)) {
              expect(
                ctx.tally.get(key) ?? 0,
                `${eye.name} frame ${frame} ${key}`,
              ).toBeLessThanOrEqual(max as number);
            }
          }
          ctx.tally.clear();
          measured++;
        },
      });
      expect(measured).toBe(rows.length);
      // And the switch above is a switch for one run, never a commit: a file
      // left in measure mode asserts nothing at all, which is the one way this
      // convenience could quietly turn four budgets off (`fleet-budget.test.ts`
      // has carried this line since it had the only switch).
      expect(MEASURE, "MEASURE is left true").toBe(false);
    });
  }
});
