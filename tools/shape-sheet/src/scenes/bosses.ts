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
 * There is deliberately no Warden here. It was the first scene written and it
 * stopped being one the moment the boss was built: a scene draws what the
 * simulation cannot, and a bone contour laid over a ring the game now renders
 * itself would be the exact confusion `scene-art.ts` exists to avoid. Its
 * states belong on the STATES sheet, posed, like every other built thing.
 *
 * These are also where the field figure earns the most, because a boss is the
 * one thing nobody can imagine from a paragraph: `bosses.md` spends four
 * hundred words on the Warden's tether and none of them says how much of the
 * screen a line from the rim to the hull actually crosses.
 */
export const BOSS_SCENES: Scene[] = [
  {
    suggests: "THE CHOIR",
    role: "p1",
    claim:
      "whether a parting reads at boss size, which is the argument for building this before the Symbiosis: the same form, five columns wide instead of one",
    bodies: [{ shape: "THE CHOIR", col: 3, row: 3, span: 5 }],
  },
  /**
   * THE WEIGHT, state by state.
   *
   * Five pictures rather than one, and it is the only concept on this page
   * that gets them. Every other draft here is a *shape* question — does a
   * parting read at boss size, is a plate one column wide — and one frame
   * answers a question like that. This one is a **cycle**: the boss has no
   * attack, no pattern and no phase, and the whole encounter is the rhythm of
   * two hands going on and coming off. A single frame of that is a sac
   * hanging in the middle of a field, which is a picture of the one moment in
   * the fight where nothing is being decided.
   *
   * They are in the order the fight runs in and each one is the state the one
   * before it forces, so the sequence is the argument: sinking costs nothing
   * and wins nothing, holding costs everything and wins nothing, and the only
   * thing that wins is the state the pair least wants to be in.
   * `docs/spec/transfers-bosses.md` is the prose; these are the pictures it
   * refers to.
   */
  {
    suggests: "THE WEIGHT",
    role: "p1",
    claim:
      "**1 · SINKING.** Nobody has a hand on it, so it comes down a row a beat and there is nothing on it to shoot — the stalk pays out above it and the cannon and the shield are both free and both useless. The clock in this fight is the boss.",
    bodies: [{ shape: "THE WEIGHT", col: 4, row: 4, span: 3 }],
    marks: [{ kind: "tether", col: 5, fromRow: 0, toRow: 3, note: "the stalk it hangs from" }],
  },
  {
    suggests: "THE WEIGHT",
    role: "p1",
    claim:
      "**2 · HELD.** Two hands stop it dead — and two hands on the boss is nobody on the cannon and nobody on the shield. This is the safest the field ever looks and no part of it is progress: hold forever and the fight never ends.",
    bodies: [{ shape: "THE WEIGHT", col: 4, row: 7, span: 3 }],
    marks: [
      { kind: "tether", col: 5, fromRow: 0, toRow: 6, note: "the stalk, taut along the pull" },
      { kind: "hand", col: 4, row: 7, player: 1, note: "the pilot's hand" },
      { kind: "hand", col: 6, row: 7, player: 2, note: "the navigator's hand" },
    ],
  },
  {
    suggests: "THE WEIGHT",
    role: "p1",
    claim:
      "**3 · BALLAST.** Held, it sheds rocks — real ones, the game's own, indestructible and needing the shield. So the price of holding is charged in the one currency the hold has taken away, and it comes due the beat a hand lets go.",
    bodies: [{ shape: "THE WEIGHT", col: 4, row: 6, span: 3 }],
    spawns: [
      { what: "meteor", col: 3, row: 10 },
      { what: "meteor", col: 8, row: 12 },
    ],
    marks: [
      { kind: "tether", col: 5, fromRow: 0, toRow: 5, note: "the stalk" },
      { kind: "hand", col: 4, row: 6, player: 1, note: "the pilot's hand" },
      { kind: "hand", col: 6, row: 6, player: 2, note: "the navigator's hand" },
    ],
  },
  {
    suggests: "THE WEIGHT",
    role: "p1",
    claim:
      "**4 · OPEN.** Below the line the seam at its narrow top parts, and for the first time there is something to shoot — one column, four rows above the hull, and the hand that takes the shot is a hand that was holding it up.",
    bodies: [{ shape: "THE WEIGHT", col: 4, row: 11, span: 3 }],
    marks: [
      { kind: "line", row: 10, note: "the line the seam opens below" },
      { kind: "lane", col: 5, note: "the column the shot has to go up" },
      { kind: "tether", col: 5, fromRow: 0, toRow: 10, note: "the stalk" },
      { kind: "hand", col: 4, row: 11, player: 1, note: "one hand still on it" },
    ],
  },
  {
    suggests: "THE WEIGHT",
    role: "p1",
    claim:
      "**5 · HEAVE.** Hit, it lifts fast and settles back slowly, the seam shuts and the cycle restarts higher up — with the ballast it shed on the way down still falling. The ghost is where it was standing when the shot went in.",
    bodies: [
      { shape: "THE WEIGHT", col: 4, row: 4, span: 3 },
      { shape: "THE WEIGHT", col: 4, row: 11, span: 3, ghost: true, label: "where it was hit" },
    ],
    spawns: [{ what: "meteor", col: 8, row: 13 }],
    marks: [
      { kind: "tether", col: 5, fromRow: 0, toRow: 3, note: "the stalk, slack again" },
      { kind: "line", row: 10, note: "the line, back above it" },
    ],
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
