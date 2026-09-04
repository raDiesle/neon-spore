import type { Wave } from "../wave-types.js";

/**
 * Act five, and it opens with a wheel.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-4.ts`
 * reached the 250-line limit the day THE GYRE was written, exactly as
 * `act-3.ts` and `act-2.ts` did before it, so this is where new waves land now.
 */
/**
 * **THE GYRE, in three figures.** Here for the reason every block above its
 * own array is: the director rewrites the array and keeps only what stands
 * over it.
 *
 * What has to bite is that every sentence the pair has learned so far expires.
 * A wheel carries a red and a cyan two columns apart and turns, so "red in
 * four" is a true statement with a shelf life of one beat — and the wheel gets
 * quicker the longer it is up. The wave has to let them find that out, then
 * show them the one thing that answers it, then charge them for being slow.
 *
 * 1. Beat 0, the wheel alone. Nothing else on the field for twelve beats, so
 *    a pair may spend as many misses as they need discovering that a column
 *    called on one beat is empty on the next. It cannot reach the ship yet —
 *    the diamond has three laps to sink first — so the cost of a slow start is
 *    only that the rim is faster when they work it out.
 * 2. Beats 12–20, the ordinary bodies. Two slicks and a bulb in their own
 *    lanes, at the moment the wheel is quick enough to need the maw. They are
 *    there to be the thing the pilot is *not* doing while they hold the pull:
 *    the maw is free of the column, but the thumb is not, and a wave with
 *    nothing else in it would never say so.
 * 3. Beat 26, a rock. It arrives about when a wheel left alone starts
 *    grinding, so the pair is choosing between the shield's column and the
 *    wheel's beat with the hull already going down. That is the wave.
 *
 * **THE LID, in three figures**, and the same shape of argument. What has
 * to bite is that a lid is not a thing you do and then a thing they do: the
 * pull and the shot have to be the same instant, and the pilot's thumb is off
 * the cannon strip for the whole of it.
 *
 * 1. Beat 0, one lid alone, dead centre. Nothing else on the field, so the
 *    pair can spend the whole fall discovering that the plates follow the hand
 *    and shut when it lifts. A lid left alone reaches the ship like any other
 *    body, so a slow start costs the hull rather than nothing at all.
 * 2. Beats 14–16, a lid off to one side and an ordinary bulb the other. This
 *    is the wave: the cannon has to be under the lid *before* the cord is
 *    taken, and the bulb is the column the pilot is not in while they hold it.
 *    The pair either agree an order out loud or lose one of the two.
 * 3. Beats 24–26, the same pairing tightened by two beats, so the second body
 *    is on the field while the first lid is still open. What was a decision at
 *    16 is a sentence with a deadline on it here.
 *
 * **THE RECOIL, in three figures**, and the argument is THE RIND's turned
 * over. A rind costs the pair a *repeat* — the same colour, the same column,
 * twice more — so a pair who learn it learn patience. A recoil costs them the
 * sentence itself: the shot that lands is what makes the column wrong, the
 * colour wrong and the row wrong, all at once and all on the same beat.
 *
 * 1. Beat 0, one alone. Nothing else on the field for a dozen beats, so the
 *    pair can spend the whole descent discovering that their own hit is what
 *    moved it — and that the cage is one bounce more broken each time, which
 *    is the only count either of them gets. It still reaches the ship if they
 *    give up on it, so a slow start costs the hull rather than nothing.
 * 2. Beats 14–16, the recoil and an ordinary body. This is the wave: the
 *    bounce puts the cannon in the wrong lane at the moment there is a second
 *    lane that wants it, so the pair either agree out loud which one they are
 *    finishing or lose both.
 * 3. Beats 24–28, two of them in opposite colours with a rock between. Both
 *    turn over on every hit, so the two calls swap colours independently while
 *    the shield's column is already spoken for — which is where "say it again"
 *    stops being an instruction and becomes the only way through.
 *
 * A recoil entry names its kind and its colour, the way a rind does: the
 * colour is which trigger answers it *first*, and every bounce turns it over
 * from there.
 *
 * **THE CAROM, in three figures**, and what has to bite is that finishing a
 * body is no longer the end of it. Everything up to here has been answered by
 * one control or the other — the cannon for a body, the shield for a rock —
 * and the pair has learned to hand an arrival to whichever of them owns it. A
 * carom is owned by both, in order, and the shot that "kills" it is what hands
 * it over. A pair who celebrate the crack lose the ship to what falls out.
 *
 * 1. Beat 0, one alone, entered against the left wall so its first crossing is
 *    the long one. Nothing else on the field for a dozen beats, so the pair can
 *    spend the whole flight discovering that the trigger does nothing while the
 *    crust is on, that it turns at the wall, and that cracking it is only half.
 *    It reaches the ship if they give up, and it costs what a rock costs.
 * 2. Beats 12–16, a carom the other way about with an ordinary bulb under it.
 *    This is the wave: the bulb is the column player 1 is *not* in while they
 *    are chasing a ball across four lanes a beat, and the ward is a thumb they
 *    have to keep free for a rock that does not exist yet.
 * 3. Beats 24–28, two caroms in opposite colours crossing each other. Both need
 *    the cannon first and the shield second, and the two rocks come down a beat
 *    apart in two columns — which is where "say which one we are finishing"
 *    stops being advice and becomes the only way through.
 *
 * A carom entry names its kind and its colour, the way a clasp does: the
 * silhouette is the crust's and the colour is the body sealed inside it, which
 * is which cannon opens it.
 */
