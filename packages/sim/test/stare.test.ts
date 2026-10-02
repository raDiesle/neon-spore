import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  midCol,
  type SimConfig,
  type SimEvent,
  type StareState,
  stareBoss,
  stareLashesOwed,
  stareLevelPattern,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE STARE, rebuilt 29 September 2026 and again on 2 October: levels of an
 * authored beat pattern, each taught once in blue and then played for real
 * for `stareTurns` turns, an open eye that freezes both seats, a charge after
 * every pass that only the lashes vent, and an eye nothing hurts
 * (`sim/stare.ts`).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;
/** Short patterns, so a run reaches the part a test is about. */
const LEVELS = ["..x..", ".x..x"];
const MID = midCol(CFG);
const PULL = CFG.stareLashPullMilli;

function open(levels: readonly string[] = LEVELS, seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "stare", levels });
  return world;
}

function eye(world: World): StareState {
  const boss = stareBoss(world);
  if (boss === null) throw new Error("no eye installed");
  return boss;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** A thumb on the lashes, `y` thousandths of a tile from where it grabbed, down positive. */
function lash(world: World, player: 1 | 2, y: number, on = true): TimedCommand {
  return cmd(world, player, { kind: "drag", target: "stareLash", on, fromMilli: 0, fromYMilli: y });
}

/** Step until `done` holds, with `hand` choosing each tick's presses. Returns every event. */
function until(
  world: World,
  done: (w: World) => boolean,
  hand: (w: World) => TimedCommand[] = () => [],
  capBeats = 200,
): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < capBeats * TPB; i++) {
    if (done(world)) return seen;
    step(world, hand(world));
    seen.push(...world.events);
  }
  throw new Error("never got there");
}

const inPhase = (phase: StareState["phase"]) => (w: World) => stareBoss(w)?.phase === phase;

/**
 * One lash a tick while the eye charges: the pilot's thumb up and down,
 * grabbing on one tick and pulling up the next.
 */
function vent(w: World): TimedCommand[] {
  const s = stareBoss(w);
  if (s?.phase !== "charge") return [];
  return [lash(w, 1, s.lashHeld[0] ? -PULL : 0)].concat(
    s.lashHeld[0] ? [lash(w, 1, 0, false)] : [],
  );
}

