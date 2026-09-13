import { WAVES } from "@neon-spore/content";
import type { MenuPage } from "./menu-parts.js";
import type { MenuEntry } from "./menu-view.js";

/**
 * The rows on the menu's three lists of entries, in the order they are read.
 *
 * A list rather than a screen: `menu-view.ts` draws whatever it is handed, and
 * `menu.ts` decides which of these apply right now (`setEntry`), holds the
 * link and the seat, and puts the two-step in front of LEAVE ROOM. This file
 * is only the words and where each one goes — which is the part that keeps
 * growing as the menu learns to be the front door, and what pushed `menu.ts`
 * past its line limit the day CONTINUE arrived.
 *
 * Every row is here even when it does not apply: `setEntry(key, { on })` takes
 * one off the page rather than this list being rebuilt, so a key that exists
 * stays addressable.
 *
 * **There are three lists, and the seam is who the row is for.** The front page
 * is four rows and a decision: play, learn what this is, set it up, and — while
 * there is a room — hang up. `playEntries` is the page behind PLAY, where the
 * two of you actually meet: the room, the seat cards and CONTINUE.
 * `testingEntries` is the rig — one person at a desk with both seats, jumping at
 * a wave or a mechanic, moving the sliders while it runs — and it has no row at
 * all now: it is reached by pressing the spore over the wordmark three times
 * (`menu-view.ts`), because it is not a way into the game and a player who found
 * it there read four of the eleven things on the front page before the one they
 * wanted. The keys are the same argument taken further: they are a preference of
 * the device rather than a way in, so CONTROLS is reached from SETTINGS.
 *
 * **No key is on two lists**, which is what lets `setEntry` name a row without
 * saying which page it is drawn on. The rig's first row is `single` for that
 * reason: `play` is the front page's own row now.
 */

export interface EntryActions {
  /**
   * CONTINUE, which is one row and three answers (`menu.ts`): back to the field
   * when one is open under the menu, the room's own START when there is a room
   * and nothing has been played yet, and otherwise a fresh run at the furthest
   * wave this device has reached. The owner asked for one row where there were
   * two — RESUME and CONTINUE are the same sentence to the person holding the
   * phone — so which of the three it is, is said in the row's description and
   * decided where the menu already knows.
   */
  carryOn: () => void;
  /** Start at a wave: a fresh run, with the menu closed behind it. */
  play: (wave: number) => void;
  close: () => void;
  show: (page: MenuPage) => void;
  openRoom: () => void;
  /** Straight into the room this device shares with its most recent partner. */
  rejoin: () => void;
  openTuning: () => void;
  /** How many demonstration rows there are, for the DEMOS line. */
  demoCount: number;
  /** The six pages that say what this game is, again on purpose. The menu
   * closes behind them and comes back when they are done (`intro.ts`). */
  openIntro: () => void;
}

export function menuEntries(a: EntryActions): MenuEntry[] {
  return [
    {
      key: "play",
      label: "PLAY",
      desc: "Two devices, one seat each: the room, your seat, and the way back in.",
      run: () => a.show("play"),
    },
    {
      key: "how",
      label: "HOW TO PLAY",
      desc: "The two seats, and the one rule that is the whole game.",
      run: () => a.show("how"),
    },
    {
      key: "settings",
      label: "SETTINGS",
      desc: "Sound, motion, buzz, your name, the controls — and the way to forget all of it.",
      run: () => a.show("settings"),
    },
    {
      key: "leave",
      label: "LEAVE ROOM",
      desc: "Hang up and go back to one device. The other phone is told.",
      // Answered by the two-step `menu.ts` binds to this row, which asks in
      // place before anything reaches `leaveRoom`. Nothing to do here.
      run: () => {},
    },
  ];
}

