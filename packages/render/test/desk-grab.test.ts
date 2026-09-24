import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet, controlSetForWave } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  type InstarState,
  instarBoss,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { pointerSeats } from "../src/desk-seat.js";
import { gaugeBandGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import { instarMarkPoint } from "../src/instar-shape.js";
import { instarSway } from "../src/instar-sway.js";
import { computeLayout } from "../src/layout.js";
import { type Field, type Touch, touchMove } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

/**
 * **The test screen's one mouse picking a seat for itself.**
 *
 * The owner, 24 September 2026: *in TEST I cannot choose which of the actions
 * on screen to pull first — I have to pull player 1's and only then player
 * 2's. I expect to decide, like players, which control to pull first.* A press
 * there used to be player 1's and nothing else, so THE INSTAR's first pose
 * could only ever be answered pilot-first and its fourth, the navigator's
 * alone, not at all.
 *
 * What is pinned here is the two shapes the desk has to tell apart, because
 * they fail in opposite ways: a mark is **there for the wrong seat and refused
 * by the simulation** (`sim/instar-hand.ts`), and every other handle a seat
 * does not own is **simply not there**. So the ring is asked whose it is, and
 * everything else is found by trying the seats in turn — and a seat key still
 * pins the pointer, which is the only way left to ask for the refusal.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
const TPB = ticksPerBeat(CFG);
const BOTH = pointerSeats("test", undefined);

/** THE INSTAR's body hung, a few beats of its wave behind it. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** One pose of the script acting, its marks up and untouched. */
function acting(world: World, cursor: number): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = world.beat;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}

/** The field as one seat sees it, standing on this beat of the wave. */
function instarField(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSetForWave(waveWith("instar")),
    faults: [],
    well: false,
  };
}

/** Where the ring of one of the pose's marks is drawn this instant. */
function ringAt(s: InstarState, world: World, id: number): { x: number; y: number } {
  const mark = s.steps[s.cursor]?.marks[id];
  if (mark === undefined) throw new Error(`pose ${s.cursor} has no mark ${id}`);
  return instarMarkPoint(L, mark, instarSway(s, CFG, world.beat, 0));
}

/** Which seat each mark of the pose is asking for, so a case names a seat
 * rather than an index the script may renumber. */
function markOf(s: InstarState, seat: "p1" | "p2" | "both"): number {
  const id = s.steps[s.cursor]?.marks.findIndex((m) => m.seat === seat) ?? -1;
  if (id < 0) throw new Error(`pose ${s.cursor} has no ${seat} mark`);
  return id;
}

