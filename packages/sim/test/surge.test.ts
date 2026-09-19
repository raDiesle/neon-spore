import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  midCol,
  NO_SHELL,
  type SimConfig,
  type SurgeState,
  startWave,
  step,
  surgeBand,
  surgeBoss,
  surgeBulbLeft,
  surgeBulbRow,
  surgeBulbSpan,
  surgeHeld,
  surgeInBand,
  surgeNotchMilli,
  surgeWarding,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SURGE: the one boss answered by letting go, and both of you at once.
 *
 * What these pin is everything the design says and a phone cannot show.
 * That the bulb hangs dead centre with its seam shut and sends nothing;
 * that a thumb from either seat charges it a step a beat and two thumbs
 * two; that it leaks with no thumb on it; that the pressure coming into a
 * notch's band opens THE SLOW; that both thumbs off inside the band, the
 * second inside a beat of the first, **vents** — a notch open, the pressure
 * spent, the bulb a row lower, the next notch higher on the gauge; that a
 * second lift a beat late, or one thumb alone, is the charge **lost**; that
 * a lift over the band, or the pressure reaching the top of the gauge on
 * the beat, **bursts** — thumbs thrown off, gums thrown down its columns,
 * nothing taking hold for two beats, and from the third notch a notch
 * closed; that from its first notch it spits a rock at the ship every
 * `surgeRockBeats` beats it has both thumbs on it, which only the shield
 * answers, so the pair has to let go on purpose to ward it; that from the
 * second notch it holds its charge and eats what
 * reaches it; that from the third a thumb charges it at double; that the
 * last notch's band ends one under the burst; and that the last vent
 * everts it and the wave ends after.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "surge" });
  return world;
}

function surge(world: World): SurgeState {
  const s = surgeBoss(world);
  if (s === null) throw new Error("the wave installed no surge");
  return s;
}

const gums = (world: World) => world.creatures.filter((c) => c.kind === "gum");
const rocks = (world: World) => world.creatures.filter((c) => c.kind === "meteor");

/** One seat's thumb on the bulb, or off it. */
const thumb = (tick: number, player: 1 | 2, on: boolean): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "surgeBulb", on, fromMilli: 0 },
});

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

/** The middle of the band round the notch being worked toward. */
function bandMiddle(s: SurgeState): number {
  const b = surgeBand(s, CFG);
  return Math.floor((b.low + b.high) / 2);
}

/** Both thumbs on, now, and one tick on. */
function grab(world: World): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [thumb(t, 1, true), thumb(t, 2, true)]);
}

/** Both thumbs off, `gap` ticks apart, the first now — and the tick after the second. */
function liftBoth(world: World, gap = 1, first: 1 | 2 = 1): Set<string> {
  const t = world.tick;
  const second = first === 1 ? 2 : 1;
  return runTo(world, t + gap + 1, [thumb(t, first, false), thumb(t + gap, second, false)]);
}

/** Both thumbs on with the pressure set to the middle of the band, one tick after a beat. */
function primed(s: SurgeState, world: World): void {
  runTo(world, world.tick + TPB - (world.tick % TPB));
  s.pressureMilli = bandMiddle(s);
  grab(world);
}

describe("THE SURGE hangs", () => {
  it("dead centre with its seam shut, no pressure, and sends nothing", () => {
    const world = install();
    const s = surge(world);
    expect(s.notches).toBe(0);
    expect(s.pressureMilli).toBe(0);
    expect(surgeHeld(s, 1)).toBe(false);
    expect(surgeHeld(s, 2)).toBe(false);
    expect(surgeBulbRow(s, CFG)).toBe(CFG.surgeBulbRow);
    expect(surgeBulbLeft(CFG) + Math.floor(surgeBulbSpan(CFG) / 2)).toBe(midCol(CFG));
    expect(world.events.some((e) => e.type === "surgeSettle")).toBe(true);
    expect(world.creatures).toEqual([]);
    runTo(world, TPB * 8);
    expect(world.creatures).toEqual([]);
    expect(s.pressureMilli).toBe(0);
  });
});

