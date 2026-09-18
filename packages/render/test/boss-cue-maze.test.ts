import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MazeState,
  mazeBottomCol,
  mazeCurrent,
  mazeEntranceCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { mazeStringCircle } from "../src/maze-string.js";
import { mazeDrum } from "../src/maze-walls.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MAZE, and the three words the field may say about it**
 * (`render/src/boss-cue-read-e.ts`).
 *
 * The round has no secret — the lit door, the shot's walk and the heart's
 * colour are all on both screens — so what the cases here hold is the *other*
 * rule of `decisions.md` #34: a cue is drawn on the seat that can act, and it
 * never says a thing that seat was not already shown. The load-bearing one is
 * the fourth: her word must not change on the beat his cannon arrives, because
 * his cannon is not on her screen and a word that came out then would say for
 * him the one thing he has to say himself.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The only column a way in can ever click onto: the one under the drum. */
const LOCK_COL = mazeBottomCol(CFG);

function opened(): { world: World; m: MazeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("maze");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const m = world.boss;
  if (m === null || m.kind !== "maze") throw new Error("the maze's wave installed no maze");
  return { world, m };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/**
 * A way in stood on the column, found by turning the wheel a thousandth of a
 * degree at a time until the simulation itself says it is there — rather than
 * by a second copy of the angle that puts it there (`mazeClickAngle`, which is
 * not on the package's surface and does not need to be for this).
 */
function lock(m: MazeState, way: number): void {
  const wheel = mazeCurrent(m);
  if (wheel === null) throw new Error("no wheel");
  for (let a = 0; a < 360_000; a += 200) {
    if (mazeEntranceCol(CFG, wheel, a, way) !== LOCK_COL) continue;
    m.phase = "read";
    m.angleMilli = a;
    m.lockedWay = way;
    m.lockedCol = LOCK_COL;
    return;
  }
  throw new Error(`way ${way} never stands on column ${LOCK_COL}`);
}

describe("THE MAZE", () => {
  it("says nothing outside the pair's turn", () => {
    const { world, m } = opened();
    for (const phase of ["lead", "travel", "verdict"] as const) {
      m.phase = phase;
      expect(cue(world, "p1"), phase).toBeNull();
      expect(cue(world, "p2"), phase).toBeNull();
    }
  });

  it("under the grip: HOLD on the string for him until he has it, PULL on the heart for her", () => {
    const { world, m } = opened();
    m.phase = "grip";
    m.dragging = false;
    const his = cue(world, "p1");
    expect(his?.word).toBe("HOLD");
    expect(his?.kind).toBe("CARRY");
    expect(his?.seat).toBe(1);
    expect(his?.y).toBe(mazeStringCircle(LAYOUT.p1, CFG).y);
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("PULL");
    expect(hers?.seat).toBe(2);
    const d = mazeDrum(LAYOUT.p2, CFG);
    expect(hers?.x).toBe(d.cx);
    expect(hers?.y).toBe(d.cy);
    // His hand on it: the field has nothing more to say to him, and still
    // asks her — whether he is braced is the one thing she cannot see.
    m.dragging = true;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("PULL");
  });

  it("asks the pilot to TURN, on the handle, while nothing has clicked", () => {
    const { world, m } = opened();
    m.phase = "read";
    m.lockedCol = -1;
    const c = cue(world, "p1");
    expect(c?.word).toBe("TURN");
    expect(c?.kind).toBe("CARRY");
    expect(c?.seat).toBe(1);
    expect(c?.y).toBe(mazeStringCircle(LAYOUT.p1, CFG).y);
    // Her screen draws the handle too, and she may not pull it.
    expect(cue(world, "p2")).toBeNull();
  });

  it("moves to the cannon once a way in has clicked, and lights her door", () => {
    const { world, m } = opened();
    lock(m, 0);
    world.cannonCol = 0;

    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.seat).toBe(1);
    // On the cannon where it stands, never on the column it is wanted at.
    expect(his?.x).toBe(tileCX(LAYOUT.p1, 0));
    expect(his?.y).toBe(LAYOUT.p1.hullY);

    const hers = cue(world, "p2");
    expect(hers?.word).toBe("FIRE");
    expect(hers?.seat).toBe(2);
    // On the rim of the drum, at the door that clicked: the thing her screen
    // is already lighting (`maze-door.ts`).
    // A pixel of tolerance: the mouth is the middle of the chord between the
    // two cut ends, which is a hair inside the circle they stand on.
    const d = mazeDrum(LAYOUT.p2, CFG);
    const out = Math.hypot((hers?.x ?? 0) - d.cx, (hers?.y ?? 0) - d.cy);
    expect(Math.abs(out - d.r)).toBeLessThan(2);
    expect(Math.abs((hers?.x ?? 0) - tileCX(LAYOUT.p2, LOCK_COL))).toBeLessThan(LAYOUT.p2.tile);
  });

  it("says the same word to her on the beat his cannon arrives, and nothing to him", () => {
    const { world, m } = opened();
    lock(m, 0);
    world.cannonCol = LOCK_COL;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("FIRE");
  });

  it("never says a column, a colour or a way: three words, whatever the wheel is doing", () => {
    const { world, m } = opened();
    const seen = new Set<string>();
    const say = (role: ViewRole) => {
      const c = cue(world, role);
      if (c !== null) seen.add(`${c.kind}\u00b7${c.word}\u00b7${c.seat}`);
    };
    for (let round = 0; round < m.rounds.length; round++) {
      m.round = round;
      const wheel = m.rounds[round];
      if (wheel === undefined) continue;
      for (const [way] of wheel.entrances.entries()) {
        for (const shotColor of [0, 1]) {
          m.shotColor = shotColor;
          lock(m, way);
          world.cannonCol = 0;
          say("p1");
          say("p2");
        }
      }
      m.lockedCol = -1;
      m.phase = "read";
      say("p1");
    }
    expect([...seen].sort()).toEqual([
      "CARRY\u00b7MOVE\u00b71",
      "CARRY\u00b7TURN\u00b71",
      "PRESS\u00b7FIRE\u00b72",
    ]);
  });

  it("reaches the first word by playing, on the beat the pair's turn begins", () => {
    const { world, m } = opened();
    let guard = 0;
    while (m.phase === "lead" && guard++ < 60 * TPB) step(world, []);
    expect(m.phase).toBe("read");
    expect(cue(world, "p1")?.word).toBe("TURN");
  });
});
