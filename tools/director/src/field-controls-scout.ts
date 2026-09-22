import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE SCOUT's two hands on its own picture**, in a file of its own, the
 * split every boss since THE INSTAR has made.
 *
 * Two rows on two targets, and they are the only pair in the game **drawn in
 * the same place on two different screens**. The brief puts both on the little
 * ship, and the round's whole split is that the pilot is shown a ship with a
 * nose and the navigator a ship with none (`view-role.ts`) — so hers sits in
 * the ship's own middle, where her screen has nothing but a place, and his
 * stands off the stern where the wake comes out. Neither seat ever has to tell
 * one from the other, because neither seat is ever shown both.
 *
 * They are also entered by the pair's **own last answer**: every mote they
 * decide to pick up rather than bank is what puts the ship in the next load.
 * A pair that banks each mote as it takes it never sees either row.
 *
 * **The rules shipped first and the pictures came after.** Both gestures were
 * heard by `sim/scout-hand.ts` from 18 September 2026 with nothing on either
 * screen to take hold of, which is why there were no rows here and
 * `on-field-controls.test.ts` had `scoutLine` and `scoutPrime` as `unbuilt`.
 */
export const SCOUT_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE SCOUT'S LINE",
    where:
      "on the little ship itself, riding it wherever it has got to, from the " +
      "moment it is past scoutLadenMotes — her screen shows the ship with no " +
      "nose and none of the motes it carries, so the middle of it is a place " +
      "and nothing else and the ring covers nothing she reads " +
      "(render/scout-grip.ts)",
    seat: "player 2 only — the seat that can see the arena and can move nothing in it",
    gesture: "hold",
    does:
      "Puts a line on the ship and reels it straight home at scoutReelMilli " +
      "for as long as her thumb is down, with player 1's turn and burn dead " +
      "while it runs (sim/scout-hand.ts, stepScoutReel). The line is drawn " +
      "from the ship to the mother ship's mouth on both screens, because it " +
      "goes through whatever is in the way and only she can see what that " +
      "is — a hazard on it is a hazard the ship is being dragged into. It " +
      "does not break the round's split: she chooses when, never where, and " +
      "the one place it goes is the place the round is already aiming at. On " +
      "a ship that is not laden there is no ring and nothing happens.",
    source: "touch.ts — scoutGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "scoutLine",
    sends: ["drag"],
    pose: "THE SCOUT · LADEN",
  },
  {
    name: "THE SCOUT'S PRIME",
    where:
      "off the little ship's stern, along its heading and behind the amber " +
      "beads that ride the rim, from the moment it is past scoutHeavyMotes — " +
      "in the air the wake takes up when the thruster answers, which is empty " +
      "exactly while the ring is offered (render/scout-grip.ts)",
    seat: "player 1 only — the ship is the one thing his screen shows him",
    gesture: "grab and drag",
    does:
      "Primes the labouring thruster: a carry of at least scoutPrimeMilli, " +
      "measured up or down, and the burn answers again for scoutPrimeTicks " +
      "(sim/scout-hand.ts, scoutPrimed). The press itself says nothing and " +
      "neither does a carry too short — a thumb resting on the stern is not " +
      "a thruster being lit. Its dial is the window and drains with it, so " +
      "the seat holding the burn can see it running out rather than finding " +
      "out by pressing; the wake asks the same reading, so a burn held past " +
      "the window draws nothing.",
    source: "touch.ts — scoutGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "scoutPrime",
    sends: ["drag"],
    pose: "THE SCOUT · HEAVY",
  },
];
