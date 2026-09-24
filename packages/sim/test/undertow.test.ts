import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
  undertowLastCol,
  undertowLobeAt,
  undertowPlateBeside,
  undertowUnseated,
  type World,
} from "../src/index.js";

/**
 * THE UNDERTOW, and the sentence it is built to make true: **the attack
 * comes up through the floor, and the pair answers it downward** — the maw
 * over a lobe, the plate on a breach, the beam for the tall ones, and the
 * last one held open under until the body follows it in.
 *
 * What is checked is each answer and each miss: a lobe taken closes clean, a
 * lobe left withdraws and leaves a scar in the pair's own hull without
 * costing the wave, a breach nobody plates widens and lets a second lobe
 * through, the floor under the cannon unseats a pilot who stays, and the
 * last lobe is the one miss that is a hit.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3, cfg: SimConfig = CFG): World {
  const world = createWorld(cfg, seed);
  startWave(world, WAVE, [], [], { kind: "undertow" });
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("no floor installed");
  return u;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Run until a lobe stands somewhere, or give up. Returns its column. */
function untilLobe(world: World, cap = 40): number {
  for (let i = 0; i < cap * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing");
    if (b) return b.col;
    step(world, []);
  }
  throw new Error("no lobe ever stood");
}

/** Run until the floor is bowing somewhere, or give up. */
function untilBow(world: World, cap = 40): void {
  for (let i = 0; i < cap * TPB; i++) {
    if (floor(world).breaches.length > 0) return;
    step(world, []);
  }
  throw new Error("the floor never bowed");
}

/** Player 1 over the column with the maw open: one tick. */
function maw(world: World, col: number): void {
  step(world, [cmd(world, 1, { kind: "cannonCol", col }), cmd(world, 1, { kind: "intake" })]);
}

/** Every lobe taken as it stands, until the phase changes. */
function takeAll(world: World, until: UndertowState["phase"]): void {
  for (let i = 0; i < 400 * TPB && floor(world).phase !== until; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing" && !x.tall);
    if (b) maw(world, b.col);
    else step(world, []);
  }
}