describe("the thumbs", () => {
  it("charge it a step a beat from either seat, and two steps with both on", () => {
    const world = install();
    const s = surge(world);
    const seen = runTo(world, TPB * 3 + 1, [thumb(1, 2, true)]);
    expect(seen.has("surgeGrip")).toBe(true);
    expect(surgeHeld(s, 2)).toBe(true);
    expect(s.pressureMilli).toBe(3 * CFG.surgeChargeMilli);
    runTo(world, TPB * 5 + 1, [thumb(world.tick, 1, true)]);
    expect(s.pressureMilli).toBe(3 * CFG.surgeChargeMilli + 2 * 2 * CFG.surgeChargeMilli);
  });

  it("leak the charge away when they come off, and never under nought", () => {
    const world = install();
    const s = surge(world);
    s.pressureMilli = 2 * CFG.surgeDecayMilli + 10;
    runTo(world, TPB + 1);
    expect(s.pressureMilli).toBe(CFG.surgeDecayMilli + 10);
    runTo(world, TPB * 4 + 1);
    expect(s.pressureMilli).toBe(0);
  });
});

describe("the band", () => {
  it("sits round the first notch, and the pressure coming into it opens THE SLOW", () => {
    const world = install();
    const s = surge(world);
    const b = surgeBand(s, CFG);
    expect(surgeNotchMilli(s, CFG)).toBe(CFG.surgeNotchMilli);
    expect(b.low).toBe(CFG.surgeNotchMilli - CFG.surgeWindowMilli);
    expect(b.high).toBe(CFG.surgeNotchMilli + CFG.surgeWindowMilli);
    grab(world);
    let seen = new Set<string>();
    while (!surgeInBand(s, CFG)) seen = new Set([...seen, ...runTo(world, world.tick + 1)]);
    expect(seen.has("surgeNear")).toBe(true);
    expect(s.nearBeat).toBeGreaterThanOrEqual(0);
    expect(world.slowToBeat).toBeGreaterThan(world.slowFromBeat);
  });

  it("is never stepped clean over at any rate the bulb charges at", () => {
    const world = install();
    const s = surge(world);
    for (let k = 0; k < CFG.surgeNotches; k++) {
      s.notches = k;
      const b = surgeBand(s, CFG);
      const step2 = 2 * (k >= CFG.surgeDoubleNotches ? 2 : 1) * CFG.surgeChargeMilli;
      expect(b.high - b.low + 1).toBeGreaterThan(step2);
    }
  });
});

