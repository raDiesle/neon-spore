import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { RenderState } from "../src/render-state.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GUM, drawn: the drop coming down its lane, the same drop flung out of
 * the field sideways by a hand, and — when no hand comes — the drop landing
 * on the ship and splashing across it.
 *
 * Nothing here can answer whether the ripples *read* as the ship taking a
 * hit, or whether a flung drop reads as thrown rather than teleported. Those
 * need an eye. What it holds is that every one of those states has been
 * through a canvas that refuses what a real one refuses — including the
 * flight, which a run with no commands in it never reaches — and that the
 * splash is state a restart forgets (`restart.test.ts`'s rule).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const FAR = CFG.gumSwipeMilli + 400;
const L = computeLayout(VIEWPORT, CFG, "test");

const queue = (): SpawnEntry[] => [{ beat: 0, col: 3, kind: "gum", color: null }];

/** One seat's thumb on the gum from `at`: a touch, then a carry to the right. */
function swipe(tick: number, at: number, id: number, player: 1 | 2): TimedCommand[] {
  if (tick < at) return [];
  if (tick === at) return [{ tick, player, command: { kind: "grip", id } }];
  return [
    { tick, player, command: { kind: "drag", target: "gripBody", on: true, fromMilli: FAR, id } },
  ];
}

function gumFrames(role: ViewRole, ticks: number, hand: 1 | 2 | null) {
  let held = 0;
  const { ctx, events } = runFrames(createWorld(CFG, 1, queue()), role, ticks, {
    every: 2,
    onTick: (tick, w) => {
      if (held === 0) held = w.creatures.find((c) => c.kind === "gum")?.id ?? 0;
      // Two beats of fall drawn first, so the run has the drop in the air
      // before it has the drop in flight.
      step(w, hand === null || held === 0 ? [] : swipe(tick, TPB * 2 + 2, held, hand));
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return {
    ctx,
    flung: count("gumFlung"),
    splashed: events.filter((e) => e.type === "breach" && e.kind === "gum").length,
  };
}

describe("a gum through a canvas that refuses what a real one does", () => {
  for (const role of ROLES) {
    it(`draws the fall and the flight as ${role}`, () => {
      const { ctx, flung } = gumFrames(role, TPB * 6, role === "p2" ? 2 : 1);
      expect(ctx.calls).toBeGreaterThan(0);
      // The run actually reached the state its frames were supposed to prove.
      expect(flung).toBe(1);
    });
  }

  it("draws the landing and the splash across the ship when no hand comes", () => {
    // Nobody's thumb on it, and long enough to reach the hull and for the
    // splash to run its course over the plating: the one way this creature
    // beats the pair, drawn to its end.
    const { ctx, splashed, flung } = gumFrames("test", TPB * (CFG.rows + 4), null);
    expect(ctx.calls).toBeGreaterThan(0);
    expect(splashed).toBe(1);
    expect(flung).toBe(0);
  });
});

describe("a gum's splash across a wave restart", () => {
  it("is forgotten with the rest of what a renderer holds", () => {
    // The splash outlives its frame by well over a second, so it is state,
    // and the guard `restart.test.ts` keeps for `Effects` has to hold here.
    const used = new RenderState();
    used.frame(
      [
        {
          type: "breach",
          col: 3,
          weight: "heavy",
          span: 1,
          kind: "gum",
          fromRow: 12,
          seed: 0,
          holes: 0,
          color: null,
          beat: 7,
        },
      ],
      L,
      1 / 60,
    );
    expect(used.gumSplash).not.toEqual(new RenderState().gumSplash);
    used.forget();
    expect(used.gumSplash).toEqual(new RenderState().gumSplash);
  });
});
