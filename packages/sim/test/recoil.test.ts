import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  recoilBouncesLeft,
  recoilRow,
  recoilTurn,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  wornKind,
} from "../src/index.js";
import { recoilStruck } from "../src/recoil.js";
import type { Bullet, Creature } from "../src/types.js";

/**
 * THE RECOIL: a body a landed shot sends the wrong way. What is worth pinning
 * here is the half a reader of `recoil.ts` cannot check by eye — that it takes
 * exactly `recoilBounces + 1` shots and never one fewer, that each of them
 * really does move it two rows *up* and one column sideways and turn its
 * colour over, that the sideways roll comes off the world's own stream rather
 * than off anything a wave could plan, that a lance is stopped by a cage, and
 * that a second device walking the same beats arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);
const COL = 3;

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function fresh(queue: SpawnEntry[], seed = 0): Run {
  return { world: createWorld({ ...CFG }, seed, queue), events: [] };
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

/** A recoil of the authored colour, which is the body it is drawn as *first*. */
const recoil = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "recoil",
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

/** One aimed shot, at a tick: the cannon slides immediately and the shot
 * leaves on the same tick, so a column and a colour is the whole attempt. */
function shot(tick: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return [aim(tick, col), fire(tick, color)];
}

const only = (world: Run["world"]): Creature => world.creatures[0]!;
const bounces = (events: SimEvent[]): Extract<SimEvent, { type: "recoilBounce" }>[] =>
  events.filter((e): e is Extract<SimEvent, { type: "recoilBounce" }> => e.type === "recoilBounce");

/**
 * The whole arrival, taken one shot at a time by chasing it.
 *
 * A fixed column will not do for this creature and that is the point of it:
 * the body is somewhere else after every hit, so a test that fired up one lane
 * would be testing a miss. This is what the pair has to do — look at where it
 * landed, put the cannon there, load the colour it has *become* — written out
 * once so each test below can say only how many times it was done.
 *
 * Two beats a shot: one for the bolt to cross the field, one for the body to
 * stand on the row the bounce left it in. That is also about what a pair takes
 * to say a column and a colour to each other (docs/spec/latency.md), so the
 * run below is roughly the run a pair playing well would have.
 */
function chase(r: Run, shots: number): void {
  const tick = (cmds: TimedCommand[]): void => {
    step(r.world, cmds);
    r.events.push(...r.world.events);
  };
  // Let it arrive and stand on a row a bolt can reach.
  for (let t = 0; t < TPB * 2; t++) tick([]);
  for (let i = 0; i < shots; i++) {
    const body = r.world.creatures[0];
    if (!body || body.color === null) return;
    const at = shot(0, body.col, body.color);
    for (let t = 0; t < TPB * 2; t++) tick(t === 0 ? at : []);
  }
}

describe("the bounces it arrives with", () => {
  it("wears recoilBounces of them, and nothing else wears any", () => {
    const { world } = run([recoil(COL)], TPB + 1);
    expect(recoilBouncesLeft(only(world))).toBe(CFG.recoilBounces);
    // A body that was never caged reads as no bounces rather than as
    // undefined — absent and zero are one state (`recoil.ts`).
    expect(recoilBouncesLeft({ kind: "slick" } as Creature)).toBe(0);
  });

  it("is the slick or the bulb its current colour names, and turns over on a hit", () => {
    expect(wornKind(only(run([recoil(COL, "red")], TPB + 1).world))).toBe("slick");
    expect(wornKind(only(run([recoil(COL, "cyan")], TPB + 1).world))).toBe("bulb");
    // The whole creature in one assertion: a red recoil that has been hit once
    // is a cyan one, so the body the pair is looking at is a different body.
    const { world } = run([recoil(COL, "red")], TPB * 4, shot(TPB * 2, COL, "red"));
    expect(only(world).color).toBe("cyan");
    expect(wornKind(only(world))).toBe("bulb");
  });
});

