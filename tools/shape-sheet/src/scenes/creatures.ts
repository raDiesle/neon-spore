import type { Scene } from "../scene.js";

/**
 * The creature ideas, placed on the field.
 *
 * Every one of these is a question the card could not ask. A cluster parts and
 * comes back together, which is unmistakable at 132 px and may be nothing at
 * all at a lane's width; a barb points at a column, which means nothing until
 * there is a column for it to point at; a husk has to pass for a pod, which is
 * a claim about two shapes side by side and not about either one alone.
 *
 * So the placements are chosen to *lose* the argument if the argument is
 * wrong. A draft standing alone in the middle of an empty field always looks
 * fine. These stand beside the slick and the bulb the game already draws, at
 * the size the game draws them, because that is the only comparison a player
 * will ever make.
 */
export const CREATURE_SCENES: Scene[] = [
  {
    suggests: "Symbiosis",
    role: "p1",
    claim:
      "the parting is the window, so it has to be visible at a lane's width — the same contour at one lane and at three, with a bulb beside it for scale",
    bodies: [
      { shape: "SYMBIOSIS", col: 2, row: 5, label: "one lane" },
      { shape: "SYMBIOSIS", col: 7, row: 5, span: 3, label: "three lanes" },
    ],
    spawns: [{ what: "cyan", col: 4, row: 5 }],
  },
  {
    suggests: "The Colony",
    role: "p1",
    claim:
      "it adds work rather than presenting it: five small bodies in one skin and two roots already down the field, against a single slick doing what a creature normally does",
    bodies: [
      { shape: "COLONY", col: 5, row: 3, span: 2 },
      { shape: "TENDRIL", col: 3, row: 7 },
      { shape: "TENDRIL", col: 7, row: 8 },
    ],
    spawns: [{ what: "red", col: 9, row: 6 }],
  },
  {
    suggests: "Notch",
    role: "p1",
    claim:
      "a barb has to read as a *direction* at 26 px on a field where the bulb already sways and the slick already tilts — both variants, both leaning, with the scar they steer for on the left",
    bodies: [
      { shape: "NOTCH 1", col: 4, row: 6, label: "barb" },
      { shape: "NOTCH 2", col: 6, row: 6, label: "lean" },
    ],
    spawns: [
      { what: "red", col: 8, row: 4 },
      { what: "cyan", col: 9, row: 8 },
    ],
    marks: [
      { kind: "scar", col: 1, note: "the damage already done" },
      { kind: "lane", col: 1, note: "the column both are steering for" },
    ],
  },
  {
    suggests: "Husk",
    role: "p1",
    crop: "ship",
    claim:
      "a husk has to pass for a pod on the way down or refusing one is free — the real pod the game draws, and both drafts beside it, at the size the maw is offered them",
    bodies: [
      { shape: "HUSK 1", col: 5, row: 11, tint: "pod", label: "sag" },
      { shape: "HUSK 2", col: 7, row: 11, tint: "pod", label: "sag + dent" },
    ],
    spawns: [{ what: "pod", col: 3, row: 11 }],
  },
  {
    suggests: "Herald",
    role: "p1",
    claim:
      "the one creature the two seats do not see at the same moment: the solid body is this screen's, the faint one is where the other screen still has it",
    bodies: [
      { shape: "HERALD", col: 5, row: 7 },
      { shape: "HERALD", col: 5, row: 5, ghost: true, label: "the other seat" },
    ],
  },
  {
    suggests: "Wave gate",
    role: "p2",
    crop: "ship",
    claim:
      "the one creature reaching the hull does not remove — it has to read as an obstruction sitting *on* the ship rather than as something about to land on it",
    bodies: [{ shape: "GATE", col: 5, row: 13, tint: "rock", span: 2 }],
    spawns: [{ what: "meteor", col: 8, row: 10 }],
  },
  {
    suggests: "Camouflage",
    role: "p1",
    claim:
      "an outline nothing can fix on, standing next to two that can be: if the blur does not separate it from the slick and the bulb here, aiming beside it is not a decision",
    bodies: [{ shape: "SMOKE", col: 5, row: 6 }],
    spawns: [
      { what: "red", col: 3, row: 6 },
      { what: "cyan", col: 7, row: 6 },
    ],
  },
];
