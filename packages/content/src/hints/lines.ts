import type { HintLine } from "../hint-types.js";

/**
 * The subjects and the lines every family of hints is written in. A line two
 * families say alike is said here once, so a word changed in one is changed in
 * all of them.
 */
export const CANNON = { at: "ship", control: "cannon" } as const;
export const SHIELD = { at: "control", control: "shield" } as const;
/** The SHIELD button, player 1's, that puts up what player 2 carries. */
export const GUARD = { at: "control", control: "guard" } as const;
export const RADAR = { at: "radar" } as const;
export const BODY = { at: "body" } as const;
export const HELD = { at: "held" } as const;
export const FIRE = { at: "fire" } as const;
export const SECRET = { at: "secret" } as const;

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

/** What `shieldIt`'s four lines say, where a wave says one of them its own way. */
export interface ShieldWords {
  move?: string;
  say?: string;
  press?: string;
  wait?: string;
}

/**
 * **A column and a press, one per person, the other way round** — THE ROCK's
 * lesson. Player 2 carries the shield under it and tells player 1, who
 * presses SHIELD as it lands and waits until then.
 */
export function shieldIt(words: ShieldWords = {}): HintLine[] {
  return [
    { seat: 2, when: "shieldOff", text: words.move ?? "MOVE THE SHIELD UNDER IT", anchor: SHIELD },
    {
      seat: 2,
      when: "shieldOn",
      text: words.say ?? "TELL PLAYER 1: SHIELD!",
      anchor: SHIELD,
      acts: false,
    },
    { seat: 1, when: "shieldOn", text: words.press ?? "PRESS SHIELD AS IT LANDS", anchor: GUARD },
    {
      seat: 1,
      when: "shieldOff",
      text: words.wait ?? "WAIT FOR THE SHIELD",
      anchor: GUARD,
      acts: false,
    },
  ];
}
