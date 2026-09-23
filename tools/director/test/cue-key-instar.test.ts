import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Field, instarCues, type Viewport } from "@neon-spore/render";
import {
  type BossSequenceStep,
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  faultsNow,
  framePhase,
  type InstarGesture,
  type InstarSeat,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindCueKey } from "../src/stage-cue-key.js";
import { installDom } from "./fake-dom.js";

/**
 * **`3` ON THE ONE BOSS IT WAS SILENT ON.**
 *
 * The owner, 20 September 2026: *I am in the director and focus the game on
 * THE INSTAR and press 3, and nothing happens.* It did nothing because this
 * boss's marks are an authored beat list and are nowhere in `bossCues` — and
 * may not be, since the ring draws its own frame and its own verb. The key
 * reads them through `instarCues` instead, and what is pinned here is that
 * the two lists it adds together reach the same rings the mouse does.
 */

const CFG = DEFAULT_CONFIG;
const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const MORPH = 2;

function mark(seat: InstarSeat, gesture: InstarGesture, xMilli: number) {
  return { seat, part: "hand" as const, gesture, xMilli, yMilli: 400, need: 2 };
}

/** A scene of one step, morphed through, with its marks up. */
function acting(...marks: ReturnType<typeof mark>[]): World {
  const steps: BossSequenceStep[] = [
    { pose: "gape", morphBeats: MORPH, windowBeats: 8, landBeats: 2, marks },
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

describe("the marks, read as cues", () => {
  test("a mark per seat, each saying its own gesture's verb", () => {
    const world = acting(mark("p1", "hold", 300), mark("p2", "turn", 700));
    const l = computeLayout(VIEWPORT, CFG, "test");
    const cues = instarCues(l, world);
    expect(cues.map((c) => c.seat)).toEqual([1, 2]);
    expect(cues.map((c) => c.word)).toEqual(["HOLD BOTH", "TURN"]);
    expect(cues.map((c) => c.kind)).toEqual(["HOLD", "TURN"]);
  });

  test("nothing before the marks are up: the morph is not an ask", () => {
    const world = createWorld({ ...CFG }, 4);
    startWave(world, 0, [], [], {
      kind: "instar",
      steps: [
        {
          pose: "gape",
          morphBeats: MORPH,
          windowBeats: 8,
          landBeats: 2,
          marks: [mark("p1", "hold", 300)],
        },
      ],
    });
    expect(instarCues(computeLayout(VIEWPORT, CFG, "test"), world)).toEqual([]);
  });

  test("a boss that is not THE INSTAR says nothing here", () => {
    const world = createWorld({ ...CFG }, 4);
    startWave(world, 0, [], [], null);
    expect(instarCues(computeLayout(VIEWPORT, CFG, "test"), world)).toEqual([]);
  });
});

describe("the key, on THE INSTAR", () => {
  test("a held key is a thumb on each seat's own ring, one behind the other", () => {
    const world = acting(mark("p1", "hold", 300), mark("p2", "hold", 700));
    const l = computeLayout(VIEWPORT, CFG, "test");
    const dom = installDom();
    const sent: { player: 1 | 2; command: Command }[] = [];
    try {
      const hand = bindCueKey({
        layout: () => l,
        field: () => fieldOf(world, 1),
        world: () => world,
        role: () => "test",
        send: (player, command) => sent.push({ player, command }),
      });
      // The pause is the point: one seat's thumb lands on the press and the
      // other waits half a beat, so the order is something an eye can follow.
      dom.press("3");
      expect(sent.map((s) => s.player)).toEqual([1]);
      for (let i = 0; i < ticksPerBeat(CFG); i++) hand.tick();
      expect(sent.map((s) => s.player).sort()).toEqual([1, 2]);
      for (const { command } of sent) {
        expect(command.kind).toBe("drag");
        expect(command.kind === "drag" && command.target).toBe("instarMark");
      }
    } finally {
      dom.restore();
    }
  });

  test("a mark both seats are wanted on is two cues, one per seat", () => {
    const world = acting({ ...mark("p1", "hold", 500), seat: "both" as const });
    const cues = instarCues(computeLayout(VIEWPORT, CFG, "test"), world);
    expect(cues.map((c) => c.seat)).toEqual([1, 2]);
    expect(new Set(cues.map((c) => c.x)).size).toBe(1);
  });
});
