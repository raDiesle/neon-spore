import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LedgerBead,
  type LedgerState,
  ledgerBoss,
  ledgerPhase,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The pilot's two rings, drawn** — the other half of `ledger-pull.ts`, which
 * `ledger-pull.test.ts` asks about only as a hit test.
 *
 * Counted the way `ledger-grip-frame.test.ts` counts hers, and for the same
 * reason: a ring fills a flat disc in `PALETTE.background` before anything
 * else (`handle-draw.ts`), and on this boss each half of the body does too
 * (`ledger-draw.ts`, `drawHalf`), which is why every count here has `HALVES`
 * taken off it.
 *
 * **Most of it is asked on his own screen**, which is not a convenience: her
 * ring is drawn on hers alone and his bead's on his alone, so `p1` is the one
 * role where a count is his two and nothing else. Where a case is about the
 * seat split itself it is asked on every role.
 *
 * The states are **set** rather than played to, this fight's whole suite's
 * arrangement (`ledger-frame.test.ts`).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function open(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

/** The one return these cases put on the cord, past the index check. */
function only(t: LedgerState): LedgerBead {
  const b = t.beads[0];
  if (b === undefined) throw new Error("the cord was set with no return on it");
  return b;
}

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return t;
}

/** The cord whipping, with one return four beats down it and no other. */
function whipping(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  t.seam = CFG.ledgerWhipSeam;
  t.beads = [{ beat: world.beat + 4, span: 5, last: false, pulled: false }];
  expect(ledgerPhase(t, CFG, world.beat)).toBe("whipping");
  return t;
}

/** The cord taut, with the one return nobody is meant to answer on it. */
function taut(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  t.seam = CFG.ledgerSeamHits;
  t.beads = [{ beat: world.beat + 3, span: 5, last: true, pulled: false }];
  expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
  return t;
}

/** Frames of a world **held still**: these movements are counted off a beat. */
function drawn(world: World, role: ViewRole): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onTick: () => {},
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** The body's own two opaque fills, which stand whatever the cord is doing. */
const HALVES = 2;
/**
 * **Her own ring, which is on the navigator's screen right through
 * `whipping`** — the plug is offered from `paying` on (`ledger-grip.ts`), so a
 * count taken on `p2` in this movement is one before either of his is drawn.
 * Taken off rather than avoided, because the thing these cases are about is
 * exactly that *his* is not there.
 */
const PLUG = 1;

/** The seats either of his is drawn on: not hers (`showsLedgerBead`). */
const HIS: ViewRole[] = ROLES.filter((r) => r !== "p2");

function rings(world: World, role: ViewRole = "p1"): number {
  return count(drawn(world, role), PALETTE.background) - HALVES;
}

describe("the pull's ring, on the soonest return", () => {
  it("stands while the cord whips", () => {
    const world = open();
    whipping(world);
    expect(rings(world)).toBe(1);
  });

  it("is not drawn while the cord is only paying", () => {
    const world = open();
    const t = whipping(world);
    t.seam = CFG.ledgerWhipSeam - 1;
    expect(ledgerPhase(t, CFG, world.beat)).toBe("paying");
    expect(rings(world)).toBe(0);
  });

  it("goes once that return has been hauled", () => {
    const world = open();
    only(whipping(world)).pulled = true;
    expect(rings(world)).toBe(0);
  });

  it("is not drawn on the navigator's screen", () => {
    // It would say where the return has got to, which is the half of this
    // fight she is not shown — and say it in the middle of the cord, where
    // she reads everything (`showsLedgerBead`, `ledger-pull.ts`).
    const world = open();
    whipping(world);
    expect(rings(world, "p2")).toBe(PLUG);
  });

  it("is never the one bead both screens are shown", () => {
    // The last return is drawn to her too, and it is the one return nobody is
    // meant to answer — so the exception and the gate never meet.
    const world = open();
    only(whipping(world)).last = true;
    expect(rings(world)).toBe(0);
    expect(rings(world, "p2")).toBe(PLUG);
  });

  it("moves with the return rather than standing at one place", () => {
    const early = open();
    whipping(early);
    const late = open();
    only(whipping(late)).beat = late.beat + 2;
    expect(drawn(late, "p1")).not.toBe(drawn(early, "p1"));
  });
});

describe("the haul's ring, on the taut cord", () => {
  it.each(HIS)("stands on %s, above the stretch his screen fades out", (role) => {
    const world = open();
    taut(world);
    expect(rings(world, role)).toBe(1);
  });

  it("is not on hers, not even dimmed", () => {
    // It was, for one frame, on the argument that the tear is refused while
    // her plate covers the socket and he cannot see the column. A ring fills
    // its disc opaquely, so hers came out a black circle on the cord — which
    // is what a *return* looks like, in the one place her screen never puts
    // one (`ledger-haul.ts`). The refusal stays silent and his dial standing
    // at nought is what makes him ask.
    const world = open();
    taut(world);
    expect(rings(world, "p2")).toBe(0);
  });

  it("is not offered while the cord is still whipping", () => {
    // Which is also what says the two of his are never on a screen together:
    // one ring in `whipping`, one in `taut`, and the first of these is the
    // bead's.
    const world = open();
    whipping(world);
    expect(rings(world, "p2")).toBe(PLUG);
  });

  it("fills its dial with his carry", () => {
    const loose = open();
    taut(loose);
    const held = open();
    taut(held);
    cord(held).haulMilli = CFG.ledgerHaulMilli;
    expect(count(drawn(held, "p1"), PALETTE.hullRim)).toBeGreaterThan(
      count(drawn(loose, "p1"), PALETTE.hullRim),
    );
  });

  it("will not fill while her plate covers the socket, and stands anyway", () => {
    // The refusal is silent on purpose: he cannot see the column he is being
    // refused for and she can, so a ring that will not fill is the moment he
    // has to ask her (`sim/ledger-gates.ts`, `haul`).
    const world = open();
    const t = taut(world);
    world.shieldCol = t.socket;
    expect(t.haulMilli).toBe(0);
    expect(rings(world)).toBe(1);
  });

  it.each(ROLES)("has gone once the cord is out of the ship, on %s", (role) => {
    const world = open();
    taut(world).outBeat = world.beat;
    expect(rings(world, role)).toBe(0);
  });
});
