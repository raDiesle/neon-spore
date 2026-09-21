import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { guideScene, type SceneStep, sceneScript, stepSpan, WAVES } from "@neon-spore/content";
import { beatPhase, DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { bandControlSet } from "../src/band.js";
import { filmLayout } from "../src/guide-film.js";
import { caption } from "../src/guide-tide-caption.js";
import { captionBox } from "../src/guide-tide-caption-box.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SHAPE OF A CAPTION'S RING, when its subject is a bar.
 *
 * `AnchorPoint` has carried two half-axes since the first anchor wider than it
 * was tall, and every reader of it took `Math.max` of the pair and drew a
 * circle — so the ring round THE GORGE's sack, seven columns across and half a
 * tile deep, was a circle five tiles tall reaching most of the way down the
 * field. These hold the fix from both ends: the box hands out the two radii
 * the anchor gave it, and the drawing puts an ellipse of exactly those on the
 * canvas rather than an arc of the larger.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };

beforeAll(installCanvasGlobals);

/** The log rounds to three places, so a radius is compared and not spelled. */
const close = (a: number | undefined, b: number) => a !== undefined && Math.abs(a - b) < 0.01;

/** The wave's film, its layout, and a run posed at the page's first tick. */
function pageAt(name: string, role: ViewRole, stepIndex: number) {
  const index = WAVES.findIndex((w) => w.name === name);
  expect(index, `no wave named ${name}`).toBeGreaterThanOrEqual(0);
  const id = WAVES[index]?.guide?.scene;
  if (id === undefined) throw new Error(`${name} plays no film`);
  const scene = guideScene(id);
  const step: SceneStep | undefined = scene.steps[stepIndex];
  if (step === undefined) throw new Error(`${name} has no page ${stepIndex}`);
  const { l } = filmLayout(computeLayout(PHONE, CFG, role), CFG, role === "p1" ? 1 : 2);
  const run = new SceneRun(sceneScript(id, index, CFG));
  run.restart(stepSpan(scene, stepIndex).from);
  return {
    l,
    run,
    step,
    set: bandControlSet(undefined, index),
    phase: beatPhase(CFG, run.world.tick),
  };
}

describe("a caption's ring around a subject that is a bar", () => {
  it("hands out the anchor's own two radii and not the larger of them twice", () => {
    // THE GORGE's first page is about the sack, which is the widest and
    // flattest subject any film points at.
    const { l, run, step, set, phase } = pageAt("THE GORGE", "p1", 0);
    const { ctx } = stubCanvas();
    const box = captionBox(
      ctx as unknown as CanvasRenderingContext2D,
      l,
      run.world,
      set,
      step,
      phase,
    );
    expect(box, "THE GORGE's first page has no subject").not.toBeNull();
    if (box === null) return;
    expect(box.ringX).toBeCloseTo((box.point.rx ?? box.point.r) + 10, 6);
    expect(box.ringY).toBeCloseTo(box.point.r + 10, 6);
    // The whole complaint, in one number: the sack is several times wider
    // than it is deep, and the ring used to be as tall as it is wide.
    expect(box.ringX).toBeGreaterThan(box.ringY * 2);
  });

  it("draws that ellipse, and no arc as big as its wider axis", () => {
    const { l, run, step, set, phase } = pageAt("THE GORGE", "p1", 0);
    const { ctx } = stubCanvas();
    ctx.log = [];
    const box = captionBox(
      ctx as unknown as CanvasRenderingContext2D,
      l,
      run.world,
      set,
      step,
      phase,
    );
    if (box === null) throw new Error("THE GORGE's first page has no subject");
    caption(
      ctx as unknown as CanvasRenderingContext2D,
      l,
      run.world,
      set,
      step,
      step.tick + 60,
      phase,
      undefined,
    );
    const args = (name: string) =>
      (ctx.log ?? [])
        .filter((line) => line.startsWith(`${name}(`))
        .map((line) =>
          line
            .slice(name.length + 1, -1)
            .split(", ")
            .map(Number),
        );
    const rings = args("ellipse").filter((a) => close(a[2], box.ringX) && close(a[3], box.ringY));
    expect(rings, "no ellipse of the ring's own two radii").toHaveLength(1);
    // A circle the width of the sack is what this page used to draw. The
    // halo and the scrim's soft edge are arcs still, and both are smaller.
    const wide = args("arc").filter((a) => (a[2] ?? 0) >= box.ringX);
    expect(wide, `an arc as wide as the ring: ${JSON.stringify(wide)}`).toHaveLength(0);
  });
});
