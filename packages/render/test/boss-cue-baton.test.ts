import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  BATON_SOCKET_SWELL,
  type BatonBead,
  type BatonState,
  batonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { socketPoint, socketReach } from "../src/baton-socket-draw.js";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { batonCues } from "../src/boss-cue-read-i.js";
import { cueWordY } from "../src/boss-cue-text.js";
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
 * **THE BATON, and the word each of its five stages says**
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

/**
 * Every word this screen is offered this frame, not only the first. `bossCue`
 * picks one; the reading returns them in order, and a word ranked below
 * another still has to be the right word on the right screen.
 */
function words(world: World, role: ViewRole): string[] {
  const l = LAYOUT[role];
  const b = batonBoss(world);
  if (b === null) return [];
  return batonCues(l, world, b)
    .filter((c) => c.seat === (role === "p1" ? 1 : 2))
    .map((c) => c.word);
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
    const stages = ["passing", "merging", "crossing", "falling"] as const;
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
            if (stage === "merging") {
              bead.flying = false;
              bead.socket = CFG.batonSockets - 1;
              b.beads = [bead, { ...bead, socket: CFG.batonSockets - 2, color: "cyan" }];
            }
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
      "HOLD·HOLD·1",
      "HOLD·HOLD·2",
      "PRESS·FIRE·2",
      "PRESS·LAUNCH·1",
      "PRESS·OPEN·1",
      "PRESS·SEND·1",
    ]);
  });

  it("puts STRIP on the seat the beat locked out, and on neither otherwise", () => {
    const { world, b } = opened();
    only(b).flying = false;
    b.sockets[1] = BATON_SOCKET_SWELL;
    b.swellSocket = 1;
    b.swellBeat = world.beat;
    // Nobody locked: nobody may reach the arm, so nobody is asked.
    expect(words(world, "p2")).not.toContain("STRIP");
    b.lockUntil = [-1, world.beat];
    expect(words(world, "p2")).toContain("STRIP");
    expect(words(world, "p1")).not.toContain("STRIP");
  });

  it("gives each seat HOLD on its own bead while the two are drawn together", () => {
    const { world, b } = opened();
    const bead = only(b);
    bead.flying = false;
    bead.socket = CFG.batonSockets - 1;
    b.beads = [bead, { ...bead, socket: CFG.batonSockets - 2, color: "cyan" }];
    b.stage = "merging";
    b.stageBeat = world.beat;
    expect(word(world, "p1")).toBe("HOLD");
    expect(word(world, "p2")).toBe("HOLD");
    // The pilot's is a socket above the navigator's: geometry says whose bead
    // is whose, never colour (`sim/baton-hand.ts`).
    const his = cue(world, "p1");
    const hers = cue(world, "p2");
    expect(his?.y ?? 0).toBeLessThan(hers?.y ?? 0);
    // A thumb already down asks for nothing more.
    b.mergeThumbs = 1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBe("HOLD");
  });

  /**
   * The arm is the one boss whose marks stand a tile apart, and the frame the
   * verb hangs off is two thirds of a tile tall: the pilot's `HOLD` used to
   * land inside the navigator's bead, one socket down, legible only because
   * the text is drawn last (`docs/queue.md`, 20 September 2026). The word's
   * own baseline has to clear that socket's ring, not merely be a different
   * number from the one it was.
   */
  it("keeps the pilot's HOLD clear of the socket standing under it", () => {
    const { world, b } = opened();
    const bead = only(b);
    bead.flying = false;
    bead.socket = CFG.batonSockets - 1;
    b.beads = [bead, { ...bead, socket: CFG.batonSockets - 2, color: "cyan" }];
    b.stage = "merging";
    b.stageBeat = world.beat;
    const l = LAYOUT.p1;
    const his = cue(world, "p1");
    if (his === null) throw new Error("the pilot was asked for nothing");
    const under = socketPoint(l, CFG, b, CFG.batonSockets - 1);
    expect(cueWordY(his)).toBeLessThan(under.y - socketReach(l));
    // And it is still under his own mark, which is the side #34 puts it on.
    expect(cueWordY(his)).toBeGreaterThan(his.y);
    // The navigator's bead is the arm's last socket, so nothing caps hers.
    const hers = cue(world, "p2");
    expect(hers?.roomBelow).toBeUndefined();
  });
});
