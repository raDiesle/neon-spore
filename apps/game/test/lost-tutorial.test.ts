import { describe, expect, it } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  guidePages,
  introHolds,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import type { GameAudio } from "../src/audio.js";
import type { InputBuffer } from "../src/input.js";
import { createWaveProgression } from "../src/waves.js";

/**
 * **A wave gone again with its tutorial put back in front of it.**
 *
 * The owner, 24 September 2026: *there must be a way to watch tutorial again
 * and then restart wave, like as players entered first time the wave.* The
 * simulation's share of that is one flag on `needWave` (`sim/wave-fail.ts`,
 * held in `rules.test.ts`); **this file holds the other end**, which is the
 * only place the flag turns into a guide — `open` decides what stands in front
 * of the field, and a host that read the flag and opened the wave anyway would
 * fail nothing at all.
 *
 * Driven through `handle` rather than through a press, because the press is
 * three files away and every one of them is already held: the button
 * (`render/test/briefing.test.ts`), the command (`net`'s codec) and the event
 * (`sim/test/rules.test.ts`). What is left over is this one branch.
 *
 * No DOM: `createWaveProgression` reaches `localStorage` only through
 * `progress.ts`, which answers `NOTHING_YET` when there is none, and touches
 * the audio only on a jump.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
/** A wave whose guide plays a film, and one that carries no guide at all. */
const GUIDED = WAVES.findIndex((w) => w.guide?.scene);
const BARE = WAVES.findIndex((w) => w.guide === undefined);

const NOTHING = {
  push: () => {},
} as unknown as InputBuffer;
const SILENT = { restarted: () => {} } as unknown as GameAudio;

/** A world, and the progression that answers its `needWave`s. */
function host(): { world: World; ask: (e: SimEvent) => void } {
  const world = createWorld(CFG, 3);
  const progression = createWaveProgression({
    world,
    cfg: CFG,
    audio: SILENT,
    buffer: NOTHING,
  });
  return { world, ask: (e) => progression.handle([e]) };
}

describe("what stands in front of a wave gone again", () => {
  it("opens on the tutorial when the pair asked to watch it again", () => {
    const { world, ask } = host();
    ask({ type: "needWave", wave: GUIDED, retry: true, guide: true });
    expect(guideHolds(world)).toBe(true);
    // The whole film and its gate, exactly as a first entry gets them: a
    // retry that opened on the last page would be a button that did nothing.
    expect(guidePages(world)).toBe(waveGuideSteps(GUIDED) + 1);
    expect(world.wave).toBe(GUIDED);
  });

  it("is a first entry in every way but the count, which it adds to", () => {
    const first = host();
    first.ask({ type: "needWave", wave: GUIDED });
    const again = host();
    again.ask({ type: "needWave", wave: GUIDED, retry: true, guide: true });
    expect(guideHolds(again.world)).toBe(guideHolds(first.world));
    expect(guidePages(again.world)).toBe(guidePages(first.world));
  });

  it("opens on the introduction when they only pressed RETRY WAVE", () => {
    const { world, ask } = host();
    ask({ type: "needWave", wave: GUIDED, retry: true });
    expect(guideHolds(world)).toBe(false);
    expect(introHolds(world)).toBe(true);
  });

  it("has no tutorial to put back on a wave that never had one", () => {
    const { world, ask } = host();
    ask({ type: "needWave", wave: BARE, retry: true, guide: true });
    expect(guideHolds(world)).toBe(false);
    expect(introHolds(world)).toBe(true);
  });
});
