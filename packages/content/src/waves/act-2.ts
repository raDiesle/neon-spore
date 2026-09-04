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
      both: "Huge and armoured. Two marks under her middle, one real and one not. She opens for two beats, and every eight a torch drops out of one of her wings.",
      p1: "You see what is coming — the shape and the colour. Say both.",
      p2: "You see where — which of the two marks is real, and which wing drops. Say the side.",
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 3, row: 4 }],
    boss: { kind: "queen", col: 3, petals: 9 },
  },
  {
    id: "theMirror",
    name: "THE MIRROR",
    sentence: "The one where the boss is your own ship, and it asks for your moves back.",
    guide: {
      both: "The boss is your own ship. It performs a sequence of your own moves, then asks for the whole of it back.",
      p1: "Say every step out loud as it happens. Neither of you can hold six of them alone.",
      p2: "Nothing you press counts while it is still showing. Wait for it to finish.",
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
  },
  {
    id: "theMaze",
    name: "THE MAZE",
    sentence: "The one where he turns the wheel and she fires, and neither can do the other half.",
    guide: {
      both: "A wheel of rings turns above the ship. Ways in are cut round its rim and only one of them reaches the middle — neither of you is told which.",
      p1: "You pull the string. The wheel turns until a way in clicks onto a column and lights up, and you cannot fire.",
      p2: "You fire, and you cannot turn anything. A shot only counts up the column the light is standing on — and a dead end costs the hull.",
    },
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
  },
  {
    id: "theGauge",
    name: "THE GAUGE",
    sentence: "The one where the field is gone and neither of you has more than half a dial.",
    guide: {
      both: "One needle and two marks, and the field does not come back until the needle has been held between them five times.",
      p1: "You hold the valve and you cannot see the marks. Turn it where she tells you, and stop when she says stop.",
      p2: "You can see the marks and you cannot turn anything. Say where it has to go, then call it — and the marks move.",
    },
    entries: [],
    boss: { kind: "gauge" },
    controls: "gauge",
  },
  {
    id: "theWarden",
    name: "THE WARDEN",
    sentence:
      "The one where he holds the door open and she has to be quick enough to shoot through it.",
    guide: {
      both: "A ring five columns wide with a hole you can see the field through. It never moves. A rope hangs out of the middle of it, and the hatch behind that rope is the only way to its eye.",
      p1: "You take the handle on the rope and pull it aside, and you keep pulling. The further you pull, the further the hatch opens — and you cannot fire. Tell her when it is all the way over.",
      p2: "You fire, and you cannot touch the rope. Only a shot of the rim's own colour, in the eye's own column, and only while he has it fully open. A hit takes a plate and the rope snaps back.",
    },
    entries: [],
    boss: { kind: "warden" },
  },
  {
    id: "theFleet",
    name: "THE FLEET",
    sentence:
      "The one where the only one who can see the ships is the one who cannot move the sights.",
    guide: {
      both: "A chart of squares over the water, lettered across and numbered down, with a fleet hidden in it. Sink all five before the clock runs out or the hull pays for it.",
      p1: "You can see every ship and you hold the only trigger. You cannot move the sights one square — so say the square, out loud, and keep saying it until it is under them.",
      p2: "You move the sights, one square a press, and you are shown nothing but water. Read him back where you are — the letter and the number are on your screen too.",
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
    controls: "fleet",
  },
];
