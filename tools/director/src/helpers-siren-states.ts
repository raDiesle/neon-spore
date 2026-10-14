import { commsCall, GAUGE_DUTY, sirenWord, TALKER } from "@neon-spore/render";
import { handedOver, type World } from "@neon-spore/sim";
import type { HelperGroup } from "./helpers-def.js";
import * as S from "./helpers-siren-poses.js";
import type { Pose } from "./pose-kit.js";

/**
 * **Every state THE SIREN can be in, and every line it writes, each on the
 * two phones at once** — the owner, 14 October 2026: *add all siren related
 * states and different text messages with game screen … so i know what states
 * we have and situations, so i can think about how to generalize or find
 * other ways to help players understand it.*
 *
 * The roster above says what lights it; this says what it *looks like* when
 * it is lit, and how one picture covers every case: which chip is lit, which
 * words go under the dial on which phone, and the cases where the field
 * rather than the table picks them. Each state is a world run to it
 * (`helpers-siren-poses.ts`), drawn as player 1's screen and as player 2's;
 * what each reads is asked of the renderer (`sirenWord`, `commsCall`), not
 * written here, so a word changed in `duty-words.ts` is changed on this page.
 */

/** One state: its world, when it happens, what it is for, and where it is drawn. */
export interface SirenState {
  pose: Pose;
  /** When the game is in it. */
  when: string;
  /** What it tells the pair, and why it is shaped as it is. */
  means: string;
  /** The file in `packages/render/src` that picks the state or its words. */
  source: string;
  /** What is drawn, where the field's siren is not what draws it (THE GAUGE). */
  reading?: (w: World, seat: "p1" | "p2") => string | null;
  lit?: { p1: boolean; p2: boolean };
}

/** The kinds that never light it, read off `TALKER`'s `null` rows. */
const silent = (): string =>
  Object.entries(TALKER)
    .filter(([, t]) => t === null)
    .map(([k]) => k)
    .join(", ");

const WHO: SirenState[] = [
  {
    pose: S.SIREN_DARK,
    when: "nothing on the field hides anything from either seat — a slick and a rock here",
    means: `Not drawn at all: no dial, no chips, no words. The siren is never a lamp left on, so it stays dark for every body both screens draw whole: ${silent()}.`,
    source: "comms.ts, comms-talker.ts",
  },
  {
    pose: S.SIREN_P1,
    when: "a body only player 1 can read is on the field — a cloud",
    means:
      "P1's chip lit with the mouth, P2's dark with the ear. The word goes under the dial on P1's phone only: P2's phone shows the same lit chip and no word, which is how P2 knows to listen.",
    source: "comms.ts, duty-words.ts",
  },
  {
    pose: S.SIREN_P2,
    when: "a body only player 2 can read is on the field — a lure",
    means: "The mirror: P2's chip lit and P2's word. P1 is told to listen.",
    source: "comms.ts, duty-words.ts",
  },
  {
    pose: S.SIREN_HALVES,
    when: "one body hides a different half from each seat — a strand",
    means:
      "Both chips lit for one body, and a different word on each phone: each says the half it holds. Two lit chips alone would not say who starts, so the words do.",
    source: "comms-talker.ts, duty-words.ts",
  },
  {
    pose: S.SIREN_SAME,
    when: "one body neither seat can answer alone — a weight",
    means:
      "Both chips lit and the same words on both phones. Nothing is hidden; the words name the act two hands must do together.",
    source: "comms-talker.ts, duty-words.ts",
  },
  {
    pose: S.SIREN_TWO_BODIES,
    when: "two split bodies at once, one for each seat — a cloud and a lure",
    means:
      "Both chips lit, each seat its own word. Both are talking and neither is only listening.",
    source: "comms.ts",
  },
  {
    pose: S.SIREN_TWO_WORDS,
    when: "one seat owes two words at once — a cloud and a veer, both P1's",
    means:
      "The words joined with a dot, in table order, so the line never goes quiet when there is most to say.",
    source: "duty.ts",
  },
];

