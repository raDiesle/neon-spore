import type { GuideScene } from "../scene-types.js";

/**
 * THE THROAT's rehearsal: the goal, what it takes, and what feeds it.
 *
 * Rewritten 25 September 2026, when the owner played it and could not say
 * what the fight was for: *should I suck in the gum or not? should I shoot the
 * enemy or let it be sucked in?* The old film answered neither. It never said
 * that gums are the win, and the one body it let the mouth swallow was a rock
 * taken **before** any ring was slack, so the swallow healed nothing and the
 * cost of leaving a body alone was never on screen. `ONE RING SLACK · IT
 * SLIDES` read as *a ring you can slide*. So the film is now, in order: the
 * goal, whose screen has the count, a body shot out of the mouth, a gum flung
 * into it, and then the same mouth swallowing a rock and a ring coming back.
 *
 * The mouth stands still in the middle column (`throatHomeCol`) and inhales
 * every six beats from beat 0. A red creature falls down the mouth's own
 * column and stops at its row on beat 6, and player 2 shoots it before the
 * inhale at beat 12 — the shot leaves at tick 630. The gum arrives at beat 12
 * in the leftmost column, on row five at beat 18, and a hand on it is the
 * fling and not a brake, so the drag runs from tick 1020 to the beat at 1080
 * with the hand still down (`carryGrips` settles a carry on the beat,
 * `gumSwiped` flies it along the row it is on). From column 0 it flies to 3
 * for one whole beat and chokes crossing the mouth on beat 19.
 *
 * It falls in the leftmost column and not next to the mouth, because the
 * sweep is three columns a beat and one flung from three columns away chokes
 * on the beat it is flung — the flight would never be seen.
 *
 * One ring slack puts the mouth in `slide` from beat 19: a column a beat,
 * turning at the walls, inhaling every six beats from there. On beat 31, an
 * inhale beat, it is sliding back through authored column 2 (field column 3
 * of the film's eleven), and a rock dropped down that column at beat 25 lands
 * on the mouth's row that same beat and is swallowed: slack goes back to 0 and
 * the ring is tight again. The rock is above the mouth's row for every beat
 * the mouth crosses its column on the way, so nothing holds it early. A rock and not a creature, because a
 * shot does not answer a rock (`isWardable`) — the page is about what the
 * mouth does with a body nobody took away, not about a trigger nobody pulled.
 *
 * Every page but the shot's and the swipe's is anchored on the boss itself
 * (`render/caption-anchor-boss-e.ts`): `mouths` for a body stopped in it,
 * `ring` for the lowest ring still holding, `tally` for NEXT INHALE — which
 * is the navigator's alone, so it is no ring on the pilot's screen — and the
 * gullet whole for the goal and the heal.
 */
export const THE_THROAT: GuideScene = {
  ticks: 2100,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 1, col: 3, color: "red" },
    { beat: 12, col: 0, kind: "gum", color: null },
    { beat: 25, col: 2, kind: "meteor", color: null },
  ],
  boss: { kind: "throat" },
  acts: [
    { tick: 630, control: "fireRed" },
    { tick: 990, grip: 1, col: 0, until: 1140 },
    { tick: 1020, drag: "gripBody", dir: 1, by: 1080, until: 1140 },
  ],
  steps: [
    { tick: 0, seat: 1, text: "GOAL · 5 GUMS IN ITS MOUTH", anchor: { at: "boss" } },
    {
      tick: 180,
      seat: 2,
      text: "PLAYER 2 SEES NEXT INHALE",
      anchor: { at: "boss", part: "tally" },
    },
    {
      tick: 360,
      seat: 1,
      text: "A BODY STOPS IN THE MOUTH",
      anchor: { at: "boss", part: "mouths" },
    },
    // Not `FIRE`, which the field writes on the mark itself
    // (`boss-cue-read-k.ts`): the page is the deadline, which the word cannot
    // say — the body is gone before the count reaches zero or it is eaten.
    {
      tick: 540,
      seat: 2,
      text: "SHOOT IT BEFORE THE INHALE",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 720, seat: 1, text: "ONLY A GUM HURTS IT", anchor: { at: "boss", part: "mouths" } },
    // The field says `FLING` on the beat the gum crosses the mouth's row and
    // never which way — so the page says the rule underneath it instead: the
    // swipe is a direction, and the row it leaves on is the line it flies
    // along (`gumSwiped`).
    { tick: 900, seat: 1, text: "IT FLIES THE WAY YOU SWIPE", anchor: { at: "held" } },
    {
      tick: 1200,
      seat: 2,
      text: "1 RING DOWN · MOUTH MOVES",
      anchor: { at: "boss", part: "ring" },
    },
    {
      tick: 1380,
      seat: 2,
      text: "PLAYER 2 SAYS THE COLUMN",
      anchor: { at: "boss", part: "tally" },
    },
    { tick: 1620, seat: 1, text: "IT EATS A BODY · RING HEALS", anchor: { at: "boss" } },
  ],
};