describe("a press on THE INSTAR's marks", () => {
  it("is signed with the seat the ring under the thumb asks for, either way round", () => {
    const world = hung();
    const s = acting(world, 0);
    const field = (seat: 1 | 2): Field => instarField(world, seat);
    // The first pose is a mark on the jaw for each seat, which is the owner's
    // own example: either of them may be the one pulled first.
    const pilot = ringAt(s, world, markOf(s, "p1"));
    const navigator = ringAt(s, world, markOf(s, "p2"));
    expect(deskDown(L, pilot.x, pilot.y, BOTH, field)?.player).toBe(1);
    expect(deskDown(L, navigator.x, navigator.y, BOTH, field)?.player).toBe(2);
  });

  it("lets two thumbs on one phone hold both jaws at once, the navigator's first", () => {
    // The owner, on a phone, 24 September 2026: *pull both players' controls
    // at the same time and in any order, like players can.* Two fingers are
    // two presses, each deciding its own seat, and both held to the end.
    const world = hung();
    const s = acting(world, 0);
    const field = (seat: 1 | 2): Field => instarField(world, seat);
    const send = (t: Touch | null): void => {
      if (t?.command) step(world, [{ tick: world.tick, player: t.player, command: t.command }]);
    };
    const upper = ringAt(s, world, markOf(s, "p2"));
    const lower = ringAt(s, world, markOf(s, "p1"));
    const second = deskDown(L, upper.x, upper.y, BOTH, field);
    send(second);
    const first = deskDown(L, lower.x, lower.y, BOTH, field);
    send(first);
    expect([second?.player, first?.player]).toEqual([2, 1]);
    if (!second?.hold || !first?.hold) throw new Error("a jaw took no hold");
    expect(s.thumbs).toEqual([1, 2]);
    // Pulled apart together, a step at a time, one finger then the other.
    for (let i = 1; i <= 40; i++) {
      send(touchMove(L, second.hold, upper.x, upper.y - i * 6));
      send(touchMove(L, first.hold, lower.x, lower.y + i * 6));
    }
    expect(s.phase).toBe("land");
  });

  it("answers the pose that is one seat's alone", () => {
    const world = hung();
    // The fourth: the navigator pulls the tail up and the pilot has nothing.
    const s = acting(world, 3);
    const at = ringAt(s, world, markOf(s, "p2"));
    const t = deskDown(L, at.x, at.y, BOTH, (seat) => instarField(world, seat));
    expect(t?.player).toBe(2);
    expect(t?.command).toMatchObject({ kind: "drag", target: "instarMark", on: true });
  });

  it("leaves a mark both hands may take with the seat the pointer already had", () => {
    const world = hung();
    // The fifth is held by the pair together, so there is no seat to read off
    // it and the desk's unasked seat stands.
    const s = acting(world, 4);
    const at = ringAt(s, world, markOf(s, "both"));
    expect(deskDown(L, at.x, at.y, BOTH, (seat) => instarField(world, seat))?.player).toBe(1);
  });

  it("is still refused, seat by seat, while a seat key is held", () => {
    const world = hung();
    const s = acting(world, 0);
    const field = (seat: 1 | 2): Field => instarField(world, seat);
    const navigator = ringAt(s, world, markOf(s, "p2"));
    // `1` held: the pointer is the pilot's hand, and the navigator's ring
    // answers it as the phone would — pressed, signed player 1, and refused by
    // the simulation. That feedback is the boss's, and a tester asks for it
    // this way (`sim/instar-hand.ts`).
    expect(deskDown(L, navigator.x, navigator.y, pointerSeats("test", 1), field)?.player).toBe(1);
    expect(deskDown(L, navigator.x, navigator.y, pointerSeats("test", 2), field)?.player).toBe(2);
  });
});

/** THE GAUGE's round in play, its band wound — the navigator's handle, and one
 * a seat that does not own it cannot see at all. */
function gauge(): GaugeState {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  g.phase = "play";
  g.boundBeat = 3;
  return g;
}

function gaugeField(seat: 1 | 2, g: GaugeState): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: g,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a press on a handle only one seat has", () => {
  it("takes the seat that finds it, without being told whose it is", () => {
    const g = gauge();
    const at = gaugeBandGrip(L, DEFAULT_CONFIG, gaugeDial(L), g);
    const field = (seat: 1 | 2): Field => gaugeField(seat, g);
    // The pilot's hit test finds nothing there at all, which is how every
    // handle but THE INSTAR's marks says "not yours".
    expect(deskDown(L, at.x, at.y, [1], field)).toBeNull();
    const t = deskDown(L, at.x, at.y, BOTH, field);
    expect(t?.player).toBe(2);
    expect(t?.command).toMatchObject({ target: "gaugeBand", on: true });
    expect(t?.hold).toMatchObject({ kind: "drag", target: "gaugeBand", player: 2 });
  });

  it("finds nothing where neither seat has anything", () => {
    const g = gauge();
    const field = (seat: 1 | 2): Field => gaugeField(seat, g);
    const dial = gaugeDial(L);
    expect(deskDown(L, dial.cx, dial.cy - dial.r * 3, BOTH, field)).toBeNull();
  });
});
