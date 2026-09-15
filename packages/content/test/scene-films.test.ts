import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  primeChargeMilli,
  SceneRun,
  type SimEvent,
  type SpawnEntry,
} from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * One film at a time, each with its own world and its own question.
 *
 * The sweep in `scenes.test.ts` walks every scene and asks the same thing of
 * all of them, and it fails when the *scene format* changes. These fail when a
 * *creature's rule* changes underneath a film that was written against it,
 * which is a different question asked at a different time, and the two halves
 * are added to at different rates. That is the whole argument for the cut.
 */

/**
 * **A strip that goes where the body is.**
 *
 * Every other column in a film is authored: `actCol` puts a `SceneAct`'s `col`
 * through `mapCol`, which on the eleven columns the game ships reaches 0, 2,
 * 3, 5, 7, 8 and 10 and nothing else. A shield authored into the gaps cannot
 * be written at all, and a body standing in one of them goes past whatever was
 * written instead — which is what stopped THE VOLLEY's rehearsal being written.
 *
 * So the column is resolved out of the world, the way a grip's id and a lid
 * cord's id already are, and these are the two halves of that: it lands on the
 * body even in a column no author could have named, and an empty field leaves
 * the press exactly as written rather than quietly moving it somewhere.
 */
describe("a strip act aimed at a body", () => {
  /** A film of one press, on a field holding whatever is passed in. */
  function run(queue: SpawnEntry[], atBody: boolean, authored: number): SceneRun {
    const cfg = { ...DEFAULT_CONFIG, briefings: false };
    return new SceneRun({
      cfg,
      seed: 1,
      wave: 0,
      queue,
      pods: [],
      hasLance: true,
      faults: [],
      boss: null,
      commands: [
        {
          tick: PRESS,
          player: 1,
          command: { kind: "shieldCol", col: authored },
          ...(atBody ? { atBody: true as const } : {}),
        },
      ],
      ticks: 600,
    });
  }

  /** Column 4 is one `mapCol` never reaches on an eleven-column field. */
  const UNREACHABLE = 4;
  /** After the first beat, so the arrival is standing there to be answered. */
  const PRESS = 100;

  function advanceTo(scene: SceneRun, tick: number): void {
    const events: SimEvent[] = [];
    for (let i = 0; i <= tick; i++) scene.advance(events);
  }

  it("lands in a column no authored one could have named", () => {
    const scene = run([{ beat: 0, col: UNREACHABLE, kind: "slick", color: "red" }], true, 0);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.creatures[0]?.col).toBe(UNREACHABLE);
    expect(scene.world.shieldCol).toBe(UNREACHABLE);
  });

  it("leaves the press where it was written when the field is empty", () => {
    const scene = run([], true, 2);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.shieldCol).toBe(2);
  });

  it("changes nothing for an ordinary strip act", () => {
    const scene = run([{ beat: 0, col: UNREACHABLE, kind: "slick", color: "red" }], false, 2);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.shieldCol).toBe(2);
  });
});

/**
 * THE THROB's film says its rule twice — a shot wasted and a shot landing —
 * and neither half is staged: both bolts arrive at the same half of a turning
 * body, and what separates them is which trigger was pressed.
 *
 * The scene's two act ticks are chosen against `throbSpinBeats`, and that
 * choice is written in the file as a comment doing arithmetic (beats 9.75 to
 * 11.25). A comment is not a mechanism. Change the turn or the window and one
 * of these two shots stops meaning what the page over it says, silently, in a
 * film nobody re-watches once it is written.
 */
describe("the rehearsal for THE THROB", () => {
  it("wastes one shot on the trigger that turned away and lands the next", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theThrob");
    const run = new SceneRun(sceneScript("theThrob", wave, DEFAULT_CONFIG));
    const seen: SimEvent[] = [];
    const spent: SimEvent[] = [];
    for (let t = 0; t < SCENES.theThrob.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      seen.push(...spent);
    }
    const rejected = seen.findIndex((e) => e.type === "reject");
    const destroyed = seen.findIndex((e) => e.type === "destroy");
    expect(
      rejected,
      "the first bolt is not refused — the half it arrives at still takes red",
    ).toBeGreaterThan(-1);
    expect(destroyed, "the second bolt does not land — cyan is not the half round").toBeGreaterThan(
      -1,
    );
    expect(rejected, "the film lands its shot before it loses one").toBeLessThan(destroyed);
    expect(run.world.creatures).toHaveLength(0);
  });
});

/**
 * **THE LEAK's rehearsal, and the two halves prose could not hold apart.**
 *
 * The wave's three strings say *the lobe fills nothing*. What a pair has to see
 * is the ring round the button **not closing** under a thumb that stays down,
 * and then that same thumb lifting and a bolt going out — read as one sentence
 * those are a dead trigger, and watched in that order they are a lost weapon on
 * a panel that still works. That is the whole reason the wave has a film at
 * all, and it is the half a caption cannot assert.
 *
 * So this asserts it. The hold runs from tick 360 to 660, which is five beats
 * where `lancePrimeBeats` is three: on any other wave the lobe would be full at
 * 540 and the column alight. Here the fill is nought at every tick of it, and
 * the lift still owes its ordinary shot — `sim/lance.ts` is emphatic that the
 * press starts a hold and the lift fires, because a fault that swallowed the
 * press would have taken the trigger rather than the beam.
 *
 * Change `lancePrimeBeats`, or let the fault reach the press, and one of the
 * two pages over this stops meaning what it says — silently, in a film nobody
 * re-watches once it is written. That is `theThrob`'s argument above, one wave
 * along.
 */
describe("the rehearsal for THE LEAK", () => {
  it("fills nothing under a five-beat hold, and still fires on the lift", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLeak");
    const run = new SceneRun(sceneScript("theLeak", wave, DEFAULT_CONFIG));
    const seen: SimEvent[] = [];
    const spent: SimEvent[] = [];
    let fullest = 0;
    let destroyedByLift = -1;
    for (let t = 0; t < SCENES.theLeak.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      seen.push(...spent);
      // The held page, and a beat either side of the lift: the fill is what is
      // being watched and it must never leave nought.
      if (run.world.tick >= 360 && run.world.tick <= 660) {
        fullest = Math.max(fullest, primeChargeMilli(run.world));
      }
      // The first body the film takes, and which tick took it. The bolt leaves
      // on the lift and travels, so this is after 660 rather than on it.
      if (destroyedByLift === -1 && spent.some((e) => e.type === "destroy")) {
        destroyedByLift = run.world.tick;
      }
    }
    expect(fullest, "the lobe filled under a hold on the wave where it cannot").toBe(0);
    expect(
      destroyedByLift,
      "no body was taken at all — the lift owes an ordinary shot",
    ).toBeGreaterThan(660);
    // Before the two taps that follow it, so what took this one was the lift.
    expect(destroyedByLift, "the first body waited for a tap").toBeLessThan(840);
    // Three bodies, three shots — which is the page the pilot reads last.
    expect(seen.filter((e) => e.type === "destroy")).toHaveLength(3);
    expect(run.world.creatures).toHaveLength(0);
  });
});
