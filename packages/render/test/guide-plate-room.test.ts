import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guidePages,
  guideStepHeard,
  startWave,
  type World,
} from "@neon-spore/sim";
import { HANG_MS } from "../../../tools/test/cpu-time.js";
import { drawWaveOpening } from "../src/briefing.js";
import { filmLayout } from "../src/guide-film.js";
import { GUIDE_LOOK } from "../src/guide-look.js";
import { GuideStage } from "../src/guide-scene.js";
import { plateBoxAround } from "../src/handover-look.js";
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
 * A round's header makes room for the tutorial plate.
 *
 * A rehearsal carries one plate across the top — TUTORIAL over PLAYER n ·
 * SCREEN — and it is always there and never fades, which is what the owner
 * asked for.
 * A boss round draws a header of its own in the same band: its name, the
 * window, the stage, the tally. Until 10 September 2026 the plate sat on top
 * of all of it on every boss rehearsal in the game, so two things were in one
 * place and neither was legible. The plate is right and the header is right;
 * this holds that the header stays out from under it. Each round's own header
 * used to drop clear of the plate one element at a time; since 18 September
 * 2026 the whole picture is laid out below the band instead
 * (`guide-film.ts`), so there is nothing left for a header to drop under.
 *
 * The check is on the words themselves: the box a round's own name occupies,
 * and the box the run's line occupies, against the band the chrome stands in.
 * The band's foot is read off `GUIDE_LOOK` rather than off a constant, because
 * the band is a look and a look is voted on (`guide-look.ts`) — it has been 77
 * and it has been 104.
 *
 * **It used to sweep every word on the page, and that was never what it was
 * doing.** `canvas-stub` recorded a `fillText` at the coordinates it was
 * handed and not at the ones the transform would put it at, and a guide draws
 * its page inside a translate — so the sweep was reading boxes hundreds of
 * pixels from where the eye sees them, and passed by luck. The stub applies
 * its transform since 16 September 2026, and the sweep turned up a whole class
 * of collisions older than this test: THE FLEET's and THE WISP's chart axes,
 * THE SPLICE's clock, TORCH's and THE MAGNET's target line, and a rehearsal
 * whose picture is the lost screen. Every one of them is under the band and
 * most of them were under the narrower band too. They are in `docs/queue.md`,
 * with the list, because they are a lane and not a line.
 *
 * **Some of them are done and are not swept here.** TORCH's call and THE
 * MAGNET's are the ship's own chrome rather than a round's, so they are on
 * every wave that sends one and on none of the boss waves this sweep walks —
 * a word added to the filter below would never have matched. They hang off
 * the siren, held by `alarm-room.test.ts`. THE WISP's
 * lattice is an ordinary wave's, outside this net for the same reason, and is
 * held by `guide-grid-room.test.ts`. The lost screen used as a page's subject
 * is out of the band by being out of the film altogether — the owner took it
 * off a rehearsal on 18 September 2026 — and the sweep that holds it there is
 * `guide-lost-room.test.ts`. What is left is the
 * three labels glued to bodies that happen to stand high — THE BEATBOX's
 * count, THE VEER's, THE JAM's `LURE` — and they are left on purpose: the
 * owner's answer of 17 September 2026 is that a label on a body **stays as it
 * is**, because clearance would tear it off the thing it names.
 *
 * **THE SPLICE's clock is swept here since 17 September 2026**: `1 OF 2 · 26`
 * on the seat shown the tangle is a readout at a fixed offset from the top of
 * the picture, and the picture starts below the band (`splice-draw.ts`,
 * `guide-film.ts`).
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2"];
/** Every wave whose guide plays a film and whose world is a round. */
const ROUND_FILMS = WAVES.map((w, i) => (w.guide?.scene && w.boss ? i : -1)).filter((i) => i >= 0);
/** A phone's screen, at the size the film is drawn on. */
const PHONE = { width: 390, height: 844, dpr: 1 };

beforeAll(installCanvasGlobals);

function guided(waveIndex: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, waveIndex, [], [], null, true, waveGuideSteps(waveIndex));
  return world;
}

/** The run's line in the corner: a clock, and the retries once there are any. */
const RUN_LINE = /^\d+:\d{2}( ·|$)/;

/**
 * And the boss cue: the verb under the mark and the kind of action over it,
 * which is what the field says instead of the briefing (`boss-cue-draw.ts`,
 * `docs/decisions.md` #34).
 *
 * It is on every boss wave rather than on one, so it is here beside the run's
 * line rather than in `ALSO` below, and both lines are swept. It went in on 18
 * September 2026 with the clamp it holds: the kind line used to stop at the
 * top of the *canvas*, which on a rehearsal is 94 pixels inside the plate, and
 * a film draws the cue like anything else (`guide-seat.ts` → `drawBodies`).
 * Bosses put a word under the band — THE GORGE's intakes had the kind line
 * in it, and THE SCUTTLE's borrowed lock box stands in the band with its
 * mark, so the verb was in it too. Since then the picture — cue included — is laid out below the band
 * altogether (`guide-film.ts`), which is what keeps both lines out of it now.
 *
 * **A word the plate covers is the tutorial covering the one thing the field
 * was built to say for it**, which is why these move and THE BEATBOX's count
 * does not: the count describes a body and the cue is the machine asking for
 * something.
 */
