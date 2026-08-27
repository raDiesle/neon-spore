/**
 * Everything that is not the field: the menu, the room, the banner, the sheet.
 *
 * Two people who cannot see each other's screen spend a surprising amount of a
 * session out of the game — joining, waiting, reading a balance sheet. These
 * sounds carry state one player has and the other does not, which makes them
 * part of the control scheme rather than decoration: "mine says joined" is a
 * sentence somebody has to be able to say.
 */

import { after, air, burst, chime, glint, soft, sub, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const UI_SOUNDS: SoundDef[] = [
  {
    id: "ui.waveOpen",
    family: "ui",
    blurb: "A door onto the field: air opening upward with one low note under it.",
    status: "bound",
    use: "A wave starting, under the banner.",
    level: 0.4,
    layers: [
      air(900, 9000, 0.5, 0.18, 2.6),
      sub(72, 0.5, 0.5),
      after(0.28, soft(0.6, glint(5200, 0.3))),
    ],
  },
  {
    id: "ui.waveClear",
    family: "ui",
    blurb: "Three notes up, unhurried. The game's only outright compliment.",
    status: "bound",
    use: "A wave cleared.",
    level: 0.42,
    layers: [
      chime(3520, 0.22, 0.2, 900),
      after(0.13, chime(4400, 0.24, 0.2, 1100)),
      after(0.26, chime(5280, 0.4, 0.22, 1350)),
      after(0.26, sub(88, 0.5, 0.4)),
    ],
  },
  {
    id: "ui.menuMove",
    family: "ui",
    blurb: "A single dry pip. Cheap on purpose — it happens a hundred times a session.",
    status: "spare",
    use: "Moving between menu entries.",
    level: 0.2,
    layers: [glint(6400, 0.03, 0.5)],
  },
  {
    id: "ui.menuSelect",
    family: "ui",
    blurb: "The pip with a body: something taken.",
    status: "spare",
    use: "Choosing a menu entry.",
    level: 0.28,
    layers: [glint(6400, 0.04, 0.5), after(0.02, glint(9600, 0.08, 0.3)), sub(110, 0.1, 0.4)],
  },
  {
    id: "ui.menuBack",
    family: "ui",
    blurb: "The same, downward. Nothing was decided.",
    status: "spare",
    use: "Leaving a page.",
    level: 0.24,
    layers: [
      { source: "sine", freq: 6400, toFreq: 4200, gain: 0.4, attack: 0.004, release: 0.09 },
      sub(88, 0.09, 0.3),
    ],
  },
  {
    id: "ui.roomWait",
    family: "ui",
    blurb: "A slow pip every second, going nowhere. The sound of one player being early.",
    status: "spare",
    use: "In a room with the second seat empty.",
    level: 0.2,
    layers: [burst(glint(5200, 0.09, 0.35), 3, 1, 1)],
  },
  {
    id: "ui.roomJoined",
    family: "ui",
    blurb: "Two tones arriving from opposite ends and meeting in the middle.",
    status: "spare",
    use: "The second seat taken — both devices in.",
    level: 0.4,
    layers: [
      { source: "sine", freq: 8400, toFreq: 5200, gain: 0.3, attack: 0.02, release: 0.34 },
      { source: "sine", freq: 3400, toFreq: 5200, gain: 0.3, attack: 0.02, release: 0.34 },
      after(0.3, sub(104, 0.4, 0.45)),
    ],
  },
  {
    id: "ui.roomLost",
    family: "ui",
    blurb: "One of the two tones going out, and the other one left holding the note.",
    status: "spare",
    use: "The other device dropping out of the room.",
    level: 0.36,
    layers: [
      { source: "sine", freq: 5200, gain: 0.3, attack: 0.02, hold: 0.1, release: 0.14 },
      { source: "sine", freq: 3400, gain: 0.28, attack: 0.02, hold: 0.5, release: 0.5 },
      after(0.16, soft(0.5, air(1200, 300, 0.4, 0.14, 2))),
    ],
  },
  {
    id: "ui.desync",
    family: "ui",
    blurb: "Two copies of one click, a few milliseconds apart. It sounds like what it is.",
    status: "spare",
    use: "The desync ledger disagreeing — the worst thing the network can say.",
    level: 0.34,
    layers: [
      tick(0.5, 0, 3400),
      tick(0.45, 0.017, 3400),
      tick(0.4, 0.041, 3400),
      sub(56, 0.3, 0.4),
    ],
  },
  {
    id: "ui.pause",
    family: "ui",
    blurb: "The field going behind glass: everything ducking at once.",
    status: "spare",
    use: "Pausing — the field going quiet without the loop stopping.",
    level: 0.3,
    layers: [
      { source: "sine", freq: 300, toFreq: 90, gain: 0.4, attack: 0.01, release: 0.3 },
      soft(0.5, air(4000, 700, 0.3, 0.16, 1.4)),
    ],
  },
  {
    id: "ui.resume",
    family: "ui",
    blurb: "The same, in reverse and shorter. Play does not wait to be admired.",
    status: "spare",
    use: "Unpausing, which is deliberately shorter than pausing.",
    level: 0.3,
    layers: [
      { source: "sine", freq: 90, toFreq: 300, gain: 0.4, attack: 0.01, release: 0.18 },
      soft(0.5, air(700, 4000, 0.18, 0.16, 1.4)),
    ],
  },
  {
    id: "ui.scoreTick",
    family: "ui",
    blurb: "A counter running up. One pip per step, rising as it goes.",
    status: "spare",
    use: "The balance sheet counting out a tally.",
    level: 0.22,
    layers: [burst(glint(5600, 0.025, 0.4), 12, 0.055, 1, 3)],
  },
  {
    id: "ui.rankStamp",
    family: "ui",
    blurb: "A single hard stamp with a long low tail. The sheet is final.",
    status: "spare",
    use: "The grade landing at the end of the balance sheet.",
    level: 0.44,
    layers: [
      tick(0.6, 0, 3000),
      thud(220, 44, 0.5, 0.7),
      after(0.06, soft(0.5, chime(4400, 0.6, 0.18, 1300))),
    ],
  },
  {
    id: "ui.streak",
    family: "ui",
    blurb: "A rising step added to the last one. It keeps climbing while the pair keeps agreeing.",
    status: "spare",
    use: "The SYNC streak advancing — pitch by streak length.",
    level: 0.3,
    layers: [glint(4400, 0.12, 0.45), after(0.04, soft(0.5, glint(6600, 0.16)))],
  },
  {
    id: "ui.streakBroken",
    family: "ui",
    blurb: "The climb stopping. One tone down a minor third, and no tail.",
    status: "spare",
    use: "The streak lost.",
    level: 0.26,
    layers: [{ source: "sine", freq: 4400, toFreq: 3700, gain: 0.4, attack: 0.004, release: 0.12 }],
  },
  {
    id: "ui.briefStep",
    family: "ui",
    blurb: "A page of a briefing landing: soft, low, and clearly not a game sound.",
    status: "spare",
    use: "The briefings (briefings.md), one per step.",
    level: 0.26,
    layers: [sub(140, 0.16, 0.5), soft(0.5, air(2600, 5200, 0.2, 0.16, 2))],
  },
  {
    id: "ui.briefReady",
    family: "ui",
    blurb: "Both players having pressed ready: the same pip, twice, in tune.",
    status: "spare",
    use: "A briefing handing over to the wave it explains.",
    level: 0.32,
    layers: [glint(5280, 0.14, 0.4), after(0.06, glint(7920, 0.18, 0.3)), sub(88, 0.24, 0.4)],
  },
];
