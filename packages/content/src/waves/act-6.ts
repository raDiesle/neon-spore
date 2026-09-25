import type { Wave } from "../wave-types.js";

/**
 * Act six, and it opens with a rock that will not hold its lane.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-5.ts`
 * reached the 250-line limit the day THE VEER was written, exactly as
 * `act-4.ts`, `act-3.ts` and `act-2.ts` did before it, so this is where new
 * waves land now.
 */
/**
 * **THE VEER, in three figures**, and what has to bite is the one habit every
 * rock so far has rewarded: *say the column once, put the shield there, stop
 * looking*. Five speed tiers, a torch, a volley and a carom have all been
 * answered that way — the number a pilot reads off the strip has never gone
 * stale before it landed. This rock's number expires every three rows, and it
 * goes on expiring right down to the row the shield answers at.
 *
 * The split is the sharp end of it. A rock is the pilot's on the radar and the
 * navigator's on the field, so the seat that can see which way the next step
 * goes is the seat that cannot move the shield an inch. Everything the pair
 * does here has to cross the room twice: a side, then a column.
 *
 * 1. Beat 0, one alone, dead centre. Nothing else on the field for eighteen
 *    beats, so the pair can spend the whole fall discovering that it steps at
 *    all, that it steps every third row and never stops, and that only one of
 *    them is being told which way. It reaches the ship if they give up on it,
 *    and it costs exactly what a rock costs.
 * 2. Beats 18–20, a veer and an ordinary slick beside it. This is the wave:
 *    the pilot is reading an arrow and calling sides while the cannon is
 *    wanted in another lane, and the thumb on GUARD is the same thumb.
 * 3. Beats 34–38, two veers with a plain rock between them. Three things the
 *    shield owes and only one of them stays where it was put — which is where
 *    "call it every time it re-aims" stops being advice and becomes the only
 *    way through.
 *
 * A veer entry names its kind and no colour, the way every rock does: nothing
 * about it can be shot, so there is nothing on the arrival to author.
 */
/**
 * **THE STRAND, in three threads**, and the habit it has to break is the one
 * every aim target so far has rewarded: *look at your own screen and act on
 * what is there*. A slick is a colour and a column on both phones. A veil
 * hides one fact from one seat, a wisp hides a body from one seat, a dart
 * hides a side — and in every one of them the seat that can see is the seat
 * that speaks, while the other simply does as it is told.
 *
 * Here neither of them can do anything alone. The navigator is shown which
 * bead is lit and no colours at all; the pilot is shown the colours and no
 * mark. So the sentence is two halves in two mouths — *third from the left*
 * against *that one is cyan* — and it has to be said again for every bead,
 * because the lit end is rolled again after every one of them.
 *
 * 1. Beat 0, a thread of two, dead centre and alone. Two beads is one exchange
 *    and then the last one, which is the smallest version of the creature
 *    there is: enough to discover that only one of them answers, and short
 *    enough that discovering it costs nothing.
 * 2. Beats 18-22, a thread of three with an ordinary slick beside it. This is
 *    the wave. The slick is what a strand is defined *against* — a body either
 *    of them could have answered without saying a word — and it is on the
 *    field while the pair spends three exchanges on the thread.
 * 3. Beats 36-40, a thread of five and a plain rock. Five beads is five
 *    exchanges under one fall, and the rock is the shield's, which is the
 *    other thumb on the other phone.
 *
 * A strand entry names its kind, one colour and a length. The colour is the
 * **leftmost** bead's and every other one alternates from it along the thread.
 * Which end has to be shot is not authored at all: it is rolled when the
 * thread arrives and rolled again after every bead, which is the one thing
 * about this creature nobody may compose against — and the reason a raisin
 * tells neither seat what is coming (`lightStrandEnd`).
 */
/**
 * **THE CRAWLER, in three worms**, and the habit it has to break is older than
 * any creature in the bestiary: *the field comes to you*. Every arrival since
 * the first slick has fallen out of the top of the screen at the ship, and
 * everything the pair has learned is a way of meeting one — a column held, a
 * colour loaded, a trigger on the beat. Nothing has ever had to be *chased*.
 *
 * A crawler is already landed. It cannot hurt the hull while it walks and
 * doing nothing about it is the only way to lose to it, which is the exact
 * inversion of every wave before this one.
 *
 * The other half is that it is the first body **both controls have to take
 * apart together**. The order along it is red, cyan, plate and round again,
 * and it is in plain sight on both screens from the moment the head comes over
 * the wall — so what the pair has to say is not a secret, it is a *plan*: who
 * has the next link, and therefore which of them is about to be holding a
 * column and which a trigger.
 *
 * 1. Beat 0, three segments off the left wall, alone. Three is one full turn
 *    of the cycle: red, cyan, plate, and then the two ends and the beam. The
 *    smallest worm at which the pair meets every answer this creature has, and
 *    short enough that meeting them the wrong way round costs nothing.
 * 2. Beat 24, five off the right, with a slick beside it. This is the wave. A
 *    slick is what a crawler is defined *against* — a body that falls, that
 *    threatens the hull, and that has to be answered *now* — and it is on the
 *    field while the pair is halfway down a worm's back.
 * 3. Beat 48, seven off the left, with a plain rock. The longest body the field
 *    holds, and the rock is the other thumb on the other phone: the shield is
 *    already owed to two plates on the worm when a rock arrives wanting it.
 *
 * A crawler entry names its kind, no colour and a length. The colour is not
 * authored at all — the order along the body is a rule (`segmentColor`) — and
 * the side is written out here rather than left to the column, so the wave
 * reads as what it is on the page.
 */
