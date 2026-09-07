import { describe, expect, it } from "bun:test";
import {
  choirArmed,
  choirIsDots,
  DEFAULT_CONFIG,
  SceneRun,
  type SceneScript,
  type SimEvent,
} from "@neon-spore/sim";
import { queueFromWave } from "../src/queue.js";
import { sceneCommands } from "../src/scene-script.js";
import type { SceneAct } from "../src/scene-types.js";
import type { WaveEntry } from "../src/wave-types.js";

/**
 * THE CHOIR's two gestures, in a rehearsal.
 *
 * Neither of them is a thumb on a button, and neither could be written into a
 * film at all — which is why the one wave in the game that can least afford a
 * prose guide had one. A **shake** is a hand nowhere on the screen: no control,
 * no column, no seat and nothing to let go of. The **two arrows** are a hand on
 * the field, but unlike the three cords they do not travel: an arrow is a
 * switch, and what counts is how far the hand came and which way
 * (`sim/choir-gesture.ts`).
 *
 * So the acts are proved here on a real world rather than on the shape of the
 * commands, `scene-drag.test.ts`'s bargain: the failures that matter are a
 * carry that goes the wrong way, one that stops short of `choirPullMilli`, and
 * two trips that fall outside the window — all three silent in the picture,
 * where what a pair sees is a tutorial teaching a gesture that does not work.
 */

const SCENE = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  // One membrane and nothing else: what is under test is the hand.
  entries: [{ beat: 0, col: 2, kind: "choir", color: "red" }] as WaveEntry[],
};

/** The rehearsal's own config, the same three overrides `sceneScript` makes. */
const CFG = { ...DEFAULT_CONFIG, bpm: SCENE.bpm, briefings: false, hullRegenPerSecond: 0 };

interface Played {
  /** Whether a membrane was still three dots, per tick. */
  dots: boolean[];
  /** Which arrow was standing out, per tick. */
  armed: (number | null)[];
  hull: number[];
  events: SimEvent[];
}

function play(acts: SceneAct[]): Played {
  const script: SceneScript = {
    cfg: CFG,
    seed: SCENE.seed,
    wave: 0,
    queue: queueFromWave(SCENE, CFG.cols),
    pods: [],
    malfunction: null,
    boss: null,
    commands: acts.flatMap((a) => sceneCommands(a, CFG)).sort((a, b) => a.tick - b.tick),
    ticks: SCENE.ticks,
  };
  const run = new SceneRun(script);
  const out: Played = { dots: [], armed: [], hull: [], events: [] };
  for (let t = 0; t < SCENE.ticks - 1; t++) {
    run.advance(out.events);
    out.dots.push(run.world.creatures.some(choirIsDots));
    out.armed.push(choirArmed(run.world));
    out.hull.push(run.world.hullMilli);
  }
  return out;
}

/** Whether the film ever merged a membrane, which is the whole gesture. */
const merged = (p: Played) => p.events.some((e) => e.type === "choirMerge");
const sang = (p: Played) => p.events.some((e) => e.type === "choirSing");

describe("a rehearsal that shakes the device", () => {
  it("draws the membrane together, out of an act naming nothing", () => {
    const shaken = play([{ tick: 90, shake: true }]);
    expect(shaken.dots[89], "the membrane was already gone before the shake").toBe(true);
    expect(merged(shaken), "the shake did nothing").toBe(true);
    expect(shaken.dots[shaken.dots.length - 1], "it is still three dots").toBe(false);
  });

  it("is the pilot's, and the film does not say so", () => {
    // The rule every gesture that is not on a panel is on: the navigator
    // carries both colours and fires, so a membrane either seat could open
    // would be a creature one phone could play.
    for (const c of sceneCommands({ tick: 10, shake: true }, CFG)) {
      expect(c.player).toBe(1);
      expect(c.command.kind).toBe("shake");
    }
  });

  it("is one command and never a hold", () => {
    // A shake has nothing to let go of, so unlike a grip and a drag it writes
    // no release. A second command would be a hand lifting off nothing.
    expect(sceneCommands({ tick: 10, shake: true }, CFG).length).toBe(1);
  });
});

describe("a rehearsal that carries the two arrows", () => {
  const BOTH: SceneAct[] = [
    { tick: 90, drag: "choirLeft", until: 120 },
    { tick: 180, drag: "choirRight", until: 210 },
  ];

  it("arms on the first and merges on the second", () => {
    const played = play(BOTH);
    expect(
      played.armed.some((a) => a === -1),
      "the left arrow never went out",
    ).toBe(true);
    expect(merged(played), "the second arrow did not finish the gesture").toBe(true);
  });

  it("carries each arrow outward, off its own edge", () => {
    // The rule the film must not have to know: left goes left and right goes
    // right, read off the target. A carry the other way makes the thing sing,
    // which is the pair being plainly wrong rather than merely late.
    const left = sceneCommands({ tick: 10, drag: "choirLeft", until: 40 }, CFG);
    const right = sceneCommands({ tick: 10, drag: "choirRight", until: 40 }, CFG);
    const far = (cs: typeof left) =>
      cs.map((c) => (c.command.kind === "drag" ? c.command.fromMilli : 0));
    expect(Math.min(...far(left))).toBe(-CFG.choirPullMilli);
    expect(Math.max(...far(right))).toBe(CFG.choirPullMilli);
    // And across rather than down: `choirArrowHeard` reads the x and nothing
    // else, so a carry spelled on the other axis would say nothing at all.
    for (const c of [...left, ...right]) {
      expect(c.command.kind === "drag" && c.command.fromYMilli).toBe(0);
    }
  });

  it("sings when only one of the two is carried", () => {
    // The wave's own sentence: the half-made gesture is worse than none at
    // all. The window shuts `choirWindowBeats` after the first arrow.
    const half = play([{ tick: 90, drag: "choirLeft", until: 120 }]);
    expect(merged(half), "one arrow merged the membrane").toBe(false);
    expect(sang(half), "the window shut and nothing happened").toBe(true);
    expect(half.hull[half.hull.length - 1]).toBeLessThan(half.hull[0] as number);
  });

  it("does nothing at all when the second trip is late", () => {
    // Two beats is the window, so a second arrow four beats out is a lapse
    // followed by a fresh first arrow — never a merge.
    const late = play([
      { tick: 90, drag: "choirLeft", until: 120 },
      { tick: 450, drag: "choirRight", until: 480 },
    ]);
    expect(merged(late)).toBe(false);
    expect(sang(late)).toBe(true);
  });
});