const FIELD: SirenState[] = [
  {
    pose: S.SIREN_EARLY,
    when: "a torch is still on the strip and has not landed",
    means:
      "The one body that lights the siren before it arrives: it is the fastest thing in the game, and a call that starts when it lands ends after it has.",
    source: "comms.ts, torch-alarm.ts",
  },
  {
    pose: S.SIREN_FENCE_OPEN,
    when: "a fence with a way through it somewhere",
    means:
      "P1 sees the gap and P1's chip lights, but the same words go on both phones: both are needed to get the shield there.",
    source: "duty-fence.ts",
  },
  {
    pose: S.SIREN_FENCE_SHUT,
    when: "a fence with no way through, only a crack",
    means:
      "Same chip, other words: the wall has to be shot open, in the crack's column and colour.",
    source: "duty-fence.ts",
  },
  {
    pose: S.SIREN_MINE_P1,
    when: "a mine the wave drew on player 1's screen",
    means:
      "Which seat is shown a mine is the wave's choice, so the chip and the words follow the body: the seat that sees it says the tile, the other taps it. The roster's row is the default, drawn on P2.",
    source: "comms.ts, duty-mine.ts",
  },
  {
    pose: S.SIREN_HARPOON,
    when: "a leech fired onto the cannon by a fault",
    means:
      "The seat that cannot move the control gets the only words with an exclamation mark in the game — MOVE CANNON! (MOVE SHIELD! for a limpet). The seat holding it keeps its usual words.",
    source: "duty-harpoon.ts",
  },
  {
    pose: S.SIREN_TRADED,
    when: "THE HANDOVER has traded the two panels, with a cloud on the field",
    means:
      "The call is worked out by panel, but the chips are people: the lit chip moves to the person now holding the panel that sees, and the ring that says *you* stays on this phone's own seat.",
    source: "siren.ts, handover.ts",
  },
];

const BOSSES: SirenState[] = [
  {
    pose: S.SIREN_ANTIPHON,
    when: "THE ANTIPHON is up, from its arrival until it is down",
    means:
      "The seat shown the organ explains, the other chooses. The two swap every level, and the siren shows the swap during the rest, before the next organ grows.",
    source: "comms-boss.ts",
  },
  {
    pose: S.SIREN_FLUE,
    when: "THE FLUE is up, until it is spent",
    means:
      "The siren moves top right here, because the flue's own picture holds the middle. The panel shown the ember says when; the panels trade every other level.",
    source: "comms-boss.ts, siren.ts",
  },
  {
    pose: S.SIREN_MIMIC_P1,
    when: "THE MIMIC shows player 1 a picture of tiles",
    means:
      "Top right, under the mimic's body. The reader's chip is lit; its words say TILES and who to tell. On a split picture both chips light and each phone says both jobs.",
    source: "comms-mimic.ts",
  },
  {
    pose: S.SIREN_MIMIC_P2,
    when: "THE MIMIC rolls to its other face",
    means:
      "During the roll the siren already names the next reader, so the swap is read before the picture comes.",
    source: "comms-mimic.ts",
  },
  {
    pose: S.SIREN_GAUGE,
    when: "THE GAUGE, a round with its own stage, while a wound stands open",
    means:
      "The round draws the same siren itself: P2's chip lit, words on P2's phone only. P1's phone shows the lit chip and nothing under it.",
    source: "gauge-crown.ts",
    lit: { p1: false, p2: true },
    reading: (_w, seat) => (seat === "p2" ? GAUGE_DUTY : null),
  },
];

/** The chips as drawn: the call, traded back to people while the panels are. */
export function sirenLit(s: SirenState, w: World): { p1: boolean; p2: boolean } | null {
  if (s.lit) return s.lit;
  const call = commsCall(w);
  if (!call || !handedOver(w)) return call;
  return { p1: call.p2, p2: call.p1 };
}

/** What `seat`'s phone writes under the dial in this state. */
export function sirenReads(s: SirenState, w: World, seat: "p1" | "p2"): string | null {
  if (s.reading) return s.reading(w, seat);
  // The words are the panel's (`siren.ts`): while the panels are traded, a
  // phone reads the words of the panel it is holding.
  const panel = handedOver(w) ? (seat === "p1" ? "p2" : "p1") : seat;
  return sirenWord(panel, w);
}

/** Every state, in page order. */
export const SIREN_STATES: readonly SirenState[] = [...WHO, ...FIELD, ...BOSSES];

/** The three headings the states stand under, each a group of the page. */
export function sirenStateParts(
  draw: (states: readonly SirenState[]) => HTMLElement,
): HelperGroup[] {
  return [
    {
      title: "THE SIREN'S STATES — WHO SPEAKS",
      sub: "which chip lights and which words each phone writes, from dark to both seats talking at once",
      table: () => draw(WHO),
    },
    {
      title: "THE SIREN'S STATES — WORDS THE FIELD PICKS",
      sub: "the same kind of body, a different line: when it lands, what the wall is, which seat the wave drew, a fault, panels traded",
      table: () => draw(FIELD),
    },
    {
      title: "THE SIREN'S STATES — BOSSES THAT LIGHT IT THEMSELVES",
      sub: "fights whose split is the whole fight: no creature lights it, the boss does, and some move it to the top right",
      table: () => draw(BOSSES),
    },
  ];
}