export const WAVES_ACT_6: Wave[] = [
  {
    id: "theVeer",
    name: "THE VEER",
    guide: {
      both: "A rock with a rider on it. Every third row it steps to one side, and it never stops.\nThe last step lands one row above the ship.\nYou cannot shoot any of it. What lands is still a rock. Put the shield under it.",
      p1: "1. Only you see the arrow over its hat. It aims again every three rows.\n2. Say the side out loud every single time.\n3. Keep your thumb on SHIELD. Saying it does not stop it.",
      p2: "1. You see where it is, not where it is going.\n2. Move the shield on what you are told, not on what you see.\n3. Never park it. Every three rows, what you last heard stops being true.",
      scene: "theVeer",
    },
    entries: [
      { beat: 0, col: 3, kind: "veer", color: null },
      { beat: 18, col: 5, kind: "veer", color: null },
      { beat: 34, col: 2, kind: "veer", color: null },
      { beat: 38, col: 6, kind: "veer", color: null },
    ],
  },
  {
    id: "theStrand",
    name: "THE STRAND",
    guide: {
      both: "Beads on one thread, red and cyan in turn. It comes apart from the ends inward.\nOnly one bead at a time takes a shot. A shot at any other brings a dead one back to life.",
      p1: "1. You see the colours, not which bead is lit.\n2. Wait to hear which one. Put the cannon under it.\n3. Say its colour out loud before the trigger comes.",
      p2: "1. You see which bead is lit, but no colour. It jumps ends.\n2. Count it from the left and say the number every time.\n3. Then load what you are told, not what you guess.",
      scene: "theStrand",
    },
    entries: [
      { beat: 0, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 36, col: 1, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theCrawler",
    name: "THE CRAWLER",
    guide: {
      both: "A maggot that walks along the ship instead of falling on it. It cannot hurt you while it walks.\nIt must not reach the far wall. Every ring has to come off.\nA crosshair marks each ring. A shield above a ring means the shield takes it: head, tail and every third segment.",
      p1: "1. Take the cannon under a colour ring. Say which colour you are under.\n2. The shield rings are not yours to shoot. The shield trigger is.\n3. Keep a thumb on SHIELD. Press when you hear the shield is under one.",
      p2: "1. Load what you are told and fire straight up.\n2. When the next ring shows the shield mark, take the shield under it yourself.\n3. Say when you are there. You cannot trigger it, and they cannot move it.",
      scene: "theCrawler",
    },
    entries: [
      { beat: 0, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 24, col: 6, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 48, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
    ],
  },
  {
    id: "theFence",
    name: "THE FENCE",
    guide: {
      both: "A live wire right across the field, twice as fast as anything else. The trigger does nothing to it. Where the wire is broken, the ship lives.",
      p1: "Only your screen shows where it is open. Every wall in this wave is open in the middle.",
      p2: "Your wire looks whole. The shield is already in the middle, and you never move it here.",
      scene: "theFence",
    },
    entries: [
      { beat: 0, col: 3, kind: "fence", color: null },
      { beat: 12, col: 3, kind: "fence", color: null },
      { beat: 24, col: 3, kind: "fence", color: null },
    ],
  },
  {
    id: "theGap",
    name: "THE GAP",
    guide: {
      both: "The same wall, opening somewhere else every time. Only Player 1 sees where. Only Player 2 can move the shield.",
      p1: "Count the gap from the left and say the number early. SHIELD does nothing here.",
      p2: "1. Ask. Then move into the column you hear, before it lands.\n2. In the gap, the current stops reaching the shield.",
      scene: "theGap",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null },
      { beat: 12, col: 1, kind: "fence", color: null },
      { beat: 26, col: 6, kind: "fence", color: null },
      { beat: 40, col: 0, kind: "fence", color: null },
      { beat: 56, col: 3, kind: "fence", color: null },
    ],
  },
  {
    id: "theCut",
    name: "THE CUT",
    guide: {
      both: "A wall with no way through at all, and one crack in it. A shot opens the crack. Nothing else opens anything.",
      p1: "1. Only your screen shows the crack.\n2. Say its column and its colour.\n3. Take the cannon under it.",
      p2: "1. Load the colour you are told. Fire straight up.\n2. Then take the shield to the hole you both just made.",
      scene: "theCut",
    },
    entries: [
      { beat: 0, col: 3, kind: "fence", color: null, gaps: [], cracksRed: [3] },
      { beat: 16, col: 3, kind: "fence", color: null, gaps: [], cracksCyan: [5] },
      { beat: 32, col: 3, kind: "fence", color: null, gaps: [], cracksRed: [1] },
      { beat: 48, col: 3, kind: "fence", color: null, gaps: [], cracksCyan: [4] },
    ],
  },
];
