import type { Wave } from "../wave-types.js";

/**
 * The fourth page of act seven, cut off `act-7c.ts` when THE THROAT and THE
 * BATON landed on it within an hour of each other and took it seventeen lines
 * over the 250-line ceiling.
 *
 * **`7d` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order of
 * the game. It started one wave long and is full (`docs/queue.md`).
 *
 * **THE THROAT is the only wave in this game authored to be *eaten*.** The
 * gullet hangs from the top down to `throatMouthRow` with its mouth in authored
 * column 3 — `midCol` of whatever field is played — and every arrival on it is
 * one of two things: a gum for player 1 to fling into that mouth, or a body the
 * throat will swallow and heal off if the pair leaves it standing there. So the
 * middle column is not kept clear the way THE DIASTOLE's is next door; it is
 * *stocked*, on purpose, with the bodies whose answer is a cannon shot and the
 * ones whose answer is a hand.
 *
 * The gums are authored one lane either side of the mouth at first and out at
 * the walls later, for the arithmetic rather than the difficulty: a gum falls
 * a row a beat, so one dropped in authored column 2 is on the mouth's row five
 * beats later and a swipe from there crosses `gumFlingCols` into the mouth on
 * the next beat; one at the wall gives three beats of flight and a moved mouth.
 *
 * **Nothing is placed against the inhale's own count**, for THE DIASTOLE's
 * reason one page up: which beat the tube tightens on depends on when the pair
 * chokes its second ring, a beat nobody can know at authoring time.
 *
 * **THE CANDLE's arrivals are few and far apart, on purpose.** The fight is
 * in the dark, and a field with bodies in it is a field the pair has to light
 * to read; four slicks at the walls, one every twelve beats, are enough to
 * make the muzzle flash worth something without making the wave about them.
 *
 * **THE GORGE's arrivals are what the pair must answer without missing.** The
 * sack swallows every shot that reaches the top of the field, so the cost of
 * a body on this wave is the shot fired at where it *was*: rocks for the
 * shield, so the cannon can stay on its column, and a few slicks and bulbs
 * of both colours — some in the middle column on purpose, where a body
 * standing in the fill takes the bead meant for the intake. The design's
 * *let them reach the hull* is not authored, because a hull hit fails the
 * wave (`sim/wave-fail.ts`); what is authored is a field the restraint is
 * against.
 *
 * **THE CURTAIN's wave is empty**, THE ORRERY's case one wave up: what falls is
 * the core's own fire, from where and when the pair left it bare (`sim/curtain-step.ts`).
 *
 * **THE TASTER's arrivals are the colours it is counting.** The fan reads what
 * the pair has fired over the last thirty beats, so every body under it costs
 * a shot in a colour the boss will then grow armour in — which makes this the
 * one wave where a body answered *without* firing is worth something. Rocks
 * for the shield, and three slicks and three bulbs, evenly split and
 * alternating, so the lean is a decision the pair makes rather than one the
 * wave makes for them. Nothing is placed against the fan's own count, for THE
 * DIASTOLE's reason above: which beat a blade sets its edge on depends on when
 * the pair sheared the last one.
 */
