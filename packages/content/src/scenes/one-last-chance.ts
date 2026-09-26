import type { GuideScene } from "../scene-types.js";

/**
 * ONE LAST CHANCE's rehearsal: the shield saves the hull from a creature once,
 * and only the cannon kills it.
 *
 * The owner asked for this wave and its guide on 25 September 2026, the day
 * the push landed (`sim/shield-push.ts`). Every wave before it met the shield
 * over a rock, and a rock answered is a rock gone; a slick answered the same
 * way climbs three rows a beat for three beats and comes down again carrying
 * ONE LAST CHANCE. The reflex this film has to break is *the shield fixed it*.
 *
 * **One slick and nothing else**, down the middle column, where the cannon and
 * the plate both rest before anybody has moved them (`midCol`): no page spends
 * its time on a carry that is not the lesson.
 *
 * **Three pages, and all of them are a seat's.** The red rim is on both
 * screens, but what each screen does next is different, so no page is shared:
 * player 1's thumb makes the push, player 1 reads what it cost, and player 2's
 * shot is the whole of the answer.
 *
 * **The trigger is late on purpose**, a third of a beat before the body meets
 * the dome, which is `THE_VOLLEY`'s timing and is what a thumb waiting for it
 * does. The shot goes as the body tops out, so the second fall is the cannon's
 * and never reaches the hull.
 */
export const ONE_LAST_CHANCE: GuideScene = {
  ticks: 1440,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 3, color: "red" }],
  acts: [
    { tick: 820, control: "guard" },
    { tick: 1260, control: "fireRed" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "THE SHIELD PUSHES IT BACK",
      anchor: { at: "control", control: "guard" },
    },
    { tick: 900, seat: 1, text: "ONCE ONLY · ONE LAST CHANCE", anchor: { at: "body" } },
    {
      tick: 1170,
      seat: 2,
      text: "PLAYER 2 SHOOTS IT RED",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
