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
import { filmLayout } from "../src/guide-film.js";
import { GuideStage } from "../src/guide-scene.js";
import { BANNER_H, BANNER_TOP } from "../src/guide-switch.js";
import { plateBoxAround } from "../src/handover-look.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

/**
 * A round's header makes room for the tutorial plate.
 *
 * A rehearsal carries one plate across the top — TUTORIAL over PLAYER n ·
 * SCREEN — and it is always there and never fades, which is what the owner
 * asked for.
 * A boss round draws a header of its own in the same band: its name, the
 * window, the stage, the tally. Until 10 September 2026 the plate sat on top
 * of all of it on every boss rehearsal in the game, so two things were in one
 * place and neither was legible. The plate is right and the header is right;
 * this holds that the header has dropped out from under it (`round-header.ts`).
 *
 * The check is on the words themselves: every `fillText` a page draws, as the
 * box its glyphs occupy, against the band the plate stands in. The plate's own
 * two rows are the only words allowed there. Since 14 September 2026 the
 * plate is the whole width of the screen, so the band is too: nothing else
 * may be written between `BANNER_TOP` and its foot, from edge to edge.
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

/** Whether a word's box crosses the band the plate stands in. */
function inPlateBand(t: TextBox): boolean {
  const top = BANNER_TOP;
  const bottom = BANNER_TOP + BANNER_H;
  return t.y < bottom && t.y + t.h > top;
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
            const under = ctx.texts.filter((t) => !PLATE_WORDS.test(t.text) && inPlateBand(t));
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

/**
 * THE HANDOVER's countdown plate and the caption of the page over it.
 *
 * The fault's plate sits on the lip of the band, and a caption anchored on a
 * strip stands `CLEAR_STRIP` — four pixels — above its ring, which on this
 * wave is the same lip. So the fourth page of the rehearsal drew PLAYER 2
 * MOVES THE CANNON straight over THEIR PANEL — BACK IN 3, covering all of it
 * but the first two letters (photographed 13 September 2026 with
 * `bun run frames . --wave "THE HANDOVER" --opening guide --guide-page 3`).
 *
 * The same defect as the one above and the same check: every word a page
 * draws, against the rectangle the plate fills. The plate's own words are
 * allowed in it and nothing else is — the caption goes under its ring instead,
 * which is what a caption that would cross the banner already does.
 */
const PLATE_SAYS = /^THEIR PANEL|^PANELS TRADE/;

describe("THE HANDOVER's plate and a rehearsal's caption", () => {
  const wave = WAVES.findIndex((w) => w.name === "THE HANDOVER");

  for (const role of ROLES) {
    it(`share no room on any page of the rehearsal, for ${role}`, () => {
      expect(wave, "no wave named THE HANDOVER").toBeGreaterThanOrEqual(0);
      const { ctx } = stubCanvas();
      const stage = computeLayout(PHONE, CFG, role);
      // The film's own rectangle, which is what the plate is centred in — the
      // page is drawn phone-shaped inside the stage (`guide-film.ts`). Either
      // seat answers: the two differ in role alone, and the plate is the same
      // width and on the same lip on both.
      const { l } = filmLayout(stage, CFG, 1);
      const world = guided(wave);
      const play = new GuideStage();
      let seen = 0;
      for (let page = 0; page < guidePages(world); page++) {
        for (let f = 0; f < 90; f++) play.update(world, 1 / 60, role);
        ctx.texts = [];
        drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, stage, world, {
          role,
          scene: play,
          time: 1.5,
          fx: new OpeningFx(),
        });
        const said = ctx.texts.find((t) => PLATE_SAYS.test(t.text));
        if (said) {
          seen++;
          const box = plateBoxAround(ctx as unknown as CanvasRenderingContext2D, l, said.text);
          const over = ctx.texts.filter(
            (t) =>
              !PLATE_SAYS.test(t.text) &&
              t.x < box.x + box.w &&
              t.x + t.w > box.x &&
              t.y < box.y + box.h &&
              t.y + t.h > box.y,
          );
          expect(
            over.map((t) => `"${t.text}" at ${Math.round(t.x)},${Math.round(t.y)}`),
            `page ${page + 1}: words over the countdown plate`,
          ).toEqual([]);
        }
        ctx.texts = undefined;
        guideStepHeard(world, 1, false);
        guideStepHeard(world, 2, false);
      }
      expect(seen, "no page of the rehearsal drew the plate at all").toBeGreaterThan(0);
    }, 60_000);
  }
});
