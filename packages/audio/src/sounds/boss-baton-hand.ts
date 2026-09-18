/**
 * THE BATON's arm under a thumb, in a file of their own for
 * `boss-pulse-hand.ts`' reason: `boss-baton.ts` is at its limit and the five
 * below are one lane's worth, added when the arm was given a handle of its own
 * (`sim/baton-hand.ts`).
 *
 * The eleven next door are a **count** — a click going up and the same click
 * coming down, so the pair keeps time off them. These five are deliberately
 * not: every one of them is a thing happening *to the arm* rather than a beat
 * in it, so they are made of shell and joint — a seam opening, a shell coming
 * away, two things drawn together — and they sit under the count rather than
 * in it. All of them keep out of the 300–3000 Hz band (docs/spec/audio.md §1).
 */

import { after, air, glint, metal, noise, soft, spore, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_BATON_HAND_SOUNDS: SoundDef[] = [
  {
    id: "boss.batonSwell",
    family: "boss",
    blurb: "A dead joint starting to give: a seam opening slowly, with grit coming out of it.",
    status: "bound",
    use: "THE BATON's topmost dark socket beginning to shed — the window to strip it is open.",
    level: 0.34,
    // Rising and unresolved, because it is a warning and not an event: the
    // thing it is about has not happened yet, and will in three beats.
    layers: [
      { source: "triangle", freq: 84, toFreq: 168, gain: 0.2, attack: 0.08, release: 0.3 },
      after(0.06, soft(0.5, noise(0.4, { type: "lowpass", freq: 240, q: 0.8 }, 0.02, 0.26, 0.35))),
      after(0.12, soft(0.4, spore(62, 0.4, 0.26, 30))),
    ],
  },
  {
    id: "boss.batonStripped",
    family: "boss",
    blurb: "A shell coming away clean in the hand: one dry crack and nothing falling after it.",
    status: "bound",
    use: "THE BATON's swelling socket stripped by the locked-out seat — no rock comes down.",
    level: 0.4,
    // Short, and it *stops*: the whole of what this sound says is that the
    // rock the last one promised is not coming.
    layers: [
      tick(0.55, 0, 2600),
      metal(152, 0.22, 0.18, 180),
      after(0.05, glint(3400, 0.16, 0.09)),
    ],
  },
  {
    id: "boss.batonRefused",
    family: "boss",
    blurb: "A hand on a thing that is not yours yet: a dull knock that goes nowhere.",
    status: "bound",
    use: "THE BATON refusing a thumb from the seat whose beat it is not — the arm is the other's.",
    level: 0.3,
    layers: [thud(96, 74, 0.1, 0.3), after(0.03, soft(0.4, sub(48, 0.2, 0.26)))],
  },
  {
    id: "boss.batonHeld",
    family: "boss",
    blurb: "A thumb landing on a bead: a soft catch, and the bead holding still under it.",
    status: "bound",
    use: "THE BATON's merging bead taken by its own seat — half of the hold the pair owes it.",
    level: 0.33,
    layers: [thud(136, 90, 0.12, 0.36), after(0.05, soft(0.45, metal(108, 0.2, 0.2, 260)))],
  },
  {
    id: "boss.batonParted",
    family: "boss",
    blurb: "Two things that did not meet: one of them falling away, and the arm shaking it home.",
    status: "bound",
    use: "THE BATON's merge window closed short — the bead that waited is back at the top socket.",
    level: 0.42,
    layers: [
      { source: "triangle", freq: 180, toFreq: 64, gain: 0.24, attack: 0.01, release: 0.34 },
      after(0.06, soft(0.5, air(4800, 2800, 0.4, 0.1, 1.3))),
      after(0.2, soft(0.45, spore(54, 0.5, 0.3, 44))),
    ],
  },
];
