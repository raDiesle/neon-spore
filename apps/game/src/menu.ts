import type { MechanicId } from "@neon-spore/content";
import type { LinkStatus } from "@neon-spore/net";
import { heldRoom } from "./last-room.js";
import type { MainMenu, MenuBindings } from "./menu-bindings.js";
import { type EntryActions, menuEntries, playEntries, testingEntries } from "./menu-entries.js";
import { inRoom as linkIsRoom, paintLink as paintPage } from "./menu-link.js";
import type { MenuPage } from "./menu-parts.js";
import { bindMenuSteps } from "./menu-steps.js";
import { buildMenu } from "./menu-view.js";
import { pairsHere as pairs } from "./pairing.js";

export type { MainMenu, MenuBindings } from "./menu-bindings.js";
/**
 * The main menu, and the way in: the pages, the link, the seat and the two-step
 * in front of LEAVE ROOM (`menu-steps.ts`). Whether a URL lands here at all is
 * one question with no DOM in it and lives next door (`menu-door.ts`),
 * re-exported so nothing that asked this file for it had to move.
 *
 * **The front page is three rows** (`menu-entries.ts`): PLAY, SETTINGS and,
 * while there is a room, LEAVE ROOM. The rig is behind the spore, and the two
 * of you meet behind PLAY. HOW TO PLAY was the fourth until the owner took it
 * off on 14 September 2026; the intro scene it pointed at is a row on SETTINGS
 * now (`menu-settings.ts`).
 *
 * **The chip is the way out as well as the way in.** A menu opened over a
 * running field — which in a room it always is, since the menu does not stop
 * the world there — closes on its own chip, and that is the whole of the way
 * back to the field. CONTINUE used to be a row for it, and for two other
 * things, and the owner took the row off on 17 September 2026
 * (`menu-entries.ts` says where each answer went).
 */
export { opensOnMenu } from "./menu-door.js";

export function bindMainMenu(b: MenuBindings): MainMenu {
  /** The way in and the way out: one control, because on a phone it is one act. */
  const chip = document.getElementById("menuChip");
  const isOpen = (): boolean => dom.root.classList.contains("on");
  let link: LinkStatus | null = null;

  /**
   * A room is the one case where the menu must **not** stop the world.
   *
   * The tick is the two devices' shared clock: one of them halting it is not a
   * pause, it is a stall the other phone sees as a fault (`docs/architecture`,
   * and the note at the end of the `net-change` skill). So while there is a
   * room the menu draws over a game that keeps running, and a pause that both
   * players share is a thing the wire cannot say yet.
   */
  const inRoom = (): boolean => linkIsRoom(link);

  const close = (): void => {
    steps.cancel();
    dom.root.classList.remove("on");
    document.body.classList.remove("menu-open");
    if (chip) chip.textContent = "☰";
    dom.animate(false);
    b.run.hold("menu", false);
  };
  const open = (page: MenuPage = "root"): void => {
    dom.show(page);
    dom.paintSeat(b.seat());
    paintLink();
    dom.root.classList.add("on");
    document.body.classList.add("menu-open");
    if (chip) chip.textContent = "✕";
    dom.animate(true);
    b.run.hold("menu", !inRoom());
  };
  /** Every way out of the menu into the field is the same three things. */
  const play = (wave: number): void => {
    b.jumpToWave(wave);
    b.run.hold("hand", false);
    close();
  };
  /** The one way in that also turns switches on before the wave starts. */
  const playDemo = (id: MechanicId): void => {
    b.openDemo(id);
    b.run.hold("hand", false);
    close();
  };

  // All three lists are handed the same actions: which page a row is drawn on
  // is `menu-entries.ts`'s decision, and nothing here has to know it.
  const actions: EntryActions = {
    play,
    close,
    show: (page) => dom.show(page),
    openRoom: b.openRoom,
    rejoinWith: (i) => {
      const one = pairs()[i];
      if (!one || one.room === "") return;
      close();
      // **And no tempo with it.** The room keeps its own and hands it to both
      // phones; the level on a partner's record is a reading of what the two of
      // them played at, never a wish to send (`pairing.ts`). A game that
      // already exists does not change its difficulty — NEW GAME is the way to
      // another (the owner, 15 September 2026).
      b.joinRoom(one.room);
    },
    openTuning: b.openTuning,
    demoCount: b.demos.length,
  };

  // The menu goes away behind it and comes back when it is done: the intro is
  // drawn on the canvas, and the menu is markup over the canvas (`intro.ts`).
  // Asked for from SETTINGS' own WHAT THIS IS row now that HOW TO PLAY is gone,
  // so it is handed over with the rest of that page's hooks rather than as a
  // row's action.
  const openIntro = (): void => {
    close();
    b.openIntro(() => open());
  };

  const dom = buildMenu({
    entries: menuEntries(actions),
    play: playEntries(actions),
    testing: testingEntries(actions),
    demos: b.demos,
    onWave: play,
    onDemo: playDemo,
    settings: { ...b.settings, openIntro },
    // The top button (`menu-rejoin.ts`). It goes through the same door REJOIN
    // goes through — the room screen opens on it, because the pair still have
    // to press START — and the room screen is where a room that has emptied in
    // the meantime says so.
    onRejoin: (room) => {
      close();
      b.joinRoom(room);
    },
    onSeat: (role) => {
      b.setSeat(role);
      dom.paintSeat(role);
    },
  });

  const steps = bindMenuSteps(dom, b);

  /**
   * The page, repainted for whatever the link now says (`menu-link.ts`). The
   * one thing that stays here is the question LEAVE ROOM is holding: the entry
   * goes off with the room, and the question has to go with it, because the
   * row is the entry's sibling rather than its child.
   */
  const paintLink = (): void => {
    paintPage({
      dom,
      link,
      pairs: pairs(),
      // `Date.now` and not a frame clock: this is how long ago a person was in
      // a room, which the simulation's tick counter says nothing about.
      held: heldRoom(Date.now()),
      wave: b.wave(),
    });
    if (!inRoom()) steps.cancelLeave();
  };

  document.body.classList.add("has-menu");
  chip?.classList.add("on");
  chip?.addEventListener("click", () => (isOpen() ? close() : open()));

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    if (isOpen()) close();
    else open();
  });

  paintLink();

  return {
    open,
    close,
    isOpen,
    update: (status) => {
      link = status;
      if (isOpen()) {
        // A room that arrived while the menu was up takes the hold off: the
        // world must not be stopped on one of two devices.
        b.run.hold("menu", !inRoom());
        paintLink();
      }
    },
  };
}
