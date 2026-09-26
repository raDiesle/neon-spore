/**
 * THE CYST's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a sac with two flanks over a core**, and everything here is
 * wet membrane stilled and pinched: the enter is the sac settling in, a low
 * swell with a soft slosh; the light is a step waking, one bright tick. The
 * still is a flank stopped dead by the partner's tap, a short damped knock;
 * the shudder is a flank never stilled, a wobbling burr. The slip is a pinch
 * letting go, a wet scrape; the crack is a flank split, a sharp snap; the
 * spring is a stilled flank bouncing wide, a falling boing. The bare is the
 * core showing, a low hum with a glint; the hit is a shot into it — a flash.
 * The guard is a flank held off the core, a firm knock; the seal is it
 * closing back over, a dull smother. The miss is the hull's dull strike, the
 * split the sac tearing wide, and the out the field clearing. Low and soft
 * under the band, or short and high above it, as ever (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_CYST_SOUNDS: SoundDef[] = [
  {
    id: "boss.cystEnter",
    family: "boss",
    blurb: "A sac settling into frame: a low swell and a soft slosh.",
    status: "bound",
    use: "THE CYST arriving, both flanks whole and the core hidden.",
    level: 0.42,
    layers: [
      swell(54, 1.0, 0.12),
      after(0.25, noise(700, { type: "lowpass", freq: 700, toFreq: 400, q: 2 }, 0.05, 0.4, 0.07)),
    ],
  },
  {
    id: "boss.cystLight",
    family: "boss",
    blurb: "One bright tick: a step on the sac waking.",
    status: "bound",
    use: "A step lit: a flank shuddering for its tap, or the core to shoot.",
    level: 0.36,
    layers: [tick(0.24, 0, 2800), after(0.05, tick(0.1, 0, 3400))],
  },
  {
    id: "boss.cystStill",
    family: "boss",
    blurb: "A short damped knock: a flank stopped dead.",
    status: "bound",
    use: "The partner's tap landed on the shuddering flank; the pinch may count.",
    level: 0.38,
    layers: [thud(240, 140, 0.03, 0.1), after(0.02, tick(0.12, 0, 3200))],
  },
  {
    id: "boss.cystShudder",
    family: "boss",
    blurb: "A wobbling burr: a flank never stilled.",
    status: "bound",
    use: "A flank's tap window ran out; the step is tried again after a rest.",
    level: 0.34,
    layers: [thud(150, 120, 0.05, 0.14), after(0.06, thud(140, 110, 0.05, 0.12))],
  },
  {
    id: "boss.cystSlip",
    family: "boss",
    blurb: "A wet scrape: a pinch letting go.",
    status: "bound",
    use: "The pinch on the stilled flank widened past shut; the count starts again.",
    level: 0.32,
    layers: [air(1700, 1000, 0.1, 0.1, 1.5), after(0.02, thud(180, 130, 0.04, 0.08))],
  },
  {
    id: "boss.cystCrack",
    family: "boss",
    blurb: "A sharp snap: a flank split.",
    status: "bound",
    use: "A stilled flank pinched shut for its beats: it cracks.",
    level: 0.42,
    layers: [
      noise(3000, { type: "highpass", freq: 3000, q: 1 }, 0.002, 0.05, 0.12),
      after(0.02, thud(220, 110, 0.06, 0.16)),
    ],
  },
  {
    id: "boss.cystSpring",
    family: "boss",
    blurb: "A falling boing: a stilled flank bouncing wide.",
    status: "bound",
    use: "A stilled flank's time ran out before the pinch counted; tried again.",
    level: 0.38,
    layers: [air(2800, 1300, 0.22, 0.12, 1.5), after(0.06, swell(64, 0.35, 0.12))],
  },
  {
    id: "boss.cystBare",
    family: "boss",
    blurb: "A low hum and a glint: the core showing.",
    status: "bound",
    use: "Both flanks cracked; the core lies bare to a shot.",
    level: 0.44,
    layers: [sub(60, 0.35, 0.16), after(0.04, glint(2200, 0.25, 0.12))],
  },
  {
    id: "boss.cystHit",
    family: "boss",
    blurb: "A flash: a bright ring and a soft knock into the core.",
    status: "bound",
    use: "A shot in the step's colour into the bare core. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.cystGuard",
    family: "boss",
    blurb: "A firm knock: a flank held off the core.",
    status: "bound",
    use: "A cracked flank pinched back for its beats; the core stays bare.",
    level: 0.4,
    layers: [thud(230, 105, 0.08, 0.2), after(0.04, glint(1800, 0.18, 0.08))],
  },
  {
    id: "boss.cystSeal",
    family: "boss",
    blurb: "A dull smother: the flank closing over the core.",
    status: "bound",
    use: "A hold-off ran out; the core is covered and the step asked again.",
    level: 0.36,
    layers: [
      thud(160, 100, 0.06, 0.18),
      after(0.03, noise(800, { type: "lowpass", freq: 800, toFreq: 400, q: 1 }, 0.02, 0.25, 0.08)),
    ],
  },
  {
    id: "boss.cystMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.cystSplit",
    family: "boss",
    blurb: "A sac tearing wide: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the sac splits, spent.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1400, 3600, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.cystOut",
    family: "boss",
    blurb: "The split sac falling away, and the field clearing.",
    status: "bound",
    use: "THE CYST gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE VISE's own out (`sounds/boss-vise.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
