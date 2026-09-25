import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type FilamentPath,
  type FilamentState,
  filamentBoss,
  hashWorld,
  NO_GRAB,
  NOT_DRAWN,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE FILAMENT: the one boss that is a trace, and the trace is not fixed.
 *
 * What these pin is the rule a phone cannot show: that a filament is armed
 * for its beats before either thumb counts; that the pilot lights the next
 * tile and only the next, a tile a beat, and two in a beat or a tile skipped
 * is the snap; that the navigator moves along the lit part and only the lit
 * part, and her thumb reaching his is the recoil unless his is the root, in
 * which case it is the pull; that a gap past the window is the filament
 * going dark; that every one of those is the filament back to its free end
 * with both grabs let go, and a strike on the hull that is the wave; that a
 * pull is THE SLOW and the next filament
 * armed; and that the last is the body down, out, and the wave cleared.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const ARM = CFG.filamentArmBeats;

/** Six tiles straight up from (5,8), then three straight up from (3,9) — the
 * thumbs below are carried straight up, so a bend is walked but not traced. */
const PATHS: FilamentPath[] = [
  { col: 5, row: 8, moves: "UUUUU" },
  { col: 3, row: 9, moves: "UU" },
];

function install(
  paths: readonly FilamentPath[] = PATHS,
  seed = 0,
  hullInvulnerable = false,
): World {
  const world = createWorld({ ...CFG, hullInvulnerable }, seed);
  startWave(world, 0, [], [], { kind: "filament", filaments: paths });
  return world;
}

function filament(world: World): FilamentState {
  const s = filamentBoss(world);
  if (s === null) throw new Error("the wave installed no filament");
  return s;
}

/** A thumb grabbing (`up` 0) or carried `up` tiles from where it grabbed. */
const thumb = (tick: number, player: 1 | 2, up: number, on = true): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "filament", on, fromMilli: 0, fromYMilli: -up * 1000 },
});

/** Step to a tick, feeding commands on the tick they are stamped for, and
 * say which event types went by — `world.events` is one tick's worth. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

/** Past the arm: the thumbs count, on the tick after the beat that armed it. */
function armed(world: World): Set<string> {
  return runTo(world, world.tick + TPB * ARM + 1);
}

/** Both thumbs grabbed, one tick on. */
function grabbed(world: World): void {
  const t = world.tick;
  runTo(world, t + 1, [thumb(t, 1, 0), thumb(t, 2, 0)]);
}

/** A thumb carried to `up` tiles above its grab, one tick on. */
function carry(world: World, player: 1 | 2, up: number): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [thumb(t, player, up)]);
}

/** A beat on, with nothing sent. */
function beat(world: World): Set<string> {
  return runTo(world, world.tick + TPB);
}

describe("THE FILAMENT comes in", () => {
  it("over the middle with its filaments walked into tiles and the first arming", () => {
    const world = install();
    const s = filament(world);
    expect(s.phase).toBe("arm");
    expect(s.cursor).toBe(0);
    expect(s.tiles[0]).toEqual([
      { col: 5, row: 8 },
      { col: 5, row: 7 },
      { col: 5, row: 6 },
      { col: 5, row: 5 },
      { col: 5, row: 4 },
      { col: 5, row: 3 },
    ]);
    expect(s.tiles[1]).toEqual([
      { col: 3, row: 9 },
      { col: 3, row: 8 },
      { col: 3, row: 7 },
    ]);
    const bent = filament(install([{ col: 3, row: 9, moves: "URD" }]));
    expect(bent.tiles[0]).toEqual([
      { col: 3, row: 9 },
      { col: 3, row: 8 },
      { col: 4, row: 8 },
      { col: 4, row: 9 },
    ]);
    expect(world.events.some((e) => e.type === "filamentEnter")).toBe(true);
    const seen = runTo(world, TPB * ARM - 1);
    expect(seen.has("filamentArm")).toBe(false);
    expect(s.phase).toBe("arm");
  });

  it("arms the first filament after its beats, and a thumb before that is nothing", () => {
    const world = install();
    const s = filament(world);
    grabbed(world);
    carry(world, 1, 1);
    expect(s.head).toBe(0);
    expect(s.grab).toEqual([NO_GRAB, NO_GRAB]);
    const seen = armed(world);
    expect(seen.has("filamentArm")).toBe(true);
    expect(s.phase).toBe("trace");
    expect(s.head).toBe(0);
    expect(s.tail).toBe(0);
    expect(s.headBeat).toBe(NOT_DRAWN);
  });
});

