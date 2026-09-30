/**
 * The suggestions on CONTROLS › ON THE FIELD — what this lane would decide
 * about each thing on the page, written for the owner to accept, strike or
 * turn round. Nothing here changes a control; each line is a proposal, and
 * the owner's answer is what a later lane builds.
 *
 * `DECISIONS` are the ones that cut across families and stand at the top of
 * the page. `ROW_NOTES` are for the rows that differ from their family's own
 * suggestion (`field-families.ts`); a row without one takes the family's.
 * Every gesture in the catalogue has a note: `field-notes-gestures.ts`.
 */

export interface FieldDecision {
  title: string;
  text: string;
  /** The rows it is about, by name — checked to exist by the page's test. */
  rows?: readonly string[];
}

export const DECISIONS: readonly FieldDecision[] = [
  {
    title: "ONE WRONG-SEAT RULE",
    text:
      "A press from the seat a control is not for is answered two ways today: " +
      "refused out loud (washed red on both screens) or let fall through to " +
      "whatever is under it. Suggest: refused red everywhere a control belongs " +
      "to one seat, falling through only where the other seat has something " +
      "of its own underneath that the press was plainly for.",
    rows: [
      "THE GAUGE'S NEEDLE",
      "THE GAUGE'S BAND",
      "THE GAUGE'S TOOTH",
      "THE UNDERTOW'S PIN",
      "THE VALVE'S WHEEL",
      "THE VANE'S ARM",
      "THE VANE'S HOUSING",
      "THE UNDERTOW'S FREE",
      "THE MAZE'S STRING",
      "THE QUEEN'S MARKS",
    ],
  },
  {
    title: "A PAIR OF HANDLES IS SPLIT BY GEOMETRY",
    text:
      "THE MANTLE began it and most paired bosses since follow it: the left handle is the " +
      "pilot's and the right the navigator's, on both phones. THE DAVIT's " +
      "loose and THE CYST's freeze marks cross it on purpose. Suggest: make " +
      "geometry the rule in the new-boss skill, and let a crossing be a named " +
      "exception the boss's sheet has to argue for.",
    rows: ["THE MANTLE'S LEFT KNOB", "THE DAVIT'S LEFT LOOSE", "THE CYST'S LEFT FREEZE MARK"],
  },
  {
    title: "ONE PICTURE FOR 'THIS IS ASKED OF YOU'",
    text:
      "Asked controls are drawn as a halo, a clock, a word, a bright ring or " +
      "a coloured groove, boss by boss. Suggest one generic ASKED mark — a " +
      "halo on the seat's own screen, the clock on the other's — as THE " +
      "THROAT, THE SNAKE and THE TASTER already do, and every boss uses it.",
    rows: ["THE THROAT'S RING", "SNAKE'S JAWS", "THE TASTER'S PIN", "THE INSTAR'S MARKS"],
  },
  {
    title: "A WHEEL TURNS BY BEARING",
    text:
      "Five wheels read where the finger points; THE MAZE's string and THE " +
      "WELL's wind read how far it went. On a round thing a thumb expects the " +
      "first. Suggest: both move to `turnAbout`.",
    rows: ["THE MAZE'S STRING", "THE WELL'S WIND", "THE HASP'S WHEEL"],
  },
  {
    title: "ONE PULL, WITH ITS DIRECTION NAMED",
    text:
      "Nineteen rows count a carry once it has gone far enough, and each " +
      "names its own direction in prose. Suggest: one generic PULL whose " +
      "direction is a field (down · up · either · signed), drawn as one " +
      "arrow, refused the same way when it falls short.",
    rows: ["THE WARDEN'S TETHER", "THE GORGE'S PRY", "PINBALL'S PLUNGER"],
  },
  {
    title: "TWO ROWS ARE FILED UNDER THE WRONG LIST",
    text:
      "THE GUM is a creature and sits in the bosses' file; THE WARDEN's " +
      "tether is a boss's and sits in the generic one. The page puts them " +
      "where they belong already; suggest moving the rows to match.",
    rows: ["THE GUM", "THE WARDEN'S TETHER"],
  },
  {
    title: "THE GESTURE CATALOGUE IS BEHIND THE GAME",
    text:
      "Seven gestures are still stamped SPEC'D and every one ships now " +
      "(FREEZE TAP, SENDING NOTHING, TAPS ON A MOVING TARGET, RUB, SQUEEZE, " +
      "CHORD, HOLD THEN SWIPE). TILT was ruled out on 27 September 2026 and " +
      "THE PLUMB is drag stones. Suggest: move the seven to BUILT and TILT to " +
      "MISSED, with the ruling as its reason.",
  },
];

