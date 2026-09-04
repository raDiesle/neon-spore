import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  lidIsHeld,
  lidIsOpen,
  SceneRun,
  type SceneScript,
  type SimEvent,
} from "@neon-spore/sim";
import { queueFromWave } from "../src/queue.js";
import { sceneCommands } from "../src/scene-script.js";
import type { SceneAct } from "../src/scene-types.js";
import type { WaveEntry } from "../src/wave-types.js";

/**
 * A hand on a cord, in a rehearsal.
 *
 * Three things in this game are taken hold of and carried rather than pressed
 * — THE LID's cord, THE MAZE's string and THE WARDEN's rope — and until now
 * none of them could be written into a film at all, which is why THE LID had
 * no rehearsal and the two bosses could not be reached.
 *
 * The hard half is the one the grip already solved: a cord names the body it
 * hangs off by an **id**, and ids are dealt out by the simulation years after
 * a film is written. So a drag is authored by *column* and the runner finds
 * the body standing in it at the moment the hand goes down. This is that,
 * proved on a real world rather than on the shape of the commands.
 */

const SCENE: { ticks: number; bpm: number; seed: number; entries: WaveEntry[] } = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  // One lid, in one column, and nothing else: what is being tested is the
  // hand, and a second body would only give it something else to grab.
  entries: [{ beat: 0, col: 3, kind: "lid", color: "red" }],
};

/** The rehearsal's own config, the same three overrides `sceneScript` makes. */
const CFG = { ...DEFAULT_CONFIG, bpm: SCENE.bpm, briefings: false, hullRegenPerSecond: 0 };

/** A scene of one act, run for its whole loop. Returns every tick's answer to
 * "is a hand on the cord, and are the plates apart". */
function play(act: SceneAct): { held: boolean[]; open: boolean[] } {
  const script: SceneScript = {
    cfg: CFG,
    seed: SCENE.seed,
    wave: 0,
    queue: queueFromWave(SCENE, CFG.cols),
    pods: [],
    boss: null,
    commands: sceneCommands(act, CFG)
      .slice()
      .sort((a, b) => a.tick - b.tick),
    ticks: SCENE.ticks,
  };
  const run = new SceneRun(script);
  const held: boolean[] = [];
  const open: boolean[] = [];
  const spent: SimEvent[] = [];
  for (let t = 0; t < SCENE.ticks - 1; t++) {
    run.advance(spent);
    const lid = run.world.creatures.find((c) => c.kind === "lid");
    held.push(lid !== undefined && lidIsHeld(lid));
    open.push(lid !== undefined && lidIsOpen(CFG, lid));
  }
  return { held, open };
}

describe("a rehearsal's hand on a cord", () => {
  const ACT: SceneAct = { tick: 90, drag: "lidString", col: 3, until: 400 };

  it("takes hold of the lid standing in the column it names", () => {
    // The whole of what could not be written down before: an author knows the
    // column, because it is the column they wrote the arrival in.
    expect(play(ACT).held.some(Boolean), "no hand ever reached the cord").toBe(true);
  });

  it("carries it far enough to part the plates", () => {
    // Not merely held: a page about a cord is about what pulling it does, and
    // the default carry is the target's own taut distance (`lidTautMilli`).
    expect(play(ACT).open.some(Boolean), "the plates never came apart").toBe(true);
  });

  it("lets go, so the loop does not end with a hand still down", () => {
    const { held } = play(ACT);
    expect(held[held.length - 1], "the hand was still on the cord at the end").toBe(false);
  });

  it("carries it rather than arriving there", () => {
    // A single command at the taut distance would be a hand that teleported,
    // and the carrying is the whole of what the page shows. So the plates are
    // seen parting: there are ticks where the cord is held and the plates are
    // not yet apart.
    const { held, open } = play(ACT);
    const parting = held.some((h, i) => h && !open[i]);
    expect(parting, "the plates were apart the instant the hand landed").toBe(true);
  });

  it("stops short when the film says how far", () => {
    // The other picture a page about a handle may want: a pull that does not
    // reach. Half of taut is not taut, and the plates stay shut.
    const short = play({ ...ACT, toMilli: Math.round(CFG.lidTautMilli / 4) });
    expect(short.held.some(Boolean), "no hand reached the cord at all").toBe(true);
    expect(short.open.some(Boolean), "a quarter pull opened the plates").toBe(false);
  });

  it("finds nothing to hold when the column is empty, rather than throwing", () => {
    // A mistimed grab is an authoring mistake that should look like one on the
    // screen — a hand on a cord that is not there — and never a crash.
    const empty = play({ ...ACT, col: 0 });
    expect(empty.held.some(Boolean)).toBe(false);
  });
});

describe("what a drag act turns into", () => {
  it("names the seat that pulls, without the film saying so", () => {
    // All three handles are the pilot's: the navigator carries both colours
    // and fires, so a handle either seat could reach would be a round one
    // phone could play (`render/handles.ts`).
    for (const target of ["lidString", "mazeString", "wardenTether"] as const) {
      for (const c of sceneCommands({ tick: 10, drag: target, until: 40 }, CFG)) {
        expect(c.player, target).toBe(1);
      }
    }
  });

  it("addresses the cord by column, and the other two not at all", () => {
    const lid = sceneCommands({ tick: 10, drag: "lidString", col: 2, until: 40 }, CFG);
    expect(lid.filter((c) => c.dragCol !== undefined).length).toBeGreaterThan(0);
    const rope = sceneCommands({ tick: 10, drag: "wardenTether", until: 40 }, CFG);
    expect(rope.every((c) => c.dragCol === undefined)).toBe(true);
  });

  it("ends with the hand off, on the tick the film says", () => {
    const out = sceneCommands({ tick: 10, drag: "mazeString", until: 40 }, CFG);
    const last = out[out.length - 1];
    expect(last?.tick).toBe(40);
    expect(last?.command.kind === "drag" && last.command.on).toBe(false);
  });
});
