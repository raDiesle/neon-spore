import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  controlSetForWave,
  deskKeys,
  guideScene,
  keyGlyph,
  setControls,
  WAVES,
  waveGuideSteps,
} from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave } from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { GuideStage } from "../src/guide-scene.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A guide at a desk wears its keys (`guide-keycaps.ts`), and a guide on a
 * phone does not. Every film's first page, drawn both ways for both seats, so
 * a panel whose controls the caps cannot place fails here rather than on the
 * owner's screen.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const SIZE = { width: 390, height: 844, dpr: 2 };
const FILMS = WAVES.flatMap((w, i) => (w.guide?.scene ? [i] : []));

beforeAll(installCanvasGlobals);

function firstPage(wave: number, role: ViewRole, keys: boolean): TextBox[] {
  const { ctx } = stubCanvas();
  const l = computeLayout(SIZE, CFG, role);
  const world = createWorld(CFG, 3);
  startWave(world, wave, [], [], null, true, waveGuideSteps(wave));
  const stage = new GuideStage();
  // Two seconds in: the slide in from the seat before has finished.
  for (let f = 0; f < 120; f++) stage.update(world, 1 / 60, role);
  ctx.texts = [];
  drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
    role,
    scene: stage,
    time: 2,
    fx: new OpeningFx(),
    keys,
  });
  return ctx.texts as TextBox[];
}

/** How many times each one-character text was drawn. */
function singles(texts: readonly TextBox[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of texts) {
    if ([...t.text].length === 1) out.set(t.text, (out.get(t.text) ?? 0) + 1);
  }
  return out;
}

describe("the guide's keycaps", () => {
  it("are reached at all", () => {
    expect(FILMS.length).toBeGreaterThan(0);
  });

  it("put A and D at the ends of the first film's cannon strip", () => {
    const wave = FILMS[0]!;
    const caps = singles(firstPage(wave, "p1", true));
    const cannon = deskKeys(controlSetForWave(wave)).filter((k) => k.control === "cannon");
    expect(cannon.length).toBe(2);
    for (const k of cannon) expect(caps.get(keyGlyph(k.code)) ?? 0).toBeGreaterThan(0);
  });

  for (const role of ["p1", "p2"] as const) {
    it(`are drawn on a desk and never on a phone, on every film, for ${role}`, () => {
      for (const wave of FILMS) {
        const desk = singles(firstPage(wave, role, true));
        const phone = singles(firstPage(wave, role, false));
        const extra = [...desk].reduce((n, [t, c]) => n + c - (phone.get(t) ?? 0), 0);
        const glyphs = new Set(deskKeys(controlSetForWave(wave)).map((k) => keyGlyph(k.code)));
        for (const [t, c] of desk) {
          if (c > (phone.get(t) ?? 0))
            expect(glyphs.has(t), `${WAVES[wave]!.name}: ${t}`).toBe(true);
        }
        // A page whose seat holds nothing on the band owes no key: THE FLUE's
        // first page is player 1's, who only sees and speaks (SHOTS).
        const scene = WAVES[wave]!.guide?.scene;
        const seat = scene === undefined ? 1 : (guideScene(scene).steps[0]?.seat ?? 1);
        const holds = setControls(controlSetForWave(wave), seat === 2 ? 2 : 1).length > 0;
        if (holds) expect(extra, `${WAVES[wave]!.name} shows no key`).toBeGreaterThan(0);
        else expect(extra, `${WAVES[wave]!.name} shows a key on an empty band`).toBe(0);
      }
    });
  }
});
