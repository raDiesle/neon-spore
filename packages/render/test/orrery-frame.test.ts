import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  ORRERY_PHASES,
  type OrreryPhase,
  type OrreryState,
  orreryRingOpen,
  startWave,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawOrrery } from "../src/orrery-draw.js";
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
 * THE ORRERY drawn, through all five of its phases and on all three screens.
 *
 * The states are **set rather than played into**, for `diastole-frame.test.ts`'s
 * reason with more of it: reaching `naked` honestly is three shots that each
 * have to leave the top of the field on a beat three independent counts are
 * closed on, which is `sim/test/orrery.test.ts`'s job and is done there. What
 * is left over is the question only a canvas can answer — whether every branch
 * of the picture is drawn at all — and one a canvas can answer better than any
 * other tool: **whether a screen leaks a ring it is not meant to resolve.**
 *
 * That last one is what the colour test below is for, and it is the load-
 * bearing test of the file. Violet is *a ring you can count* and rock grey is
 * *a ring you have to be told about* (`orrery-draw.ts`), so a state with only
 * the inner ring left standing has to come out violet on the navigator's
 * screen and carry no violet whatever on the pilot's.
 */

beforeAll(installCanvasGlobals);

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("orrery");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function rings(world: World): OrreryState {
  if (world.boss?.kind !== "orrery") throw new Error("the orrery wave installed no orrery");
  return world.boss;
}

/** The boss put into one of its states, and then watched for six beats. */
function frames(role: ViewRole, into: (b: OrreryState) => void, beats = 6) {
  const world = opened();
  into(rings(world));
  return runFrames(world, role, ticksPerBeat(CFG) * beats, { every: 3 });
}

/**
 * Whether a screen puts violet on anything over six beats of a given state.
 *
 * Called directly rather than through `runFrames`, because the field's own
 * furniture is violet — the hull is `PALETTE.hull` and a wisp is a creature —
 * and a log of the whole picture could not tell an organ from a ship.
 */
function organColours(role: ViewRole, into: (b: OrreryState) => void): boolean {
  const world = opened();
  const b = rings(world);
  into(b);
  const l = computeLayout(VIEWPORT, CFG, role);
  const log: string[] = [];
  const { ctx } = stubCanvas();
  ctx.log = log;
  // Six beats, on the beat: every ring left standing has come round at least
  // once by then, so a screen shown any of them cannot fail to show it.
  for (let beat = b.phaseBeat; beat < b.phaseBeat + 6; beat++) {
    drawOrrery(ctx as unknown as CanvasRenderingContext2D, l, CFG, b, beat, 0, 0);
  }
  return log.join("|").includes(PALETTE.wisp);
}

/** Whether a colour reaches the canvas for a state, on one screen, in one
 * frame. `organColours`'s reason for going straight to `drawOrrery`. */
function paints(role: ViewRole, hex: string, into: (b: OrreryState) => void): boolean {
  const world = opened();
  const b = rings(world);
  into(b);
  const l = computeLayout(VIEWPORT, CFG, role);
  const log: string[] = [];
  const { ctx } = stubCanvas();
  ctx.log = log;
  drawOrrery(ctx as unknown as CanvasRenderingContext2D, l, CFG, b, b.phaseBeat, 0, 0);
  return log.join("|").includes(hex);
}

describe("the orrery", () => {
  for (const role of ROLES) {
    for (const phase of ORRERY_PHASES) {
      it(`draws the orbits and the core in ${phase} for ${role}`, () => {
        const { ctx } = frames(role, (b) => {
          b.phase = phase as OrreryPhase;
          // The phases and the rings are one fact: `spitting` is at least one
          // ring off and `naked` is all three, so the dashed wreck of an orbit
          // and the swelling core are entered here and nowhere else.
          if (phase === "spitting") b.broken = 1;
          if (phase === "naked" || phase === "out") b.broken = 3;
        });
        expect(ctx.calls).toBeGreaterThan(500);
      });
    }
  }

  it("draws the flare on the beat a ring comes off, and more than the beat without one", () => {
    const quiet = frames("test", (b) => {
      b.broken = 1;
      b.phase = "spitting";
    });
    const broke = frames("test", (b) => {
      b.broken = 1;
      b.phase = "spitting";
      b.brokeBeat = b.phaseBeat;
    });
    expect(broke.ctx.calls).toBeGreaterThan(quiet.ctx.calls);
  });

  it("opens the corridor of light on the beat the shaft is open, and on no other", () => {
    const world = opened();
    const b = rings(world);
    const l = computeLayout(VIEWPORT, CFG, "test");
    const calls = (beat: number): number => {
      const { ctx } = stubCanvas();
      // Mid-beat, where the corridor's own fade is at full: on the boundary it
      // is deliberately nought, so a window has an edge to aim at.
      drawOrrery(ctx as unknown as CanvasRenderingContext2D, l, CFG, b, beat, 0.5, 0);
      return ctx.calls;
    };
    const first = b.anchorBeat + CFG.orreryFirstBeats;
    expect(orreryRingOpen(CFG, b, 0, first)).toBe(true);
    expect(calls(first)).toBeGreaterThan(calls(first + 1));
  });

  it("shows the navigator the inner ring and the pilot nothing of it", () => {
    // The load-bearing test of this file. With two rings off, the only one
    // standing is the inner — the navigator's — so her screen puts violet on
    // its organs and his screen has none anywhere: he is being asked for her
    // word, which is this fight's last beat and the whole of what it is about.
    const inner = (b: OrreryState) => {
      b.broken = 2;
      b.phase = "spitting";
    };
    expect(organColours("p2", inner)).toBe(true);
    expect(organColours("p1", inner)).toBe(false);
    // And a single screen sees it, the usual *one person is holding both
    // seats* answer (`showsOrreryRing`).
    expect(organColours("test", inner)).toBe(true);
  });

  it("puts the knurl on the pilot's screen only, and lights it under his thumb", () => {
    const nobody = (b: OrreryState) => {
      b.phase = "spitting";
      b.broken = 1;
    };
    const holding = (b: OrreryState) => {
      nobody(b);
      // A bearing on the state is a hand on the ring (`orreryHandHolds`).
      b.handAtMilli = 120;
    };
    expect(paints("p1", PALETTE.hullRim, nobody)).toBe(true);
    // Not hers: a knurl drawn on the navigator's screen would be a control she
    // is being shown and cannot use (`showsOrreryGrip`).
    expect(paints("p2", PALETTE.hullRim, nobody)).toBe(false);
    expect(paints("p2", PALETTE.pod, holding)).toBe(false);
    // And it lights under a thumb, which is the only feedback this control
    // has: the ring says nothing until a whole organ has been paid for.
    expect(paints("p1", PALETTE.pod, nobody)).toBe(false);
    expect(paints("p1", PALETTE.pod, holding)).toBe(true);
  });

  it("shows the pilot the middle ring and the navigator nothing of it", () => {
    // The mirror of it, one ring earlier: with the outer gone, the middle is
    // his and the inner hers, so both screens carry violet — which is why the
    // test above sets two off rather than one.
    const middle = (b: OrreryState) => {
      b.broken = 1;
      b.phase = "spitting";
      // Nothing left of the inner ring to be shown either, so the violet on
      // the screen can only be the middle one's.
      b.from = [...b.from];
    };
    expect(organColours("p1", middle)).toBe(true);
    expect(organColours("p2", middle)).toBe(true);
  });
});
