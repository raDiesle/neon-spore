import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guidePages,
  guideStepHeard,
  startWave,
} from "@neon-spore/sim";
import { HANG_MS } from "../../../tools/test/cpu-time.js";
import { drawWaveOpening } from "../src/briefing.js";
import { GUIDE_LOOK } from "../src/guide-look.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

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
 * A rehearsal whose picture is the lost screen keeps it under the plate.
 *
 * A film plays the game, and the game's screens are part of the game — so a
 * page whose inner world has lost the wave draws the whole lost screen at the
 * film's size, and WAVE LOST landed 73 pixels down with the tutorial plate on
 * top of it. TORCH, BULB QUEEN, THE LURE and THE COIL each have such a page.
 *
 * Nothing on that screen can step out from under the band on its own: its
 * words are a candidate's to place (`lost-look.ts`) and its buttons are
 * hit-tested where they are drawn (`apps/game/src/lost.ts`). So the screen is
 * fitted instead — foot pinned, top lifted to the band, centred across
 * (`briefing.ts`, `inThePage`).
 *
 * **The net is cut the other way round from the two sweeps beside it.**
 * `guide-plate-room.test.ts` and `guide-grid-room.test.ts` name the words they
 * are looking for, which works while the words are the round's own and fails
 * the moment a look is voted on: the lost screen's header is a record, and a
 * candidate may say something else entirely. So this finds the page by the two
 * words the record does *not* own — RETRY WAVE and QUIT, drawn outside it —
 * and then asks that everything in the band on that page be the guide's own
 * chrome. Whatever the screen says, it says it below the plate.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2"];
/** A phone's screen, at the size the film is drawn on. */
const PHONE = { width: 390, height: 844, dpr: 1 };

/** The buttons, which say this page is the lost screen (`lost-screen.ts`). */
const BUTTONS = /^RETRY WAVE$|^QUIT$/;
/** What a guide draws over its own film, and the only thing allowed in the band. */
const CHROME = /^TUTORIAL$|^PLAYER \d+ · SCREEN$|^BACK$|^REPLAY$/;

beforeAll(installCanvasGlobals);

/** Whether a word's box crosses the band the chrome stands in. */
function inPlateBand(t: TextBox): boolean {
  return t.y < GUIDE_LOOK.bandFoot && t.y + t.h > 0;
}

describe("a rehearsal whose picture is the lost screen", () => {
  const films = WAVES.map((w, i) => (w.guide?.scene ? i : -1)).filter((i) => i >= 0);

  for (const role of ROLES) {
    it(
      `draws it clear of the tutorial plate, for ${role}`,
      () => {
        expect(films.length, "no wave carries a film").toBeGreaterThan(0);
        const { ctx } = stubCanvas();
        const l = computeLayout(PHONE, CFG, role);
        let seen = 0;
        for (const i of films) {
          const world = createWorld(CFG, 3);
          startWave(world, i, [], [], null, true, waveGuideSteps(i));
          const stage = new GuideStage();
          for (let page = 0; page < guidePages(world); page++) {
            // Past the switch, so the page is where it will stand, and far
            // enough in that a scene which loses its wave has lost it.
            for (let f = 0; f < 90; f++) stage.update(world, 1 / 60, role);
            ctx.texts = [];
            drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
              role,
              scene: stage,
              time: 1.5,
              fx: new OpeningFx(),
            });
            if (ctx.texts.some((t) => BUTTONS.test(t.text))) {
              seen++;
              expect(
                ctx.texts
                  .filter((t) => !CHROME.test(t.text) && inPlateBand(t))
                  .map((t) => `"${t.text}" at ${Math.round(t.x)},${Math.round(t.y)}`),
                `${WAVES[i]?.name} page ${page + 1}: the lost screen under the plate`,
              ).toEqual([]);
            }
            ctx.texts = undefined;
            guideStepHeard(world, 1, false);
            guideStepHeard(world, 2, false);
          }
        }
        expect(seen, "no rehearsal drew the lost screen at all").toBeGreaterThan(0);
      },
      WALK_MS,
    );
  }
});