describe("the vent", () => {
  it("opens a notch when both thumbs come off inside the band within a beat of each other", () => {
    const world = install();
    const s = surge(world);
    primed(s, world);
    const row = surgeBulbRow(s, CFG);
    const was = surgeNotchMilli(s, CFG);
    const seen = liftBoth(world, TPB);
    expect(seen.has("surgeVent")).toBe(true);
    expect(seen.has("surgeRelease")).toBe(true);
    expect(s.notches).toBe(1);
    expect(s.pressureMilli).toBe(0);
    expect(surgeBulbRow(s, CFG)).toBe(row + 1);
    expect(surgeNotchMilli(s, CFG)).toBe(was + CFG.surgeNotchStepMilli);
  });

  it("is the pair's whichever seat lets go first", () => {
    const world = install();
    const s = surge(world);
    primed(s, world);
    expect(liftBoth(world, 2, 2).has("surgeVent")).toBe(true);
    expect(s.notches).toBe(1);
  });

  it("is lost when the second lift is a beat late, or one thumb was alone", () => {
    const world = install();
    const s = surge(world);
    primed(s, world);
    const seen = liftBoth(world, TPB + 1);
    expect(seen.has("surgeLost")).toBe(true);
    expect(seen.has("surgeVent")).toBe(false);
    expect(s.notches).toBe(0);
    expect(s.pressureMilli).toBe(0);
    // One thumb, on and off, with the pressure right: not a release at all.
    s.pressureMilli = bandMiddle(s);
    const t = world.tick;
    const alone = runTo(world, t + 3, [thumb(t, 1, true), thumb(t + 1, 1, false)]);
    expect(alone.has("surgeLost")).toBe(true);
    expect(s.pressureMilli).toBe(0);
  });

  it("is lost short of the band, and the charge with it", () => {
    const world = install();
    const s = surge(world);
    grab(world);
    runTo(world, TPB + 1);
    expect(s.pressureMilli).toBeLessThan(surgeBand(s, CFG).low);
    const seen = liftBoth(world);
    expect(seen.has("surgeLost")).toBe(true);
    expect(s.pressureMilli).toBe(0);
  });

  it("counts a thumb that went back on as the pair holding again", () => {
    const world = install();
    const s = surge(world);
    primed(s, world);
    const t = world.tick;
    // Player 1 off, then on again; player 2 off, then player 1 off inside a
    // beat: the last two are the mutual lift, not the first.
    const seen = runTo(world, t + 5, [
      thumb(t, 1, false),
      thumb(t + 1, 1, true),
      thumb(t + 2, 2, false),
      thumb(t + 3, 1, false),
    ]);
    expect(seen.has("surgeVent")).toBe(true);
    expect(s.notches).toBe(1);
  });
});

describe("the burst", () => {
  it("throws both thumbs off and gums down its columns on a lift over the band", () => {
    const world = install();
    const s = surge(world);
    primed(s, world);
    s.pressureMilli = surgeBand(s, CFG).high + 1;
    const row = surgeBulbRow(s, CFG);
    const seen = liftBoth(world);
    expect(seen.has("surgeBurst")).toBe(true);
    expect(seen.has("surgeGum")).toBe(true);
    expect(seen.has("surgeClose")).toBe(false);
    expect(s.notches).toBe(0);
    expect(s.pressureMilli).toBe(0);
    expect(surgeHeld(s, 1)).toBe(false);
    expect(surgeHeld(s, 2)).toBe(false);
    const thrown = gums(world);
    expect(thrown.length).toBe(CFG.surgeBurstGums);
    const left = surgeBulbLeft(CFG);
    for (const g of thrown) {
      expect(g.col).toBeGreaterThanOrEqual(left);
      expect(g.col).toBeLessThan(left + surgeBulbSpan(CFG));
      expect(g.fromRow).toBe(row + 1);
    }
    // Re-sealing: a thumb on the glass takes nothing.
    runTo(world, world.tick + 2, [thumb(world.tick, 1, true), thumb(world.tick + 1, 2, true)]);
    expect(surgeHeld(s, 1)).toBe(false);
    // And after, it is a thumb again.
    const at = world.tick + TPB * CFG.surgeBurstBeats;
    runTo(world, at + 1, [thumb(at, 1, true)]);
    expect(surgeHeld(s, 1)).toBe(true);
  });

  it("happens on the beat at the top of the gauge with no lift at all", () => {
    const world = install();
    const s = surge(world);
    grab(world);
    s.pressureMilli = CFG.surgeBurstMilli - 1;
    const seen = runTo(world, TPB + 1);
    expect(seen.has("surgeBurst")).toBe(true);
    expect(s.pressureMilli).toBe(0);
    expect(gums(world).length).toBe(CFG.surgeBurstGums);
  });

  it("closes a notch again from the third open", () => {
    const world = install();
    const s = surge(world);
    s.notches = CFG.surgeCloseNotches;
    primed(s, world);
    s.pressureMilli = CFG.surgeBurstMilli;
    const seen = runTo(world, world.tick + TPB);
    expect(seen.has("surgeClose")).toBe(true);
    expect(s.notches).toBe(CFG.surgeCloseNotches - 1);
  });
});

