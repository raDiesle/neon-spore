import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { ghostCrosses, ghostIsCharging, ghostLaps, ghostRage } from "../src/ghost.js";
import { setGrip } from "../src/grip.js";
import { hashWorld } from "../src/hash.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE GHOST, and the two things about it nothing else in this suite covers: a
 * body whose **column** is the secret, and a body that **does not fall**.
 *
 * The first half is not testable here at all and that is worth saying out
 * loud — which screen draws which body is `packages/render`'s question, and
 * `showsGhostBody` is where it is answered. What the simulation owes is that
 * both seats are looking at the *same* world while one of them is not shown
 * it, which is the fingerprint, and that is the last test in this file.
 *
 * The second half is all of the rest: a crossing ghost walks its row, counts
 * the walls it turns at, and on the last one comes down at the hull head
 * first. Every one of those is a beat somebody could get wrong by one.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const falling = (col: number, color: Color = "cyan"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "ghost",
  color,
});
const crossing = (col: number, color: Color = "cyan"): SpawnEntry => ({
  ...falling(col, color),
  path: "across",
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

interface Run {
  world: World;
  events: SimEvent[];
}

function run(entry: SpawnEntry, ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 5, [entry]);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

/**
 * Beats one crossing takes: the walk from wall to wall at `ghostCrossCols` a
 * beat, plus the beat it spends standing on the far one and turning. Derived
 * rather than typed, so a change to the stride or to the field's width moves
 * these budgets with it instead of quietly making every test below wait in
 * the wrong place.
 */
const CROSS_BEATS = Math.ceil((CFG.cols - 1) / CFG.ghostCrossCols) + 1;

const only = (world: World): Creature => {
  const c = world.creatures[0];
  if (c === undefined) throw new Error("the field is empty");
  return c;
};

describe("a ghost that falls", () => {
  it("holds its lane and comes down a tile a beat, like any other body", () => {
    const { world } = run(falling(3), TPB * 4);
    const body = only(world);
    expect(body.col).toBe(3);
    expect(ghostCrosses(body)).toBe(false);
    // Three beats of fall after the beat it enters on.
    expect(body.row).toBe(3);
  });

  it("carries no crossing state at all, so an old wave is the world it was", () => {
    // The absence *is* the path (`ghostCrosses`), and it is what keeps every
    // ghost authored before crossing existed byte-for-byte the same arrival.
    const body = only(run(falling(3), TPB * 2).world);
    expect(body.ghostDir).toBeUndefined();
    expect(body.ghostLaps).toBeUndefined();
  });
});

describe("the shot that takes one", () => {
  /** Aim at `col`, then fire `color` a beat later — long enough for the input
   * delay and the cannon's own slide to have landed. */
  const shoot = (col: number, color: Color): TimedCommand[] => [aim(1, col), fire(TPB, color)];

  it("shows the body to the seat that has never seen it", () => {
    const { world, events } = run(falling(3), TPB * 6, shoot(3, "cyan"));
    const release = events.filter((e) => e.type === "ghostRelease");
    expect(release).toHaveLength(1);
    expect(release[0]).toMatchObject({ col: 3, color: "cyan" });
    expect(world.creatures).toHaveLength(0);
  });

  it("is a kill like any other beside it, not instead of it", () => {
    // The escape rides on top of the ordinary destroy — same burst, same
    // sound, same balance — exactly as `veilTorn` does. A `ghostRelease` that
    // replaced the kill would take the score and the colour streak with it.
    const { world, events } = run(falling(3), TPB * 6, shoot(3, "cyan"));
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    // The wave clears on the beat the field empties, so what the run is worth
    // is the kill plus that — and the kill is the half this is about.
    expect(world.score).toBe(CFG.scoreGhostKill + CFG.scoreWave);
    expect(world.balance.colorHits).toBe(1);
  });

  it("costs the colour balance when the trigger was the wrong one", () => {
    const { world, events } = run(falling(3), TPB * 6, shoot(3, "red"));
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "ghostRelease")).toBe(false);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.creatures).toHaveLength(1);
  });
});

