import type { Wave } from "../wave-types.js";

/**
 * The fourth page of act seven, cut off `act-7c.ts` when THE THROAT and THE
 * BATON landed on it within an hour of each other and took it seventeen lines
 * over the 250-line ceiling.
 *
 * **It opens on THE UNDERTOW and ends on THE SINEW since 18 September 2026**,
 * when one line per boss wave — which kind of boss it is (`Wave.bossType`) —
 * took this page and the two either side of it over the ceiling at once. THE
 * UNDERTOW came over from `act-7c.ts`, THE LEDGER and THE SURGE went on to
 * `act-7e.ts`, and the order of the waves is untouched: a page hands its last
 * wave to the page after it, which is the next wave in the game.
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
    id: "theUndertow",
    name: "THE UNDERTOW",
    sentence:
      "The one that comes up through the floor, so the shield faces down and the maw is the only thing pointing the right way.",
    guide: {
      both: "Lobes rise through your own hull. Swallow each one with the maw as it comes through. Hold the maw open under the last.",
      p1: "1. Say the column where the floor bows.\n2. Slide the cannon under it and open the maw as the lobe comes through.\n3. If it bows under you, slide off within two beats.\n4. On the last lobe, hold the maw open.",
      p2: "1. Put the plate on a breach your partner cannot reach, so it stops widening.\n2. Move it off when they come for that lobe.\n3. The tall one: hold a colour for the beam and let them keep the column.",
      scene: "theUndertow",
    },
    entries: [
      { beat: 54, col: 1, color: "red" },
      { beat: 62, col: 5, color: "cyan" },
      { beat: 70, col: 0, color: "cyan" },
      { beat: 78, col: 6, color: "red" },
      { beat: 86, col: 2, color: "red" },
      { beat: 94, col: 4, color: "cyan" },
    ],
    boss: { kind: "undertow" },
    bossType: "normal",
  },
  {
    id: "theThroat",
    name: "THE THROAT",
    sentence: "The one where the only thing that hurts it is something you give it.",
    guide: {
      both: "Throw a gum level along the mouth's row, into the mouth. Nothing else hurts it. Clear its column before every inhale.",
      p1: "1. Bring a gum down to the mouth's row.\n2. Carry your thumb sideways to fling it level along that row.\n3. Carry the cannon into the mouth's column before the count runs out. Brake a rock climbing it.",
      p2: "1. Say the mouth's column every time it moves.\n2. Say the beats until the next inhale.\n3. Fire to clear that column before the inhale. The bolt leaves your partner's cannon, so say when he is under it.",
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
    bossType: "normal",
  },
  {
    id: "theOrrery",
    name: "THE ORRERY",
    sentence: "The one where you each see two of the three rings.",
    guide: {
      both: "Shoot the core up the middle column, on a beat when every ring's gap is at the bottom.",
      p1: "1. The middle ring is yours alone. The outer one you both see.\n2. Say when the middle ring's gap is at the bottom.\n3. Count with your partner to the beat all three gaps meet, and say it.",
      p2: "1. The inner ring is yours alone, and so is the core's colour. Say the colour — it changes with each ring.\n2. Say when the inner ring's gap is at the bottom.\n3. Fire on the beat you both counted. A wrong colour costs.",
      scene: "theOrrery",
    },
    entries: [],
    boss: { kind: "orrery" },
    bossType: "normal",
  },
  {
    id: "theCandle",
    name: "THE CANDLE",
    sentence:
      "The one you fight in the dark, where the only light is what your own shots throw and the boss eats the ones it is facing.",
    guide: {
      both: "The field is dark. Any colour dims the glow, five times. Never shoot into the column it faces.",
      p1: "1. Say the column the glow faces, every time it turns.\n2. Keep the cannon under the glow and slide with it.\n3. If it faces its own column, say BEAM: a bolt is eaten there, the beam is not.",
      p2: "1. Fire at the glow once the cannon is under it.\n2. Hold your thumb when your partner names the glow's own column: that shot is eaten.\n3. Hold a colour for the beam when your partner says BEAM.",
      scene: "theCandle",
    },
    entries: [
      { beat: 18, col: 1, color: "red" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 54, col: 6, color: "red" },
    ],
    boss: { kind: "candle" },
    bossType: "normal",
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    sentence:
      "The one that eats your shots, and the only way to hurt it is to overfeed exactly one part of it.",
    guide: {
      both: "Fill one intake with four beads of one colour, then one more shot pierces it. A full one torches its column in four beats.",
      p1: "1. Pick a column and say it.\n2. Pinch a full one: it waits, and the four beats restart when you lift.\n3. Say the count: four beads, then one more.\n4. Trigger the plate on bodies: a shot past one is a bead.",
      p2: "1. Say which intake is nearest full and its colour.\n2. Its colour fills it; the other takes a bead out.\n3. Any colour pierces a full one.\n4. The last fills itself: pry it late, with the beam filling, or it clenches.",
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
    bossType: "normal",
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    sentence: "The one that is in the way, and the two of you shove it aside a column at a time.",
    guide: {
      both: "Shove the curtain aside, bare the core, shoot it in its colour. Three times. A hem with no lobes left tears off the rail instead.",
      p1: "1. Say which side of the hem is soft, so a shot can take it off.\n2. Shove the curtain the way your partner says.\n3. Keep a hand on it: four beats with none and it rolls back.",
      p2: "1. Say which way to shove and how far.\n2. Load the core's colour and say its column.\n3. The wrong colour makes it fire back, and each hit drops a lobe.",
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
  {
    id: "theTaster",
    name: "THE TASTER",
    sentence: "The one where the colour you keep firing is the colour that stops working.",
    guide: {
      both: "Strike each blade off with the colour it is not. Cut the gaps to stop the fan re-edging. The last two lock over the body: pull them apart, then the beam.",
      p1: "1. Say the colour on the next blade.\n2. Hold the cannon on that blade's column.\n3. Once three grow at once, hold one so it cannot decide.\n4. On the last two, drag the locked blades apart for the beam.",
      p2: "1. Fire the colour the blade is not.\n2. Keep the colours level: the next blade takes the one you use most.\n3. Drag across a gap: it cuts and costs no colour.\n4. Beam the colour you fired least, once they are apart.",
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
    bossType: "normal",
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    sentence: "The one that asks how hard, not when, and only the two of you together can say.",
    guide: {
      both: "Pull both handles and hold the sum inside the band, four beats a fibre. Six fibres. From the fourth the tendon creeps slack under any hand, and only both of you letting go resets it.",
      p1: "1. Only you can see the band. Call the number to aim at.\n2. HOLD means the sum is in: stop moving, four beats.\n3. LIFT means no pull can reach it. Both thumbs off, together.\n4. On the fall, say which way is clear.",
      p2: "1. Only you can see the sum. Read it out every beat.\n2. Pull to the number called, never past it: over the top it snaps.\n3. Your sum sliding with your hand still is the slack. Say so.\n4. On the fall, sway the way called.",
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
    bossType: "normal",
  },
];
