import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BatonBead,
  type BatonState,
  batonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { podCenter } from "../src/pods.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE BATON, and the word each of its four stages says**
 * (`render/src/boss-cue-read-i.ts`).
 *
 * The arm's own two — `LAUNCH` on a bead in its socket and `FIRE` on one in
 * the air — were the whole reading until 18 September 2026, and they are a
 * third of the fight: the cannon the flight has to be met in, the crossing's
 * act a beat and the pod at the end were all answered on a field that said
 * nothing. The cases below are one per stage, and the two that carry the most
 * are the last two — the order on the pilot's screen, and the sweep proving
 * that none of the new words is a colour or a column (`decisions.md` #34).
 *
 * The states are set rather than played into: every clock under them is
 * proved in `sim/test/baton*.test.ts`, and a test that passed three beads
 * down the arm to reach the crossing would be that suite's second copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; b: BatonState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 3 * TPB; i++) step(world, []);
  const b = batonBoss(world);
  if (b === null) throw new Error("the baton's wave installed no arm");
  b.stage = "passing";
  b.lockUntil = [-1, -1];
  return { world, b };
}

/** The bead the wave opened with, sitting in its socket. */
function only(b: BatonState): BatonBead {
  const bead = b.beads[0];
  if (bead === undefined) throw new Error("the arm lit no bead");
  return bead;
}

/** Put that bead in the air, out of the socket it is in. */
function fly(world: World, bead: BatonBead, col: number): void {
  bead.flying = true;
  bead.struck = false;
  bead.flightTick = world.tick;
  bead.col = col;
  bead.fromCol = col;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** A column the cannon is not standing in. */
function elsewhere(world: World): number {
  return world.cannonCol === 0 ? CFG.cols - 1 : 0;
}

describe("the arm passing a bead", () => {
  it("gives the launch to the pilot and the shot to the navigator", () => {
    const { world, b } = opened();
    const bead = only(b);
    bead.flying = false;
    expect(word(world, "p1")).toBe("LAUNCH");
    expect(word(world, "p2")).toBeNull();

    fly(world, bead, world.cannonCol);
    expect(word(world, "p2")).toBe("FIRE");
  });

  it("says nothing to a seat the fight has locked out", () => {
    const { world, b } = opened();
    only(b).flying = false;
    b.lockUntil = [world.beat + 1, -1];
    expect(word(world, "p1")).toBeNull();
  });

  it("tells the pilot to move while the flight is in a column he is not under", () => {
    const { world, b } = opened();
    fly(world, only(b), elsewhere(world));
    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    // On his own cannon, where it stands, and never on the column it is owed:
    // which column is the sentence the pair has to say.
    expect(his?.x).toBeCloseTo(tileCX(LAYOUT.p1, world.cannonCol), 6);

    world.cannonCol = elsewhere(world);
    expect(word(world, "p1")).toBeNull();
  });

  it("leaves her word standing whether or not he has arrived", () => {
    // THE VANE's rule: the cannon is not drawn on her screen, so a `FIRE` that
    // waited for it would hand her the one thing he has to say out loud.
    const { world, b } = opened();
    fly(world, only(b), elsewhere(world));
    expect(word(world, "p2")).toBe("FIRE");
    world.cannonCol = elsewhere(world);
    expect(word(world, "p2")).toBe("FIRE");
  });

  it("puts the flight above the socket on his screen, both being his", () => {
    const { world, b } = opened();
    const flying = only(b);
    fly(world, flying, elsewhere(world));
    // The twin, sitting in the socket above and launchable (`batonLaunchable`).
    b.beads.push({ ...flying, flying: false, flightTick: -1, socket: 0, satBeat: world.beat - 1 });
    // A three-beat window against a two-beat one: the flight is what expires
    // first, and a bead nobody met lands back where it left.
    expect(word(world, "p1")).toBe("MOVE");
    world.cannonCol = elsewhere(world);
    expect(word(world, "p1")).toBe("LAUNCH");
  });
});

describe("the crossing", () => {
  function crossing(acts: number): World {
    const { world, b } = opened();
    fly(world, only(b), world.cannonCol);
    only(b).final = true;
    b.stage = "crossing";
    b.stageBeat = world.beat;
    b.acts = acts;
    return world;
  }

  it("says one word, on the seat whose act is due", () => {
    const his = crossing(0);
    expect(word(his, "p1")).toBe("SEND");
    expect(word(his, "p2")).toBeNull();

    const hers = crossing(1);
    expect(word(hers, "p1")).toBeNull();
    expect(word(hers, "p2")).toBe("FIRE");
  });

  it("takes it away from a seat locked through this beat", () => {
    const world = crossing(0);
    const b = batonBoss(world);
    if (b === null) throw new Error("the arm went away");
    b.lockUntil = [world.beat, -1];
    expect(word(world, "p1")).toBeNull();
  });
});

describe("the drop, which is the fight", () => {
  function falling(col: number): World {
    const { world, b } = opened();
    world.cannonCol = col;
    b.stage = "falling";
    b.beads = [];
    b.podId = world.nextId++;
    world.pods.push({
      id: b.podId,
      colMilli: col * 1000,
      rowMilli: 4000,
      driftMilli: 0,
      loose: true,
      kind: "purge",
      husk: false,
      crossMilli: 0,
    });
    return world;
  }

  it("moves him under the pod, then offers him the maw", () => {
    const world = falling(0);
    const pod = world.pods[0];
    if (pod === undefined) throw new Error("the bead never dropped");
    world.cannonCol = elsewhere(world);
    expect(word(world, "p1")).toBe("MOVE");

    world.cannonCol = 0;
    const his = cue(world, "p1");
    expect(his?.word).toBe("OPEN");
    expect(his?.kind).toBe("PRESS");
    expect(his?.y).toBeCloseTo(podCenter(LAYOUT.p1, pod).y, 6);
    // The catch is his alone: she is told nothing at all (`baton-cross.ts`).
    expect(word(world, "p2")).toBeNull();
  });
});

describe("what the whole fight may say", () => {
  it("is five verbs, and never a colour, a column or a count", () => {
    const seen = new Set<string>();
    const stages = ["passing", "crossing", "falling"] as const;
    for (const stage of stages) {
      for (const acts of [0, 1]) {
        for (const flying of [false, true]) {
          for (const cannonCol of [0, 3, CFG.cols - 1]) {
            const { world, b } = opened();
            const bead = only(b);
            b.stage = stage;
            b.acts = acts;
            b.stageBeat = world.beat;
            world.cannonCol = cannonCol;
            if (flying) fly(world, bead, 3);
            else bead.flying = false;
            if (stage === "falling") {
              b.beads = [];
              b.podId = world.nextId++;
              world.pods.push({
                id: b.podId,
                colMilli: 3000,
                rowMilli: 4000,
                driftMilli: 0,
                loose: true,
                kind: "purge",
                husk: false,
                crossMilli: 0,
              });
            }
            for (const role of ["p1", "p2"] as const) {
              const c = cue(world, role);
              if (c !== null) seen.add(`${c.kind}·${c.word}·${c.seat}`);
            }
          }
        }
      }
    }
    expect([...seen].sort()).toEqual([
      "CARRY·MOVE·1",
      "PRESS·FIRE·2",
      "PRESS·LAUNCH·1",
      "PRESS·OPEN·1",
      "PRESS·SEND·1",
    ]);
  });
});
