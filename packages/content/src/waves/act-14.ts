import type { Wave } from "../wave-types.js";

/**
 * Act fourteen, opened for THE LAMPREY on 1 October 2026 — `act-13.ts` had
 * six lines left under the 250-line ceiling, which is less than one wave with
 * its argument written above it (`waves.ts`).
 *
 * **THE LAMPREY is the first boss that leaps about the field.** An eel that
 * jumps from tile to tile and bites into each, every leap a tile longer than
 * the last (`docs/spec/bosses-choreographed.md` §41, `sim/lamprey.ts`, the
 * owner's rework of 5 October 2026). One seat holds the tail and the other
 * frees the head — pulled up, or its lit tooth tapped out twice — or the two
 * pull it apart at once; a stay the fuse runs out on bites through to the
 * hull. Then the gullet rears on its tile and is shot in its colour.
 *
 * **It arrives hungry and crawls between levels** (the owner, 6 October
 * 2026, `sim/lamprey-roam.ts`): it crawls in and eats two rocks, a slick and
 * a bulb as they fall — each caught on its own row, the gaps between them
 * uneven and the head after them at one, two or three tiles a beat (the
 * owner, 9 October 2026, `sim/lamprey-meal.ts`) — **comes down the middle
 * of the field at the ship, and both seats pull it back off**, the head
 * along a curve, the eel losing its temper two thirds of the way (the owner,
 * 9 October 2026, `sim/lamprey-tow.ts`) — and then leaps through three levels of three, four and five stays, every leap in a
 * level a tile longer than the last and each level ended on a gullet. Before
 * the second and third it crawls the field side to side like a worm, eats
 * what falls for it and drops dung the shield has to turn. A lit tooth takes
 * three taps, and four in the last level. Each stay's window is THE SLOW.
 *
 * **THE MIMIC is the boss answered by painting** (§42, `sim/mimic.ts`): a
 * picture of tiles shows on one seat's screen only, and the other seat taps
 * it into the frame the mantle holds. The pilot reads a picture three tiles
 * square and two four square, the last changing; the mantle rolls, and the
 * navigator reads two five square, the second changing, and one six; it
 * rolls again and the seats take one each, a six and a seven; then the board
 * splits, three and then four, each seat reads the half the other paints,
 * and the core it bares is tapped. **No picture comes up twice in a fight**
 * (`MimicState.shown`). The owner, 6 October 2026: *add more levels with more
 * tiles … reduce the available time by a third*, so every window is two
 * thirds of what it was — a three square 24 beats where it was 36, a five
 * 37 where it was 56, a split three 29 where it was 44, the core 7 where it
 * was 10 — and the new sizes are cut to the same measure. No panel and no
 * SLOW: the windows are in plain beats. **A worded guide opens it** (the
 * owner, 6 October 2026: *add a tutorial guide at the start of the wave
 * that briefly explains what has to be done*), and while it plays the
 * siren top right says whose turn it is (`render/comms-mimic.ts`).
 *
 * **FIVE BLISTERS is the one where the body never says how to hit it**
 * (`docs/spec/blister.md`, *The gestures*): THE BLISTER, met plain in act
 * nine, comes back wanting each of its five gestures in turn — tapped, held,
 * swiped, turned round and rubbed — every one the same body, so only the help
 * round it says which. The hand that knocks it down changes too, so a seat
 * that has just struck is the seat that has to call the next pore. The last
 * two are up together, one for each hand.
 *
 * **THE BASTION is a metal moon taken apart from the outside in** (the
 * owner, 8 October 2026, in THE HALTER's place: *removing layers requires
 * different actions … the smaller the ball gets*; `sim/bastion.ts`). Four
 * shells, each a different job split across the seats: eight panels pulled
 * out, four a side; six guns turned to the front by the pilot's rim and shot
 * in their colour by the navigator; five nodes whose lightning the shield
 * throws back; three ports only the navigator sees, the cannon slid under
 * each. A plate let go short snaps back, and a shell run out grows back
 * whole — nothing hits the hull (THE GRINDSTONE's rule, the owner's pick).
 */
