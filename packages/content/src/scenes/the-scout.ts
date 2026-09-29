import type { GuideScene } from "../scene-types.js";
import { SCOUT_ARENAS } from "../scout-arenas.js";

/**
 * THE SCOUT's rehearsal: one of them flies blind and the other reads the map.
 *
 * The field is gone. Player 1's screen has the nose and the burn and nothing
 * else; player 2's has the arena — the motes hanging still, the hazard sweeping
 * its row — and the mouth. The film is the first two levels flown whole: the
 * little ship let go over the cannon, one mote fetched and sucked home, then
 * the second level's two, **one after another** — the owner's *small released
 * ship must collect powerups and then bring them back one after another*, 29
 * September 2026. The second level is flown from the other seat, because the
 * seats swap on every level (`control-seats.ts`), and its acts say so.
 *
 * **The flight was generated, not reasoned about.** A burn is a push that keeps
 * going, and a turn does nothing to the drift, so where the little one is at
 * a tick is the sum of every burn before it. The acts below were recorded off
 * the autopilot in `test/scout-flight.test.ts`, flown on this scene's own
 * world with its burn given a band — on under a fifth of top speed, off past
 * three fifths — so a thumb reads as pushes and coasts rather than a flutter.
 * Change one number and every leg after it lands somewhere else; regenerate
 * rather than edit.
 *
 * **The mouth is tapped the tick the ship is in its reach with a mote aboard**
 * (`scoutSuckWanted`), the moment the field writes `OPEN` on it for her; the
 * suck brings the ship the rest of the way and it is let go again over the
 * cannon.
 *
 * The pilot has three controls and cannot see where any of it is; the other
 * seat has one and cannot fly. The captions say which seat does what and never where the
 * motes are — that is the sentence the pair has to say to each other.
 */
export const THE_SCOUT: GuideScene = {
  ticks: 1800,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "scout", arenas: SCOUT_ARENAS },
  acts: [
    // Level one: straight up, about, home, and the mouth.
    { tick: 1, control: "scoutBurn", until: 25 },
    { tick: 72, control: "scoutBurn", until: 89 },
    { tick: 135, control: "scoutBurn", until: 152 },
    { tick: 173, control: "scoutTurnRight", until: 263 },
    { tick: 263, control: "scoutBurn", until: 288 },
    { tick: 335, control: "scoutBurn", until: 352 },
    { tick: 398, control: "scoutBurn", until: 415 },
    { tick: 452, control: "scoutMaw" },
    // Level two, and the seats have swapped: player 2 flies, player 1 has the
    // mouth. The left one, home; the right one, home.
    { tick: 484, control: "scoutBurn", until: 556, seat: 2 },
    { tick: 488, control: "scoutTurnRight", until: 627, seat: 2 },
    { tick: 556, control: "scoutBurn", until: 580, seat: 2 },
    { tick: 627, control: "scoutTurnLeft", until: 628, seat: 2 },
    { tick: 628, control: "scoutBurn", until: 647, seat: 2 },
    { tick: 699, control: "scoutBurn", until: 715, seat: 2 },
    { tick: 715, control: "scoutTurnRight", until: 716, seat: 2 },
    { tick: 758, control: "scoutBurn", until: 777, seat: 2 },
    { tick: 777, control: "scoutTurnRight", until: 778, seat: 2 },
    { tick: 781, control: "scoutTurnRight", until: 811, seat: 2 },
    { tick: 824, control: "scoutBurn", until: 844, seat: 2 },
    { tick: 844, control: "scoutTurnRight", until: 845, seat: 2 },
    { tick: 878, control: "scoutBurn", until: 898, seat: 2 },
    { tick: 945, control: "scoutBurn", until: 962, seat: 2 },
    { tick: 1008, control: "scoutBurn", until: 1025, seat: 2 },
    { tick: 1033, control: "scoutTurnLeft", until: 1034, seat: 2 },
    { tick: 1071, control: "scoutBurn", until: 1087, seat: 2 },
    { tick: 1085, control: "scoutMaw", seat: 1 },
    { tick: 1113, control: "scoutBurn", until: 1117, seat: 2 },
    { tick: 1117, control: "scoutBurn", until: 1141, seat: 2 },
    { tick: 1188, control: "scoutTurnRight", until: 1189, seat: 2 },
    { tick: 1189, control: "scoutBurn", until: 1208, seat: 2 },
    { tick: 1254, control: "scoutBurn", until: 1271, seat: 2 },
    { tick: 1271, control: "scoutTurnLeft", until: 1272, seat: 2 },
    { tick: 1317, control: "scoutBurn", until: 1332, seat: 2 },
    { tick: 1332, control: "scoutTurnLeft", until: 1333, seat: 2 },
    { tick: 1343, control: "scoutTurnLeft", until: 1373, seat: 2 },
    { tick: 1373, control: "scoutBurn", until: 1401, seat: 2 },
    { tick: 1401, control: "scoutTurnLeft", until: 1402, seat: 2 },
    { tick: 1447, control: "scoutBurn", until: 1466, seat: 2 },
    { tick: 1512, control: "scoutBurn", until: 1529, seat: 2 },
    { tick: 1575, control: "scoutBurn", until: 1592, seat: 2 },
    { tick: 1604, control: "scoutTurnRight", until: 1605, seat: 2 },
    { tick: 1605, control: "scoutMaw", seat: 1 },
  ],
  steps: [
    // A page stands a second and a half at least, so six of them: three on
    // each level.
    {
      tick: 0,
      seat: 1,
      text: "PLAYER 1 FETCHES A POWERUP",
      anchor: { at: "control", control: "scoutBurn" },
    },
    {
      tick: 180,
      seat: 1,
      text: "THEN BRINGS IT BACK",
      anchor: { at: "control", control: "scoutTurnRight" },
    },
    {
      tick: 400,
      seat: 2,
      text: "PLAYER 2 SUCKS IT IN",
      anchor: { at: "control", control: "scoutMaw" },
    },
    {
      tick: 620,
      seat: 2,
      text: "NEXT LEVEL, THE PLAYERS SWAP",
      anchor: { at: "control", control: "scoutBurn" },
    },
    { tick: 900, seat: 2, text: "ONE AFTER ANOTHER", anchor: { at: "boss" } },
    {
      tick: 1180,
      seat: 1,
      text: "PLAYER 1 SEES WHAT CROSSES",
      anchor: { at: "boss", part: "hazard" },
    },
  ],
};
