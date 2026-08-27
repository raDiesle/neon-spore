/**
 * The assists: what one player can spend to make the other's job possible.
 *
 * None of it is built (`docs/spec/assists.md`). The shape the family commits
 * to is that an assist is *heard by both*, and heard differently at each end —
 * `assist.handOver` and `assist.takeOver` are the same event panned opposite
 * ways, so neither player has to be told which side of it they are on.
 */

import { after, air, chime, glint, soft, sub } from "../grain.js";
import type { SoundDef } from "../types.js";

export const ASSIST_SOUNDS: SoundDef[] = [
  {
    id: "assist.slowGrant",
    family: "assist",
    blurb: "The field getting heavier for a moment. Everything sags a semitone.",
    status: "spare",
    use: "The slowing assist — the weaker partner given time.",
    level: 0.3,
    layers: [
      { source: "sine", freq: 120, toFreq: 100, gain: 0.5, attack: 0.2, hold: 0.4, release: 0.5 },
      soft(0.5, air(1600, 700, 0.7, 0.16, 1.4)),
    ],
  },
  {
    id: "assist.slowEnd",
    family: "assist",
    blurb: "It lets go. The same sag, upward and faster.",
    status: "spare",
    use: "The slowing assist expiring.",
    level: 0.26,
    layers: [
      { source: "sine", freq: 100, toFreq: 130, gain: 0.45, attack: 0.06, release: 0.24 },
      soft(0.5, air(700, 2200, 0.24, 0.16, 1.6)),
    ],
  },
  {
    id: "assist.handOver",
    family: "assist",
    blurb: "A control moving from one player to the other: a tone crossing the stereo field.",
    status: "spare",
    use: "An assist that lends a control across the pair.",
    level: 0.32,
    layers: [
      { source: "sine", freq: 4400, gain: 0.3, attack: 0.03, hold: 0.1, release: 0.3, pan: -0.8 },
      after(0.12, {
        source: "sine",
        freq: 5280,
        gain: 0.3,
        attack: 0.03,
        hold: 0.1,
        release: 0.3,
        pan: 0.8,
      }),
    ],
  },
  {
    id: "assist.takeOver",
    family: "assist",
    blurb: "The other end of the same move, from the receiving side.",
    status: "spare",
    use: "The partner's device, for the same hand-over.",
    level: 0.32,
    layers: [
      { source: "sine", freq: 5280, gain: 0.3, attack: 0.03, hold: 0.1, release: 0.3, pan: 0.8 },
      after(0.12, {
        source: "sine",
        freq: 4400,
        gain: 0.3,
        attack: 0.03,
        hold: 0.1,
        release: 0.3,
        pan: -0.8,
      }),
    ],
  },
  {
    id: "assist.offered",
    family: "assist",
    blurb: "An offer, not yet taken: a tone that stays and waits.",
    status: "spare",
    use: "An assist offered and waiting on the other player.",
    level: 0.24,
    layers: [
      {
        source: "triangle",
        freq: 4600,
        gain: 0.22,
        attack: 0.1,
        hold: 0.6,
        release: 0.4,
        ring: { freq: 1100, depth: 0.3 },
      },
    ],
  },
  {
    id: "assist.declined",
    family: "assist",
    blurb: "The offer withdrawn. One step down and out.",
    status: "spare",
    use: "An assist expiring untaken.",
    level: 0.22,
    layers: [{ source: "sine", freq: 4600, toFreq: 3400, gain: 0.32, attack: 0.02, release: 0.2 }],
  },
  {
    id: "assist.unlocked",
    family: "assist",
    blurb: "Something the pair did not have before. A low note opening into a high one.",
    status: "spare",
    use: "An assist unlocking (assists.md 6.2).",
    level: 0.4,
    layers: [
      sub(74, 0.5, 0.5),
      after(0.2, chime(4400, 0.4, 0.2, 1100)),
      after(0.34, chime(6600, 0.5, 0.18, 1600)),
      after(0.34, soft(0.6, glint(8800, 0.4))),
    ],
  },
];
