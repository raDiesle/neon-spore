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
  stareLevelPattern,
  stareStepAt,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE STARE, rebuilt 29 September 2026: levels of an authored beat pattern,
 * each taught once in blue and then played for real, a shut eye that takes
 * one hit a level, an open eye that freezes both seats, and a charge after
 * every pass that only the lid can vent (`sim/stare.ts`).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;
/** Short patterns, so a run reaches the part a test is about. */
const LEVELS = ["..x..", ".x..x"];
const MID = midCol(CFG);

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

/** A thumb on the lid, `depth` thousandths of a tile down. */
function lid(world: World, player: 1 | 2, depth: number): TimedCommand {
  return cmd(world, player, {
    kind: "drag",
    target: "stareLid",
    on: true,
    fromMilli: 0,
    fromYMilli: depth,
  });
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

/** The lid pulled to the bottom the tick the charge starts. */
function vent(w: World): TimedCommand[] {
  const s = stareBoss(w);
  return s?.phase === "charge" ? [lid(w, 1, CFG.stareLidPullMilli)] : [];
}

/** Fire up the middle on a shut live beat whose next beat is shut too, and vent every charge. */
function play(w: World): TimedCommand[] {
  const s = stareBoss(w);
  if (s === null) return [];
  if (s.phase === "charge") return vent(w);
  if (s.phase !== "live" || s.open) return [];
  const next = stareStepAt(s, w.beat) + 1;
  if (stareLevelPattern(s)[next] !== ".") return [];
  return [cmd(w, 2, { kind: "fire", color: "cyan" })];
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

  it("charges after a live pass, and the beam fails the wave if nobody pulls the lid", () => {
    const world = open();
    const seen = until(world, inPhase("charge"));
    expect(seen.some((e) => e.type === "stareCharge")).toBe(true);
    const blasted = until(world, (w) => failHolds(w) || stareBoss(w)?.phase === "rest");
    expect(blasted.some((e) => e.type === "stareBlast" && e.col === MID)).toBe(true);
    expect(failHolds(world)).toBe(true);
  });

  it("vents to the sides when either seat pulls the lid to the bottom", () => {
    for (const player of [1, 2] as const) {
      const world = open();
      until(world, inPhase("charge"));
      step(world, [lid(world, player, CFG.stareLidPullMilli / 2)]);
      expect(eye(world).lidSeat).toBe(player);
      step(world, [lid(world, player, CFG.stareLidPullMilli)]);
      expect(world.events.some((e) => e.type === "stareVent" && e.player === player)).toBe(true);
      expect(eye(world).phase).toBe("rest");
      expect(eye(world).pass).toBe(1);
      expect(failHolds(world)).toBe(false);
    }
  });

  it("takes the lid from nobody outside a charge", () => {
    const world = open();
    until(world, inPhase("teach"));
    step(world, [lid(world, 1, CFG.stareLidPullMilli)]);
    expect(eye(world).lidSeat).toBe(0);
    expect(world.events.some((e) => e.type === "stareVent")).toBe(false);
  });

  it("starts the level again from its blue pass after three passes with no hit", () => {
    const world = open();
    const seen = until(
      world,
      (w) => eye(w).pass === 0 && eye(w).phase === "teach" && w.beat > 0,
      vent,
    );
    // The first teach is the one it opened on; this is the second.
    const again = seen.filter((e) => e.type === "stareAgain");
    expect(again.length).toBe(0);
    const more = until(world, (w) => w.events.some((e) => e.type === "stareAgain"), vent);
    expect(more.filter((e) => e.type === "stareVent").length).toBe(CFG.starePasses);
    expect(eye(world).level).toBe(0);
    until(world, inPhase("teach"), vent);
    expect(failHolds(world)).toBe(false);
  });

  it("takes a hit on the shut eye in a live pass and moves on to the next level", () => {
    const world = open();
    const seen = until(world, (w) => eye(w).level === 1, play);
    expect(seen.some((e) => e.type === "stareHit" && e.level === 0 && !e.last)).toBe(true);
    expect(eye(world).phase).toBe("hurt");
    expect(failHolds(world)).toBe(false);
  });

  it("ignores a bolt at the eye while it teaches", () => {
    const world = open();
    until(world, inPhase("teach"));
    const seen = until(world, inPhase("live"), (w) =>
      eye(w).open ? [] : [cmd(w, 2, { kind: "fire", color: "cyan" })],
    );
    expect(seen.some((e) => e.type === "stareHit")).toBe(false);
    expect(eye(world).level).toBe(0);
  });

  it("dies after its last level is hit, and leaves the field", () => {
    const world = open(["..x..", ".x..x", "x...x", "..x.x", "x.x.."]);
    const seen = until(world, (w) => w.boss === null, play, 600);
    expect(seen.filter((e) => e.type === "stareHit").length).toBe(5);
    expect(seen.some((e) => e.type === "stareHit" && e.last)).toBe(true);
    expect(seen.some((e) => e.type === "stareOut")).toBe(true);
    expect(failHolds(world)).toBe(false);
  });

  it("plays the same fight on both phones from the same presses", () => {
    const a = open();
    const b = open();
    for (let i = 0; i < 80 * TPB; i++) {
      step(a, play(a));
      step(b, play(b));
      if (a.boss === null) break;
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
