import { describe, expect, it } from "bun:test";
import {
  briefingHolds,
  chargeDueTick,
  chargeMilli,
  chargePartTicks,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  lanceReady,
  laying,
  OPENING_INTRO,
  OPENING_PLAY,
  PAIR_ON,
  priming,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE SHOT IS LAID, NOT FIRED — the timing half of it. `shot-charge.ts` has
 * the argument; this is the part that keeps it true.
 *
 * Two things are worth more than the rest here. The grid **contains every
 * beat**, which is the whole claim ("on the three" is literally true, not
 * approximately), and it holds at the defaults only because it is measured
 * from the start of the beat — half of 75 ticks is not a whole number, so a
 * fixed period would walk off the beat inside two bars. And a charge is
 * **thrown away rather than delivered late** by everything that ends the wave
 * it belonged to, because a bolt arriving in a round nobody fired it in is the
 * one failure this mechanic can produce that the old one could not.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The game's own value: the shot leaves on the next half-beat. */
const LAID: SimConfig = { ...DEFAULT_CONFIG, shotChargeBeats: 0.5 };
const PART = chargePartTicks(LAID);
/** The column everything below is fired up. Never the cannon's starting one. */
const COL = 3;

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const shoot = (tick: number, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const prime = (tick: number, on: boolean): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "prime", on },
});

function world(cfg: SimConfig = LAID, queue?: SpawnEntry[]) {
  return createWorld({ ...cfg }, 0, queue);
}

/** An event and the tick the world reported it on — which is the whole
 * subject here, so a flat list of events would not settle anything. */
interface Seen {
  tick: number;
  event: SimEvent;
}

function play(w: ReturnType<typeof world>, untilTick: number, inputs: TimedCommand[] = []): Seen[] {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const seen: Seen[] = [];
  while (w.tick < untilTick) {
    const tick = w.tick;
    step(w, byTick.get(tick) ?? []);
    for (const event of w.events) seen.push({ tick, event });
  }
  return seen;
}

const fired = (seen: Seen[]): Seen[] => seen.filter((s) => s.event.type === "fire");

describe("the grid a shot leaves on", () => {
  it("is half a beat, and half a beat is not a whole number of ticks", () => {
    // 37.5, in fact. The rounding is why the grid cannot be a fixed period.
    expect(TPB).toBe(75);
    expect(PART).toBe(38);
    expect(chargePartTicks(CFG)).toBe(0);
  });

  it("contains every beat, from any tick in the run", () => {
    for (let t = 0; t < TPB * 4; t++) {
      const due = chargeDueTick(LAID, t);
      const beatStart = Math.floor(t / TPB) * TPB;
      // Always ahead, never further than one part, and always on a point the
      // beat itself is on: either the next beat or the part inside this one.
      expect(due).toBeGreaterThan(t);
      expect(due - t).toBeLessThanOrEqual(PART);
      expect(due === beatStart + PART || due === beatStart + TPB).toBe(true);
    }
  });

  it("puts two departures inside every beat, which is what a Throb needs", () => {
    // `throbOpenBeats` is one beat in four. Two grid points inside it means a
    // Throb stays answerable; a whole-beat grid would leave exactly one.
    const inFirstBeat = new Set<number>();
    for (let t = 0; t < TPB; t++) inFirstBeat.add(chargeDueTick(LAID, t));
    expect(inFirstBeat.size).toBe(2);
    expect(CFG.throbOpenBeats).toBe(1);
  });

  it("never lets a press fire with no wind-up at all, even on the beat", () => {
    // The tell is the whole point, and a tell that sometimes lasts zero ticks
    // is one the other player cannot learn to read.
    for (const t of [0, TPB, TPB * 2, PART, PART * 2]) {
      expect(chargeDueTick(LAID, t)).toBeGreaterThan(t);
    }
  });
});

describe("with no grid, which is the default", () => {
  it("a press is a bullet on the tick it was pressed, exactly as it always was", () => {
    const w = world(CFG);
    const seen = play(w, 4, [aim(0, COL), shoot(1)]);
    expect(fired(seen)).toHaveLength(1);
    expect(fired(seen)[0]?.tick).toBe(1);
    expect(w.charge).toBeNull();
  });
});