describe("what a shot does", () => {
  it("throws it back up the field instead of killing it, and says so", () => {
    const { world, events } = run([recoil(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    expect(world.creatures).toHaveLength(1);
    expect(recoilBouncesLeft(only(world))).toBe(CFG.recoilBounces - 1);
    const bounced = bounces(events);
    expect(bounced).toHaveLength(1);
    expect(bounced[0]!.left).toBe(CFG.recoilBounces - 1);
    // The colour on the event is what it has *become*, which is what the pair
    // now has to load — `veilMorph`'s rule (`events-creature.ts`).
    expect(bounced[0]!.color).toBe("cyan");
    expect(bounced[0]!.toRow).toBe(recoilRow(CFG, bounced[0]!.row));
    // Not a kill, and the event that means one was never pushed — the eye and
    // the ear both have to be able to tell "still coming" from "gone".
    expect(events.filter((e) => e.type === "destroy")).toHaveLength(0);
  });

  it("moves it exactly recoilRows up and one column to a side", () => {
    // Struck at beat 5 rather than beat 2, so the body is well clear of the
    // top of the field and the clamp in `recoilRow` is not what is being read.
    const { world, events } = run([recoil(COL)], TPB * 7, shot(TPB * 5, COL, "red"));
    const bounced = bounces(events)[0]!;
    expect(bounced.row).toBeGreaterThan(CFG.recoilRows);
    expect(bounced.toRow).toBe(bounced.row - CFG.recoilRows);
    expect(Math.abs(bounced.toCol - bounced.col)).toBe(1);
    // And the body really is where the event said, rather than the event being
    // a description of something that did not happen.
    expect(only(world).col).toBe(bounced.toCol);
  });

  /** The whole creature, as a number: three more shots than the pair expects. */
  it("needs exactly recoilBounces + 1 of them, and is still there one short", () => {
    const short = fresh([recoil(COL)]);
    chase(short, CFG.recoilBounces);
    expect(short.world.creatures).toHaveLength(1);
    expect(recoilBouncesLeft(only(short.world))).toBe(0);

    const enough = fresh([recoil(COL)]);
    chase(enough, CFG.recoilBounces + 1);
    expect(enough.world.creatures).toHaveLength(0);
    expect(bounces(enough.events)).toHaveLength(CFG.recoilBounces);
    expect(enough.events.filter((e) => e.type === "destroy")).toHaveLength(1);
  });

  it("pays for each bounce, and for the body what a slick pays", () => {
    const bounced = fresh([recoil(COL)]);
    chase(bounced, CFG.recoilBounces);
    expect(bounced.world.score).toBe(CFG.scoreRecoilBounce * CFG.recoilBounces);

    // And the whole arrival against an ordinary one taken in one shot, which
    // is the comparison that matters: everything else about the two runs — the
    // kill, the wave cleared behind it — is the same, so the difference is
    // exactly what the bounces were worth.
    const killed = fresh([recoil(COL)]);
    chase(killed, CFG.recoilBounces + 1);
    const plain: SpawnEntry = { beat: 0, col: COL, kind: "slick", color: "red" };
    const slick = fresh([plain]);
    chase(slick, 1);
    expect(killed.world.score - slick.world.score).toBe(CFG.scoreRecoilBounce * CFG.recoilBounces);
  });

  it("counts a wrong colour as an ordinary colour miss and keeps every bounce", () => {
    const { world } = run([recoil(COL, "red")], TPB * 4, shot(TPB * 2, COL, "cyan"));
    expect(world.balance.colorMisses).toBe(1);
    expect(world.creatures).toHaveLength(1);
    expect(recoilBouncesLeft(only(world))).toBe(CFG.recoilBounces);
    // It did not move either, which is what makes a miss a miss.
    expect(only(world).color).toBe("red");
  });

  /**
   * A lance is a line up a column, and a recoil is a body that would otherwise
   * be knocked into that line three times over for one press. The cage stops
   * it; only the kill at the end passes it on, exactly as an ordinary body's
   * does and exactly as `rindStruck` does for its own layers.
   */
  it("stops a lance on a bounce and passes it on only at the kill", () => {
    const world = createWorld({ ...CFG }, 0, [recoil(COL)]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    const body = only(world);
    const lance = (color: "red" | "cyan"): Bullet => ({
      id: 1,
      col: body.col,
      row: 0,
      subMilli: 0,
      color,
      lance: true,
      pierced: 0,
    });
    for (let i = 0; i < CFG.recoilBounces; i++) {
      // The colour it is *now*: a lance loaded with the one it had a bounce
      // ago would be a colour miss, which is the creature working.
      expect(recoilStruck(world, lance(body.color ?? "red"), body)).toBe(false);
    }
    expect(recoilStruck(world, lance(body.color ?? "red"), body)).toBe(true);
    expect(world.creatures).toHaveLength(0);
  });
});

describe("the side it is knocked into", () => {
  /**
   * The one thing about this creature nobody may plan against. Two worlds on
   * different seeds have to be able to send it opposite ways — otherwise the
   * "roll" is an authored constant and the pair learns it in three arrivals.
   */
  it("comes off the world's own stream, so two seeds can differ", () => {
    const sides = new Set<number>();
    for (let seed = 0; seed < 24; seed++) {
      const r = fresh([recoil(COL)], seed);
      chase(r, 1);
      const body = r.world.creatures[0];
      expect(body, `seed ${seed}`).toBeDefined();
      sides.add(body!.col - COL);
    }
    expect(sides).toEqual(new Set([-1, 1]));
  });

  it("never leaves the field, however hard it is knocked at a wall", () => {
    for (const col of [0, CFG.cols - 1]) {
      const r = fresh([recoil(col)]);
      chase(r, CFG.recoilBounces);
      const body = r.world.creatures[0];
      expect(body, `a recoil in column ${col}`).toBeDefined();
      expect(body!.col).toBeGreaterThanOrEqual(0);
      expect(body!.col).toBeLessThan(CFG.cols);
    }
  });

  /**
   * And it always *goes* somewhere. A roll into the wall used to be clamped
   * back onto the lane it was struck in, so a body against the edge stayed put
   * on about half its bounces — and a bounce that moves nothing is the one
   * outcome this creature cannot have: the whole cost of it is that the column
   * the pair just agreed is now wrong.
   */
  it("takes the other side when the rolled one is a wall, so it never stays put", () => {
    for (const col of [0, CFG.cols - 1]) {
      for (let seed = 0; seed < 8; seed++) {
        const r = fresh([recoil(col)], seed);
        chase(r, 1);
        const moved = bounces(r.events)[0]!;
        expect(moved.toCol, `column ${col}, seed ${seed}`).not.toBe(moved.col);
        expect(Math.abs(moved.toCol - moved.col)).toBe(1);
      }
    }
  });

  /** A body struck in the top rows has nowhere left to be pushed, and comes to
   * rest on row zero rather than off the top of the world. */
  it("clamps to the top row rather than leaving the field upwards", () => {
    expect(recoilRow(CFG, 1)).toBe(0);
    expect(recoilRow(CFG, 0)).toBe(0);
    expect(recoilRow(CFG, 5)).toBe(5 - CFG.recoilRows);
  });
});

describe("the colour turning over", () => {
  /**
   * The crossing render draws the body between two colours on, and the reason
   * it is a rule here rather than a comparison written at the draw site: a
   * second spelling of "this body is turning" is how the picture and the shot
   * come to disagree about what the pair must load next.
   */
  it("runs from the hit to the landing, and is over for every other body", () => {
    // Taken on the frame the bounce happened rather than through `chase`,
    // which leaves two whole beats behind it — the crossing is over inside the
    // beat it started, which is the second half of what this pins.
    const world = createWorld({ ...CFG }, 0, [recoil(COL)]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    const body = only(world);
    recoilStruck(
      world,
      { id: 1, col: body.col, row: body.row, subMilli: 0, color: "red", lance: false, pierced: 0 },
      body,
    );
    // Mid-glide out of the lane it was struck in — the same two fields the
    // knock-back itself is drawn between.
    expect(recoilTurn(body, 0)).toBe(0);
    expect(recoilTurn(body, 0.5)).toBe(0.5);
    expect(recoilTurn(body, 1)).toBe(1);
    // A body standing where it has always stood is not turning, and neither is
    // anything that is not a recoil at all.
    expect(recoilTurn({ ...body, fromCol: body.col }, 0.5)).toBe(1);
    expect(recoilTurn({ ...body, kind: "slick" }, 0.5)).toBe(1);
  });

  it("is settled again on the beat after the bounce", () => {
    const r = fresh([recoil(COL)]);
    chase(r, 1);
    // `chase` leaves a whole beat between shots, so the beat loop has already
    // reseeded `fromCol` and there is nothing left to cross.
    expect(recoilTurn(only(r.world), 0.5)).toBe(1);
  });
});

describe("the recoil as an ordinary arrival", () => {
  it("costs the hull exactly what any other missed creature does", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [recoil(COL)]);
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("holds its lane and falls a tile a beat while nobody shoots it", () => {
    const { world } = run([recoil(COL)], TPB * 5);
    expect(only(world).col).toBe(COL);
    expect(only(world).row).toBe(4);
  });
});

describe("two devices", () => {
  it("replays deterministically: bounced, chased and killed", () => {
    // Fired up the two lanes either side of the one it entered, a beat apart,
    // so at least one shot lands wherever the roll sent it — a replay that
    // depended on knowing the side would be a replay of a different creature.
    const inputs = [3, 4, 5, 6].flatMap((beat) =>
      shot(TPB * beat, COL + (beat % 2 === 0 ? 1 : -1), beat < 5 ? "cyan" : "red"),
    );
    const replay = record({
      name: "recoil bounced and chased",
      seed: 4,
      queue: [recoil(COL, "red")],
      ticks: TPB * 10,
      inputs,
    });
    const world = runReplay(replay);
    expect(world.beat).toBeGreaterThan(0);
    // Not a pinned constant — two runs of the same replay in one process is
    // the property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the bounces into the fingerprint, so two devices cannot differ", () => {
    const whole = run([recoil(COL)], TPB * 4);
    const hit = run([recoil(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    expect(hashWorld(hit.world)).not.toBe(hashWorld(whole.world));
  });
});
