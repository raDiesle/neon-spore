import type { Wave } from "../wave-types.js";

/**
 * The fourth page of act seven, cut off `act-7c.ts` when THE THROAT and THE
 * BATON landed on it within an hour of each other and took it seventeen lines
 * over the 250-line ceiling.
 *
 * **`7d` and not `9`, for the reason `act-7c.ts` gives about `7c`**: an act
 * file is a page and not a chapter, and the order of the waves is the order of
 * the game. It started one wave long, and it is filling: THE ORRERY and THE
 * CANDLE landed on it within the hour, from two lanes.
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
 * the walls later, and the reason is the arithmetic rather than the difficulty:
 * a gum falls a row a beat, so one dropped in authored column 2 is on the
 * mouth's row five beats later and a swipe from there crosses `gumFlingCols`
 * into the mouth on the next beat. A gum at the wall gives the pair three beats
 * of flight to talk over and a mouth that has moved by the time it arrives,
 * which is the same lesson said at length.
 *
 * **Nothing is placed against the inhale's own count**, for THE DIASTOLE's
 * reason one page up: which beat the tube tightens on depends on when the pair
 * chokes its second ring, so an arrival laid inside a particular window would
 * be laid against a beat nobody can know at authoring time.
 *
 * **THE CANDLE's arrivals are few and far apart, on purpose.** The fight is
 * in the dark, and a field with bodies in it is a field the pair has to light
 * to read; four slicks at the walls, one every twelve beats, are enough to
 * make the muzzle flash worth something without making the wave about them.
 */
export const WAVES_ACT_7D: Wave[] = [
  {
    id: "theThroat",
    name: "THE THROAT",
    sentence: "The one where the only thing that hurts it is something you give it.",
    guide: {
      both: "A gullet hangs from the top of the field, five rings stacked, ending in a mouth one column wide that slides along its own row. No shot touches it. Every few beats it inhales: whatever stands in its mouth is swallowed and everything else in that column is hauled a row closer. Anything it swallows makes it stronger. The one thing that hurts it is a gum thrown level along the mouth's row, into the mouth.",
      p1: "The gums are yours and so is the fling. A thumb carried sideways sends one out of its lane and it flies level along the row it was on, so get it down to the mouth's row first. Nothing else you have touches it.",
      p2: "You see the mouth's column and the beats to its next inhale, and he sees neither. Say both, every time. Anything it swallows heals it, so clear that column before the count runs out — his dome, your trigger.",
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
      both: "A core hangs in the middle of the field inside three rings of turning organs, and each ring has exactly one gap. A shot up the middle column reaches the core only on a beat when every ring still standing has its gap at the bottom of its orbit. The rings come round every eight, six and four beats, and they first come together on beat twelve.",
      p1: "The middle ring is true on your screen and grey on hers, so only you know its gap. Keep the cannon in the middle column, say your gap when she says hers, and pull on the beat you both counted to.",
      p2: "The inner ring is true on your screen alone, and so is the core's colour — load it and say it, because it changes each time a ring comes off. With every ring gone the core takes the beam alone.",
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
      both: "The field goes black. The boss is a glow at the top, and every shot, plate and beam lights the column it was made in for a beat. Any colour dims the glow a step; five steps and it goes out. When it is down to two it turns and swallows the flashes from the column it faces, and a swallowed shot brightens it again. Down to one it stops, and the last shot puts it out: two black beats, then the light comes back.",
      p1: "Only you see which column it faces. Say it, and keep the cannon off it while it is eating. It drifts a column at a time — call the new one every time it moves.",
      p2: "You see where it is, not where it looks. Say the column it stands in every time it drifts, and fire when he says the way is clear. The beam dims it too: hold a colour on its column when the cannon cannot get there.",
    },
    entries: [
      { beat: 18, col: 1, color: "red" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 54, col: 6, color: "red" },
    ],
    boss: { kind: "candle" },
  },
];
