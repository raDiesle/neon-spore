import { describe, expect, it } from "bun:test";
import { curtainStruck } from "../src/curtain-shot.js";
import {
  type Creature,
  CURTAIN_COLS,
  type CurtainState,
  createWorld,
  curtainBoss,
  curtainCoreBare,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * **The second half of THE CURTAIN, which is not the shove's.** Above it the
 * fight is one gesture played three times — carry the sheet off the core,
 * fire up its column. A hit that does not end it now **jams the rail** for
 * `curtainPinBeats`: the shove is refused whole, and the way back to the
 * core is the hem, which the pilot carries **up** past `curtainLiftMilli`
 * and holds (`curtain-hand.ts`, `.claude/skills/new-boss` §6.2).
 *
 * What is checked here is the whole of that: the jam going on and coming
 * off, the shove it refuses, the lift that opens the gap and the one that
 * falls short, the seat it belongs to, the state it is answered in, and that
 * how far the hem has come is in the fingerprint.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "curtain" });
  return world;
}

function curtain(world: World): CurtainState {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the wave installed no curtain");
  return c;
}

const fabric = (world: World): Creature | undefined =>
  world.creatures.find((c) => c.kind === "curtain");

function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** The pilot's thumb under the hem, `milli` **up** from where it grabbed. */
const hem = (tick: number, milli: number, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "curtainHem", on: true, fromMilli: 0, fromYMilli: -milli },
});

const letGo = (tick: number, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "curtainHem", on: false, fromMilli: 0, fromYMilli: 0 },
});

/** Both hands on the sheet, carried a column that way, from `at` to `until`. */
function carry(id: number, at: number, until: number, dir: 1 | -1): TimedCommand[] {
  const out: TimedCommand[] = [{ tick: at, player: 1, command: { kind: "grip", id } }];
  for (let t = at + 1; t < until; t++) {
    out.push({
      tick: t,
      player: 1,
      command: {
        kind: "drag",
        target: "gripBody",
        on: true,
        fromMilli: dir * CFG.gripPushMilli,
        id,
      },
    });
  }
  return out;
}

function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/**
 * A world with the rail jammed.
 *
 * The core is put out from under the sheet by hand rather than shoved clear,
 * because what this page is about starts at the hit: a bare core, its own
 * colour into it, and the rail closes behind the drift (`curtain-shot.ts`).
 */
function jammed(seed = 0): { world: World; c: CurtainState; body: Creature } {
  const world = install(seed);
  const c = curtain(world);
  const body = fabric(world) as Creature;
  c.coreCol = body.col + CURTAIN_COLS;
  if (!curtainCoreBare(world, c)) throw new Error("the core is still covered");
  curtainStruck(world, shot(world, c.coreCol, c.coreColor));
  if (c.phase !== "pinned") throw new Error(`the rail is ${c.phase}, not pinned`);
  return { world, c, body };
}

describe("the rail jamming", () => {
  it("closes on a hit that does not end the fight, and says for how long", () => {
    const { world, c } = jammed();
    expect(c.coreHits).toBe(1);
    expect(c.phase).toBe("pinned");
    expect(c.phaseBeat).toBe(world.beat);
    const pin = world.events.find((e) => e.type === "curtainPin");
    expect(pin).toBeDefined();
    expect(pin?.type === "curtainPin" && pin.beats).toBe(CFG.curtainPinBeats);
  });

  it("refuses the shove whole while it holds — the tear along with it", () => {
    const { world, c, body } = jammed();
    // Nothing left on the hem: a sheet this bare comes off its rail on the
    // next shove while it hangs, and off a jammed rail it does not.
    for (let i = 0; i < c.lobes.length; i++) c.lobes[i] = false;
    c.soft = [];
    const at = body.col;
    const seen = runTo(
      world,
      world.tick + TPB * 2,
      carry(body.id, world.tick, world.tick + TPB * 2, 1),
    );
    expect(body.col).toBe(at);
    expect(seen.has("curtainJam")).toBe(true);
    expect(seen.has("curtainShove")).toBe(false);
    expect(seen.has("curtainTear")).toBe(false);
    expect(fabric(world)).toBeDefined();
  });

  it("hands the rail back after curtainPinBeats, with the hem down", () => {
    const { world, c } = jammed();
    runTo(world, world.tick + TPB * (CFG.curtainPinBeats + 1), [
      hem(world.tick + 1, CFG.curtainLiftMilli),
    ]);
    expect(c.phase).toBe("hung");
    expect(c.liftMilli).toBe(0);
    expect(curtainCoreBare(world, c)).toBe(false);
  });
});

describe("the hem carried up", () => {
  it("bares the core while it is held at the top, and covers it again when it is let go", () => {
    const { world, c } = jammed();
    expect(curtainCoreBare(world, c)).toBe(false);
    step(world, [hem(world.tick, CFG.curtainLiftMilli)]);
    expect(c.liftMilli).toBe(CFG.curtainLiftMilli);
    expect(curtainCoreBare(world, c)).toBe(true);
    step(world, [letGo(world.tick)]);
    expect(c.liftMilli).toBe(0);
    expect(curtainCoreBare(world, c)).toBe(false);
  });

  it("says the gap opened once, on the edge and not every tick it stays open", () => {
    const { world, c } = jammed();
    let lifts = 0;
    for (let i = 0; i < 12; i++) {
      step(world, [hem(world.tick, CFG.curtainLiftMilli)]);
      for (const e of world.events) if (e.type === "curtainLift") lifts += 1;
    }
    expect(lifts).toBe(1);
    expect(curtainCoreBare(world, c)).toBe(true);
  });

  it("does nothing a thousandth short of curtainLiftMilli", () => {
    const { world, c } = jammed();
    const seen = new Set<string>();
    step(world, [hem(world.tick, CFG.curtainLiftMilli - 1)]);
    for (const e of world.events) seen.add(e.type);
    expect(c.liftMilli).toBe(CFG.curtainLiftMilli - 1);
    expect(curtainCoreBare(world, c)).toBe(false);
    expect(seen.has("curtainLift")).toBe(false);
  });

  it("is the pilot's alone: the navigator's thumb is dropped without a sound", () => {
    const { world, c } = jammed();
    step(world, [hem(world.tick, CFG.curtainLiftMilli, 2)]);
    expect(c.liftMilli).toBe(0);
    expect(curtainCoreBare(world, c)).toBe(false);
  });

  it("is not answered while the sheet hangs free", () => {
    const world = install();
    const c = curtain(world);
    step(world, [hem(world.tick, CFG.curtainLiftMilli)]);
    expect(c.phase).toBe("hung");
    expect(c.liftMilli).toBe(0);
    expect(curtainCoreBare(world, c)).toBe(false);
  });

  it("is a gap that shoots back: the core fires up its column while it is held", () => {
    const { world, c } = jammed();
    const held: TimedCommand[] = [];
    const until = world.tick + TPB * (CFG.curtainFireBeats + 1);
    for (let t = world.tick; t < until; t++) held.push(hem(t, CFG.curtainLiftMilli));
    const seen = runTo(world, until, held);
    expect(seen.has("curtainFire")).toBe(true);
    expect(c.phase).toBe("pinned");
  });

  it("is in the fingerprint: two devices holding different depths do not agree", () => {
    const flat = jammed();
    const lifted = jammed();
    expect(hashWorld(lifted.world)).toBe(hashWorld(flat.world));
    step(lifted.world, [hem(lifted.world.tick, CFG.curtainLiftMilli)]);
    step(flat.world, []);
    expect(hashWorld(lifted.world)).not.toBe(hashWorld(flat.world));
  });
});
