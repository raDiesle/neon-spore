import { describe, expect, it, setDefaultTimeout } from "bun:test";
import type { ViewRole } from "../src/layout.js";
import { budgetRow } from "./budget-row.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, peakWorld, runFrames } from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The five dearest frames in the game, each with a budget of its own.**
 *
 * `frame-budget.test.ts` weighs ALTERNATING, which is one of the *cheapest*
 * pictures there is: three bodies falling down an ordinary field. Measured over
 * every wave, each stepped to the tick where it carries the most bodies, in
 * Chrome at 390x844 dpr 2 with the CPU throttled four times — DevTools'
 * mid-tier-phone preset — the dearest five were THE GHOST, THE WISP, BULB
 * QUEEN, THE ECHO and THE GYRE, between 6.4 and 7.1 ms a paint against a floor
 * of 3.5 ms on wave one. None of them had a budget row, so any of them could
 * get slower without a test noticing.
 *
 * A file of its own beside `crawler-budget.test.ts` and `fleet-budget.test.ts`,
 * for their reason: the scene is different, not the seat.
 *
 * **Each wave is stepped to its own busiest tick** (`peakWorld`), which is the
 * picture a ceiling should be a ceiling on, and the panel is *inferred* from
 * the wave rather than named — every one of these is played on the band the
 * phone actually shows for it.
 *
 * Two frames each, for `frame-budget.test.ts`'s reason: the layout gradients
 * and the panel's sheet are cache hits from the second frame on, so a budget
 * built on frame 0 alone would let them come back silently.
 *
 * Every number is exact, measured after the change that earned it. If a
 * legitimate change to a scene raises one, remeasure that row and move it — do
 * not pad it. Set `MEASURE` to true and run this file: each row is printed as
 * the object literal the scenes below hold, in the same order, so it goes back
 * by being pasted rather than read off and retyped (`budget-row.ts`). This is
 * the file that made the case for it — one look change moved eighty-two of
 * these numbers.
 */

/**
 * Dump each measured row instead of asserting it, as the object literal the
 * table below holds — so a remeasurement is a run and a paste rather than an
 * hour of hand-editing (`budget-row.ts`). Never committed as `true`.
 *
 * **Two interiors moved every row here on 9 September 2026.** THE SLICK's two
 * dots became a nucleus with nine veins and a bright running out along them,
 * and THE BULB's one dot became eleven spheres packed three shells deep
 * (`body-bloom.ts`, `body-spores.ts`). Both are on more waves than anything
 * else in the game, so every scene in this package carries them.
 *
 * The rows moved by a fraction of what the two candidates cost as candidates.
 * Drawn the way a tool draws one body, they were thirty-eight ops a slick and
 * thirty-three a bulb; batched by quantised brightness — `eye-iris.ts`'s *one
 * path and one stroke, not nine* — they are eight and five, and a spore is an
 * ellipse rather than a circle under a transform, which is where its saves
 * went.
 */
const MEASURE = false;

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

interface Scene {
  /** The wave's own id — never its index, which every insertion earlier moves. */
  id: string;
  name: string;
  /** What is dear about this one, in a sentence. */
  why: string;
  rows: Readonly<Record<"p1" | "p2", readonly Budget[]>>;
}

/**
 * **Every row here moved on 9 September 2026**, when the owner took ten looks
 * out of VERSUS at once. Two of them touch every scene in this file: the hull's
 * light is a cosine along the membrane's own normal with a crown stroked along
 * the contour (`hull-barrel.ts`), which is one more `clip`, one more `stroke`
 * and one more cold gradient on every frame the ship is on; and the hull itself
 * is fourteen shallow lobes rather than two deep ones, which changes no count
 * at all — a contour is one path however many lobes it has.
 *
 * The rest are per body and are where the large moves are: a worm's rings are
 * balls with pores on them, a gyre's core is a lit mass with granules in it, a
 * wisp hangs eight strands instead of five, and a torch burns inside a
 * fireball. Each row below was remeasured, not padded.
 *
 * **BULB QUEEN is the row worth reading, and it went the interesting way.** The
 * queen keeps a torch in every socket, so a fireball on each of them is the
 * dearest thing in this file — the first cut of it put that wave up 62% on
 * `bun run perf`, which is what sent the paint back for its caches. What
 * shipped trades *building* for *blitting*: `fill` fell 82 to 46 and
 * `createLinearGradient` 54 to 18, because a tongue is one baked sprite under a
 * `globalAlpha` and a shell is a contour held per radius and per
 * thirty-second of a turn; `drawImage` went 73 to 101 for the same reason, and
 * a blit of a cached canvas is the cheapest mark this renderer makes
 * (`torch-ball.ts`, `glow.ts`).
 *
 * **And then `save` fell 139 to 39, which is the whole of the second pass at
 * it.** Every one of those hundred was bookkeeping around a blit that had
 * already been made cheap: a plume and a tongue were each placed by `save`,
 * `translate`, `scale`, draw, `restore`, and a plume's blit went through
 * `halo`, which reads and writes `globalCompositeOperation` around itself so
 * that any caller may use it. A translate and a scale about a blit's own
 * centre are exactly a destination rectangle, so the rectangle is computed and
 * the transform stack is left alone. Nothing else in the row moved, and
 * nothing in the picture did: 8,952 blits across these two waves and both
 * seats land on the same device-space corners at the same alpha under the same
 * composite mode, before and after.
 */
