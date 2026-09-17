/**
 * THE CANDLE's seven, in a file of their own for `boss-undertow.ts`' reason.
 *
 * The fight is in the dark, so what these have to do is **be the light**:
 * nothing here is a body, everything is a glow — a warmth that dims, a
 * flash swallowed, the last step going out. High and thin where THE
 * UNDERTOW's was low and dull, and the register under 90 Hz that the body
 * lives in stays empty: the pair never sees one (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, swell, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_CANDLE_SOUNDS: SoundDef[] = [
  {
    id: "boss.candleDark",
    family: "boss",
    blurb: "The light going out of the field: a long fall of air, and a glow settling.",
    status: "bound",
    use: "THE CANDLE arriving — the four beats the field goes black over.",
    level: 0.36,
    // The fall stays above the band and the settle below it: a long light
    // going out is a slow sound, and a slow sound through 300–3000 Hz is a
    // voice covered for the whole of it.
    layers: [air(9000, 5200, 1.6, 0.22, 2), after(0.8, soft(0.5, swell(180, 1.4, 0.06)))],
  },
  {
    id: "boss.candleDim",
    family: "boss",
    blurb: "A step of glow going: a small flare, then the air cooling.",
    status: "bound",
    use: "THE CANDLE struck up its own column, a step dimmer.",
    level: 0.4,
    layers: [glint(3400, 0.24, 0.14), after(0.06, air(600, 220, 0.4, 0.2, 1.6))],
  },
  {
    id: "boss.candleMove",
    family: "boss",
    blurb: "The glow drifting a column: a breath moved sideways.",
    status: "bound",
    use: "THE CANDLE's glow drifting one column, wherever it is heard from.",
    level: 0.24,
    layers: [
      soft(0.6, noise(0.3, { type: "bandpass", freq: 1200, toFreq: 1600, q: 2 }, 0.05, 0.1, 0.25)),
    ],
  },
  {
    id: "boss.candleTurn",
    family: "boss",
    blurb: "It turns to face a column: a dry click and a thin tone settling on it.",
    status: "bound",
    use: "THE CANDLE facing a new column, on the pilot's screen alone.",
    level: 0.3,
    layers: [tick(0.24, 0, 4200), after(0.05, spore(880, 0.3, 0.12, 20))],
  },
  {
    id: "boss.candleFed",
    family: "boss",
    blurb: "A flash swallowed: the muzzle's crack cut short, and the glow warming a step.",
    status: "bound",
    use: "THE CANDLE eating a shot fired from the column it faces — nothing lit, the boss brighter.",
    level: 0.42,
    layers: [
      noise(0.08, { type: "lowpass", freq: 2400, toFreq: 400, q: 0.8 }, 0.005, 0.02, 0.4),
      after(0.1, swell(330, 0.5, 0.1)),
    ],
  },
  {
    id: "boss.candleLast",
    family: "boss",
    blurb: "One step left: a single thin tone held, and nothing under it.",
    status: "bound",
    use: "THE CANDLE at its last glow, standing still.",
    level: 0.3,
    layers: [spore(660, 1.0, 0.14, 12), after(0.3, glint(2600, 0.6, 0.08))],
  },
  {
    id: "boss.candleOut",
    family: "boss",
    blurb: "The light out: a last flare, three small sparks falling, then silence.",
    status: "bound",
    use: "THE CANDLE's last step gone — two black beats before the wave-end light.",
    level: 0.46,
    layers: [glint(4200, 0.3, 0.18), after(0.12, burst(tick(0.2, 0, 3000), 3, 0.11, 0.6, -4))],
  },
];
