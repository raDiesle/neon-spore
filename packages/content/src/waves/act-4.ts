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
 *
 * `THE RIND` left for `act-4b.ts` on 19 September 2026, at ten lines under
 * the ceiling rather than over it — the queue entry that found it would
 * rather pay the split once, deliberately, than let the next `scene:` line
 * pay for it in shaved sentences the way `act-3.ts` did.
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
 * arrangement with a field left out: a wisp carries no colour at all — the
 * last body on the field that does — and either shot kills one. The authored column is only where
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
export const WAVES_ACT_4: Wave[] = [
  {
    id: "theWisp",
    name: "THE WISP",
    guide: {
      both: "One of you cannot see it at all. It never falls toward you. It jumps and lands somewhere else.\nSay where with the lettered grid under the field.",
      p1: "1. You never see it. Put the cannon on the square you are told.\n2. That square is where it goes next, not where it is. Be there early.\n3. The box moving over the grid is not it.",
      p2: "1. Only your screen has it. An arc shows its next square the moment it lands.\n2. Say that square at once. They have the whole wait to get there.\n3. Either colour kills it.",
      scene: "theWisp",
    },
    entries: [
      { beat: 0, col: 3, kind: "wisp", color: null },
      { beat: 14, col: 1, kind: "wisp", color: null },
      { beat: 28, col: 4, kind: "wisp", color: null },
    ],
  },
  {
    id: "theGhost",
    name: "THE GHOST",
    guide: {
      both: "Something is falling that only one of your screens draws. The other gets a band across the row it is in, and nothing at all about the column.",
      p1: "1. You never see it. Read the band for how long you have.\n2. Take the column you are told.\n3. Say the number back. Standing there shows you heard it.",
      p2: "1. Only you can see it, and you cannot move the cannon.\n2. Say the column as a digit, not “there”. Repeat it until they are under it.\n3. The last one crosses. Call where it is going.",
      scene: "theGhost",
    },
    entries: [
      { beat: 0, col: 2, kind: "ghost", color: "cyan" },
      { beat: 10, col: 1, kind: "ghost", color: "red" },
      { beat: 18, col: 1, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "snake",
    name: "SNAKE",
    guide: {
      both: "Shoot the enemies, swallow the points, never touch a meteor. Clear them all and the round is over. The longer the body gets, the more it asks of you.",
      p1: "1. Say where the next thing is, and whether to shoot or swallow it.\n2. FIRE when the head points at an enemy.\n3. Open the MAW before a point.\n4. Once the jaws stick, MAW is dead: drag them open on the head.",
      p2: "1. Steer on their word only: LEFT or RIGHT is a quarter turn.\n2. Turn away from every meteor.\n3. Say when one is ahead: a shot stops dead on it.\n4. Long body: a thumb on the tail takes its last tiles off the board.",
      scene: "snake",
    },
    entries: [],
    boss: { kind: "snake", rounds: SNAKE_ROUNDS },
    bossType: "special",
    controls: "snake",
  },
  {
    id: "theEcho",
    name: "THE ECHO",
    guide: {
      both: "It falls at half speed and splits as it falls. The seam shows which way it splits.\nFirst sideways, then up and down. It stretches wide just before it splits.\nEach wait is longer than the last. A quiet one is not the end.",
      p1: "1. Get the cannon under it while it is still one.\n2. The fast bodies can wait a beat. This one cannot.\n3. Every beat you spend elsewhere means one more body to reach.",
      p2: "1. Fire on the beat they are under it, not the beat you are free.\n2. Once it splits, call each body by column and by row: top or bottom.\n3. Take them in that order.",
      scene: "theEcho",
    },
    entries: [
      { beat: 0, col: 3, kind: "echo", color: "cyan" },
      { beat: 12, col: 3, kind: "echo", color: "red" },
      { beat: 13, col: 6, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 20, col: 2, kind: "echo", color: "cyan" },
      { beat: 24, col: 4, kind: "echo", color: "red" },
    ],
  },
  {
    id: "pinball",
    name: "PINBALL",
    guide: {
      both: "Fire one ball up through the table and catch it under the cannon when it comes down. Only the amber pieces have to go.",
      p1: "1. Slide the cannon to where the shot should start.\n2. Press SET the moment your partner calls the angle.\n3. Get back under wherever the ball is coming down.",
      p2: "1. Talk your partner onto the angle while the needle sweeps.\n2. Wait until they have stopped it.\n3. Press FIRE when the bar fills to the strength you want.",
      scene: "pinball",
    },
    entries: [],
    boss: { kind: "pinball", rounds: PINBALL_ROUNDS },
    bossType: "special",
    controls: "pinball",
  },
];
