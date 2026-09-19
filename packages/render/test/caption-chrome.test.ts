import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { guideScene, type SceneStep, sceneScript, stepSpan, WAVES } from "@neon-spore/content";
import { beatPhase, DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { bandControlSet } from "../src/band.js";
import { filmLayout } from "../src/guide-film.js";
import { BAND_FOOT } from "../src/guide-tide.js";
import { captionBox } from "../src/guide-tide-caption-box.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { shipTopFoot } from "../src/ship-top-chrome.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A page's caption plate and the ship's own chrome under the band.
 *
 * The band used to cover the siren, its duty word and the two alarm rows, so a
 * caption that stopped at the band's foot had nothing to land on. They came
 * out from under it on 16 September 2026 and the page landed on them instead:
 * `TORCH · COLUMNS 3-4 · CALL IT` read as `-4 · CALL IT`, and THE MAGNET's
 * page cut the duty word `PULL` in half (photographed at 9caab36c).
 *
 * **Measured on the box, not on the words.** The plate is an opaque fill, so a
 * check that no two *texts* overlap passes while the row underneath is gone —
 * which is how this shipped in the first place. `captionBox` is the seam
 * (`guide-tide-caption-box.ts`).
 *
 * **And measured in the film's own layout.** A page is drawn phone-shaped
 * inside the stage and its own `Layout` is shorter than the phone's, so the
 * same anchor lands on a different row in each — far enough that the whole
 * collision disappears when the stage's layout is used by mistake.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const PHONE = { width: 390, height: 844, dpr: 1 };
const ROLES: ViewRole[] = ["p1", "p2"];
/** The two waves whose chrome writes at the top and whose guide plays a film. */
const WAVE_NAMES = ["TORCH", "THE MAGNET"];

beforeAll(installCanvasGlobals);

interface Page {
  where: string;
  /** The lowest row the ship wrote on, and the top of the plate over it. */
  foot: number;
  y: number;
}

/**
 * Every page of the wave's film, in the state the film really plays it in:
 * the scene's own run rather than a world posed to look like one, which is
 * the only thing that puts a blip on the strip where the page points at it.
 */
function pagesOf(name: string, role: ViewRole): Page[] {
  const index = WAVES.findIndex((w) => w.name === name);
  expect(index, `no wave named ${name}`).toBeGreaterThanOrEqual(0);
  const id = WAVES[index]?.guide?.scene;
  expect(id, `${name} plays no film`).toBeDefined();
  if (id === undefined) return [];
  const scene = guideScene(id);
  const { ctx } = stubCanvas();
  const { l } = filmLayout(computeLayout(PHONE, CFG, role), CFG, role === "p1" ? 1 : 2);
  const set = bandControlSet(undefined, index);
  const run = new SceneRun(sceneScript(id, index, CFG));
  const out: Page[] = [];
  scene.steps.forEach((step: SceneStep, i: number) => {
    run.restart(stepSpan(scene, i).from);
    const foot = shipTopFoot(l, run.world);
    const box = captionBox(
      ctx as unknown as CanvasRenderingContext2D,
      l,
      run.world,
      set,
      step,
      beatPhase(CFG, run.world.tick),
    );
    if (foot === null || !box) return;
    out.push({ where: `${name} ${role} page ${i + 1}`, foot, y: box.y });
  });
  return out;
}

describe("a rehearsal's caption plate and the ship's chrome", () => {
  for (const name of WAVE_NAMES) {
    it(`${name}: no page's plate starts above a row the ship wrote`, () => {
      // Both seats together: a radar is one person's (`showsRadar`), so the
      // navigator's pages may have nothing at the top to collide with and
      // contribute none. The wave has to contribute some, or the loop below
      // is walking an empty list.
      const seen = ROLES.flatMap((role) => pagesOf(name, role));
      expect(seen.length, "no page had both a plate and a row").toBeGreaterThan(0);
      for (const page of seen) {
        // A plate starting above the chrome's foot covers it: the plate is an
        // opaque fill and the chrome was drawn first.
        expect(
          page.y,
          `${page.where}: a plate at ${Math.round(page.y)} over chrome reaching ${Math.round(page.foot)}`,
        ).toBeGreaterThanOrEqual(page.foot);
      }
    });
  }
});

describe("shipTopFoot", () => {
  function runOf(name: string): SceneRun {
    const index = WAVES.findIndex((w) => w.name === name);
    const id = WAVES[index]?.guide?.scene;
    if (id === undefined) throw new Error(`${name} plays no film`);
    const run = new SceneRun(sceneScript(id, index, CFG));
    run.restart(stepSpan(guideScene(id), 0).from);
    return run;
  }

  const filmL = (role: ViewRole) =>
    filmLayout(computeLayout(PHONE, CFG, role), CFG, role === "p1" ? 1 : 2).l;

  it("reaches past the top of the picture while a call is up, well short of the band", () => {
    const foot = shipTopFoot(filmL("p1"), runOf("TORCH").world);
    expect(foot, "TORCH's own rehearsal wrote nothing at the top").not.toBeNull();
    expect(foot as number).toBeLessThan(BAND_FOOT);
  });
});
