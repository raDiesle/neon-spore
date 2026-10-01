import type { GuideScene } from "../scene-types.js";
import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";

/**
 * THE HAUL's rehearsal: THE SCOUT's round with a hold that fills, and the two
 * hands a full hold asks for.
 *
 * The film is both levels flown whole, each in **one trip** — every mote
 * aboard before the ship turns for home, because the load is what this wave
 * is about. On level one the fourth mote makes the ship laden and player 2
 * reels it home on the line, past the hazard, rather than player 1 flying it
 * there; on level two the seats have swapped (`control-seats.ts`), the fifth
 * mote makes the ship heavy, and its pilot — player 2 now — primes the burn
 * before it will answer, twice on the way home.
 *
 * **The flight was generated, not reasoned about**, as THE SCOUT's was and
 * for its reason (`the-scout.ts`): the acts below were recorded off an
 * autopilot flown on this scene's own world, with the same burn band, a
 * lookahead that coasts rather than burn into a hazard, and a line drawn only
 * once a world stepped ahead shows it reeling home uncaught. Regenerate rather
 * than edit.
 *
 * **The line is held until the suck takes the ship** and the prime is a carry
 * of the whole stroke, `scoutPrimeMilli` (`scene-drag.ts`). Neither has a
 * control on the pad — each is a ring on the ship itself (`scout-grip.ts`) —
 * so the captions that name them point at the ring (`{ at: "handle" }`).
 */
export const THE_HAUL: GuideScene = {
  ticks: 2060,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
  acts: [
    // Level one: along the row, all four aboard, and the line reels it home
    // under the hazard into the mouth.
    { tick: 1, control: "scoutBurn", until: 17 },
    { tick: 17, control: "scoutTurnLeft", until: 18 },
    { tick: 51, control: "scoutBurn", until: 70 },
    { tick: 116, control: "scoutBurn", until: 133 },
    { tick: 164, control: "scoutTurnRight", until: 165 },
    { tick: 179, control: "scoutBurn", until: 198 },
    { tick: 202, control: "scoutTurnRight", until: 232 },
    { tick: 245, control: "scoutBurn", until: 261 },
    { tick: 261, control: "scoutTurnRight", until: 262 },
    { tick: 295, control: "scoutBurn", until: 314 },
    { tick: 314, control: "scoutTurnRight", until: 315 },
    { tick: 330, control: "scoutTurnRight", until: 331 },
    { tick: 350, control: "scoutTurnRight", until: 351 },
    { tick: 359, control: "scoutBurn", until: 379 },
    { tick: 379, control: "scoutTurnRight", until: 469 },
    { tick: 469, control: "scoutBurn", until: 494 },
    { tick: 540, control: "scoutBurn", until: 557 },
    { tick: 600, control: "scoutTurnRight", until: 610 },
    { tick: 610, drag: "scoutLine", until: 770 },
    { tick: 769, control: "scoutMaw" },
    // Level two, and the seats have swapped: player 2 flies, player 1 has the
    // mouth. The chevron, all five; heavy from the fifth, so every burn home
    // waits on a prime.
    { tick: 803, control: "scoutTurnRight", until: 804 },
    { tick: 853, control: "scoutBurn", until: 877, seat: 2 },
    { tick: 877, control: "scoutTurnLeft", until: 878, seat: 2 },
    { tick: 924, control: "scoutBurn", until: 943, seat: 2 },
    { tick: 989, control: "scoutBurn", until: 1006, seat: 2 },
    { tick: 1052, control: "scoutBurn", until: 1057, seat: 2 },
    { tick: 1057, control: "scoutTurnRight", until: 1058, seat: 2 },
    { tick: 1066, control: "scoutTurnRight", until: 1067, seat: 2 },
    { tick: 1079, control: "scoutBurn", until: 1102, seat: 2 },
    { tick: 1104, control: "scoutTurnRight", until: 1105, seat: 2 },
    { tick: 1128, control: "scoutTurnRight", until: 1129, seat: 2 },
    { tick: 1148, control: "scoutBurn", until: 1160, seat: 2 },
    { tick: 1160, control: "scoutTurnRight", until: 1161, seat: 2 },
    { tick: 1184, control: "scoutTurnRight", until: 1185, seat: 2 },
    { tick: 1185, control: "scoutBurn", until: 1190, seat: 2 },
    { tick: 1190, control: "scoutTurnLeft", until: 1280, seat: 2 },
    { tick: 1280, control: "scoutBurn", until: 1303, seat: 2 },
    { tick: 1303, control: "scoutTurnRight", until: 1304, seat: 2 },
    { tick: 1317, control: "scoutTurnRight", until: 1318, seat: 2 },
    { tick: 1348, control: "scoutBurn", until: 1368, seat: 2 },
    { tick: 1368, control: "scoutTurnRight", until: 1369, seat: 2 },
    { tick: 1393, control: "scoutTurnRight", until: 1394, seat: 2 },
    { tick: 1410, control: "scoutBurn", until: 1424, seat: 2 },
    { tick: 1424, control: "scoutTurnRight", until: 1425, seat: 2 },
    { tick: 1430, control: "scoutTurnLeft", until: 1520, seat: 2 },
    { tick: 1555, control: "scoutBurn", until: 1579, seat: 2 },
    { tick: 1580, control: "scoutTurnLeft", until: 1581, seat: 2 },
    { tick: 1582, control: "scoutTurnRight", until: 1672, seat: 2 },
    { tick: 1672, control: "scoutBurn", until: 1696, seat: 2 },
    { tick: 1672, drag: "scoutPrime", until: 1673, hand: 2 },
    { tick: 1743, control: "scoutBurn", until: 1759, seat: 2 },
    { tick: 1759, control: "scoutTurnLeft", until: 1760, seat: 2 },
    { tick: 1804, control: "scoutBurn", until: 1823, seat: 2 },
    { tick: 1869, control: "scoutBurn", until: 1916, seat: 2 },
    { tick: 1869, drag: "scoutPrime", until: 1870, hand: 2 },
    { tick: 1880, control: "scoutMaw", seat: 1 },
  ],
  steps: [
    // A page stands a second and a half at least: three on each level and a
    // last one over the mouth.
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 FILLS THE HOLD",
      anchor: { at: "control", control: "scoutBurn" },
    },
    { tick: 300, seat: 2, text: "EVERY POWERUP WEIGHS IT DOWN", anchor: { at: "boss" } },
    {
      tick: 600,
      seat: 2,
      text: "PLAYER 2 REELS IT HOME",
      anchor: { at: "handle", target: "scoutLine" },
    },
    {
      tick: 820,
      seat: 2,
      text: "NEXT LEVEL, THE PLAYERS SWAP",
      anchor: { at: "control", control: "scoutBurn" },
    },
    { tick: 1100, seat: 1, text: "THE FIFTH ONE MAKES IT HEAVY", anchor: { at: "boss" } },
    {
      tick: 1590,
      seat: 2,
      text: "PLAYER 2 PRIMES THE BURN",
      anchor: { at: "handle", target: "scoutPrime" },
    },
    {
      tick: 1870,
      seat: 1,
      text: "PLAYER 1 SUCKS IT IN",
      anchor: { at: "control", control: "scoutMaw" },
    },
  ],
};
