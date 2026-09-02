import { after, air, burst, chime, glint, metal, soft, spore, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

/**
 * THE FLEET, as four sounds, and the ear is doing more work here than in any
 * other fight in the game.
 *
 * The navigator holds the sights and is shown nothing but water. What they
 * learn about the square they just fired into, they learn from the sound of it
 * — so the four have to be told apart across a room, at a glance of the ear,
 * with somebody talking over the top of them. They are spaced by *material*
 * rather than by pitch: water swallows, metal rings, a hull goes under, and
 * the last one takes the whole chart with it.
 *
 * `family: "boss"` and not a family of their own: the catalogue's families are
 * a fixed set (`types.ts`), and a fight is a boss whatever picture it draws.
 * Their own file because `boss.ts` is already at its size and these four are
 * one subject.
 */
export const FLEET_SOUNDS: SoundDef[] = [
  {
    id: "boss.fleetSplash",
    family: "boss",
    blurb: "A shell into open water: a short slap, and the sea closing over it.",
    status: "bound",
    use: "A salvo into a square with nothing under it.",
    level: 0.3,
    layers: [
      thud(180, 60, 0.14, 0.42),
      // The close-over, above the voice rather than through it — the catalogue
      // keeps every wash of noise on one side of the speech band or the other.
      after(0.05, air(5200, 3400, 0.4, 0.16, 1.1)),
    ],
  },
  {
    id: "boss.fleetHit",
    family: "boss",
    blurb: "Metal struck and left ringing, with the water underneath it.",
    status: "bound",
    use: "A salvo that found a hull on THE FLEET's chart.",
    level: 0.44,
    layers: [
      thud(260, 52, 0.34, 0.6),
      metal(140, 0.42, 0.34, 150),
      after(0.07, glint(4200, 0.26, 0.16)),
    ],
  },
  {
    id: "boss.fleetSunk",
    family: "boss",
    blurb: "A hull rolling over and going down: metal giving, then a long sink.",
    status: "bound",
    use: "The last square of one of THE FLEET's ships.",
    level: 0.52,
    layers: [
      thud(280, 30, 0.7, 0.7),
      metal(96, 0.8, 0.36, 110),
      after(0.24, soft(0.7, sub(46, 1.3, 0.5))),
      // The wash the hull leaves, kept clear above the voice: a bandpass is
      // only as narrow as its Q, so it is sat well clear of 3 kHz rather than
      // on the edge of it (`band.ts`).
      after(0.4, air(6200, 4400, 0.8, 0.13, 1.6)),
    ],
  },
  {
    id: "boss.fleetDown",
    family: "boss",
    blurb: "The chart clear: the sink, and a bell over it that nothing answers.",
    status: "bound",
    use: "The last ship of THE FLEET — the fight is over.",
    level: 0.58,
    // No `pierce`. `boss.queenDown` already spends one of the catalogue's five
    // permissions on a boss dying, and a second one for the same sentence is
    // exactly the argument that ceiling exists to make somebody have. The bell
    // sits above the band instead, which costs the pair nothing.
    layers: [
      thud(280, 26, 1.1, 0.78),
      after(0.26, burst(chime(4800, 0.5, 0.2, 1200), 3, 0.19, 0.74, -6)),
      after(1, soft(0.6, spore(50, 1.2, 0.4, 60))),
    ],
  },
];