const CUE_WORD =
  /^(PRESS|HOLD|CARRY|TURN|BURN|CALL|CLAMP|FIRE|FLING|GUARD|LAUNCH|MOVE|OPEN|PIERCE|PINCH|PRY|PULL|REPEAT|SHEAR|SHOVE|SWIPE)$/;

/**
 * **There is no longer an exemption in this list.** Two of those words used to
 * be drawn by something that was not the cue — THE ANTIPHON wrote `TURN` under
 * every standing organ and THE SURGE wrote `HOLD` under its head, out of
 * `handle-draw.ts` — so the sweep had to be told not to read a handle's word as
 * a cue's, and a word standing in the band was allowed to stay there under the
 * owner's rule of 17 September 2026 about labels on bodies. Those three handle
 * bosses speak in the cue's own voice since 18 September 2026
 * (`render/src/boss-cue-text.ts`), which means their words take the cue's floor
 * like every other, and the sweep holds them to it with nothing excused.
 */

/**
 * What else a round's page must keep out of the band, wave by wave.
 *
 * The sweep was narrowed to the round's name and the run's line on 16
 * September 2026, when it first ran with the transform applied and turned up a
 * whole class of collisions older than it. `docs/queue.md` carries the list,
 * and the instruction in this file's header is to widen it back a site at a
 * time as each is fixed — so a row here is a site that is done and is held
 * done, and the ones still missing are the ones still in the queue.
 *
 * **THE FLEET**: the chart's axis, which is a letter across the foot and a
 * number down the gutter, and the square names the marks and the sights write
 * on it — a letter and a digit together. The whole chart stands on the
 * picture, which starts below the band, rather than moving its numbers to the
 * other edge (`fleet-chart.ts`).
 *
 * **THE SPLICE**: its own clock — which number of how many, and the beats
 * left — which stands on the picture with the rest of its header.
 */
const ALSO: Record<string, RegExp> = {
  "THE FLEET": /^[A-K]$|^[A-K][0-9]{1,2}$|^[0-9]{1,2}$/,
  "THE SPLICE": /^[0-9]+ OF [0-9]+ · [0-9]+$/,
};

/** Whether a word's box crosses the band the chrome stands in. */
function inPlateBand(t: TextBox): boolean {
  return t.y < GUIDE_LOOK.bandFoot && t.y + t.h > 0;
}

describe("the tutorial plate and a round's header", () => {
  for (const role of ROLES) {
    it(
      `share no band on any page of any boss rehearsal, for ${role}`,
      () => {
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
            const plate = ctx.texts.filter((t) => /^TUTORIAL$/.test(t.text));
            if (plate.length > 0) {
              const name = WAVES[i]?.name ?? "";
              const under = ctx.texts.filter(
                (t) =>
                  (t.text === name ||
                    RUN_LINE.test(t.text) ||
                    CUE_WORD.test(t.text) ||
                    ALSO[name]?.test(t.text) === true) &&
                  inPlateBand(t),
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
      },
      WALK_MS,
    );
  }
});

/**
 * **The band covers nothing, because the picture starts under it.**
 *
 * Until 18 September 2026 a page was the box less the bar's height and the
 * field was anchored to the panel at the bottom, so row 0 stood about the bar's
 * height higher in a film than in the wave — under the band. Anything a boss
 * hangs *over* row 0 was drawn there and then covered: THE TASTER's crest and
 * fan, THE GORGE's sack, THE ANTIPHON's body and rail.
 * The band's foot comes off the playable height now, the way the bar's already
 * did (`guide-film.ts`), and this is the geometry of that: the picture begins
 * at the band's foot, and row 0 with the deepest overhang any boss draws over
 * it still begins below it.
 *
 * The overhang is THE TASTER's, which is the deepest measured when the fault
 * was found: `tasterCrestY`, 0.42 tiles over row 0. It is written here rather
 * than imported because what is being held is *room*, not that one boss's
 * number — a boss that wanted more than this much would be a page of film to
 * look at again.
 */
const OVERHANG = 0.42;

describe("the film's picture and the band over it", () => {
  for (const role of ROLES) {
    it(`leaves the band to itself, for ${role}`, () => {
      const seat = role === "p1" ? 1 : 2;
      const box = computeLayout(PHONE, CFG, role);
      const { page, l, top } = filmLayout(box, CFG, seat);
      expect(top, "the picture does not start at the band's foot").toBe(GUIDE_LOOK.bandFoot);
      const row0 = top + l.gridTop;
      expect(
        row0 - OVERHANG * l.tile,
        "what a boss hangs over row 0 is drawn inside the band",
      ).toBeGreaterThan(GUIDE_LOOK.bandFoot);
      // And it still ends above the bar: the two are taken off one height.
      expect(top + l.height, "the picture runs past the page").toBeLessThanOrEqual(page.height);
    });
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
    it(
      `share no room on any page of the rehearsal, for ${role}`,
      () => {
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
      },
      WALK_MS,
    );
  }
});