/**
 * **THE VOLLEY, in three figures**, and it is THE CAROM's argument read
 * backwards. There the shot that finished a body handed it to the shield; here
 * the ward that answers one hands it straight back, three times, and only then
 * to the cannon. What has to bite is the reflex every warded thing in the game
 * has taught so far — *ward it and stop looking at it*. A pair who lift the
 * thumb after a ward that worked lose the ship to the same body.
 *
 * 1. Beat 0, one alone, entered against the left wall so its first diagonal is
 *    the long one. Nothing else on the field for twenty beats, so the pair can
 *    spend the whole rally discovering that a ward sends it back rather than
 *    away, that a plate comes off each time, and that the column they agreed on
 *    is worthless by the time it comes down. It reaches the ship if they give
 *    up on it, and it costs what a rock costs.
 * 2. Beats 20–24, an ordinary bulb under a second volley. This is the wave:
 *    the cannon is wanted in one lane by a body that dies to one shot while
 *    the shield is wanted in another by a body that does not die at all, and
 *    the first volley is bursting open somewhere above both of them.
 * 3. Beats 40–42, a rock and a third volley. The rock takes exactly one ward
 *    and the volley takes three, so the pair has to say which of the two the
 *    shield is going to be under on each beat — and being wrong once about
 *    that is the only mistake in this wave that cannot be taken back.
 *
 * A volley entry names its kind and its colour, the way a carom does: the
 * silhouette is the shell's and the colour is the body sealed inside it, which
 * is which cannon finishes it once the shield has run out of things to do.
 */
