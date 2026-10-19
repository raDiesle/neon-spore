import type { HintLine } from "../hint-types.js";

/**
 * The subjects and the lines every family of hints is written in. A line two
 * families say alike is said here once, so a word changed in one is changed in
 * all of them.
 */
export const CANNON = { at: "ship", control: "cannon" } as const;
export const SHIELD = { at: "ship", control: "shield" } as const;
export const BODY = { at: "body" } as const;
export const HELD = { at: "held" } as const;
export const FIRE = { at: "fire" } as const;

/** What `aimAndFire`'s four lines say, where a wave says one of them its own way. */
export interface AimWords {
  move?: string;
  say?: string;
  fire?: string;
  wait?: string;
}

/**
 * **A column and a colour, one per person** — FIRST STEP's lesson and the
 * frame most waves add one thing to. Off the column player 1 moves and player
 * 2 waits; on it player 2 fires and player 1 says so.
 */
export function aimAndFire(words: AimWords = {}): HintLine[] {
  return [
    { seat: 1, when: "offColumn", text: words.move ?? "MOVE CANNON UNDER ENEMY", anchor: CANNON },
    {
      seat: 1,
      when: "onColumn",
      text: words.say ?? "TELL PLAYER 2: FIRE!",
      anchor: CANNON,
      acts: false,
    },
    { seat: 2, when: "onColumn", text: words.fire ?? "FIRE ITS COLOUR NOW", anchor: FIRE },
    {
      seat: 2,
      when: "offColumn",
      text: words.wait ?? "WAIT FOR THE CANNON",
      anchor: CANNON,
      acts: false,
    },
  ];
}

/** A line about the body that is said, not pressed: `acts: false`. */
export function tell(seat: 1 | 2, text: string): HintLine {
  return { seat, text, anchor: BODY, acts: false };
}
