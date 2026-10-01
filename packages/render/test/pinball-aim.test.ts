import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinballRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawAim } from "../src/pinball-aim.js";
import { pinTable } from "../src/pinball-table.js";
import type { ViewState } from "../src/renderer.js";
import { StubContext } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The owner's ask, 30 September 2026: *the first indicator of ball should also
 * show the predicted flying direction including if it hits obstacles and
 * bounces.* The sweep's fan used to be traced against an empty table, so it
 * went straight through the board it was aiming at. This pins that it is
 * traced against the pieces really standing — a ring where each arc first
 * touches one, and a second leg off it — and against nothing once they are
 * gone.
 */

beforeAll(installCanvasGlobals);

function stopped(): { world: World; boss: PinballState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * ticksPerBeat(CFG); i++) {
    const boss = pinballRound(world);
    if (boss?.phase === "play") return { world, boss };
    step(world, []);
  }
  throw new Error("the round never reached play");
}

/** The calls one aim picture is made of, with the needle straight up. */
function aimLog(clear: boolean): string[] {
  const { world, boss } = stopped();
  boss.shot = "aim";
  boss.angleMilli = 0;
  if (clear) boss.alive = boss.alive.map(() => false);
  const ctx = new StubContext();
  const log: string[] = [];
  ctx.log = log;
  const view = { world, beatPhase: 0, role: "test", time: 0, dt: 0, events: [], running: true };
  const t = pinTable(computeLayout(VIEWPORT, CFG, "test"), CFG);
  drawAim(ctx as unknown as CanvasRenderingContext2D, t, view as unknown as ViewState, boss);
  return log;
}

const arcs = (log: string[]) => log.filter((call) => call.startsWith("arc(")).length;
const strokes = (log: string[]) => log.filter((call) => call === "stroke").length;

describe("PINBALL's aim fan against the board", () => {
  it("rings where both arcs first touch a piece, and draws the leg off it", () => {
    const log = aimLog(false);
    // The first board's target stands over the middle column, so the
    // strongest throw straight up arrives at it — and the weakest climbs only
    // to the lowest row a board may hold, which this one leaves empty.
    expect(arcs(log)).toBe(1);
    // An arc that touches is its flight, its leg after the bounce and its
    // ring; the one that does not is a plain line.
    expect(strokes(log)).toBe(4);
  });

  it("draws one plain line each over a board with nothing standing", () => {
    const log = aimLog(true);
    expect(arcs(log)).toBe(0);
    expect(strokes(log)).toBe(2);
  });
});
