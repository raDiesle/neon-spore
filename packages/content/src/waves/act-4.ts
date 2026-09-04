import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Act four, and it opens with the creature that filled act three.
 *
 * The acts are not a design unit — `waves.ts` says so at length: they exist
 * because a list that grows a dozen lines a wave has to be cut somewhere, and
 * a chapter of the game is the least arbitrary place to cut it. `act-3.ts`
 * reached the 250-line limit the day THE WISP was written, exactly as
 * `act-2.ts` did before it. This one filled in its own turn the day THE GYRE
 * was written; `act-5.ts` is where new waves land now.
 */
/**
 * **THE WISP, in three figures.** Here for the reason the two blocks above
 * are: the director rewrites the array and keeps only what stands over it.
 *
 * What has to bite is not finding the thing — player 2 can see it perfectly
 * well — but the *length of the sentence*. Two beats is 1.25 s, under what a
 * full spoken exchange takes (docs/spec/latency.md), so a pair who describe
 * the tile will never once be in time and a pair who name it will. The wave
 * has to make them find that out, and then make it cost something.
 *
 * 1. Beats 0–10, the shorthand. One wisp on an empty field, and nothing
 *    arriving to punish a slow first attempt. It cannot reach the ship and it
 *    will not leave, so the pair may spend as many hops as they need working
 *    out that "E nine" is the whole call — and the first real body only comes
 *    in once they have.
 * 2. Beat 14, the second one. Two wisps hop on the *same* beat, because the
 *    dwell is read off the shared clock rather than a phase of each body's own
 *    — so the count serves both and what has to be said is two squares on one
 *    number, not two of each. That is where "which one" becomes a word the
 *    pair has to have already agreed on.
 * 3. Beats 20–30, the squeeze. A red body, a rock, and a third wisp. The rock
 *    is the point: the shield's column is player 2's hand and its trigger is
 *    player 1's, so both of them are already saying something else on the beat
 *    a tile expires. Every hop spent re-asking is a hop of the run either side
 *    of it.
 *
 * A wisp entry names its kind and no colour, and that is not the veil's
 * arrangement with a field left out: a wisp carries no colour at all, the way
 * a throb does, and either shot kills one. The authored column is only where
 * it materialises — the first hop is two beats later and owes it nothing.
 */
/**
 * **THE GHOST, in three figures.** Here for the reason the block above is:
 * the director rewrites the array and keeps only what stands over it, so a
 * note written between two entries is a note that survives until the next
 * time somebody saves a wave in the editor.
 *
 * What has to bite is neither the colour nor the timing — player 2 can see
 * both — but the *handover*. The number is worth nothing until the cannon is
 * standing on it, and the cannon belongs to the one player who cannot check.
 *
 * 1. Beats 0–5, the number. One ghost alone, then a real red slick across the
 *    field. The whole descent is available, so the pair finds the sentence —
 *    a column said as a digit and said back — with nothing pressing them; and
 *    the second arrival is there so that *which one am I standing under* is
 *    already a question the first time it is asked.
 * 2. Beats 10–12, the two of them. A ghost and an ordinary body four columns
 *    apart. Player 1 can see one of them, and the one they can see is the one
 *    that is wrong to stand under — the beat where believing the partner over
 *    your own eyes stops being advice.
 * 3. Beats 18–26, the crossing one. The path that does not hold still: it
 *    prowls a row, turns at each wall, and on the third turn it comes down
 *    head first at the ship. A rock lands in the middle of it, because the
 *    shield's column is player 2's hand and the trigger is player 1's — so
 *    the pair is already talking about something else while a number they
 *    agreed on is going stale one lane a beat.
 *
 * A ghost entry names its kind and its colour, the way a dart does: the
 * silhouette is the ghost's and the colour is which trigger answers it.
 * `path: "across"` is the only other thing it can say, and absent means it
 * falls.
 */
