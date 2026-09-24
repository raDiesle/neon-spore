import { describe, expect, it } from "bun:test";
import {
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  fallTilesPerBeat,
  hashWorld,
  hullRow,
  lostAsks,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG); // 75
const HULL = hullRow(CFG); // 14

/**
 * A creature listed at wave-beat 0 spawns on the first beat and stands on row
 * 0; from there one row per beat. So it meets the hull on beat `HULL + 1`.
 */
const IMPACT_TICK = TPB * (HULL + 1);
/**
 * The beat a body nobody answered is actually *through* the hull: one beat
 * past the beat it lands on it. Every body stops on the ship's row instead of
 * falling past it, and spends the beat render/ draws it crossing that last
 * tile standing there — which is the last beat the shield can still turn a
 * rock and the cannon can still break a slick (`hull.ts`). Every miss below is
 * measured from here, every save from `IMPACT_TICK`.
 */
const BREACH_TICK = IMPACT_TICK + TPB;

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const meteor = (col: number): SpawnEntry => ({ beat: 0, col, kind: "meteor", color: null });
const slick = (col: number, color: Color): SpawnEntry => ({ beat: 0, col, kind: "slick", color });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
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

describe("the beat", () => {
  it("moves a creature exactly one tile per beat, on tile centres", () => {
    const { world } = run([slick(3, "red")], TPB * 6 + 1);
    // Spawned on beat 1 at row 0, so after six beats it stands on row 5.
    expect(world.creatures).toHaveLength(1);
    expect(world.creatures[0]!.row).toBe(5);
    expect(Number.isInteger(world.creatures[0]!.row)).toBe(true);
  });

  it("brings a creature in from above the grid, not out of thin air", () => {
    const { world } = run([slick(3, "red")], TPB + 1);
    expect(world.creatures[0]!.row).toBe(0);
    expect(world.creatures[0]!.fromRow).toBe(-1);
  });
});

