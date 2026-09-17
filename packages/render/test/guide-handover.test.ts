import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSetForWave, placedFaults, WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guideStepHeard,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { filmLayout } from "../src/guide-film.js";
import { GuideStage } from "../src/guide-scene.js";
import { handedSeat } from "../src/handover.js";
import { bandLobes, computeLayout } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE HANDOVER's rehearsal trades the panel and keeps the phone.**
 *
 * The fault changes which half of the game is on a device, and a film is the
 * only place the pair is shown that happening rather than told it. What makes
 * it possible is one line in `guide-scene.ts`: a page belongs to a *device*,
 * and the panel drawn on it is whichever one that device is holding at this
 * tick (`handedSeat`). The corner plate goes on saying which phone it is,
 * because that plate is what makes the trade legible — a page that swapped it
 * too would just be a page about the other player.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };
/** The wave the fault is taught on, and the one film that carries it. */
const WAVE = WAVES.findIndex((w) => w.guide?.scene === "theHandover");

beforeAll(installCanvasGlobals);

function guided(): World {
  const world = createWorld(CFG, 3);
  startWave(world, WAVE, [], [], null, true, waveGuideSteps(WAVE));
  return world;
}

/** The wave's own world, stepped to a beat inside the window. */
function traded(): World {
  // No opening over it: a world held behind a guide does not step its wave at
  // all, and what this wants is the wave's own clock (`sim/step.ts`).
  const world = createWorld({ ...CFG, briefings: false }, 3);
  startWave(world, WAVE, [], [], null, false, 0, placedFaults(WAVES[WAVE]?.faults));
  // The wave trades on its tenth beat and holds for eight (`act-8.ts`), so a
  // dozen beats in is inside the window on any tempo the config carries.
  const ticks = (DEFAULT_CONFIG.tickHz * 60 * 12) / DEFAULT_CONFIG.bpm;
  for (let t = 0; t < ticks; t++) step(world, []);
  return world;
}

describe("the seat a rehearsal's page is drawn for", () => {
  it("is named by a wave, so the film this file is about is reached at all", () => {
    expect(WAVE, "no wave shows theHandover").toBeGreaterThanOrEqual(0);
  });

  it("is the page's own while nothing is traded", () => {
    const world = guided();
    expect(handedSeat(1, world)).toBe(1);
    expect(handedSeat(2, world)).toBe(2);
  });

  it("is the other one while the panels are away", () => {
    const world = traded();
    expect(handedSeat(1, world)).toBe(2);
    expect(handedSeat(2, world)).toBe(1);
  });

  it("lays the film out for the panel the device is holding, not for its seat", () => {
    // The composition `guide-scene.ts` performs, and the whole of what the
    // trade means on a film: the pilot's page is the navigator's band, lobes
    // and all. `bandLobes` answers [] for a half the layout's role does not
    // show, which is what makes this a fact about the picture and not a name.
    const world = traded();
    const box = computeLayout(PHONE, CFG, "p1");
    const { l } = filmLayout(box, CFG, handedSeat(1, world));
    const set = controlSetForWave(WAVE);
    expect(l.role).toBe("p2");
    expect(bandLobes(l, set, 2).length).toBeGreaterThan(0);
    expect(bandLobes(l, set, 1)).toEqual([]);
  });
});

/** Every word the film's page draws, for the viewer on player 1's phone. */
function wordsOnPage(page: number): string[] {
  const { ctx } = stubCanvas();
  const l = computeLayout(PHONE, CFG, "p1");
  const world = guided();
  const stage = new GuideStage();
  for (let p = 0; p <= page; p++) {
    for (let f = 0; f < 90; f++) stage.update(world, 1 / 60, "p1");
    if (p === page) break;
    guideStepHeard(world, 1, false);
    guideStepHeard(world, 2, false);
  }
  ctx.texts = [];
  drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
    role: "p1",
    scene: stage,
    time: 1.5,
    fx: new OpeningFx(),
  });
  const said = ctx.texts.map((t) => t.text);
  ctx.texts = undefined;
  return said;
}

describe("THE HANDOVER's film, drawn", () => {
  it("puts its third page inside the window, and says so on the lip", () => {
    // The film's own window opens on its sixth beat and outlasts the loop
    // (`scenes/the-handover.ts`), so the page the pair reads the trade off is
    // counting its way back out the whole time it is up.
    const said = wordsOnPage(2);
    expect(
      said.some((t) => t.includes("BACK IN")),
      said.join(" · "),
    ).toBe(true);
  });

  it("goes on saying which phone it is while it does", () => {
    expect(wordsOnPage(2)).toContain("PLAYER 1 · SCREEN");
  });
});