describe("laying one", () => {
  it("holds the shot back and sends it out on the grid point", () => {
    const w = world();
    const seen = play(w, PART + 2, [aim(0, COL), shoot(1)]);
    // Pressed on tick 1, so it belongs to the first part of beat 0.
    expect(fired(seen)).toHaveLength(1);
    expect(fired(seen)[0]?.tick).toBe(PART);
    expect(w.charge).toBeNull();
  });

  it("nothing is on the field in between, and the world knows why", () => {
    const w = world();
    play(w, 10, [aim(0, COL), shoot(1)]);
    expect(w.bullets).toHaveLength(0);
    expect(laying(w)).toBe(true);
    // The opening is partway through dilating, and render/ reads exactly this.
    expect(chargeMilli(w)).toBeGreaterThan(150);
    expect(chargeMilli(w)).toBeLessThan(350);
  });

  it("a press in the second half of a beat leaves on the beat itself", () => {
    const w = world();
    const seen = play(w, TPB + 2, [aim(0, COL), shoot(PART + 5)]);
    expect(fired(seen)[0]?.tick).toBe(TPB);
  });

  it("takes one press at a time — a second does not lay a second or move the first", () => {
    const w = world();
    const seen = play(w, PART + 2, [aim(0, COL), shoot(1), shoot(4, "cyan")]);
    expect(fired(seen)).toHaveLength(1);
    expect(fired(seen)[0]?.tick).toBe(PART);
    expect(w.bullets[0]?.color).toBe("red");
  });

  it("and the reload gap still refuses one, so nothing is laid at all", () => {
    const w = world();
    // The second press is inside `fireEveryBeats` of the first and never
    // becomes a charge — the gap is measured press to press, as it always was,
    // and the grid is a second floor underneath it rather than a replacement.
    const seen = play(w, TPB * 2, [aim(0, COL), shoot(1), shoot(20)]);
    expect(fired(seen)).toHaveLength(1);
  });

  it("costs the pair no rate of fire, because the grid is the reload gap", () => {
    const count = (cfg: SimConfig): number => {
      const w = world(cfg);
      const mash = Array.from({ length: TPB * 8 }, (_, t) => shoot(t));
      return fired(play(w, TPB * 8, [aim(0, COL), ...mash])).length;
    };
    // `fireEveryBeats` is half a beat and so is the grid, so a thumb held on
    // the button gets the same number of bolts either way.
    expect(Math.abs(count(LAID) - count(CFG))).toBeLessThanOrEqual(1);
  });
});

describe("what the wind-up costs the field", () => {
  it("spends a third of a second of a creature's eight and three quarter", () => {
    // The 4-second rule (docs/spec/latency.md): a creature entering at row 0
    // walks `rows - 1` beats before it reaches the hull, and the grid takes at
    // most one part off the last moment the pair can answer it. The margin,
    // not the number, is the thing worth pinning — this must stay a rounding
    // error against the rule rather than a bite out of it.
    const windUp = PART / CFG.tickHz;
    const fall = ((CFG.rows - 1) * 60) / CFG.bpm;
    expect(windUp).toBeLessThan(0.35);
    expect(fall - windUp).toBeGreaterThan(4);
  });
});

describe("the column it comes out of", () => {
  it("is where the cannon is when it leaves, not where it was when pressed", () => {
    const w = world();
    const seen = play(w, PART + 2, [aim(0, COL), shoot(1), aim(10, COL + 2)]);
    const shot = fired(seen)[0]?.event;
    expect(shot?.type === "fire" && shot.col).toBe(COL + 2);
    expect(w.bullets[0]?.col).toBe(COL + 2);
  });
});

describe("the lance, which is settled at the press", () => {
  const FILL = CFG.lancePrimeBeats * TPB;

  it("empties the lobe when the press lands, not when the shot goes", () => {
    const w = world();
    play(w, FILL + 3, [aim(0, COL), prime(1, true), shoot(FILL + 2)]);
    expect(priming(w)).toBe(false);
    expect(laying(w)).toBe(true);
    expect(w.bullets).toHaveLength(0);
  });

  it("still delivers a lance after the cannon has moved, so the tell cannot lie", () => {
    // A wind-up that showed a lance being laid and then produced an ordinary
    // bolt because player 1 slid the cannon would be a tell worth nothing.
    const w = world();
    const seen = play(w, FILL + TPB * 2, [
      aim(0, COL),
      prime(1, true),
      shoot(FILL + 2),
      aim(FILL + 5, COL + 1),
    ]);
    const shot = fired(seen)[0]?.event;
    expect(shot?.type === "fire" && shot.lance).toBe(true);
    expect(shot?.type === "fire" && shot.col).toBe(COL + 1);
    expect(lanceReady(w)).toBe(false);
  });

  it("reports a spilled lobe on the press, where the spill happened", () => {
    const w = world();
    const seen = play(w, TPB * 2, [aim(0, COL), prime(1, true), shoot(TPB)]);
    const spill = seen.filter((s) => s.event.type === "lanceSpilled");
    expect(spill).toHaveLength(1);
    expect(spill[0]?.tick).toBe(TPB);
  });
});

