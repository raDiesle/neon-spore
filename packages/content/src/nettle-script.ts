import type { NettleStep } from "@neon-spore/sim";

/**
 * THE NETTLE's script: ten steps over eight poses, and what the pair does to each.
 *
 * THE INSTAR's engine (`sim/instar.ts`) with **the ship's own panel back**:
 * the owner, 26 September 2026 — *another boss more like "the instar" with
 * choreographed mainly about ingame gesture events. we can also have standard
 * control set enabled, but do not do complex logic with it. just some steps
 * can be "shoot it" "suck it" or "shield it".* So most steps are thumbs on
 * the body, as THE INSTAR's are, and four ask the panel for one thing in one
 * column: a SHOOT mark wants bolts out of its column, a SHIELD mark the dome
 * brought up under it, a SUCK mark the maw opened under it
 * (`sim/scene-panel.ts`). Each is one press counted, and nothing else about
 * the press is judged.
 *
 * Read a mark as THE INSTAR's are read: `xMilli`/`yMilli` in thousandths of
 * the field, `need` in the gesture's unit, left is player 1's and right is
 * player 2's. **A panel mark's seat is `both`** — the cannon is one seat's and
 * the trigger the other's — and it stands on a column's centre, `(col + ½)`
 * elevenths of the field, so the column it names is the column it is drawn in.
 *
 * **What each step is, in the picture.**
 *
 * 1. *Sting* — it drifts in from far off, small, until the bell fills the top
 *    of the field, both stinging arms hanging down at the hull. Each seat
 *    pulls its own arm up off the ship, three tiles, at once.
 * 2. *Gaze* — the bell tips and two eyespots on its rim glare. SHOOT each,
 *    three bolts a spot: the cannon under one, the trigger, then the other.
 * 3. *Spawn* — it passes twice and comes back with the brood sac swollen.
 *    Player 2 taps the sac, twelve; two spores already loose drift at the
 *    hull, and player 1 SUCKs each one in with the maw.
 * 4. *Under* — it crosses and comes back **turned**, the underside at the
 *    ship: the bell's face goes, and an iris of a mouth comes. Each seat winds
 *    its half of the iris shut, a turn and a half each.
 * 5. *Gape* — the iris forces itself open again and the mouth drops at the
 *    ship; both thumbs hold it off together for three beats.
 * 6. *Spit* — it crosses, squeezes the bell, and spits three globs of acid
 *    down three columns: SHIELD each as it comes.
 * 7. *Sting, turned round* — the arms again, **the hands swapped**, and each
 *    arm pulls back against its thumb every beat (`pushMilli`).
 * 8. *Frill* — it passes twice and lets its frilled oral arms down in a
 *    curtain over the ship. Each seat swipes its side of the curtain down and
 *    away, five swipes.
 * 9. *Core* — the bell opens on the core glowing inside it. Both seats tap
 *    the core, ten each, together.
 * 10. *Core, last* — the bell stays open and the core is bare. SHOOT it, four
 *    bolts, and it is over.
 *
 * **The clocks are THE INSTAR's** — eight beats for the entrance, twelve for
 * two passes, seven for a crossing, three for a pose it stays for; a window
 * of four, five where the panel has to travel or a hold is counted — and the
 * needs are its counts of 25 September 2026 cut to fit steps with more than
 * one kind of answer in them.
 */
export const NETTLE_SCRIPT: readonly NettleStep[] = [
  {
    pose: "sting",
    arrive: "approach",
    morphBeats: 8,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "arm", gesture: "pullUp", xMilli: 318, yMilli: 720, need: 3000 },
      { seat: "p2", part: "arm", gesture: "pullUp", xMilli: 681, yMilli: 720, need: 3000 },
    ],
  },
  {
    pose: "gaze",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 5,
    landBeats: 2,
    marks: [
      { seat: "both", part: "spot", gesture: "shoot", xMilli: 318, yMilli: 300, need: 3 },
      { seat: "both", part: "spot", gesture: "shoot", xMilli: 681, yMilli: 300, need: 3 },
    ],
  },
  {
    pose: "spawn",
    arrive: "passes",
    morphBeats: 12,
    windowBeats: 5,
    landBeats: 3,
    marks: [
      { seat: "p2", part: "sac", gesture: "tap", xMilli: 600, yMilli: 330, need: 12 },
      { seat: "both", part: "spore", gesture: "suck", xMilli: 227, yMilli: 780, need: 1 },
      { seat: "both", part: "spore", gesture: "suck", xMilli: 772, yMilli: 780, need: 1 },
    ],
  },
  {
    pose: "under",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "mouth", gesture: "turn", xMilli: 400, yMilli: 400, need: 1500 },
      { seat: "p2", part: "mouth", gesture: "turn", xMilli: 600, yMilli: 400, need: 1500 },
    ],
  },
  {
    pose: "gape",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 5,
    landBeats: 3,
    marks: [{ seat: "both", part: "mouth", gesture: "hold", xMilli: 500, yMilli: 440, need: 3 }],
  },
  {
    pose: "spit",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 5,
    landBeats: 3,
    marks: [
      { seat: "both", part: "glob", gesture: "shield", xMilli: 227, yMilli: 760, need: 1 },
      { seat: "both", part: "glob", gesture: "shield", xMilli: 500, yMilli: 760, need: 1 },
      { seat: "both", part: "glob", gesture: "shield", xMilli: 772, yMilli: 760, need: 1 },
    ],
  },
  {
    pose: "sting",
    arrive: "cross",
    morphBeats: 7,
    windowBeats: 4,
    landBeats: 3,
    pushMilli: 250,
    marks: [
      { seat: "p2", part: "arm", gesture: "pullUp", xMilli: 318, yMilli: 720, need: 3000 },
      { seat: "p1", part: "arm", gesture: "pullUp", xMilli: 681, yMilli: 720, need: 3000 },
    ],
  },
  {
    pose: "frill",
    arrive: "passes",
    morphBeats: 10,
    windowBeats: 4,
    landBeats: 3,
    marks: [
      { seat: "p1", part: "frill", gesture: "swipeDown", xMilli: 380, yMilli: 480, need: 5 },
      { seat: "p2", part: "frill", gesture: "swipeDown", xMilli: 620, yMilli: 480, need: 5 },
    ],
  },
  {
    pose: "core",
    arrive: "approach",
    morphBeats: 6,
    windowBeats: 4,
    landBeats: 2,
    marks: [
      { seat: "p1", part: "core", gesture: "tap", xMilli: 440, yMilli: 330, need: 10 },
      { seat: "p2", part: "core", gesture: "tap", xMilli: 560, yMilli: 330, need: 10 },
    ],
  },
  {
    pose: "core",
    arrive: "stay",
    morphBeats: 3,
    windowBeats: 5,
    landBeats: 4,
    marks: [{ seat: "both", part: "core", gesture: "shoot", xMilli: 500, yMilli: 330, need: 4 }],
  },
];