describe("a ghost that crosses", () => {
  it("sets off away from the nearer wall, so the first crossing is the long one", () => {
    expect(only(run(crossing(1), TPB * 2).world).ghostDir).toBe(1);
    expect(only(run(crossing(CFG.cols - 2), TPB * 2).world).ghostDir).toBe(-1);
  });

  it("drifts down to the row it prowls along and then stops falling", () => {
    const settled = run(crossing(1), TPB * (CFG.ghostCrossRow + 4)).world;
    expect(only(settled).row).toBe(CFG.ghostCrossRow);
  });

  it("takes a column a beat once it is there", () => {
    const before = only(run(crossing(1), TPB * (CFG.ghostCrossRow + 1)).world).col;
    const after = only(run(crossing(1), TPB * (CFG.ghostCrossRow + 2)).world).col;
    expect(after - before).toBe(CFG.ghostCrossCols);
  });

  it("turns at the wall, counts it, and says so on both devices", () => {
    // Far enough for the walk in, the crossing and the beat it turns on.
    const { world, events } = run(crossing(1), TPB * (CFG.ghostCrossRow + CROSS_BEATS + 2));
    const turns = events.filter((e) => e.type === "ghostTurn");
    expect(turns.length).toBeGreaterThan(0);
    expect(turns[0]).toMatchObject({ laps: 1 });
    expect(only(world).ghostDir).toBe(-1);
  });

  it("gets angrier by exactly the count, and never past it", () => {
    const cfg = { ...CFG };
    const body = { ...only(run(crossing(1), TPB * 2).world) };
    for (let laps = 0; laps <= cfg.ghostChargeLaps + 2; laps++) {
      body.ghostLaps = laps;
      expect(ghostRage(cfg, body)).toBeCloseTo(Math.min(1, laps / cfg.ghostChargeLaps), 6);
      expect(ghostIsCharging(cfg, body)).toBe(laps >= cfg.ghostChargeLaps);
    }
  });

  it("refuses a hand, because there is no fall for a brake to scale", () => {
    const { world } = run(crossing(1), TPB * (CFG.ghostCrossRow + 2));
    setGrip(world, 1, only(world).id);
    expect(world.gripP1).toBe(0);
  });
});

describe("the dive at the end of its temper", () => {
  /** Long enough for the walk in, three crossings of the field and the fall
   * that follows — one run, and the events it made on the way. */
  const spent = (): Run =>
    run(
      crossing(1),
      TPB * (CFG.ghostCrossRow + CROSS_BEATS * (CFG.ghostChargeLaps + 1) + CFG.rows + 4),
    );

  /** The tick the charge lands on, found by running it once. Nothing in this
   * file counts beats to it by hand: the walk in, the stride and the wall
   * pause are three numbers that would all have to be right at once. */
  function chargeTick(): number {
    const world = createWorld({ ...CFG }, 5, [crossing(1)]);
    for (let t = 0; t < TPB * 200; t++) {
      step(world, []);
      if (world.events.some((e) => e.type === "ghostCharge")) return t;
    }
    throw new Error("it never charged");
  }

  it("stops prowling after exactly the number of turns it was given", () => {
    const { events } = spent();
    const turns = events.filter((e) => e.type === "ghostTurn");
    const charge = events.filter((e) => e.type === "ghostCharge");
    expect(charge).toHaveLength(1);
    // The charge lands on the last turn and on no other.
    const at = turns.findIndex((t) => t.type === "ghostTurn" && t.laps === CFG.ghostChargeLaps);
    expect(at).toBe(CFG.ghostChargeLaps - 1);
  });

  it("comes down head first and takes more of the hull than a body that merely arrived", () => {
    const { world, events } = spent();
    const breach = events.find((e) => e.type === "breach");
    expect(breach).toBeDefined();
    expect(breach).toMatchObject({ kind: "ghost", damage: CFG.damageGhostDive });
    expect(CFG.damageGhostDive).toBeGreaterThan(CFG.damageCreature);
    expect(world.creatures).toHaveLength(0);
  });

  it("is still a target on the way down — the dive is a decision, not an escape", () => {
    // It charges from a wall, so the column it dives down is the one it turned
    // in: an odd number of crossings from the left means the right-hand one.
    const wall = CFG.cols - 1;
    const at = chargeTick();
    const { events } = run(crossing(1), at + TPB * (CFG.rows + 4), [
      aim(at, wall),
      fire(at + TPB, "cyan"),
      fire(at + TPB * 2, "cyan"),
    ]);
    expect(events.some((e) => e.type === "ghostRelease")).toBe(true);
  });

  it("reaches the hull row rather than stopping short of it", () => {
    expect(hullRow(CFG)).toBeGreaterThan(CFG.ghostCrossRow);
  });
});

describe("two devices", () => {
  /** The property that matters for lockstep, and the reason nothing here pins
   * a fingerprint as a constant (`docs/decisions.md` #19): the same inputs on
   * the same build produce the same world, twice. */
  const inputs = [aim(1, 4), fire(TPB, "cyan")];

  it("agree about a ghost that falls", () => {
    const a = run(falling(4), TPB * 8, inputs).world;
    const b = run(falling(4), TPB * 8, inputs).world;
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("agree about one that crosses, walls and all", () => {
    const ticks = TPB * (CFG.ghostCrossRow + CROSS_BEATS + 2);
    const a = run(crossing(1), ticks).world;
    const b = run(crossing(1), ticks).world;
    expect(hashWorld(a)).toBe(hashWorld(b));
    expect(ghostLaps(only(a))).toBeGreaterThan(0);
  });

  it("notice a lap count that has drifted, which is the whole reason it is hashed", () => {
    const ticks = TPB * (CFG.ghostCrossRow + CROSS_BEATS + 2);
    const a = run(crossing(1), ticks).world;
    const b = run(crossing(1), ticks).world;
    const drifted = only(b);
    drifted.ghostLaps = ghostLaps(drifted) + 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
