import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type ScuttleState,
  scuttleBoss,
  scuttleClearSwing,
  scuttleLeft,
  scuttleLeftCol,
  scuttlePartCol,
  scuttleSocketCol,
  scuttleSwingable,
  scuttleWinding,
} from "../src/scuttle.js";
import { scuttleHeard } from "../src/scuttle-hand.js";
import type { Command } from "../src/types.js";

/**
 * **The one hand THE SCUTTLE offers**, apart from the cannon and the shield:
 * the pilot carries a hanging part a column along the frame, once a cycle,
 * and it is thrown down the column he put it in rather than its socket's.
 *
 * Its own file rather than `scuttle.test.ts`' foot, which is already past the
 * length a file is kept to: what is pinned here is the gesture and nothing
 * about the cadence — that a carry moves the throw's column, that it is the
 * pilot's alone, that it is spent once a cycle and given back at the next
 * detachment, that it is refused on the wind-up, that a carry off the end of
 * the frame costs nothing, and that all of it is in the fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "scuttle" });
  return world;
}

function frame(world: World): ScuttleState {
  const s = scuttleBoss(world);
  if (s === null) throw new Error("no frame installed");
  return s;
}

/** Run until a part hangs loose. */
function hanging(world: World): ScuttleState {
  const s = frame(world);
  for (let n = 0; n < 40 * TPB; n++) {
    if (s.loose.length > 0) return s;
    step(world, []);
  }
  throw new Error("nothing came loose");
}

/** Take parts off the frame from the back until `n` are left. */
function thin(world: World, n: number): ScuttleState {
  const s = frame(world);
  for (let i = s.parts.length - 1; i >= 0 && scuttleLeft(s) > n; i--) {
    if (!s.loose.includes(i)) s.parts[i] = null;
  }
  return s;
}

/** The pilot's thumb on hanging socket `id`, carried `milli` along the frame. */
function carry(id: number, milli: number, on = true): Command {
  return { kind: "drag", target: "scuttlePart", on, fromMilli: milli, id };
}

/** Carry the oldest hanging part whichever way the frame has room for. */
function anyWay(world: World, s: ScuttleState, id: number): number {
  const from = scuttlePartCol(s, CFG, id);
  const left = scuttleSocketCol(CFG, 0);
  const dir = from > left ? -1 : 1;
  scuttleHeard(world, 1, carry(id, dir * CFG.scuttleSwingMilli));
  return from;
}

describe("the pilot's carry", () => {
  it("moves the column the part hangs over and is thrown down", () => {
    const world = open();
    const s = hanging(world);
    const id = s.loose[0] as number;
    expect(scuttleSwingable(s)).toBe(true);
    const from = anyWay(world, s, id);
    expect(s.swung).toBe(id);
    expect(Math.abs(s.swungCol - from)).toBe(1);
    expect(scuttlePartCol(s, CFG, id)).toBe(s.swungCol);
    // Every other socket is still exactly its own column.
    for (let i = 0; i < s.parts.length; i++) {
      if (i === id) continue;
      expect(scuttlePartCol(s, CFG, i)).toBe(scuttleSocketCol(CFG, i));
    }
    expect(world.events.some((e) => e.type === "scuttleSwing")).toBe(true);
  });

  it("is the pilot's alone, and only on a part that is hanging", () => {
    const world = open();
    const s = hanging(world);
    const id = s.loose[0] as number;
    scuttleHeard(world, 2, carry(id, CFG.scuttleSwingMilli));
    expect(s.held).toBe(-1);
    expect(s.swung).toBe(-1);
    const attached = s.parts.findIndex((p, i) => p !== null && !s.loose.includes(i));
    scuttleHeard(world, 1, carry(attached, CFG.scuttleSwingMilli));
    expect(s.held).toBe(-1);
    expect(s.swung).toBe(-1);
  });

  it("takes the thumb before the carry, and lets it go again", () => {
    const world = open();
    const s = hanging(world);
    const id = s.loose[0] as number;
    scuttleHeard(world, 1, carry(id, 0));
    expect(s.held).toBe(id);
    expect(s.swung).toBe(-1);
    scuttleHeard(world, 1, carry(id, 0, false));
    expect(s.held).toBe(-1);
  });

  it("is spent once a cycle and given back at the next detachment", () => {
    const world = open();
    const s = hanging(world);
    const id = s.loose[0] as number;
    anyWay(world, s, id);
    expect(scuttleSwingable(s)).toBe(false);
    const put = s.swungCol;
    anyWay(world, s, id);
    expect(s.swungCol).toBe(put);
    // The throw, and the next part coming loose behind it.
    for (let n = 0; n < 40 * TPB && s.swung >= 0; n++) step(world, []);
    expect(s.swung).toBe(-1);
    expect(s.swungCol).toBe(-1);
    expect(s.held).toBe(-1);
  });

  it("is refused on the wind-up, when the last part is burned where it stands", () => {
    const world = open();
    thin(world, 1);
    const s = hanging(world);
    expect(scuttleWinding(s)).toBe(true);
    const id = s.loose[0] as number;
    scuttleHeard(world, 1, carry(id, CFG.scuttleSwingMilli));
    expect(s.swung).toBe(-1);
    expect(scuttlePartCol(s, CFG, id)).toBe(scuttleSocketCol(CFG, id));
  });

  it("costs nothing when the carry would take the part off the end of the frame", () => {
    const world = open();
    const s = hanging(world);
    // Socket 0 hangs over the frame's left-hand end, and there is no column
    // to its left — arranged rather than walked to, because a walk would need
    // the swing given back between its steps and giving it back is what puts
    // the part in its socket's column again (`scuttlePartCol`).
    const id = 0;
    expect(s.parts[id]).not.toBeNull();
    s.loose = [id];
    s.live = id;
    scuttleClearSwing(s);
    expect(scuttlePartCol(s, CFG, id)).toBe(scuttleLeftCol(CFG));
    scuttleHeard(world, 1, carry(id, -CFG.scuttleSwingMilli));
    expect(s.swung).toBe(-1);
    expect(scuttlePartCol(s, CFG, id)).toBe(scuttleLeftCol(CFG));
    // And the cycle's carry is still there to spend the other way.
    expect(scuttleSwingable(s)).toBe(true);
    scuttleHeard(world, 1, carry(id, CFG.scuttleSwingMilli));
    expect(scuttlePartCol(s, CFG, id)).toBe(scuttleLeftCol(CFG) + 1);
  });

  it("does not move on a thumb that has not gone far enough", () => {
    const world = open();
    const s = hanging(world);
    const id = s.loose[0] as number;
    scuttleHeard(world, 1, carry(id, CFG.scuttleSwingMilli - 1));
    expect(s.swung).toBe(-1);
    expect(s.held).toBe(id);
  });

  it("is in the fingerprint", () => {
    const a = open(11);
    const b = open(11);
    const sa = hanging(a);
    hanging(b);
    expect(hashWorld(a)).toBe(hashWorld(b));
    anyWay(a, sa, sa.loose[0] as number);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
