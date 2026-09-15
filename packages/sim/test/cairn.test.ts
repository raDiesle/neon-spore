import { describe, expect, it } from "bun:test";
import {
  CAIRN_COLS,
  type CairnState,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  spanOf,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE CAIRN: a boss made of the field's own rocks, answered by a hand and by
 * nothing else.
 *
 * What these pin is everything a phone cannot show. That no bolt reaches the
 * pile and no bolt is stopped by it; that a hand carried sideways takes one
 * unit out of the side it went and that the unit is a **two-tile rock**, the
 * same body the pile is drawn from; that a thumb sweeping back and forth
 * cannot empty it, because the pause is counted on the pile and not on the
 * hand; that a pair who leave it alone are given a rock in a lane the pile
 * chose; and that the last unit takes the boss with it.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned as a constant, which is `docs/decisions.md` #19 — two phones on the
 * same build is the property lockstep needs, and a pinned number is the thing
 * that gets re-pinned when a real regression moves it.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

function install(seed = 0, cfg: SimConfig = CFG): World {
  const world = createWorld({ ...cfg }, seed);
  startWave(world, 0, [], [], { kind: "cairn" });
  return world;
}

function cairn(world: World): CairnState {
  const boss = world.boss;
  if (boss?.kind !== "cairn") throw new Error("the wave installed no cairn");
  return boss;
}

function pile(world: World): Creature | undefined {
  return world.creatures.find((c) => c.kind === "cairn");
}

const rocks = (world: World): Creature[] => world.creatures.filter((c) => c.kind === "meteor");

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});

/** A hand that has come `tiles` from where it grabbed — the cumulative
 * distance a device reports, never an increment (`grip-push.ts`). */
const push = (tick: number, player: 1 | 2, id: number, tiles: number): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: "gripBody",
    on: true,
    fromMilli: Math.round(tiles * CFG.gripPushMilli),
    id,
  },
});

/** Step to a tick, feeding commands on the tick they are stamped for. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): void {
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
}

/** A hand held on the pile from `at`, carried `tiles` that way for the rest of
 * the run. Repeated every tick because a device reports where the finger *is*,
 * and a command lost on the wire has to heal itself. */
function carry(id: number, at: number, until: number, tiles: number, player: 1 | 2 = 1) {
  const out: TimedCommand[] = [grip(at, player, id)];
  for (let t = at + 1; t < until; t++) out.push(push(t, player, id, tiles));
  return out;
}

describe("the pile standing there", () => {
  it("is seven rocks wide of nothing either control answers", () => {
    const world = install();
    const body = pile(world);
    expect(body).toBeDefined();
    expect(cairn(world).units).toBe(CFG.cairnUnits);
    expect(spanOf(body as Creature)).toBe(CAIRN_COLS);
    // Dead centre, with a whole column at its middle.
    expect((body as Creature).col).toBe(Math.floor((CFG.cols - CAIRN_COLS) / 2));
  });

  it("stops a bolt fired up its own column, and takes a crater from it", () => {
    const world = install();
    const body = pile(world) as Creature;
    const mid = body.col + Math.floor(CAIRN_COLS / 2);
    // Walk the cannon under the middle of the pile and fire.
    const cmds: TimedCommand[] = [];
    for (let t = 0; t < 60; t++) {
      if (world.cannonCol === mid) break;
      cmds.push({
        tick: t,
        player: 1,
        command: { kind: "aim", dcol: mid > world.cannonCol ? 1 : -1, drow: 0 },
      });
    }
    runTo(world, TPB * 2, cmds);
    expect(world.cannonCol).toBe(mid);
    // Fire, and watch the bolt the whole way up. **It used to pass the pile**,
    // on the argument that a body stopping a shot in five columns would be a
    // wall the pair could not fire through — and the owner overruled exactly
    // that on 14 September 2026: *shots should never go through enemies, but
    // should hit with no effect.* So the bolt dies on the stone, and what it
    // leaves is a crater, because a cairn is seven rocks and a rock takes a
    // crater (`sim/bullet-hit.ts`).
    step(world, [{ tick: world.tick, player: 1, command: { kind: "fire", color: "red" } }]);
    let top = CFG.rows;
    // Three beats: long enough for the bolt to cross the whole field and
    // short enough that the pile's own clock has not run out, so what is being
    // watched is the shot and nothing else.
    for (let t = 0; t < TPB * 3; t++) {
      step(world, []);
      for (const b of world.bullets) top = Math.min(top, b.row);
    }
    expect(top).toBeGreaterThanOrEqual(body.row);
    // Nothing came off it and the wave is still the pile's — the shot marked
    // it and did nothing else.
    expect(cairn(world).units).toBe(CFG.cairnUnits);
    expect(pile(world)).toBeDefined();
    expect((pile(world) as Creature).holes).toBeGreaterThan(0);
  });
});

