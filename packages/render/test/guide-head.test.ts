import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, toReadyPage, type World } from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { GUIDE_LOOK } from "../src/guide-look.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Which wave a guide is a guide to, said on every page of it.**
 *
 * The owner asked for the number and the name on every tutorial page on 18
 * September 2026; the last page of a stepped guide had carried them since the
 * gate moved there and no page before it carried anything. The band says it
 * now, on a plate hung under the bezel (`guide-tide.ts`), and the three things
 * worth holding are that it is *there* on a page of prose and a page of film,
 * that it is *not* there on the gate — which says it already, larger — and
 * that it falls on the guide's clock rather than the page's, so turning a page
 * does not replay it under somebody's eye.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const SIZES = [
  { width: 390, height: 844, dpr: 2 },
  { width: 320, height: 568, dpr: 1 },
  { width: 900, height: 1600, dpr: 2 },
];
const FILM = WAVES.findIndex((w) => w.guide?.scene);
/** What the band should say, for the wave these tests open. */
const HEAD = `WAVE ${FILM + 1} · ${WAVES[FILM]?.name}`;

beforeAll(installCanvasGlobals);

function guided(): World {
  const world = createWorld(CFG, 3);
  startWave(world, FILM, [], [], null, true, waveGuideSteps(FILM));
  return world;
}

/** One page, drawn settled: no `fx`, which is "this has been up for ever". */
function page(
  world: World,
  role: ViewRole,
  size = SIZES[0]!,
  stage?: GuideStage,
): { texts: TextBox[]; width: number } {
  const { ctx } = stubCanvas();
  const l = computeLayout(size, CFG, role);
  ctx.texts = [];
  drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, { role, scene: stage });
  return { texts: ctx.texts as TextBox[], width: l.width };
}

describe("the wave's name on a guide page", () => {
  it("is on a page of prose, once, inside the band and centred", () => {
    for (const size of SIZES) {
      const { texts, width } = page(guided(), "p1", size);
      const found = texts.filter((t) => t.text === HEAD);
      expect(found.length, `${size.width}: ${HEAD}`).toBe(1);
      const t = found[0]!;
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y + t.h).toBeLessThanOrEqual(GUIDE_LOOK.bandFoot);
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x + t.w).toBeLessThanOrEqual(width);
      // Centred: the two margins are the same to within a pixel of rounding.
      expect(Math.abs(t.x - (width - (t.x + t.w)))).toBeLessThanOrEqual(1);
    }
  });

  it("is on a page of film too, where the badge already names a seat", () => {
    const world = guided();
    const stage = new GuideStage();
    for (let f = 0; f < 60; f++) stage.update(world, 1 / 60, "p1");
    const { texts } = page(world, "p1", SIZES[0], stage);
    expect(texts.some((t) => t.text === "TUTORIAL")).toBe(true);
    expect(texts.filter((t) => t.text === HEAD).length).toBe(1);
  });

  it("is not on the gate, which says the same thing larger", () => {
    const world = guided();
    toReadyPage(world, 1);
    const { texts } = page(world, "p1");
    expect(texts.some((t) => t.text === HEAD)).toBe(false);
    // The introduction's own two rows are what says it there.
    expect(texts.some((t) => t.text === `WAVE ${FILM + 1}`)).toBe(true);
    expect(texts.some((t) => t.text === WAVES[FILM]?.name)).toBe(true);
  });
});

describe("the clock the nameplate falls on", () => {
  it("runs through a page turn and restarts on a new wave", () => {
    const fx = new OpeningFx();
    for (let f = 0; f < 60; f++) fx.update(1 / 60, "4|0");
    const settled = fx.waveAge;
    expect(settled).toBeGreaterThan(0.9);
    // A page turn inside the same wave: the page's clock goes back, the
    // wave's does not — the whole point of the second clock.
    fx.update(1 / 60, "4|1");
    expect(fx.age).toBeLessThan(0.1);
    expect(fx.waveAge).toBeGreaterThan(settled);
    // And the gate, which is still the same wave.
    fx.update(1 / 60, "4|2|ready");
    expect(fx.waveAge).toBeGreaterThan(settled);
    // A different wave is a different header, and it falls again.
    fx.update(1 / 60, "5|0");
    expect(fx.waveAge).toBeLessThan(0.1);
  });

  it("is cleared with everything else the frame outlives", () => {
    const fx = new OpeningFx();
    for (let f = 0; f < 60; f++) fx.update(1 / 60, "4|0");
    fx.reset();
    expect(fx.waveAge).toBe(0);
  });
});
