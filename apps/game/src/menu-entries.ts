import { WAVES } from "@neon-spore/content";
import type { MenuPage } from "./menu-parts.js";
import type { MenuEntry } from "./menu-rows.js";
import { PARTNERS_KEPT } from "./partners.js";

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
 * is three rows and a decision: play, set it up, and — while there is a room —
 * hang up. HOW TO PLAY was the fourth until the owner took it off on 14
 * September 2026: what it described, the intro now shows, and the way to ask
 * for that again is a row on SETTINGS (`menu-settings.ts`). `playEntries` is
 * the page behind PLAY, where the two of you actually meet: the people this
 * device has played with, the room and CONTINUE. The seat cards were under
 * them until 15 September 2026 and are the rig's now — a pair is dealt its
 * seats by the room, so there was nothing there to press.
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
  /**
   * Straight into the room this device shares with the `i`th person on the
   * PLAY page's list. An index rather than a name or a room: the rows are
   * drawn once and painted over on every link (`menu-link.ts`), so a row that
   * carried the partner it was built with would offer whoever was second on
   * the list the evening the menu was built.
   */
  rejoinWith: (i: number) => void;
  openTuning: () => void;
  /** How many demonstration rows there are, for the DEMOS line. */
  demoCount: number;
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
 * The rows behind PLAY: **the people this device has played with**, and the way
 * to meet somebody new.
 *
 * The owner asked for this page to be a list of partners on 14 September 2026 —
 * *Continue game with David · wave 7* — which is the first exemption under *a
 * look is offered, never replaced*, and it is the shape the page always wanted:
 * a pair who have played before should not read a page about rooms and codes to
 * carry on, and a code is what a *first* meeting is for. So the list comes
 * first, NEW GAME sits under it, and REJOIN — one row for the most recent
 * partner, which is what this list is four of — is gone.
 *
 * **The rows are drawn empty and painted by the link** (`menu-link.ts`), one
 * per partner the store can hold: `setEntry` takes a row off the page rather
 * than the list being rebuilt, which is the same arrangement every other row
 * on this menu is under, and it is what lets the words be a fact about storage
 * while the page stays a pure function of its actions.
 *
 * CONTINUE is still here and half of it has left: the room's START is the
 * READY hold on the room screen now (`join-room-step.ts`), and what the row
 * still answers is the way back to a field open under the menu and the mend
 * of a parted run (`docs/queue.md`). **Nothing here chooses a tempo**, and that
 * is the owner's rule of 15 September 2026: a game that already exists does not
 * change its difficulty. It is picked once, by the host, on the room screen
 * while the game is being made (`join-room-step.ts`), and the way to another is
 * NEW GAME. The gear that stood at the end of a partner's row went with that,
 * and the three tempi behind it with the gear; a device on its own has the
 * rig's sliders (TESTING › TUNING).
 *
 * **No seat here.** The cards are on the rig's page: a pair does not choose a
 * seat — the room deals them by arrival order — and the seat they hold is read
 * off the room screen's own pills (`join-words.ts`).
 */
export function playEntries(a: EntryActions): MenuEntry[] {
  return [
    ...partnerEntries(a),
    {
      key: "room",
      label: "NEW GAME",
      desc: "Open a room and read the code out, or type in the one you were told.",
      run: () => {
        a.close();
        a.openRoom();
      },
    },
    {
      key: "continue",
      label: "CONTINUE",
      desc: "From the furthest wave this device has reached.",
      run: () => a.carryOn(),
    },
  ];
}

/**
 * One row per partner the store keeps, in that order. Every one of them is on
 * the page from the first paint and off it until there is somebody in its
 * place, so `paintLink` names a row by a key that does not move.
 */
function partnerEntries(a: EntryActions): MenuEntry[] {
  // The row says the tempo the two of them played at (`menu-link.ts`
  // `partnerLine`) and offers no way to change it: that is a reading of what
  // they did, never a wish to send.
  return Array.from({ length: PARTNERS_KEPT }, (_, i) => ({
    key: `pair${i}`,
    label: "CONTINUE GAME",
    desc: "Back into the room you two share. No code to read out.",
    run: () => a.rejoinWith(i),
  }));
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
