/**
 * PINBALL's two hands on the table, in a file of their own for
 * `boss-snake-body.ts`' reason: the round had no sounds of its own until 18
 * September 2026. These three are a spring wound back, a cabinet shoved, and a
 * cabinet shoved once too often — and all three stay out of the 300–3000 Hz
 * band, because the whole round is one seat saying *now* to the other
 * (docs/spec/audio.md §1).
 */

import { after, air, metal, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_PINBALL_HAND_SOUNDS: SoundDef[] = [
  {
    id: "boss.pinWind",
    family: "boss",
    blurb: "A spring wound back on a ratchet: a run of clicks, and it seating at the end.",
    status: "bound",
    use: "PINBALL's plunger wound by player 1 after a hard launch left the spring slack.",
    level: 0.36,
    // Rising, and over inside a beat: it is player 2's cue that the bar is
    // running again and her launch is live.
    layers: [
      { source: "triangle", freq: 62, toFreq: 140, gain: 0.2, attack: 0.02, release: 0.22 },
      after(0.18, soft(0.6, metal(84, 0.24, 0.16, 230))),
    ],
  },
  {
    id: "boss.pinNudge",
    family: "boss",
    blurb: "A cabinet shoved on its feet: one dull knock, and the glass ringing under it.",
    status: "bound",
    use: "PINBALL's table nudged by player 2 through a flight — the ball goes the way she shoved.",
    level: 0.4,
    layers: [thud(130, 76, 0.12, 0.34), after(0.02, soft(0.5, air(5000, 5800, 0.26, 0.08, 1.4)))],
  },
  {
    id: "boss.pinTilt",
    family: "boss",
    blurb: "The shove that goes too far: a heavy knock, and everything going dead under it.",
    status: "bound",
    use: "PINBALL's table tilted by a second nudge in one flight — her hand is dead until it ends.",
    level: 0.46,
    // Heavier than the nudge and falling where that one rang: a hand killed
    // has to be heard as different from a hand that worked.
    layers: [
      thud(104, 46, 0.26, 0.56),
      after(0.03, sub(44, 0.4, 0.34)),
      after(0.1, soft(0.45, air(5600, 3200, 0.5, 0.1, 1.1))),
    ],
  },
];
