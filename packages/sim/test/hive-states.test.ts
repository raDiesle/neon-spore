import { describe, expect, it } from "bun:test";
import {
  type HiveState,
  hiveBoss,
  hiveNext,
  hiveNextBeat,
  hiveOpenCount,
  hiveSealedCount,
  hiveSwelling,
} from "../src/hive.js";
import { hiveHeard } from "../src/hive-hand.js";
import { hiveClenched, hiveSwellingAt, hiveWrungAt, NO_PINCH } from "../src/hive-lobe.js";
import { hiveStruck } from "../src/hive-shot.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { otherColor } from "../src/kinds.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * **THE HIVE's own two states, and the two thumbs that answer them** — the
 * half of this boss that is not the breach clock next door in `hive.test.ts`.
 *
 * What these pin is the pair of departures the states are built on. That the
 * underside **clenches** on every `hiveClenchEvery`-th scar and, while it is
 * up, spills nothing and can be sealed by nothing — but goes on **opening**,
 * because the opening clock is the one thing in this fight nobody may slow
 * (`config-hive.ts`). That a clench let go of by itself hands the pair every
 * held-back spill at once, and a clench **hauled** down by the pilot does
 * not. That the navigator's thumb **held** on a swelling lobe opens it
 * **wrung** — colourless, sealed by either colour — at a wrong bolt's price,
 * and that neither gesture can be made from the other's seat.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "hive" });
  return world;
}

function body(world: World): HiveState {
  const s = hiveBoss(world);
  if (s === null) throw new Error("no hive installed");
  return s;
}

/** Run `n` beats with nothing on the wire, warding every spill so none reaches the hull. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
    world.creatures.length = 0;
  }
  return seen;
}

/** A shot that has just left through the top of `col`. */
function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** Seal the `n`th-from-first unsealed site by hand, the way a bolt out of the top does. */
function seal(world: World): void {
  const s = body(world);
  for (let i = 0; i < s.opened; i++) {
    if (s.sealed[i] === true) continue;
    hiveStruck(world, shot(world, s.cols[i] ?? 0, s.colors[i] ?? "red"));
    return;
  }
  throw new Error("nothing open to seal");
}

/** Run until `n` sites have opened. */
function untilOpened(world: World, n: number): void {
  for (let i = 0; i < 200 && body(world).opened < n; i++) beats(world, 1);
  if (body(world).opened < n) throw new Error("never opened");
}

/**
 * Open sites and seal them until the underside clenches — two open for every
 * one sealed, so the clench arrives with breaches still spilling under it,
 * which is the state worth asking anything about.
 */
function untilClenched(world: World): void {
  for (let i = 0; i < 200 && !hiveClenched(body(world)); i++) {
    untilOpened(world, body(world).opened + 2);
    // Seal late in the cycle, while the next lobe is already swelling, so
    // the clench a scar triggers is a clench with an opening due inside it —
    // the clock running on through one is the thing worth looking at.
    for (let n = 0; n < 40 && hiveNext(body(world)) >= 0; n++) {
      if (hiveSwelling(body(world), CFG, world.beat)) break;
      beats(world, 1);
    }
    seal(world);
  }
  if (!hiveClenched(body(world))) throw new Error("never clenched");
}

/** One thumb on the underside, as the wire delivers it. */
function thumb(
  world: World,
  player: 1 | 2,
  fields: { on?: boolean; fromYMilli?: number; id?: number },
): void {
  hiveHeard(world, player, {
    kind: "drag",
    target: "hiveLobe",
    on: fields.on ?? true,
    fromMilli: 0,
    fromYMilli: fields.fromYMilli ?? 0,
    id: fields.id,
  });
}

describe("the clench", () => {
  it("draws up on every hiveClenchEvery-th scar, and not on the ones between", () => {
    const world = open();
    untilOpened(world, 1);
    seal(world);
    expect(body(world).sealed.filter(Boolean)).toHaveLength(1);
    expect(hiveClenched(body(world))).toBe(1 % CFG.hiveClenchEvery === 0);
    untilClenched(world);
    const s = body(world);
    expect(s.sealed.filter(Boolean).length % CFG.hiveClenchEvery).toBe(0);
    expect(s.phase).toBe("clench");
    expect(world.events.some((e) => e.type === "hiveClench")).toBe(true);
  });

  it("spills nothing and seals nothing while it is up, and goes on opening anyway", () => {
    const world = open();
    untilClenched(world);
    const s = body(world);
    const openedAt = s.opened;
    const sealedAt = hiveSealedCount(s);
    expect(hiveOpenCount(s)).toBeGreaterThan(0);
    const seen = beats(world, CFG.hiveClenchBeats - 1);
    expect(seen.has("hiveSpill")).toBe(false);
    // A bolt out of the top of an open breach's own column, in its own
    // colour, and it is skin: the breach is not where a bolt can reach.
    hiveStruck(world, shot(world, s.cols[0] ?? 0, s.colors[0] ?? "red"));
    expect(world.events.some((e) => e.type === "hiveSkin")).toBe(true);
    expect(hiveSealedCount(s)).toBe(sealedAt);
    // And the clock it does not slow: the openings arrived on time, so the
    // pair come out of a clench waited out with more breaches than they
    // went into it with.
    expect(s.opened).toBeGreaterThan(openedAt);
  });

  it("hands back every held spill at once on the beat it runs out", () => {
    const world = open();
    untilClenched(world);
    const s = body(world);
    const until = s.phaseBeat + CFG.hiveClenchBeats;
    for (let i = 0; i < 200 && world.beat < until - 1; i++) beats(world, 1);
    expect(hiveClenched(s)).toBe(true);
    // The beat it relaxes is a spill beat, and every open breach takes it —
    // the breaches that opened behind the clench included.
    const openNow = hiveOpenCount(s);
    const spilled = new Set<number>();
    for (let i = 0; i < TPB; i++) {
      step(world, []);
      for (const e of world.events) if (e.type === "hiveSpill") spilled.add(e.col);
      world.creatures.length = 0;
    }
    expect(hiveClenched(s)).toBe(false);
    expect(spilled.size).toBe(openNow);
  });
});