/**
 * **THE ECHO, in three figures.** Here for the reason the two blocks above
 * are: the director rewrites the array and keeps only what stands over it.
 *
 * Nothing is hidden in this one, which makes it the odd wave out on this page
 * — both screens draw every body whole, the seam on each one says which way it
 * is about to part, and neither player is missing a colour, a column or a
 * beat. What has to be said out loud is an *order*, and the wave exists to
 * make the obvious order the wrong one: an echo falls at half speed, so it is
 * always the thing it is reasonable to leave, and leaving it is what turns one
 * shot into eight.
 *
 * 1. Beats 0–10, the dividing. One echo on an empty field, with the whole
 *    descent available. The pair is meant to watch it strain, part, and then
 *    wait *longer* before parting again — there is nothing else to shoot and
 *    no cost to being slow — because a creature nobody has seen come apart
 *    twice is a creature they will not believe is worth interrupting each
 *    other over. Three beats is also just short of a spoken exchange, so the
 *    first thing they learn is that describing it does not fit.
 * 2. Beats 12–14, the choice. An echo and two ordinary bodies within two beats
 *    of each other. The ordinary ones reach the hull first and look like the
 *    emergency; the echo is four bodies by the time they are dealt with. This
 *    is the whole wave, and both seats have to agree out loud to get it wrong
 *    or right together.
 * 3. Beats 20–24, the squeeze. Two echoes in opposite colours with a rock
 *    between them, so the shield's column is player 2's hand and its trigger
 *    is player 1's while two knots are opening on the field. This is the
 *    figure where the third division is on the table, and seeing it is the
 *    point: it is what being late looks like.
 *
 * An echo entry names its kind and its colour, the way a dart does: the
 * silhouette is the slick's or the bulb's, drawn small, and the colour is
 * which trigger answers it. Author it near the middle — the fan is two columns
 * either side before it is one, so an echo against a wall piles its last two
 * bodies into the same lane, which is one body as far as a spoken count goes.
 */
/**
 * **THE RIND, in three figures.** Here for the reason the blocks above are:
 * the director rewrites the array and keeps only what stands over it.
 *
 * Nothing is hidden in this one either, and what it takes from the pair is not
 * information but a *habit*. Every aim target before it is answered by one
 * call and one shot, so "landed" and "next" have become the same word. A rind
 * is three shots in one column, and the two in the middle are the ones nobody
 * fires unless somebody says so out loud.
 *
 * 1. Beats 0–6, the three shots. One rind on an empty field with the whole
 *    descent available. There is nothing else to shoot, so the pair is free to
 *    find out that the first hit did not kill it — and to watch it step down a
 *    size twice, which is the only read-out this creature has.
 * 2. Beats 8–12, the temptation. A rind, and then two ordinary bodies in other
 *    columns a few beats behind it. The small ones die to one shot each and
 *    look far more urgent; leaving the rind half-shed is how a pair loses the
 *    column they had already paid two shots for. This is the wave.
 * 3. Beats 18–21, the two colours. Two rinds in opposite colours with a rock
 *    between them: player 2 has to reload in the middle of six shots rather
 *    than fire six of one, and the shield's column is their hand while its
 *    trigger is player 1's — so both seats are already saying something else.
 *
 * A rind entry names its kind and its colour, the way an echo does: the
 * silhouette is the slick's or the bulb's, drawn one body's footprint per
 * layer it still wears, and the colour is which trigger answers it — three
 * times over, since a shed needs the same colour a kill does.
 */
