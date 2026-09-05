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
 * stale before it landed. This rock's number expires three times.
 *
 * The split is the sharp end of it. A rock is the pilot's on the radar and the
 * navigator's on the field, so the seat that can see which way the next step
 * goes is the seat that cannot move the shield an inch. Everything the pair
 * does here has to cross the room twice: a side, then a column.
 *
 * 1. Beat 0, one alone, dead centre. Nothing else on the field for eighteen
 *    beats, so the pair can spend the whole fall discovering that it steps at
 *    all, that it steps at the same three rows every time, and that only one
 *    of them is being told which way. It reaches the ship if they give up on
 *    it, and it costs exactly what a rock costs.
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
    sentence: "The one where parking the shield under it is what loses it.",
    guide: {
      both: "A rock with a rider on it. Three times on the way down it steps one lane to the side — the same three rows every fall, and nothing about it can be shot. What lands is still a rock, and still wants the shield.",
      p1: "You are the only one who sees the arrow over its hat, and it points three rows before it moves. Say the side out loud every single time it re-aims — and keep the thumb on GUARD, because saying it is not warding it.",
      p2: "You can see where it is, not where it is going. Move the shield on what you are told rather than on what you can see, and never park it early — count the rows it steps on and be one call behind, not one lane.",
    },
    entries: [
      { beat: 0, col: 3, kind: "veer", color: null },
      { beat: 18, col: 5, kind: "veer", color: null },
      { beat: 20, col: 1, color: "red" },
      { beat: 34, col: 2, kind: "veer", color: null },
      { beat: 36, col: 4, kind: "meteor", color: null },
      { beat: 38, col: 6, kind: "veer", color: null },
    ],
  },
  {
    id: "theStrand",
    name: "THE STRAND",
    sentence: "The one where firing on what you can see is what puts a body back.",
    guide: {
      both: "Beads on one thread, alternating red and cyan. It comes apart from its ends inward, and only one bead can be shot at a time — a shot at any other swells a dead one back to life.",
      p1: "You can see the colours and not which bead is lit. Wait to be told which one, put the cannon under it, and say its colour out loud before the trigger comes.",
      p2: "You can see which bead is lit and no colour at all, and it jumps ends. Count it from the left and say the number every time — then load what you are told, not what you guess.",
    },
    entries: [
      { beat: 0, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 1, kind: "strand", color: "cyan", beads: 3 },
      { beat: 22, col: 6, color: "red" },
      { beat: 36, col: 1, kind: "strand", color: "red", beads: 5 },
      { beat: 40, col: 0, kind: "meteor", color: null },
    ],
  },
  {
    id: "theCrawler",
    name: "THE CRAWLER",
    sentence: "The one where nothing is falling and standing still is what loses it.",
    guide: {
      both: "A maggot that walks along the ship instead of falling on it. It cannot hurt you while it walks — but it must not reach the far wall. Every ring comes off. A crosshair marks each one; the ones with the shield above them are the dome's, and that is the head, the tail and every third segment.",
      p1: "Take the cannon under a colour ring and say which colour you are standing under. The plates are not yours to shoot and the trigger is — so keep a thumb on GUARD and press when you are told the shield is under one.",
      p2: "Load what you are told and fire straight up. When the next ring wears the shield mark, take the dome under it yourself and say when you are there — you cannot fire it, and they cannot move it.",
    },
    entries: [
      { beat: 0, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 24, col: 6, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 48, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 54, col: 5, kind: "meteor", color: null },
    ],
  },
];
