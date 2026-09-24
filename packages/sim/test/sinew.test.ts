import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  midCol,
  type SimConfig,
  type SinewState,
  sinewBandMilli,
  sinewBoss,
  sinewHeld,
  sinewMassLeft,
  sinewMassRow,
  sinewSum,
  sinewZone,
  sinewZoneWidth,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SINEW: the one boss answered in a number, and the two of you add up
 * to it.
 *
 * What these pin is everything the design says and a phone cannot show. That
 * the tendon hangs dead centre with every fibre whole and sends nothing;
 * that each seat has one handle and only its own; that a pull is its depth
 * and never its height, cut to the reach; that the two pulls **add** into
 * one sum on the band and the slack comes off it; that the sum held inside
 * the zone for `sinewHoldBeats` parts a fibre, drops the mass a row, rolls
 * the zone again narrower and opens THE SLOW; that leaving the zone starts
 * the hold over; that the sum over the zone's top snaps the tendon back —
 * hands off, a rock out of the mass, nothing takes hold for two beats; that
 * from the fourth fibre the tendon goes slack under a hand and only both
 * letting go resets it, and not on the last fibre; that the last fibre's
 * zone is the step under the band's top; that the last fibre drops the mass
 * and both hands pulling one way walk it a column a beat; and that it lands
 * at the wall `sinewClearCols` out and on the hull otherwise.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);
const BAND = sinewBandMilli(CFG);

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "sinew" });
  return world;
}

function sinew(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the wave installed no sinew");
  return s;
}

const rocks = (world: World) => world.creatures.filter((c) => c.kind === "meteor");

/** One hand on its handle, `depth` down and `sway` across, in thousandths. */
const pull = (tick: number, player: 1 | 2, depth: number, sway = 0): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "sinewLeft" : "sinewRight",
    on: true,
    fromMilli: sway,
    fromYMilli: depth,
  },
});

const letGo = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "sinewLeft" : "sinewRight",
    on: false,
    fromMilli: 0,
  },
});

/** Both hands held from `at` to `until` at the depths and sways given. */
function hold(
  at: number,
  until: number,
  depth1: number,
  depth2: number,
  sway1 = 0,
  sway2 = 0,
): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = at; t < until; t++) out.push(pull(t, 1, depth1, sway1), pull(t, 2, depth2, sway2));
  return out;
}

/** Step to a tick, feeding commands on the tick they are stamped for, and
 * say which event types went by — `world.events` is one tick's worth. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

/** A depth per hand that adds up to the middle of the zone. */
function inZone(s: SinewState): number {
  const z = sinewZone(s, CFG);
  return Math.floor((z.low + z.high) / 4) + Math.floor(s.slackMilli / 2);
}

/**
 * Both hands held in the middle of the zone until `until`, re-read every
 * tick — which is the pair following the slack as it creeps, the way the
 * decayed fibres ask them to. Says which event types went by.
 */
