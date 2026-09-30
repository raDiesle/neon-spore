import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { ROUND_DRAWS } from "../src/round-draw.js";
import { FRAME_TIMEOUT_MS } from "./frame-harness.js";
import { drawPixels, installPixelGlobals, PIXEL_VIEWPORT, type Picture } from "./pixel-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **No boss touches the top of the screen** — the owner, 29 September 2026, on
 * THE STARE (`.claude/skills/new-boss/generic.md`). The phone's bar and the seat
 * switcher stand there, and a body under them is half read.
 *
 * Each boss wave is drawn bare (`ViewState.bare`: the bodies and nothing else)
 * twice, with its boss and without, on both seats and at three beats; the first
 * row where the two differ is the boss's topmost point, and it has to be below
 * the switcher's bottom. On the day this landed the nearest was THE LEDGER at
 * row 71, forty rows clear.
 */

/**
 * The switcher's bottom edge in CSS pixels, from `apps/game/src/game.css`:
 * `top: 6px`, and a 1px border, 2px padding, 4px button padding and a 10px line,
 * each twice. The harness viewport has no safe-area inset, so that is all of it.
 */
const SWITCHER_BOTTOM = 6 + 2 * (1 + 2 + 4) + 10;

/**
 * Bosses outside the claim, each for a reason the rule does not reach. A round
 * (`ROUND_DRAWS`) is not here: it takes the whole stage as its own picture
 * (`docs/decisions.md` #21), so drawing it without its boss is not the same
 * picture less a body.
 */
const EXEMPT: Record<string, string> = {
  // The living hold the fight is in (`splice-hold.ts`) is the room, walls and
  // cables from edge to edge, the way a backdrop is; the straws hang inside it.
  splice: "the hold is the room the fight is in, not a body",
  // The reflected hull over the field is the fight's picture: the owner, 30
  // September 2026, asked whether to pull it down or cut it — "keep it as it is".
  mirror: "the reflected hull is the design; the owner kept it, 30 September 2026",
};

/**
 * Rows the owner put there himself: every boss wears the fuse along the top of
 * the screen (`slow-fuse.ts`), and THE MAZE draws its clocks on it
 * (`maze-fuse.ts`) in the boss's own pass. That is HUD, asked for clear of the
 * top edge, and the measurement starts under it.
 */
const FROM_ROW: Record<string, number> = { maze: 45 };

/** The first row at or under `from` where `a` and `b` differ by more than a
 * rounding, or -1. */
function topmostDifference(a: Picture, b: Picture, from: number): number {
  for (let y = from; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        if (Math.abs((a.pixels[i + c] ?? 0) - (b.pixels[i + c] ?? 0)) > 12) return y;
      }
    }
  }
  return -1;
}

beforeAll(installPixelGlobals);

describe("a boss's body", () => {
  it("stays below the seat switcher on both seats", () => {
    const tpb = ticksPerBeat(DEFAULT_CONFIG);
    const cols = DEFAULT_CONFIG.cols;
    const high: string[] = [];
    let measured = 0;
    WAVES.forEach((wave, index) => {
      const kind = wave.boss?.kind;
      if (!kind || kind in ROUND_DRAWS || kind in EXEMPT) return;
      const world = createWorld(DEFAULT_CONFIG, 3, []);
      startWave(
        world,
        index,
        buildQueue(index, cols),
        buildPods(index, cols),
        buildBoss(index, cols),
      );
      for (const beat of [2, 6, 12]) {
        while (world.tick < beat * tpb) step(world, []);
        for (const role of ["p1", "p2"] as ViewRole[]) {
          const withBoss = drawPixels(world, role, PIXEL_VIEWPORT, true).picture;
          const without = drawPixels({ ...world, boss: null }, role, PIXEL_VIEWPORT, true).picture;
          const top = topmostDifference(withBoss, without, FROM_ROW[kind] ?? 0);
          if (top === -1) continue;
          measured++;
          if (top < SWITCHER_BOTTOM) high.push(`${kind} on ${role} at beat ${beat}: row ${top}`);
        }
      }
    });
    // A walk that drew no boss would pass. It measured 280 frames when it landed.
    expect(measured).toBeGreaterThan(200);
    expect(high).toEqual([]);
  });
});
