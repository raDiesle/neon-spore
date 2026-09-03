import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  lidIsHeld,
  lidIsOpen,
  lidOpenMilli,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import type { Creature } from "../src/types.js";

/**
 * THE LID: an armoured eye held open by one hand while the other seat shoots
 * into it.
 *
 * What is worth pinning here is the half a reader of `lid.ts` cannot check by
 * eye — that a shot really does need the plates *fully* apart rather than
 * merely moving, that letting go shuts them, that the seat holding the cord is
 * the pilot and only the pilot, that one hand can only be on one cord, and that
 * a second device walking the same beats arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);
const COL = 3;
const TAUT = CFG.lidTautMilli;

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

const lid = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "lid",
  color,
});

/**
 * The pilot's hand on a cord. `id` is the body — a wave may put three lids on
 * the field, so unlike THE WARDEN's rope the message has to say which one.
 * Ids are dealt out by the simulation from 1, so the first arrival is 1.
 */
const pull = (tick: number, milli: number, id = 1, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  // **Downward**, because that is where the room is. A pull may not carry the
  // handle off the field (`handle-pull.ts`), and a lid two rows down has most
  // of the field under it and half of one either side — so a straight pull
  // across would be cut short by the wall long before it reached taut, and
  // testing against a gesture the field cannot hold would prove nothing.
  command: { kind: "drag", target: "lidString", on: true, fromMilli: 0, fromYMilli: milli, id },
});
const letGo = (tick: number, id = 1): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "lidString", on: false, fromMilli: 0, fromYMilli: 0, id },
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

/** One aimed shot: the cannon slides immediately and the shot leaves on the
 * same tick, so a column and a colour is the whole attempt. */
function shot(tick: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return [aim(tick, col), fire(tick, color)];
}

const only = (world: Run["world"]): Creature => world.creatures[0]!;
const rejects = (events: SimEvent[]): SimEvent[] => events.filter((e) => e.type === "reject");

describe("the hand on the cord", () => {
  it("arrives with no hand on it, so the plates are shut", () => {
    const { world } = run([lid(COL)], TPB + 1);
    expect(lidIsHeld(only(world))).toBe(false);
    expect(lidOpenMilli(CFG, only(world))).toBe(0);
    expect(lidIsOpen(CFG, only(world))).toBe(false);
  });

  it("parts them in proportion to the pull, and only counts as open at the end", () => {
    const half = run([lid(COL)], TPB * 2, [pull(TPB, Math.round(TAUT / 2))]);
    expect(lidOpenMilli(CFG, only(half.world))).toBe(500);
    expect(lidIsOpen(CFG, only(half.world))).toBe(false);

    const full = run([lid(COL)], TPB * 2, [pull(TPB, TAUT)]);
    expect(lidOpenMilli(CFG, only(full.world))).toBe(1000);
    expect(lidIsOpen(CFG, only(full.world))).toBe(true);
  });

  /**
   * The length is what counts, and never one axis of it. Three pulls of
   * exactly `lidTautMilli`: straight down, which the field has room for from a
   * lid near the top; a 3-4-5 diagonal, which it also has room for; and
   * straight up, which it does not — and the third one is the boundary doing
   * its job rather than a failure.
   */
  it("takes the length of the pull, whichever way it goes", () => {
    const down = run([lid(COL)], TPB * 2, [pull(TPB, TAUT)]);
    expect(lidIsOpen(CFG, only(down.world))).toBe(true);

    const diagonal = run([lid(COL)], TPB * 2, [
      {
        tick: TPB,
        player: 1,
        command: {
          kind: "drag",
          target: "lidString",
          on: true,
          fromMilli: Math.round(TAUT * 0.6),
          fromYMilli: Math.round(TAUT * 0.8),
          id: 1,
        },
      },
    ]);
    expect(lidIsOpen(CFG, only(diagonal.world))).toBe(true);

    // Up, from a body one row down, is a wall a hand's length away.
    const up = run([lid(COL)], TPB * 2, [pull(TPB, -TAUT)]);
    expect(lidIsOpen(CFG, only(up.world))).toBe(false);
  });

  /**
   * The boundary, said as the owner asked for it: the handle stops where its
   * own circle would leave the field, and it stops *there* rather than
   * wherever the finger went on.
   */
  it("keeps the handle on the field, whole, however far the hand goes", () => {
    // Upward from a body one row down, where the ceiling is much nearer than
    // the cord is long: the handle stops with its whole circle still on the
    // field, and it stops *there* rather than wherever the finger went on to.
    const { world } = run([lid(COL)], TPB * 2, [pull(TPB, -99_000)]);
    const body = only(world);
    // The cord hangs `lidCordMilli` under the body's own centre; the field is
    // inset by the handle's own radius, so what is kept on is the whole circle,
    // and by a tile along the top, which is the app's own chrome.
    const rest = body.row * 1000 + 500 + CFG.lidCordMilli;
    const handle = rest + (body.lidPullYMilli ?? 0);
    expect(handle).toBeGreaterThanOrEqual(CFG.handleRadiusMilli + 1000);
    expect(handle).toBeLessThanOrEqual(CFG.rows * 1000 - CFG.handleRadiusMilli);
    // And the wall is what stopped it, not the cord: the hand asked for far
    // more than taut and got less, which no taut clamp alone would give.
    expect(Math.abs(body.lidPullYMilli ?? 0)).toBeLessThan(CFG.lidTautMilli);
    expect(lidIsOpen(CFG, body)).toBe(false);
  });

  it("clamps past taut, so leaning further does not bank anything", () => {
    // A body far enough up that the field has more room below it than the cord
    // is long: what stops this pull is the taut length and not the wall.
    const { world } = run([lid(COL)], TPB * 2, [pull(TPB, TAUT + 1000)]);
    expect(only(world).lidPullYMilli).toBe(TAUT);
    expect(only(world).lidPullMilli).toBe(0);
  });

  it("shuts the instant the hand lifts", () => {
    const { world } = run([lid(COL)], TPB * 3, [pull(TPB, TAUT), letGo(TPB * 2)]);
    expect(lidIsHeld(only(world))).toBe(false);
    expect(lidIsOpen(CFG, only(world))).toBe(false);
  });

  /** The whole reason the cord is on one screen: player 2 carries both
   * colours, so a lid either seat could open is a creature one phone plays. */
  it("is the pilot's alone — player 2's hand does nothing at all", () => {
    const { world } = run([lid(COL)], TPB * 2, [pull(TPB, TAUT, 1, 2)]);
    expect(lidIsHeld(only(world))).toBe(false);
  });

  it("is one hand, so grabbing a second cord lets the first one shut", () => {
    const two = [lid(1, "red"), lid(5, "cyan")];
    const { world } = run(two, TPB * 3, [pull(TPB, TAUT, 1), pull(TPB * 2, TAUT, 2)]);
    const first = world.creatures.find((c) => c.id === 1)!;
    const second = world.creatures.find((c) => c.id === 2)!;
    expect(lidIsHeld(first)).toBe(false);
    expect(lidIsOpen(CFG, second)).toBe(true);
  });

  it("says so once, on the beat it comes open, in the lens's own colour", () => {
    const { events } = run([lid(COL, "cyan")], TPB * 3, [
      pull(TPB, TAUT),
      pull(TPB + 1, TAUT),
      pull(TPB + 2, TAUT),
    ]);
    const opened = events.filter((e) => e.type === "eyeOpen");
    expect(opened).toHaveLength(1);
    expect(opened[0]).toMatchObject({ col: COL, color: "cyan" });
  });
});