function runHolding(world: World, s: SinewState, until: number): Set<string> {
  const seen = new Set<string>();
  while (world.tick < until) {
    const d = inZone(s);
    step(world, [pull(world.tick, 1, d), pull(world.tick, 2, d)]);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Hold both hands in the zone through the hold, from the next beat. */
function holdToPart(world: World, s: SinewState): Set<string> {
  runTo(world, world.tick + 1);
  return runHolding(world, s, world.tick + TPB * (CFG.sinewHoldBeats + 2));
}

describe("THE SINEW hangs", () => {
  it("dead centre with every fibre whole, a zone on the band, and sends nothing", () => {
    const world = install();
    const s = sinew(world);
    expect(s.massCol).toBe(midCol(CFG));
    expect(s.fibres).toBe(CFG.sinewFibres);
    expect(sinewHeld(s, 1)).toBe(false);
    expect(sinewHeld(s, 2)).toBe(false);
    expect(sinewSum(s)).toBe(0);
    const z = sinewZone(s, CFG);
    expect(z.low).toBeGreaterThanOrEqual(CFG.sinewZoneLowMilli);
    expect(z.high).toBeLessThanOrEqual(BAND);
    expect(sinewZoneWidth(s, CFG)).toBe(CFG.sinewZoneMilli);
    expect(sinewMassRow(s, CFG, world.beat)).toBe(CFG.sinewMassRow);
    expect(world.events.some((e) => e.type === "sinewSettle")).toBe(true);
    expect(world.creatures).toEqual([]);
    runTo(world, TPB * 8);
    expect(world.creatures).toEqual([]);
  });

  it("rolls the zone somewhere else on another seed", () => {
    const lows = new Set<number>();
    for (let seed = 0; seed < 12; seed++) lows.add(sinew(install(seed)).zoneLowMilli);
    expect(lows.size).toBeGreaterThan(1);
  });
});

describe("the two hands", () => {
  it("are one handle per seat, and only its own", () => {
    const world = install();
    const s = sinew(world);
    const wrong: TimedCommand = { ...pull(1, 1, 500), player: 2 };
    runTo(world, 3, [wrong, pull(2, 2, 300)]);
    expect(sinewHeld(s, 1)).toBe(false);
    expect(s.pullP2Milli).toBe(300);
  });

  it("report a depth, never a height, cut to the reach", () => {
    const world = install();
    const s = sinew(world);
    const seen = runTo(world, 4, [pull(1, 1, -400), pull(2, 1, 5000), pull(3, 2, 250, -9000)]);
    expect(seen.has("sinewGrip")).toBe(true);
    expect(s.pullP2Milli).toBe(250);
    expect(s.swayP2Milli).toBe(-CFG.sinewReachMilli);
    expect(s.pullP1Milli).toBe(CFG.sinewReachMilli);
    runTo(world, 2, []);
    const early = install();
    runTo(early, 2, [pull(1, 1, -400)]);
    expect(sinew(early).pullP1Milli).toBe(0);
    expect(sinewHeld(sinew(early), 1)).toBe(true);
  });

  it("add into one sum, with the slack taken off", () => {
    const world = install();
    const s = sinew(world);
    runTo(world, 3, [pull(1, 1, 400), pull(2, 2, 350)]);
    expect(sinewSum(s)).toBe(750);
    s.slackMilli = 100;
    expect(sinewSum(s)).toBe(650);
    const seen = runTo(world, 5, [letGo(3, 1), letGo(4, 2)]);
    expect(seen.has("sinewRelease")).toBe(true);
    expect(sinewSum(s)).toBe(0);
    expect(s.slackMilli).toBe(0);
  });
});

describe("the hold", () => {
  it("parts a fibre after the hold, drops the mass a row, narrows the zone and slows", () => {
    const world = install();
    const s = sinew(world);
    const d = inZone(s);
    const from = TPB + 1;
    const seen = runTo(world, from + TPB * (CFG.sinewHoldBeats + 2), hold(from, TPB * 20, d, d));
    expect(seen.has("sinewEnter")).toBe(true);
    expect(seen.has("sinewPart")).toBe(true);
    expect(seen.has("sinewSnap")).toBe(false);
    expect(s.fibres).toBe(CFG.sinewFibres - 1);
    expect(sinewMassRow(s, CFG, world.beat)).toBe(CFG.sinewMassRow + 1);
    expect(sinewZoneWidth(s, CFG)).toBe(CFG.sinewZoneMilli - CFG.sinewZoneNarrowMilli);
    expect(world.slowToBeat).toBeGreaterThan(world.slowFromBeat);
  });

  it("starts over when the sum leaves the zone", () => {
    const world = install();
    const s = sinew(world);
    const d = inZone(s);
    const two = TPB * 2;
    const seen = runTo(world, 1 + two, hold(1, 1 + two, d, d));
    expect(seen.has("sinewEnter")).toBe(true);
    expect(s.holdBeat).toBeGreaterThanOrEqual(0);
    const loose = runTo(world, 1 + two + TPB, hold(1 + two, 1 + two + TPB, 0, 0));
    expect(loose.has("sinewLoose")).toBe(true);
    expect(s.holdBeat).toBe(-1);
    const again = runTo(world, 1 + two * 2 + TPB, hold(1 + two + TPB, TPB * 20, d, d));
    expect(again.has("sinewPart")).toBe(false);
    expect(s.fibres).toBe(CFG.sinewFibres);
  });
});

describe("the snap-back", () => {
  it("throws both hands off, sheds a rock from the mass, and takes nothing for two beats", () => {
    const world = install();
    const s = sinew(world);
    const reach = CFG.sinewReachMilli;
    const seen = runTo(world, TPB + 2, hold(1, TPB + 2, reach, reach));
    expect(seen.has("sinewSnap")).toBe(true);
    expect(seen.has("sinewRelease")).toBe(true);
    expect(seen.has("sinewRock")).toBe(true);
    // Thrown off: a finger still on the glass is a grip again on the next tick,
    // but the pull it carries is nought for as long as the whip lasts.
    expect(s.pullP1Milli).toBe(0);
    expect(s.pullP2Milli).toBe(0);
    expect(s.fibres).toBe(CFG.sinewFibres);
    const fallen = rocks(world);
    expect(fallen.length).toBe(CFG.sinewSnapRocks);
    const left = sinewMassLeft(s, CFG);
    for (const r of fallen) {
      expect(r.col).toBeGreaterThanOrEqual(left);
      expect(r.col).toBeLessThan(left + CFG.sinewMassCols);
      expect(r.fromRow).toBe(CFG.sinewMassRow);
    }
    // Swinging: a hand takes hold again, but it is hauling on nothing.
    runTo(world, world.tick + 2, [pull(world.tick, 1, 300), pull(world.tick + 1, 2, 300)]);
    expect(sinewHeld(s, 1)).toBe(true);
    expect(s.pullP1Milli).toBe(0);
    // And after the swing, it is a hand again.
    const at = world.tick + TPB * CFG.sinewSnapBeats;
    runTo(world, at + 1, [pull(at, 1, 300)]);
    expect(s.pullP1Milli).toBe(300);
  });
});

describe("the catch", () => {
  /** Snap the tendon, and stop on the first tick of the swing. */
  function snapped(world: World): SinewState {
    const s = sinew(world);
    const reach = CFG.sinewReachMilli;
    runTo(world, TPB + 2, hold(1, TPB + 2, reach, reach));
    return s;
  }

  /** Both hands carried outward, `apart` each, for a beat. */
  const carry = (world: World, apart: number): Set<string> =>
    runTo(world, world.tick + TPB, hold(world.tick, world.tick + TPB, 0, 0, -apart, apart));

  it("ends the swing early when both hands are carried apart", () => {
    const world = install();
    const s = snapped(world);
    const seen = carry(world, CFG.sinewCatchMilli);
    expect(seen.has("sinewCatch")).toBe(true);
    expect(s.catchBeat).toBeGreaterThanOrEqual(0);
    expect(s.snapBeat).toBe(-1);
    // The swing is over on the beat it was caught on, so a pull takes again.
    const at = world.tick;
    runTo(world, at + 2, [pull(at, 1, 300)]);
    expect(s.pullP1Milli).toBe(300);
  });

  it("wants both hands, outward, and far enough", () => {
    for (const [s1, s2] of [
      [-CFG.sinewCatchMilli, 0],
      [CFG.sinewCatchMilli, -CFG.sinewCatchMilli],
      [-(CFG.sinewCatchMilli - 1), CFG.sinewCatchMilli - 1],
    ] as const) {
      const world = install();
      const s = snapped(world);
      const at = world.tick;
      const seen = runTo(world, at + TPB, hold(at, at + TPB, 0, 0, s1, s2));
      expect(seen.has("sinewCatch")).toBe(false);
      expect(s.catchBeat).toBe(-1);
      expect(s.snapBeat).toBeGreaterThanOrEqual(0);
    }
  });

  it("is spent by the next snap, so the two clocks are never both reading", () => {
    const world = install();
    const s = snapped(world);
    carry(world, CFG.sinewCatchMilli);
    expect(s.catchBeat).toBeGreaterThanOrEqual(0);
    const reach = CFG.sinewReachMilli;
    const at = world.tick;
    const seen = runTo(world, at + TPB + 2, hold(at, at + TPB + 2, reach, reach));
    expect(seen.has("sinewSnap")).toBe(true);
    expect(s.catchBeat).toBe(-1);
    expect(s.snapBeat).toBeGreaterThanOrEqual(0);
  });
});

describe("the slack", () => {
  it("creeps under a hand from the fourth fibre, and only both letting go resets it", () => {
    const world = install();
    const s = sinew(world);
    s.fibres = CFG.sinewFibres - CFG.sinewDecayFibres;
    const from = TPB + 1;
    const seen = runTo(world, from + TPB * 3, hold(from, from + TPB * 3, 100, 0));
    expect(seen.has("sinewSlack")).toBe(true);
    expect(s.slackMilli).toBeGreaterThanOrEqual(CFG.sinewDecayMilli * 2);
    // One hand off — the other is still on, at nought — keeps the slack.
    runTo(world, world.tick + 2, [letGo(world.tick, 1)]);
    expect(s.slackMilli).toBeGreaterThan(0);
    runTo(world, world.tick + 2, [letGo(world.tick, 2)]);
    expect(s.slackMilli).toBe(0);
  });

  it("does not creep before the fourth fibre, nor on the last", () => {
    for (const fibres of [CFG.sinewFibres - CFG.sinewDecayFibres + 1, 1]) {
      const world = install();
      const s = sinew(world);
      s.fibres = fibres;
      const from = TPB + 1;
      const seen = runTo(world, from + TPB * 3, hold(from, from + TPB * 3, 100, 0));
      expect(seen.has("sinewSlack")).toBe(false);
      expect(s.slackMilli).toBe(0);
    }
  });
});

describe("the last fibre", () => {
  it("has its zone the step under the top of the band", () => {
    const world = install();
    const s = sinew(world);
    s.fibres = 2;
    holdToPart(world, s);
    expect(s.fibres).toBe(1);
    const z = sinewZone(s, CFG);
    expect(z.high).toBe(BAND - CFG.sinewZoneNarrowMilli);
    expect(sinewZoneWidth(s, CFG)).toBe(CFG.sinewZoneNarrowMilli);
  });

  it("snaps three rocks when over-pulled, from four rows over the hull", () => {
    const world = install();
    const s = sinew(world);
    s.fibres = 1;
    const reach = CFG.sinewReachMilli;
    const seen = runTo(world, TPB + 2, hold(1, TPB + 2, reach, reach));
    expect(seen.has("sinewSnap")).toBe(true);
    expect(rocks(world).length).toBe(CFG.sinewSnapRocksLast);
    expect(rocks(world)[0]?.fromRow).toBe(hullRow(CFG) - 4);
  });

  it("parted, drops the mass, and the hands stay on", () => {
    const world = install();
    const s = sinew(world);
    s.fibres = 2;
    holdToPart(world, s);
    expect(s.fibres).toBe(1);
    const seen = holdToPart(world, s);
    expect(seen.has("sinewFall")).toBe(true);
    expect(s.fibres).toBe(0);
    expect(s.fallBeat).toBeGreaterThanOrEqual(0);
    expect(sinewHeld(s, 1)).toBe(true);
    expect(world.boss).not.toBeNull();
  });
});

/** The mass already falling, from the beat it let go. */
function falling(seed = 0): { world: World; s: SinewState } {
  const world = install(seed);
  const s = sinew(world);
  s.fibres = 1;
  runTo(world, TPB);
  // Tick by tick to the very tick it lets go, so the fall's beats are whole.
  const until = world.tick + TPB * (CFG.sinewHoldBeats + 3);
  while (s.fallBeat < 0 && world.tick < until) runHolding(world, s, world.tick + 1);
  if (s.fallBeat < 0) throw new Error("the last fibre did not part");
  return { world, s };
}

describe("the fall", () => {
  it("walks a column a beat while both hands pull one way, and not opposite ways", () => {
    const { world, s } = falling();
    const from = world.tick;
    const sway = CFG.sinewSwayMilli;
    const one = runTo(world, from + TPB, hold(from, from + TPB, 500, 500, sway, -sway));
    expect(one.has("sinewSwing")).toBe(false);
    expect(s.massCol).toBe(midCol(CFG));
    const two = runTo(
      world,
      from + TPB * 2,
      hold(from + TPB, from + TPB * 2, 500, 500, -sway, -sway),
    );
    expect(two.has("sinewSwing")).toBe(true);
    expect(s.massCol).toBe(midCol(CFG) - 1);
  });

  it("lands at the wall walked clear, and the wave ends after", () => {
    const { world, s } = falling();
    const from = world.tick;
    const sway = CFG.sinewSwayMilli;
    const until = from + TPB * (CFG.sinewFallBeats + 1);
    const seen = runTo(world, until, hold(from, until, 500, 500, sway, sway));
    expect(seen.has("sinewOut")).toBe(true);
    expect(seen.has("sinewCrush")).toBe(false);
    expect(seen.has("breach")).toBe(false);
    expect(s.massCol - midCol(CFG)).toBeGreaterThanOrEqual(CFG.sinewClearCols);
    expect(s.outBeat).toBeGreaterThanOrEqual(0);
    expect(world.boss).not.toBeNull();
    runTo(world, world.tick + TPB * (CFG.sinewOutBeats + 1));
    expect(world.boss).toBeNull();
    const rest = runTo(world, world.tick + TPB * (CFG.waveRestBeats + 2));
    expect(rest.has("needWave")).toBe(true);
  });

  it("lands on the hull if it was not walked clear", () => {
    const { world, s } = falling();
    const from = world.tick;
    const until = from + TPB * (CFG.sinewFallBeats + 1);
    const seen = runTo(world, until, hold(from, until, 500, 500));
    expect(seen.has("sinewCrush")).toBe(true);
    expect(seen.has("breach")).toBe(true);
    expect(s.massCol).toBe(midCol(CFG));
    expect(sinewMassRow(s, CFG, world.beat)).toBe(hullRow(CFG));
  });
});

describe("two devices playing it", () => {
  it("fingerprints the same twice over the same inputs", () => {
    const run = (seed: number): number => {
      const world = install(seed);
      const s = sinew(world);
      const d = inZone(s);
      const cmds = [
        ...hold(2, TPB * 7, d, d),
        ...hold(TPB * 7, TPB * 9, CFG.sinewReachMilli, CFG.sinewReachMilli),
        ...hold(TPB * 12, TPB * 20, d, d + 40, 200, -300),
      ];
      runTo(world, TPB * 22, cmds);
      return hashWorld(world);
    };
    expect(run(3)).toBe(run(3));
    expect(run(7)).toBe(run(7));
    expect(run(3)).not.toBe(run(7));
  });
});
