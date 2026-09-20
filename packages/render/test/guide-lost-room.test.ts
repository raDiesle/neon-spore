import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guidePages,
  guideStepHeard,
  lostAsks,
  startWave,
} from "@neon-spore/sim";
import { HANG_MS } from "../../../tools/test/cpu-time.js";
import { drawWaveOpening } from "../src/briefing.js";
import { ScenePlay } from "../src/guide-play.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **What one walk through every rehearsal is allowed to take** — the hang
 * ceiling in `tools/test/cpu-time.ts`, flat, for the same reason
 * `briefing.test.ts` takes it: a flat `60_000` stood here and *overrode* this
 * file's own machine-scaled default with a smaller number, and the scaled
 * default cannot help either, because `CORE_LOAD` is read before the shards
 * that cause the load have raised the one-minute average. Nothing here
 * measures speed, so the budget is a guard against a hang and is only ever
 * spent when something is genuinely stuck.
 */
const WALK_MS = HANG_MS;

/**
 * A rehearsal never draws the lost screen.
 *
 * A film plays the game, and the game's screens are part of the game — so a
 * page whose inner world has lost the wave used to draw the whole RETRY WAVE /
 * QUIT screen inside the tutorial plate. TORCH, BULB QUEEN, THE LURE and THE
 * COIL each have such a page. It was fitted under the band so that at least
 * nothing collided, and the owner's answer of 18 September 2026 was that the
 * collision was the smaller half of the problem: *when on a wave Tutorial/guide
 * it shows hull/ship damage, it should not show the 'wave lost'.* The screen
 * asks a question about a run nobody is playing, and neither of its two buttons
 * is a thing a thumb on that page can press.
 *
 * So the net is the same one it always was — the two words the lost screen's
 * record does *not* own, RETRY WAVE and GO TO MENU, which a candidate may not
 * rewrite (`lost-look.ts`) — and what it asks has flipped: those words are on
 * no page of any film at all.
 *
 * **A sweep that finds nothing has to say why.** A film that never loses its
 * wave would pass this without the guard in `briefing.ts` existing, so a second
 * `ScenePlay` is run beside the stage on the same clock: it holds the same
 * inner world, and the case fails unless some page of some film really did lose
 * it. Then that same lost world, drawn as the game rather than as a page, is
 * asked for its buttons — which is the one assertion that names the flag.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2"];
/** A phone's screen, at the size the film is drawn on. */
const PHONE = { width: 390, height: 844, dpr: 1 };

/** The buttons, which say this page is the lost screen (`lost-screen.ts`). */
const BUTTONS = /^RETRY WAVE$|^GO TO MENU$/;

beforeAll(installCanvasGlobals);

describe("a rehearsal whose world has lost the wave", () => {
  const films = WAVES.map((w, i) => (w.guide?.scene ? i : -1)).filter((i) => i >= 0);

  for (const role of ROLES) {
    it(
      `draws no lost screen, for ${role}`,
      () => {
        expect(films.length, "no wave carries a film").toBeGreaterThan(0);
        const { ctx } = stubCanvas();
        const l = computeLayout(PHONE, CFG, role);
        let lost = 0;
        for (const i of films) {
          const world = createWorld(CFG, 3);
          startWave(world, i, [], [], null, true, waveGuideSteps(i));
          const stage = new GuideStage();
          // The same film on the same clock, for the one thing the drawing
          // cannot be asked: whether the world under it has failed.
          const play = new ScenePlay();
          for (let page = 0; page < guidePages(world); page++) {
            // Past the switch, so the page is where it will stand, and far
            // enough in that a scene which loses its wave has lost it.
            for (let f = 0; f < 90; f++) {
              stage.update(world, 1 / 60, role);
              play.update(world, 1 / 60, role);
            }
            ctx.texts = [];
            drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
              role,
              scene: stage,
              time: 1.5,
              fx: new OpeningFx(),
            });
            const said = ctx.texts.map((t) => t.text).filter((t) => BUTTONS.test(t));
            expect(
              said,
              `${WAVES[i]?.name} page ${page + 1}: the lost screen inside a film`,
            ).toEqual([]);
            ctx.texts = undefined;
            const inner = play.run?.world;
            if (inner && lostAsks(inner)) {
              lost++;
              // The same world on the game's own screen still stops on it: the
              // page is what is different, not the world (`briefing.ts`).
              ctx.texts = [];
              drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, inner, { role });
              expect(
                ctx.texts.some((t) => BUTTONS.test(t.text)),
                `${WAVES[i]?.name} page ${page + 1}: a lost world drew no screen off a page either`,
              ).toBe(true);
              ctx.texts = undefined;
            }
            guideStepHeard(world, 1, false);
            guideStepHeard(world, 2, false);
          }
        }
        expect(lost, "no rehearsal ever lost its wave").toBeGreaterThan(0);
      },
      WALK_MS,
    );
  }
});
