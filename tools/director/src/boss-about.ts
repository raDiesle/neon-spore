/**
 * **What each boss is about**: the intro of the block whose new thing it
 * fits, by wave id. `bossOrder` (`boss-slots.ts`) closes that block with it
 * before any other boss takes a block.
 *
 * The owner, 17 October 2026: *every list of waves of a parent — the boss
 * should be related to the new thing introduced … i will later on create new
 * bosses which fit the new enemy or concept introduced.* Keys cannot say this
 * — most bosses carry only their own mechanic and the default panel — so it
 * is a table, drafted off each mechanic's `what` and taken by the owner as
 * written the same day. A boss not named here fits no block yet, and takes
 * the first block left free once its needs are taught, as every boss did
 * before (the owner's pick: *stay where they are*). A new boss written for a
 * block is a row here.
 */
export const BOSS_ABOUT: Readonly<Record<string, string>> = {
  // A slime that hangs real pods and fake ones: the husk is the fake pod.
  theSwindle: "theHusk",
  // A stone only the lance cuts.
  theGeode: "theLance",
  // An eye that opens on the beat, as the countdown's blades open and shut.
  theStare: "theCount",
  // A control taken away, as the walking cannon takes the steering.
  theWarden: "theChoke",
  // A lobe pulled shut till its seam cracks, then the kernel in its colour.
  theVise: "theThirdShot",
  // A stone each, pulled together, as both hold a BOTH blister down.
  thePlumb: "theWeight",
  // A handle each, pulled at once, as the balloon's two handles are.
  theSinew: "theBalloon",
  // The eel the leech grew into.
  theLamprey: "theLeech",
  // Pulled aside by hand to see what is behind, as the dark is lit.
  theCurtain: "theDark",
  // A cocoon peeled skin by skin: a moult.
  theChrysalis: "theMoult",
  // Not about the echo, but THE ECHO's block is where the owner put it back
  // out of the arc, the evening of 17 October 2026: a boss on a panel of its
  // own stands past the basics. THE REPRISE was drafted here, and takes the
  // first free block instead.
  theSplice: "theEcho",
  // An arm that mirrors the field across its column, as the flip mirrors it.
  theVane: "theFlip",
  // You see the other's mark and not yours, as the handover swaps halves.
  theGimbal: "theHandover",
  // An eye held open, leaf by leaf, as the lid's cord holds it.
  theOculus: "theLid",
  // One sees the tiles, the other taps them, as with the mine.
  theMimic: "theMine",
  // One sees the ember, the other fires, as with the ghost.
  theFlue: "theGhost",
  // Breaches that spill rocks.
  theHive: "theWard",
  // A bead down an arm, as beads down the strand.
  theBaton: "theStrand",
  // Lobes up through the hull, which the crawler walks.
  theUndertow: "theCrawler",
  // Pods to free and swallow, on a panel of its own, as THE CLAW's.
  theThroat: "theClaw",
};
