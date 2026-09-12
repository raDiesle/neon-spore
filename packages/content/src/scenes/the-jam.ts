import type { GuideScene } from "../scene-types.js";

/**
 * THE JAM's rehearsal: the trigger is gone and the aim is all that is left.
 *
 * The cannon fires by itself on every beat, up whichever column the pilot is
 * standing in, alternating red and cyan — `malfunction` is authored on the film
 * the way it is authored on the wave, because a rehearsal played without one
 * would show a pair of controls that behave, which is the one thing this wave
 * is not.
 *
 * So the two pages that open it are the two halves of what has been taken away.
 * The pilot's says the gun is going off without them; the navigator's points at
 * a lobe that has stopped answering, and it is the only page in the film that
 * asks a seat to do nothing at all. Everything the navigator still has is in
 * their voice.
 *
 * Then the aim, and then the price of it. Standing in a column is a shot, so a
 * lure standing in the column the cannon has been left in is a shot into a
 * lure — the hull pays, and that page is the film's one page about the bar,
 * last, where it is the consequence of the three above it.
 */
export const THE_JAM: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  malfunction: { kind: "cannon", color: "alternating" },
  entries: [
    { beat: 0, col: 1, color: "red" },
    { beat: 10, col: 5, kind: "lure", color: "cyan" },
  ],
  acts: [
    { tick: 390, control: "cannon", col: 1 },
    { tick: 780, control: "cannon", col: 5 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "THE GUN FIRES BY ITSELF",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 240,
      seat: 2,
      text: "NO TRIGGER · COUNT ALOUD",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 480,
      seat: 1,
      text: "SLIDE ON WHEN IT IS RED",
      anchor: { at: "control", control: "cannon" },
    },
    { tick: 690, seat: 1, text: "A LURE SHOT LOSES THE WAVE", anchor: { at: "retries" } },
  ],
};
