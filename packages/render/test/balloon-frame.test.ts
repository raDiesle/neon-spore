import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { balloonHandleCircle } from "../src/balloon-handles.js";
import { handleCircle } from "../src/handles.js";
import type { ViewRole } from "../src/layout.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE BALLOON, drawn: the swell it comes up out of, the climb, the skin giving
 * on one side and on both, the split into two, the pop, and the burst at the
 * top.
 *
 * Nothing here can answer whether a stretched skin *reads* as about to give,
 * or whether the two handles are far enough apart for two thumbs at once on a
 * phone. Those are the checks this lane owes and they need an eye. What it
 * holds is that every one of those states has actually been through a canvas
 * that refuses what a real one refuses — including the two a run with no
 * commands in it never reaches, because nobody's hands are on anything.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const FAR = CFG.balloonTautMilli + 400;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

const queue = (): SpawnEntry[] => [
  { beat: 0, col: 2, kind: "balloon", color: null },
  { beat: 0, col: 5, kind: "balloon", color: null, rise: 2 },
];

/** Both seats' hands on the first balloon, taut, from `at` onward. */
function hands(tick: number, at: number, id: number): TimedCommand[] {
  if (tick < at) return [];
  const far = tick === at ? 0 : FAR;
  return [
    {
      tick,
      player: 1,
      command: { kind: "drag", target: "balloonLeft", on: true, fromMilli: -far, id },
    },
    {
      tick,
      player: 2,
      command: { kind: "drag", target: "balloonRight", on: true, fromMilli: far, id },
    },
  ];
}

function balloonFrames(role: ViewRole, ticks: number, withHands = true) {
  // The body the hands go on, pinned by **id** rather than found afresh every
  // tick: a rub puts two new bodies on the field, and a search would walk off
  // the balloon the pair is holding onto whichever one happens to be first.
  let held = 0;
  const { ctx, events } = runFrames(createWorld(CFG, 1, queue()), role, ticks, {
    every: 2,
    onTick: (tick, w) => {
      if (held === 0) held = w.creatures.find((c) => c.kind === "balloon")?.id ?? 0;
      // One hand for a beat, so the half-stretched skin is drawn, and then the
      // other joins it — which is the one state a run with no inputs never has.
      const inputs: TimedCommand[] =
        !withHands || held === 0
          ? []
          : tick >= TPB + 2 && tick <= TPB + 4
            ? hands(tick, TPB + 2, held).filter((c) => c.player === 1)
            : hands(tick, TPB * 2, held);
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return {
    ctx,
    split: count("balloonSplit"),
    pop: count("balloonPop"),
    burst: count("balloonBurst"),
  };
}

describe("a wave of balloons through a canvas that refuses what a real one does", () => {
  for (const role of ROLES) {
    it(`draws the swell, the climb and the give as ${role}`, () => {
      const { ctx, split } = balloonFrames(role, TPB * 4);
      expect(ctx.calls).toBeGreaterThan(0);
      // The run actually reached the state its frames were supposed to prove.
      expect(split).toBeGreaterThan(0);
    });
  }

  it("draws the burst at the top of the field, and the hull paying for it", () => {
    // Nobody's hands on anything, and long enough for both to climb the whole
    // field: what is drawn is the one way this creature beats the pair.
    const { burst } = balloonFrames("test", TPB * (CFG.rows + 4), false);
    expect(burst).toBeGreaterThan(0);
  });
});

describe("a caption pointed at one of THE BALLOON's handles", () => {
  /** A world with a balloon on the field, stepped until it has arrived. */
  function withBalloon() {
    const world = createWorld(CFG, 1, queue());
    for (let t = 0; t < 120 && world.creatures.length === 0; t++) step(world, []);
    if (world.creatures.length === 0) throw new Error("no balloon ever arrived");
    return world;
  }

  it("lands on the handle the drawing and the finger both use", () => {
    const world = withBalloon();
    const c = world.creatures[0]!;
    for (const [target, side] of [
      ["balloonLeft", -1],
      ["balloonRight", 1],
    ] as const) {
      const at = handleCircle(L, world, target, 0);
      expect(at, target).not.toBeNull();
      expect(at?.x, target).toBe(balloonHandleCircle(L, CFG, c, world.beat, 0, side).x);
    }
    // And the two are not the same place, which is the whole of the gesture:
    // one seat carries one of them left and the other carries the other right.
    expect(handleCircle(L, world, "balloonLeft", 0)?.x).not.toBe(
      handleCircle(L, world, "balloonRight", 0)?.x,
    );
  });

  it("is nothing at all with no balloon on the field", () => {
    // The gate that stops a target falling through into the **lid** lookup and
    // putting a ring round a body that was never there — silently, which is
    // the shape of mistake `choir-anchor.test.ts` was written for.
    const empty = createWorld(CFG, 1, []);
    expect(handleCircle(L, empty, "balloonLeft", 0)).toBeNull();
    expect(handleCircle(L, empty, "balloonRight", 0)).toBeNull();
  });
});

describe("a balloon standing in a wall column", () => {
  // The field is the full width of the glass on the phones the game ships on
  // (`gridLeft` is nought at 390×844), and a handle hangs 1.15 tiles out from
  // its body — so with no clamp the outer ring of a balloon in column 0 or
  // column 6 rests past the edge, where no finger can go, and the hint under
  // it with it.
  const walls = (): SpawnEntry[] => [
    { beat: 0, col: 0, kind: "balloon", color: null },
    { beat: 0, col: CFG.cols - 1, kind: "balloon", color: null },
  ];

  it("keeps both of its rings on the glass, for the picture and the finger alike", () => {
    const world = createWorld(CFG, 1, walls());
    for (let t = 0; t < 120 && world.creatures.length < 2; t++) step(world, []);
    expect(world.creatures.length).toBe(2);
    for (const c of world.creatures) {
      for (const side of [-1, 1] as const) {
        const ring = balloonHandleCircle(L, CFG, c, world.beat, 0, side);
        expect(ring.x - ring.r, `col ${c.col} side ${side}`).toBeGreaterThanOrEqual(0);
        expect(ring.x + ring.r, `col ${c.col} side ${side}`).toBeLessThanOrEqual(L.width);
      }
      // The inner one is still a full handle's width away from the outer, so
      // the clamp has not folded the pair onto one spot.
      const left = balloonHandleCircle(L, CFG, c, world.beat, 0, -1);
      const right = balloonHandleCircle(L, CFG, c, world.beat, 0, 1);
      expect(right.x - left.x).toBeGreaterThan(left.r * 2);
    }
  });

  it("draws them, and their words, through a canvas that refuses what a real one does", () => {
    for (const role of ROLES) {
      const { ctx } = runFrames(createWorld(CFG, 1, walls()), role, TPB * 3, {
        every: 2,
        onTick: (_tick, w) => step(w, []),
      });
      expect(ctx.calls, role).toBeGreaterThan(0);
    }
  });
});
