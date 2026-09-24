import type { GuideScene } from "../scene-types.js";

/**
 * THE STARE's rehearsal: two looks played right, and a thumb landing under
 * the third.
 *
 * An eye over the field turns towards one seat for seven beats, and only the
 * other seat is told which; then it looks, and the watched seat may press
 * nothing until it turns away (`sim/stare-step.ts`). The wave underneath is
 * ordinary — bodies and rocks answered the ordinary way — and what the boss
 * splits is the pair's hands, one look at a time.
 *
 * **What this film has to show is a thumb not landing**, and a rehearsal is a
 * thumb landing on a named control. So the film is shaped around what the
 * *other* seat does while one is frozen, and the frozen seat's page has no
 * act on it at all: the first look is on the pilot, who has parked the
 * cannon under the column the next body comes down, and the navigator fires
 * up it alone; the second is on the navigator, and the pilot guards a rock
 * with the dome alone. Each look is the mirror of the other, which is the
 * one-sentence lesson: the seat that is not watched plays on.
 *
 * **The seed picks the seats.** The eye rolls the seat from the seeded rng at
 * the top of each turn (`stare-step.ts`), so which look is whose is not
 * authored — `test/scene-stare.test.ts` holds this seed to the pilot
 * first and the navigator second, which is the order the pages are written
 * in.
 *
 * **The cost is last**, because a caught press breaks the hull and the hold
 * stops the world: with the eye still on the navigator, a body comes down
 * and the trigger is pressed anyway. The flash on that seat's panel and the
 * retries going up are the page. One page, as the rule allows.
 *
 * **Two pages came out on 18 September 2026**, when the fight learned to say
 * `STILL` on the watched seat's field the moment the look lands
 * (`render/boss-cue-read-d.ts`): `WATCHED · TOUCH NOTHING` at the first look
 * and `A BODY · STILL NOTHING` inside the second were the cue's own word and
 * nothing else, and each stood next to a page of its own seat, so the film
 * spares them. The page in the second tell was rewritten instead of cut — its
 * neighbours are the pilot's — to the one thing the cue may never say: that
 * the warning is on the other screen alone (`docs/spec/briefings.md`).
 */
export const THE_STARE: GuideScene = {
  ticks: 3360,
  bpm: 120,
  seed: 16,
  entries: [
    { beat: 2, col: 2, color: "red" },
    { beat: 5, col: 4, color: "cyan" },
    // Inside the first look, which is the pilot's: the navigator's alone.
    { beat: 20, col: 3, color: "cyan" },
    { beat: 29, col: 1, color: "red" },
    // A rock that reaches the hull inside the second look, which is the
    // navigator's: the pilot's alone.
    { beat: 34, col: 5, kind: "meteor", color: null },
    // And a body from the tell's last beat, for the thumb that should not
    // land: seven beats down by the time it does, in the middle of the screen.
    { beat: 45, col: 3, color: "cyan" },
  ],
  boss: { kind: "stare" },
  acts: [
    // The window: two bodies, played like any wave.
    { tick: 200, control: "cannon", col: 2 },
    { tick: 260, control: "fireRed" },
    { tick: 380, control: "cannon", col: 4 },
    { tick: 440, control: "fireCyan" },
    // The turn, towards the pilot: the cannon is parked under column 3, where
    // the body of the look comes down, and the pilot's hands come off.
    { tick: 900, control: "cannon", col: 3 },
    // The look: the navigator fires up the parked column.
    { tick: 1320, control: "fireCyan" },
    // The eye is away again.
    { tick: 1800, control: "cannon", col: 1 },
    { tick: 1860, control: "fireRed" },
    // The turn, towards the navigator: the dome is put under the rock.
    { tick: 2460, control: "shield", col: 5 },
    // The look: the rock lands on beat 47 and the pilot guards it alone.
    { tick: 2800, control: "guard" },
    // A body down the parked column, and the navigator's thumb lands anyway.
    { tick: 3120, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "AN EYE · TWELVE BEATS FREE", anchor: { at: "boss" } },
    {
      tick: 240,
      seat: 2,
      text: "PLAY IT LIKE ANY WAVE",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 720, seat: 2, text: "IT TURNS TO THEM · SAY SO", anchor: { at: "boss" } },
    {
      tick: 960,
      seat: 1,
      text: "SEVEN BEATS · PARK UNDER 3",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1320,
      seat: 2,
      text: "THEY FREEZE · YOU FIRE",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 1620, seat: 1, text: "IT LOOKS AWAY · PLAY ON", anchor: { at: "boss" } },
    { tick: 2340, seat: 1, text: "NOW IT CHOSE THEM · SAY IT", anchor: { at: "boss" } },
    {
      tick: 2580,
      seat: 2,
      text: "NO WARNING HERE · ONLY THERE",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 2760,
      seat: 1,
      text: "THEY FREEZE · YOUR SHIELD",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 3120, seat: 2, text: "TOUCHED · THE HULL PAYS", anchor: { at: "retries" } },
  ],
};
