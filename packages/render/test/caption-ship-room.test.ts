import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  controlSetForWave,
  guideScene,
  SCENES,
  type SceneId,
  sceneScript,
  stepSpan,
  WAVES,
} from "@neon-spore/content";
import { DEFAULT_CONFIG, framePhase, SceneRun, type SimEvent } from "@neon-spore/sim";
import { overlaps, shipLobeRects } from "../src/caption-ship-room.js";
import { filmLayout, seatLayout } from "../src/guide-film.js";
import { captionBox } from "../src/guide-tide-caption-box.js";
import { handedSeat } from "../src/handover.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * NO PAGE OF ANY FILM COVERS THE CANNON OR THE SHIELD.
 *
 * The owner, 16 October 2026 — TWO ROCKS' plate hid the shield it was about,
 * and the rule asked for is that the two lobes are never overlapped
 * (`caption-ship-room.ts`). Stepped through every page of every film on the
 * screen the page is shown on, with the layout, panel and call `guide-scene.ts`
 * draws with, every few ticks, because the shield is carried mid-page.
 *
 * Measured on the box: the plate is an opaque fill (`caption-chrome.test.ts`).
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };
const EVERY = 8;

beforeAll(installCanvasGlobals);

function waveOf(id: SceneId): number {
  const index = WAVES.findIndex((w) => w.guide?.scene === id);
  return index < 0 ? 0 : index;
}

describe("a film's caption plate", () => {
  it("never stands on the cannon or the shield", () => {
    const { ctx } = stubCanvas();
    const covered = new Set<string>();
    for (const id of Object.keys(SCENES) as SceneId[]) {
      const scene = guideScene(id);
      const wave = waveOf(id);
      const run = new SceneRun(sceneScript(id, wave, CFG));
      const set = controlSetForWave(wave);
      const events: SimEvent[] = [];
      scene.steps.forEach((step, i) => {
        const { from, to } = stepSpan(scene, i);
        run.restart(from);
        for (let t = from; t < to; t++) {
          const w = run.world;
          if ((t - from) % EVERY === 0) {
            const shown = handedSeat(step.seat, w);
            const l = seatLayout(
              filmLayout(computeLayout(PHONE, CFG, "p1"), w.cfg, shown).l,
              shown,
              w,
            );
            const box = captionBox(
              ctx as unknown as CanvasRenderingContext2D,
              l,
              w,
              set,
              step,
              framePhase(w),
            );
            if (box && shipLobeRects(l, w).some((r) => overlaps(box, r))) {
              covered.add(`${id} page ${i + 1}`);
            }
          }
          events.length = 0;
          if (run.advance(events)) break;
        }
      });
    }
    expect([...covered]).toEqual([]);
  });
});
