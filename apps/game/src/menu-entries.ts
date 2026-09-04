import { WAVES } from "@neon-spore/content";
import type { MenuPage } from "./menu-parts.js";
import type { MenuEntry } from "./menu-view.js";
import { readProgress } from "./progress.js";

/**
 * The rows on the menu's two lists of entries, in the order they are read.
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
 * **There are two lists, and the seam is who the row is for.** The front page
 * is the game: come back to it, carry on, meet the other phone, learn what
 * this is, set it up. `testingEntries` is the rig — one person at a desk with
 * both seats, jumping at a wave or a mechanic, moving the sliders while it
 * runs — and it lives one press away behind TESTING rather than beside
 * CONTINUE, where it was four of the eleven things a player read first. The
 * keys are the same argument taken further: they are a preference of the
 * device rather than a way in, so CONTROLS is reached from SETTINGS.
 */

export interface EntryActions {
  /** Hand the field back without starting anything. */
  resume: () => void;
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
      key: "resume",
      label: "RESUME",
      desc: "Back to the field.",
      run: () => a.resume(),
    },
    {
      key: "continue",
      label: "CONTINUE",
      desc: "From the furthest wave this device has reached.",
      run: () => a.play(readProgress().furthest),
    },
    {
      key: "rejoin",
      label: "REJOIN",
      desc: "Back into the room you two share. No code to read out.",
      run: () => a.rejoin(),
    },
    {
      key: "room",
      label: "TWO DEVICES",
      desc: "Open a room and read the code out, or type in the one you were told.",
      run: () => {
        a.close();
        a.openRoom();
      },
    },
    {
      key: "what",
      label: "WHAT THIS IS",
      desc: "Six pages on what the two of you are about to do. Shown once, on the first visit.",
      run: () => a.openIntro(),
    },
    {
      key: "how",
      label: "HOW TO PLAY",
      desc: "The two seats, and the one rule that is the whole game.",
      run: () => a.show("how"),
    },
    {
      key: "testing",
      label: "TESTING",
      desc: "One device, both seats: start over, jump at a wave or a mechanic, move the sliders.",
      run: () => a.show("testing"),
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
 * The rows behind TESTING: everything one person at a desk reaches for.
 *
 * Named by what they do rather than by what they are — SINGLE PLAYER says
 * both seats are on this device, and the two lists say they are jumps rather
 * than a campaign — because the words WAVES and DEMOS were only legible to
 * somebody who already knew how the game is authored.
 *
 * The keys are the same `key` strings as before, so `paintLink` in `menu.ts`
 * goes on taking SINGLE PLAYER off the page while there is a room, which is
 * exactly as true here as it was on the front page.
 */
export function testingEntries(a: EntryActions): MenuEntry[] {
  return [
    {
      key: "play",
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
