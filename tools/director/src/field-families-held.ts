import type { FieldGroup } from "./field-families.js";

/** A boss's own controls that are held or carried along one axis: a lever, a pin, a pair, a pull. Split from `field-families.ts` for length. */
export const HELD_FAMILIES: readonly FieldGroup[] = [
  {
    key: "lever",
    title: "A LEVER — CARRIED TO A DEPTH AND HELD THERE",
    shared:
      "A handle carried along one axis; the depth the thumb has it at is the " +
      "value, for as long as the thumb stays, and a lift springs it back.",
    suggest:
      "Make it one generic LEVER: one drawn groove, one reach, one grip " +
      "threshold, one spring-back. Twelve rows, five names for it " +
      "(handle, knob, latch, catch, brake) and three ways of summing a pair.",
    members: [
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
      "THE CAPSTAN'S PULL",
    ],
  },
  {
    key: "hold",
    title: "A HOLD THAT PAUSES OR PINS",
    shared:
      "A thumb resting on one thing stops something happening for as long as " +
      "it stays. Nothing is carried; the only value is whether it is down.",
    suggest:
      "Make it one generic PIN: GRIP's own gesture and picture on a boss's " +
      "part. Pick one answer for the lift — a pause, or a pin — per " +
      "family, not per boss, and draw it.",
    members: [
      "THE SURGE'S BULB",
      "THE ANTIPHON'S ORGAN",
      "THE GAUGE'S BAND",
      "THE WARDEN'S THUMB",
      "THE LEAD'S STALK",
      "THE WELL'S SEAM",
      "THE HIVE'S WRING",
      "THE PULSE'S BRACE",
      "THE VANE'S ARM",
      "SNAKE'S TAIL",
      "THE SCOUT'S LINE",
      "THE LEDGER'S PLUG",
      "THE FLEET'S PLUME",
      "THE LAMPREY'S TAIL",
    ],
  },
  {
    key: "both",
    title: "BOTH SEATS HOLDING AT ONCE",
    shared:
      "A hold that counts only while both seats have a thumb down, on two " +
      "phones — neither can feel the other's.",
    suggest:
      "Make the together-mark generic: one ring on both screens that fills " +
      "only while both are down, the same on every boss that asks it.",
    members: [
      "THE BATON'S DRAW",
      "THE PULSE'S ARREST",
      "THE OCULUS'S LEFT LEAF",
      "THE OCULUS'S RIGHT LEAF",
    ],
  },
  {
    key: "pull",
    title: "A PULL PAST A DISTANCE",
    shared:
      "A carry that counts once, when it has gone far enough; short of it, " +
      "nothing. The direction asked differs: down only, up or down, signed " +
      "sideways, either way across.",
    suggest:
      "Make it one generic PULL with the direction a named field " +
      "(down · up · either · signed) and one drawn arrow for it. Decide once " +
      "whether a short pull is refused red or ignored — today both happen.",
    members: [
      "THE WARDEN'S TETHER",
      "THE WARDEN'S SWIPE",
      "THE ANTIPHON'S RAIL",
      "THE GAUGE'S TOOTH",
      "THE GAUGE'S TONGUE",
      "THE CURTAIN'S HEM",
      "THE LAMPREY'S HEAD",
      "THE HIVE'S HAUL",
      "THE VANE'S HOUSING",
      "SNAKE'S JAWS",
      "THE SCOUT'S PRIME",
      "PINBALL'S PLUNGER",
      "PINBALL'S TABLE",
      "THE TASTER'S WIPE",
      "THE TASTER'S PRY",
      "THE LEDGER'S PULL",
      "THE STARE'S LASHES",
      "THE LEDGER'S HAUL",
      "THE FLEET'S WRECK",
    ],
  },
];
