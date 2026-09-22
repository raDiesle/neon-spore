/**
 * THE BELLOWS's sixteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **double-chambered lung of ribbed leather**, and everything
 * here is air moving through a bag and the hardware that holds it shut: the
 * enter is a great slack intake with the ribs settling under it; the marks are
 * two small dull knocks, one per handle, struck together; the grip is a short
 * leather creak on the side that took hold; the pull is a long draw of air
 * opening a chamber, and the seam is what a stitched waist does when it goes —
 * a dry tear, pitched up as the seams go. The jam is both handles seizing, a
 * dead wooden clunk with no air in it at all, and the late is that clunk under
 * a falling sigh, which is the one sound in the fight that says *too slow*.
 *
 * The spark is a thin hiss out of the parted waist; the sparkOut is the shot
 * shutting it, short and bright; the sparkHit is the spark arriving on the
 * hull, dull and heavy. The breath is a gust straight down a column, low and
 * moving. The glow is the last seam lighting, a swell under everything; the
 * hold is one hand let go and the other not, a hollow half-sound that stops
 * where the other one should have been. The split is the waist going in two
 * under THE SLOW, and the vent and the out are the lung emptying and dropping
 * away. Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_BELLOWS_SOUNDS: SoundDef[] = [
  {
    id: "boss.bellowsEnter",
    family: "boss",
    blurb: "A great slack intake, and ribbed leather settling under it.",
    status: "bound",
    use: "THE BELLOWS arriving, both chambers shut and still.",
    level: 0.38,
    layers: [swell(46, 1.5, 0.1), after(0.3, soft(0.5, thud(220, 90, 0.16, 0.3)))],
  },
  {
    id: "boss.bellowsMarks",
    family: "boss",
    blurb: "Two dull knocks struck together: a mark on each handle.",
    status: "bound",
    use: "An exchange of THE BELLOWS lighting, one handle a seat.",
    level: 0.4,
    layers: [tick(0.22, 0, 2600), after(0.04, soft(0.6, metal(240, 0.3, 0.2, 200)))],
  },
  {
    id: "boss.bellowsGrip",
    family: "boss",
    blurb: "A short leather creak: a hand on its handle.",
    status: "bound",
    use: "Either seat taking hold, panned to the chamber it took.",
    level: 0.26,
    layers: [noise(0.14, { type: "bandpass", freq: 900, toFreq: 640, q: 1.2 }, 0.01, 0.1, 0.16)],
  },
  {
    id: "boss.bellowsPulled",
    family: "boss",
    blurb: "A long draw of air: one chamber opening.",
    status: "bound",
    use: "Player 1 carried his handle down and the lung is open.",
    level: 0.34,
    layers: [air(520, 1500, 0.42, 0.13, 1.6), after(0.18, soft(0.5, sub(58, 0.35, 0.28)))],
  },
  {
    id: "boss.bellowsSeam",
    family: "boss",
    blurb: "A dry tear down the waist: one seam gone.",
    status: "bound",
    use: "An exchange completed. Pitched up as the seams go.",
    level: 0.44,
    layers: [
      noise(0.22, { type: "bandpass", freq: 3200, toFreq: 2000, q: 1.1 }, 0.005, 0.18, 0.22),
      after(0.05, soft(0.5, sub(70, 0.3, 0.32))),
    ],
  },
  {
    id: "boss.bellowsJam",
    family: "boss",
    blurb: "A dead wooden clunk with no air in it: both handles seized.",
    status: "bound",
    use: "Somebody acted out of turn, or both of them acted at once.",
    level: 0.42,
    layers: [thud(180, 80, 0.1, 0.36), after(0.02, soft(0.4, tick(0.18, 0, 1800)))],
  },
  {
    id: "boss.bellowsLate",
    family: "boss",
    blurb: "That clunk, and a sigh falling away under it.",
    status: "bound",
    use: "The one shared window run out with an exchange unfinished.",
    level: 0.4,
    layers: [
      thud(180, 80, 0.1, 0.32),
      after(0.06, air(1400, 460, 0.44, 0.13, 1.6)),
      after(0.2, soft(0.4, sub(50, 0.4, 0.3))),
    ],
  },
  {
    id: "boss.bellowsSpark",
    family: "boss",
    blurb: "A thin hiss starting out of the parted waist.",
    status: "bound",
    use: "Two seams down — a spark is leaking and takes either colour.",
    level: 0.36,
    layers: [
      swell(56, 0.9, 0.08),
      after(
        0.08,
        noise(0.5, { type: "bandpass", freq: 2600, toFreq: 3200, q: 1.4 }, 0.02, 0.2, 0.2),
      ),
    ],
  },
  {
    id: "boss.bellowsSparkOut",
    family: "boss",
    blurb: "The shot shutting it: short and bright, and the hiss gone.",
    status: "bound",
    use: "The leaking spark shot out, in either colour.",
    level: 0.4,
    layers: [glint(2900, 0.26, 0.18), after(0.04, air(2600, 900, 0.22, 0.12, 1.5))],
  },
  {
    id: "boss.bellowsSparkHit",
    family: "boss",
    blurb: "The spark arriving on the hull: a dull, heavy strike.",
    status: "bound",
    use: "Nobody shot the spark — one strike on the hull, which is the wave.",
    level: 0.46,
    layers: [thud(240, 110, 0.12, 0.34), after(0.04, sub(48, 0.4, 0.36))],
  },
  {
    id: "boss.bellowsBreath",
    family: "boss",
    blurb: "A gust of the lung going straight down a column.",
    status: "bound",
    use: "Three seams down — a breath thrown at whoever holds the cannon.",
    level: 0.42,
    layers: [air(1800, 380, 0.5, 0.14, 1.5), after(0.12, soft(0.6, sub(52, 0.45, 0.34)))],
  },
  {
    id: "boss.bellowsGlow",
    family: "boss",
    blurb: "The last seam lighting: a swell under everything.",
    status: "bound",
    use: "One seam left, and neither handle taken yet.",
    level: 0.34,
    layers: [swell(62, 1.2, 0.1), after(0.25, soft(0.5, glint(3300, 0.5, 0.12)))],
  },
  {
    id: "boss.bellowsHold",
    family: "boss",
    blurb: "A hollow half-sound that stops where the other should have been.",
    status: "bound",
    use: "One hand let go of the last seam and the other kept holding.",
    level: 0.3,
    layers: [metal(200, 0.3, 0.2, 170), after(0.1, soft(0.4, air(900, 420, 0.24, 0.1, 1.6)))],
  },
  {
    id: "boss.bellowsSplit",
    family: "boss",
    blurb: "The waist going in two: a long tear opening out.",
    status: "bound",
    use: "Both hands off together — THE BELLOWS split, under THE SLOW.",
    level: 0.5,
    // The tear runs above the speech band rather than climbing through it: the
    // split runs under THE SLOW, which is the longest the pair go without
    // being able to talk over a sound (`docs/spec/audio.md` §1).
    layers: [
      noise(0.6, { type: "bandpass", freq: 4400, toFreq: 7200, q: 1.2 }, 0.02, 0.22, 0.22),
      after(0.2, metal(170, 0.5, 0.22, 150)),
      after(0.28, sub(44, 0.6, 0.4)),
    ],
  },
  {
    id: "boss.bellowsVent",
    family: "boss",
    blurb: "Everything in the lung leaving it at once.",
    status: "bound",
    use: "The split waist venting, which is the end of the fight.",
    level: 0.44,
    layers: [air(4200, 7400, 0.7, 0.15, 1.5), after(0.16, soft(0.6, sub(46, 0.6, 0.35)))],
  },
  {
    id: "boss.bellowsOut",
    family: "boss",
    blurb: "The empty lung dropping away, and the field clearing.",
    status: "bound",
    use: "THE BELLOWS gone — then the wave-end light.",
    level: 0.5,
    layers: [
      sub(54, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
