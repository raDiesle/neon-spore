import { describe, expect, it } from "bun:test";
import { resolve } from "../src/bullet-hit.js";
import { caromHeading, caromStruck } from "../src/carom.js";
import {
  chuteIsOpen,
  createWorld,
  DEFAULT_CONFIG,
  guardArmed,
  hashWorld,
  hullPercent,
  hullRow,
  isGrippable,
  isMeteorKind,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  spanOf,
  step,
  type TimedCommand,
  ticksPerBeat,
  wornKind,
} from "../src/index.js";
import type { Bullet, Creature } from "../src/types.js";

/**
 * THE CAROM: a slick or a bulb sealed in a rock crust, crossing the field on a
 * diagonal and turning at the walls. What is worth pinning here is the half a
 * reader of `carom.ts` cannot check by eye — that it really does touch two
 * walls before it lands whatever column a wave enters it in, that the shield
 * is worth nothing against a whole one and everything against a cracked one,
 * that the width survives the change of kind, and that a second device walking
 * the same beats arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Every column a carom can be authored into, its whole span on the field. */
const COLS = Array.from({ length: CFG.cols - 1 }, (_, i) => i);

const carom = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "carom",
  color,
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
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shield = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = [], cfg = CFG): Run {
  const world = createWorld({ ...cfg }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: Run["world"]): Creature | undefined => world.creatures[0];
const bounces = (events: SimEvent[]): Extract<SimEvent, { type: "caromBounce" }>[] =>
  events.filter((e): e is Extract<SimEvent, { type: "caromBounce" }> => e.type === "caromBounce");
const cracks = (events: SimEvent[]): Extract<SimEvent, { type: "caromCrack" }>[] =>
  events.filter((e): e is Extract<SimEvent, { type: "caromCrack" }> => e.type === "caromCrack");

/**
 * The tick a carom entered at beat 0 is standing on a given row. It drops
 * `caromRows` a beat and lands on beat `row / caromRows`, one beat behind the
 * arrival — `rules.test.ts` has the general form of that offset.
 */
function tickAtRow(row: number): number {
  return TPB * (row / CFG.caromRows + 1);
}

describe("the crossing", () => {
  it("drops caromRows and crosses caromCols on every beat it is not at a wall", () => {
    const { world } = run([carom(0)], tickAtRow(CFG.caromRows * 2) + 1);
    const body = only(world)!;
    expect(body.row).toBe(CFG.caromRows * 2);
    expect(body.col).toBe(CFG.caromCols * 2);
    expect(caromHeading(body)).toBe(1);
  });

  it("sets off away from the nearer wall, so the first crossing is the long one", () => {
    // Two columns wide, so the walls it turns at are 0 and `cols - 2`.
    const hi = CFG.cols - 2;
    expect(caromHeading(only(run([carom(0)], TPB + 1).world)!)).toBe(1);
    expect(caromHeading(only(run([carom(hi)], TPB + 1).world)!)).toBe(-1);
  });

  /**
   * The number `caromCols` was chosen for, and the only claim in this file
   * that is about the *creature* rather than about a rule. Two walls from
   * every column a wave can author it into: fewer would be a body that crossed
   * the field once, which is a dart with a longer stride.
   */
  it("touches at least two walls before it reaches the ship, from every column", () => {
    for (const col of COLS) {
      const { events } = run([carom(col)], tickAtRow(HULL) + 1);
      expect(bounces(events).length, `a carom entered in column ${col}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("never leaves the field, and turns on the wall rather than short of it", () => {
    const hi = CFG.cols - 2;
    for (const col of COLS) {
      const { world, events } = run([carom(col)], tickAtRow(HULL - CFG.caromRows) + 1);
      const body = only(world)!;
      expect(body.col, `column ${col}`).toBeGreaterThanOrEqual(0);
      expect(body.col + spanOf(body), `column ${col}`).toBeLessThanOrEqual(CFG.cols);
      for (const b of bounces(events)) expect([0, hi]).toContain(b.col);
    }
  });

  it("reaches the ship in the beats the config says, and is a whole body all the way", () => {
    const beats = HULL / CFG.caromRows;
    const short = run([carom(0)], tickAtRow(HULL) - 1);
    expect(only(short.world)?.kind).toBe("carom");
    // Fourteen: the owner played it at seven and could not be under it, so the
    // drop halved and the stride came down with it (`config-carom.ts`).
    expect(beats).toBe(14);
  });

  /** A hand is worth nothing against a body with no rate to scale — the dart's
   * refusal, and the rock it becomes is grippable again the instant it is one. */
  it("refuses a hand while it is crossing and takes one once it is a rock", () => {
    expect(isGrippable("carom")).toBe(false);
    expect(isGrippable("meteor")).toBe(true);
  });
});

/**
 * A bolt already at the body's row, so the shot is a colour and nothing else.
 *
 * Deliberately not fired up a column and waited for: a carom is four lanes
 * away by the time a bolt has crossed the field, which is the whole creature
 * and exactly what makes it the wrong instrument for pinning what a *hit*
 * does. `recoilStruck` is tested the same way and for the same reason.
 */
function bolt(body: Creature, color: "red" | "cyan"): Bullet {
  return { id: 1, col: body.col, row: body.row, subMilli: 0, color, lance: false, pierced: 0 };
}

/** A carom standing on a row, and the world it is standing in. */
function standing(
  row: number,
  color: "red" | "cyan" = "red",
): { world: Run["world"]; body: Creature } {
  const world = createWorld({ ...CFG }, 0, [carom(0, color)]);
  for (let t = 0; t < tickAtRow(row) + 1; t++) step(world, []);
  return { world, body: world.creatures[0]! };
}

describe("what a shot does", () => {
  it("turns it into a rock instead of killing it, and says so", () => {
    const { world, body } = standing(4);
    expect(caromStruck(world, bolt(body, "red"), body)).toBe(false);
    expect(isMeteorKind(body.kind)).toBe(true);
    expect(body.color).toBeNull();
    expect(cracks(world.events)).toHaveLength(1);
    // Not a kill, and the event that means one was never pushed — the ear and
    // the eye both have to be able to tell "gone" from "now it is the shield's".
    expect(world.events.filter((e) => e.type === "destroy")).toHaveLength(0);
    // One arrival became two problems: the rock, and the body thrown out of it.
    expect(world.creatures).toHaveLength(2);
    expect(world.creatures.map((c) => c.kind).sort()).toEqual(["chute", "meteor"]);
  });

  it("keeps its width, so the shield covers what the pair has been watching", () => {
    const { world, body } = standing(4);
    expect(spanOf(body)).toBe(2);
    caromStruck(world, bolt(body, "red"), body);
    expect(spanOf(body)).toBe(2);
    expect(cracks(world.events)[0]!.span).toBe(2);
  });

  it("falls a tile a beat once the crust is off, not caromRows", () => {
    const { world, body } = standing(4);
    caromStruck(world, bolt(body, "red"), body);
    const row = body.row;
    const col = body.col;
    for (let t = 0; t < TPB; t++) step(world, []);
    expect(body.row - row).toBe(1);
    // And it has stopped crossing: a rock holds the lane it was cracked in.
    expect(body.col).toBe(col);
  });

  it("counts a wrong colour as an ordinary colour miss and leaves the crust on", () => {
    const { world, body } = standing(4, "red");
    expect(caromStruck(world, bolt(body, "cyan"), body)).toBe(false);
    expect(world.balance.colorMisses).toBe(1);
    expect(body.kind).toBe("carom");
    expect(body.color).toBe("red");
  });

  it("is drawn as the slick or the bulb its colour names", () => {
    expect(wornKind(only(run([carom(0, "red")], TPB + 1).world)!)).toBe("slick");
    expect(wornKind(only(run([carom(0, "cyan")], TPB + 1).world)!)).toBe("bulb");
  });
});

describe("the two controls, in order", () => {
  const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };

  /**
   * The whole creature as a number. A shield held over a carom the pair never
   * shot answers nothing at all — the body is not a rock, so `resolveHull`
   * never offers it the shield's row — and it costs `damageCarom` rather than
   * `damageCreature`, because what arrived was the rock it always was.
   */
  it("cannot be warded while the crust is on, and costs a rock's damage", () => {
    const impact = tickAtRow(HULL) + 1;
    // The shield in every column and the trigger held down the whole way, so
    // the failure cannot be blamed on timing or on aim.
    const inputs: TimedCommand[] = [];
    for (let beat = 0; beat <= HULL / CFG.caromRows; beat++) {
      for (let col = 0; col < CFG.cols; col++) inputs.push(shield(TPB * beat, col));
      inputs.push(guard(TPB * beat));
    }
    const { world } = run([carom(0)], impact, inputs, noRegen);
    expect(guardArmed(world)).toBe(true);
    expect(world.guard.tries).toBe(0);
    expect(hullPercent(world)).toBe(100 - CFG.damageCarom);
  });

  it("is warded like any other rock once it has been cracked", () => {
    const world = createWorld({ ...noRegen }, 0, [carom(0)]);
    for (let t = 0; t < tickAtRow(4) + 1; t++) step(world, []);
    const body = world.creatures[0]!;
    caromStruck(world, bolt(body, "red"), body);
    const lane = body.col;
    // From here the shield sits on the lane the rock was left in and the
    // trigger is pressed on every beat — the pair doing their second half.
    for (let t = 0; t < TPB * (HULL + 2); t++) {
      const cmds: TimedCommand[] =
        t % TPB === 0
          ? [
              { tick: t, player: 2, command: { kind: "shieldCol", col: lane } },
              { tick: t, player: 1, command: { kind: "guard" } },
            ]
          : [];
      step(world, cmds);
    }
    expect(world.guard.deflected).toBe(1);
    // The rock is gone and the body it came out of is not: the shield answered
    // its half, and the cannon still owes the other one.
    expect(world.creatures.map((c) => c.kind)).toEqual(["chute"]);
    expect(hullPercent(world)).toBe(100);
    // Both halves paid: the crack and the deflection, which is the arithmetic
    // saying that one arrival took two controls.
    expect(world.score).toBeGreaterThanOrEqual(CFG.scoreCaromCrack + CFG.scoreDeflect);
  });
});

describe("the body it throws out", () => {
  /** The chute a crack leaves behind, and the world it is climbing in. */
  function ejected(row = 6): { world: Run["world"]; chute: Creature } {
    const { world, body } = standing(row);
    caromStruck(world, bolt(body, "red"), body);
    const chute = world.creatures.find((c) => c.kind === "chute");
    expect(chute).toBeDefined();
    return { world, chute: chute! };
  }

  it("comes out of the hatch on the tile the shot met, in the body's colour", () => {
    const { world, chute } = ejected(6);
    expect(chute.row).toBe(6);
    expect(chute.color).toBe("red");
    expect(wornKind(chute)).toBe("slick");
    expect(chuteIsOpen(chute)).toBe(false);
    const thrown = world.events.filter((e) => e.type === "caromEject");
    expect(thrown).toHaveLength(1);
    // The event names the body, not the tile: it is travelling, and the
    // picture has to follow it (`events-creature.ts`).
    expect(thrown[0] && "id" in thrown[0] && thrown[0].id).toBe(chute.id);
  });

  /** The only thing in this game that goes up. */
  it("climbs chuteRiseRows a beat until it reaches the top, then opens", () => {
    const { world, chute } = ejected(6);
    // Exactly as far as the climb takes from row six: four rows, then the two
    // that are left. A beat further and it would already be coming down.
    const rows: number[] = [];
    for (let t = 0; t < TPB * 2; t++) {
      step(world, []);
      if ((t + 1) % TPB === 0) rows.push(chute.row);
    }
    // Up on the first beat and up again on the second, rather than drifting.
    expect(rows[0]).toBe(6 - CFG.chuteRiseRows);
    expect(chute.row).toBe(0);
    expect(chuteIsOpen(chute)).toBe(true);
    // Clamped at the top rather than allowed past it, so the frame the canopy
    // opens in is one both players are looking at.
    for (const row of rows) expect(row).toBeGreaterThanOrEqual(0);
  });

  it("says so on the beat the canopy opens, once and not again", () => {
    const { world, chute } = ejected(6);
    const opens: number[] = [];
    for (let t = 0; t < TPB * 10; t++) {
      step(world, []);
      opens.push(...world.events.filter((e) => e.type === "chuteOpen").map(() => world.beat));
    }
    expect(opens).toHaveLength(1);
    expect(chuteIsOpen(chute)).toBe(true);
  });

  it("comes back down a row every chuteFallBeats, which is slower than a slick", () => {
    const { world, chute } = ejected(6);
    // Up to the top and open first.
    for (let t = 0; t < TPB * 4; t++) step(world, []);
    const from = chute.row;
    for (let t = 0; t < TPB * CFG.chuteFallBeats * 2; t++) step(world, []);
    expect(chute.row - from).toBe(2);
  });

  it("is killed by the matching colour exactly the way a slick is", () => {
    const { world, chute } = ejected(6);
    for (let t = 0; t < TPB * 4; t++) step(world, []);
    const before = world.score;
    const b: Bullet = {
      id: 2,
      col: chute.col,
      row: chute.row,
      subMilli: 0,
      color: "red",
      lance: false,
      pierced: 0,
    };
    expect(resolve(world, b, chute)).toBe(false);
    expect(world.creatures.some((c) => c.kind === "chute")).toBe(false);
    expect(world.score - before).toBe(CFG.scoreDestroy);
  });

  /**
   * The owner's ask: shot under the canopy, *the paraglider should be released
   * from the enemy and vanish upward, and the enemy falls a little and then
   * vanishes as well.* The rule does not change — a chute costs and scores
   * what a slick does — so what the branch buys is one extra event carrying
   * the picture, exactly as `ghostRelease` rides on top of a ghost's kill.
   */
  it("cuts the canopy loose beside the ordinary destroy when it is shot under it", () => {
    const { world, chute } = ejected(6);
    for (let t = 0; t < TPB * 4; t++) step(world, []);
    expect(chuteIsOpen(chute)).toBe(true);
    world.events.length = 0;
    resolve(world, bolt(chute, "red"), chute);

    const cut = world.events.filter((e) => e.type === "chuteCut");
    expect(cut).toHaveLength(1);
    // It names the body that was hanging there, so the picture draws a slick
    // rather than a coloured disc (`render/chute-cut.ts`).
    expect(cut[0] && "kind" in cut[0] && cut[0].kind).toBe("slick");
    expect(cut[0] && "color" in cut[0] && cut[0].color).toBe("red");
    // Beside the kill, never in place of it: the burst, the sound and the
    // balance are a slick's.
    expect(world.events.filter((e) => e.type === "destroy")).toHaveLength(1);
  });

  it("cuts nothing off one still climbing — there is no canopy out yet", () => {
    const { world, chute } = ejected(6);
    expect(chuteIsOpen(chute)).toBe(false);
    world.events.length = 0;
    resolve(world, bolt(chute, "red"), chute);
    expect(world.events.filter((e) => e.type === "chuteCut")).toHaveLength(0);
    expect(world.events.filter((e) => e.type === "destroy")).toHaveLength(1);
  });

  it("answers a wrong colour under the canopy as an ordinary colour miss", () => {
    const { world, chute } = ejected(6);
    for (let t = 0; t < TPB * 4; t++) step(world, []);
    world.events.length = 0;
    expect(resolve(world, bolt(chute, "cyan"), chute)).toBe(false);
    expect(world.events.filter((e) => e.type === "reject")).toHaveLength(1);
    expect(world.events.filter((e) => e.type === "chuteCut")).toHaveLength(0);
    expect(world.creatures.some((c) => c.kind === "chute")).toBe(true);
  });

  it("refuses a hand, for the dart's reason: it has no rate to scale", () => {
    expect(isGrippable("chute")).toBe(false);
  });
});

describe("two devices", () => {
  it("replays deterministically: crossed, bounced, cracked and warded", () => {
    const at = tickAtRow(6);
    const replay = record({
      name: "carom cracked and warded",
      seed: 4,
      queue: [carom(0, "red"), carom(6, "cyan")],
      ticks: TPB * 14,
      inputs: [
        // Fired up several lanes across two beats, so at least one meets a
        // body wherever the diagonal has taken it, then the shield walked
        // across with the trigger down.
        ...[0, 3, 6, 9].flatMap((col, i) => [
          aim(at + i, col),
          fire(at + i, i % 2 ? "cyan" : "red"),
        ]),
        ...[0, 3, 6, 9].map((col, i) => shield(at + TPB * (i + 1), col)),
        ...[1, 2, 3, 4].map((i) => guard(at + TPB * i)),
      ],
    });
    const world = runReplay(replay);
    expect(world.beat).toBeGreaterThan(0);
    // Not a pinned constant — two runs of the same replay in one process is
    // the property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the heading into the fingerprint, so two devices cannot differ", () => {
    const left = run([carom(0)], TPB + 1).world;
    const right = run([carom(CFG.cols - 2)], TPB + 1).world;
    expect(hashWorld(left)).not.toBe(hashWorld(right));
  });
});
