import type { Scene } from "../scene.js";

/**
 * The bosses, placed on the field.
 *
 * A boss card is the one that lies hardest. Every one of these is described in
 * the spec by how much of the field it takes — five columns, seven columns,
 * the whole top — and a card crops that away and shows a nicely fitted blob.
 * The Choir's parting, the Codex's scrolling key and the Conductor's sweep are
 * all claims about *width*, and the only way to check a claim about width is
 * to draw the thing as wide as it says it is, above a hull the same picture is
 * drawing to scale.
 *
 * These are also where the field figure earns the most, because a boss is the
 * one thing nobody can imagine from a paragraph: `bosses.md` spends four
 * hundred words on the Warden's tether and none of them says how much of the
 * screen a line from the rim to the hull actually crosses.
 */
export const BOSS_SCENES: Scene[] = [
  {
    suggests: "The Warden",
    role: "p1",
    claim:
      "five columns wide, never walking, with a tether straight down the column the cannon was standing in — the picture `bosses.md` 11.4 describes and nobody has seen",
    bodies: [{ shape: "WARDEN · LOOKING", col: 3, row: 2, span: 5 }],
    marks: [
      {
        kind: "tether",
        col: 5,
        fromRow: 4,
        toRow: 13,
        note: "it takes the control where it stands",
      },
    ],
    spawns: [{ what: "meteor", col: 8, row: 9 }],
  },
  {
    suggests: "THE CHOIR",
    role: "p1",
    claim:
      "whether a parting reads at boss size, which is the argument for building this before the Symbiosis: the same form, five columns wide instead of one",
    bodies: [{ shape: "THE CHOIR", col: 3, row: 3, span: 5 }],
  },
  {
    suggests: "THE WEIGHT",
    role: "p1",
    claim:
      "the only boss that descends continuously, drawn where it has got to — the stalk above it is the line two hands have to hold, and holding is nobody firing",
    bodies: [{ shape: "THE WEIGHT", col: 4, row: 8, span: 3 }],
    marks: [{ kind: "tether", col: 5, fromRow: 0, toRow: 7, note: "the stalk it hangs from" }],
  },
  {
    suggests: "THE CODEX",
    role: "p2",
    claim:
      "the key is legible only on its own skin, so the skin has to be legible: a slab across seven columns with the glyph band travelling, drawn on the seat that holds the two colours it rewrites",
    bodies: [{ shape: "THE CODEX", col: 2, row: 2, span: 7 }],
    spawns: [
      { what: "red", col: 3, row: 7 },
      { what: "cyan", col: 7, row: 7 },
    ],
  },
  {
    suggests: "THE CONDUCTOR, bending the tempo",
    role: "p1",
    claim:
      "an arm across the top of the field, hung off the top edge — whether it reads as a mechanism sweeping rather than as one more thing falling, now that THE VANE would spend it",
    bodies: [{ shape: "THE CONDUCTOR", col: 2, row: 2, span: 7, fill: 1 }],
  },
  {
    suggests: "THE TITHE",
    role: "p2",
    claim:
      "seven columns of body and one plate reaching — its card argues that each plate is exactly one column wide, and this is where that is either true or not: the demand steps along the row while two rocks fall, on the seat that has to park a shield under one of them",
    bodies: [{ shape: "THE TITHE", col: 2, row: 3, span: 7, fill: 1 }],
    spawns: [
      { what: "meteor", col: 3, row: 7 },
      { what: "meteor", col: 8, row: 7 },
    ],
  },
  {
    suggests: "THE CAIRN",
    role: "p1",
    claim:
      "counting the units is counting the fight, so the seams have to survive at boss size — and the rock already falling beside it is the game's own, because that is exactly what a unit becomes once it is pulled",
    bodies: [{ shape: "THE CAIRN", col: 2, row: 3, span: 7, fill: 1 }],
    spawns: [{ what: "meteor", col: 7, row: 8 }],
  },
  {
    suggests: "THE VANE",
    role: "p1",
    claim:
      "the pendulum the Conductor drew, spent on a boss that bends the field instead of the beat: at the far end of its sweep, where the hub is the only part that can be hit — and the player who has to shoot it is the one whose columns just stopped matching",
    bodies: [{ shape: "THE VANE", col: 2, row: 2, span: 7, fill: 1 }],
    spawns: [
      { what: "red", col: 2, row: 8 },
      { what: "cyan", col: 8, row: 8 },
    ],
  },
  {
    suggests: "The Needle",
    role: "p1",
    claim:
      "the only thing on the field that is not in a lane: a corridor laid across the columns at an angle, with two creatures still obeying them",
    bodies: [{ shape: "THE NEEDLE", col: 1, row: 6, span: 9, turn: 74 }],
    spawns: [
      { what: "red", col: 2, row: 3 },
      { what: "cyan", col: 8, row: 9 },
    ],
  },
];
