/**
 * The sounds wired up with nothing to draw, the fifth page — THE VALVE's.
 *
 * Cut off `sound-link-none-c.ts` on 30 September 2026, when THE GAUGE's loose
 * tooth left that page at 248 lines, by the rule the pages before it carry:
 * the *last* boss on the full page goes across, never the one being worked on.
 * `sound-link-none.ts` spreads all five into `NO_SUBJECT`, so
 * `test/sound-link.test.ts` still reads one table.
 */
export const NO_SUBJECT_E: Record<string, string> = {
  // THE VALVE's thirteen, from the third page. A drum over the field: a
  // fixture, the same argument, and nothing about it is drawn yet
  // (`sim/events-valve.ts`).
  "boss.valveEnter": "the drum settling over the field. A fixture, not a body on a grid.",
  "boss.valveLight": "a mark lighting on the rim. Same argument.",
  "boss.valveHold": "the wheel seating on its mark. Same argument.",
  "boss.valveSlip": "the wheel turned past its mark. Same argument.",
  "boss.valveLapse": "the wheel kicked off its mark untapped. Same argument.",
  "boss.valveFreeze": "the wheel stopped dead. Same argument.",
  "boss.valveThaw": "the wheel let go with the pin still in. Same argument.",
  "boss.valvePull": "a pin drawn out. Same argument.",
  "boss.valveSpark": "a spark leaking. A spark is not a creature. Same argument.",
  "boss.valveSparkOut": "that spark shot out, in either colour. Same argument.",
  "boss.valveSparkHit": "the spark on the hull, which the hull's own sounds have.",
  "boss.valveOpen": "the drum's face falling open. Same argument.",
  "boss.valveOut": "the drum gone and the wave ending. Same argument, and an absence.",
  // THE HASP's story, the two of its twelve with a voice of their own
  // (`sounds/boss-hasp-story.ts`); the page before has the door's fourteen,
  // and the argument is theirs.
  "boss.haspRattle": "a door shaking on its hinge. Part of the fixture, like the clasps.",
  "boss.haspRust": "a clasp furred with rust. Same argument: a coat on the fixture.",
};
