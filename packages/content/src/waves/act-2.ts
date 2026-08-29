import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Act two: the first five bosses, back to back, nothing else. `waves.ts` is
 * the barrel that concatenates this with the other acts — see it for why the
 * list was split by act in the first place.
 */
export const WAVES_ACT_2: Wave[] = [
  {
    name: "BULB QUEEN",
    sentence: "The one where she opens for two beats, and drops a torch on a clock of its own.",
    hint: "Two marks, one real. P1 sees what is coming, P2 sees where — say both.",
    entries: [],
    pods: [{ beat: 2, col: 3, row: 4 }],
    boss: { kind: "queen", col: 3, petals: 9 },
  },
  {
    name: "THE MIRROR",
    sentence: "The one where the boss is your own ship, and it asks for your moves back.",
    hint: "Watch, then do the same. Say every step out loud — the pod is bait.",
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
    name: "THE MAZE",
    sentence: "The one where he turns the wheel and she fires, and neither can do the other half.",
    hint: "Pull the string until a way in clicks onto a column and lights, park the cannon there, fire. Nobody knows which reaches the middle, and a dead end costs the hull — say which to try next.",
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
  },
  {
    name: "THE GAUGE",
    sentence: "The one where the field is gone and neither of you has more than half a dial.",
    hint: "He holds the valve and cannot see the marks. She sees them and cannot turn anything. Five between the marks, or the hull pays for it.",
    entries: [],
    boss: { kind: "gauge" },
    controls: "gauge",
  },
  {
    name: "THE WARDEN",
    sentence:
      "The one where it holds one of your controls and only the other one of you can get it back.",
    hint: "It takes the cannon, then the shield, then the cannon. Whoever is free pulls the line — and the rim's colour is the shot.",
    entries: [],
    boss: { kind: "warden" },
  },
];