export const WAVES_ACT_14: Wave[] = [
  {
    id: "theLamprey",
    name: "THE LAMPREY",
    guide: {
      both: "It goes for the ship: pull it back. One of you holds the tail. The other pulls the head or taps the lit tooth. Shield its dung. Shoot the gullet.",
      p1: "1. It goes for the ship: pull the tail out and keep it there.\n2. Second bite: tap the lit tooth until it breaks.\n3. When it drops dung, raise the shield.",
      p2: "1. It goes for the ship: pull the head back. When it gets angry, pull again.\n2. Second bite: hold the tail.\n3. When it drops dung, carry the shield under it.",
    },
    entries: [],
    boss: {
      kind: "lamprey",
      meal: [
        { kind: "meteor", col: 3, row: 4, beat: 0, tiles: 1 },
        { kind: "slick", col: 8, row: 8, beat: 2, tiles: 2 },
        { kind: "bulb", col: 2, row: 3, beat: 7, tiles: 3 },
        { kind: "meteor", col: 6, row: 6, beat: 9, tiles: 2 },
      ],
      steps: [
        { ask: "tow", holder: 1, teeth: 0, jump: 1, beats: 16, color: "either" },
        { ask: "teeth", holder: 2, teeth: 1, jump: 2, beats: 16, color: "either", taps: 3 },
        { ask: "gullet", holder: 1, teeth: 0, jump: 3, beats: 12, color: "red" },
        {
          ask: "apart",
          holder: 1,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          crawl: true,
          food: "slick",
          dung: true,
        },
        { ask: "teeth", holder: 1, teeth: 1, jump: 2, beats: 16, color: "either", taps: 3 },
        { ask: "pull", holder: 2, teeth: 0, jump: 3, beats: 12, color: "either" },
        { ask: "gullet", holder: 1, teeth: 0, jump: 4, beats: 12, color: "cyan" },
        {
          ask: "pull",
          holder: 1,
          teeth: 0,
          jump: 2,
          beats: 12,
          color: "either",
          crawl: true,
          food: "bulb",
          dung: true,
        },
        { ask: "teeth", holder: 2, teeth: 1, jump: 3, beats: 18, color: "either", taps: 4 },
        { ask: "apart", holder: 2, teeth: 0, jump: 4, beats: 14, color: "either" },
        { ask: "teeth", holder: 1, teeth: 1, jump: 5, beats: 18, color: "either", taps: 4 },
        { ask: "gullet", holder: 1, teeth: 0, jump: 6, beats: 12, color: "either" },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theMimic",
    name: "THE MIMIC",
    guide: {
      both: "One of you sees a picture of tiles. The other taps it into the frame. The siren top right says whose turn it is.",
      p1: "1. First you see the picture: tell the other which tiles.\n2. Then tap the tiles the other tells you.\n3. Last, each of you sees one half and taps the other half.",
      p2: "1. First tap the tiles the other tells you.\n2. Then you see the picture: tell the other which tiles.\n3. Last, each of you sees one half and taps the other half.",
    },
    entries: [],
    boss: {
      kind: "mimic",
      steps: [
        { ask: "sign", reader: 1, changes: false, size: 3, beats: 24 },
        { ask: "sign", reader: 1, changes: false, size: 4, beats: 30 },
        { ask: "sign", reader: 1, changes: true, size: 4, beats: 30 },
        { ask: "roll", reader: 1, changes: false, size: 0, beats: 2 },
        { ask: "sign", reader: 2, changes: false, size: 5, beats: 37 },
        { ask: "sign", reader: 2, changes: true, size: 5, beats: 37 },
        { ask: "sign", reader: 2, changes: false, size: 6, beats: 44 },
        { ask: "roll", reader: 2, changes: false, size: 0, beats: 2 },
        { ask: "sign", reader: 1, changes: false, size: 6, beats: 44 },
        { ask: "sign", reader: 2, changes: false, size: 7, beats: 50 },
        { ask: "roll", reader: 1, changes: false, size: 0, beats: 2 },
        { ask: "split", reader: 1, changes: false, size: 3, beats: 29 },
        { ask: "core", reader: 1, changes: false, size: 0, beats: 7 },
        { ask: "split", reader: 1, changes: false, size: 4, beats: 37 },
        { ask: "core", reader: 1, changes: false, size: 0, beats: 7 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "theLatch",
    name: "THE LATCH",
    guide: {
      scene: "theLatch",
    },
    entries: [],
    boss: {
      kind: "latch",
      steps: [
        { ask: "haul", knots: 2, beats: 28 },
        { ask: "yank", knots: 2, beats: 32 },
        { ask: "cross", knots: 2, beats: 32 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "fiveBlisters",
    name: "FIVE BLISTERS",
    entries: [
      { beat: 0, col: 3, kind: "blister", color: null, row: 2, by: 2, count: 3 },
      { beat: 10, col: 5, kind: "blister", color: null, row: 2, by: 1, count: 2, gesture: "hold" },
      {
        beat: 20,
        col: 1,
        kind: "blister",
        color: null,
        row: 3,
        by: 2,
        count: 2,
        gesture: "swipe",
        way: "left",
      },
      { beat: 30, col: 4, kind: "blister", color: null, row: 2, by: 1, count: 2, gesture: "turn" },
      { beat: 40, col: 2, kind: "blister", color: null, row: 2, by: 2, count: 4, gesture: "rub" },
      {
        beat: 41,
        col: 5,
        kind: "blister",
        color: null,
        row: 3,
        by: 1,
        count: 2,
        gesture: "swipe",
        way: "up",
      },
    ],
  },
  {
    id: "theBastion",
    name: "THE BASTION",
    guide: {
      both: "A metal moon in four layers. Take each layer off before it grows back. The moon gets smaller every time.",
      p1: "1. Pull your panels on the left out, away from the moon.\n2. Turn the moon by its rim. The other shoots the gun at the front.\n3. Fire the SHIELD under the spark.\n4. Slide the cannon under the port.",
      p2: "1. Pull your panels on the right out, away from the moon.\n2. Shoot the gun at the front in its colour.\n3. Slide the shield under the spark.\n4. Only you see the port: say where, then fire.",
    },
    entries: [],
    boss: {
      kind: "bastion",
      steps: [
        { layer: "plates", beats: 32 },
        { layer: "ring", colors: ["red", "cyan", "red", "cyan", "red", "cyan"], beats: 40 },
        { layer: "lattice", offsets: [-2, 2, 0, -1, 1], beats: 48 },
        { layer: "port", offsets: [-2, 1, 0], beats: 32 },
      ],
    },
    bossType: "normal",
  },
];
