import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type LedgerState,
  ledgerBoss,
  ledgerPhase,
  ledgerSeamCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawLedgerAim, ledgerAims } from "../src/ledger-aim.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * **The cannon shown the way to THE LEDGER's seam** (`ledger-aim.ts`): on the
 * pilot's screen and the rig's, never the navigator's, and only while `FIRE`
 * would stand if the cannon were under the seam — the movement is set rather
 * than played to, `ledger-grip.test.ts`' arrangement.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/** The cord in and the fight `paying`, with the cannon two columns off the seam. */
function paying(): { world: World; t: LedgerState } {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  expect(ledgerPhase(t, CFG, world.beat)).toBe("paying");
  world.cannonCol = ledgerSeamCol(t, CFG) - 2;
  return { world, t };
}

function ops(world: World, t: LedgerState, role: ViewRole): number {
  const l = computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);
  const log: string[] = [];
  const { ctx } = stubCanvas();
  ctx.log = log;
  drawLedgerAim(ctx as unknown as CanvasRenderingContext2D, l, world, t, 0.4);
  return log.length;
}

describe("THE LEDGER's cannon helper", () => {
  it("draws the way to the seam on the pilot's screen and the rig's, and not on hers", () => {
    const { world, t } = paying();
    expect(ops(world, t, "p1")).toBeGreaterThan(0);
    expect(ops(world, t, "test")).toBeGreaterThan(0);
    expect(ops(world, t, "p2")).toBe(0);
  });

  it("is gone once the cannon is under the seam, where FIRE stands instead", () => {
    const { world, t } = paying();
    world.cannonCol = ledgerSeamCol(t, CFG);
    expect(ledgerAims(world, t, world.cannonCol)).toBe(false);
    expect(ops(world, t, "p1")).toBe(0);
  });

  it("is quiet while a return is on the cord, and from the whipping hits on", () => {
    const { world, t } = paying();
    const seam = ledgerSeamCol(t, CFG);
    expect(ledgerAims(world, t, seam)).toBe(true);
    t.beads.push({ beat: world.beat + 4, span: 4, last: false, pulled: false });
    expect(ledgerAims(world, t, seam)).toBe(false);
    t.beads.length = 0;
    t.seam = CFG.ledgerWhipSeam;
    expect(ledgerAims(world, t, seam)).toBe(false);
  });
});