describe("what a shot does", () => {
  it("skids off plates that are shut, and is not charged to the colour", () => {
    const { world, events } = run([lid(COL, "red")], TPB * 4, shot(TPB * 2, COL, "red"));
    expect(world.creatures).toHaveLength(1);
    expect(rejects(events)).toHaveLength(1);
    // The ammunition was right and the hand was not there: that is the pair's
    // timing, not player 2's choice (`lidStruck`).
    expect(world.balance.colorMisses).toBe(0);
  });

  it("skids off plates that are only part way, which is the whole creature", () => {
    const inputs = [pull(TPB * 2, TAUT - 1), ...shot(TPB * 2, COL, "red")];
    const { world } = run([lid(COL, "red")], TPB * 4, inputs);
    expect(world.creatures).toHaveLength(1);
  });

  it("lands while they are fully apart, and pays what a lid is worth", () => {
    const inputs = [pull(TPB * 2, TAUT), ...shot(TPB * 2, COL, "red")];
    const { world, events } = run([lid(COL, "red")], TPB * 4, inputs);
    expect(world.creatures).toHaveLength(0);
    expect(events.filter((e) => e.type === "destroy")).toHaveLength(1);
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreLidKill);
  });

  it("counts a wrong colour into a bare lens as an ordinary colour miss", () => {
    const inputs = [pull(TPB * 2, TAUT), ...shot(TPB * 2, COL, "cyan")];
    const { world } = run([lid(COL, "red")], TPB * 4, inputs);
    expect(world.creatures).toHaveLength(1);
    // The lens has been that colour on both screens since it entered the
    // field, so getting it wrong is player 2's and nothing else's.
    expect(world.balance.colorMisses).toBe(1);
  });
});

describe("the lid as an ordinary arrival", () => {
  it("costs the hull exactly what any other missed creature does", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [lid(COL)]);
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("holds its lane and falls a tile a beat like anything else", () => {
    const { world } = run([lid(COL)], TPB * 5);
    expect(only(world).col).toBe(COL);
    expect(only(world).row).toBe(4);
  });
});

describe("two devices", () => {
  it("replays deterministically: pulled open, then shot", () => {
    const replay = record({
      name: "lid held open and killed",
      seed: 0,
      queue: [lid(COL, "cyan")],
      ticks: TPB * 6,
      inputs: [pull(TPB * 2, TAUT), ...shot(TPB * 2, COL, "cyan")],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    // Not a pinned constant — two runs of the same replay in one process is
    // the property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the pull into the fingerprint, so two devices cannot differ", () => {
    const shut = run([lid(COL)], TPB * 3);
    const held = run([lid(COL)], TPB * 3, [pull(TPB, 0)]);
    const open = run([lid(COL)], TPB * 3, [pull(TPB, TAUT)]);
    // A hand resting at its own origin is not the same world as no hand at
    // all, even though the pull is zero in both — which is why the fingerprint
    // carries the hold and the distance as two numbers.
    expect(hashWorld(held.world)).not.toBe(hashWorld(shut.world));
    expect(hashWorld(open.world)).not.toBe(hashWorld(held.world));
  });
});
