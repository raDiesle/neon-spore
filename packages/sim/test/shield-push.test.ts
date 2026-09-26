import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  isPushable,
  pushIsClimbing,
  pushOffered,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import type { CreatureKind } from "../src/types.js";

/**
 * The shield pushes a creature back up the field, **once** — the owner's
 * answer, 25 September 2026 (`shield-push.ts`).
 *
 * What is pinned: the push happens at the shield's own row and the body is
 * already leaving on the same beat; it climbs `shieldPushRows` a beat for
 * `shieldPushBeats` and then falls again; the second arrival breaks the hull
 * through the same dome; the cannon still kills it; the kinds the owner kept
 * out stay out; the rocks' guard record is not paid for it; and two devices
 * agree.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Where the shield answers, written out by hand for `volley.test.ts`'s reason. */
const SHIELD = HULL - 1;

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shield = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

/** The shield in `col` from the first tick and the trigger on every beat. */
function warding(col: number, beats: number): TimedCommand[] {
  const inputs: TimedCommand[] = [shield(0, col)];
  for (let beat = 0; beat <= beats; beat++) inputs.push(guard(TPB * beat));
  return inputs;
}

/** The tick a body entered at beat 0 stands on a row, a tile a beat. */
const tickAtRow = (row: number): number => TPB * (row + 1);

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []) {
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

const of = (events: SimEvent[], type: SimEvent["type"]) => events.filter((e) => e.type === type);

describe("the push", () => {
  it("turns a slick at the shield's own row, and it is already leaving", () => {
    const { world, events } = run([slick(3)], tickAtRow(SHIELD) + 1, warding(3, HULL));
    expect(of(events, "shieldPush")).toEqual([
      { type: "shieldPush", id: world.creatures[0]!.id, col: 3, row: SHIELD, kind: "slick" },
    ]);
    const body = world.creatures[0]!;
    expect(body.row).toBe(SHIELD - CFG.shieldPushRows);
    expect(body.fromRow).toBe(SHIELD - 1);
    expect(pushIsClimbing(body)).toBe(true);
    expect(pushOffered(body)).toBe(false);
    expect(of(events, "breach")).toHaveLength(0);
  });

  it("climbs for its beats, then falls again from high up", () => {
    const pushedAt = tickAtRow(SHIELD);
    const top = SHIELD - CFG.shieldPushRows * CFG.shieldPushBeats;
    const atTop = run([slick(3)], pushedAt + TPB * (CFG.shieldPushBeats - 1) + 1, warding(3, HULL));
    expect(atTop.world.creatures[0]!.row).toBe(top);
    expect(pushIsClimbing(atTop.world.creatures[0]!)).toBe(false);
    const after = run([slick(3)], pushedAt + TPB * CFG.shieldPushBeats + 1, warding(3, HULL));
    expect(after.world.creatures[0]!.row).toBe(top + 1);
  });

  it("is given once: the second arrival breaks the hull through the dome", () => {
    const { world, events } = run([slick(3)], TPB * 60, warding(3, 60));
    expect(of(events, "shieldPush")).toHaveLength(1);
    expect(of(events, "breach")).toHaveLength(1);
    expect(world.creatures).toHaveLength(0);
  });

  it("leaves the cannon's job to the cannon", () => {
    const pushedAt = tickAtRow(SHIELD);
    const shots: TimedCommand[] = [aim(0, 3)];
    for (let beat = 0; beat < 6; beat++) shots.push(fire(pushedAt + TPB * (beat + 2), "red"));
    const { world, events } = run([slick(3)], TPB * 60, [...warding(3, 60), ...shots]);
    expect(of(events, "shieldPush")).toHaveLength(1);
    expect(of(events, "destroy").length).toBeGreaterThan(0);
    expect(of(events, "breach")).toHaveLength(0);
    expect(world.creatures).toHaveLength(0);
  });

  it("does not answer a creature in another column", () => {
    const { events } = run([slick(3)], TPB * 30, warding(5, 30));
    expect(of(events, "shieldPush")).toHaveLength(0);
    expect(of(events, "breach")).toHaveLength(1);
  });

  /** The rocks' lesson, and a push is not it. */
  it("pays nothing into the guard record", () => {
    const { world } = run([slick(3)], tickAtRow(SHIELD) + 1, warding(3, HULL));
    expect(world.guard.tries).toBe(0);
    expect(world.guard.deflected).toBe(0);
  });

  it("walks the same beats to the same fingerprint on two devices", () => {
    const a = run([slick(3), slick(5)], TPB * 25, warding(3, 25));
    const b = run([slick(3), slick(5)], TPB * 25, warding(3, 25));
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });
});

describe("which kinds", () => {
  it("pushes the ordinary creatures the cannon kills", () => {
    for (const k of ["slick", "bulb", "shell", "rind", "dart", "ghost", "echo"] as CreatureKind[]) {
      expect(isPushable(k), k).toBe(true);
    }
  });

  /** The owner's list of exceptions, 25 September 2026, and the bodies that
   * never come down onto the hull the ordinary way. */
  it("keeps out what the owner kept out", () => {
    const out: CreatureKind[] = [
      "meteor",
      "torch",
      "veer",
      "volley",
      "gum",
      "carom",
      "crystal",
      "coil",
      "fence",
      "clasp",
      "moult",
      "limpet",
      "leech",
      "queen",
      "strand",
      "mine",
      "wisp",
      "balloon",
      "gyre",
      "crawler",
    ];
    for (const k of out) expect(isPushable(k), k).toBe(false);
  });

  it("lets a gum through the dome as before", () => {
    const gum: SpawnEntry = { beat: 0, col: 3, kind: "gum", color: null };
    const { events } = run([gum], TPB * 30, warding(3, 30));
    expect(of(events, "shieldPush")).toHaveLength(0);
    expect(of(events, "breach").length).toBeGreaterThan(0);
  });
});
