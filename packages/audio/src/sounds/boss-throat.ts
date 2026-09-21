/**
 * THE THROAT's seven, in a file of their own for `boss-vane.ts`' reason: the
 * boss had no sounds of its own until 19 September 2026, because nothing about
 * it happened that was not a state both screens already drew.
 *
 * The first three are the pair's hands — a gullet held shut under a thumb,
 * that hold let go, and the tube dragged sideways. The last four are the
 * gullet's own clock, and they came the same day the first three did, once the
 * argument for the silence had been looked at properly: both screens draw the
 * breath, the choke, the swallow and the eversion, and what either player is
 * actually looking at during this fight is the other half of their own screen.
 *
 * All seven stay out of the 300–3000 Hz band, because the pair is saying a
 * column *and* a count to each other across a voice delay for the whole fight
 * (docs/spec/audio.md §1) — and all seven are wet where THE VANE's are iron:
 * this is a gullet and not a bearing, and the pair has to be able to tell a
 * hand on the tube from a hand on anything else without looking at it.
 *
 * The choke and the swallow are the same event turned around and are built to
 * be heard that way: the choke slumps — a hit landing and a ring letting go
 * downward — and the swallow goes down and then **rises**, because what it
 * costs is a ring drawing tight again.
 */

import { after, air, noise, soft, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_THROAT_SOUNDS: SoundDef[] = [
  {
    id: "boss.throatCinch",
    family: "boss",
    blurb: "A wet tube pinched shut: a close, and the draw through it stopping dead.",
    status: "bound",
    use: "THE THROAT's slack ring caught under player 2's thumb — the gullet stops breathing.",
    level: 0.36,
    // A close under the band and the draw dying above it. What this gesture
    // buys is silence from a thing that was about to swallow, so the sound is
    // something *ending* and the pilot hears his window in the gap after it.
    layers: [thud(128, 74, 0.1, 0.36), after(0.02, soft(0.4, air(4200, 6200, 0.12, 0.18, 1.6)))],
  },
  {
    id: "boss.throatSlip",
    family: "boss",
    blurb: "A pinched tube opening again: the draw coming back, and weight settling into it.",
    status: "bound",
    use: "THE THROAT's cinch lost — lifted, or torn out when its beats ran out. The gullet breathes.",
    level: 0.42,
    // The cinch turned around: the draw comes back instead of stopping, and
    // the sub under it is the bill arriving. Both seats have to hear a window
    // shut as different from one opening, which is `boss.vaneSlip`'s rule.
    layers: [
      air(6400, 3600, 0.3, 0.16, 1.3),
      after(0.03, sub(52, 0.34, 0.36)),
      after(0.05, soft(0.5, thud(96, 58, 0.22, 0.3))),
    ],
  },
  {
    id: "boss.throatHaul",
    family: "boss",
    blurb: "Something heavy and wet dragged a pace sideways: a slide down, and a soft stop.",
    status: "bound",
    use: "THE THROAT's mouth hauled a column by player 1 under HAUL — her column is stale now.",
    level: 0.44,
    // A slide that lands rather than rising to a stop: the mouth did not open,
    // it moved, and the navigator is being told the number she just said is
    // no longer true. Noise through a lowpass and not `metal`, because a
    // sawtooth's harmonics over a drag this long would sit in the band for a
    // quarter of a second — `boss.vaneHaul`'s own reason, said about mass.
    //
    // **Re-voiced 21 September 2026**, on the owner's answer to this file's
    // queue entry: of the three hands he named this one, and it is the one of
    // the three that has to be told apart by ear from a haul the game already
    // has. It was built with a *rising* sine, 84 to 118, which is the gesture
    // `boss.vaneHaul` is — a drag rising to its stop, the seat that did not do
    // it hearing a window open. Nothing opens here. So the pitch falls now,
    // the drag runs longer than the fall and closes as it slows, and the
    // weight arrives at the end as a thud rather than as a sub that could be
    // any of the seven. The comment above always said *lands rather than
    // rising*; the layers did the opposite of it for two days.
    layers: [
      { source: "sine", freq: 122, toFreq: 72, gain: 0.3, attack: 0.03, release: 0.3 },
      // The lowpass tops out under 300 Hz at both ends, so a drag this long
      // spends none of the voice budget however far it is swept (`band.ts`).
      soft(0.62, noise(190, { type: "lowpass", freq: 290, toFreq: 130, q: 0.9 }, 0.06, 0.34, 0.32)),
      after(0.3, soft(0.8, thud(96, 60, 0.18, 0.32))),
      after(0.32, sub(54, 0.3, 0.28)),
    ],
  },
  {
    id: "boss.throatInhale",
    family: "boss",
    blurb: "A wet draw upward through a tube, and weight settling in behind it.",
    status: "bound",
    use: "THE THROAT's gullet takes a breath — the beat player 2 has been counting down to.",
    level: 0.3,
    // The one sound of the seven that happens on a schedule, so it is the one
    // that had to be built quiet: a rising band of air under the voice, a
    // breath of hiss over it, and the sub arriving late enough to read as the
    // draw finishing rather than as an impact.
    layers: [
      air(150, 210, 0.16, 0.24, 2.6),
      soft(
        0.7,
        noise(5200, { type: "highpass", freq: 4600, toFreq: 5600, q: 0.8 }, 0.04, 0.14, 0.18),
      ),
      after(0.1, sub(62, 0.18, 0.3)),
    ],
  },
  {
    id: "boss.throatChoke",
    family: "boss",
    blurb: "A wet hit landing in a tube and a ring going slack under it: a slump.",
    status: "bound",
    use: "THE THROAT takes a flung gum in the mouth — one ring goes slack, and stays slack.",
    level: 0.5,
    // The best shot in the fight, so it lands like one: a thud through the
    // floor, a lowpassed splat over it, and the ring itself letting go — a
    // triangle falling rather than rising, which is the whole of what makes
    // this and `boss.throatSwallow` opposite sounds.
    layers: [
      thud(190, 62, 0.26, 0.5),
      soft(0.55, noise(240, { type: "lowpass", freq: 600, toFreq: 220, q: 0.8 }, 0.002, 0.2, 0.34)),
      after(0.12, {
        source: "triangle",
        freq: 130,
        toFreq: 88,
        gain: 0.26,
        attack: 0.02,
        release: 0.3,
      }),
    ],
  },
  {
    id: "boss.throatSwallow",
    family: "boss",
    blurb: "A gulp going down, then a ring drawing tight again: a fall, then a rise.",
    status: "bound",
    use: "THE THROAT swallows what stood in its mouth — a slack ring re-tightens and the boss is further from dead.",
    level: 0.46,
    // The choke turned around and built to be heard as such. The fall is the
    // body going down; the rise under it is the ring coming back, which is the
    // part the pair is being punished for not noticing; and the air at the end
    // is the tube clear again and ready to do it once more.
    layers: [
      thud(140, 58, 0.18, 0.4),
      after(
        0.06,
        soft(0.6, noise(200, { type: "lowpass", freq: 520, toFreq: 180, q: 1.1 }, 0.01, 0.16, 0.3)),
      ),
      after(0.16, {
        source: "triangle",
        freq: 96,
        toFreq: 168,
        gain: 0.3,
        attack: 0.03,
        release: 0.34,
      }),
      after(0.2, soft(0.5, air(4400, 6800, 0.2, 0.18, 1.5))),
    ],
  },
  {
    id: "boss.throatEvert",
    family: "boss",
    blurb: "A tube turning through its own mouth: a long wet tear, and a body falling out of it.",
    status: "bound",
    use: "THE THROAT's last ring went slack — the gullet everts under THE SLOW and the fight is over.",
    level: 0.6,
    // The longest sound this boss has, because THE SLOW is open over it for
    // `throatEvertBeats` and a short one would leave the ending in silence.
    // The tear is kept above the band rather than through it: a lowpass that
    // started bright enough to hear as tearing would spend half a second on
    // top of whatever the pair is saying to each other about having won.
    layers: [
      thud(220, 40, 1.1, 0.5),
      soft(0.7, noise(180, { type: "lowpass", freq: 260, toFreq: 110, q: 0.8 }, 0.06, 1.0, 0.36)),
      after(
        0.05,
        soft(
          0.5,
          noise(5200, { type: "highpass", freq: 3600, toFreq: 6400, q: 0.7 }, 0.12, 0.7, 0.22),
        ),
      ),
      after(0.9, sub(44, 0.9, 0.42)),
    ],
  },
];
