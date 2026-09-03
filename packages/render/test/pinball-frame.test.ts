import { beforeAll, describe, expect, it } from "bun:test";
import type { ControlSet } from "@neon-spore/content";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  PINBALL_MORPH_BEATS,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * PINBALL over the whole stage, played rather than watched.
 *
 * A round replaces the picture, so no frame of the field ever reaches a line
 * of it — and a table nobody presses anything on is a sweep that walks for
 * half a minute and a ball that never leaves. The two verbs are pressed in the
 * order the round demands (latch the needle, launch on the bar), and the
 * bucket is slid under whatever comes down, so the aim fan, the power bar, a
 * ball in flight, a lit piece and the bucket in motion are all drawn.
 */

beforeAll(installCanvasGlobals);

interface Watched {
  phases: Set<string>;
  shots: Set<string>;
  /** Pieces knocked out, which is the only thing a still frame cannot show. */
  cleared: number;
}

function pinballFrames(role: ViewRole, ticks: number, controls?: ControlSet, labels?: string[]) {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  // The round takes itself off the world when it closes, so what it did has to
  // be read while it is running rather than off the world at the end.
  const watched: Watched = { phases: new Set(), shots: new Set(), cleared: 0 };

  const frames = runFrames(world, role, ticks, {
    controls,
    // The stub logs a `fillText` by its coordinates and not its string, so a
    // test about *which* label was drawn collects them on the way past.
    onCanvas: labels
      ? (ctx) => {
          const write = ctx.fillText.bind(ctx);
          ctx.fillText = (text: string, x: number, y: number) => {
            labels.push(text);
            write(text, x, y);
          };
        }
      : undefined,
    onTick: (tick, w) => {
      const p = w.boss?.kind === "pinball" ? w.boss : null;
      const commands: TimedCommand[] = [];
      if (p !== null) {
        watched.phases.add(p.phase);
        if (p.phase === "play") {
          watched.shots.add(p.shot);
          watched.cleared = Math.max(
            watched.cleared,
            p.alive.filter((standing) => !standing).length,
          );
          // Stop the needle, and fire on the bar a few ticks later so the
          // power reading is not always the same one.
          if (p.shot === "aim") {
            commands.push({ tick, player: 1, command: { kind: "latch" } });
          } else if (p.shot === "power" && tick % 7 === 0) {
            commands.push({ tick, player: 2, command: { kind: "launch" } });
          }
          // And the bucket walks under it, which is the only control that
          // answers while a ball is in the air.
          if (p.shot === "flight" && p.slideDir === 0) {
            commands.push({ tick, player: 1, command: { kind: "slide", on: true, dir: 1 } });
          }
        }
      }
      step(w, commands);
    },
  });
  return { ...frames, watched };
}

describe("PINBALL draws on all three screens", () => {
  // The ship folding into the bucket, and then the table for as long as the
  // first board is given.
  const TICKS = ticksPerBeat(CFG) * (PINBALL_MORPH_BEATS + 20);

  for (const role of ROLES) {
    it(`draws the morph, the table and a ball in flight on ${role}`, () => {
      const { ctx } = pinballFrames(role, TICKS);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("draws the panel it was handed, not the one the wave index names", () => {
    // The director plays a *draft* wave: `world.wave` indexes the shipped
    // `WAVES` and says PINBALL, while the picker has written some other set
    // onto the draft and `stage-pinball.ts` hit-tests against that one.
    // Buttons drawn where nothing answers them is the failure
    // `test/stage-rounds.test.ts` exists to prevent, arriving through the
    // drawing side.
    const labels: string[] = [];
    const ticks = ticksPerBeat(CFG) * (PINBALL_MORPH_BEATS + 4);
    pinballFrames("test", ticks, controlSet("snake"), labels);
    expect(labels).toContain("MAW");
    expect(labels).not.toContain("SET");
  });

  it("really launched a ball and knocked something out, or the frames proved nothing", () => {
    const { watched } = pinballFrames("test", TICKS);
    expect(watched.phases.has("morph")).toBe(true);
    expect(watched.phases.has("play")).toBe(true);
    expect([...watched.shots].sort()).toEqual(["aim", "flight", "power"]);
    expect(watched.cleared).toBeGreaterThan(0);
  });
});
