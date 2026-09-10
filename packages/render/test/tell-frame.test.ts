import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  TELL_BEATS,
  type TellState,
  type TimedCommand,
  tellBeatenBy,
  tellThrowAt,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE TELL over the whole stage, played rather than watched.
 *
 * A round replaces the picture, so no frame of the field ever reaches a line
 * of it — and a ladder nobody throws at is one window repeated until the clock
 * runs out. So this one *plays*: it beats the boss on two rungs out of three
 * and loses the third on purpose, which is the only way the nine reveal scenes
 * and the two verdicts get drawn at all.
 *
 * **Both seats throw, and that is the point.** The plate and the mouth are
 * player 1's and the bolt is player 2's, so a test that pressed one seat's
 * buttons would leave a third of `tell-scene.ts` unproved.
 */

beforeAll(installCanvasGlobals);

interface Watched {
  phases: Set<string>;
  outcomes: Set<number>;
  /** Which throws the ship actually made, so all three glyphs are known drawn. */
  thrown: Set<number>;
}

/**
 * Beat the boss, except on every third rung, which is thrown away — so the
 * frames carry a win, a loss and the ladder starting again.
 */
function commandsFor(boss: TellState, tick: number, lose: boolean): TimedCommand[] {
  if (boss.phase !== "tell" || boss.thrown !== -1) return [];
  const theirs = tellThrowAt(boss.bossThrow);
  if (theirs === null) return [];
  // To *lose* is to throw the thing the boss beats — throwing the same thing
  // is a stand-off, which leaves the rung exactly where it was.
  const t = lose ? TELL_BEATS[theirs] : tellBeatenBy(theirs);
  if (t === "plate") return [{ tick, player: 1, command: { kind: "guard" } }];
  if (t === "maw") return [{ tick, player: 1, command: { kind: "intake" } }];
  return [
    { tick, player: 2, command: { kind: "fire", color: boss.bossColor === 1 ? "red" : "cyan" } },
  ];
}

function tellFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 5);
  const index = waveWith("tell");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const watched: Watched = { phases: new Set(), outcomes: new Set(), thrown: new Set() };

  const frames = runFrames(world, role, ticks, {
    onTick: (tick, w) => {
      const t = w.boss?.kind === "tell" ? w.boss : null;
      const commands: TimedCommand[] = [];
      if (t !== null) {
        watched.phases.add(t.phase);
        watched.outcomes.add(t.outcome);
        if (t.thrown >= 0) watched.thrown.add(t.thrown);
        commands.push(...commandsFor(t, tick, t.lost === 0 && t.rung === 2));
      }
      step(w, commands);
    },
  });
  return { ...frames, watched };
}

describe("THE TELL draws on all three screens", () => {
  // Long enough for the lead-in, a climb, a loss and the ladder again.
  const TICKS = ticksPerBeat(CFG) * 70;

  for (const role of ROLES) {
    it(`draws the ring, the tell and a reveal on ${role}`, () => {
      const { ctx, watched } = tellFrames(role, TICKS);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion.
      expect(ctx.calls).toBeGreaterThan(500);
      expect(watched.phases.has("tell"), "a window was drawn").toBe(true);
      expect(watched.phases.has("reveal"), "a reveal was drawn").toBe(true);
      // And what the play reached, asked of the same play rather than of a
      // fourth one: the world is seeded, so the three roles watch one game,
      // and a case of its own here was two seconds of the suite re-running it.
      expect(watched.outcomes.has(1), "a rung was won").toBe(true);
      expect(watched.outcomes.has(3), "a rung was lost").toBe(true);
      expect(watched.thrown.size, "every throw the ship can make was drawn").toBe(3);
    });
  }

  /**
   * The half of the tell that is player 1's, and the half that is player 2's.
   * Neither is a decision on its own, and the drawing is where that is true or
   * not — so the two screens have to differ while a window is open.
   */
  it("draws a different screen for each seat", () => {
    const logs: Record<string, string[]> = { p1: [], p2: [] };
    for (const role of ["p1", "p2"] as const) {
      const world = createWorld(CFG, 5);
      const index = waveWith("tell");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      runFrames(world, role, ticksPerBeat(CFG) * 10, {
        onCanvas: (ctx) => {
          ctx.log = logs[role];
        },
      });
    }
    expect(logs.p1?.length, "both screens drew something").toBeGreaterThan(0);
    expect(logs.p1, "the lobe he can see and the colour she can").not.toEqual(logs.p2 ?? []);
  });
});
