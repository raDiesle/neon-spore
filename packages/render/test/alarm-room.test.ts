import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue, WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMagnetAlarm } from "../src/magnet-alarm.js";
import { alarmRows } from "../src/ship-top-rows.js";
import { sirenCentre, sirenFoot } from "../src/siren.js";
import { drawTorchAlarm } from "../src/torch-alarm.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The two calls the ship's own chrome writes: TORCH's line and THE MAGNET's,
 * the same sentence in two voices — *this is the call, and here is what to
 * say* — both right-aligned to the siren's own edge, directly under its dial.
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

type Draw = (ctx: CanvasRenderingContext2D) => void;

/** The one row this alarm writes. */
function row(draw: Draw): TextBox {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  draw(ctx as unknown as CanvasRenderingContext2D);
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
    draw: (ctx) => {
      const l = computeLayout(PHONE, CFG, SEAT);
      drawTorchAlarm(ctx, l, atWave("TORCH", "torch"), 0);
    },
  },
  {
    name: "THE MAGNET's call",
    wave: "THE MAGNET",
    kind: "magnet",
    draw: (ctx) => {
      const l = computeLayout(PHONE, CFG, SEAT);
      drawMagnetAlarm(ctx, l, atWave("THE MAGNET", "magnet"), 0);
    },
  },
];

describe("an alarm row", () => {
  for (const alarm of ALARMS) {
    it(`${alarm.name} keeps its distance from the siren it hangs off`, () => {
      const l = computeLayout(PHONE, CFG, SEAT);
      const bare = row(alarm.draw);
      const dial = sirenCentre(l).y;
      expect(bare.y).toBeGreaterThan(dial);
    });
  }

  it("starts the stack under the siren's own lowest row", () => {
    // The defect this was found by: the duty word is drawn on its middle at a
    // baseline of 66 and TORCH's call was written at 66 too, so a wave that
    // raised a call *and* owed a word printed the two over each other. Both
    // are up on TORCH's own wave.
    const l = computeLayout(PHONE, CFG, SEAT);
    const world = atWave("TORCH", "torch");
    const foot = sirenFoot(l, world);
    expect(foot, "TORCH's wave raises no call, so this checks nothing").not.toBeNull();
    expect(alarmRows(l, world).torch).toBeGreaterThanOrEqual(foot as number);
  });

  it("leaves the stack where it was on a wave with no call at all", () => {
    const l = computeLayout(PHONE, CFG, SEAT);
    const quiet = createWorld(CFG, 3);
    startWave(quiet, 0, [], [], null, false, 0);
    expect(sirenFoot(l, quiet)).toBeNull();
    expect(alarmRows(l, quiet).torch).toBe(56);
  });

  it("keeps the two bands apart from each other, on one screen", () => {
    const l = computeLayout(PHONE, CFG, SEAT);
    const rows = alarmRows(l, atWave("TORCH", "torch"));
    expect(rows.magnet - rows.torch).toBeGreaterThanOrEqual(12);
  });
});
