import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
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
 * **THE LEDGER's one ring, drawn** — the other half of `ledger-grip.ts`, which
 * `ledger-grip.test.ts` asks about only as a hit test.
 *
 * A ring fills a flat disc in `PALETTE.background` before anything else
 * (`handle-draw.ts`), and on this boss **two other things do**: each half of
 * the body is laid down opaque before its metal goes on (`ledger-draw.ts`,
 * `drawHalf`), which is why every count here has `HALVES` taken off it — THE
 * TASTER's notches, in a different fight. Both halves stand in every state
 * this file asks about, including `out`, where the boss is held for
 * `ledgerOutBeats` after the tear. Ops are no use instead: the cord and its
 * beads move between any two states worth comparing.
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

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return t;
}

function rooted(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
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

/** The seats this ring is drawn on at all: not the pilot's, whose screen it
 * would tell the rooted column to (`ledger-grip.ts`). */
const HERS: ViewRole[] = ROLES.filter((r) => r !== "p1");

/** How many rings are standing on this screen, net of the body's two halves. */
function rings(world: World, role: ViewRole = "test"): number {
  return count(drawn(world, role), PALETTE.background) - HALVES;
}

describe("THE LEDGER's ring on the root", () => {
  it.each(HERS)("stands while the cord is paying out, on %s", (role) => {
    const world = open();
    expect(ledgerPhase(cord(world), CFG, world.beat)).toBe("rooting");
    expect(rings(world, role)).toBe(1);
  });

  it.each(HERS)("stands once the cord is in, and is still one, on %s", (role) => {
    // The same circle, the other gesture: two rings here would be the pair
    // taught that the root has a handle *and* a handle beside it.
    const world = open();
    rooted(world);
    expect(rings(world, role)).toBe(1);
  });

  it("goes when her grace is spent", () => {
    const world = open();
    rooted(world).plugBeats = 0;
    expect(rings(world)).toBe(0);
  });

  it("goes on the taut cord, which is the movement she is refused in", () => {
    const world = open();
    const t = rooted(world);
    t.seam = CFG.ledgerSeamHits;
    expect(rings(world)).toBe(0);
  });

  it.each(ROLES)("has gone once the cord is out of the ship, on %s", (role) => {
    const world = open();
    cord(world).outBeat = world.beat;
    expect(rings(world, role)).toBe(0);
  });

  it("is not drawn on the pilot's screen, in either gesture", () => {
    // **The one handle on this field neither seat sees dimmed.** The ring
    // stands in `t.socket`'s own column, so a dim one on his screen would read
    // out where the cord is rooted — which is the half of this fight the cord
    // is faded out above the plating to keep from him (`ledger-grip.ts`,
    // `view-role-clocks.ts`).
    const rooting = open();
    expect(rings(rooting, "p1")).toBe(0);
    const paying = open();
    rooted(paying);
    expect(rings(paying, "p1")).toBe(0);
  });

  it("lights the rim while her thumb is on the foot, and in violet", () => {
    // `hullRim` and not the white every other handle's rim is: white is the
    // lock's on this boss, and the two marks are a finger apart.
    const loose = open();
    const held = open();
    cord(held).foot = cord(held).socket;
    expect(count(drawn(held, "test"), PALETTE.hullRim)).toBeGreaterThan(
      count(drawn(loose, "test"), PALETTE.hullRim),
    );
  });

  it("lights the rim while her thumb is in the socket", () => {
    const loose = open();
    rooted(loose);
    const held = open();
    rooted(held).plug = true;
    expect(count(drawn(held, "test"), PALETTE.hullRim)).toBeGreaterThan(
      count(drawn(loose, "test"), PALETTE.hullRim),
    );
  });

  it("drains the plug's dial as the grace is spent, thumb or no thumb", () => {
    // The count keeps on the beat either way (`ledger-step.ts`), so the dial
    // is the grace and not the hold — THE UNDERTOW's free, read the same way.
    const full = open();
    rooted(full);
    const last = open();
    rooted(last).plugBeats = 1;
    expect(drawn(last, "test")).not.toBe(drawn(full, "test"));
  });
});
