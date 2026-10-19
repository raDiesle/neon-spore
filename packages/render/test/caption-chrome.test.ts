import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSetForWave, queueFromWave, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { captionBox } from "../src/guide-tide-caption-box.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { shipTopFoot } from "../src/ship-top-chrome.js";
import { HINT_BEATS, waveHint } from "../src/wave-hint.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A tutorial plate and the ship's own chrome under the band.
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
 * (`guide-tide-caption-box.ts`), and it is the same seam for a film's page and
 * a hint on the live field.
 *
 * **Measured on the live field since 19 October 2026**, when TORCH and THE
 * MAGNET, the two films this was written on, became hints on their fields
 * (`wave-hint.ts`). TORCH's is the one with a call up the whole time it
 * teaches: its warning is the call.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: false };
const PHONE = { width: 390, height: 844, dpr: 1 };
const ROLES: ViewRole[] = ["p1", "p2"];
const TORCH = WAVES.findIndex((w) => w.name === "TORCH");

beforeAll(installCanvasGlobals);

/** TORCH in play, stepped until the ship writes a row at the top of p1's screen. */
function calling(): { world: World; foot: (l: Layout) => number | null } {
  const world = createWorld(CFG, 7);
  startWave(world, TORCH, queueFromWave(WAVES[TORCH]!, CFG.cols));
  const p1 = computeLayout(PHONE, CFG, "p1");
  for (let i = 0; i < 2000 && shipTopFoot(p1, world) === null; i++) step(world, []);
  return { world, foot: (l) => shipTopFoot(l, world) };
}

describe("a tutorial plate and the ship's chrome", () => {
  it("TORCH: no plate starts above a row the ship wrote, on either seat", () => {
    const { world, foot } = calling();
    const { ctx } = stubCanvas();
    const set = controlSetForWave(TORCH);
    let seen = 0;
    for (const role of ROLES) {
      const l = computeLayout(PHONE, CFG, role);
      const reach = foot(l);
      // A radar is one person's (`showsRadar`), so the navigator's screen may
      // have nothing at the top to collide with, and contributes none.
      if (reach === null) continue;
      for (let turn = 0; turn < 6; turn++) {
        world.beat = turn * HINT_BEATS;
        const hint = waveHint(l, world, 0.5, set);
        if (hint === null) continue;
        const step = { tick: 0, seat: hint.seat, text: hint.text, anchor: hint.anchor };
        const box = captionBox(
          ctx as unknown as CanvasRenderingContext2D,
          l,
          world,
          set,
          step,
          0.5,
        );
        if (!box) continue;
        seen++;
        // A plate starting above the chrome's foot covers it: the plate is an
        // opaque fill and the chrome was drawn first.
        expect(
          box.y,
          `${role} "${hint.text}": a plate at ${Math.round(box.y)} over chrome reaching ${Math.round(reach)}`,
        ).toBeGreaterThanOrEqual(reach);
      }
    }
    expect(seen, "no hint had both a plate and a row").toBeGreaterThan(0);
  });

  it("shipTopFoot reaches past the top of the picture while TORCH's call is up", () => {
    const { foot } = calling();
    expect(foot(computeLayout(PHONE, CFG, "p1")), "TORCH wrote nothing at the top").not.toBeNull();
  });
});
