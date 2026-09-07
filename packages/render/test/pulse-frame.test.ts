import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  PULSE_COUNT_BEATS,
  type PulseState,
  pulseNoteTick,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE PULSE over the whole stage, played rather than watched.
 *
 * A round replaces the picture, so no frame of the field ever reaches a line
 * of it — and a chart nobody presses anything at is a minute of arrows going
 * past and one drawing repeated. So this one *plays*: every arrow this seat
 * owes is pressed on the tick it is due, which puts a clean hit, a lit
 * receptor, a rising meter and a run on the screen, and the arrows that are
 * deliberately left alone put a miss and a falling meter there too.
 *
 * **Both seats are pressed and that is the point.** The partner's judgement is
 * drawn on this screen (`pulse-round.ts`), so a test that only pressed one
 * seat's buttons would leave half the picture unproved.
 */

beforeAll(installCanvasGlobals);

interface Watched {
  phases: Set<string>;
  judges: Set<number>;
  /** The lowest the meter got, so a miss is known to have cost something. */
  lowest: number;
  /** Veiled arrows that went past, so the ambiguous drawing is known to run. */
  veiled: number;
}

/**
 * Press every arrow on the tick it is due, except one in seven, which is left
 * to expire — so the frames carry both halves of the round.
 */
function commandsFor(boss: PulseState, tick: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  if (boss.phase !== "play") return out;
  for (const seat of [1, 2] as const) {
    const judged = seat === 1 ? boss.judged1 : boss.judged2;
    const from = seat === 1 ? boss.from1 : boss.from2;
    for (let i = from; i < boss.notes.length; i++) {
      const note = boss.notes[i];
      if (note === undefined) continue;
      const due = pulseNoteTick(CFG, boss.startTick, note);
      if (due > tick) break;
      if (judged[i] !== 0 || due !== tick || i % 7 === 3) continue;
      out.push({ tick, player: seat, command: { kind: "pulseStep", lane: note.lane } });
    }
  }
  return out;
}

function pulseFrames(role: ViewRole, ticks: number, labels?: string[]) {
  const world = createWorld(CFG, 5);
  const index = waveWith("pulse");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const watched: Watched = { phases: new Set(), judges: new Set(), lowest: 1000, veiled: 0 };

  const frames = runFrames(world, role, ticks, {
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
      const p = w.boss?.kind === "pulse" ? w.boss : null;
      const commands: TimedCommand[] = [];
      if (p !== null) {
        watched.phases.add(p.phase);
        watched.judges.add(p.last1);
        watched.judges.add(p.last2);
        watched.lowest = Math.min(watched.lowest, p.meter);
        watched.veiled = p.notes.filter((n) => n.veil !== undefined).length;
        commands.push(...commandsFor(p, tick));
      }
      step(w, commands);
    },
  });
  return { ...frames, watched };
}

describe("THE PULSE draws on all three screens", () => {
  // The count-in and four bars of the chart after it, which is enough of
  // COLD START to carry a veiled arrow and a jump.
  const TICKS = ticksPerBeat(CFG) * (PULSE_COUNT_BEATS + 20);

  for (const role of ROLES) {
    it(`draws the count, the lanes and arrows in flight on ${role}`, () => {
      const { ctx } = pulseFrames(role, TICKS);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("draws the panel it was handed, not the one the wave index names", () => {
    // The director plays a *draft* wave: `world.wave` indexes the shipped
    // `WAVES` and says THE PULSE, while the picker has written some other set
    // onto the draft. Buttons drawn where nothing answers them is the failure
    // `tools/director/test/stage-rounds.test.ts` exists to prevent, arriving
    // through the drawing side.
    //
    // The round is played on the **band** now, so the set handed in has to be
    // one — STANDARD, whose two action lobes carry their names on the panel.
    // A slab set would draw no buttons here for the same reason it draws none
    // on any other wave: `panelSlots` has no lobes to place.
    const labels: string[] = [];
    const world = createWorld(CFG, 5);
    const index = waveWith("pulse");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    runFrames(world, "test", ticksPerBeat(CFG) * 2, {
      controls: controlSet("default"),
      onCanvas: (ctx) => {
        const write = ctx.fillText.bind(ctx);
        ctx.fillText = (text: string, x: number, y: number) => {
          labels.push(text);
          write(text, x, y);
        };
      },
      onTick: (_tick, w) => step(w, []),
    });
    expect(labels).toContain("SUCK");
    expect(labels).toContain("THE PULSE");
  });

  it("really hit some and missed some, or the frames proved nothing", () => {
    const { watched } = pulseFrames("test", TICKS);
    expect(watched.phases.has("count")).toBe(true);
    expect(watched.phases.has("play")).toBe(true);
    // 1 is a clean hit and 3 is an arrow that ran out of time. Both have to
    // have happened, or half the drawings above were never reached.
    expect(watched.judges.has(1)).toBe(true);
    expect(watched.judges.has(3)).toBe(true);
    expect(watched.lowest).toBeLessThan(CFG.pulseMeterStartMilli);
    expect(watched.veiled).toBeGreaterThan(0);
  });
});
