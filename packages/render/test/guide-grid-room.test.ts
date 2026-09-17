import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guidePages,
  guideStepHeard,
  startWave,
} from "@neon-spore/sim";
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
 * THE WISP's lattice keeps its axes out from under the tutorial plate.
 *
 * The named grid — letters across, numbers down (`coord-grid.ts`) — is the
 * field's own lattice rather than a picture standing on it, so it is the one
 * axis in the game that cannot drop out from under the band the way THE
 * FLEET's chart does. Its labels move inside it instead: the letters hang at
 * the foot of the first row that clears the plate, and the numbers of the rows
 * above that are not drawn.
 *
 * `guide-plate-room.test.ts` cannot hold this. It sweeps boss rehearsals,
 * because a round is the thing that writes a header in the band, and THE WISP
 * is an ordinary wave with a film — so the collision its sweep first turned up
 * (the row number at 3,83 and the whole letter row at y 98, on three of the
 * four pages) was never inside its own net. This is that net, cut for one
 * wave and one axis.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2"];
/** A phone's screen, at the size the film is drawn on. */
const PHONE = { width: 390, height: 844, dpr: 1 };

/** An axis label and nothing else: one letter across, or a row's number down. */
const AXIS = /^[A-Z]$|^(?:[1-9]|1[0-5])$/;

beforeAll(installCanvasGlobals);

/** Whether a word's box crosses the band the chrome stands in. */
function inPlateBand(t: TextBox): boolean {
  return t.y < GUIDE_LOOK.bandFoot && t.y + t.h > 0;
}

describe("THE WISP's named grid and the tutorial plate", () => {
  const wave = WAVES.findIndex((w) => w.name === "THE WISP");

  for (const role of ROLES) {
    it(`share no band on any page of the rehearsal, for ${role}`, () => {
      expect(wave, "no wave named THE WISP").toBeGreaterThanOrEqual(0);
      const { ctx } = stubCanvas();
      const l = computeLayout(PHONE, CFG, role);
      const world = createWorld(CFG, 3);
      startWave(world, wave, [], [], null, true, waveGuideSteps(wave));
      const stage = new GuideStage();
      let seen = 0;
      for (let page = 0; page < guidePages(world); page++) {
        // Past the switch, so the page is where it will stand, and far enough
        // in that the lattice has finished fading up: it is 0 until something
        // on the field has to be named by tile (`CoordGrid.shown`).
        for (let f = 0; f < 180; f++) stage.update(world, 1 / 60, role);
        ctx.texts = [];
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
          role,
          scene: stage,
          time: 1.5,
          fx: new OpeningFx(),
        });
        const axis = ctx.texts.filter((t) => AXIS.test(t.text));
        seen += axis.length;
        expect(
          axis
            .filter(inPlateBand)
            .map((t) => `"${t.text}" at ${Math.round(t.x)},${Math.round(t.y)}`),
          `page ${page + 1}: axis labels under the plate`,
        ).toEqual([]);
        ctx.texts = undefined;
        guideStepHeard(world, 1, false);
        guideStepHeard(world, 2, false);
      }
      expect(seen, "no page of the rehearsal drew the axis at all").toBeGreaterThan(0);
    }, 60_000);
  }
});
