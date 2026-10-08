/**
 * THE TRAPEZE's thirteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **an alien on a swing hung from long ropes**, and everything
 * here is rope, wood and one brass gong: the enter is the swing coming down,
 * a low swell under a creak of air; a level waking is one dry tick, and a
 * call the same tick twice, quick. A push is a snap of rope and a knock, the
 * swing taking it; a brake a slow sigh, the swing losing it; a swipe that did
 * nothing a loose slap of air. The lock is a taut click, its running out a
 * soft fall; a shot into the alien a flash and a knock. The gong is the one
 * ringing thing in the fight, a low hum under a bright strike and a long
 * brass tail, pitched up per gong. The miss is the hull's dull strike, the
 * spent the ropes snapping as the swing goes over, and the out the field
 * clearing. Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, metal, noise, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_TRAPEZE_SOUNDS: SoundDef[] = [
  {
    id: "boss.trapezeEnter",
    family: "boss",
    blurb: "A swing coming down: a low swell under a creak of air.",
    status: "bound",
    use: "THE TRAPEZE arriving, the alien swaying on its swing.",
    level: 0.42,
    layers: [
      swell(62, 1.0, 0.12),
      after(0.3, noise(900, { type: "bandpass", freq: 900, q: 2 }, 0.03, 0.3, 0.04)),
    ],
  },
  {
    id: "boss.trapezeLevel",
    family: "boss",
    blurb: "One dry tick: a level waking.",
    status: "bound",
    use: "A level lit: swipes, shots from below, or the lock, and a new gong.",
    level: 0.34,
    layers: [tick(0.2, 0, 2500), after(0.06, tick(0.08, 0, 2900))],
  },
  {
    id: "boss.trapezeCall",
    family: "boss",
    blurb: "Two quick ticks: a side called.",
    status: "bound",
    use: "In a call level, who swipes the next side; panned to the alien.",
    level: 0.3,
    layers: [tick(0.14, 0, 3100), after(0.05, tick(0.12, 0, 3100))],
  },
  {
    id: "boss.trapezePush",
    family: "boss",
    blurb: "A snap of rope and a knock: the swing pushed higher.",
    status: "bound",
    use: "A swipe on time; panned to the alien.",
    level: 0.42,
    layers: [glint(1900, 0.12, 0.12), after(0.05, thud(260, 140, 0.05, 0.14))],
  },
  {
    id: "boss.trapezeBrake",
    family: "boss",
    blurb: "A slow sigh: the swing losing height.",
    status: "bound",
    use: "A swipe while the swing went out; it slows.",
    level: 0.32,
    layers: [air(900, 400, 0.3, 0.1, 2), after(0.1, thud(170, 120, 0.05, 0.1))],
  },
  {
    id: "boss.trapezeWhiff",
    family: "boss",
    blurb: "A loose slap of air: a swipe that did nothing.",
    status: "bound",
    use: "A swipe from the wrong screen, the wrong way, or at the wrong time.",
    level: 0.28,
    layers: [noise(700, { type: "bandpass", freq: 700, q: 1.2 }, 0.01, 0.12, 0.1)],
  },
  {
    id: "boss.trapezeLock",
    family: "boss",
    blurb: "A taut click: the cannon locked on the alien.",
    status: "bound",
    use: "Player 1 tapped the alien in the lock level.",
    level: 0.36,
    layers: [noise(3200, { type: "highpass", freq: 3200, q: 1 }, 0.004, 0.05, 0.12)],
  },
  {
    id: "boss.trapezeUnlock",
    family: "boss",
    blurb: "A soft fall of air: the lock let go.",
    status: "bound",
    use: "The lock ran out with no shot landed.",
    level: 0.3,
    layers: [air(1400, 600, 0.25, 0.1, 2)],
  },
  {
    id: "boss.trapezeShot",
    family: "boss",
    blurb: "A flash and a knock: a shot into the alien.",
    status: "bound",
    use: "A shot met the alien and pushed the swing, or slowed it.",
    level: 0.44,
    layers: [glint(2800, 0.3, 0.18), after(0.02, thud(240, 115, 0.1, 0.22))],
  },
  {
    id: "boss.trapezeGong",
    family: "boss",
    blurb: "A gong: a low hum under a bright strike and a brass tail.",
    status: "bound",
    use: "The alien kicked the gong; panned to it. Pitched up per gong.",
    level: 0.46,
    layers: [
      sub(66, 0.35, 0.16),
      after(0.01, glint(2300, 0.25, 0.12)),
      after(0.02, metal(120, 0.5, 0.26, 140)),
    ],
  },
  {
    id: "boss.trapezeMiss",
    family: "boss",
    blurb: "The hull struck: a dull, heavy blow.",
    status: "bound",
    use: "A level ran out and the alien jumped at the hull.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.trapezeSpent",
    family: "boss",
    blurb: "The ropes snapping: a low fall under a rising hiss.",
    status: "bound",
    use: "The last gong: the swing goes over the top and away.",
    level: 0.46,
    layers: [sub(52, 0.7, 0.3), after(0.02, air(1200, 3200, 0.5, 0.14, 1.5))],
  },
  {
    id: "boss.trapezeOut",
    family: "boss",
    blurb: "The swing gone, and the field clearing.",
    status: "bound",
    use: "THE TRAPEZE gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE GALL's own out (`sounds/boss-gall.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