describe("a hand carried across it", () => {
  it("takes one unit out of the side the finger went, as a two-tile rock", () => {
    const world = install();
    const body = pile(world) as Creature;
    runTo(world, TPB * 4, carry(body.id, 2, TPB * 4, 1));
    expect(cairn(world).units).toBe(CFG.cairnUnits - 1);
    const loose = rocks(world);
    expect(loose.length).toBe(1);
    const rock = loose[0] as Creature;
    expect(spanOf(rock)).toBe(2);
    // The right-hand pair of columns, because the hand went right.
    expect(rock.col).toBe(body.col + CAIRN_COLS - 2);
  });

  it("takes it out of the other side for a hand that went the other way", () => {
    const world = install();
    const body = pile(world) as Creature;
    runTo(world, TPB * 4, carry(body.id, 2, TPB * 4, -1));
    const rock = rocks(world)[0] as Creature;
    expect(rock).toBeDefined();
    expect(rock.col).toBe(body.col);
  });

  it("cannot be emptied by one thumb on one beat", () => {
    const world = install();
    const body = pile(world) as Creature;
    // Four tiles of travel is four columns earned, and it is still one rock:
    // the pause is counted on the pile (`gripPushPauseBeats`), so the second
    // cannot come away on the beat the first did.
    runTo(world, TPB * 2, carry(body.id, 2, TPB * 2, 4));
    expect(cairn(world).units).toBe(CFG.cairnUnits - 1);
    expect(rocks(world).length).toBe(1);
  });
});

describe("a pile nobody touches", () => {
  it("lets one go by itself, into the column it had been announcing", () => {
    const world = install(5);
    const body = pile(world) as Creature;
    const going = cairn(world).settleCol;
    // A beat short of the clock: nothing has left yet and the announcement has
    // not changed, which is what makes it an announcement.
    runTo(world, TPB * (CFG.cairnShedBeats - 1));
    expect(rocks(world).length).toBe(0);
    expect(cairn(world).settleCol).toBe(going);

    runTo(world, TPB * CFG.cairnShedBeats + 2);
    const shed = rocks(world);
    expect(shed.length).toBe(1);
    expect((shed[0] as Creature).col).toBe(going);
    expect(cairn(world).units).toBe(CFG.cairnUnits - 1);
    // And the clock has restarted with a new lane to say out loud.
    expect(cairn(world).leftBeat).toBe(world.waveBeat);
    expect(body.row).toBe(CFG.cairnRow);
  });

  it("keeps the lane inside the pile, with room for a two-tile rock", () => {
    // Every seed, because the column is drawn from the rng and a lane half off
    // the pile is a rock falling out of a body that is not above it.
    for (let seed = 0; seed < 12; seed++) {
      const world = install(seed);
      const body = pile(world) as Creature;
      const col = cairn(world).settleCol;
      expect(col, `seed ${seed}`).toBeGreaterThanOrEqual(body.col);
      expect(col + 1, `seed ${seed}`).toBeLessThanOrEqual(body.col + CAIRN_COLS - 1);
    }
  });

  it("is gone when the last rock has left it", () => {
    const world = install(2);
    // Long enough for the clock to run out seven times over, with nobody's
    // hands on anything: the pile empties itself and stops being a body.
    runTo(world, TPB * CFG.cairnShedBeats * (CFG.cairnUnits + 1));
    expect(cairn(world).units).toBeLessThanOrEqual(0);
    expect(pile(world)).toBeUndefined();
  });
});

describe("two devices playing it", () => {
  it("fingerprints the same twice over the same inputs", () => {
    const run = (): number => {
      const world = install(3);
      const body = pile(world) as Creature;
      const cmds = [...carry(body.id, 2, TPB * 3, 1), ...carry(body.id, TPB * 3, TPB * 8, -1, 2)];
      runTo(world, TPB * 10, cmds);
      return hashWorld(world);
    };
    const first = run();
    expect(run()).toBe(first);
  });
});
