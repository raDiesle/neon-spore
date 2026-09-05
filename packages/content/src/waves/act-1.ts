import type { Wave } from "../wave-types.js";

/**
 * Act one: the tutorial arc. Every wave here teaches exactly one thing on top
 * of the ones before it, and it ends on `FINALE`, which asks for all of them
 * at once. `waves.ts` is the barrel that concatenates this with the other
 * acts — see it for why the list was split by act in the first place.
 *
 * **TWO COLOURS carries no guide, and it used to.** CYAN introduces the second
 * colour a wave earlier now and shows what the wrong one costs, so a guide here
 * would be the same lesson twice in consecutive waves — padding, whichever of
 * the two was written first. What is left for that wave to be is the first time
 * both colours arrive inside one wave: nothing new to learn, one thing to keep
 * straight. The note is up here rather than beside the wave because the
 * director rebuilds the array on every save and keeps only what stands above it
 * (`tools/director/src/serialize.ts`) — a comment inside an entry is a comment
 * with one save left to live.
 *
 * **The panel grows with the arc**, which is the other half of the same rule.
 * The first eight waves name a rung of the standard ladder rather than the
 * standard panel — STANDARD 1 through 4, each one button more than the one
 * before it (`control-sets-table.ts`) — so a pair meeting the game is handed
 * exactly the controls the wave they are on asks for, in the places those
 * controls will keep for the rest of the game. SALVAGE is where the full
 * panel arrives, because the maw is the last thing the ladder holds back and
 * the pod is the one thing in the game that asks for it.
 */
export const WAVES_ACT_1: Wave[] = [
  {
    id: "firstStep",
    name: "FIRST STEP",
    sentence: "The one where you only have to be in the right column.",
    guide: {
      both: "One ship, two screens — and the two screens do not show the same thing. What is coming is on one of them; the control that answers it is on the other. This first one is flat, wide and always red.",
      p1: "Yours is the cannon, the shield's trigger and the maw. Slide your strip until the cannon stands in its column, and say which column.",
      p2: "Yours is the shield itself, and the two colours. Press red — nothing leaves the hull until you do.",
      scene: "firstStep",
    },
    entries: [{ beat: 0, col: 2, color: "red" }],
    controls: "standard1",
  },
  {
    id: "cyan",
    name: "CYAN",
    sentence: "The one where the second button is the only one that works.",
    guide: {
      both: "Round, swollen, and always cyan. Red is spent on one of these and nothing comes apart.",
      p1: "Nothing changes for you. Stand in the column and say which one it is.",
      p2: "There is a second button beside red now. Both of these are cyan.",
      scene: "cyan",
    },
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 4, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "twoColours",
    name: "TWO COLOURS",
    sentence: "The one where both colours arrive in the same wave.",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 3, col: 4, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "alternating",
    name: "ALTERNATING",
    sentence: "The one where you never keep the same colour twice.",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 2, col: 3, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theRock",
    name: "THE ROCK",
    sentence: "The one where a shot is no answer and the timing is everything.",
    guide: {
      both: "Dead rock. It cannot be shot, and it stops a shot of yours going up its column.",
      p1: "It announces itself on your strip, before it is on the field. You have a trigger now: fire the shield at the moment it lands — not before.",
      p2: "The plate is already standing in that column, and nothing on your panel moves it yet. Call the moment it arrives.",
      scene: "theRock",
    },
    entries: [{ beat: 0, col: 3, kind: "meteor", color: null }],
    controls: "standard3",
  },
  {
    id: "twoRocks",
    name: "TWO ROCKS",
    sentence: "The one where neither of you can do it alone.",
    guide: {
      both: "Two rocks, and the second one lands somewhere else. The plate moves now — one of you carries it and the other one fires it.",
      p1: "The trigger is still yours and the plate is not. Say when, and say it late: the window is the moment it lands.",
      p2: "The strip under the plate is new. Slide it into the column he calls and hold it there. You cannot fire it yourself.",
      scene: "twoRocks",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "theHand",
    name: "THE HAND",
    sentence: "The one where three arrive on the same beat and the shield is one column.",
    guide: {
      both: "Three rocks, one beat, one shield. Either of you can put a finger on the field and hold something back — it falls slower for as long as you hold it, and the hand is the cost.",
      p1: "Hold the far one where it is. Your thumb is off your own strip while you do, so say what you are holding.",
      p2: "Take the near one with the shield, then go and get the one he is holding.",
      scene: "theHand",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 0, col: 5, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "torch",
    name: "TORCH",
    sentence: "The one where the only warning is on the other player's screen.",
    guide: {
      both: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
      p1: "It is on your strip and on nobody else's. Call it before it arrives.",
      p2: "It covers two columns at once. The shield has to sit across both of them.",
      scene: "torch",
    },
    entries: [
      { beat: 6, col: 1, kind: "torch", color: null },
      { beat: 12, col: 5, kind: "torch", color: null },
      { beat: 18, col: 3, kind: "torch", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "shieldThenCannon",
    name: "SHIELD, THEN CANNON",
    sentence: "The one where you switch jobs mid-wave.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 3, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "theWall",
    name: "THE WALL",
    sentence: "The one where the cannon never stops moving.",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 2, color: "red" },
      { beat: 2, col: 4, color: "cyan" },
      { beat: 3, col: 6, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "shootAndShield",
    name: "SHOOT AND SHIELD",
    sentence: "The one that alternates between the two jobs on a fixed beat.",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 4, kind: "meteor", color: null },
      { beat: 6, col: 5, color: "red" },
      { beat: 9, col: 2, kind: "meteor", color: null },
    ],
    controls: "standard4",
  },
  {
    id: "inItsShadow",
    name: "IN ITS SHADOW",
    sentence: "The one where you hold back the very thing you are trying to shoot.",
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 1, col: 3, color: "red" },
      { beat: 8, col: 5, kind: "meteor", color: null },
      { beat: 9, col: 5, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "crowded",
    name: "CROWDED",
    sentence: "The one where the jobs overlap and you have to say what you are doing.",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 1, col: 5, color: "cyan" },
      { beat: 3, col: 3, kind: "meteor", color: null },
      { beat: 5, col: 0, color: "red" },
      { beat: 6, col: 6, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "salvage",
    name: "SALVAGE",
    sentence: "The one where shooting something is only half of getting it.",
    guide: {
      both: "The panel is complete: the maw is the last button, and it is yours from here on. This is the wave it is for. The pod hangs where it was left, and shooting it loose is only half of getting it — after that it sinks and drifts.",
      p1: "SUCK is new, beside your trigger. Chase the pod with the cannon and open the maw as it reaches the hull. It mends the ship.",
      p2: "Free it with a shot of either colour, then say which way it is drifting.",
      scene: "salvage",
    },
    entries: [
      { beat: 2, col: 1, color: "cyan" },
      { beat: 7, col: 5, color: "red" },
    ],
    pods: [{ beat: 0, col: 3, row: 3 }],
  },
  {
    id: "finale",
    name: "FINALE",
    sentence: "The one where everything you have learned arrives at once.",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 6, color: "red" },
      { beat: 2, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 4, col: 4, color: "red" },
      { beat: 7, col: 1, kind: "meteor", color: null },
      { beat: 7, col: 5, kind: "meteor", color: null },
    ],
  },
];
