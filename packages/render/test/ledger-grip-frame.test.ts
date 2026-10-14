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
import { AIM_LOOK } from "../src/cue-helper.js";
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
import { GOO_ARROW, GOO_KNOB } from "./goo-needles.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LEDGER's one ring, drawn** — the other half of `ledger-grip.ts`, which
 * `ledger-grip.test.ts` asks about only as a hit test. It is the HOLD LAB's
 * drop since 14 October 2026 and is still counted as one ring here.
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
  // The shot's mark has a dark sleeve of its own (`aim-ember.ts`) and is not a ring.
  const paint = AIM_LOOK.paint;
  AIM_LOOK.paint = () => {};
  try {
    runFrames(world, role, 3, {
      every: 3,
      onTick: () => {},
      onCanvas: (c) => {
        c.log = log;
      },
    });
  } finally {
    AIM_LOOK.paint = paint;
  }
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** The body's own two opaque fills, which stand whatever the cord is doing. */
const HALVES = 2;
/** The pilot's haul, which is on the taut cord and on every screen there. */
const HAUL = 1;

/** The seats this ring is drawn on at all: not the pilot's, whose screen it
 * would tell the rooted column to (`ledger-grip.ts`). */
const HERS: ViewRole[] = ROLES.filter((r) => r !== "p1");

/** How many rings are standing on this screen, net of the body's two halves. */
function rings(world: World, role: ViewRole = "test"): number {
  // A ring punches its disc; a pull knob is FIZZ's drop, which punches none and
  // whose arrow has an edge in the field's colour (`goo-needles.ts`).
  const frame = drawn(world, role);
  const discs = count(frame, PALETTE.background) - HALVES - 2 * count(frame, GOO_ARROW);
  return discs + count(frame, GOO_KNOB);
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
    // **One ring stands there and it is not hers.** The pilot's haul is on
    // the taut cord and it is the one handle in this fight drawn on both
    // screens (`ledger-haul.ts`), so what this case can count is that the
    // root's went — the thumb behind it is refused in
    // `ledger-grip.test.ts`, where a press is what answers.
    const world = open();
    const t = rooted(world);
    t.seam = CFG.ledgerSeamHits;
    expect(rings(world)).toBe(HAUL);
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

  it("sinks under her thumb on the foot, as every hold's drop does", () => {
    // The HOLD LAB's drop since 14 October 2026 (`soak-hold.ts`): waiting it
    // calls with ripples, held it is pressed in and calls no more.
    const loose = open();
    const held = open();
    cord(held).foot = cord(held).socket;
    expect(drawn(held, "test")).not.toBe(drawn(loose, "test"));
  });

  it("sinks under her thumb in the socket", () => {
    const loose = open();
    rooted(loose);
    const held = open();
    rooted(held).plug = true;
    expect(drawn(held, "test")).not.toBe(drawn(loose, "test"));
  });

  it("fills the plug's drop as the grace is spent, thumb or no thumb", () => {
    // The count keeps on the beat either way (`ledger-step.ts`), so the water
    // is the grace and not the hold — THE UNDERTOW's free, read the same way.
    const full = open();
    rooted(full);
    const last = open();
    rooted(last).plugBeats = 1;
    expect(drawn(last, "test")).not.toBe(drawn(full, "test"));
  });
});