describe("the hull", () => {
  it("takes damage and keeps a break where a creature landed", () => {
    const { world } = run([slick(4, "red")], BREACH_TICK + 1);
    expect(world.creatures).toHaveLength(0);
    expect(failHolds(world)).toBe(true);
    expect(world.scars.map((s) => s.col)).toContain(4);
  });

  /**
   * The scar and the event it came with say the same thing about the hit.
   *
   * `breachHue` maps a kind *and* a colour to what an impact is drawn in, and
   * a `Scar` carried only the kind until 17 September 2026 — so anything
   * replaying a remembered hit had to hand it a `null` and got red for every
   * cyan body, the live strike and its own replay a second later disagreeing
   * about what broke the hull. The lost screen replays exactly this
   * (`render/lost-screen.ts`) and is where it showed.
   */
  it("remembers what colour broke it, the same colour the breach was thrown in", () => {
    for (const color of ["cyan", "red"] as const) {
      const { world, events } = run([slick(4, color)], BREACH_TICK + 1);
      const breach = events.find((e) => e.type === "breach");
      expect(breach).toBeDefined();
      expect(world.scars[0]?.color).toBe(color);
      expect(breach?.type === "breach" ? breach.color : null).toBe(color);
    }
  });

  /**
   * A rock has no colour to remember, and that is not the same as forgetting
   * one: `breachHue` reads a missing colour as "its kind already says", which
   * is the truth for every meteor, and `Scar.color` is absent rather than red.
   */
  it("leaves the colour off a hit whose colour is not a fact about it", () => {
    const { world } = run([meteor(4)], BREACH_TICK + 1);
    expect(world.scars.length).toBeGreaterThan(0);
    expect(world.scars[0]?.color).toBeUndefined();
  });

  const ASKED_TICK = BREACH_TICK + TPB * CFG.waveFailBeats;
  const answer = (
    tick: number,
    player: 1 | 2,
    kind: "retry" | "retryGuide" | "quit",
  ): TimedCommand => ({
    tick,
    player,
    command: { kind },
  });

  it("holds the field from the hit, then asks the pair rather than the host", () => {
    const { world, events } = run([slick(4, "red")], ASKED_TICK + TPB * 4);
    // Nothing more happens on the field: the break stays where it was seen,
    // and after the pause the screen is up and stays up. Nobody is asked for
    // a wave until a seat has answered it.
    expect(world.scars).toHaveLength(1);
    expect(failHolds(world)).toBe(true);
    expect(events.filter((e) => e.type === "waveFailed")).toHaveLength(1);
    expect(events.filter((e) => e.type === "needWave")).toEqual([]);
    expect(lostAsks(world)).toBe(true);
    expect(world.over).toBe(false);
  });

  it("counts the retry when the wave opens again, not on the hit", () => {
    // The lost screen's own frame used to read `1 RETRY` beside a QUIT button,
    // and a pair that quit was recorded with a retry they never took. The hit
    // asks; the count moves when the answer is taken (`wave-start.ts`).
    const { world } = run([slick(4, "red")], ASKED_TICK + TPB, [
      answer(ASKED_TICK + 3, 1, "retry"),
    ]);
    expect(failHolds(world)).toBe(true);
    expect(world.retries).toBe(0);
    expect(world.waveTries).toBe(1);
    expect(world.runTries).toBe(1);
    startWave(world, world.wave, [slick(4, "red")]);
    expect(failHolds(world)).toBe(false);
    expect(world.retries).toBe(1);
    expect(world.waveTries).toBe(2);
    expect(world.runTries).toBe(2);
    // The next wave, or a jump, is a first try and costs nothing — but it is
    // still a try, and the run's own count takes it (`lost-words.ts`).
    startWave(world, world.wave + 1, []);
    expect(world.retries).toBe(1);
    expect(world.waveTries).toBe(1);
    expect(world.runTries).toBe(3);
  });

  it("asks for the same wave once a seat says RETRY, and only once", () => {
    // Both phones press within a beat of each other: the first press is the
    // answer, and the second lands on a world that has stopped asking.
    const { world, events } = run([slick(4, "red")], ASKED_TICK + TPB * 4, [
      answer(ASKED_TICK + 3, 2, "retry"),
      answer(ASKED_TICK + 5, 1, "retry"),
      answer(ASKED_TICK + 9, 1, "quit"),
    ]);
    expect(events.filter((e) => e.type === "needWave")).toEqual([
      { type: "needWave", wave: 0, retry: true },
    ]);
    expect(lostAsks(world)).toBe(false);
    expect(world.over).toBe(false);
  });

  /**
   * **The third answer, and the one flag that tells the host about it.**
   *
   * The owner, 24 September 2026: *there must be a way to watch tutorial again
   * and then restart wave, like as players entered first time the wave.* The
   * simulation's whole share of that is this event — it does not know what a
   * guide says, only that the host was asked for one (`wave-fail.ts`). Held
   * here because the flag is the entire seam: a `needWave` that lost it would
   * open the wave without its film and nothing would fail.
   */
  it("carries the guide on a retry that asked for the tutorial, and only then", () => {
    const guided = run([slick(4, "red")], ASKED_TICK + TPB * 4, [
      answer(ASKED_TICK + 3, 1, "retryGuide"),
    ]);
    expect(guided.events.filter((e) => e.type === "needWave")).toEqual([
      { type: "needWave", wave: 0, retry: true, guide: true },
    ]);
    // It is still a retry, and it still answers for both seats at once.
    expect(lostAsks(guided.world)).toBe(false);
    expect(guided.world.over).toBe(false);
    // And the plain one is untouched: no `guide` key at all, not `guide: false`.
    const plain = run([slick(4, "red")], ASKED_TICK + TPB * 4, [
      answer(ASKED_TICK + 3, 1, "retry"),
    ]);
    const need = plain.events.find((e) => e.type === "needWave");
    expect(need).toEqual({ type: "needWave", wave: 0, retry: true });
    expect(need !== undefined && "guide" in need).toBe(false);
  });

  it("ends the run for both when a seat says QUIT, and says which seat", () => {
    const { world, events } = run([slick(4, "red")], ASKED_TICK + TPB * 4, [
      answer(ASKED_TICK + 3, 2, "quit"),
      answer(ASKED_TICK + 5, 1, "retry"),
    ]);
    expect(world.over).toBe(true);
    expect(events.filter((e) => e.type === "quit")).toEqual([{ type: "quit", player: 2 }]);
    expect(events.filter((e) => e.type === "needWave")).toEqual([]);
    expect(lostAsks(world)).toBe(false);
  });

  /**
   * **And on a wave nobody has lost.** The phone's back gesture asks the
   * question over a live field now — the menu, quit the game, keep playing
   * (`apps/game/src/back-ask.ts`) — and the middle answer has to reach the
   * other phone, which only a command can do. `wave-fail.ts` never sees it:
   * that file runs only while a hit is holding the field.
   */
  it("ends a run a seat quits mid-wave, once, in the name of the seat that pressed", () => {
    const { world, events } = run([meteor(4)], TPB * 3, [
      answer(TPB, 2, "quit"),
      answer(TPB, 1, "quit"),
    ]);
    expect(world.over).toBe(true);
    // The first press of the tick wins, the way the lost screen's does: solo
    // both seats' presses go in, and the second must not rename the quitter.
    expect(events.filter((e) => e.type === "quit")).toEqual([{ type: "quit", player: 2 }]);
  });

  it("does not hear an answer before the pause is spent", () => {
    // A thumb still on the button from the wave is not an answer to a
    // question that has not been put yet.
    const { world } = run([slick(4, "red")], ASKED_TICK + TPB, [
      answer(BREACH_TICK + 2, 1, "quit"),
    ]);
    expect(world.over).toBe(false);
    expect(lostAsks(world)).toBe(true);
  });
});