describe("once it holds", () => {
  it("keeps its charge with no thumb on it, and a lost release keeps it too", () => {
    const world = install();
    const s = surge(world);
    s.notches = CFG.surgeHoldNotches;
    s.pressureMilli = 500;
    runTo(world, TPB * 3 + 1);
    expect(s.pressureMilli).toBe(500);
    primed(s, world);
    const kept = s.pressureMilli;
    const seen = liftBoth(world, TPB + 1);
    expect(seen.has("surgeLost")).toBe(true);
    // Not spent: the beat that went by under one thumb only added to it.
    expect(s.pressureMilli).toBeGreaterThanOrEqual(kept);
  });

  it("eats what comes down to it in its columns, and not beside it", () => {
    const world = install();
    const s = surge(world);
    s.notches = CFG.surgeHoldNotches;
    const row = surgeBulbRow(s, CFG);
    const rock = (col: number, id: number) => ({
      id,
      kind: "meteor" as const,
      col,
      row: row - 1,
      fromRow: row - 2,
      color: null,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      shell: NO_SHELL,
    });
    world.creatures.push(rock(midCol(CFG), 9001), rock(surgeBulbLeft(CFG) - 1, 9002));
    const seen = runTo(world, TPB + 1);
    expect(seen.has("surgeAbsorb")).toBe(true);
    expect(world.creatures.map((c) => c.id)).toEqual([9002]);
    expect(s.pressureMilli).toBe(CFG.surgeAbsorbMilli);
  });

  it("charges at double under a thumb from the third notch", () => {
    const world = install();
    const s = surge(world);
    s.notches = CFG.surgeDoubleNotches;
    runTo(world, TPB * 2 + 1, [thumb(1, 1, true)]);
    expect(s.pressureMilli).toBe(2 * 2 * CFG.surgeChargeMilli);
  });
});

describe("the last notch", () => {
  it("has its band end one under the burst", () => {
    const world = install();
    const s = surge(world);
    s.notches = CFG.surgeNotches - 1;
    const b = surgeBand(s, CFG);
    expect(b.high).toBe(CFG.surgeBurstMilli - 1);
    expect(surgeNotchMilli(s, CFG)).toBe(CFG.surgeBurstMilli - CFG.surgeWindowMilli - 1);
    expect(surgeBulbRow(s, CFG)).toBeLessThan(hullRow(CFG));
  });

  it("vented, everts the bulb, and the wave ends after", () => {
    const world = install();
    const s = surge(world);
    s.notches = CFG.surgeNotches - 1;
    primed(s, world);
    const seen = liftBoth(world);
    expect(seen.has("surgeEvert")).toBe(true);
    expect(seen.has("surgeVent")).toBe(false);
    expect(s.notches).toBe(CFG.surgeNotches);
    expect(s.evertBeat).toBeGreaterThanOrEqual(0);
    expect(world.slowToBeat).toBeGreaterThan(world.slowFromBeat);
    // Nothing takes hold of a bulb turning inside out.
    runTo(world, world.tick + 1, [thumb(world.tick, 1, true)]);
    expect(surgeHeld(s, 1)).toBe(false);
    const out = runTo(world, world.tick + TPB * (CFG.surgeEvertBeats + 1));
    expect(out.has("surgeOut")).toBe(true);
    expect(world.boss).not.toBeNull();
    runTo(world, world.tick + TPB * (CFG.surgeOutBeats + 1));
    expect(world.boss).toBeNull();
    const rest = runTo(world, world.tick + TPB * (CFG.waveRestBeats + 2));
    expect(rest.has("needWave")).toBe(true);
  });
});

