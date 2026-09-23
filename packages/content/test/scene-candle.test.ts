import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { mapCol } from "../src/queue.js";
import { sceneScript } from "../src/scene-script.js";
import { THE_CANDLE } from "../src/scenes/the-candle.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE CANDLE's rehearsal shows the fight's one mistake being made, and the
 * mistake has to land.
 *
 * Every other slide in the film says `atBoss`, so it follows the glow wherever
 * the seeded rng drifts it. One does not: the cannon is put on the column the
 * glow *faces*, on purpose, and the shot after it is swallowed at the muzzle
 * and given back. Nothing held that. The film's doc block counts in the
 * field's eleven columns and the act counts in the seven a film is authored
 * on, and on 19 September 2026 a lane read 3 against `col: 2`, took it for an
 * off-by-one, and went looking for a page standing over a shot that is never
 * eaten. The shot is eaten; `mapCol(2)` is 3.
 *
 * So this runs the film and watches for `candleFed`, which is the simulation's
 * own word for the mistake being made. A seed that stops facing that column,
 * an act moved to another one, or a change to how a film's columns are mapped
 * all break it — and every one of those is the page at 1140 standing over
 * nothing.
 */

const WAVE = WAVES.findIndex((w) => w.guide?.scene === "theCandle");
const SHOT = 1230;

/** The act that puts the cannon on the faced column: the one without `atBoss`. */
const MISTAKE = THE_CANDLE.acts.find((a) => a.control === "cannon" && a.atBoss !== true);

function fed(): { tick: number; col: number } | null {
  const run = new SceneRun(sceneScript("theCandle", WAVE, DEFAULT_CONFIG));
  const spent: SimEvent[] = [];
  for (let t = 0; t < THE_CANDLE.ticks - 1; t++) {
    spent.length = 0;
    run.advance(spent);
    const ate = spent.find((e) => e.type === "candleFed");
    if (ate) return { tick: t, col: (ate as { col: number }).col };
  }
  return null;
}

describe("THE CANDLE's rehearsal makes the fight's one mistake", () => {
  it("is set up by the one act that does not follow the glow", () => {
    expect(WAVE).toBeGreaterThan(0);
    expect(MISTAKE).toEqual({ tick: 1185, control: "cannon", col: 2 });
  });

  it("feeds the glow, on the column the authored one maps to", () => {
    const ate = fed();
    expect(ate).not.toBeNull();
    expect(ate?.col).toBe(mapCol(MISTAKE?.col ?? -1, DEFAULT_CONFIG.cols));
  });

  it("feeds it from the shot the film fires, not some other one", () => {
    // The act at 1230 is the only `fireRed` between the cannon's move and the
    // slide that puts it back under the glow, so a `candleFed` anywhere else
    // would mean the film is performing a fight nobody authored.
    const ate = fed();
    expect(ate?.tick).toBeGreaterThanOrEqual(SHOT);
    expect(ate?.tick).toBeLessThan(SHOT + DEFAULT_CONFIG.tickHz);
  });
});

describe("the rehearsal for THE CANDLE", () => {
  it("dims the glow three times, feeds it once from the faced column, and ends it on the pull and the beam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theCandle");
    const run = new SceneRun(sceneScript("theCandle", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theCandle.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "candleDim" || e.type === "candleFed") {
          seen.push(`${e.type} ${e.col} ${e.left} @${run.world.beat}`);
        } else if (e.type === "candleLast" || e.type === "candleOut") {
          seen.push(`${e.type} @${run.world.beat}`);
        }
      }
    }
    // Three bolts from under the glow, each slid there by `atBoss` after it
    // drifted; the third brings it to two and it eats. The fourth is fired from
    // the column it faces — the one authored slide in the film — and is put
    // back on the glow at the muzzle. Then two clean ones with the cannon slid
    // clear, the last of which stops it.
    //
    // And then the trigger stops counting, which is the whole of what this
    // film's last page is for: the pilot pulls the flame down off the wick
    // (`candleWick`) and only then does the beam reach what is left. A film
    // that ended on the beam alone ran for a day after the phases landed and
    // showed a boss that never went out.
    expect(seen).toEqual([
      "candleDim 5 4 @6",
      "candleDim 3 3 @12",
      "candleDim 4 2 @15",
      "candleFed 3 3 @20",
      "candleDim 6 2 @27",
      "candleDim 5 1 @30",
      "candleLast @30",
      "candleDim 5 0 @35",
      "candleOut @35",
    ]);
    // Out, and gone: the two black beats have passed and the light is back
    // before the loop turns over.
    expect(run.world.boss).toBeNull();
  });
});
