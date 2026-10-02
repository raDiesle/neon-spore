/**
 * The sounds wired up with nothing to draw, the fifth page — THE VALVE's,
 * THE LAMPREY's and THE MIMIC's.
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
  // THE LAMPREY's thirteen (`sim/events-lamprey.ts`). Its receipts are drawn
  // (`lamprey-fx.ts`), but the eel is drawn from two drafts — LIGHT TRACE's
  // body and BULB · SPIKE's ring — and neither is a shape-sheet subject, so
  // there is no card on the sheet to point a sound at.
  "boss.lampreyEnter": "the eel swimming in. Drawn from two drafts; no shape-sheet subject.",
  "boss.lampreyBite": "the mouth biting onto the hull, a tooth lit. Same argument.",
  "boss.lampreyCrack": "the lit tooth knocked out. Same argument.",
  "boss.lampreySnap": "the lit tooth snapping a cracked one back in. Same argument.",
  "boss.lampreyCrawl": "the jaw crawling a column along the hull. Same argument.",
  "boss.lampreyGnaw": "the jaw let go, chewing a step deeper. Same argument.",
  "boss.lampreyFull": "a full bite, on the hull, which the hull's own sounds have.",
  "boss.lampreyLoose": "the mouth pulling off the hull. Same argument.",
  "boss.lampreyRear": "the eel rearing, the gullet lit. Same argument.",
  "boss.lampreyHit": "a shot into the gullet. Same argument.",
  "boss.lampreyLunge": "a gullet window run out, the eel lunging to bite again. Same argument.",
  "boss.lampreySpent": "the eel gone limp, falling away. Same argument.",
  "boss.lampreyOut": "the eel gone and the wave ending. Same argument, and an absence.",
  // THE MIMIC's thirteen (`sim/events-mimic.ts`): the same argument as THE
  // LAMPREY's above — the mantle is drawn from two drafts combined, BLOOM ·
  // GLYPHED, and neither is a shape-sheet subject, so no card to point at.
  "boss.mimicEnter":
    "the mottle slapping into a mantle. Drawn from two drafts; no shape-sheet subject.",
  "boss.mimicSign": "a sign surfacing on the skin. Same argument.",
  "boss.mimicChange": "the sign sinking and another rising. Same argument.",
  "boss.mimicPeel": "a sign drawn right, peeling off. Same argument.",
  "boss.mimicWrong": "the skin wearing a wrong sign. Same argument.",
  "boss.mimicLapse": "a sign sinking back undrawn. Same argument.",
  "boss.mimicReach": "an arm reaching a step down. Same argument.",
  "boss.mimicRoll": "the mimic rolling its other face round. Same argument.",
  "boss.mimicCore": "the core bared and lit. Same argument.",
  "boss.mimicHit": "a shot into the core. Same argument.",
  "boss.mimicClose": "the skin closing over the core. Same argument.",
  "boss.mimicSpent": "the mimic shapeless, falling. Same argument.",
  "boss.mimicOut": "the mimic gone and the wave ending. Same argument, and an absence.",
};
