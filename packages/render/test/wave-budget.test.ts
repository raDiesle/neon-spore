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
          stroke: 65,
          fill: 31,
          clip: 5,
          save: 31,
          drawImage: 25,
          createLinearGradient: 14,
          createRadialGradient: 3,
          "new Path2D": 28,
          fillText: 4,
        },
        {
          fillRect: 73,
          stroke: 67,
          fill: 31,
          clip: 5,
          save: 31,
          drawImage: 25,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 10,
          fillText: 4,
        },
      ],
      p2: [
        {
          fillRect: 79,
          stroke: 69,
          fill: 54,
          clip: 7,
          save: 38,
          drawImage: 32,
          createLinearGradient: 14,
          createRadialGradient: 5,
          "new Path2D": 41,
          fillText: 5,
        },
        {
          fillRect: 79,
          stroke: 71,
          fill: 54,
          clip: 7,
          save: 38,
          drawImage: 32,
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
          stroke: 64,
          fill: 36,
          clip: 6,
          save: 36,
          drawImage: 28,
          createLinearGradient: 14,
          createRadialGradient: 3,
          "new Path2D": 30,
          fillText: 30,
        },
        {
          fillRect: 261,
          stroke: 66,
          fill: 36,
          clip: 6,
          save: 36,
          drawImage: 28,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 12,
          fillText: 30,
        },
      ],
      p2: [
        {
          fillRect: 257,
          stroke: 101,
          fill: 59,
          clip: 24,
          save: 66,
          drawImage: 33,
          createLinearGradient: 16,
          createRadialGradient: 5,
          "new Path2D": 29,
          fillText: 31,
        },
        {
          fillRect: 257,
          stroke: 103,
          fill: 59,
          clip: 24,
          save: 66,
          drawImage: 33,
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
          stroke: 76,
          fill: 42,
          clip: 5,
          save: 33,
          drawImage: 33,
          createLinearGradient: 17,
          createRadialGradient: 3,
          "new Path2D": 33,
          fillText: 5,
        },
        {
          fillRect: 73,
          stroke: 78,
          fill: 42,
          clip: 5,
          save: 33,
          drawImage: 33,
          createLinearGradient: 8,
          createRadialGradient: 1,
          "new Path2D": 15,
          fillText: 5,
        },
      ],
      p2: [
        {
          fillRect: 73,
          stroke: 66,
          fill: 45,
          clip: 5,
          save: 31,
          drawImage: 31,
          createLinearGradient: 17,
          createRadialGradient: 3,
          "new Path2D": 29,
          fillText: 5,
        },
        {
          fillRect: 73,
          stroke: 68,
          fill: 45,
          clip: 5,
          save: 31,
          drawImage: 31,
          createLinearGradient: 8,
          createRadialGradient: 1,
          "new Path2D": 13,
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
          stroke: 103,
          fill: 55,
          clip: 5,
          save: 54,
          drawImage: 62,
          createLinearGradient: 14,
          createRadialGradient: 3,
          "new Path2D": 41,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 105,
          fill: 55,
          clip: 5,
          save: 54,
          drawImage: 62,
          createLinearGradient: 5,
          createRadialGradient: 1,
          "new Path2D": 23,
          fillText: 2,
        },
      ],
      p2: [
        {
          fillRect: 65,
          stroke: 101,
          fill: 60,
          clip: 5,
          save: 54,
          drawImage: 61,
          createLinearGradient: 14,
          createRadialGradient: 3,
          "new Path2D": 39,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 103,
          fill: 60,
          clip: 5,
          save: 54,
          drawImage: 61,
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
          stroke: 94,
          fill: 72,
          clip: 5,
          save: 42,
          drawImage: 45,
          createLinearGradient: 14,
          createRadialGradient: 4,
          "new Path2D": 41,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 96,
          fill: 72,
          clip: 5,
          save: 42,
          drawImage: 45,
          createLinearGradient: 5,
          createRadialGradient: 2,
          "new Path2D": 23,
          fillText: 2,
        },
      ],
      p2: [
        {
          fillRect: 65,
          stroke: 92,
          fill: 76,
          clip: 5,
          save: 42,
          drawImage: 44,
          createLinearGradient: 14,
          createRadialGradient: 4,
          "new Path2D": 39,
          fillText: 2,
        },
        {
          fillRect: 65,
          stroke: 94,
          fill: 76,
          clip: 5,
          save: 42,
          drawImage: 44,
          createLinearGradient: 5,
          createRadialGradient: 2,
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
