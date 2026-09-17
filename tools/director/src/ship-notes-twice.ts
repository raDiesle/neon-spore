import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each card for a **body one landed answer does not
 * finish**: THE ECHO, THE RIND, THE RECOIL, THE CAROM, THE CRYSTAL, THE
 * STRAND, THE CRAWLER and THE VOLLEY.
 *
 * Split out of `ship-notes.ts`, which had been sitting one line under its
 * 250-line limit since THE MOULT's note and had no headroom left for the next
 * creature at all (`docs/queue.md`) — along the seam `ship-notes-hidden.ts`
 * cut before it and for the same reason.
 *
 * **The seam is the family, and these eight named it themselves.** Four of
 * their notes next door already opened on the same sentence — *the one arrival
 * a landed shot does not finish*, *the one arrival the shield does not
 * finish*, *the one arrival neither control can finish*, *the one arrival that
 * gets harder while you watch it*. Every body here answers the right control
 * with **more of itself**: a layer off, a throw back up the field, a shell
 * cracked, a middle broken, a bead, a segment, a plate, a division. What is
 * left next door is a body that is over when the pair get it right, and the
 * dials the ship itself carries.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in any
 * of these files is the same compile error it always was.
 */
export const TWICE_NOTES = {
  "THE ECHO — one body that becomes eight":
    "The one arrival that gets harder while you watch it. It steps down only " +
    "every second beat, so the hull is never what is pressing — but it divides " +
    "while it falls, and each wait is longer than the last: three beats, then " +
    "six, then nine. Every division turns a corner — sideways, then up and " +
    "down, then both at once — so the bodies stay in a knot instead of taking " +
    "the whole width of the field, and the last one is the one a pair playing " +
    "well never sees. Both players watch it strain and see which way it is " +
    "about to part. A shot pays for every body the one it killed would still " +
    "have become. See echo.ts, echo-split.ts.",
  "THE RIND — one body, three sizes":
    "The one arrival a landed shot does not finish. It comes down three " +
    "times the size of a slick and the matching colour takes a layer off " +
    "instead of killing it: three sizes, two sheds, and an ordinary body at " +
    "the end that dies to an ordinary shot. How big it is *is* how much is " +
    "left, so nothing is drawn over it and no number is shown. What it costs " +
    "the pair is the column they had already finished with. See rind.ts.",
  "THE RECOIL — a shot that sends it the wrong way":
    "The one arrival whose own answer undoes the answer. A slick or a bulb " +
    "in a sprung cage: the matching colour throws it two rows back up the " +
    "field and a lane to one side the seeded rng picks, turning the body " +
    "over on the way. Three times, then the fourth shot kills. See recoil.ts.",
  "THE CAROM — a rock with something alive in it":
    "The one arrival neither control can finish. A body sealed in rock, " +
    "crossing on a diagonal and turning at the walls twice before it lands. " +
    "The shield cannot touch it whole; the cannon cracks it, and what drops " +
    "out is a meteor that has to be warded. See carom.ts.",
  "THE CRYSTAL — two bodies in one shell, broken at the middle":
    "A craft three tiles wide with an electric field round it, crossing on " +
    "a diagonal. Only the middle breaks, in the colour the wave gave it, and " +
    "only while the shield stands armed under any of its three lanes; then " +
    "the two ends fall as a plain slick and a plain bulb. Any other shot is " +
    "caught and nothing else happens. See crystal.ts.",
  "THE STRAND — beads on a thread, shot in order":
    "Two to five slicks and bulbs on one line, alternating. It is eaten " +
    "from its ends inward and only one bead can be shot at a time, at an " +
    "end rolled again after every shot. The navigator is shown which that " +
    "is and no colours; the pilot is shown the colours and no mark, so the " +
    "column and the trigger are two halves of one sentence. A shot at the " +
    "wrong bead swells a dead one back. See strand.ts.",
  "THE CRAWLER — a worm that walks the ship instead of falling":
    "The one arrival that never arrives. It comes over a side wall onto the " +
    "row the shield covers and walks the ship lengthways, costing the hull " +
    "nothing while it does. Its head and tail are armour; the segments " +
    "between them run red, cyan, plate and round again, so a colour wants " +
    "the matching cannon under it and a plate wants the shield — and the " +
    "body snaps together behind every one taken off. Strip it and a beam " +
    "takes what is left; let it reach the far wall and it eats in, for as " +
    "much as the pair left on it. See crawler.ts.",
  "THE VOLLEY — a rock you have to hit back three times":
    "The one arrival the shield does not finish. A ward hits it straight back " +
    "up the field instead of off it and takes a plate of shell with it, and it " +
    "comes down the same lane again. Three wards, and the shell bursts in " +
    "mid-air over a body the cannon has to take. See volley.ts.",
} satisfies Partial<Record<GroupName, string>>;
