import { describe, expect, it } from "bun:test";
import { claspBecomes, claspIsShielded } from "../src/clasp.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { wornKind } from "../src/creature-rules.js";
import { hashWorld } from "../src/hash.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE CLASP, and the one thing about it that is new to this simulation: a
 * creature that stops being the kind it was born.
 *
 * Everything else here has one answer and keeps it. This one is warded and
 * then shot, by two players, in that order — and between the two it changes
 * `kind` under a stable `id`. Three things follow that nothing else in the
 * suite covers, and each has a test below: the transformation itself, the
 * shield's reach up a whole column rather than across one row, and the world
 * fingerprint, which did not carry `kind` until today and would otherwise
 * agree across two devices that disagree about whether a body can be hit.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const clasp = (col: number, color: Color): SpawnEntry => ({ beat: 0, col, kind: "clasp", color });
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});

interface Run {
  world: World;
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

const only = (world: World): Creature => {
  const c = world.creatures[0];
  if (c === undefined) throw new Error("the field is empty");
  return c;
};

describe("the ward opens a clasp instead of turning it away", () => {
  it("leaves it shielded while the shield is in another column", () => {
    const { world } = run([clasp(5, "cyan")], TPB * 3, [shieldTo(10, 2), guard(TPB)]);
    expect(claspIsShielded(only(world))).toBe(true);
  });

  it("opens it when the shield is in its column and the trigger arrives", () => {
    const { world, events } = run([clasp(5, "cyan")], TPB * 3, [shieldTo(10, 5), guard(TPB)]);
    const body = only(world);
    expect(claspIsShielded(body)).toBe(false);
    expect(body.kind).toBe("bulb");
    expect(events.some((e) => e.type === "claspBreak")).toBe(true);
  });

  it("needs the trigger and not merely the shield standing there", () => {
    // Player 2 alone is not enough, and this is the whole coupling: if the
    // column were sufficient, the player who moves the shield is also the
    // player who fires, and one person would own the creature end to end.
    const { world } = run([clasp(5, "cyan")], TPB * 3, [shieldTo(10, 5)]);
    expect(claspIsShielded(only(world))).toBe(true);
  });

  it("opens one standing anywhere on the field, not only at the shield's row", () => {
    // The shield is a column, not a plate. `resolveHull` asks its question on
    // one row because a rock has to arrive before it can be turned; a clasp is
    // opened where it stands, three rows down and nowhere near the ship.
    const { world } = run([clasp(5, "red")], TPB * 3, [shieldTo(10, 5), guard(TPB * 2)]);
    const body = only(world);
    expect(body.row).toBeLessThan(4);
    expect(body.kind).toBe("slick");
  });
});

describe("what a clasp becomes", () => {
  it("is the body its colour has always named", () => {
    expect(claspBecomes({ color: "red" } as Creature)).toBe("slick");
    expect(claspBecomes({ color: "cyan" } as Creature)).toBe("bulb");
  });

  it("is what it was already being drawn as, before the ward landed", () => {
    // The transformation must cost no pixels: `wornKind` answers the same body
    // on both sides of the break, so what the pair were looking at and what
    // they are left with are one creature and not two.
    const { world } = run([clasp(5, "cyan")], TPB, []);
    const before = wornKind(only(world));
    const { world: after } = run([clasp(5, "cyan")], TPB * 3, [shieldTo(10, 5), guard(TPB)]);
    expect(before).toBe("bulb");
    expect(wornKind(only(after))).toBe(before);
  });

  it("keeps its id, its column and its colour across the change", () => {
    const { world: before } = run([clasp(5, "red")], TPB, []);
    const { world: after } = run([clasp(5, "red")], TPB * 2, [shieldTo(10, 5), guard(TPB)]);
    expect(only(after).id).toBe(only(before).id);
    expect(only(after).col).toBe(5);
    expect(only(after).color).toBe("red");
  });
});

describe("a shot at a clasp", () => {
  it("bounces off the shield whatever colour it carried", () => {
    // Not a colour miss: the ammunition may have been exactly right and the
    // shield simply still on. Charging it to the colour balance would read the
    // failure to player 2, whose choice was not the thing that went wrong.
    // Fired late enough that the bolt and the body actually meet: the clasp
    // has to still be on the field when the shot arrives, or this would pass
    // for the wrong reason.
    const { world, events } = run([clasp(5, "cyan")], TPB * 10, [aim(5, 5), fire(TPB * 4, "cyan")]);
    expect(claspIsShielded(only(world))).toBe(true);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.balance.colorMisses).toBe(0);
  });

  it("kills the body once the ward has opened it, in the matching colour", () => {
    const { world, events } = run([clasp(5, "cyan")], TPB * 5, [
      shieldTo(10, 5),
      guard(TPB),
      aim(TPB + 5, 5),
      fire(TPB + 10, "cyan"),
    ]);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(world.creatures).toHaveLength(0);
  });
});

describe("the world fingerprint", () => {
  it("separates a clasp from the body it turns into", () => {
    // The reason `hash.ts` carries `c.kind` at all. Two worlds identical in
    // every other field — same id, row, column, colour — must not agree, or
    // the desync ledger is blind to exactly the state this creature adds.
    const shielded = run([clasp(5, "cyan")], TPB * 2, []).world;
    const opened = run([clasp(5, "cyan")], TPB * 2, [shieldTo(10, 5), guard(TPB)]).world;
    expect(only(shielded).row).toBe(only(opened).row);
    expect(hashWorld(shielded)).not.toBe(hashWorld(opened));
  });
});
