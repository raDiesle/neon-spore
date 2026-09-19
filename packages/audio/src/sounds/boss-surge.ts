/**
 * THE SURGE's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is a **sac under pressure**, and everything here is wet and
 * closed where THE SINEW's was taut: a thumb on the glass is a soft press
 * into something that gives, the pressure coming into the band is a hum
 * rising to a held note, a vent is a seam parting with a hiss and a drop, and
 * the burst is the sac going the way a sac goes — a wet crack and a spray.
 * The eversion is the long sound on the page, the whole thing turning inside
 * out. Low and soft under the band, or short and high above it, as ever
 * (docs/spec/audio.md §1).
 */

import { after, air, burst, glint, noise, soft, spore, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_SURGE_SOUNDS: SoundDef[] = [
  {
    id: "boss.surgeSettle",
    family: "boss",
    blurb: "The bulb taking its place: a low swell and the seam clicking shut along its length.",
    status: "bound",
    use: "THE SURGE arriving, every notch shut and no thumb on it.",
    level: 0.36,
    layers: [swell(65, 1.2, 0.1), after(0.4, burst(tick(0.16, 0, 3600), 5, 0.09, 0.9, 0))],
  },
  {
    id: "boss.surgeGrip",
    family: "boss",
    blurb: "A thumb on the glass: a soft press into something that gives.",
    status: "bound",
    use: "THE SURGE's bulb taken by one seat's thumb.",
    level: 0.3,
    layers: [soft(0.6, spore(320, 0.14, 0.2, 20)), after(0.02, tick(0.14, 0, 3400))],
  },
  {
    id: "boss.surgeRelease",
    family: "boss",
    blurb: "A thumb off the glass: the skin springing back, a small wet pop.",
    status: "bound",
    use: "THE SURGE's bulb let go by one seat — lifted, or thrown off by a burst.",
    level: 0.3,
    layers: [tick(0.18, 0, 3800), after(0.02, soft(0.5, spore(280, 0.1, 0.16, 30)))],
  },
  {
    id: "boss.surgeNear",
    family: "boss",
    blurb: "The pressure coming into the band: a hum rising to a held note.",
    status: "bound",
    use: "THE SURGE's pressure entering a notch's band — the release is now.",
    level: 0.34,
    layers: [swell(110, 0.6, 0.12), after(0.1, glint(3300, 0.22, 0.12))],
  },
  {
    id: "boss.surgeVent",
    family: "boss",
    blurb: "A notch of the seam parting: a hiss of pressure leaving and the bulb dropping a row.",
    status: "bound",
    use: "THE SURGE vented by both thumbs off inside the band. Pitched up per notch open.",
    level: 0.44,
    layers: [
      air(6000, 3400, 0.4, 0.16, 1.4),
      after(0.05, glint(4200, 0.24, 0.16)),
      after(0.16, thud(140, 60, 0.26, 0.42)),
    ],
  },
  {
    id: "boss.surgeBurst",
    family: "boss",
    blurb: "The sac going: a wet crack, a spray, and the thumbs thrown off it.",
    status: "bound",
    use: "THE SURGE burst — a lift over the band, or the top of the gauge on the beat.",
    level: 0.48,
    layers: [
      noise(0.12, { type: "highpass", freq: 3400, toFreq: 6000, q: 0.9 }, 0.002, 0.03, 0.5),
      after(0.03, air(6500, 3000, 0.5, 0.18, 1.4)),
      after(0.08, sub(55, 0.45, 0.35)),
    ],
  },
  {
    id: "boss.surgeGum",
    family: "boss",
    blurb: "A gum thrown out of the burst: a wet tick and a small weight leaving.",
    status: "bound",
    use: "THE SURGE throwing one gum down one of its columns after a burst.",
    level: 0.32,
    layers: [tick(0.22, 0, 3800), after(0.03, soft(0.5, spore(260, 0.12, 0.18, 40)))],
  },
  {
    id: "boss.surgeRock",
    family: "boss",
    blurb: "A rock spat out of the bulb's underside: a dry cough and a weight falling.",
    status: "bound",
    use: "THE SURGE spitting a rock at the ship while both thumbs are on it.",
    level: 0.38,
    layers: [thud(210, 90, 0.18, 0.26), after(0.05, air(2600, 1400, 0.24, 0.1, 1.2))],
  },
  {
    id: "boss.surgeLost",
    family: "boss",
    blurb: "The charge lost: the hum stopping short, a dull knock.",
    status: "bound",
    use: "THE SURGE's release missed — a lift short of the band, late, or alone.",
    level: 0.32,
    layers: [thud(190, 100, 0.14, 0.3), after(0.04, tick(0.12, 0, 3400))],
  },
  {
    id: "boss.surgeAbsorb",
    family: "boss",
    blurb: "A body taken into the bulb: a swallow and the pressure stepping up.",
    status: "bound",
    use: "THE SURGE eating what fell into its columns, from its second notch.",
    level: 0.34,
    layers: [soft(0.6, sub(90, 0.3, 0.3)), after(0.06, glint(3200, 0.16, 0.1))],
  },
  {
    id: "boss.surgeClose",
    family: "boss",
    blurb: "A notch shutting again: the seam clicking to, the bulb rising a row.",
    status: "bound",
    use: "THE SURGE closing a notch after a burst, from its third notch.",
    level: 0.38,
    layers: [tick(0.24, 0, 3600), after(0.05, thud(120, 170, 0.22, 0.35))],
  },
  {
    id: "boss.surgeEvert",
    family: "boss",
    blurb: "The last notch gone: the whole sac turning inside out, a long wet roll.",
    status: "bound",
    use: "THE SURGE's last vent — the eversion begins, and THE SLOW with it.",
    level: 0.5,
    layers: [
      air(6000, 3200, 0.5, 0.18, 1.4),
      after(0.1, sub(50, 1, 0.4)),
      after(0.2, noise(0.6, { type: "lowpass", freq: 260, toFreq: 120, q: 1 }, 0.05, 0.25, 0.3)),
    ],
  },
  {
    id: "boss.surgeOut",
    family: "boss",
    blurb: "The bulb gone: a last drop, then the air clearing over an empty column.",
    status: "bound",
    use: "THE SURGE everted and gone — then the wave-end light.",
    level: 0.5,
    layers: [
      thud(130, 45, 0.45, 0.5),
      after(0.1, glint(3600, 0.5, 0.14)),
      after(0.2, burst(glint(4800, 0.16, 0.1), 8, 0.05, 0.85, 40)),
      after(0.3, air(4200, 9000, 0.9, 0.16, 1.5)),
    ],
  },
];