const SCENES: readonly Scene[] = [
  {
    id: "theGhost",
    name: "THE GHOST",
    // The one wave where the two seats draw genuinely different pictures: p2
    // has the body and its trail, p1 has a band across a row and no body at
    // all — which is why p2 carries seventeen more paths and twenty more fills.
    why: "a body only one seat can see, and a band on the other",
    rows: {
      p1: [
        {
          fillRect: 73,
          stroke: 74,
          fill: 31,
          clip: 8,
          save: 37,
          drawImage: 33,
          createLinearGradient: 15,
          createRadialGradient: 3,
          "new Path2D": 28,
          fillText: 4,
        },
        {
          fillRect: 73,
          stroke: 76,
          fill: 31,
          clip: 8,
          save: 37,
          drawImage: 33,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 10,
          fillText: 4,
        },
      ],
      // SWARM (11 September 2026) is fourteen motes and their wakes, each a
      // `halo` blit under its own save: twenty-eight saves and fifty-six
      // sprite draws a body, over the gradient nebula's one fill — the
      // `save`, `drawImage` and `clip` rows moved by that and nothing else.
      p2: [
        {
          fillRect: 79,
          stroke: 84,
          fill: 56,
          clip: 12,
          save: 104,
          drawImage: 96,
          createLinearGradient: 15,
          createRadialGradient: 5,
          "new Path2D": 41,
          fillText: 5,
        },
        {
          fillRect: 79,
          stroke: 86,
          fill: 56,
          clip: 12,
          save: 104,
          drawImage: 96,
          createLinearGradient: 5,
          createRadialGradient: 3,
          "new Path2D": 25,
          fillText: 5,
        },
      ],
    },
  },
  {
    id: "theWisp",
    name: "THE WISP",
    // The lettered grid is on *both* screens while a wisp is out, and it is
    // drawn a cell at a time: two hundred and sixty rects and thirty-one
    // pieces of text, which is four times any other frame in the game.
    why: "the lettered grid, on both screens at once",
    rows: {
      p1: [
        {
          fillRect: 261,
          stroke: 73,
          fill: 38,
          clip: 9,
          save: 42,
          drawImage: 36,
          createLinearGradient: 15,
          createRadialGradient: 3,
          "new Path2D": 30,
          fillText: 30,
        },
        {
          fillRect: 261,
          stroke: 75,
          fill: 38,
          clip: 9,
          save: 42,
          drawImage: 36,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 12,
          fillText: 30,
        },
      ],
      p2: [
        {
          fillRect: 257,
          stroke: 122,
          fill: 63,
          clip: 27,
          save: 74,
          drawImage: 41,
          createLinearGradient: 17,
          createRadialGradient: 5,
          "new Path2D": 29,
          fillText: 31,
        },
        {
          fillRect: 257,
          stroke: 124,
          fill: 63,
          clip: 27,
          save: 74,
          drawImage: 41,
          createLinearGradient: 7,
          createRadialGradient: 3,
          "new Path2D": 13,
          fillText: 31,
        },
      ],
    },
  },
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    // Two bodies on the field and one of the dearest frames anyway: the queen
    // is armour, wings, two marks and a mouth, and almost none of it is a
    // creature the field counts.
    why: "one boss that is most of the picture",
    rows: {
      p1: [
        {
          fillRect: 73,
          stroke: 75,
          fill: 46,
          clip: 6,
          save: 39,
          drawImage: 101,
          createLinearGradient: 18,
          createRadialGradient: 5,
          "new Path2D": 33,
          fillText: 5,
        },
        {
          fillRect: 73,
          stroke: 77,
          fill: 46,
          clip: 6,
          save: 39,
          drawImage: 101,
          createLinearGradient: 8,
          createRadialGradient: 1,
          "new Path2D": 13,
          fillText: 5,
        },
      ],
      p2: [
        {
          fillRect: 73,
          stroke: 71,
          fill: 51,
          clip: 6,
          save: 39,
          drawImage: 99,
          createLinearGradient: 18,
          createRadialGradient: 5,
          "new Path2D": 29,
          fillText: 5,
        },
        {
          fillRect: 73,
          stroke: 73,
          fill: 51,
          clip: 6,
          save: 39,
          drawImage: 99,
          createLinearGradient: 8,
          createRadialGradient: 1,
          "new Path2D": 11,
          fillText: 5,
        },
      ],
    },
  },
  {
    id: "theEcho",
    name: "THE ECHO",
    // Fifteen bodies, which is the most the field ever carries: one echo
    // divides into three, then six, then nine, and every one of them is a
    // whole contour with a seam across it. BUDS moved `fill` by ten and
    // `createRadialGradient` by ten on 10 September 2026: the seam is two lit
    // cores now, each a radial gradient of its own per body per frame
    // (`echo-buds.ts`), on the five bodies about to part in these frames.
    why: "one body divided into fifteen",
    rows: {
      p1: [
        {
          fillRect: 65,
          stroke: 147,
          fill: 78,
          clip: 21,
          save: 99,
          drawImage: 122,
          createLinearGradient: 15,
          createRadialGradient: 13,
          "new Path2D": 41,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 149,
          fill: 77,
          clip: 21,
          save: 99,
          drawImage: 122,
          createLinearGradient: 5,
          createRadialGradient: 11,
          "new Path2D": 23,
          fillText: 2,
        },
      ],
      p2: [
        {
          fillRect: 65,
          stroke: 151,
          fill: 85,
          clip: 21,
          save: 101,
          drawImage: 121,
          createLinearGradient: 15,
          createRadialGradient: 13,
          "new Path2D": 39,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 153,
          fill: 84,
          clip: 21,
          save: 101,
          drawImage: 121,
          createLinearGradient: 5,
          createRadialGradient: 11,
          "new Path2D": 23,
          fillText: 2,
        },
      ],
    },
  },
  {
    id: "theGyre",
    name: "THE GYRE",
    // Six mounts round a rim plus the hub and the wheel: ten bodies, and the
    // highest fill count in the game because every one of them is lit.
    why: "six bodies bolted round a turning rim",
    // ORBIT (11 September 2026) is two bands in four arcs, each a `strokeGlow`
    // run, in place of nine granules each a `fill` under its own save: the
    // `stroke` row rose by twenty-four, `fill` and `save` fell by five and
    // four, `new Path2D` rose by six — one wheel's worth, and nothing else.
    rows: {
      p1: [
        {
          fillRect: 65,
          stroke: 157,
          fill: 75,
          clip: 16,
          save: 71,
          drawImage: 82,
          createLinearGradient: 16,
          createRadialGradient: 3,
          "new Path2D": 47,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 159,
          fill: 75,
          clip: 16,
          save: 71,
          drawImage: 82,
          createLinearGradient: 6,
          createRadialGradient: 1,
          "new Path2D": 29,
          fillText: 2,
        },
      ],
      p2: [
        {
          fillRect: 65,
          stroke: 161,
          fill: 81,
          clip: 16,
          save: 73,
          drawImage: 81,
          createLinearGradient: 16,
          createRadialGradient: 3,
          "new Path2D": 45,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 163,
          fill: 81,
          clip: 16,
          save: 73,
          drawImage: 81,
          createLinearGradient: 6,
          createRadialGradient: 1,
          "new Path2D": 29,
          fillText: 2,
        },
      ],
    },
  },
];

describe("the dearest frames' op counts", () => {
  for (const scene of SCENES) {
    for (const role of ["p1", "p2"] as const) {
      it(`${scene.name} stays inside its budget on ${role} — ${scene.why}`, () => {
        installCanvasGlobals();
        const world = peakWorld(scene.id);
        const rows = scene.rows[role];
        let measured = 0;
        runFrames(world, role as ViewRole, rows.length * 4, {
          viewport: { width: 390, height: 844, dpr: 3 },
          onDrawn: (ctx, frame) => {
            const budget = rows[frame];
            if (!budget) return;
            if (MEASURE) {
              console.log(`  ${scene.id} ${role} frame ${frame}`, budgetRow(ctx.tally, budget));
            } else {
              for (const [key, max] of Object.entries(budget)) {
                expect(
                  ctx.tally.get(key) ?? 0,
                  `${scene.name} ${role} frame ${frame} ${key}`,
                ).toBeLessThanOrEqual(max as number);
              }
            }
            // Zeroed between frames: each row is one frame's own count, and
            // the second is lower only because the first left the caches warm.
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
  }
});