describe("a charge nobody can deliver", () => {
  it("goes when the wave does — no bolt arrives in the wave after it", () => {
    const w = world();
    play(w, 10, [aim(0, COL), shoot(1)]);
    expect(laying(w)).toBe(true);
    startWave(w, 1, []);
    expect(w.charge).toBeNull();
    const seen = play(w, TPB * 3);
    expect(fired(seen)).toHaveLength(0);
  });

  it("goes when the run is left, before the host has answered `needWave`", () => {
    const w = world();
    play(w, 10, [aim(0, COL), shoot(1)]);
    const seen = play(w, TPB * 2, [{ tick: 12, player: 1, command: { kind: "restart" } }]);
    expect(w.charge).toBeNull();
    expect(fired(seen)).toHaveLength(0);
  });

  it("is never in the muzzle while a wave's opening is up", () => {
    // An opening is only ever raised by `startWave`, and `startWave` throws
    // the charge away — so "the introduction comes up mid-charge" is a state
    // the world cannot hold, rather than one that is handled.
    const w = createWorld({ ...LAID, ...PAIR_ON }, 0, [
      { beat: 0, col: COL, kind: "slick", color: "red" },
    ]);
    expect(briefingHolds(w)).toBe(true);
    expect(w.charge).toBeNull();
    // And nothing reaches the ship while it holds, so none is laid either.
    play(w, TPB * 2, [shoot(1), shoot(TPB)]);
    expect(w.charge).toBeNull();
    expect(w.bullets).toHaveLength(0);
  });
});

describe("a world that stops", () => {
  it("holds the charge exactly where it was, the way a bullet in flight waits", () => {
    const w = world();
    play(w, 10, [aim(0, COL), shoot(1)]);
    const left = w.charge?.left;
    expect(left).toBeGreaterThan(0);

    // A wave's opening. It used to be an interlude here, which was the other
    // world that stops; THE GAUGE is a boss wave now and `startWave` empties
    // the charge on the way in, so a shot can no longer be owed into one. What
    // the rule is about did not change: the countdown is only ever stepped
    // from inside a running field, so a field that is not running holds it —
    // the shot is owed, not late.
    //
    // The opening is raised by hand rather than by a wave, because a wave is
    // what clears the charge. `briefingHolds` reads nothing but the phase.
    w.brief.phase = OPENING_INTRO;
    play(w, TPB * 20);
    expect(w.charge?.left).toBe(left as number);
    expect(w.bullets).toHaveLength(0);

    w.brief.phase = OPENING_PLAY;
    const seen = play(w, w.tick + PART + 2);
    expect(fired(seen)).toHaveLength(1);
  });
});

describe("two devices", () => {
  it("cannot disagree about a shot that has been pressed and not delivered", () => {
    const a = world();
    play(a, 10, [aim(0, COL), shoot(1)]);
    const b = world();
    play(b, 10, [aim(0, COL)]);
    expect(laying(a)).toBe(true);
    expect(hashWorld(a)).not.toBe(hashWorld(b));

    const c = world();
    play(c, 10, [aim(0, COL), shoot(1)]);
    expect(hashWorld(c)).toBe(hashWorld(a));
  });

  it("nor about which colour is in the muzzle", () => {
    const a = world();
    play(a, 10, [aim(0, COL), shoot(1, "red")]);
    const b = world();
    play(b, 10, [aim(0, COL), shoot(1, "cyan")]);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });

  it("nor about a whole wave played with the grid on", () => {
    const queue: SpawnEntry[] = [
      { beat: 0, col: COL, kind: "slick", color: "red" },
      { beat: 2, col: COL, kind: "bulb", color: "cyan" },
      { beat: 3, col: COL + 1, kind: "meteor", color: null },
    ];
    const inputs = [aim(0, COL), shoot(7), shoot(TPB + 3, "cyan"), shoot(TPB * 3 + 1)];
    const run = () => {
      const w = world(LAID, queue);
      play(w, TPB * 10, inputs);
      return w;
    };
    const a = run();
    const b = run();
    expect(hashWorld(a)).toBe(hashWorld(b));
    // And the run was worth hashing: something actually left the muzzle.
    expect(a.balance.colorHits + a.balance.colorMisses).toBeGreaterThan(0);
  });
});