describe("the shield", () => {
  it("deflects only when player 2 has the column and player 1 triggers in time", () => {
    const { world, events } = run([meteor(5)], IMPACT_TICK + 1, [
      shieldTo(10, 5),
      guard(IMPACT_TICK - 20),
    ]);
    expect(world.guard.deflected).toBe(1);
    expect(world.guard.mistimed).toBe(0);
    expect(world.guard.tries).toBe(1);
    expect(world.retries).toBe(0);
    expect(events.some((e) => e.type === "deflect")).toBe(true);
  });

  it("counts the right column at the wrong moment separately", () => {
    // The interesting failure: they agreed on where and missed on when.
    // Measured back from the beat the rock meets the *shield*, one row above
    // the hull — that is the moment the trigger is judged against now, so a
    // press 30 ticks past the edge of the window has to be 30 ticks past
    // that edge and not the ship's (`shieldRow`, sim/hull.ts).
    const early = IMPACT_TICK - TPB - Math.round((CFG.guardWindowMs / 1000) * CFG.tickHz) - 30;
    const { world } = run([meteor(5)], BREACH_TICK + 1, [shieldTo(10, 5), guard(early)]);
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(1);
    expect(failHolds(world)).toBe(true);
  });

  it("does nothing from the wrong column, however well timed", () => {
    const { world } = run([meteor(5)], BREACH_TICK + 1, [shieldTo(10, 2), guard(IMPACT_TICK - 20)]);
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(0);
    expect(world.guard.tries).toBe(1);
    expect(failHolds(world)).toBe(true);
  });

  it("position alone is not enough", () => {
    const { world } = run([meteor(5)], BREACH_TICK + 1, [shieldTo(10, 5)]);
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(1);
  });

  it("deflects a faster rock tier too, not just the original meteor", () => {
    // Regression: resolveHull used to test `c.kind === "meteor"` literally,
    // so every other tier fell through to the creature branch — undeflectable
    // chip damage instead of a guard try. Any tier must reach the shield
    // branch the same way.
    const rate = fallTilesPerBeat("meteorFast");
    const impactBeat = Math.ceil(HULL / rate) + 1;
    const impactTick = TPB * impactBeat;
    const { world, events } = run(
      [{ beat: 0, col: 5, kind: "meteorFast", color: null }],
      impactTick + 1,
      [shieldTo(10, 5), guard(impactTick - 20)],
    );
    expect(world.guard.tries).toBe(1);
    expect(world.guard.deflected).toBe(1);
    expect(world.retries).toBe(0);
    expect(events.some((e) => e.type === "deflect")).toBe(true);
  });
});

