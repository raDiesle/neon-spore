import type { Wave } from "../wave-types.js";

/**
 * The fifth page of act seven, cut off `act-7c.ts` when THE THROAT and THE
 * BATON landed on it within an hour of each other and took it seventeen lines
 * over the 250-line ceiling.
 *
 * **It opens on THE UNDERTOW and ends on THE CURTAIN since 19 September 2026**,
 * when the page sat eight lines under the ceiling with six §6.1/§6.2
 * guide-line lanes still queued against it — a guide line is the one thing in
 * a wave file that gets longer when it gets truer, so the next of those lanes
 * would have paid for the seam rather than wanted it (`docs/queue.md`). THE
 * UNDERTOW came over from `act-7c.ts` on 18 September 2026; THE LEDGER and THE
 * SURGE went on to what is now `act-7g.ts` the same day; THE TASTER and THE
 * SINEW went on to what is now `act-7f.ts` the next day, which took the letter
 * the LEDGER page had been using and pushed that page on — a page in front of
 * it cannot take the letter after it without playing THE TASTER and THE SINEW
 * later than the game has always played them, since they were this page's own
 * last two waves.
 *
 * **It took the letter `e` on 20 September 2026**, when THE DIASTOLE and THE
 * BATON needed a page of their own between `act-7c.ts` and this one and every
 * page from here on shifted up a letter (`docs/queue.md`'s *Act seven has no
 * room* entry).
 *
 * **`7e` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order of
 * the game. It started one wave long, holds six, and sits 52 lines under the
 * ceiling as of 20 September 2026 — so the next §6.1/§6.2 guide line queued
 * against it is paid for on this page rather than by another seam
 * (`docs/queue.md`).
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
 */
export const WAVES_ACT_7E: Wave[] = [
  {
    id: "theUndertow",
    name: "THE UNDERTOW",
    sentence: "The one that comes up through the floor, where only the maw points the right way.",
    guide: {
      both: "Lobes rise through your own hull. Swallow each one with the maw as it comes through. Hold the maw open under the last.",
      p1: "1. Say the column where the floor bows.\n2. Slide the cannon under it and open the maw as the lobe comes through.\n3. If it bows under you, slide off twice in four beats: it follows.\n4. On the last lobe, hold the maw open.",
      p2: "1. Put the shield on a breach your partner cannot reach, so it stops widening.\n2. Move it off when they come for that lobe.\n3. The tall one: hold a colour for the beam and let them keep the column.",
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
      p2: "1. Say the mouth's column every time it moves.\n2. Say the beats until the next inhale.\n3. Fire to clear that column before the inhale.\n4. The shot leaves your partner's cannon. Say when it is in that column.",
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
      p2: "1. Only you see the inner ring and the core's colour.\n2. Say the colour. It changes with each ring.\n3. Say when the inner ring's gap is at the bottom.\n4. Fire on the beat you both counted. A wrong colour costs.",
      scene: "theOrrery",
    },
    entries: [],
    boss: { kind: "orrery" },
    bossType: "normal",
  },
  {
    id: "theCandle",
    name: "THE CANDLE",
    sentence: "The one you fight in the dark, lit only by your own shots.",
    guide: {
      both: "The field is dark. Any colour dims the glow, five times. Never shoot into the column it faces.",
      p1: "1. Say the column the glow faces, every time it turns.\n2. Keep the cannon under the glow and slide with it.\n3. If it faces its own column, say BEAM. It eats a shot there, never the beam.",
      p2: "1. Fire at the glow once the cannon is under it.\n2. Hold your thumb when your partner names the glow's own column. It eats that shot.\n3. Hold a colour for the beam when your partner says BEAM.",
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
    sentence: "The one that eats your shots, until you overfeed one part of it.",
    guide: {
      both: "Fill one intake with four beads of one colour, then two more shots pierce it. A full one torches its column in eight beats.",
      p1: "1. Pick a column and say it.\n2. Pinch a full one: it waits, and the eight beats restart when you lift.\n3. Say the count: four beads, then two more.\n4. Trigger the shield on bodies: a shot past one is a bead.",
      p2: "1. Say the intake nearest full, and its colour.\n2. Its colour fills it. The other takes a bead out.\n3. Two shots of any colour pierce a full one.\n4. The last fills itself. Pry as the beam fills: two beams or it clenches.",
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
    sentence: "The one that is in the way, and you both shove it aside a column at a time.",
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
];
