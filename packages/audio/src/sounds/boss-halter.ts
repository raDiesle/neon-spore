/**
 * THE HALTER's fourteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a wary seam that flinches**, and everything here is a
 * skittish thing gentled: the enter is the seam settling in, a low swell
 * under a nervous flutter; the light is a step waking, one soft tick. The
 * settle is a resting seat gone still enough, a low hush; the startle is a
 * settled seat touching something, a sharp flinch; the slip is a grip let go
 * while the pair held, a dull drop. The crack is a segment opening, a split
 * and a knock; the bare is the centre showing, a hum with a glint. The guard
 * is the plating held off, a firm clank; the shut is a window run out, the
 * seam clamping back; the seal is the plating closing over the centre, a dull
 * fall. The hit is a shot into the centre, a flash; the miss is the hull's
 * dull strike; the split is the seam spent, and the out the field clearing.
 * Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_HALTER_SOUNDS: SoundDef[] = [
  {
    id: "boss.halterEnter",
    family: "boss",
    blurb: "A seam settling in: a low swell under a nervous flutter.",
    status: "bound",
    use: "THE HALTER arriving, both segments whole and the centre covered.",
    level: 0.42,
    layers: [
      swell(56, 1.0, 0.12),
      after(0.3, noise(3400, { type: "bandpass", freq: 3400, q: 3 }, 0.01, 0.25, 0.04)),
    ],
  },
  {
    id: "boss.halterLight",
    family: "boss",
    blurb: "One soft tick: a step on the seam waking.",
    status: "bound",
    use: "A step lit: a segment to rest and chord for, a guard, or the centre to shoot.",
    level: 0.34,
    layers: [tick(0.2, 0, 3100), after(0.06, tick(0.08, 0, 3600))],
  },
  {
    id: "boss.halterSettle",
    family: "boss",
    blurb: "A low hush: a resting seat gone still enough.",
    status: "bound",
    use: "The step's resting seat has sent nothing for its beats and holds no grip.",
    level: 0.3,
    layers: [sub(70, 0.4, 0.12)],
  },
  {
    id: "boss.halterStartle",
    family: "boss",
    blurb: "A sharp flinch: a thin rising whine off a tick.",
    status: "bound",
    use: "A settled seat sent a command; its rest, and any pair it held, start over.",
    level: 0.34,
    layers: [tick(0.18, 0, 4200), after(0.02, air(3200, 5200, 0.14, 0.08, 1.5))],
  },
  {
    id: "boss.halterSlip",
    family: "boss",
    blurb: "A dull drop with no catch: a grip let go.",
    status: "bound",
    use: "The chording seat lifted a grip while the pair held; both counts start over.",
    level: 0.34,
    layers: [thud(170, 120, 0.05, 0.14)],
  },
  {
    id: "boss.halterCrack",
    family: "boss",
    blurb: "A split and a knock: a segment opening.",
    status: "bound",
    use: "The pair held together its beats and the lit segment cracked.",
    level: 0.42,
    layers: [
      noise(3600, { type: "highpass", freq: 3600, q: 1 }, 0.002, 0.04, 0.12),
      after(0.02, thud(250, 125, 0.05, 0.14)),
    ],
  },
  {
    id: "boss.halterBare",
    family: "boss",
    blurb: "A low hum and a glint: the centre showing.",
    status: "bound",
    use: "Both segments cracked; the centre lies bare to a shot.",
    level: 0.44,
    layers: [sub(64, 0.35, 0.16), after(0.04, glint(2400, 0.25, 0.12))],
  },
  {
    id: "boss.halterGuard",
    family: "boss",
    blurb: "A firm clank: the plating held off the centre.",
    status: "bound",
    use: "A guard made; the centre stays bare.",
    level: 0.4,
    layers: [thud(240, 110, 0.07, 0.18), after(0.03, glint(2000, 0.18, 0.08))],
  },
  {
    id: "boss.halterShut",
    family: "boss",
    blurb: "A creak and a clamp: the seam flinching shut.",
    status: "bound",
    use: "A rest-and-chord window ran out; the step is tried again after a pause.",
    level: 0.34,
    layers: [air(900, 600, 0.3, 0.1, 3), after(0.1, thud(150, 110, 0.05, 0.1))],
  },
  {
    id: "boss.halterSeal",
    family: "boss",
    blurb: "A dull fall: the plating closing over the centre.",
    status: "bound",
    use: "A guard failed; the centre is covered until the guard is made again.",
    level: 0.36,
    layers: [
      thud(160, 100, 0.06, 0.18),
      after(0.03, noise(800, { type: "lowpass", freq: 800, toFreq: 400, q: 1 }, 0.02, 0.25, 0.08)),
    ],
  },
  {
    id: "boss.halterHit",
    family: "boss",
    blurb: "A flash: a bright ring and a knock into the centre.",
    status: "bound",
    use: "A shot in the step's colour into the bared centre. Pitched up per hit.",
    level: 0.44,
    layers: [glint(3000, 0.3, 0.18), after(0.02, thud(250, 115, 0.1, 0.22))],
  },
  {
    id: "boss.halterMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A fire step ran out unanswered and the hull took it.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.halterSplit",
    family: "boss",
    blurb: "The seam giving way: a low fall under a rising hiss.",
    status: "bound",
    use: "Every step answered — the seam splits, spent.",
    level: 0.46,
    layers: [sub(50, 0.7, 0.3), after(0.02, air(1400, 3600, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.halterOut",
    family: "boss",
    blurb: "The spent seam falling away, and the field clearing.",
    status: "bound",
    use: "THE HALTER gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE DAVIT's own out (`sounds/boss-davit.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