describe("THE UNDERTOW", () => {
  it("opens quiet, then bows one column and stands a lobe in it after the bow", () => {
    const world = open();
    const u = floor(world);
    expect(u.phase).toBe("one");
    expect(u.breaches).toHaveLength(0);
    expect(beats(world, CFG.undertowRestBeats + 1).has("undertowBow")).toBe(true);
    expect(u.breaches).toHaveLength(1);
    expect(u.breaches[0]?.stage).toBe("bowing");
    const bowed = u.breaches[0]?.stageBeat ?? 0;
    const col = untilLobe(world);
    expect(world.beat - bowed).toBe(CFG.undertowBowBeats);
    expect(undertowLobeAt(u, col)).not.toBeNull();
    expect(world.events.some((e) => e.type === "undertowLobe")).toBe(true);
  });

  it("takes a lobe with the maw open over it, and the breach closes clean", () => {
    const world = open();
    const col = untilLobe(world);
    maw(world, col);
    const u = floor(world);
    expect(u.breaches).toHaveLength(0);
    expect(u.taken).toBe(1);
    expect(u.scars).toBe(0);
    expect(world.scars).toHaveLength(0);
    expect(world.events.some((e) => e.type === "undertowTaken")).toBe(true);
  });

  it("does not take a lobe through a plate standing on it", () => {
    const world = open();
    const col = untilLobe(world);
    step(world, [cmd(world, 2, { kind: "shieldCol", col })]);
    maw(world, col);
    expect(floor(world).breaches).toHaveLength(1);
  });

  // The plate stands on the column throughout: it stops the breach widening but
  // not the stand clock, so the lobe still withdraws untaken and still scars.
  // Left unplated the breach now breeds a second lobe on its fourth beat, which
  // is the next test and would be noise in this one.
  it("scars the hull when a lobe withdraws untaken, and does not cost the wave", () => {
    const world = open();
    const col = untilLobe(world);
    step(world, [cmd(world, 2, { kind: "shieldCol", col })]);
    const seen = beats(world, CFG.undertowStandBeats + 1);
    const u = floor(world);
    expect(u.breaches).toHaveLength(0);
    expect(u.scars).toBe(1);
    expect(world.scars.some((s) => s.col === col && s.kind === "slick")).toBe(true);
    expect(seen.has("undertowScar")).toBe(true);
    expect(failHolds(world)).toBe(false);
    expect(seen.has("waveFailed")).toBe(false);
  });

  // On the shipped config and not a stretched one: the point of the figures is
  // that a breach reaches `undertowWideMilli` before `undertowStandBeats` takes
  // it away, and a test that lengthens the stand proves the widening arithmetic
  // while hiding whether the game ever gets to run it. It did not, until
  // `undertowStandBeats` went to 5.
  it("widens a breach nobody plates until a second lobe stands beside it", () => {
    const world = open(3);
    const col = untilLobe(world);
    const need = Math.ceil(CFG.undertowWideMilli / CFG.undertowWidenMilli);
    expect(need).toBeLessThan(CFG.undertowStandBeats);
    const seen = beats(world, need);
    const u = floor(world);
    expect(u.breaches).toHaveLength(2);
    expect(u.breaches.some((b) => b.col !== col && b.stage === "standing")).toBe(true);
    expect(seen.has("undertowWidened")).toBe(true);
  });

  it("stops a breach widening while the plate stands on it", () => {
    const world = open(3, { ...CFG, undertowStandBeats: 40 });
    const col = untilLobe(world);
    step(world, [cmd(world, 2, { kind: "shieldCol", col })]);
    beats(world, 10);
    const u = floor(world);
    expect(u.breaches).toHaveLength(1);
    expect(u.breaches[0]?.widthMilli).toBe(0);
  });

  it("pushes two columns four apart in the second part", () => {
    const world = open();
    takeAll(world, "two");
    for (let i = 0; i < 20 * TPB && floor(world).breaches.length < 2; i++) step(world, []);
    const cols = floor(world).breaches.map((b) => b.col);
    expect(cols).toHaveLength(2);
    expect(Math.abs((cols[0] ?? 0) - (cols[1] ?? 0))).toBe(CFG.undertowPairGap);
  });

  it("stands a tall lobe the maw cannot take and the beam can", () => {
    const world = open();
    takeAll(world, "hard");
    const col = untilLobe(world);
    const u = floor(world);
    expect(undertowLobeAt(u, col)?.tall).toBe(true);
    maw(world, col);
    expect(u.breaches).toHaveLength(1);
    // The lance: player 1 in the column, player 2's thumb held on a colour
    // until the lobe fills and the column burns.
    step(world, [
      cmd(world, 1, { kind: "cannonCol", col }),
      cmd(world, 2, { kind: "prime", on: true, color: "red" }),
    ]);
    for (let i = 0; i < CFG.lancePrimeBeats * TPB + 1 && world.beam === null; i++) step(world, []);
    expect(world.beam).not.toBeNull();
    expect(u.breaches).toHaveLength(0);
    expect(u.taken).toBe(CFG.undertowSingles + CFG.undertowPairs * 2 + 1);
  });

  // The plate stands on the tall lobe's column so the breach cannot breed a
  // second lobe next door — the neighbour is the column the plate goes from,
  // and a lobe standing there would be a second withdrawal in the count.
  it("takes the plate with it when a tall lobe withdraws untaken: two columns, marked as gone", () => {
    const world = open();
    takeAll(world, "hard");
    const col = untilLobe(world);
    step(world, [cmd(world, 2, { kind: "shieldCol", col })]);
    let tallScar = false;
    for (let i = 0; i < (CFG.undertowStandBeats + 1) * TPB; i++) {
      step(world, []);
      if (world.events.some((e) => e.type === "undertowScar" && e.tall)) tallScar = true;
    }
    const u = floor(world);
    expect(u.breaches).toHaveLength(0);
    expect(u.scars).toBe(1);
    expect(tallScar).toBe(true);
    const plates = world.scars.filter((s) => s.plate === true).map((s) => s.col);
    expect(plates.sort()).toEqual([col, undertowPlateBeside(CFG, col)].sort());
    expect(failHolds(world)).toBe(false);
  });

  it("tears the plating and leaves it when an ordinary lobe withdraws", () => {
    const world = open();
    const col = untilLobe(world);
    step(world, [cmd(world, 2, { kind: "shieldCol", col })]);
    beats(world, CFG.undertowStandBeats + 1);
    expect(world.scars.some((s) => s.col === col)).toBe(true);
    expect(world.scars.some((s) => s.plate === true)).toBe(false);
  });

  it("unseats a pilot who stays on the floor bowing under the cannon", () => {
    const world = open();
    takeAll(world, "seat");
    untilBow(world);
    const u = floor(world);
    expect(u.breaches[0]?.col).toBe(world.cannonCol);
    expect(beats(world, CFG.undertowUnseatBeats + 1).has("undertowUnseated")).toBe(true);
    expect(undertowUnseated(u, world.beat)).toBe(true);
    // Swallowed, silently: the cannon does not move.
    const before = world.cannonCol;
    step(world, [cmd(world, 1, { kind: "cannonCol", col: before === 0 ? 1 : 0 })]);
    expect(world.cannonCol).toBe(before);
    // The other seat is untouched.
    step(world, [cmd(world, 2, { kind: "shieldCol", col: 2 })]);
    expect(world.shieldCol).toBe(2);
    beats(world, CFG.undertowUnseatedBeats + 1);
    expect(undertowUnseated(u, world.beat)).toBe(false);
  });

  it("closes the plate under a pilot who slid off in time, and nothing comes through", () => {
    // The design's step 11, landed: the one thing that beat asks is the
    // slide, and the plate closing is its whole answer — no lobe stands
    // where the cannon was, no scar, and his seat is his.
    const world = open();
    takeAll(world, "seat");
    untilBow(world);
    const col = world.cannonCol;
    const scarsBefore = world.scars.length;
    // Every slide short of `undertowUnseatSlides` the floor follows him
    // (`undertowFollow`), inside the same window.
    for (let i = 1; i <= CFG.undertowUnseatSlides; i++) {
      const to = world.cannonCol === 0 ? 1 : world.cannonCol - 1;
      step(world, [cmd(world, 1, { kind: "cannonCol", col: to })]);
      if (i === CFG.undertowUnseatSlides) break;
      beats(world, 1);
      expect(floor(world).breaches[0]?.col).toBe(to);
    }
    const seen = beats(world, CFG.undertowUnseatBeats);
    expect(seen.has("undertowClosed")).toBe(true);
    expect(seen.has("undertowLobe")).toBe(false);
    const u = floor(world);
    expect(undertowUnseated(u, world.beat)).toBe(false);
    expect(undertowLobeAt(u, col)).toBeNull();
    expect(u.breaches).toHaveLength(0);
    expect(world.scars).toHaveLength(scarsBefore);
  });

  it("swallows the body when the maw is held under the last lobe, and the boss is beaten", () => {
    const world = open();
    takeAll(world, "last");
    const mid = undertowLastCol(CFG);
    expect(floor(world).breaches[0]?.col).toBe(mid);
    untilLobe(world);
    const u = floor(world);
    for (let i = 0; i < (CFG.undertowHoldBeats + 2) * TPB && u.phase === "last"; i++)
      maw(world, mid);
    expect(u.phase).toBe("taken");
    expect(world.events.some((e) => e.type === "undertowSwallowed")).toBe(true);
    expect(failHolds(world)).toBe(false);
    expect(world.boss).not.toBeNull();
    beats(world, CFG.undertowDownBeats + 1);
    expect(world.boss).toBeNull();
  });

  it("breaks the hull when the last lobe is not held, which is the wave", () => {
    const world = open();
    takeAll(world, "last");
    untilLobe(world);
    const seen = beats(world, CFG.undertowLastBeats + 1);
    expect(seen.has("undertowThrough")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    expect(world.scars.some((s) => s.col === undertowLastCol(CFG))).toBe(true);
  });

  it("holds the wave open while it stands, with nothing else on the field", () => {
    const world = open();
    beats(world, 12);
    expect(world.boss).not.toBeNull();
    expect(world.events.some((e) => e.type === "needWave")).toBe(false);
  });

  it("fingerprints the same run the same way twice", () => {
    const run = (): number => {
      const world = open(11);
      const col = untilLobe(world);
      maw(world, col);
      beats(world, 3);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
