import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Act two: the first six bosses, back to back, nothing else. `waves.ts` is
 * the barrel that concatenates this with the other acts — see it for why the
 * list was split by act in the first place.
 *
 * THE FLEET is the sixth and it arrived here rather than in act three, where
 * THE VANE sits among the mechanics: act three was full (`limits.test.ts`),
 * and this is the act whose whole content is bosses back to back. A seventh
 * that does not fit gets a fourth act beside act three, not a line in the
 * limits table.
 */
export const WAVES_ACT_2: Wave[] = [
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    sentence: "The one where she opens for two beats, and drops a torch on a clock of its own.",
    guide: {
      both: "Shoot the queen through her real mark while she is open. Ward the torch that drops from a wing.",
      p1: "1. Say the shape and the colour of what is coming.\n2. Slide the cannon under the mark your partner calls real.\n3. Trigger the plate when the torch drops.",
      p2: "1. Load the colour your partner calls.\n2. Say which mark is real: LEFT or RIGHT.\n3. Fire when the queen opens.\n4. Say which wing drops, and move the plate under it.",
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 3, row: 4, kind: "purge" }],
    boss: { kind: "queen", col: 3, petals: 9 },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theMirror",
    name: "THE MIRROR",
    sentence: "The one where the boss is your own ship, and it asks for your moves back.",
    guide: {
      both: "The boss shows a run of your own moves. Give the whole run back, in order.",
      p1: "1. Say each move out loud as the boss shows it.\n2. When it stops, do your moves again, in the same order.",
      p2: "1. Press nothing while the boss is still showing.\n2. Remember the moves your partner calls out.\n3. When it stops, do your moves again, in the same order.",
      scene: "theMirror",
    },
    entries: [],
    boss: {
      kind: "mirror",
      rounds: [
        ["fireRed", "guard"],
        ["cannonLeft", "cannonRight", "cannonRight"],
        ["intake", "fireRed", "intake", "fireCyan", "intake", "fireRed"],
      ],
    },
    bossType: "special",
    controls: "standard5",
  },
  {
    id: "theMaze",
    name: "THE MAZE",
    sentence: "The one where he turns the wheel and she fires, and neither can do the other half.",
    guide: {
      both: "Shoot the heart through the one open gap. A shot into a dead end restarts the stage.",
      p1: "1. Pull the string to turn the maze.\n2. Stop when a gap clicks onto a column and lights up.\n3. Say the column. If it was a dead end, turn on to the next gap.",
      p2: "1. Load the colour the heart is beating in.\n2. Wait until your partner says a gap is lit.\n3. Fire once, up the lit column.",
      scene: "theMaze",
    },
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
    bossType: "special",
    controls: "standard5",
  },
  {
    id: "theGauge",
    name: "THE GAUGE",
    sentence: "The one where the field is gone and neither of you has more than half a dial.",
    guide: {
      both: "Hold the needle between the two marks. Five times.",
      p1: "1. Hold the valve.\n2. Turn it the way your partner says.\n3. Stop when they say STOP, and hold it there.",
      p2: "1. Say which way to turn, and how far.\n2. Say STOP when the needle is between the marks.\n3. Press CALL. The marks move: start again.",
      scene: "theGauge",
    },
    entries: [],
    boss: { kind: "gauge" },
    bossType: "special",
    controls: "gauge",
  },
  {
    id: "theWarden",
    name: "THE WARDEN",
    sentence:
      "The one where he holds the door open and she has to be quick enough to shoot through it.",
    guide: {
      both: "Open the hatch and shoot the eye. One plate off the rim per hit. Five hits, and the hatch asks for a new hand as they go.",
      p1: "1. Slide the cannon under the eye.\n2. Take the rope's handle and pull it aside. Keep pulling.\n3. Say OPEN when the hatch is all the way over, and hold.\n4. Last plate, no rope: swipe across the hatch and say NOW.",
      p2: "1. Load the rim's colour.\n2. Wait for OPEN.\n3. Fire once, up the eye's column. Say HIT.\n4. From the third plate, rest a thumb on the eye too, or the lids stay shut.\n5. Last plate: fire on NOW, fast.",
      scene: "theWarden",
    },
    entries: [],
    boss: { kind: "warden" },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theFleet",
    name: "THE FLEET",
    sentence:
      "The one where the only one who can see the ships is the one who cannot move the sights.",
    guide: {
      both: "Sink all five ships before the clock runs out.",
      p1: "1. Find a ship on your chart.\n2. Say its square: the letter, then the number.\n3. Keep saying it until the sights are on it.\n4. Press FIRE.",
      p2: "1. Move the sights one square a press: LEFT, RIGHT, UP, DOWN.\n2. Read back the square you are on, letter and number.\n3. Stop when it matches, and say so.",
      scene: "theFleet",
    },
    entries: [],
    boss: {
      kind: "fleet",
      ships: [
        { col: 1, row: 1, len: 5, dir: "h" },
        { col: 8, row: 0, len: 4, dir: "v" },
        { col: 3, row: 5, len: 3, dir: "h" },
        { col: 0, row: 6, len: 3, dir: "v" },
        { col: 7, row: 8, len: 2, dir: "h" },
      ],
    },
    bossType: "special",
    controls: "fleet",
  },
];