export const WAVES_ACT_4: Wave[] = [
  {
    id: "theWisp",
    name: "THE WISP",
    sentence: "The one where you call the square it is still falling toward.",
    guide: {
      both: "One of you cannot see this one at all. It never comes down at you — it jumps, and lands somewhere else on the field, and the lettered grid under everything is how you say where.",
      p1: "You will not see it once. Take the letter, put the cannon on it and wait — the square you are told is where it is going, not where it is, so being there early is the whole game. The box hunting the grid is not it.",
      p2: "Only your screen has it, and the square it will jump to next is marked from the moment it lands, with the arc drawn to it. Say that square immediately — they have the whole dwell to get there. Either colour kills it.",
      scene: "theWisp",
    },
    entries: [
      { beat: 0, col: 3, kind: "wisp", color: null },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 14, col: 1, kind: "wisp", color: null },
      { beat: 20, col: 2, color: "red" },
      { beat: 22, col: 6, kind: "meteor", color: null },
      { beat: 28, col: 4, kind: "wisp", color: null },
      { beat: 30, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theGhost",
    name: "THE GHOST",
    sentence: "The one where waiting to see it is the miss.",
    guide: {
      both: "Something is falling that only one of your screens draws. The other gets a band across the row it is in, and nothing at all about the column.",
      p1: "You will never see it — read the band for how long you have, and take the column you are told. Say the number back: you standing there is the only proof it was heard.",
      p2: "You are the only one who can see it, and you cannot move the cannon. Say the column as a digit, not “there”, and say it again until they are under it. The last one crosses: call where it is going.",
      scene: "theGhost",
    },
    entries: [
      { beat: 0, col: 2, kind: "ghost", color: "cyan" },
      { beat: 5, col: 6, color: "red" },
      { beat: 10, col: 1, kind: "ghost", color: "red" },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 1, kind: "ghost", color: "cyan", path: "across" },
      { beat: 22, col: 4, kind: "meteor", color: null },
      { beat: 26, col: 6, color: "red" },
    ],
  },
  {
    id: "snake",
    name: "SNAKE",
    sentence: "The one where the ship is the body, and the one who can see it cannot steer it.",
    guide: {
      both: "The ship shrinks into a snake and it never stops. There are things to shoot, things to swallow, and meteors that can be neither — clearing the first two is the round. Touch anything you should not have, or take a point with the mouth shut, and it starts again.",
      p1: "You have FIRE and MAW and you cannot steer. Only your screen has the enemies and the points on it: say where the next one is and which of the two it is, then shoot it or open on it. A shot stops dead on a meteor.",
      p2: "You have both turns and you drive on their word alone — your screen has the body and the meteors, and nothing else. LEFT and RIGHT are a quarter turn each, from wherever it is already pointing.",
      scene: "snake",
    },
    entries: [],
    boss: { kind: "snake", rounds: SNAKE_ROUNDS },
    controls: "snake",
  },
  {
    id: "theEcho",
    name: "THE ECHO",
    sentence: "The one where the slowest thing on the field is the one to take first.",
    guide: {
      both: "Half speed down, and it comes apart while it falls. The seam across it says which way — sideways, then up and down — and it strains wide just before it goes. Each wait is longer than the last, so a quiet one is not a finished one.",
      p1: "Have the cannon on it while it is still one. The fast bodies can wait a beat — this cannot, and every wait you spend on something else is another body to visit.",
      p2: "Fire it the beat they are under it, not the beat you are free. Once it is a knot, call them by row as well as column — top or bottom — and take them in that order.",
      scene: "theEcho",
    },
    entries: [
      { beat: 0, col: 3, kind: "echo", color: "cyan" },
      { beat: 12, col: 3, kind: "echo", color: "red" },
      { beat: 13, col: 6, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 20, col: 2, kind: "echo", color: "cyan" },
      { beat: 22, col: 5, kind: "meteor", color: null },
      { beat: 24, col: 4, kind: "echo", color: "red" },
    ],
  },
  {
    id: "pinball",
    name: "PINBALL",
    sentence: "The one where the thing you fire from is the thing you have to catch it with.",
    guide: {
      both: "The ship folds into a bucket. One ball goes up out of it, comes down through the table, and the same bucket has to be under it when it lands — or the hull pays. Only the lit pieces have to go.",
      p1: "You hold the bucket and you stop the needle. Slide to where the shot should start, then SET the moment they have talked you onto the angle — and then get back under wherever the ball is coming down.",
      p2: "You fire, and only once they have stopped the needle. The sweep takes six seconds to cross, so talk them onto the angle rather than racing it — then the bar fills and empties, and FIRE is the strength you take off it.",
    },
    entries: [],
    boss: { kind: "pinball", rounds: PINBALL_ROUNDS },
    controls: "pinball",
  },
  {
    id: "theRind",
    name: "THE RIND",
    sentence: "The one where the shot that lands does not close the column.",
    guide: {
      both: "Three times the size of an ordinary body, and the matching colour only takes a layer off it. Three sizes, three shots — how big it is is how much is left of it.",
      p1: "Keep the cannon in its column until the thing is gone. Two of the three shots only make it smaller, and moving off after the first is how you pay for it twice.",
      p2: "The same colour, three times, and count the sizes down out loud — three, two, one — so both of you know which shot is the last one.",
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 3, kind: "rind", color: "red" },
      { beat: 8, col: 1, kind: "rind", color: "cyan" },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 12, col: 6, color: "red" },
      { beat: 18, col: 2, kind: "rind", color: "cyan" },
      { beat: 20, col: 4, kind: "meteor", color: null },
      { beat: 21, col: 5, kind: "rind", color: "red" },
    ],
  },
];
