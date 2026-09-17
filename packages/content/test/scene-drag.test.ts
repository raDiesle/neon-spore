import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  lidIsHeld,
  lidIsOpen,
  orreryHandHolds,
  orreryOrbit,
  orreryTurnPerTickMilli,
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
const CFG = { ...DEFAULT_CONFIG, bpm: SCENE.bpm, briefings: false };

/** A scene of one act, run for its whole loop. Returns every tick's answer to
 * "is a hand on the cord, and are the plates apart". */
function play(act: SceneAct): { held: boolean[]; open: boolean[] } {
  const script: SceneScript = {
    cfg: CFG,
    seed: SCENE.seed,
    wave: 0,
    queue: queueFromWave(SCENE, CFG.cols),
    pods: [],
    hasLance: true,
    faults: [],
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

  it("gives a balloon's right handle to the navigator, which is the creature", () => {
    // The one handle that is not the pilot's. A balloon is one body with a
    // handle on each side, and the skin gives only when both are taut at the
    // same instant — so the two hands are on two phones, and `balloonHeard`
    // refuses a side that is not the seat that sent it.
    const left = sceneCommands({ tick: 10, drag: "balloonLeft", col: 2, until: 40 }, CFG);
    const right = sceneCommands({ tick: 10, drag: "balloonRight", col: 2, until: 40 }, CFG);
    expect(left.every((c) => c.player === 1)).toBe(true);
    expect(right.every((c) => c.player === 2)).toBe(true);
  });

  it("carries a balloon's handles outward, along the axis they are pulled on", () => {
    // Outward and sideways, the choir arrows' arrangement: the sign is the
    // side, so a film says which handle and never how far. A handle carried
    // *down* the way a cord is would be a hand nowhere near the skin.
    const pulls = (target: "balloonLeft" | "balloonRight") =>
      sceneCommands({ tick: 10, drag: target, col: 2, by: 30, until: 40 }, CFG)
        .map((c) => (c.command.kind === "drag" ? c.command : null))
        .filter((c) => c !== null);
    for (const c of pulls("balloonLeft")) expect(c.fromYMilli ?? 0).toBe(0);
    const far = pulls("balloonLeft").map((c) => c.fromMilli);
    expect(Math.min(...far)).toBe(-CFG.balloonTautMilli);
    expect(Math.max(...pulls("balloonRight").map((c) => c.fromMilli))).toBe(CFG.balloonTautMilli);
  });

  it("addresses a balloon by column too, because a wave sends six of them", () => {
    const one = sceneCommands({ tick: 10, drag: "balloonRight", col: 2, until: 40 }, CFG);
    expect(one.filter((c) => c.dragCol !== undefined).length).toBeGreaterThan(0);
  });

  it("ends with the hand off, on the tick the film says", () => {
    const out = sceneCommands({ tick: 10, drag: "mazeString", until: 40 }, CFG);
    const last = out[out.length - 1];
    expect(last?.tick).toBe(40);
    expect(last?.command.kind === "drag" && last.command.on).toBe(false);
  });
});

/**
 * **A hand on a ring**, which is the one handle a film may not carry anywhere.
 *
 * It is here rather than beside the cord's tests because the gesture is the
 * same act with the same field on it — and because the bug it was written for
 * lived in this file's own `pullsDown`: that predicate answered `true` for
 * `orreryRing`, so a film authoring one would have sent a stream of *downward
 * pixels* at a control that reads thousandths of a turn. Nothing would have
 * thrown; the ring would have turned by whatever those numbers happened to mean
 * (`docs/queue.md`, 17 September 2026).
 */
describe("a rehearsal's hand on THE ORRERY's ring", () => {
  const ACT: SceneAct = { tick: 90, drag: "orreryRing", until: 390 };

  /** The act run against a real orrery, and what the ring's anchor did. */
  function turn(act: SceneAct): { from: number[]; held: boolean[] } {
    const script: SceneScript = {
      cfg: CFG,
      seed: SCENE.seed,
      wave: 0,
      queue: [],
      pods: [],
      hasLance: true,
      faults: [],
      boss: { kind: "orrery" },
      commands: sceneCommands(act, CFG)
        .slice()
        .sort((a, b) => a.tick - b.tick),
      ticks: SCENE.ticks,
    };
    const run = new SceneRun(script);
    const from: number[] = [];
    const held: boolean[] = [];
    const spent: SimEvent[] = [];
    for (let t = 0; t < SCENE.ticks - 1; t++) {
      run.advance(spent);
      const b = run.world.boss?.kind === "orrery" ? run.world.boss : null;
      from.push(b?.from[0] ?? -1);
      held.push(b !== null && orreryHandHolds(b));
    }
    return { from, held };
  }

  const orbit = orreryOrbit(CFG, 0);

  it("turns the ring it is on, several organs' worth, and writes the anchor", () => {
    const { from } = turn(ACT);
    const start = from[0] ?? 0;
    // The anchor rather than a position: a gap's place stays a function of the
    // beat, which is the whole of this boss's rule (`sim/orrery.ts`). What a
    // hand buys is sockets, so the end of the act is a whole number of them on
    // from the start and every step between is one of them.
    const moved = ((from.at(-1) ?? 0) - start + orbit) % orbit;
    expect(moved, "the anchor never moved under the hand").toBeGreaterThan(1);
    for (const at of from) expect(Number.isInteger(at)).toBe(true);
  });

  it("goes exactly as far the other way when the film says which way", () => {
    // `dir` is the one field a ring borrows from a carry, and on this control a
    // direction is the whole of what a hand chooses: the same turn hurries the
    // outer ring's gap along and fights the middle one's drift. The same act
    // either way round has to be the same distance, or the rig is turning at
    // two rates and a film about the drift proves nothing.
    const fwd = turn(ACT).from;
    const back = turn({ ...ACT, dir: -1 }).from;
    const start = fwd[0] ?? 0;
    const ahead = ((fwd.at(-1) ?? 0) - start + orbit) % orbit;
    const behind = (start - (back.at(-1) ?? 0) + orbit) % orbit;
    expect(behind).toBe(ahead);
  });

  it("lets go, so the loop does not end with a thumb on the ring", () => {
    const { held } = turn(ACT);
    expect(held.some(Boolean), "no hand ever reached the ring").toBe(true);
    expect(held.at(-1), "the hand was still on the ring at the end").toBe(false);
  });

  it("sends bearings and never a distance, which is the defect this fixes", () => {
    const drags = sceneCommands(ACT, CFG)
      .map((c) => (c.command.kind === "drag" ? c.command : null))
      .filter((c) => c !== null);
    expect(drags.length).toBeGreaterThan(2);
    for (const d of drags) {
      // No axis at all: a carry writes both, and a bearing is neither.
      expect(d.fromYMilli, "a ring was sent a y-displacement").toBeUndefined();
    }
    // And the bearings themselves walk round the circle rather than standing
    // still, at the rate the rules name — one sample every six ticks, which is
    // how often a film says where a turning hand has got to (`scene-turn.ts`).
    const bearings = drags.map((d) => d.fromMilli).filter((m) => m >= 0);
    expect((bearings[1] ?? 0) - (bearings[0] ?? 0)).toBe(orreryTurnPerTickMilli(CFG) * 6);
  });
});