describe("the pilot's haul", () => {
  it("relaxes the clench early, and with no backlog behind it", () => {
    const world = open();
    untilClenched(world);
    const s = body(world);
    thumb(world, 1, { fromYMilli: CFG.hiveHaulMilli });
    expect(hiveClenched(s)).toBe(false);
    expect(world.events.some((e) => e.type === "hiveHaul")).toBe(true);
    // Nothing is owed: the next spill is a full cadence off, not this beat.
    expect(world.beat - s.spillBeat).toBeLessThan(CFG.hiveSpillBeats);
  });

  it("takes the whole carry, and neither half of it from the wrong seat", () => {
    const world = open();
    untilClenched(world);
    const s = body(world);
    thumb(world, 1, { fromYMilli: CFG.hiveHaulMilli - 1 });
    expect(hiveClenched(s)).toBe(true);
    // Hers is dropped without a sound, as `wellSeam` drops his.
    thumb(world, 2, { fromYMilli: CFG.hiveHaulMilli });
    expect(hiveClenched(s)).toBe(true);
    expect(world.events.some((e) => e.type === "hiveHaul")).toBe(false);
    // And a thumb that wobbles back up keeps what it hauled.
    thumb(world, 1, { fromYMilli: 0 });
    expect(s.haulMilli).toBe(CFG.hiveHaulMilli - 1);
    thumb(world, 1, { fromYMilli: CFG.hiveHaulMilli });
    expect(hiveClenched(s)).toBe(false);
  });
});

describe("the navigator's wring", () => {
  /** Run to the first beat the next site is swelling, and say which it is. */
  function untilSwelling(world: World): number {
    for (let i = 0; i < 200 && !hiveSwelling(body(world), CFG, world.beat); i++) beats(world, 1);
    const i = hiveNext(body(world));
    if (i < 0) throw new Error("nothing left to swell");
    return i;
  }

  it("opens the lobe colourless, at a wrong bolt's price, and either colour seals it", () => {
    const world = open();
    untilOpened(world, 1);
    const i = untilSwelling(world);
    const s = body(world);
    expect(hiveSwellingAt(s, CFG, world.beat, i)).toBe(true);
    thumb(world, 2, { id: i });
    expect(s.pinch).toBe(i);
    for (let n = 0; n < 200 && s.opened <= i; n++) beats(world, 1);
    expect(hiveWrungAt(s, i)).toBe(true);
    expect(world.events.some((e) => e.type === "hiveWrung")).toBe(true);
    // The colour it did not open with seals it all the same.
    hiveStruck(world, shot(world, s.cols[i] ?? 0, otherColor(s.colors[i] ?? "red")));
    expect(s.sealed[i]).toBe(true);
  });

  /**
   * The price, made visible by refreshing the spill cadence on the beat
   * before the opening: an opening that far inside a cadence spills nothing
   * on the beat it happens, and the same opening wrung spills on it — which
   * is `hiveProvokeBeats` off the next spill, exactly as a wrong bolt is.
   */
  it("costs what a wrong colour costs: every open breach spills sooner", () => {
    const spillsOnOpening = (wring: boolean): number => {
      const world = open(5);
      untilOpened(world, 2);
      const i = untilSwelling(world);
      const s = body(world);
      if (wring) thumb(world, 2, { id: i });
      for (let n = 0; n < 200 && world.beat < hiveNextBeat(s, CFG) - 1; n++) beats(world, 1);
      s.spillBeat = world.beat;
      const seen: number[] = [];
      for (let t = 0; t < TPB; t++) {
        step(world, []);
        for (const e of world.events) if (e.type === "hiveSpill") seen.push(e.col);
        world.creatures.length = 0;
      }
      expect(s.opened).toBeGreaterThan(i);
      return seen.length;
    };
    expect(spillsOnOpening(false)).toBe(0);
    expect(spillsOnOpening(true)).toBeGreaterThan(0);
  });

  it("is hers alone, is let go of at the opening, and is nothing on a lobe that is not swelling", () => {
    const world = open();
    untilOpened(world, 1);
    const i = untilSwelling(world);
    const s = body(world);
    // His press on a lobe he is not shown does nothing at all.
    thumb(world, 1, { id: i });
    expect(s.pinch).toBe(NO_PINCH);
    // Nor does hers on a site that is not the one hanging low.
    thumb(world, 2, { id: i + 3 });
    expect(s.pinch).toBe(NO_PINCH);
    thumb(world, 2, { id: i });
    const at = s.pinchBeat;
    // A move inside the hold does not re-anchor the clock.
    beats(world, 1);
    thumb(world, 2, { id: i });
    expect(s.pinchBeat).toBe(at);
    for (let n = 0; n < 200 && s.opened <= i; n++) beats(world, 1);
    expect(s.pinch).toBe(NO_PINCH);
  });

  it("cannot be made at all while the mass is clenched", () => {
    const world = open();
    untilClenched(world);
    const s = body(world);
    for (let n = 0; n < 200 && !hiveSwelling(s, CFG, world.beat); n++) beats(world, 1);
    const i = hiveNext(s);
    expect(hiveClenched(s)).toBe(true);
    expect(hiveSwellingAt(s, CFG, world.beat, i)).toBe(false);
    thumb(world, 2, { id: i });
    expect(s.pinch).toBe(NO_PINCH);
  });
});
