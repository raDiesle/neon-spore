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
import { anchorPoint } from "../src/caption-anchor.js";
import { filmLayout, seatLayout } from "../src/guide-film.js";
import { handedSeat } from "../src/handover.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * EVERY PAGE OF EVERY FILM HAS A SUBJECT ON ITS OWN SEAT'S SCREEN.
 *
 * A caption whose anchor comes back null is not drawn, and nothing says so:
 * THE TRAPEZE's film was written with every page `{ at: "boss" }`, its kind
 * had no line in `caption-anchor-boss*.ts`, and all four of its pages played
 * without words while every test stayed green (8 October 2026). So this steps
 * every film through every page and asks `anchorPoint` on the screen the page
 * is shown on, with the film's own panel — the same layout, set and call
 * `guide-scene.ts` hands `captionBox` before it draws.
 *
 * At *some* tick of the page, not its first: a page about an arrival opens
 * before the body is on the field, and its caption waits for it. What cannot
 * pass is a page whose subject is never found on its seat's screen at all.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };

beforeAll(installCanvasGlobals);

/**
 * The pages lost on 8 October 2026, when this was first run, each queued to
 * be fixed (`docs/queue.md`). Two films ask for a boss with no anchor of its
 * own; the rest have a page whose subject is not on the field yet, or has
 * already gone. Named so that a new one is red and a fixed one has to be
 * crossed off: the list only ever gets shorter.
 */
const LOST_ALREADY = [
  "theLance page 3 (seat 1, at body)",
  "theBalloon page 0 (seat 1, at body)",
  "theBalloon page 1 (seat 1, at handle)",
  "theScuttle page 12 (seat 1, at boss)",
];

/** The wave a film rehearses, which is the index its script is built with. */
function waveOf(id: SceneId): number {
  const index = WAVES.findIndex((w) => w.guide?.scene === id);
  return index < 0 ? 0 : index;
}

describe("a film's caption", () => {
  it("finds its subject on some tick of every page", () => {
    const lost: string[] = [];
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
          const shown = handedSeat(step.seat, w);
          const l = seatLayout(
            filmLayout(computeLayout(PHONE, CFG, "p1"), w.cfg, shown).l,
            shown,
            w,
          );
          if (anchorPoint(l, w, set, step.anchor, framePhase(w))) return;
          events.length = 0;
          if (run.advance(events)) break;
        }
        lost.push(`${id} page ${i} (seat ${step.seat}, at ${step.anchor.at})`);
      });
    }
    expect(lost).toEqual(LOST_ALREADY);
  });
});
