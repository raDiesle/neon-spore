import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  type UndertowState,
  undertowBoss,
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
 * **THE UNDERTOW's two rings, drawn** — the other half of `undertow-grip.ts`,
 * which `undertow-grip.test.ts` asks about only as a hit test.
 *
 * A hit test cannot see a ring at all. It computes the circle from
 * `undertow-grip-place.ts` and asks what a thumb in it does, so the drawing
 * and the press agree with each other whatever either of them is doing to the
 * picture — and what this pair does to the picture is the whole question,
 * because a ring fills a flat disc in `PALETTE.background` before anything
 * else (`handle-draw.ts`) and both of these stand on the busiest tile of this
 * fight. THE LEDGER's pilot learnt it the same way, one lane earlier: a suite
 * that counts rings cannot see what a ring is mistaken for, and a suite that
 * counts none cannot see a ring.
 *
 * **Nothing else on this field lays down a background fill**, so the count is
 * the rings and no arithmetic is needed to get at it — which is why `BARE` is
 * asserted here rather than subtracted everywhere.
 *
 * The breaches are **set** rather than pushed into, `undertow-frame.test.ts`'
 * arrangement and for its reason: which column the floor comes up in is the
 * rng's, and `sim/test/undertow.test.ts` already proves the clock.
 */

beforeAll(installCanvasGlobals);

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow wave installed no floor");
  return u;
}

function breach(world: World, col: number, stage: "bowing" | "standing"): void {
  floor(world).breaches.push({
    col,
    stage,
    stageBeat: world.beat,
    tall: false,
    widthMilli: 0,
    widened: false,
  });
}

/** Frames of a world **held still**: what these rings do is counted off a beat. */
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

/** How many rings are standing on this screen. */
function rings(world: World, role: ViewRole): number {
  return count(drawn(world, role), PALETTE.background);
}

/** The seats her offer is drawn on: not his (`drawUndertowGrips`). */
const HERS: ViewRole[] = ROLES.filter((r) => r !== "p1");

describe("the navigator's pin, on a standing lobe", () => {
  it.each(ROLES)("is nothing at all on a floor with no breach in it, on %s", (role) => {
    // The `BARE` this file's count leans on, asserted rather than assumed:
    // every other case here reads a number straight off the fill count.
    expect(rings(opened(), role)).toBe(0);
  });

  it.each(HERS)("stands on the lobe she may pin, on %s", (role) => {
    const world = opened();
    breach(world, 3, "standing");
    expect(rings(world, role)).toBe(1);
  });

  it.each(HERS)("comes one to a lobe, on %s", (role) => {
    const world = opened();
    breach(world, 2, "standing");
    breach(world, 7, "standing");
    expect(rings(world, role)).toBe(2);
  });

  it.each(ROLES)("is not offered over a plate that is only bowing, on %s", (role) => {
    const world = opened();
    breach(world, 3, "bowing");
    expect(rings(world, role)).toBe(0);
  });

  it.each(ROLES)("is gone from every lobe through the last one, on %s", (role) => {
    // `undertowTake` refuses in that phase and a pin there could only be a way
    // for her to spoil his hold (`sim/undertow-hand.ts`).
    const world = opened();
    breach(world, 3, "standing");
    floor(world).phase = "last";
    expect(rings(world, role)).toBe(0);
  });

  it("is not offered on the pilot's screen, where it would be a hole in his target", () => {
    // **The defect the frame found.** A ring fills its disc opaquely, so his
    // dim copy came out a flat black disc filling the lobe's head — which is
    // what a breach in this hull looks like — and it stood on every standing
    // lobe at once, to offer him a thumb the wire drops (`undertow-grip.ts`).
    const world = opened();
    breach(world, 2, "standing");
    breach(world, 7, "standing");
    expect(rings(world, "p1")).toBe(0);
  });

  it("is on his screen once her thumb is down, and only on that column", () => {
    // The one thing about this handle he can act on: the maw is refused in a
    // pinned column exactly as it is in the plate's (`undertow-press.ts`), and
    // he has to be told which one before he says *let go*.
    const world = opened();
    breach(world, 2, "standing");
    breach(world, 7, "standing");
    floor(world).pinCol = 7;
    expect(rings(world, "p1")).toBe(1);
    expect(rings(world, "p2")).toBe(2);
  });

  it("lights its rim while her thumb is on it", () => {
    const loose = opened();
    breach(loose, 3, "standing");
    const held = opened();
    breach(held, 3, "standing");
    floor(held).pinCol = 3;
    expect(count(drawn(held, "p2"), PALETTE.text)).toBeGreaterThan(
      count(drawn(loose, "p2"), PALETTE.text),
    );
  });
});

describe("the navigator's free, over the stuck pilot's column", () => {
  it.each(ROLES)("stands on every screen while the floor has him, on %s", (role) => {
    // Hers bright and his dim, and this one earns the dim copy: it is his seat
    // she is buying back, and a pilot who could not see it coming would sit
    // out `undertowUnseatedBeats` with no idea (`undertow-grip.ts`).
    const world = opened();
    floor(world).unseatedUntil = world.beat + CFG.undertowUnseatedBeats;
    expect(rings(world, role)).toBe(1);
  });

  it.each(ROLES)("is nothing before the floor takes him, on %s", (role) => {
    const world = opened();
    expect(rings(world, role)).toBe(0);
  });

  it("stands clear of a pin in his own column, so both are reachable", () => {
    const world = opened();
    const u = floor(world);
    u.unseatedUntil = world.beat + CFG.undertowUnseatedBeats;
    breach(world, world.cannonCol, "standing");
    expect(rings(world, "p2")).toBe(2);
  });

  it("fills its dial with the beats she has banked", () => {
    // The count itself, drawn whether or not her thumb is still down — lifted
    // off, the count keeps (`sim/undertow-hand.ts`), and a dial that emptied
    // on a slip would take the number off both screens at the one moment the
    // pair is reading it.
    const empty = opened();
    floor(empty).unseatedUntil = empty.beat + CFG.undertowUnseatedBeats;
    const banked = opened();
    const u = floor(banked);
    u.unseatedUntil = banked.beat + CFG.undertowUnseatedBeats;
    u.freed = CFG.undertowFreeBeats - 1;
    expect(drawn(banked, "p2")).not.toBe(drawn(empty, "p2"));
  });
});
