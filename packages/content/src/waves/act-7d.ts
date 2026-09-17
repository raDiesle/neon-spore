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
 * **THE CURTAIN's wave is empty**, THE ORRERY's case one wave up: what falls
 * is the core's own fire, from a column the pair uncovered, on a beat they
 * left it bare — neither writable by an author (`sim/curtain-step.ts`).
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
  {
    id: "theGorge",
    name: "THE GORGE",
    sentence:
      "The one that eats your shots, and the only way to hurt it is to overfeed exactly one part of it.",
    guide: {
      both: "A sack hangs across the top of the field with an intake under each of seven columns. Every shot that reaches the top is swallowed and hangs inside as a bead. An intake fills on four beads of one colour and goes clear; one more shot then pierces it for good, but it vents a torch after four beats if nobody does. A wrong colour takes a bead back out. Pierce two and it starts spitting beads back as bodies; pierce four and the one left fills itself — hold the beam in its colour on its column when it is full.",
      p1: "Only you see how many beads each intake holds. Pick a column, say it, and hold the cannon there while she fills it: four of one colour, then one more. A shot past a missed body is a bead in the wrong place.",
      p2: "You see which intake is nearest full and the colour it wants. Load that colour and fire only up the column he holds. When it clears, say so and fire once more. When the last fills itself, hold its colour for the beam.",
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
      both: "A membrane hangs across the top of the field with a core hiding behind it, firing down its own column. No shot reaches it through the fabric. Take hold of the membrane and carry your thumb sideways and it slides one column; pull opposite ways and it holds; leave it four beats and it rolls back over the core. Bare the core and shoot it in its colour, three times.",
      p1: "You see which lobes on the hem are soft — a shot into one takes it off, and four off makes it slide two columns a shove. Say which side is coming away. When she says the core is bare, put the cannon in its column.",
      p2: "You see the core's shadow through the fabric and the colour it is, and he sees neither. Say which way to shove and how far, load its colour, and fire the beat it is bare. The wrong colour makes it fire back.",
    },
    entries: [],
    boss: { kind: "curtain" },
  },
  {
    id: "theTaster",
    name: "THE TASTER",
    sentence: "The one where the colour you keep firing is the colour that stops working.",
    guide: {
      both: "A crest hangs over the field and grows eleven blades out of itself, middle outward, and the blades are its health. Every blade takes its edge from whichever colour the two of you have fired more of lately — and a blade is only struck off by the colour it is not. Its own colour thickens it instead. The column of a blade already gone is soft and swallows a shot for nothing. Shear all but two and they fold over the body and refuse every single shot: only the beam opens them.",
      p1: "You see the edge on every blade. Say its colour and hold the cannon on its column — the answer is always the other one. Never fire into a column whose blade is already gone.",
      p2: "You see what the pair has been spending, which is the colour the next blade grows in. Load against him and keep the two counts level, or the whole fan comes up in the colour you have most of.",
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
      both: "A mass hangs on a rope of six fibres, a handle either side. Each of you pulls one handle down and the two pulls add into one sum. Hold the sum in the fibre's band four beats and it parts; over the band it snaps and throws a rock; slip out and the hold restarts. From the fourth fibre the rope creeps slack under your hands — let go together and grip again. When the last parts the mass falls: sway both handles the same way to walk it clear of the hull.",
      p1: "Only you see the band the sum must sit in, and it narrows every fibre. Say harder or softer and by how much, against her number, and when the count begins. When the mass falls, say which way you are both swaying.",
      p2: "Only you see the sum of the two pulls as a number, and his hand's half of it. Say it out loud every beat as it changes; he has the band. Match your pull to his on the fall, and say when it is level.",
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
      both: "A body hangs over the middle of the field on a thick cord rooted in your own hull. Every hit you land on the split down its middle comes back down that cord as damage, landing in the socket four beats later — ward it there the way you ward a rock, or the hull takes it and the wave is lost. Each return slides the socket a column along the ship. Once the split is open the cord charges you for every shot you fire at anything, and a warded return is thrown back up it and widens the split for nothing. Five hits part it.",
      p1: "You carry the cannon and the trigger. Stand on the middle column to hit the split, and trigger on the beat the return lands — she has the column it is landing in. The last return is not yours to stop.",
      p2: "You load the colour the split is showing and carry the plate. Say which column the socket has walked to, every time, and get there before the beat. On the last return, take the plate out of that column and let it land.",
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
];
