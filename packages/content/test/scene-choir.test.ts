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
 * no column, no seat and nothing to let go of. The **rub** is both seats'
 * thumbs on the mark in the middle, turning back and forth, counted only
 * together (`sim/choir-rub.ts`).
 *
 * So the acts are proved here on a real world rather than on the shape of the
 * commands, `scene-drag.test.ts`'s bargain: the failures that matter are a rub
 * one seat makes alone, and one stopped too soon — both silent in the picture,
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
const CFG = { ...DEFAULT_CONFIG, bpm: SCENE.bpm, briefings: false };

interface Played {
  /** Whether a membrane was still unopened, per tick. */
  dots: boolean[];
  /** What was under way, per tick. */
  armed: (number | null)[];
  events: SimEvent[];
}

function play(acts: SceneAct[]): Played {
  const script: SceneScript = {
    cfg: CFG,
    seed: SCENE.seed,
    wave: 0,
    queue: queueFromWave(SCENE, CFG.cols),
    pods: [],
    hasLance: true,
    faults: [],
    boss: null,
    commands: acts.flatMap((a) => sceneCommands(a, CFG)).sort((a, b) => a.tick - b.tick),
    ticks: SCENE.ticks,
  };
  const run = new SceneRun(script);
  const out: Played = { dots: [], armed: [], events: [] };
  for (let t = 0; t < SCENE.ticks - 1; t++) {
    run.advance(out.events);
    out.dots.push(run.world.creatures.some(choirIsDots));
    out.armed.push(choirArmed(run.world));
  }
  return out;
}

/** Whether the film ever merged a membrane, which is the whole gesture. */
const merged = (p: Played) => p.events.some((e) => e.type === "choirMerge");
const sang = (p: Played) => p.events.some((e) => e.type === "choirSing");

describe("a rehearsal that shakes the device", () => {
  it("draws the membrane together on the second, out of acts naming nothing", () => {
    const shaken = play([
      { tick: 90, shake: true },
      { tick: 150, shake: true },
    ]);
    expect(shaken.dots[89], "the membrane was already gone before the shake").toBe(true);
    expect(merged(shaken), "the shakes did nothing").toBe(true);
    expect(shaken.dots[shaken.dots.length - 1], "it is still a membrane").toBe(false);
  });

  it("arms on the first and does not open on it", () => {
    // The owner made the shake two moves rather than one, so a film that
    // showed one and cut to a merged body would be teaching a gesture the
    // game does not have (`sim/choir-gesture.ts`).
    const once = play([{ tick: 90, shake: true }]);
    expect(once.armed[120], "the first shake armed nothing").not.toBeNull();
    expect(merged(once), "one shake opened it").toBe(false);
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

describe("a rehearsal that rubs the mark", () => {
  const rub = (tick: number, until: number, hand: 1 | 2): SceneAct => ({
    tick,
    drag: "choirRub",
    hand,
    until,
  });
  const BOTH: SceneAct[] = [rub(90, 270, 1), rub(90, 270, 2)];

  it("both seats at once, for long enough, merges", () => {
    const played = play(BOTH);
    expect(
      played.armed.some((a) => a !== null),
      "the rub never got under way",
    ).toBe(true);
    expect(merged(played), "the rub did not finish the gesture").toBe(true);
  });

  it("sends a turn count, one more each turn, from the seat the act names", () => {
    const cs = sceneCommands(rub(10, 100, 2), CFG);
    expect(cs.every((c) => c.player === 2)).toBe(true);
    const ids = cs.map((c) => (c.command.kind === "drag" ? c.command.id : -1));
    expect(ids.slice(0, 3)).toEqual([0, 1, 2]);
    const last = cs.at(-1)?.command;
    expect(last?.kind === "drag" && last.on).toBe(false);
  });

  it("one seat alone counts nothing, however long it rubs", () => {
    const alone = play([rub(90, 450, 1)]);
    expect(merged(alone)).toBe(false);
    expect(alone.armed.every((a) => a === null)).toBe(true);
  });

  it("sings when the pair stops too soon", () => {
    // The wave's own sentence: the half-made gesture is worse than none at
    // all. The window shuts `choirWindowBeats` after the last turn made together.
    const half = play([rub(90, 150, 1), rub(90, 150, 2)]);
    expect(merged(half), "two turns merged the membrane").toBe(false);
    expect(sang(half), "the window shut and nothing happened").toBe(true);
    expect(half.events.some((e) => e.type === "waveFailed")).toBe(true);
  });
});
