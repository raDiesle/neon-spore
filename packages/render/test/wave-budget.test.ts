import { describe, expect, it, setDefaultTimeout } from "bun:test";
import type { ViewRole } from "../src/layout.js";
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
 * not pad it.
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
          stroke: 68,
          fill: 31,
          clip: 8,
          save: 35,
          drawImage: 33,
          createLinearGradient: 15,
          createRadialGradient: 3,
          "new Path2D": 28,
          fillText: 4,
        },
        {
          fillRect: 73,
          stroke: 70,
          fill: 31,
          clip: 8,
          save: 35,
          drawImage: 33,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 10,
          fillText: 4,
        },
      ],
      p2: [
        {
          fillRect: 79,
          stroke: 72,
          fill: 54,
          clip: 10,
          save: 42,
          drawImage: 40,
          createLinearGradient: 15,
          createRadialGradient: 5,
          "new Path2D": 41,
          fillText: 5,
        },
        {
          fillRect: 79,
          stroke: 74,
          fill: 54,
          clip: 10,
          save: 42,
          drawImage: 40,
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
          stroke: 67,
          fill: 36,
          clip: 9,
          save: 40,
          drawImage: 36,
          createLinearGradient: 15,
          createRadialGradient: 3,
          "new Path2D": 30,
          fillText: 30,
        },
        {
          fillRect: 261,
          stroke: 69,
          fill: 36,
          clip: 9,
          save: 40,
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
          stroke: 110,
          fill: 59,
          clip: 27,
          save: 70,
          drawImage: 41,
          createLinearGradient: 17,
          createRadialGradient: 5,
          "new Path2D": 29,
          fillText: 31,
        },
        {
          fillRect: 257,
          stroke: 112,
          fill: 59,
          clip: 27,
          save: 70,
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
          save: 139,
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
          save: 139,
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
          stroke: 65,
          fill: 49,
          clip: 6,
          save: 137,
          drawImage: 99,
          createLinearGradient: 18,
          createRadialGradient: 5,
          "new Path2D": 29,
          fillText: 5,
        },
        {
          fillRect: 73,
          stroke: 67,
          fill: 49,
          clip: 6,
          save: 137,
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
    // whole contour with a seam across it.
    why: "one body divided into fifteen",
    rows: {
      p1: [
        {
          fillRect: 65,
          stroke: 119,
          fill: 55,
          clip: 21,
          save: 84,
          drawImage: 122,
          createLinearGradient: 15,
          createRadialGradient: 3,
          "new Path2D": 41,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 121,
          fill: 55,
          clip: 21,
          save: 84,
          drawImage: 122,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 23,
          fillText: 2,
        },
      ],
      p2: [
        {
          fillRect: 65,
          stroke: 117,
          fill: 60,
          clip: 21,
          save: 84,
          drawImage: 121,
          createLinearGradient: 15,
          createRadialGradient: 3,
          "new Path2D": 39,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 119,
          fill: 60,
          clip: 21,
          save: 84,
          drawImage: 121,
          createLinearGradient: 5,
          createRadialGradient: 1,
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
    rows: {
      p1: [
        {
          fillRect: 65,
          stroke: 103,
          fill: 78,
          clip: 16,
          save: 66,
          drawImage: 81,
          createLinearGradient: 16,
          createRadialGradient: 3,
          "new Path2D": 41,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 105,
          fill: 78,
          clip: 16,
          save: 66,
          drawImage: 81,
          createLinearGradient: 6,
          createRadialGradient: 1,
          "new Path2D": 23,
          fillText: 2,
        },
      ],
      p2: [
        {
          fillRect: 65,
          stroke: 101,
          fill: 82,
          clip: 16,
          save: 66,
          drawImage: 80,
          createLinearGradient: 16,
          createRadialGradient: 3,
          "new Path2D": 39,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 103,
          fill: 82,
          clip: 16,
          save: 66,
          drawImage: 80,
          createLinearGradient: 6,
          createRadialGradient: 1,
          "new Path2D": 23,
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
            for (const [key, max] of Object.entries(budget)) {
              expect(
                ctx.tally.get(key) ?? 0,
                `${scene.name} ${role} frame ${frame} ${key}`,
              ).toBeLessThanOrEqual(max as number);
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
      });
    }
  }
});