describe("the pilot draws", () => {
  it("the next tile, a tile a beat, and the grab itself moves nothing", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    expect(s.grab[0]).toBe(0);
    expect(s.head).toBe(0);
    let seen = carry(world, 1, 1);
    expect(seen.has("filamentDrawn")).toBe(true);
    expect(s.head).toBe(1);
    expect(s.headBeat).toBe(world.beat);
    beat(world);
    seen = carry(world, 1, 2);
    expect(seen.has("filamentDrawn")).toBe(true);
    expect(s.head).toBe(2);
  });

  it("resolves the thumb to the nearest tile, so a half-tile is still the grab's", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    const t = world.tick;
    runTo(world, t + 1, [
      {
        tick: t,
        player: 1,
        command: { kind: "drag", target: "filament", on: true, fromMilli: 0, fromYMilli: -400 },
      },
    ]);
    expect(s.head).toBe(0);
    runTo(world, t + 2, [
      {
        tick: t + 1,
        player: 1,
        command: { kind: "drag", target: "filament", on: true, fromMilli: 0, fromYMilli: -600 },
      },
    ]);
    expect(s.head).toBe(1);
  });

  it("snaps the filament on two tiles in one beat, back to its free end with the grabs let go", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    carry(world, 1, 1);
    const seen = carry(world, 1, 2);
    expect(seen.has("filamentSnap")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    expect(s.head).toBe(0);
    expect(s.tail).toBe(0);
    expect(s.headBeat).toBe(NOT_DRAWN);
    expect(s.grab).toEqual([NO_GRAB, NO_GRAB]);
    expect(s.phase).toBe("trace");
  });

  it("snaps it on a tile skipped, and on a hull that cannot be struck the thumb grabs again", () => {
    const world = install(PATHS, 0, true);
    const s = filament(world);
    armed(world);
    grabbed(world);
    let seen = carry(world, 1, 2);
    expect(seen.has("filamentSnap")).toBe(true);
    seen = carry(world, 1, 1);
    expect(seen.has("filamentDrawn")).toBe(false);
    expect(s.grab[0]).toBe(0);
    expect(s.head).toBe(0);
    seen = carry(world, 1, 1);
    expect(seen.has("filamentDrawn")).toBe(true);
    expect(s.head).toBe(1);
  });

  it("nothing when the thumb rests, goes back or leaves the line", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    carry(world, 1, 1);
    beat(world);
    let seen = carry(world, 1, 1);
    expect(seen.has("filamentDrawn")).toBe(false);
    seen = carry(world, 1, 0);
    expect(seen.has("filamentSnap")).toBe(false);
    seen = carry(world, 1, -1);
    expect(seen.has("filamentSnap")).toBe(false);
    expect(s.head).toBe(1);
  });

  it("goes dark when the navigator falls further behind than the window", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    for (let up = 1; up <= CFG.filamentGapTiles; up++) {
      const seen = carry(world, 1, up);
      expect(seen.has("filamentDark")).toBe(false);
      beat(world);
    }
    expect(s.head).toBe(CFG.filamentGapTiles);
    const seen = carry(world, 1, CFG.filamentGapTiles + 1);
    expect(seen.has("filamentDrawn")).toBe(true);
    expect(seen.has("filamentDark")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    expect(s.head).toBe(0);
    expect(s.grab).toEqual([NO_GRAB, NO_GRAB]);
  });
});

