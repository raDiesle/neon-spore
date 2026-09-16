import { beforeAll, describe, expect, it } from "bun:test";
import { buildQueue, WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";
import { GUIDE_LOOK } from "../src/guide-look.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMagnetAlarm } from "../src/magnet-alarm.js";
import { sirenCentre } from "../src/siren.js";
import { drawTorchAlarm } from "../src/torch-alarm.js";
import { installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

/**
 * The two calls the ship's own chrome writes, under a rehearsal's plate.
 *
 * TORCH's line and THE MAGNET's are the same sentence in two voices — *this is
 * the call, and here is what to say* — and both are right-aligned to the
 * siren's own edge, directly under its dial. They were placed at fixed offsets
 * from the top of the screen, so a rehearsal's plate covered both: measured 16
 * September 2026 at 170,58 and 206,72, against a band whose foot is 104.
 *
 * The dial had already learned to drop (`sirenCentre`). These two now drop by
 * the same amount rather than working out a clearance of their own, which is
 * the whole of the fix: `headerTop` at each would have clamped all three to
 * one line and stacked the two calls on the dial itself. So the check is not
 * only *below the band* but *still in the same arrangement*.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };
/** The pilot has both radars (`radar: "p1"`), so both lines are drawn here. */
const SEAT: ViewRole = "p1";

beforeAll(installCanvasGlobals);

function waveNamed(name: string): number {
  const i = WAVES.findIndex((w) => w.name === name);
  expect(i, `no wave named ${name}`).toBeGreaterThanOrEqual(0);
  return i;
}

/**
 * The wave, wound to the beat its first `kind` is due on — which is when the
 * call is up. A wave opens at beat zero and both alarms read a queue within
 * `radarLead` beats of arriving, so a world left where `startWave` put it
 * draws nothing at all on either.
 */
function atWave(name: string, kind: string): World {
  const i = waveNamed(name);
  const world = createWorld(CFG, 3);
  startWave(world, i, buildQueue(i, CFG.cols), [], null, true, waveGuideSteps(i));
  const due = world.queue.find((q) => q.kind === kind);
  expect(due, `${name} sends no ${kind}`).toBeDefined();
  world.waveBeat = (due?.beat ?? 0) + 1;
  return world;
}

type Draw = (ctx: CanvasRenderingContext2D, clearTop?: number) => void;

/** The one row this alarm writes, at a given clearance. */
function row(draw: Draw, clearTop?: number): TextBox {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  draw(ctx as unknown as CanvasRenderingContext2D, clearTop);
  const texts = (ctx.texts ?? []) as TextBox[];
  expect(
    texts.map((t) => t.text),
    "the alarm wrote no line at all",
  ).toHaveLength(1);
  return texts[0] as TextBox;
}

const ALARMS: { name: string; wave: string; kind: string; draw: Draw }[] = [
  {
    name: "TORCH's call",
    wave: "TORCH",
    kind: "torch",
    draw: (ctx, clearTop) => {
      const l = computeLayout(PHONE, CFG, SEAT);
      drawTorchAlarm(ctx, l, atWave("TORCH", "torch"), 0, clearTop);
    },
  },
  {
    name: "THE MAGNET's call",
    wave: "THE MAGNET",
    kind: "magnet",
    draw: (ctx, clearTop) => {
      const l = computeLayout(PHONE, CFG, SEAT);
      drawMagnetAlarm(ctx, l, atWave("THE MAGNET", "magnet"), 0, clearTop);
    },
  },
];

describe("an alarm row under a rehearsal's plate", () => {
  for (const alarm of ALARMS) {
    it(`${alarm.name} is clear of the plate's band`, () => {
      const under = row(alarm.draw, GUIDE_LOOK.bandFoot);
      expect(
        under.y,
        `"${under.text}" at ${Math.round(under.x)},${Math.round(under.y)} is still in the band`,
      ).toBeGreaterThanOrEqual(GUIDE_LOOK.bandFoot);
    });

    it(`${alarm.name} is where it was when no plate is up`, () => {
      // The clearance is a rehearsal's alone. Nothing about the running game's
      // own frame moves, which is what makes this a fix and not a look.
      const bare = row(alarm.draw);
      const named = row(alarm.draw, undefined);
      expect(named.y).toBe(bare.y);
      expect(bare.y).toBeLessThan(GUIDE_LOOK.bandFoot);
    });

    it(`${alarm.name} keeps its distance from the siren it hangs off`, () => {
      const l = computeLayout(PHONE, CFG, SEAT);
      const bare = row(alarm.draw);
      const under = row(alarm.draw, GUIDE_LOOK.bandFoot);
      const dial = sirenCentre(l).y;
      const dropped = sirenCentre(l, undefined, GUIDE_LOOK.bandFoot).y;
      // The same gap under the dial at both: the cluster moved as one thing.
      expect(under.y - dropped).toBeCloseTo(bare.y - dial, 5);
      expect(under.y - dropped).toBeGreaterThan(0);
    });
  }

  it("keeps the two rows apart from each other", () => {
    const [torch, magnet] = ALARMS as [(typeof ALARMS)[0], (typeof ALARMS)[0]];
    const a = row(torch.draw, GUIDE_LOOK.bandFoot);
    const b = row(magnet.draw, GUIDE_LOOK.bandFoot);
    // A wave carrying both is a thing a director could author, and the two
    // were spaced apart on purpose (`magnet-alarm.ts`). One clearance applied
    // twice would have put them on the same line.
    expect(Math.abs(a.y - b.y)).toBeGreaterThanOrEqual(12);
  });
});
