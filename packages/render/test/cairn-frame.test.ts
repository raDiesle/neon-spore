import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CairnState,
  type Creature,
  createWorld,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { cairnUnits } from "../src/cairn.js";
import { drawPileHand } from "../src/cairn-hand.js";
import { showsCairnSettle } from "../src/cairn-settle.js";
import { drawGrips } from "../src/grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CAIRN, played rather than posed: the pile whole, a hand carried across
 * it, a unit coming away as a rock, the stack settling by one, and the lane
 * the pile is about to drop one into — which is drawn on one screen of the two
 * and has to go through a canvas on both.
 *
 * Nothing here can say whether the seams *read* as countable, or whether the
 * ring on the stone that is going is loud enough to be worth saying a column
 * about. Those need an eye and this lane owes them. What it holds is that the
 * pile, the settle mark and the shrinking stack have all been through a canvas
 * that refuses what a real one refuses — including the states a run with no
 * commands never reaches, because nobody's hand is on anything.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

/**
 * The wave, installed. `hullInvulnerable` where a run is meant to last: seven
 * rocks let go into an undefended field break the ship long before the pile is
 * empty, and a lost wave restarts into a full pile — so the states after the
 * last stone are ones no honest run ever reaches (`wave-fail.ts`).
 */
function cairnWorld(hull = false): World {
  const world = createWorld({ ...CFG, hullInvulnerable: hull }, 3);
  const index = waveWith("cairn");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function boss(world: World): CairnState {
  if (world.boss?.kind !== "cairn") throw new Error("the cairn wave installed no cairn");
  return world.boss;
}

const pile = (world: World): Creature | undefined =>
  world.creatures.find((c) => c.kind === "cairn");

function cairnFrames(role: ViewRole, ticks: number, hands = true, hull = false) {
  const world = cairnWorld(hull);
  const held = pile(world)?.id ?? 0;
  return runFrames(world, role, ticks, {
    every: 2,
    onTick: (tick, w) => {
      // One grab, then a finger walking further and further to one side: the
      // carry is cumulative from where it took hold, so this is one thumb
      // dragging rocks out of the right of the pile beat after beat.
      const inputs: TimedCommand[] =
        !hands || held === 0
          ? []
          : tick === 2
            ? [{ tick, player: 1, command: { kind: "grip", id: held } }]
            : tick > 2
              ? [
                  {
                    tick,
                    player: 1,
                    command: {
                      kind: "drag",
                      target: "gripBody",
                      on: true,
                      fromMilli: Math.round((tick / TPB) * CFG.gripPushMilli),
                      id: held,
                    },
                  },
                ]
              : [];
      step(w, inputs);
    },
  });
}

describe("a pile through a canvas that refuses what a real one does", () => {
  for (const role of ROLES) {
    it(`draws the stack, the pull and the settle mark as ${role}`, () => {
      const { ctx, events, world } = cairnFrames(role, TPB * 6);
      expect(ctx.calls, role).toBeGreaterThan(0);
      // The run reached the state its frames were meant to prove.
      expect(events.filter((e) => e.type === "cairnPulled").length, role).toBeGreaterThan(0);
      expect(boss(world).units, role).toBeLessThan(CFG.cairnUnits);
    });
  }

  it("draws the pile letting one go with nobody's hands on it", () => {
    const { ctx, events } = cairnFrames("p1", TPB * (CFG.cairnShedBeats + 2), false);
    expect(ctx.calls).toBeGreaterThan(0);
    expect(events.filter((e) => e.type === "cairnShed").length).toBeGreaterThan(0);
  });

  it("draws the last rock coming away and the field it leaves behind", () => {
    // Long enough for the clock to empty the whole pile: the frames after the
    // seventh are drawn with no boss body at all, which is the branch a run
    // that stops at six never reaches.
    const { ctx, world } = cairnFrames(
      "test",
      TPB * CFG.cairnShedBeats * (CFG.cairnUnits + 1),
      false,
      true,
    );
    expect(ctx.calls).toBeGreaterThan(0);
    expect(pile(world)).toBeUndefined();
  });
});

describe("a hand on the pile", () => {
  /** The pile with the navigator's thumb on it, a tick in. */
  function gripped(): World {
    const world = cairnWorld();
    const held = pile(world)?.id ?? 0;
    step(world, [{ tick: 0, player: 2, command: { kind: "grip", id: held } }]);
    step(world, []);
    return world;
  }

  it("is drawn over the stack, by the boss pass, and not under it by the field's", () => {
    // Watched at tempo on 13 September 2026: the field's grip pass runs before
    // the boss is drawn, so the ring and the word for a thumb on the pile sat
    // under seven rocks and a finger carried across it showed nothing at all.
    const world = gripped();
    expect(world.gripP2).toBeGreaterThan(0);
    const body = pile(world) as Creature;
    const field = stubCanvas().ctx;
    drawGrips(field as unknown as CanvasRenderingContext2D, L, world, 0.5, 1);
    expect(field.calls).toBe(0);
    const over = stubCanvas().ctx;
    over.texts = [];
    drawPileHand(over as unknown as CanvasRenderingContext2D, L, world, body, boss(world).units, 1);
    expect(over.calls).toBeGreaterThan(0);
    expect(over.texts.map((t) => t.text)).toContain("P2 PULLS");
  });

  it("is nothing while nobody is holding it", () => {
    const world = cairnWorld();
    const body = pile(world) as Creature;
    const { ctx } = stubCanvas();
    drawPileHand(ctx as unknown as CanvasRenderingContext2D, L, world, body, boss(world).units, 1);
    expect(ctx.calls).toBe(0);
  });
});

describe("the stack the picture draws", () => {
  it("has one unit per rock the simulation still has, and never more", () => {
    const world = cairnWorld();
    const body = pile(world) as Creature;
    for (const units of [7, 6, 4, 1, 0]) {
      expect(cairnUnits(L, body, units, 0).length, `${units} left`).toBe(units);
    }
  });

  it("stacks them in courses, widest at the bottom", () => {
    const world = cairnWorld();
    const body = pile(world) as Creature;
    const stack = cairnUnits(L, body, 7, 0);
    const base = stack.slice(0, 4).map((u) => u.y);
    const apex = stack[6]?.y ?? 0;
    // Screen y grows downward, so the apex is above every stone in the base.
    for (const y of base) expect(apex).toBeLessThan(y);
    // And the base is wider than the course above it.
    const width = (from: number, to: number) => {
      const xs = stack.slice(from, to).map((u) => u.x);
      return Math.max(...xs) - Math.min(...xs);
    };
    expect(width(0, 4)).toBeGreaterThan(width(4, 6));
  });
});

describe("the lane the pile is about to drop one into", () => {
  it("is drawn for the pilot and the rig, and never for the navigator", () => {
    // The whole of the split, as one assertion: player 2 holds the only dome
    // and is shown nothing, so a column has to be said out loud.
    expect(showsCairnSettle(computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1"))).toBe(
      true,
    );
    expect(showsCairnSettle(computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2"))).toBe(
      false,
    );
    expect(showsCairnSettle(computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test"))).toBe(
      true,
    );
  });
});