export const WAVES_ACT_5: Wave[] = [
  {
    id: "theGyre",
    name: "THE GYRE",
    sentence: "The one where the column you were told is the right one for a single beat.",
    guide: {
      both: "Six bodies bolted round a turning wheel, red and cyan alternating. It stops falling in the middle of the field, walks a diamond there, and turns faster the longer it is up — sinking a row each lap until it grinds along the ship.",
      p1: "SUCK slows the wheel for four beats and does not care where you are standing. Spend it on the beat you have both agreed to fire on, then be in the column — not the other way round.",
      p2: "Do not call where a body is, call where it will be. One position round the rim per beat, and the colour two along is the other one — so say the colour and the beat together, or it has turned by the time they hear it.",
      scene: "theGyre",
    },
    entries: [
      { beat: 0, col: 3, kind: "gyre", color: null },
      { beat: 12, col: 0, color: "red" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 20, col: 1, color: "red" },
      { beat: 26, col: 5, kind: "meteor", color: null },
    ],
  },
  {
    id: "theLid",
    name: "THE LID",
    sentence: "The one where doing your half first is the same as not doing it.",
    guide: {
      both: "An armoured eye with a cord hanging off it. The plates over the lens part while the cord is pulled aside and shut the moment it is let go — and only while they stand fully apart does the lens's own colour land.",
      p1: "Put the cannon in its column BEFORE you take the cord. Both your thumbs are spoken for once you have hold of it, and the plates close the instant you let go.",
      p2: "Load the colour you can see in the seam and then wait. Count them in out loud: the shot has to leave while the plates are open, not after.",
      scene: "theLid",
    },
    entries: [
      { beat: 0, col: 3, kind: "lid", color: "cyan" },
      { beat: 14, col: 1, kind: "lid", color: "red" },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 24, col: 5, kind: "lid", color: "red" },
      { beat: 26, col: 2, color: "red" },
    ],
  },
  {
    id: "theRecoil",
    name: "THE RECOIL",
    sentence: "The one where your own shot is what makes the call wrong.",
    guide: {
      both: "A slick or a bulb in a sprung cage. The matching colour throws it two rows back up the field and a lane to one side instead of killing it, and the body inside turns over to the other colour on the way. Three times: the cage loses a rib on each of the first two, and the third blows the whole frame off — what falls the rest of the way is a plain body, and the next shot kills it.",
      p1: "Do not slide off the column when it lands. It bounces a lane left or right and nothing tells you which, so watch where it comes down and get back under it before it starts falling again.",
      p2: "The colour flips every time one of yours lands. Say the new one out loud before you reload — the trigger you are holding stopped working on your own hit.",
      scene: "theRecoil",
    },
    entries: [
      { beat: 0, col: 3, kind: "recoil", color: "red" },
      { beat: 14, col: 1, kind: "recoil", color: "cyan" },
      { beat: 16, col: 5, color: "red" },
      { beat: 24, col: 0, kind: "recoil", color: "red" },
      { beat: 26, col: 3, kind: "meteor", color: null },
      { beat: 28, col: 6, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theCarom",
    name: "THE CAROM",
    sentence: "The one where the shot that finishes it is what starts the other half.",
    guide: {
      both: "A slick or a bulb sealed in a rock crust, thrown in on a diagonal and bouncing off the side walls. The shield cannot touch it while the crust is on. The matching cannon cracks it open — and what drops out is a plain meteor, coming down at a row a beat, that now has to be warded.",
      p1: "Do not chase it. It crosses four lanes a beat and turns at the wall, so stand where it is going and wait — and keep a thumb on GUARD, because your own shot is what makes the rock.",
      p2: "Call the wall, not the body: say which side it turns at and on what beat. Then load the colour burning through the shell, and be on the column the moment it cracks.",
    },
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "red" },
      { beat: 12, col: 6, kind: "carom", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 24, col: 1, kind: "carom", color: "cyan" },
      { beat: 28, col: 5, kind: "carom", color: "red" },
    ],
  },
  {
    id: "theVolley",
    name: "THE VOLLEY",
    sentence: "The one where a ward that works is not a body that is gone.",
    guide: {
      both: "A rock on a diagonal with a body sealed inside it. The shield does not destroy it — a ward hits it back up the field and knocks one plate of shell off on the way, and it comes down again from higher up. Three wards, and the shell bursts open in mid-air over a plain slick or bulb the cannon has to finish.",
      p1: "Do not lift your thumb off GUARD when it works. That was one of three, and it is already on its way back — then the third one hands it to you, so get under it while it is still falling.",
      p2: "The lane you called dies the moment the ward lands. Say where it will come down, not where it is, and slide the shield there again — and load the colour you can see through the seams before the last plate goes.",
    },
    entries: [
      { beat: 0, col: 0, kind: "volley", color: "red" },
      { beat: 20, col: 4, color: "cyan" },
      { beat: 24, col: 6, kind: "volley", color: "cyan" },
      { beat: 40, col: 2, kind: "meteor", color: null },
      { beat: 42, col: 5, kind: "volley", color: "red" },
    ],
  },
];
