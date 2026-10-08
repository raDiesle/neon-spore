/**
 * A suggestion for every gesture in the catalogue (`gesture-catalogue.ts`),
 * keyed by its name, and for every control tried and set aside
 * (`tried-controls-page.ts`). Split from `field-notes.ts` for length; the
 * page's test fails when a gesture or a tried control has no note.
 */

export const GESTURE_NOTES: Readonly<Record<string, string>> = {
  TAP: "Keep. Every press begins here; nothing to decide.",
  "TAP OR HOLD, ON ONE CONTROL":
    "Keep, on the colour lobes only. A second control with two meanings on " +
    "one press would make every tap there wait to learn which it was.",
  "HOLD, AS A LEVEL":
    "The commonest verb, under a dozen names. Make it the generic PIN and " +
    "LEVER of the boss families.",
  "TIMED WHOLE-SCREEN HOLD": "Keep for the guide. Borrow its closing ring for the both-seats mark.",
  "LETTING GO TOGETHER":
    "Keep, THE SURGE's only. Offer it to a second boss before calling it generic.",
  "TAP COUNT": "Keep. Held down is one tap — say that on every boss that counts.",
  "TAP RHYTHM AGAINST THE BEAT": "Keep. Graded on the beat, so the voice delay never matters.",
  "DRAG, AS A DISPLACEMENT":
    "Keep as the rule under every carry: a distance from the grab, never a " +
    "speed. The generic LEVER, PULL and CARRY are all this.",
  "SWIPE PAST A DISTANCE":
    "Make it the generic PULL, with the direction a named field and one " + "arrow drawn for it.",
  "ROUND A CIRCLE":
    "Make every wheel use it — THE MAZE's string and THE WELL's wind still " + "turn by distance.",
  "TRACING A PATH": "Keep; share THE FILAMENT's lit path with THE FLEET's rake.",
  "TWO THUMBS ON ONE PHONE": "Keep. Each pointer by its own id.",
  "BOTH SEATS IN ONE WINDOW":
    "Make the together-mark generic: one ring on both screens that fills " +
    "only while both are down.",
  SHAKE:
    "Keep, with its arrows always. The owner's tilt ruling says no wave may " +
    "need a sensor — the arrows are why THE CHOIR does not.",
  "FREEZE TAP":
    "Stamped SPEC'D but built: THE VALVE, THE TRAPEZE, THE FLUE, " +
    "THE GOVERNOR. Move to BUILT; make THE VALVE's pin the generic one.",
  "SENDING NOTHING":
    "Stamped SPEC'D but built: `RestraintGate` in THE FLUE and THE HALTER. " + "Move to BUILT.",
  "TAPS ON A MOVING TARGET": "Stamped SPEC'D but built: THE RATCHET's pawl. Move to BUILT.",
  RUB:
    "Stamped SPEC'D but built: THE RIME, THE CAPSTAN. Move " +
    "to BUILT, and bring THE MAZE's heart under it.",
  "SQUEEZE ONE BODY": "Stamped SPEC'D but built: THE VISE, THE GALL. Move to BUILT.",
  CHORD: "Stamped SPEC'D but built: THE TRIVET, THE HALTER, THE GOVERNOR. Move to BUILT.",
  "TILT, AS A LEVEL":
    "Ruled out by the owner on 27 September 2026: no wave may need a tilt " +
    "sensor, and THE PLUMB became drag stones. Move to MISSED with the ruling.",
  "HOLD, THEN SWIPE": "Stamped SPEC'D but built: THE SLING, THE TRAPEZE. Move to BUILT.",
  "A DRAWN GLYPH":
    "Worth a boss: describing a shape is exactly the talking the game is. " +
    "Recognise on the drawing phone, send one command.",
  "DOUBLE TAP":
    "Only as a confirm on something one tap cannot mean. No boss asks for it; leave it.",
  "CALL AND RESPONSE":
    "Worth a boss, and nearly free: THE BEATBOX already grades a rhythm. " +
    "The first candidate for a new one.",
  PRESSURE: "Keep ruled out — it splits the pair by device.",
  "SWIPE IN FROM THE EDGE": "Keep ruled out — the edge is the OS's.",
  "THREE FINGERS, TRIPLE TAP": "Keep ruled out — iOS owns it, and a hand on a call has one thumb.",
  "FLICK, BY SPEED": "Keep ruled out — a speed on the wire does not heal.",
  "TWO-FINGER ROTATE": "Keep ruled out — ROUND A CIRCLE does it with one finger.",
  "FACE DOWN": "Keep ruled out — the player's half of the picture is the game.",
  "HOLD THE PHONE STILL": "Keep ruled out — SENDING NOTHING does it on the glass.",
  "LONG PRESS, THE OS's WAY": "Keep refused. Every hold depends on it staying refused.",
};

export const TRIED_NOTES: Readonly<Record<string, string>> = {
  "HOLD-TO-TEAR":
    "It is the generic PIN with a count to a tear. Offer it back as the " +
    "PIN's other ending — a hold that finishes something rather than " +
    "pausing it — on the next boss that has a thing to be held until it gives.",
};
