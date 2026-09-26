/**
 * What a card on CONTROLS › GESTURES is made of: a gesture, where it stands,
 * and the two halves of its picture — the hand on the phone, and the browser
 * events that hand produces over time.
 *
 * The owner asked for it on 26 September 2026: *"a catalogue of potential user
 * gestures and mobile user events we can build from … well documented with
 * visual explanation."* The written inventory is §4 of
 * `docs/spec/transfers-touch.md`; this is the same list, drawn, and it is the
 * one that says which file each built gesture lives in.
 */

/** Phone-local coordinates: 0..92 across, 0..154 down, the screen's top left. */
export type Pt = readonly [number, number];

/**
 * - `built` — the game reads it today, and `where` names the file.
 * - `specd` — a boss in the spec asks for it and nothing reads it yet.
 * - `consider` — missed, and worth having; each survives the voice delay.
 * - `missed` — missed, and should stay missed; `why` says why.
 */
export type GestureState = "built" | "specd" | "consider" | "missed";

/** One thing drawn on the phone half of a card. */
export type HandMark =
  /** A finger on the glass. `n` numbers a tap in a sequence. */
  | { k: "touch"; at: Pt; n?: number }
  /** A finger that stays: the dot with rings round it. */
  | { k: "hold"; at: Pt }
  /** Where a finger travels, arrowed at its end. */
  | { k: "path"; pts: readonly Pt[] }
  /** Travel round a centre, in degrees clockwise from twelve o'clock. */
  | { k: "arc"; c: Pt; r: number; from: number; to: number }
  /** Back and forth between two points, `n` times — a rub. */
  | { k: "zigzag"; from: Pt; to: Pt; n: number }
  /** A body on the field, the thing being touched. */
  | { k: "body"; at: Pt; r: number }
  /** A strip of the screen: the OS's own edge, or one seat's window. */
  | { k: "zone"; at: Pt; w: number; h: number; tone: "os" | "window" }
  /** A word on the glass. */
  | { k: "text"; at: Pt; text: string }
  /** Refused. */
  | { k: "cross"; at: Pt };

/** How the phone itself is posed, for the inputs that are not a finger. */
export interface PhonePose {
  /** Degrees, clockwise. */
  tilt?: number;
  /** Ghosts either side and motion lines. */
  shake?: boolean;
  /** Drawn from the back: the screen the player can no longer see. */
  faceDown?: boolean;
}

/**
 * One row of the timeline: one event name, and when it fires. A number is a
 * single event; a pair is a stream of them from one time to the other —
 * `pointermove` while a finger travels. Time runs 0..10, unitless: the picture
 * is an order and a shape, not a measurement.
 */
export interface Lane {
  event: string;
  /** The second finger's copy of an event, labelled ②. */
  finger?: 2;
  marks: readonly (number | readonly [number, number])[];
}

export interface Timeline {
  lanes: readonly Lane[];
  /** The beat, as faint verticals — for a gesture judged against it. */
  beats?: readonly number[];
  /** A grading window, shaded, with what it is called. */
  window?: { from: number; to: number; label: string };
  /** One line under the axis: a duration, a threshold. */
  note?: string;
}

export interface Gesture {
  name: string;
  state: GestureState;
  /** What the hand does, in one or two sentences. */
  does: string;
  hand: readonly HandMark[];
  phone?: PhonePose;
  timeline: Timeline;
  /** Files in the tree for `built`; a spec heading for `specd`. */
  where?: readonly string[];
  /** What differs between an iPhone and an Android. */
  platform?: string;
  /** For `consider` and `missed`: the argument. */
  why?: string;
}

export const STATE_TITLES: Record<GestureState, { title: string; stamp: string; sub: string }> = {
  built: { title: "BUILT", stamp: "BUILT", sub: "the game reads it today" },
  specd: {
    title: "SPECIFIED",
    stamp: "SPECIFIED",
    sub: "a boss in the spec asks for it; nothing reads it yet",
  },
  consider: {
    title: "MISSED — WORTH CONSIDERING",
    stamp: "TO CONSIDER",
    sub: "not in the game, and each one survives half a second to two of voice",
  },
  missed: {
    title: "MISSED — SHOULD STAY MISSED",
    stamp: "STAY MISSED",
    sub: "not in the game, on purpose",
  },
};