describe("the navigator follows", () => {
  it("along the lit part behind him, and never onto what is not lit", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    let seen = carry(world, 2, 1);
    expect(seen.has("filamentFollowed")).toBe(false);
    expect(s.tail).toBe(0);
    carry(world, 1, 1);
    beat(world);
    carry(world, 1, 2);
    seen = carry(world, 2, 1);
    expect(seen.has("filamentFollowed")).toBe(true);
    expect(s.tail).toBe(1);
    seen = carry(world, 2, 3);
    expect(s.tail).toBe(1);
    expect(seen.has("filamentRecoil")).toBe(false);
  });

  it("recoils the filament when her thumb reaches his before the root", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    grabbed(world);
    carry(world, 1, 1);
    const seen = carry(world, 2, 1);
    expect(seen.has("filamentRecoil")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    expect(s.head).toBe(0);
    expect(s.tail).toBe(0);
    expect(s.grab).toEqual([NO_GRAB, NO_GRAB]);
  });
});

/** The armed filament traced end to end, a tile a beat, her a tile behind him. */
function traceOut(world: World): Set<string> {
  const s = filament(world);
  const n = s.tiles[s.cursor]?.length ?? 0;
  grabbed(world);
  const seen = new Set<string>();
  for (let k = 1; k < n; k++) {
    for (const e of carry(world, 1, k)) seen.add(e);
    if (k > 1) for (const e of carry(world, 2, k - 1)) seen.add(e);
    for (const e of beat(world)) seen.add(e);
  }
  for (const e of carry(world, 2, n - 1)) seen.add(e);
  return seen;
}

describe("a filament traced end to end", () => {
  it("is pulled out under THE SLOW, and the next is armed after the pull", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    const seen = traceOut(world);
    expect(seen.has("filamentRecoil")).toBe(false);
    expect(seen.has("filamentDark")).toBe(false);
    expect(seen.has("filamentPulled")).toBe(true);
    expect(seen.has("filamentLate")).toBe(false);
    expect(seen.has("waveFailed")).toBe(false);
    expect(s.phase).toBe("pull");
    expect(s.cursor).toBe(0);
    expect(world.slowToBeat).toBe(world.slowFromBeat + CFG.filamentSlowBeats);
    const next = runTo(world, world.tick + TPB * (CFG.filamentPullBeats + 1));
    expect(next.has("filamentArm")).toBe(false);
    expect(s.cursor).toBe(1);
    expect(s.phase).toBe("arm");
    expect(s.head).toBe(0);
    const arm = armed(world);
    expect(arm.has("filamentArm")).toBe(true);
    expect(s.phase).toBe("trace");
  });

  it("hears no thumb while it is being pulled", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    traceOut(world);
    const last = (s.tiles[0]?.length ?? 0) - 1;
    expect(s.head).toBe(last);
    expect(s.tail).toBe(last);
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 1, 0, false), thumb(t, 2, 0, false)]);
    grabbed(world);
    carry(world, 1, -1);
    carry(world, 2, -1);
    expect(s.head).toBe(last);
    expect(s.tail).toBe(last);
  });

  it("the last time is the body down, then out, and the wave cleared", () => {
    const world = install();
    const s = filament(world);
    armed(world);
    traceOut(world);
    runTo(world, world.tick + TPB * (CFG.filamentPullBeats + 1));
    armed(world);
    let seen = traceOut(world);
    expect(seen.has("filamentPulled")).toBe(true);
    seen = runTo(world, world.tick + TPB * (CFG.filamentPullBeats + 1));
    expect(seen.has("filamentDown")).toBe(true);
    expect(s.phase).toBe("down");
    expect(world.restBeat).toBe(0);
    seen = runTo(world, world.tick + TPB * (CFG.filamentOutBeats + 1));
    expect(seen.has("filamentOut")).toBe(true);
    expect(world.boss).toBeNull();
    runTo(world, world.tick + TPB);
    expect(world.restBeat).not.toBe(0);
  });
});

describe("determinism", () => {
  it("hashes the same for the same thumbs and differently once a tile is lit", () => {
    const a = install();
    const b = install();
    armed(a);
    armed(b);
    grabbed(a);
    grabbed(b);
    carry(a, 1, 1);
    const before = hashWorld(b);
    carry(b, 1, 1);
    expect(hashWorld(a)).toBe(hashWorld(b));
    expect(hashWorld(b)).not.toBe(before);
  });
});
