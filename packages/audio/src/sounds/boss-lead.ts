/**
 * THE LEAD's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **walker on a stalk**, and everything here is dry and
 * jointed where THE SURGE's was wet: a pace is a footfall with a click in
 * it, a turn is a scrape, and a segment coming off is a snap of something
 * brittle. The flight is the one sound that is not the body's — a shot
 * rising out of the top of the field and hanging — and the hit and the miss
 * are its two endings, a crack or a hollow whistle down. The still is the
 * long sound on the page, a hum settling to nothing over the column it
 * stopped in; the pass is a rush; the down is the stalk going with the
 * whole body on it. Low and soft under the band, or short and high above
 * it, as ever (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_LEAD_SOUNDS: SoundDef[] = [
  {
    id: "boss.leadEnter",
    family: "boss",
    blurb:
      "The body taking its place over the middle: a low swell and the stalk's segments clicking into line.",
    status: "bound",
    use: "THE LEAD arriving, every segment on the stalk, facing right.",
    level: 0.36,
    layers: [swell(70, 1.1, 0.1), after(0.3, burst(tick(0.16, 0, 3400), 5, 0.1, 0.9, 0))],
  },
  {
    id: "boss.leadPace",
    family: "boss",
    blurb: "One pace: a dry footfall with a click in the joint.",
    status: "bound",
    use: "THE LEAD moving a column, panned to the column it is now in.",
    level: 0.26,
    layers: [thud(180, 110, 0.1, 0.28), after(0.02, tick(0.12, 0, 3200))],
  },
  {
    id: "boss.leadTurn",
    family: "boss",
    blurb: "The wall turn: a scrape and the body coming round.",
    status: "bound",
    use: "THE LEAD turning at a wall.",
    level: 0.3,
    layers: [
      noise(0.14, { type: "bandpass", freq: 900, toFreq: 1600, q: 2 }, 0.005, 0.06, 0.4),
      after(0.06, tick(0.14, 0, 3000)),
    ],
  },
  {
    id: "boss.leadFlight",
    family: "boss",
    blurb: "A shot leaving the top of the field and hanging: a rise that does not come down yet.",
    status: "bound",
    use: "THE LEAD's flight — a bolt out of the top, judged a beat later.",
    level: 0.3,
    layers: [air(1400, 3200, 0.3, 0.14, 1.6), after(0.08, glint(2600, 0.2, 0.08))],
  },
  {
    id: "boss.leadHit",
    family: "boss",
    blurb: "A segment coming off the stalk: a brittle snap and a chip falling.",
    status: "bound",
    use: "THE LEAD hit where it was going to be. Pitched up per segment gone.",
    level: 0.44,
    layers: [
      noise(0.05, { type: "highpass", freq: 2600, toFreq: 4200, q: 0.9 }, 0.001, 0.02, 0.5),
      after(0.02, glint(3000, 0.3, 0.16)),
      after(0.1, thud(150, 70, 0.22, 0.35)),
    ],
  },
  {
    id: "boss.leadMiss",
    family: "boss",
    blurb: "A shot judged against an empty column: a hollow whistle down.",
    status: "bound",
    use: "THE LEAD's flight landing where the body is not.",
    level: 0.3,
    layers: [air(2800, 900, 0.3, 0.12, 1.6), after(0.1, soft(0.5, tick(0.1, 0, 3000)))],
  },
  {
    id: "boss.leadReverse",
    family: "boss",
    blurb: "The body turning on the pair: a skid and the joints clicking the other way.",
    status: "bound",
    use: "THE LEAD reversing on a beat every shot missed.",
    level: 0.34,
    layers: [
      noise(0.16, { type: "bandpass", freq: 700, toFreq: 1300, q: 2 }, 0.005, 0.08, 0.4),
      after(0.08, burst(tick(0.14, 0, 3200), 3, 0.05, 0.85, 0)),
    ],
  },
  {
    id: "boss.leadTorch",
    family: "boss",
    blurb: "A torch dropped behind: a fizz lit in the column it just left.",
    status: "bound",
    use: "THE LEAD running and leaving a torch where it was.",
    level: 0.3,
    layers: [
      noise(0.2, { type: "highpass", freq: 3000, toFreq: 5000, q: 0.8 }, 0.01, 0.1, 0.3),
      after(0.03, spore(340, 0.14, 0.14, 30)),
    ],
  },
  {
    id: "boss.leadRock",
    family: "boss",
    blurb: "A rock let go ahead: a low knock and a weight leaving.",
    status: "bound",
    use: "THE LEAD running and dropping a rock in the column a shot has to go to.",
    level: 0.34,
    layers: [thud(120, 60, 0.24, 0.4), after(0.04, tick(0.12, 0, 3000))],
  },
  {
    id: "boss.leadStill",
    family: "boss",
    blurb: "The body stopping dead: a hum settling to nothing over one column.",
    status: "bound",
    use: "THE LEAD down to its last segment, standing still and out of reach.",
    level: 0.36,
    layers: [swell(95, 0.9, 0.12), after(0.5, soft(0.6, sub(60, 0.5, 0.3)))],
  },
  {
    id: "boss.leadPass",
    family: "boss",
    blurb: "The pass: a rush along the top of the field.",
    status: "bound",
    use: "THE LEAD crossing to the farther wall, three columns a beat.",
    level: 0.38,
    layers: [
      air(900, 2400, 0.4, 0.16, 1.4),
      after(0.05, burst(tick(0.12, 0, 3200), 4, 0.06, 0.85, 0)),
    ],
  },
  {
    id: "boss.leadWall",
    family: "boss",
    blurb: "The pass hitting the wall: a knock and the hum settling again.",
    status: "bound",
    use: "THE LEAD's pass reaching a wall — another still, then the pass back.",
    level: 0.36,
    layers: [thud(160, 80, 0.2, 0.4), after(0.1, swell(95, 0.6, 0.1))],
  },
  {
    id: "boss.leadDown",
    family: "boss",
    blurb: "The last segment taken by the beam: the stalk going, and the body with it.",
    status: "bound",
    use: "THE LEAD caught by the beam standing across its pass — and THE SLOW with it.",
    level: 0.5,
    layers: [
      noise(0.1, { type: "highpass", freq: 3400, toFreq: 5200, q: 0.9 }, 0.002, 0.04, 0.5),
      after(0.04, air(6500, 3200, 0.45, 0.18, 1.4)),
      after(0.1, sub(50, 0.5, 0.4)),
    ],
  },
  {
    id: "boss.leadOut",
    family: "boss",
    blurb: "The body gone: a last knock, then the air clearing over an empty column.",
    status: "bound",
    use: "THE LEAD down and gone — then the wave-end light.",
    level: 0.5,
    layers: [
      thud(130, 45, 0.45, 0.5),
      after(0.1, glint(3400, 0.5, 0.14)),
      after(0.2, burst(glint(4600, 0.16, 0.1), 8, 0.05, 0.85, 40)),
      after(0.3, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
