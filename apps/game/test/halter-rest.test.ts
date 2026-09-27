import { afterEach, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  halterBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { InputBuffer } from "../src/input-buffer.js";
import { LEAN_BOSSES, leanBob, leanReader, leanTarget } from "../src/lean.js";
import { bindShake } from "../src/shake.js";

/**
 * **THE HALTER's resting seat sends nothing while it rests** (§11.53): a rest
 * is a count of beats with no command in them, so anything a still phone put
 * on the wire on its own would startle the seam every time. A finger off the
 * glass says nothing (`input.ts` sends only from a pointer event); what is
 * left to prove is the two sensors bound for the life of the page — the lean,
 * which is read only for the bosses that ask for it, and the shake, which
 * needs a deliberate shove and not a phone held in a hand.
 */

const CFG = DEFAULT_CONFIG;
const g = globalThis as Record<string, unknown>;
const had = { window: g.window };

afterEach(() => {
  g.window = had.window;
});

function halterUp(): World {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "halter");
  if (index === -1) throw new Error("no wave carries the halter");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  if (halterBoss(world) === null) throw new Error("the halter wave stood no seam");
  return world;
}

describe("a resting seat's phone on THE HALTER", () => {
  it("is not read for its lean, however it is held", () => {
    const world = halterUp();
    const sent: unknown[] = [];
    for (const kind of LEAN_BOSSES) {
      const r = leanReader(
        (_p, c) => sent.push(c),
        () => 2,
        () => leanBob(world, kind),
        (p) => leanTarget(kind, p),
      );
      for (const gamma of [0, 4, -12, 30]) r.read(gamma);
      r.lose();
    }
    expect(sent).toEqual([]);
  });

  it("sends no shake while held still, or carried about in a hand", () => {
    let onMotion: ((e: unknown) => void) | null = null;
    g.window = {
      DeviceMotionEvent: {},
      addEventListener: (type: string, f: (e: unknown) => void) => {
        if (type === "devicemotion") onMotion = f;
      },
    };
    const buffer = new InputBuffer();
    bindShake(buffer);
    if (onMotion === null) throw new Error("no motion listener bound");
    const motion: (e: unknown) => void = onMotion;
    // Gravity on one axis, and a hand's wobble of a few m/s² round it.
    for (let i = 0; i < 600; i++) {
      const wobble = Math.sin(i / 7) * 2;
      motion({
        acceleration: null,
        accelerationIncludingGravity: { x: wobble, y: 9.8 - wobble, z: wobble / 2 },
        interval: 16,
      });
    }
    expect(buffer.drain(0)).toEqual([]);
  });
});
