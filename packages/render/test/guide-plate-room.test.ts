import { beforeAll, describe, expect, it } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guidePages,
  guideStepHeard,
  startWave,
  type World,
} from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { GuideStage } from "../src/guide-scene.js";
import { BANNER_H, BANNER_TOP } from "../src/guide-switch.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

/**
 * A round's header makes room for the tutorial plate.
 *
 * A rehearsal carries one plate top left — TUTORIAL over PLAYER n · SCREEN —
 * and it is always there and never fades, which is what the owner asked for.
 * A boss round draws a header of its own in the same band: its name, the
 * window, the stage, the tally. Until 10 September 2026 the plate sat on top
 * of all of it on every boss rehearsal in the game, so two things were in one
 * place and neither was legible. The plate is right and the header is right;
 * this holds that the header has dropped out from under it (`round-header.ts`).
 *
 * The check is on the words themselves: every `fillText` a page draws, as the
 * box its glyphs occupy, against the band the plate stands in. The plate's own
 * two rows are the only words allowed there.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2"];
/** Every wave whose guide plays a film and whose world is a round. */
const ROUND_FILMS = WAVES.map((w, i) => (w.guide?.scene && w.boss ? i : -1)).filter((i) => i >= 0);
/** The plate's own words — the only ones that belong in its band. */
const PLATE_WORDS = /^TUTORIAL$|· SCREEN$/;
/** A phone's screen, at the size the film is drawn on. */
const PHONE = { width: 390, height: 844, dpr: 1 };

beforeAll(installCanvasGlobals);

function guided(waveIndex: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, waveIndex, [], [], null, true, waveGuideSteps(waveIndex));
  return world;
}

/** Whether a word's box crosses the band the plate stands in, at its left. */
function inPlateBand(t: TextBox, plateRight: number): boolean {
  const top = BANNER_TOP;
  const bottom = BANNER_TOP + BANNER_H;
  return t.y < bottom && t.y + t.h > top && t.x < plateRight;
}

describe("the tutorial plate and a round's header", () => {
  for (const role of ROLES) {
    it(`share no band on any page of any boss rehearsal, for ${role}`, () => {
      expect(ROUND_FILMS.length, "no boss wave carries a film").toBeGreaterThan(0);
      const { ctx } = stubCanvas();
      const l = computeLayout(PHONE, CFG, role);
      for (const i of ROUND_FILMS) {
        const world = guided(i);
        const stage = new GuideStage();
        for (let page = 0; page < guidePages(world); page++) {
          // Past the switch, so the page is where it will stand: a page that
          // slid in is at rest after a beat and holds there.
          for (let f = 0; f < 90; f++) stage.update(world, 1 / 60, role);
          ctx.texts = [];
          drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
            role,
            scene: stage,
            time: 1.5,
            fx: new OpeningFx(),
          });
          const plate = ctx.texts.filter((t) => PLATE_WORDS.test(t.text));
          if (plate.length > 0) {
            // The plate is as wide as its longest word plus the room an
            // ellipse costs it (`guide-switch.ts`); a header clear of that is
            // clear of the plate.
            const plateRight = Math.max(...plate.map((t) => t.x + t.w)) * 1.2;
            const under = ctx.texts.filter(
              (t) => !PLATE_WORDS.test(t.text) && inPlateBand(t, plateRight),
            );
            expect(
              under.map((t) => `"${t.text}" at ${Math.round(t.x)},${Math.round(t.y)}`),
              `${WAVES[i]?.name} page ${page + 1}: words under the plate`,
            ).toEqual([]);
          }
          ctx.texts = undefined;
          guideStepHeard(world, 1, false);
          guideStepHeard(world, 2, false);
        }
      }
    }, 60_000);
  }
});