describe("THE STARE", () => {
  it("rests, then teaches its pattern in blue, and the blue pass costs nothing", () => {
    const world = open();
    expect(eye(world).phase).toBe("rest");
    until(world, inPhase("teach"));
    const opened = until(
      world,
      (w) => eye(w).open,
      (w) => [cmd(w, 1, { kind: "cannonCol", col: 1 })],
    );
    expect(opened.some((e) => e.type === "stareBeat" && e.teach)).toBe(true);
    // Open, teaching, and a press on it: the cannon moves and nothing pays.
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 2 })]);
    expect(world.cannonCol).toBe(2);
    expect(failHolds(world)).toBe(false);
    expect(eye(world).caughtTick).toBe(-1);
  });

  it("opens on the pattern's beats and no others", () => {
    const world = open();
    const pattern = stareLevelPattern(eye(world));
    const heard: string[] = [];
    for (const e of until(world, inPhase("live"))) {
      if (e.type === "stareBeat" && e.teach) heard.push(e.open ? "x" : ".");
    }
    expect(heard.join("")).toBe(pattern);
  });

  it("strikes the column the cannon was sent to when a seat moves on an open live beat", () => {
    const world = open();
    until(world, (w) => eye(w).phase === "live" && eye(w).open);
    // Column 1 and not the middle: the cannon opens a wave in the middle.
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 1 })]);
    expect(eye(world).caughtPlayer).toBe(1);
    expect(eye(world).caughtCol).toBe(1);
    const caught = world.events.find((e) => e.type === "stareCaught");
    expect(caught?.type === "stareCaught" && caught.col).toBe(1);
    expect(failHolds(world)).toBe(true);
  });

  it("freezes the navigator too: a shield press on an open beat is caught", () => {
    const world = open();
    until(world, (w) => eye(w).phase === "live" && eye(w).open);
    step(world, [cmd(world, 2, { kind: "shieldCol", col: 1 })]);
    expect(eye(world).caughtPlayer).toBe(2);
    expect(failHolds(world)).toBe(true);
  });

  it("lets a seat leave the run on an open beat, because a frozen pair is not a trapped one", () => {
    const world = open();
    until(world, (w) => eye(w).phase === "live" && eye(w).open);
    step(world, [cmd(world, 1, { kind: "restart" })]);
    expect(failHolds(world)).toBe(false);
    expect(world.events.some((e) => e.type === "needWave")).toBe(true);
  });

  it("charges after a live pass, and the beam fails the wave if the lashes stay down", () => {
    const world = open();
    const seen = until(world, inPhase("charge"));
    const charge = seen.find((e) => e.type === "stareCharge");
    expect(charge?.type === "stareCharge" && charge.lashes).toBe(CFG.stareLashesFirst);
    const blasted = until(world, (w) => failHolds(w) || stareBoss(w)?.phase === "rest");
    expect(blasted.some((e) => e.type === "stareBlast" && e.col === MID)).toBe(true);
    expect(failHolds(world)).toBe(true);
  });

  it("pulls a lash each time a thumb rises a pull above its lowest", () => {
    const world = open();
    until(world, inPhase("charge"));
    step(world, [lash(world, 1, 0)]);
    step(world, [lash(world, 1, -PULL / 2)]);
    expect(eye(world).lashMilli[0]).toBe(PULL / 2);
    expect(eye(world).lashesUp).toBe(0);
    step(world, [lash(world, 1, -PULL)]);
    expect(eye(world).lashesUp).toBe(1);
    // Back down, and up again from the new low: the next lash.
    step(world, [lash(world, 1, PULL)]);
    step(world, [lash(world, 1, 0)]);
    expect(eye(world).lashesUp).toBe(2);
    expect(world.events.some((e) => e.type === "stareLash" && e.up === 2)).toBe(true);
  });

  it("counts both seats' lashes together, and vents when the last comes up", () => {
    const world = open();
    until(world, inPhase("charge"));
    const owed = stareLashesOwed(eye(world), CFG);
    expect(owed).toBe(4);
    const seen: SimEvent[] = [];
    for (let i = 0; i < owed / 2; i++) {
      step(world, [lash(world, 1, 0), lash(world, 2, 0)]);
      step(world, [lash(world, 1, -PULL), lash(world, 2, -PULL)]);
      seen.push(...world.events);
      step(world, [lash(world, 1, 0, false), lash(world, 2, 0, false)]);
    }
    expect(seen.filter((e) => e.type === "stareLash").length).toBe(owed);
    expect(seen.some((e) => e.type === "stareVent")).toBe(true);
    expect(eye(world).phase).toBe("rest");
    expect(eye(world).turn).toBe(1);
    expect(failHolds(world)).toBe(false);
  });

  it("takes a lash from nobody outside a charge", () => {
    const world = open();
    until(world, inPhase("teach"));
    step(world, [lash(world, 1, 0)]);
    step(world, [lash(world, 1, -PULL)]);
    expect(eye(world).lashesUp).toBe(0);
    expect(eye(world).lashHeld[0]).toBe(false);
  });

  it("is never caught for a thumb on the lashes on an open beat", () => {
    const world = open();
    until(world, (w) => eye(w).phase === "live" && eye(w).open);
    step(world, [lash(world, 2, 0)]);
    expect(failHolds(world)).toBe(false);
  });

  it("rises to the next level after stareTurns turns, and asks twice the lashes", () => {
    const world = open();
    const seen = until(world, inPhase("rise"), vent);
    expect(seen.filter((e) => e.type === "stareVent").length).toBe(CFG.stareTurns);
    expect(seen.some((e) => e.type === "stareRise" && e.level === 0 && !e.last)).toBe(true);
    expect(eye(world).level).toBe(1);
    expect(eye(world).turn).toBe(0);
    // The next level opens on its own blue pass.
    until(world, inPhase("teach"), vent);
    const more = until(world, inPhase("charge"), vent);
    expect(more.some((e) => e.type === "stareCharge" && e.lashes === 8)).toBe(true);
    expect(failHolds(world)).toBe(false);
  });

  it("is not hurt by a bolt, in any phase, and the bolt is not wasted", () => {
    const world = open();
    const seen = until(world, inPhase("charge"), (w) =>
      eye(w).open ? [] : [cmd(w, 2, { kind: "fire", color: "cyan" })],
    );
    expect(seen.some((e) => e.type === "shotOut" && e.col === MID && !e.wasted)).toBe(true);
    expect(eye(world).level).toBe(0);
    expect(failHolds(world)).toBe(false);
  });

  it("calms after its last level is survived, and leaves the field", () => {
    const world = open();
    const seen = until(world, (w) => w.boss === null, vent, 2000);
    expect(seen.filter((e) => e.type === "stareRise").length).toBe(LEVELS.length);
    expect(seen.some((e) => e.type === "stareRise" && e.last)).toBe(true);
    expect(seen.some((e) => e.type === "stareOut")).toBe(true);
    expect(failHolds(world)).toBe(false);
  });

  it("plays the same fight on both phones from the same presses", () => {
    const a = open();
    const b = open();
    for (let i = 0; i < 80 * TPB; i++) {
      step(a, vent(a));
      step(b, vent(b));
      if (a.boss === null) break;
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
