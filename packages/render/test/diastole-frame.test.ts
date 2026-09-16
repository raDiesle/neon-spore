import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type DiastolePhase,
  type DiastoleState,
  startWave,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawDiastole } from "../src/diastole-draw.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE DIASTOLE through all four of its phases, on both screens.
 *
 * The phases are **set rather than played into**, which is what this file is
 * able to prove and what it is not. Reaching `alone` honestly takes five hits,
 * each of them a shot that has to leave the top of the field on a beat one of
 * two counts is closed on — that is `sim/test/diastole.test.ts`'s job and it
 * does it there. What is left over is a question only a canvas can answer:
 * whether every branch of the picture is drawn at all. A chamber collapsed to a
 * husk, a bundle parting, a flare on a strike and a count a seat is *not* shown
 * are four branches nothing else in the suite enters (`cairn-window.test.ts`
 * sets `units` for the same reason).
 */

beforeAll(installCanvasGlobals);

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("diastole");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function lobe(world: World): DiastoleState {
  if (world.boss?.kind !== "diastole") throw new Error("the diastole wave installed no diastole");
  return world.boss;
}

/** The boss put into one of its four states, and then watched for six beats. */
function frames(role: ViewRole, into: (b: DiastoleState) => void, beats = 6) {
  const world = opened();
  into(lobe(world));
  return runFrames(world, role, ticksPerBeat(CFG) * beats, { every: 3 });
}

/**
 * Which of the two colours a screen puts on the chambers over six beats, and
 * whether it is the pulse's rim or the body's own hue.
 *
 * Called directly rather than through `runFrames`, because both colours are
 * all over an ordinary frame — the trigger, the strips, the hull — and a log of
 * the whole picture could not tell a chamber's outline from a button's.
 */
function colours(
  phase: DiastolePhase,
  role: ViewRole,
  of: (side: "red" | "cyan") => string,
): { red: boolean; cyan: boolean } {
  const world = opened();
  const b = lobe(world);
  b.phase = phase;
  const l = computeLayout(VIEWPORT, CFG, role);
  const log: string[] = [];
  const { ctx } = stubCanvas();
  ctx.log = log;
  // Six beats, on the beat: the left contracts on three of them and the right
  // on one, so a screen shown either one cannot fail to show it.
  for (let beat = b.phaseBeat; beat < b.phaseBeat + 6; beat++) {
    drawDiastole(ctx as unknown as CanvasRenderingContext2D, l, CFG, b, beat, 0, 0);
  }
  const text = log.join("|");
  return { red: text.includes(of("red")), cyan: text.includes(of("cyan")) };
}

/** The rim, which is only ever stroked on a contraction the seat can see. */
const rims = (phase: DiastolePhase, role: ViewRole) =>
  colours(phase, role, (c) => (c === "red" ? PALETTE.redRim : PALETTE.cyanRim));

/** The body's own outline, which says whose chamber it is and nothing else. */
const hues = (phase: DiastolePhase, role: ViewRole) =>
  colours(phase, role, (c) => (c === "red" ? PALETTE.red : PALETTE.cyan));

const PHASES: DiastolePhase[] = ["one", "two", "alone", "burst"];

describe("the diastole", () => {
  for (const role of ROLES) {
    for (const phase of PHASES) {
      it(`draws the chambers and the bridge in ${phase} for ${role}`, () => {
        const { ctx } = frames(role, (b) => {
          b.phase = phase;
          // `alone` and `burst` are states with a chamber gone, so the husk is
          // drawn in two of the four and the full body in the other two.
          if (phase === "alone" || phase === "burst") b.leftHits = 0;
          if (phase === "burst") b.rightHits = 0;
        });
        expect(ctx.calls).toBeGreaterThan(500);
      });
    }
  }

  it("draws the flare on a strike, and draws more than the beat without one", () => {
    const quiet = frames("test", (b) => {
      b.phase = "two";
    });
    const struck = frames("test", (b) => {
      b.phase = "two";
      // Both at once, which is what the beam in the bridge does and the one
      // frame the whole fight is for.
      b.struckBeat = b.phaseBeat;
      b.struckSide = 0;
    });
    expect(struck.ctx.calls).toBeGreaterThan(quiet.ctx.calls);
  });

  it("shows the pilot one count and the navigator the other, in their own colours", () => {
    // The load-bearing test of this file, and the only one that could catch a
    // picture that leaked a count. Over six beats of phase `two` the left
    // chamber contracts three times and the right once, so a screen shown the
    // left puts the red rim on and never the cyan, and a screen shown the
    // right does the reverse. A seat that saw both would be a seat that could
    // read the other's stride off its own phone, and the fight would be one
    // person counting fifteen out loud.
    expect(rims("two", "p1")).toEqual({ red: true, cyan: false });
    expect(rims("two", "p2")).toEqual({ red: false, cyan: true });
    // And a single screen sees both, because a person playing alone is holding
    // both counts and a grey chamber would be hiding one from the only pair
    // there is (`showsDiastoleBeat`).
    expect(rims("two", "test")).toEqual({ red: true, cyan: true });
  });

  it("says which chamber is yours before it has woken, and no more than that", () => {
    // Phase `one` is the asymmetric one: the left chamber beats and the right
    // keeps no cadence at all, so the pilot's screen pulses and the
    // navigator's shows **no rim of either colour** — there is no stride up
    // there to read, which is the whole point of the phase.
    expect(rims("one", "p1")).toEqual({ red: true, cyan: false });
    expect(rims("one", "p2")).toEqual({ red: false, cyan: false });
    // What the navigator does get is the hue, standing still: *that one will
    // be yours*. It is the three states the first frame of this boss argued
    // for — two identical grey masses left the seat that has to hold the other
    // player's number not knowing which one would become its own.
    expect(hues("one", "p1")).toEqual({ red: true, cyan: false });
    expect(hues("one", "p2")).toEqual({ red: false, cyan: true });
  });
});
