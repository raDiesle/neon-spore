import { describe, expect, test } from "bun:test";
import { buildBoss, buildQueue, controlSet, WAVES } from "@neon-spore/content";
import {
  type BossCue,
  bossCues,
  computeLayout,
  type Field,
  touchDown,
  type Viewport,
} from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";
import {
  batonBoss,
  createWorld,
  DEFAULT_CONFIG,
  faultsNow,
  framePhase,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindCueKey, cueAnswers, cueSeats } from "../src/stage-cue-key.js";
import { installDom } from "./fake-dom.js";

/**
 * **THE `3` KEY: WHAT THE FIELD IS ASKING, BY BOTH THUMBS AT ONCE.**
 *
 * The owner's ask, 20 September 2026: 1 and 2 hand the desk's one mouse to one
 * seat at a time, so the pair's own problem — *two marks on the same beat* —
 * is the one thing the rig could not be made to do.
 *
 * Two halves are proved here. The **distribution** is pure: a mark per seat,
 * most urgent first, a seatless mark answered once and a `STILL` never. And
 * the **press** is real — THE BATON's merge, the state that asks both seats
 * for a thumb on the same frame, run through the same `touchDown` the mouse
 * goes through, so what this proves is that the key reaches the simulation
 * rather than that a coordinate was copied.
 */

const CFG = DEFAULT_CONFIG;
const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

function cue(seat: BossCue["seat"], kind: BossCue["kind"] = "PRESS"): BossCue {
  return { seat, kind, word: kind, x: 0, y: 0, halfW: 10, halfH: 10, seed: 1 };
}

describe("which seats the key speaks for", () => {
  test("a seated screen answers for its own seat and no other", () => {
    expect(cueSeats("p1")).toEqual([1]);
    expect(cueSeats("p2")).toEqual([2]);
  });

  test("TEST answers for both, which is the whole point of the key", () => {
    expect(cueSeats("test")).toEqual([1, 2]);
  });
});

describe("the mark each seat answers", () => {
  test("two marks on one beat are two thumbs", () => {
    const his = cue(1, "HOLD");
    const hers = cue(2, "HOLD");
    expect(cueAnswers([his, hers], [1, 2])).toEqual([
      { seat: 1, cue: his },
      { seat: 2, cue: hers },
    ]);
  });

  test("a seat takes its own mark and never the other's", () => {
    const hers = cue(2, "HOLD");
    expect(cueAnswers([hers], [1])).toEqual([]);
    expect(cueAnswers([hers], [2])).toEqual([{ seat: 2, cue: hers }]);
  });

  test("a mark either seat may take is answered once, by the first", () => {
    const either = cue(null);
    expect(cueAnswers([either], [1, 2])).toEqual([{ seat: 1, cue: either }]);
  });

  test("a seatless mark does not stop the second seat reaching its own", () => {
    const either = cue(null);
    const hers = cue(2, "HOLD");
    expect(cueAnswers([either, hers], [1, 2])).toEqual([
      { seat: 1, cue: either },
      { seat: 2, cue: hers },
    ]);
  });

  test("STILL is skipped: the ask is for no thumb at all", () => {
    // THE STARE charges for a watched press, so a key that pressed on its mark
    // would be the rig failing the fight on purpose (`sim/stare-step.ts`).
    const watched = cue(1, "STILL");
    const later = cue(1, "PRESS");
    expect(cueAnswers([watched], [1])).toEqual([]);
    expect(cueAnswers([watched, later], [1])).toEqual([{ seat: 1, cue: later }]);
  });

  test("only the most urgent of a seat's marks is pressed", () => {
    const first = cue(1, "PRESS");
    const second = cue(1, "HOLD");
    expect(cueAnswers([first, second], [1])).toEqual([{ seat: 1, cue: first }]);
  });
});

/** THE BATON's arm, opened, with its two beads drawn together — the one state
 * in the game that asks both seats for a thumb on the same frame. */
function merging(): World {
  const index = WAVES.findIndex((w) => w.boss?.kind === "baton");
  if (index === -1) throw new Error("no wave carries the baton");
  const world = createWorld(CFG, 5);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 3 * ticksPerBeat(CFG); i++) step(world, []);
  const b = batonBoss(world);
  if (b === null) throw new Error("the baton's wave installed no arm");
  const bead = b.beads[0];
  if (bead === undefined) throw new Error("the arm opened with no bead");
  b.beads = [
    { ...bead, flying: false, socket: CFG.batonSockets - 1 },
    { ...bead, flying: false, socket: CFG.batonSockets - 2, color: "cyan" },
  ];
  b.stage = "merging";
  b.stageBeat = world.beat;
  b.lockUntil = [-1, -1];
  return world;
}

/** The field the stage hands a hit test, minus the seat the press writes in
 * (`src/stage-field.ts` — the same shape, built here so this test is not one
 * more caller of the panel's whole wiring). */
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

describe("the press itself", () => {
  test("both seats get a thumb on their own bead, on the one frame", () => {
    const world = merging();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const cues = bossCues(l, world, framePhase(world), () => l.hullY);
    const answers = cueAnswers(cues, cueSeats("test"));
    expect(answers.map((a) => a.seat)).toEqual([1, 2]);
    expect(answers.map((a) => a.cue.word)).toEqual(["HOLD", "HOLD"]);
    // The same field the mouse is tested against (`stage-field.ts`), with the
    // answering seat written into it — which is what the key does instead of
    // handing the desk's one pointer to one seat at a time.
    for (const { seat, cue: mark } of answers) {
      const t = touchDown(l, mark.x, mark.y, fieldOf(world, seat));
      expect(t, `seat ${seat} found nothing under its own mark`).not.toBeNull();
      // A held key is a held thumb: the merge is answered by staying down.
      expect(t?.hold, `seat ${seat} took hold of nothing`).toBeDefined();
    }
  });
});

describe("the key, bound", () => {
  test("one press is both seats' thumbs, and the lift is both let go", () => {
    const world = merging();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const dom = installDom();
    const sent: { player: 1 | 2; command: Command }[] = [];
    try {
      bindCueKey({
        layout: () => l,
        field: () => fieldOf(world, 1),
        world: () => world,
        role: () => "test",
        send: (player, command) => sent.push({ player, command }),
      });
      dom.press("3");
      // Both beads taken hold of, one per seat — the state a single mouse
      // could only ever answer half of.
      expect(sent.map((s) => s.player).sort()).toEqual([1, 2]);
      const before = sent.length;
      dom.lift("3");
      // A merge thumb is a hold: what the lift says is that it is off again.
      expect(sent.length).toBeGreaterThan(before);
      expect(
        sent
          .slice(before)
          .map((s) => s.player)
          .sort(),
      ).toEqual([1, 2]);
    } finally {
      dom.restore();
    }
  });

  test("a key that is not 3 is not this binding's", () => {
    const world = merging();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const dom = installDom();
    const sent: { player: 1 | 2; command: Command }[] = [];
    try {
      bindCueKey({
        layout: () => l,
        field: () => fieldOf(world, 1),
        world: () => world,
        role: () => "test",
        send: (player, command) => sent.push({ player, command }),
      });
      dom.press("1");
      dom.press("w");
      expect(sent).toEqual([]);
    } finally {
      dom.restore();
    }
  });
});
