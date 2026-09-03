import { WAVES } from "@neon-spore/content";
import type { MenuPage } from "./menu-parts.js";
import type { MenuEntry } from "./menu-view.js";
import { readProgress } from "./progress.js";

/**
 * The rows on the menu's front page, in the order they are read.
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
 */

export interface EntryActions {
  /** Hand the field back without starting anything. */
  resume: () => void;
  /** Start at a wave: a fresh run, with the menu closed behind it. */
  play: (wave: number) => void;
  close: () => void;
  show: (page: MenuPage) => void;
  openRoom: () => void;
  openTuning: () => void;
  /** How many demonstration rows there are, for the DEMOS line. */
  demoCount: number;
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
      key: "play",
      label: "PLAY",
      desc: "Start over at the first wave, both seats on this device.",
      run: () => a.play(0),
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
      key: "waves",
      label: "WAVES",
      desc: `All ${WAVES.length} authored waves, each by the sentence it exists for.`,
      run: () => a.show("waves"),
    },
    {
      key: "demos",
      label: "DEMOS",
      desc: `One wave per mechanic, ${a.demoCount} in all, already switched on.`,
      run: () => a.show("demos"),
    },
    {
      key: "keys",
      label: "CONTROLS",
      desc: "The keys, for one person at a desk playing both halves.",
      run: () => a.show("keys"),
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
