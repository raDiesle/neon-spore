import type { ControlType } from "./field-actions.js";

/**
 * GRAB AND DRAG's control types — a finger put on a thing and moved. Split
 * from `field-actions.ts` for length; the order here is not the page's, which
 * sorts by how many enemies and boss waves use each (`field-page.ts`).
 */
export const DRAG_TYPES: readonly ControlType[] = [
  {
    key: "pull",
    title: "PULL PAST A DISTANCE",
    says:
      "A carry that counts once, when it has gone far enough; short of it, " +
      "nothing. The direction asked differs: down only, up or down, signed " +
      "sideways, either way across — or, on THE GAUGE'S TONGUE, a way each " +
      "seat chooses, so long as the two pull opposite.",
    suggest:
      "Make it one generic PULL with the direction a named field " +
      "(down · up · either · signed) and one drawn arrow for it. Decide once " +
      "whether a short pull is refused red or ignored — today both happen.",
    gestures: ["SWIPE PAST A DISTANCE"],
    lab: "down",
    rows: [
      "THE BLISTER'S SWIPE",
      "THE WARDEN'S TETHER",
      "THE WARDEN'S SWIPE",
      "THE ANTIPHON'S RAIL",
      "THE GAUGE'S TOOTH",
      "THE GAUGE'S TONGUE",
      "THE CURTAIN'S HEM",
      "THE LAMPREY'S HEAD",
      "THE LAMPREY'S HEAD, TOWED",
      "THE HIVE'S HAUL",
      "THE VANE'S HOUSING",
      "PINBALL'S PLUNGER",
      "THE TASTER'S WIPE",
      "THE TASTER'S PRY",
      "THE LEDGER'S PULL",
      "THE STARE'S LASHES",
      "THE LEDGER'S HAUL",
      "THE FLEET'S WRECK",
      "THE TRAPEZE'S LEFT ZONE",
      "THE TRAPEZE'S RIGHT ZONE",
      "THE BASTION'S LEFT SLAB",
      "THE BASTION'S RIGHT SLAB",
      "THE INSTAR'S MARKS",
      "THE MIRROR'S LOBES",
      "THE GALL'S TAPS AND PULL",
    ],
    steps: {
      "THE INSTAR'S MARKS": "SWIPE DOWN — a carry past its distance and a lift is one egg off.",
      "THE MIRROR'S LOBES":
        "THE LAST ROUND — its cannon carried left or right; the other seat's swiped for a colour.",
      "THE GALL'S TAPS AND PULL": "THE PULL — up toward the top throws it to the other half.",
    },
  },
  {
    key: "lever",
    title: "LEVER — CARRY TO A DEPTH AND HOLD",
    says:
      "A handle carried along one axis; the depth the thumb has it at is the " +
      "value, for as long as the thumb stays, and a lift springs it back.",
    suggest:
      "Make it one generic LEVER: one drawn groove, one reach, one grip " +
      "threshold, one spring-back — today five names for it (handle, knob, " +
      "latch, catch, brake) and three ways of summing a pair.",
    rows: [
      "THE LID'S CORD",
      "THE BALLOON'S LEFT HANDLE",
      "THE BALLOON'S RIGHT HANDLE",
      "THE SINEW'S LEFT HANDLE",
      "THE SINEW'S RIGHT HANDLE",
      "THE SPOOL'S BRAKE",
      "THE HASP'S LATCH",
      "THE RATCHET'S CATCH",
      "THE MANTLE'S LEFT KNOB",
      "THE MANTLE'S RIGHT KNOB",
      "THE PLUMB'S LEFT STONE",
      "THE PLUMB'S RIGHT STONE",
      "THE VISE'S LEFT LOBE",
      "THE VISE'S RIGHT LOBE",
      "THE CAPSTAN'S PULL",
      "THE LATCH'S LEFT GRIP",
      "THE LATCH'S RIGHT GRIP",
      "THE INSTAR'S MARKS",
    ],
    steps: {
      "THE INSTAR'S MARKS": "PULL DOWN · PULL UP — the part stands at the depth the thumb has it.",
    },
  },
  {
    key: "carry",
    title: "CARRY TO A PLACE",
    says:
      "The distance from the grab is a position — a column, a sector, an " +
      "angle — and the thing stands where the thumb has taken it.",
    suggest:
      "Keep; but THE MAZE's string and THE WELL's wind turn a wheel by " +
      "distance, where every other wheel turns by bearing. Move both to " +
      "TURN A WHEEL.",
    rows: [
      "THE SCUTTLE'S PART",
      "THE LEDGER'S FOOT",
      "THE MAZE'S STRING",
      "THE WELL'S WIND",
      "THE THROAT'S MOUTH",
    ],
  },
  {
    key: "rub",
    title: "RUB",
    says: "Back and forth over one body; what counts is the reversals, or the travel.",
    suggest:
      "Make it generic under THE CAPSTAN's rules. THE MAZE's heart counts travel " +
      "rather than reversals — move it to a rub, or say why not.",
    gestures: ["RUB"],
    rows: ["THE CAPSTAN'S RUB", "THE MAZE'S HEART", "THE THROAT'S PUMP", "THE BLISTER'S RUB"],
  },
  {
    key: "loose",
    title: "DRAW, THEN SWIPE",
    says:
      "A finger held for a count of beats, and the lift's direction is the " +
      "answer (`DrawRelease`).",
    suggest:
      "Already one gesture in two bosses. Make it generic under one name — " +
      "THE SLING's — and one drawn cord.",
    gestures: ["HOLD, THEN SWIPE"],
    rows: ["THE SLING'S LEFT CORD", "THE SLING'S RIGHT CORD"],
  },
  {
    key: "bearing",
    title: "TURN A WHEEL",
    says:
      "A finger round a hub: where it points is the angle, so four times " +
      "round is four turns (`sim/bearing.ts`, `turnAbout`).",
    suggest:
      "Already one helper. Make its picture generic too — one rim, one mark, " +
      "one tick per sector — and let every wheel in the game use it.",
    gestures: ["ROUND A CIRCLE"],
    rows: [
      "THE GIMBAL'S OUTER RING",
      "THE GIMBAL'S INNER RING",
      "THE HASP'S WHEEL",
      "THE VALVE'S WHEEL",
      "THE BASTION'S RIM",
      "THE BLISTER'S TURN",
      "THE INSTAR'S MARKS",
    ],
    steps: {
      "THE INSTAR'S MARKS": "TURN — wound clockwise round the ring, a quarter turn a ratchet.",
    },
  },
  {
    key: "trace",
    title: "TRACE ALONG A LINE",
    says: "A drag that counts only along something the field already shows.",
    suggest:
      "One boss now: THE FLEET's rake is a hold and went to BOTH SEATS " +
      "HOLDING AT ONCE (the owner, 10 October 2026). The open question is " +
      "whether this is a PULL along a drawn path, with a tolerance off it " +
      "that fails — try it in the PULL LAB's OFF PATH switch; " +
      "`docs/spec/ideas.md`, A pull along a path.",
    gestures: ["TRACING A PATH"],
    rows: ["THE FILAMENT'S LINE"],
  },
];