describe("two devices playing it", () => {
  it("fingerprints the same twice over the same inputs", () => {
    const run = (seed: number): number => {
      const world = install(seed);
      const cmds = [
        thumb(2, 1, true),
        thumb(3, 2, true),
        thumb(TPB * 5, 1, false),
        thumb(TPB * 5 + 3, 2, false),
        thumb(TPB * 7, 1, true),
        thumb(TPB * 7, 2, true),
        thumb(TPB * 30, 2, false),
        thumb(TPB * 31, 1, false),
      ];
      runTo(world, TPB * 34, cmds);
      return hashWorld(world);
    };
    expect(run(3)).toBe(run(3));
    expect(run(7)).toBe(run(7));
    expect(run(3)).not.toBe(run(7));
  });
});

describe("the rock", () => {
  /** Both thumbs on with one notch open, on a beat: the spit's own gate. */
  function notched(world: World, s: SurgeState): void {
    s.notches = 1;
    runTo(world, world.tick + TPB - (world.tick % TPB));
    grab(world);
  }

  it("is spat down the bulb's own columns from the row under it, with both thumbs on", () => {
    const world = install();
    const s = surge(world);
    notched(world, s);
    const row = surgeBulbRow(s, CFG);
    const seen = runTo(world, world.tick + TPB);
    expect(seen.has("surgeRock")).toBe(true);
    const thrown = rocks(world);
    expect(thrown.length).toBe(1);
    const left = surgeBulbLeft(CFG);
    expect(thrown[0]?.col).toBeGreaterThanOrEqual(left);
    expect(thrown[0]?.col).toBeLessThan(left + surgeBulbSpan(CFG));
    expect(thrown[0]?.fromRow).toBe(row + 1);
    expect(thrown[0]?.id).toBe(s.rockId);
    expect(surgeWarding(s, world)).toBe(true);
  });

  it("waits surgeRockBeats between one and the next, and counts only beats with both thumbs on", () => {
    const world = install();
    const s = surge(world);
    notched(world, s);
    runTo(world, world.tick + TPB);
    expect(rocks(world).length).toBe(1);
    const at = s.rockBeat;
    // Short of the wait: nothing more, however many beats go by held.
    runTo(world, world.tick + TPB * (CFG.surgeRockBeats - 2));
    expect(s.rockBeat).toBe(at);
    // One thumb off stops the clock as well as the charge.
    const t = world.tick;
    runTo(world, t + TPB * 4, [thumb(t, 2, false)]);
    expect(s.rockBeat).toBe(at);
    // And on again, the wait long since up, it spits at once.
    const back = world.tick;
    runTo(world, back + TPB + 1, [thumb(back, 2, true)]);
    expect(s.rockBeat).toBeGreaterThan(at);
  });

  it("stops being the bulb's the beat it leaves the field", () => {
    const world = install();
    const s = surge(world);
    notched(world, s);
    runTo(world, world.tick + TPB);
    const id = s.rockId;
    expect(id).toBeGreaterThanOrEqual(0);
    world.creatures = world.creatures.filter((c) => c.id !== id);
    runTo(world, world.tick + TPB);
    expect(surgeWarding(s, world)).toBe(false);
    expect(s.rockId).toBe(-1);
  });

  it("is not eaten by the bulb the vent sinks onto it", () => {
    const world = install();
    const s = surge(world);
    notched(world, s);
    runTo(world, world.tick + TPB);
    const id = s.rockId;
    expect(id).toBeGreaterThanOrEqual(0);
    // A vent sinks the bulb a row, onto the row its own rock left from: the
    // `fromRow` rule stops covering it there, and only the id still does.
    s.notches += 1;
    const before = s.pressureMilli;
    const seen = runTo(world, world.tick + TPB * 2);
    expect(seen.has("surgeAbsorb")).toBe(false);
    expect(s.pressureMilli).toBeGreaterThanOrEqual(before);
    expect(surgeWarding(s, world)).toBe(true);
  });

  it("does not spit before its first notch is open", () => {
    const world = install();
    const s = surge(world);
    grab(world);
    runTo(world, world.tick + TPB * (CFG.surgeRockBeats + 2));
    expect(rocks(world)).toEqual([]);
    expect(surgeWarding(s, world)).toBe(false);
  });
});
