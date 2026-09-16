import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster — `mechanics-split.ts`'
 * `SplitId` for the same reason: a name that is not a `MechanicId` collapses to
 * `never` and the key becomes a build error, so this list cannot fall behind a
 * rename.
 */
type BossId = Extract<
  MechanicId,
  "queen" | "warden" | "tether" | "cairn" | "mirror" | "maze" | "splice"
>;

/**
 * **The bosses**, and the one thing a boss throws that is a mechanic of its own.
 *
 * A boss is not a creature that falls harder. It arrives on its own and stays,
 * it is the whole of the wave it is in, and every one of these five sentences
 * describes a *rule change* rather than a body: the warden takes a control
 * away, the mirror makes the ship the enemy, the maze puts a corridor between
 * a shot and what it is aimed at. That is what makes the group a fact about
 * the game rather than a convenient cut, and `mechanics-rounds.ts` next door
 * is the same argument about a round.
 *
 * `tether` comes with them because it is `carriedBy: "warden"` — it is a boss's
 * limb, and there is nowhere else it could sit that would not separate it from
 * the thing that throws it.
 *
 * THE CAIRN is the sixth and it is the group's own argument at its plainest:
 * what changes is not a body but a rule, and the rule is that **this boss has
 * no answer either control can give**. A pile is taken apart by hand and comes
 * apart into the game the pair already knows.
 *
 * Lifted out of `mechanics-table.ts` when that file came back to its 250-line
 * limit for the second time, along the seam that file's own comments had
 * already drawn. `MECHANICS` names each of these one by one rather than
 * spreading the object, because `MECHANIC_IDS` is read off its key order and
 * the bestiary walks it — a group spread in one place would have moved the
 * queen to sit beside the maze.
 */
export const BOSS_MECHANICS = {
  queen: {
    what: "Huge and armoured. Two marks under her middle, one real and one not. She opens for two beats, and every eight a torch drops out of one of her wings.",
    reach: "spawn",
  },
  warden: {
    what: "A ring five columns wide with a hole you can see the field through. It never moves, and it takes one of your two sliding controls at a time.",
    reach: "spawn",
  },
  tether: {
    what: "A line out of the rim onto one of your sliding controls. It cannot be shot and it cannot be warded.",
    reach: "spawn",
    carriedBy: "warden",
  },
  cairn: {
    what: "A pile of seven of the field's own rocks, five columns wide, standing still. Nothing fired reaches it and the shield has nothing to turn. You take it apart by hand: a thumb held on the pile and carried sideways drags one rock out of that side, and what comes away falls down that lane as an ordinary rock. Leave it alone too long and it lets one go itself, into a column only the pilot can see it choosing.",
    reach: "spawn",
  },
  mirror: {
    what: "The boss is your own ship. It performs a sequence of your own moves, then asks for the whole of it back.",
    reach: "spawn",
  },
  maze: {
    what: "A real maze of rings turns above the ship, with a heart in the middle. Turn a gap round onto the ship's own column, fire the colour the heart is beating in, and the shot crawls the corridors to it. Only one gap in a rim reaches the middle; a shot lost in one of the others brings the maze down and the stage begins again.",
    reach: "spawn",
  },
  splice: {
    what: "A row of mouths two tiles over the plating, and a straw out of each one running the whole height of the field, tangled through all the others, with a number at its far end. Feed them in order — the cannon under a mouth and the maw open — and the number takes two beats to come down the straw before the ship finds out whether it was the one wanted. Only one of you is shown the tangle and the numbers; only the other one can reach a mouth. A wrong number, or a round's beats running out, costs the hull.",
    reach: "spawn",
  },
} as const satisfies Record<BossId, Mechanic>;
