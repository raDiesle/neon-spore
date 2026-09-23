import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Field, type Viewport } from "@neon-spore/render";
import {
  type BossSequenceStep,
  createWorld,
  DEFAULT_CONFIG,
  faultsNow,
  framePhase,
  type InstarGesture,
  instarBoss,
  instarMarkDone,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindCueKey } from "../src/stage-cue-key.js";
import { installDom } from "./fake-dom.js";

/**
 * **THE INSTAR's marks are motion, and the held `3` performs it.**
 *
 * A thumb that goes down and never moves answers one of this boss's six
 * gestures — the `hold` — which is why the owner saw the rings light and the
 * step strike anyway. What is pinned here is the other five, each run the
 * whole way through the rig: one press of `3`, then the stage's own tick and
 * the world's, until the mark is answered. Nothing is asserted about where
 * the finger went; what is asserted is that the part gave.
 */

const CFG = DEFAULT_CONFIG;
const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const MORPH = 2;

function scene(gesture: InstarGesture, need: number): World {
  const steps: BossSequenceStep[] = [
    {
      pose: "gape",
      morphBeats: MORPH,
      windowBeats: 12,
      landBeats: 2,
      marks: [{ seat: "p1", part: "hand", gesture, xMilli: 500, yMilli: 400, need }],
    },
  ];
  const world = createWorld({ ...CFG }, 4);
  startWave(world, 0, [], [], { kind: "instar", steps });
  for (let i = 0; i < ticksPerBeat(CFG) * MORPH + 1; i++) step(world, []);
  return world;
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: framePhase(world),
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: faultsNow(world),
    well: false,
  };
}

/** One press of `3`, then `ticks` of the stage's loop: the key's thumbs move,
 * and what they say is drained into the same tick the world then steps. */
function played(world: World, ticks: number): boolean {
  const l = computeLayout(VIEWPORT, CFG, "test");
  const dom = installDom();
  const pending: TimedCommand[] = [];
  try {
    const hand = bindCueKey({
      layout: () => l,
      field: () => fieldOf(world, 1),
      world: () => world,
      role: () => "test",
      send: (player, command) => pending.push({ tick: world.tick, player, command }),
    });
    dom.press("3");
    for (let i = 0; i < ticks; i++) {
      hand.tick();
      step(world, pending.splice(0));
      const s = instarBoss(world);
      if (s !== null && instarMarkDone(s, 0)) return true;
    }
    return false;
  } finally {
    dom.restore();
  }
}

describe("the five gestures that are motion", () => {
  test("a pull down is carried to the depth the mark asks for", () => {
    expect(played(scene("pullDown", 300), 4)).toBe(true);
  });

  test("a pull up is the same, the other way", () => {
    expect(played(scene("pullUp", 300), 4)).toBe(true);
  });

  test("a swipe is a carry past the line that ends in a lift", () => {
    expect(played(scene("swipeDown", 1), 6)).toBe(true);
  });

  test("a turn winds clockwise until the mark has had its share", () => {
    expect(played(scene("turn", 500), 20)).toBe(true);
  });

  test("a tap is off and on again, as many times as it is asked for", () => {
    expect(played(scene("tap", 3), 10)).toBe(true);
  });
});

describe("what the key must not do", () => {
  test("a hold is answered by the key staying down, and nothing moves", () => {
    // `hold` counts beats both thumbs are on the one mark — a mark for one
    // seat is never finished by it, and the key must not invent the other.
    expect(played(scene("hold", 2), 8)).toBe(false);
  });
});