/** Rows whose suggestion is not their family's. */
export const ROW_NOTES: Readonly<Record<string, string>> = {
  "THE MUZZLE SWIPE":
    "Only under the control set where the navigator holds both colours. Keep; " +
    "say so on the stamp, since everywhere else the row is unreachable.",
  "THE GUIDE'S HOLD":
    "The one hold not on the field. Keep; it is the game's own screen, and " +
    "the timed ring is worth borrowing for the both-seats mark.",
  "THE GUM":
    "Move the row to the generic file. Its swipe is the model for the " +
    "generic PULL: counted on the lift, direction named.",
  "THE LID'S CORD":
    "THE WARDEN's tether made generic already — a creature's cord pulled " +
    "as a level. The model for the LEVER.",
  "THE CHOIR'S LEFT ARROW":
    "The fallback for a phone with no motion. Keep, and keep it for every " +
    "sensor the game ever reads.",
  "THE CHOIR'S RIGHT ARROW": "As the left arrow.",
  "THE LIGHT": "Keep. The only generic press that is on both screens at once.",
  "THE WARDEN'S TETHER":
    "Move the row to the bosses' file. A pull down, held as a level — the " +
    "LEVER and the PULL both started here.",
  "THE GORGE'S PRY":
    "Stamped HOLD but it counts a pry past a distance — restamp it GRAB " +
    "AND DRAG so it reads as the pull it is.",
  "THE UNDERTOW'S PIN":
    "Stamped GRAB AND DRAG but it is a pin held still. Restamp as HOLD; it " +
    "is also a falling-through press, against the wrong-seat rule.",
  "THE PLUMB'S LEFT STONE":
    "Was TILT until the owner's ruling. Keep as a LEVER; say in the row " +
    "that no sensor is read.",
  "THE PLUMB'S RIGHT STONE": "As the left stone.",
  "THE CAPSTAN'S PULL":
    "Steers a band rather than pulling past a depth — a LEVER, but the " +
    "seat changes by step. Keep the per-step seat; it is the point.",
  "THE MAZE'S HEART":
    "Counts travel, not reversals, and calls it a shake. Make it a RUB, or " +
    "name the difference on the sheet.",
  "THE MAZE'S STRING": "Turn by bearing, and refuse the pilot's press the same way as the rest.",
  "THE WELL'S WIND": "Turn by bearing — the seam is already round.",
  "THE BATON'S STRIP":
    "A press taken in turn by the locked seat. The halo on that screen is " +
    "the ASKED mark; make it the generic one.",
  "THE PULSE'S BRACE":
    "Either seat, one at a time — the only hold that is a choice of who. Keep specific.",
  "THE SURGE'S BULB":
    "Held by both, and the answer is the letting go. Keep specific; it is " +
    "the only release the game grades.",
  "THE FLEET'S RAKE": "A trace; share THE FILAMENT's lit path.",
  "THE VALVE'S PIN": "The model for the generic freeze tap: edge-read, a skid, one ring.",
  "THE QUEEN'S MARKS":
    "A press refused red from the seat that can see. Keep; but its steps " +
    "should borrow the generic controls as they arrive.",
};
