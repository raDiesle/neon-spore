import type { FieldGroup } from "./field-families.js";

/** A boss's own controls that have a shape: a place, a bearing, a line, a draw, a rub, a squeeze, a chord, a timed tap, a script. Split from `field-families.ts` for length. */
export const SHAPED_FAMILIES: readonly FieldGroup[] = [
  {
    key: "carry",
    title: "A CARRY TO A PLACE",
    shared:
      "The distance from the grab is a position — a column, a sector, an " +
      "angle — and the thing stands where the thumb has taken it.",
    suggest:
      "Keep; but THE MAZE's string and THE WELL's wind turn a wheel by " +
      "distance, where every other wheel turns by bearing. Move both to " +
      "the bearing below.",
    members: [
      "THE SCUTTLE'S PART",
      "THE LEDGER'S FOOT",
      "THE DAVIT'S LEFT STEER",
      "THE DAVIT'S RIGHT STEER",
      "THE MAZE'S STRING",
      "THE WELL'S WIND",
      "THE THROAT'S MOUTH",
    ],
  },
  {
    key: "bearing",
    title: "A TURN BY BEARING",
    shared:
      "A finger round a hub: where it points is the angle, so four times " +
      "round is four turns (`sim/bearing.ts`, `turnAbout`).",
    suggest:
      "Already one helper. Make its picture generic too — one rim, one mark, " +
      "one tick per sector — and let every wheel in the game use it.",
    members: [
      "THE GAUGE'S NEEDLE",
      "THE GIMBAL'S OUTER RING",
      "THE GIMBAL'S INNER RING",
      "THE HASP'S WHEEL",
      "THE VALVE'S WHEEL",
    ],
  },
  {
    key: "trace",
    title: "A TRACE ALONG A LINE",
    shared: "A drag that counts only along something the field already shows.",
    suggest:
      "Two rows is too few to generalise; keep specific, and draw the lit " +
      "path the same way in both.",
    members: ["THE FILAMENT'S LINE", "THE FLEET'S RAKE"],
  },
  {
    key: "loose",
    title: "A DRAW, THEN A SWIPE",
    shared:
      "A finger held for a count of beats, and the lift's direction is the " +
      "answer (`DrawRelease`).",
    suggest:
      "Already one gesture in three bosses. Make it generic under one name — " +
      "THE SLING's — and one drawn cord.",
    members: [
      "THE SLING'S LEFT CORD",
      "THE SLING'S RIGHT CORD",
      "THE DAVIT'S LEFT LOOSE",
      "THE DAVIT'S RIGHT LOOSE",
      "THE BURGEE'S DRAW",
    ],
  },
  {
    key: "rub",
    title: "A RUB",
    shared: "Back and forth over one body; what counts is the reversals, or the travel.",
    suggest:
      "Make it generic under THE RIME's rules. THE MAZE's heart counts travel " +
      "rather than reversals — move it to a rub, or say why not.",
    members: [
      "THE CAPSTAN'S RUB",
      "THE RIME'S LEFT HALF",
      "THE RIME'S RIGHT HALF",
      "THE GRINDSTONE'S LEFT FLAT",
      "THE GRINDSTONE'S RIGHT FLAT",
      "THE MAZE'S HEART",
      "THE THROAT'S PUMP",
    ],
  },
  {
    key: "squeeze",
    title: "A SQUEEZE",
    shared: "Two fingers of one seat, closed on a body; the gap is the depth.",
    suggest: "Already one gesture, THE VISE's. Make its zone and its picture generic.",
    members: [
      "THE VISE'S LEFT LOBE",
      "THE VISE'S RIGHT LOBE",
      "THE GALL'S PINCH",
      "THE CYST'S LEFT FLANK",
      "THE CYST'S RIGHT FLANK",
    ],
  },
  {
    key: "chord",
    title: "A CHORD",
    shared: "Fingers held at once, each a pad by the order it landed (`chord-pads.ts`).",
    suggest: "Already one helper. Make the pads' picture generic.",
    members: [
      "THE TRIVET'S FRONT FOOT",
      "THE TRIVET'S REAR FOOT",
      "THE HALTER'S LEFT GRIP",
      "THE HALTER'S RIGHT GRIP",
      "THE GRINDSTONE'S LEFT JAW",
      "THE GRINDSTONE'S RIGHT JAW",
      "THE GOVERNOR'S BRAKE (PILOT)",
      "THE GOVERNOR'S BRAKE (NAVIGATOR)",
    ],
  },
  {
    key: "edge",
    title: "A TAP ON THE EDGE — FREEZE OR MARK",
    shared:
      "A press read on the tick it lands and never after; a resting thumb " +
      "has to lift and come down again. Timed against a mark.",
    suggest:
      "Make it generic under THE VALVE's pin, with one skid and one ring. " +
      "Six rows already say 'THE VALVE's pin' in their own text.",
    members: [
      "THE VALVE'S PIN",
      "THE CYST'S LEFT FREEZE MARK",
      "THE CYST'S RIGHT FREEZE MARK",
      "THE BURGEE'S FREEZE RING",
      "THE FLUE'S EMBER",
      "THE GOVERNOR'S NEEDLE",
      "THE TASTER'S PIN",
      "THE LAMPREY'S TEETH",
      "THE UNDERTOW'S TAP",
    ],
  },
  {
    key: "tap",
    title: "A COUNTED OR TAKEN-IN-TURN PRESS",
    shared: "Presses counted, or taken in turn by seat.",
    suggest:
      "Keep specific, but one refusal: THE MANTLE and THE KEEL refuse the " +
      "wrong seat silently, where most of the game refuses it red.",
    members: ["THE MANTLE'S CORE", "THE KEEL'S JOINT", "THE RATCHET'S PAWL", "THE BATON'S STRIP"],
  },
  {
    key: "script",
    title: "ONE MARK, MANY GESTURES",
    shared: "One target whose gesture changes step by step, each borrowed from above.",
    suggest:
      "Keep specific: these are scripts, not verbs. Each step should use the " +
      "generic control it borrows, once that exists.",
    members: ["THE INSTAR'S MARKS", "THE MIRROR'S LOBES", "THE QUEEN'S MARKS"],
  },
];