/**
 * The rows behind PLAY: the three doors into a game with two people in it.
 *
 * CONTINUE is first because it is the one press a pair who have played before
 * will want, and it is off the page until both phones are in the room
 * (`menu-link.ts`) — a row that starts a wave on one device of two is a row
 * that starts two different games. REJOIN is the way back to the partner this
 * device played with last, and the room row is the four-character code, which
 * is what a first meeting still needs.
 *
 * The seat cards are drawn under these three by `menu-view.ts` rather than
 * listed here: they are a control and not a row.
 */
export function playEntries(a: EntryActions): MenuEntry[] {
  return [
    {
      key: "continue",
      label: "CONTINUE",
      desc: "From the furthest wave this device has reached.",
      run: () => a.carryOn(),
    },
    {
      key: "level",
      label: "DIFFICULTY",
      desc: "How fast everything falls. Three settings, and changing it starts the run again.",
      run: () => a.show("level"),
    },
    {
      key: "rejoin",
      label: "REJOIN",
      desc: "Back into the room you two share. No code to read out.",
      run: () => a.rejoin(),
    },
    {
      key: "room",
      label: "OPEN A ROOM",
      desc: "Open a room and read the code out, or type in the one you were told.",
      run: () => {
        a.close();
        a.openRoom();
      },
    },
  ];
}

/**
 * **The three difficulties**, on a page of their own behind the PLAY page's own
 * row (`sim/difficulty.ts`).
 *
 * One thing changes between them and it is the tempo: everything on this field
 * falls a tile a beat, so the falling speed the owner asked to move *is* the
 * beat. Medium is the game as it has always been, which is why it is the middle
 * row and the one a device that has never chosen is already on.
 *
 * **None of them acts on the first press.** Changing the level takes the run
 * back to the first wave — a wave cleared at one tempo was not cleared at
 * another — so each row asks in place first, the way LEAVE ROOM does and
 * through the same two-step (`menu.ts`, `confirm.ts`). Their `run` is empty
 * for exactly that reason: the press is answered by the question in front of
 * it, and nothing here may reach the action.
 */
export function levelEntries(): MenuEntry[] {
  return [
    {
      key: "easy",
      label: "EASY",
      desc: "A fifth slower than the game as it ships. More time between the beat and the answer.",
      run: () => {},
    },
    {
      key: "medium",
      label: "MEDIUM",
      desc: "The game as it has always been played, and what every wave was authored against.",
      run: () => {},
    },
    {
      key: "hard",
      label: "HARD",
      desc: "A quarter faster. The same waves, with a quarter less of everything to answer them in.",
      run: () => {},
    },
  ];
}

/**
 * The rows behind the spore: everything one person at a desk reaches for.
 *
 * Named by what they do rather than by what they are — SINGLE PLAYER says
 * both seats are on this device, and the two lists say they are jumps rather
 * than a campaign — because the words WAVES and DEMOS were only legible to
 * somebody who already knew how the game is authored.
 *
 * `paintLink` takes SINGLE PLAYER off the page while there is a room, which is
 * exactly as true here as it was on the front page — under `single` now, since
 * `play` is the front page's own row.
 */
export function testingEntries(a: EntryActions): MenuEntry[] {
  return [
    {
      key: "single",
      label: "SINGLE PLAYER",
      desc: "Start over at the first wave, both seats on this device.",
      run: () => a.play(0),
    },
    {
      key: "waves",
      label: "JUMP TO WAVE",
      desc: `All ${WAVES.length} authored waves, each by the sentence it exists for.`,
      run: () => a.show("waves"),
    },
    {
      key: "demos",
      label: "JUMP TO ENEMY TYPE WAVE",
      desc: `One wave per mechanic, ${a.demoCount} in all, already switched on.`,
      run: () => a.show("demos"),
    },
    {
      key: "tuning",
      label: "TUNING",
      desc: "Tempo, the guard window, the intake window — the sliders, while it runs.",
      run: () => {
        a.close();
        a.openTuning();
      },
    },
  ];
}
