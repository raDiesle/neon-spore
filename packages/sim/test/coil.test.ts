import { describe, expect, it } from "bun:test";
import { coilStruck } from "../src/coil.js";
import { coilCharged, coilHeading, coilIsDomed, coilWardReaches } from "../src/coil-state.js";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { spanOf } from "../src/span.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE COIL, and the three things about it that no other creature in this
 * simulation does.
 *
 * It **crosses** rather than falls, and it sinks only at the walls — THE
 * CAROM and THE GHOST cross too, and neither of them turns the crossing into a
 * descent. It is opened by the ward the way a clasp is, and what is left is a
 * rock rather than a body, so the answer changes hands from one use of the
 * shield to another rather than from the shield to the cannon. And opening one
 * **lights another**: the charge jumps, on a clock, and that is the first time
 * anything in this game has made one arrival's answer create work somewhere
 * else on the field.
 *
 * The fingerprint is checked here the way `clasp.test.ts` checks it and for
 * the same reason one step further on: two devices can now disagree about
 * *which* dome a chain picked, and a roll that did not reach `hashWorld` would
 * leave them agreeing about a field they are playing differently.
 */

const CFG = DEFAULT_CONFIG;
/** The chain watched past the first freed rock's landing, which would otherwise stop the field. */
const HULL_HELD = { ...CFG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

const coil = (beat: number, col: number): SpawnEntry => ({
  beat,
  col,
  kind: "coil",
  color: null,
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
interface Run {
  world: World;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = [], cfg = CFG): Run {
  const world = createWorld({ ...cfg }, 7, queue);
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

describe("a coil crosses the field instead of falling", () => {
  it("sets off to the left, whatever column the wave put it in", () => {
    // Deliberately not authored against the left wall: a coil put there turns
    // on its first beat, which is the crossing rule doing its job and not a
    // heading of its own (`crossField`).
    const { world } = run([coil(0, 8)], TPB * 2);
    expect(coilHeading(only(world))).toBe(-1);
  });

  it("takes coilCols lanes a beat and stays on the row it entered", () => {
    const { world } = run([coil(0, 8)], TPB * 3);
    const body = only(world);
    // Two beats of crossing from column 8, at whatever the shipped stride is.
    expect(body.col).toBe(8 - CFG.coilCols * 2);
    expect(body.row).toBe(0);
  });

  it("visits every column on the way, and not every other one", () => {
    // The reason `coilCols` is one (`config-coil.ts`): any wider stride
    // started at a wall of an odd-width field occupies one parity of column
    // and never the other, so half the lanes — the middle one included, which
    // is where the plate rests — could never open a dome at all.
    const seen = new Set<number>();
    const world = createWorld({ ...CFG }, 7, [coil(0, 10)]);
    for (let t = 0; t < TPB * 24; t++) {
      step(world, []);
      for (const c of world.creatures) if (coilIsDomed(c)) seen.add(c.col);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(Array.from({ length: CFG.cols }, (_, k) => k));
  });

  it("turns at the wall and sinks there, and only there", () => {
    // From column 8 at a lane a beat, the ninth beat is the one that lands on
    // the wall — and the sink happens on that beat and on no other.
    const { world } = run([coil(0, 8)], TPB * 10);
    const body = only(world);
    expect(body.col).toBe(0);
    expect(coilHeading(body)).toBe(1);
    expect(body.row).toBe(CFG.coilDropRows);
  });

  it("refuses a shot, whatever colour it carries", () => {
    // The clasp's answer: nothing a bolt carries gets through a dome, and it
    // is not scored as a colour miss — a coil has no colour to have got wrong.
    const { world } = run([coil(0, 4)], TPB + 1);
    const body = only(world);
    world.events.length = 0;
    coilStruck(world, body);
    expect(world.events.map((e) => e.type)).toEqual(["reject"]);
    expect(coilIsDomed(body)).toBe(true);
  });

  it("is not turned away by the shield, so a whole one breaks the hull", () => {
    // It is not a `isWardable`, so `resolveHull` never offers it the shield's
    // row: a plate standing in its column turns nothing, and the *only* thing
    // the shield ever does to a coil is open it — which is why the trigger is
    // deliberately never pressed here. Long enough for the serpentine to work
    // its way down from the top of the field to the ship.
    const { world, events } = run([coil(0, 8)], TPB * 60, [shieldTo(4, 0)]);
    // The breach itself, which is the arrival; the retry it costs is
    // `wave-fail.ts`'s to prove.
    expect(events.some((e) => e.type === "breach")).toBe(true);
    expect(world.creatures).toHaveLength(0);
  });
});

describe("the ward opens a dome and what is left is a torch", () => {
  it("leaves it alone while the shield is in another column", () => {
    const { world } = run([coil(0, 8)], TPB * 3, [shieldTo(4, 2), guard(TPB)]);
    expect(coilIsDomed(only(world))).toBe(true);
  });

  it("opens it wherever it is standing, not only at the shield's row", () => {
    // The shield is a column and not a plate on one row — the clasp's rule,
    // asked of a body that is nowhere near the ship.
    // Stopped one beat after the ward: what is left is a torch at thirteen
    // rows a beat, so a longer run would find the field empty rather than the
    // body opened — which is the creature, not the test.
    const { world, events } = run([coil(0, 8)], TPB * 2 - 1, [shieldTo(4, 8), guard(TPB)]);
    expect(only(world).kind).toBe("torch");
    const broke = events.find((e) => e.type === "coilBreak");
    expect(broke).toBeDefined();
    // Opened at the top of the field, nowhere near the row a rock is warded on.
    expect(broke && "row" in broke ? broke.row : -1).toBeLessThan(hullRow(CFG) - 1);
  });

  it("keeps the one tile it was, rather than the two a torch is", () => {
    // `caromStruck`'s rule: the width is written down before the kind changes,
    // or the shield would have to cover a column that did not exist a tick ago.
    const { world } = run([coil(0, 8)], TPB * 2 - 1, [shieldTo(4, 8), guard(TPB)]);
    expect(spanOf(only(world))).toBe(1);
  });

  it("needs the trigger and not merely the plate standing there", () => {
    const { world } = run([coil(0, 8)], TPB * 3, [shieldTo(4, 8)]);
    expect(coilIsDomed(only(world))).toBe(true);
  });

  it("opens one the plate is carried under while the window is still open", () => {
    // The defect the owner reported, from one side. The ward used to hang off
    // the *press* (`armShield`), so a trigger spent on an empty column and a
    // plate then carried into the coil's did nothing at all until somebody
    // pressed again. It is asked of the open window every tick now, so
    // whichever of the two arrives in the column second is the one that opens
    // it (`wardCoils`).
    const world = createWorld({ ...CFG }, 7, [coil(0, 8)]);
    for (let t = 0; t < TPB * 2; t++) step(world, [shieldTo(t, 0)]);
    const body = only(world);
    const standing = body.col;
    step(world, [guard(world.tick)]);
    expect(coilIsDomed(body)).toBe(true);
    step(world, [shieldTo(world.tick, standing)]);
    expect(coilIsDomed(body)).toBe(false);
  });

  it("opens one that crosses into a column the plate is already holding", () => {
    // The same defect from the other side, and the one a pair actually meets:
    // they agree on a lane, stand in it and trigger, and the dome walks into
    // them. The window outlives a beat (`guardWindowMs` against `bpm`), so the
    // body that steps in is answered on the beat it steps.
    const world = createWorld({ ...CFG }, 7, [coil(0, 8)]);
    for (let t = 0; t < TPB * 2; t++) step(world, []);
    const body = only(world);
    // One lane along its own heading, which is where it will stand next beat.
    const ahead = body.col + coilHeading(body);
    step(world, [shieldTo(world.tick, ahead), guard(world.tick)]);
    expect(coilIsDomed(body)).toBe(true);
    for (let t = 0; t < TPB; t++) step(world, []);
    expect(coilIsDomed(body)).toBe(false);
  });

  it("puts the rock it leaves at the wall furthest from the plate", () => {
    // The price of opening one, and the reason a pair now talks about keeping
    // the shield *out* of a coil's column. The plate that opened the dome is
    // by construction the plate least able to catch what came out of it
    // (`escapeCol`), so the wall is read off the shield and never off the rock.
    const right = run([coil(0, 8)], TPB * 2 - 1, [shieldTo(4, 8), guard(TPB)]);
    expect(only(right.world).col).toBe(0);
    const left = run([coil(0, 2)], TPB * 2 - 1, [shieldTo(4, 2), guard(TPB)]);
    expect(only(left.world).col).toBe(CFG.cols - 1);
  });

  it("is thrown from the dome's tile to the ship at that wall, in one beat", () => {
    // The owner's picture: the rock releases from the exact tile the dome was
    // opened on and flies the diagonal to the far wall's hull. `fromCol` and
    // `fromRow` stay the dome's, so the glide is that line, and it is on the
    // ship's row already — resolved on the next beat line, when it is drawn
    // touching (`hull.ts`).
    const { world } = run([coil(0, 8)], TPB * 2 - 1, [shieldTo(4, 8), guard(TPB)]);
    const body = only(world);
    expect(body.fromCol).not.toBe(body.col);
    expect(body.fromRow).toBeLessThan(hullRow(CFG));
    expect(body.row).toBe(hullRow(CFG));
  });

  it("hits the ship on the beat line after it was opened, and not before", () => {
    const before = run([coil(0, 8)], TPB * 2 - 1, [shieldTo(4, 8), guard(TPB)]);
    expect(before.world.creatures).toHaveLength(1);
    const after = run([coil(0, 8)], TPB * 2 + 1, [shieldTo(4, 8), guard(TPB)]);
    expect(after.world.creatures).toHaveLength(0);
    expect(after.events.some((e) => e.type === "breach" && e.kind === "torch")).toBe(true);
  });
});

describe("the plate has to see the dome to open it", () => {
  /**
   * The owner's rule, in his own words: *"when the cannon vertical tile has
   * not seen the full width of the coil"*. The plate answers a dome by
   * reaching up its own column, and a rock crossing the lane under one takes
   * the whole reach — so the dome is not opened, not lit and not touched, and
   * the pair watches nothing happen. It is what THE COIL's own sentence has
   * said since the day the wave was written: *the one where the trigger waits
   * for the lane above it to clear*.
   *
   * The arrangement is the same in all four: a coil set off from column 8
   * crosses one lane a beat, so it is standing in column 6 on the third beat
   * and nowhere near it on the fourth. The plate is parked there for the whole
   * run and the trigger is held down, which leaves the lane below as the only
   * thing that differs between them.
   */
  const held = (ticks: number): TimedCommand[] => Array.from({ length: ticks }, (_, t) => guard(t));
  /** Long enough to carry the coil into column 6 and out the other side. */
  const PASS = TPB * 4;
  /** The one dome still standing, so a test asserts about a body rather than
   * about `undefined` slipping through a `&&`. */
  const domed = (world: World): Creature => {
    const c = world.creatures.find(coilIsDomed);
    if (c === undefined) throw new Error("no dome is left standing");
    return c;
  };

  it("opens one with nothing under it, which is the run the rest are read against", () => {
    const { events } = run([coil(0, 8)], PASS, [shieldTo(0, 6), ...held(PASS)]);
    expect(events.some((e) => e.type === "coilBreak")).toBe(true);
  });

  it("leaves it alone while a rock is falling in the lane below it", () => {
    const rock: SpawnEntry = { beat: 0, col: 6, kind: "meteor", color: null };
    const { world, events } = run([coil(0, 8), rock], PASS, [shieldTo(0, 6), ...held(PASS)]);
    expect(events.some((e) => e.type === "coilBreak")).toBe(false);
    expect(world.creatures.some(coilIsDomed)).toBe(true);
  });

  it("is stopped by the second column of a two-tile rock as much as by the first", () => {
    // `occupiesCol` and not a column comparison: a rock authored at column 5
    // with a width of two is standing in column 6 as well, and a reach that
    // only ever looked at `col` would go straight through half of every big
    // rock in the game.
    const wide: SpawnEntry = { beat: 0, col: 5, kind: "meteor", color: null, span: 2 };
    const { events } = run([coil(0, 8), wide], PASS, [shieldTo(0, 6), ...held(PASS)]);
    expect(events.some((e) => e.type === "coilBreak")).toBe(false);
  });

  it("opens it on a later pass, once that lane has cleared", () => {
    // A delay and not an immunity, which is the difference between a rule the
    // pair can plan around and a creature they cannot answer. The rock is
    // warded away at the hull long before the coil turns at the left wall and
    // works its way back across to column 6.
    const rock: SpawnEntry = { beat: 0, col: 6, kind: "meteor", color: null };
    const long = TPB * 20;
    const { events } = run([coil(0, 8), rock], long, [shieldTo(0, 6), ...held(long)]);
    expect(events.some((e) => e.type === "coilBreak")).toBe(true);
  });

  it("counts only what is below it, never what is beside it on its own row", () => {
    // A body on the coil's own row is beside the dome rather than in front of
    // it. The rock arrives on the beat the coil steps into column 6 — arrivals
    // are spawned in `onBeat` and the ward is asked after it — so the two
    // stand on row 0 together and the reach is clear.
    const beside: SpawnEntry = { beat: 2, col: 6, kind: "meteor", color: null };
    const world = createWorld({ ...CFG }, 7, [coil(0, 8), beside]);
    for (let t = 0; t < TPB * 3; t++) step(world, t === 0 ? [shieldTo(0, 6)] : []);
    const dome = domed(world);
    const rock = world.creatures.find((c) => !coilIsDomed(c));
    expect(dome.col).toBe(6);
    // The arrangement the assertion below is about, stated rather than assumed.
    expect(rock?.col).toBe(6);
    expect(rock?.row).toBe(dome.row);
    expect(coilWardReaches(world, dome)).toBe(true);
    const { events } = run([coil(0, 8), beside], PASS, [shieldTo(0, 6), ...held(PASS)]);
    expect(events.some((e) => e.type === "coilBreak")).toBe(true);
  });

  it("answers the ward and the dome's own highlight with one function", () => {
    // `coilWardReaches` is what render draws the resonance from as well
    // (`render/coil.ts`), so a dome that lights is a dome that opens. The two
    // being one rule is the whole reason the reading is exported at all.
    const rock: SpawnEntry = { beat: 0, col: 6, kind: "meteor", color: null };
    const world = createWorld({ ...CFG }, 7, [coil(0, 8), rock]);
    for (let t = 0; t < TPB * 3; t++) step(world, t === 0 ? [shieldTo(0, 6)] : []);
    const dome = domed(world);
    expect(dome.col).toBe(6);
    expect(coilWardReaches(world, dome)).toBe(false);
    // Take the rock out from under it and the same body answers the other way.
    world.creatures = world.creatures.filter(coilIsDomed);
    expect(coilWardReaches(world, dome)).toBe(true);
  });
});

describe("the charge jumps to another dome and opens that one too", () => {
  it("lights exactly one of the others, and not the one the ward opened", () => {
    const { world, events } = run([coil(0, 8), coil(0, 6), coil(0, 4)], TPB * 3, [
      shieldTo(4, 8),
      guard(TPB),
    ]);
    expect(events.filter((e) => e.type === "coilJump")).toHaveLength(1);
    expect(world.creatures.filter((c) => coilIsDomed(c) && coilCharged(c))).toHaveLength(1);
  });

  it("opens it coilJumpBeats later, and starts the next jump from there", () => {
    const beats = CFG.coilJumpBeats;
    // Watched with the hull held: the first freed rock reaches the ship a beat
    // after the dome went, and a hit stops the field under the second dome
    // (`wave-fail.ts`). The chain is what this test is about.
    const { world, events } = run(
      [coil(0, 8), coil(0, 6), coil(0, 4)],
      TPB * (beats + 2) - 1,
      [shieldTo(4, 8), guard(TPB)],
      HULL_HELD,
    );
    // The ward opened one and the chain has opened a second; the second's own
    // jump is in the air at the third. Deliberately counted in *events* rather
    // than in bodies still standing: a freed rock is thrown to the ship in the
    // beat it is freed, so the first one is off the field long before the
    // second dome opens — which is the creature rather than an artefact of
    // the test. Stopped a tick short of the second's own landing, so it is
    // still standing on the ship's row to be found.
    expect(events.filter((e) => e.type === "coilBreak").length).toBeGreaterThanOrEqual(2);
    expect(events.filter((e) => e.type === "coilJump").length).toBeGreaterThanOrEqual(2);
    expect(world.creatures.some((c) => c.kind === "torch")).toBe(true);
  });

  it("clears the whole field from one trigger, and stops when nothing is left", () => {
    const beats = CFG.coilJumpBeats;
    const { world } = run(
      [coil(0, 8), coil(0, 6), coil(0, 4)],
      TPB * (beats * 3 + 2),
      [shieldTo(4, 8), guard(TPB)],
      HULL_HELD,
    );
    expect(world.creatures.some(coilIsDomed)).toBe(false);
  });

  it("says nothing at all when there is only the one on the field", () => {
    const { events } = run([coil(0, 8)], TPB * 4, [shieldTo(4, 8), guard(TPB)]);
    expect(events.filter((e) => e.type === "coilJump")).toHaveLength(0);
  });
});

describe("two devices playing the same coils", () => {
  /**
   * Not a pinned constant — `docs/decisions.md` #19 — but the same run twice
   * in one process, which is the property lockstep actually needs. The chain
   * picks its next dome off `world.rng`, so this is the test that would fail
   * if that roll ever left the fingerprint.
   */
  it("fingerprints the same twice, chain and all", () => {
    const queue = (): SpawnEntry[] => [coil(0, 8), coil(0, 6), coil(1, 4), coil(2, 2)];
    const inputs = [shieldTo(4, 8), guard(TPB)];
    const ticks = TPB * (CFG.coilJumpBeats * 3 + 4);
    const a = run(queue(), ticks, inputs);
    const b = run(queue(), ticks, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    expect(a.events.map((e) => e.type)).toEqual(b.events.map((e) => e.type));
  });

  it("notices which dome the chain picked", () => {
    // The whole point of the roll being in `rng.state`: two worlds seeded
    // differently take different chains, and the fingerprint has to say so.
    const build = (seed: number): World => {
      const world = createWorld({ ...CFG }, seed, [coil(0, 8), coil(0, 6), coil(0, 4), coil(0, 2)]);
      for (let t = 0; t < TPB * 2; t++) {
        step(
          world,
          t === 4
            ? [{ tick: t, player: 2, command: { kind: "shieldCol", col: 8 } }]
            : t === TPB
              ? [{ tick: t, player: 1, command: { kind: "guard" } }]
              : [],
        );
      }
      return world;
    };
    const lit = (w: World): number[] => w.creatures.filter(coilCharged).map((c) => c.col);
    // Seeds chosen so the two rolls differ; if they ever agree the assertion
    // below is vacuous, so the columns are compared rather than the hashes.
    expect(lit(build(1))).not.toEqual(lit(build(4)));
  });
});