export const WAVES_ACT_7D: Wave[] = [
  {
    id: "theThroat",
    name: "THE THROAT",
    sentence: "The one where the only thing that hurts it is something you give it.",
    guide: {
      both: "Throw a gum level along the mouth's row, into the mouth. Nothing else hurts it. Clear its column before every inhale.",
      p1: "1. Bring a gum down to the mouth's row.\n2. Carry your thumb sideways to fling it level along that row.\n3. Trigger the plate to clear the mouth's column before the count runs out.",
      p2: "1. Say the mouth's column every time it moves.\n2. Say the beats until the next inhale.\n3. Fire to clear that column before the inhale. Your partner triggers the plate.",
      scene: "theThroat",
    },
    entries: [
      { beat: 2, col: 4, kind: "gum", color: null },
      { beat: 8, col: 3, color: "red" },
      { beat: 12, col: 2, kind: "gum", color: null },
      { beat: 18, col: 3, kind: "meteor", color: null },
      { beat: 22, col: 6, kind: "gum", color: null },
      { beat: 26, col: 1, color: "cyan" },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 34, col: 0, kind: "gum", color: null },
      { beat: 40, col: 5, color: "red" },
      { beat: 44, col: 3, kind: "gum", color: null },
      { beat: 50, col: 2, kind: "meteor", color: null },
      { beat: 54, col: 6, kind: "gum", color: null },
      { beat: 60, col: 4, color: "red" },
      { beat: 64, col: 0, kind: "gum", color: null },
      { beat: 70, col: 3, color: "cyan" },
      { beat: 76, col: 2, kind: "gum", color: null },
    ],
    boss: { kind: "throat" },
  },
  {
    id: "theOrrery",
    name: "THE ORRERY",
    sentence: "The one where you each see two of the three rings.",
    guide: {
      both: "Shoot the core up the middle column, on a beat when every ring's gap is at the bottom.",
      p1: "1. Keep the cannon in the middle column.\n2. Say when the middle ring's gap is at the bottom.\n3. Count with your partner to the beat all the gaps meet, and say it.",
      p2: "1. Load the core's colour and say it. It changes each time a ring comes off.\n2. Say when the inner ring's gap is at the bottom.\n3. Fire on the beat you both counted to.\n4. All rings gone: hold the colour for the beam.",
      scene: "theOrrery",
    },
    entries: [],
    boss: { kind: "orrery" },
  },
  {
    id: "theCandle",
    name: "THE CANDLE",
    sentence:
      "The one you fight in the dark, where the only light is what your own shots throw and the boss eats the ones it is facing.",
    guide: {
      both: "The field is dark. Any colour dims the glow, five times. Never shoot into the column it faces.",
      p1: "1. Say the column the glow faces, every time it turns.\n2. Keep the cannon off that column while it eats.\n3. Slide to the column your partner names and say CLEAR.",
      p2: "1. Say the column the glow stands in, every time it drifts.\n2. Fire when your partner says CLEAR.\n3. Hold a colour on its column for the beam when the cannon cannot get there.",
      scene: "theCandle",
    },
    entries: [
      { beat: 18, col: 1, color: "red" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 54, col: 6, color: "red" },
    ],
    boss: { kind: "candle" },
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    sentence:
      "The one that eats your shots, and the only way to hurt it is to overfeed exactly one part of it.",
    guide: {
      both: "Fill one intake with four beads of one colour, then one more shot pierces it. Four intakes.",
      p1: "1. Pick a column and say it.\n2. Hold the cannon there while your partner fills it.\n3. Say the count: four beads, then one more.\n4. Trigger the plate on bodies: a shot past one is a bead in the wrong place.",
      p2: "1. Say which intake is nearest full and the colour it wants.\n2. Load it and fire only up the column your partner holds.\n3. When it clears, say so and fire once more.\n4. The last fills itself: hold its colour, the beam.",
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 1, kind: "meteor", color: null },
      { beat: 28, col: 5, kind: "meteor", color: null },
      { beat: 34, col: 3, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 6, kind: "meteor", color: null },
      { beat: 52, col: 3, color: "cyan" },
      { beat: 60, col: 2, kind: "meteor", color: null },
      { beat: 66, col: 4, color: "red" },
      { beat: 74, col: 3, kind: "meteor", color: null },
      { beat: 82, col: 1, color: "cyan" },
    ],
    boss: { kind: "gorge" },
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    sentence: "The one that is in the way, and the two of you shove it aside a column at a time.",
    guide: {
      both: "Shove the curtain aside, bare the core, shoot it in its colour. Three times.",
      p1: "1. Say which side of the hem is soft, so a shot can take it off.\n2. Shove the curtain the way your partner says.\n3. When they say BARE, put the cannon in the core's column.",
      p2: "1. Say which way to shove and how far.\n2. Load the core's colour.\n3. Say BARE the beat the core shows, and fire. The wrong colour makes it fire back.",
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
  },
  {
    id: "theTaster",
    name: "THE TASTER",
    sentence: "The one where the colour you keep firing is the colour that stops working.",
    guide: {
      both: "Strike each blade off with the colour it is not. Never shoot a column whose blade is gone. The last two only the beam opens.",
      p1: "1. Say the colour on the next blade.\n2. Hold the cannon on that blade's column.\n3. Never slide to a column whose blade is already gone.\n4. On the last two, hold the column for the beam.",
      p2: "1. Fire the other colour: always the one the blade is not.\n2. Keep the two colours you have fired level, or the next blade grows in the one you use most.\n3. On the last two, hold a colour for the beam.",
      scene: "theTaster",
    },
    entries: [
      { beat: 16, col: 1, kind: "meteor", color: null },
      { beat: 24, col: 5, kind: "meteor", color: null },
      { beat: 30, col: 3, color: "red" },
      { beat: 36, col: 0, color: "cyan" },
      { beat: 44, col: 6, kind: "meteor", color: null },
      { beat: 50, col: 2, color: "red" },
      { beat: 56, col: 4, color: "cyan" },
      { beat: 64, col: 3, kind: "meteor", color: null },
      { beat: 72, col: 1, color: "cyan" },
      { beat: 80, col: 5, color: "red" },
    ],
    boss: { kind: "taster" },
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    sentence: "The one that asks how hard, not when, and only the two of you together can say.",
    guide: {
      both: "Pull two handles together and hold the sum in the band, four beats a fibre. Six fibres. Then sway the falling mass clear of the hull.",
      p1: "1. Pull your handle down.\n2. Say HARDER or SOFTER, and how much, against the number your partner reads.\n3. Say when the count begins.\n4. From the fourth fibre: let go together, grip again.\n5. On the fall, say the way.",
      p2: "1. Pull your handle down.\n2. Read the sum out loud every beat.\n3. Pull the way your partner says.\n4. From the fourth fibre: let go together, grip again.\n5. On the fall, sway the same way and say when it is level.",
      scene: "theSinew",
    },
    entries: [
      { beat: 16, col: 1, color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 34, col: 2, kind: "meteor", color: null },
      { beat: 42, col: 4, color: "red" },
      { beat: 52, col: 0, color: "cyan" },
      { beat: 60, col: 6, kind: "meteor", color: null },
      { beat: 70, col: 1, color: "cyan" },
      { beat: 80, col: 5, color: "red" },
    ],
    boss: { kind: "sinew" },
  },
  {
    id: "theLedger",
    name: "THE LEDGER",
    sentence: "The one where every hit you land comes back at your own hull.",
    guide: {
      both: "Hit the split five times. Every hit comes back down the cord four beats later: ward it in the socket, or lose the wave. Let the last one land.",
      p1: "1. Stand the cannon on the middle column.\n2. Trigger the plate on the beat the return lands, in the column your partner calls.\n3. Once the split is open, fire at nothing else.\n4. The last return: do not stop it.",
      p2: "1. Load the colour the split shows.\n2. Say which column the socket has walked to, every time.\n3. Move the plate there before the beat.\n4. On the last return, take the plate out of that column.",
      scene: "theLedger",
    },
    entries: [
      { beat: 18, col: 1, kind: "meteor", color: null },
      { beat: 26, col: 5, color: "red" },
      { beat: 34, col: 3, color: "cyan" },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 52, col: 6, color: "red" },
      { beat: 62, col: 2, color: "cyan" },
      { beat: 72, col: 4, kind: "meteor", color: null },
      { beat: 82, col: 5, color: "cyan" },
    ],
    boss: { kind: "ledger" },
  },
  {
    id: "theSurge",
    name: "THE SURGE",
    sentence: "The one you beat by letting go, and only if you both let go at once.",
    guide: {
      both: "Both thumbs on the bulb charge it. Let go together inside the band. Five notches.",
      p1: "1. Put your thumb on the bulb and keep it there.\n2. Say when the field slows: that is the band.\n3. Count your partner down: three, two, one, OFF.\n4. Lift on OFF, never alone.",
      p2: "1. Put your thumb on the bulb and keep it there.\n2. Read the pressure out loud every beat.\n3. Lift your thumb on your partner's OFF, the same instant. Over the band it bursts.",
      scene: "theSurge",
    },
    entries: [
      { beat: 14, col: 1, kind: "meteor", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 30, col: 3, kind: "meteor", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 4, kind: "meteor", color: null },
      { beat: 58, col: 6, color: "red" },
      { beat: 66, col: 2, color: "cyan" },
      { beat: 76, col: 3, kind: "meteor", color: null },
    ],
    boss: { kind: "surge" },
  },
];