describe("shots", () => {
  it("destroy a creature of the matching colour", () => {
    const inputs = [aim(10, 3)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "red"));
    const { world, events } = run([slick(3, "red")], IMPACT_TICK, inputs);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(world.retries).toBe(0);
  });

  it("bounce off a creature of the wrong colour", () => {
    const inputs = [aim(10, 3)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "cyan"));
    const { world, events } = run([slick(3, "red")], IMPACT_TICK - 1, inputs);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.creatures).toHaveLength(1);
  });

  it("leave a hole in a meteor and do nothing else", () => {
    const inputs = [aim(10, 3)];
    for (let t = 200; t < IMPACT_TICK; t += 60) inputs.push(fire(t, "red"));
    const { world, events } = run([meteor(3)], IMPACT_TICK - 1, inputs);
    expect(world.creatures).toHaveLength(1);
    expect(world.creatures[0]!.holes).toBeGreaterThan(0);
    expect(world.creatures[0]!.holes).toBeLessThanOrEqual(CFG.maxHoles);
    expect(events.some((e) => e.type === "hole")).toBe(true);
  });

  it("keep to the beat: twelve tiles per beat, half a beat between shots", () => {
    const { world } = run([], 300, [fire(0, "red"), fire(20, "cyan")]);
    // The second shot falls inside the cooldown and never happens.
    expect(world.bullets.length + world.nextId).toBeGreaterThan(0);
    const fired = run([], 2, [fire(0, "red"), fire(1, "cyan")]);
    expect(fired.world.bullets).toHaveLength(1);

    // A bullet already advances on the tick it is fired, so one beat of travel
    // is exactly TPB iterations.
    const one = run([], TPB, [fire(0, "red")]);
    const b = one.world.bullets[0]!;
    const travelled = HULL - 1 - b.row + b.subMilli / 1000;
    expect(travelled).toBeCloseTo(CFG.bulletTilesPerBeat, 6);
  });
});

describe("waves", () => {
  it("asks the host for the next wave once the field is clear", () => {
    // The one slick is shot, so the wave is passed and not lost.
    const { world, events } = run([slick(3, "red")], IMPACT_TICK + TPB * 5, [
      aim(0, 3),
      fire(TPB, "red"),
    ]);
    const asks = events.filter((e) => e.type === "needWave");
    expect(asks).toHaveLength(1);
    expect(asks[0]).toEqual({ type: "needWave", wave: 1 });
    // Asked exactly once — the host has not answered, and it does not nag.
    expect(world.restBeat).toBe(-1);
    expect(world.retries).toBe(0);
  });
});

describe("replays across waves", () => {
  it("plays on into a wave the replay carries, and stops at one it does not", () => {
    // The first wave's slick is shot, or the hit would ask for wave 0 again.
    const two = record({
      name: "two waves",
      seed: 0,
      ticks: IMPACT_TICK + TPB * 6,
      queues: [[slick(3, "red")], [meteor(6)]],
      inputs: [aim(0, 3), fire(TPB, "red")],
    });
    const world = runReplay(two);
    expect(world.wave).toBe(1);
    expect(world.creatures[0]!.kind).toBe("meteor");
    // Same inputs, same fingerprint — the whole point of the format.
    expect(hashWorld(runReplay(two))).toBe(two.expectHash!);

    // Without a queue for wave 1 the field simply stays empty.
    const one = runReplay({ ...two, queues: [[slick(3, "red")]] });
    expect(one.wave).toBe(0);
    expect(one.creatures).toHaveLength(0);
  });
});
