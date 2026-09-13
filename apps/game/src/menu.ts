import type { MechanicId } from "@neon-spore/content";
import type { LinkStatus } from "@neon-spore/net";
import type { ViewRole } from "@neon-spore/render";
import { bindTwoStep, type TwoStep } from "./confirm.js";
import type { DemoRow } from "./demo-menu.js";
import { type EntryActions, menuEntries, playEntries, testingEntries } from "./menu-entries.js";
import { inRoom as linkIsRoom, paintLink as paintPage } from "./menu-link.js";
import type { SettingsHooks } from "./menu-settings.js";
import { buildMenu } from "./menu-view.js";
import { readName } from "./nickname.js";
import { readPartners, roomForPair } from "./pairing.js";
import { readProgress } from "./progress.js";
import type { RunState } from "./run-state.js";

/**
 * The main menu, and the way in: the pages, the link, the seat and the two-step
 * in front of LEAVE ROOM. Whether a URL lands here at all is one question with
 * no DOM in it and lives next door (`menu-door.ts`), re-exported so nothing that
 * asked this file for it had to move.
 *
 * **The front page is four rows** (`menu-entries.ts`): PLAY, HOW TO PLAY,
 * SETTINGS and, while there is a room, LEAVE ROOM. The rig is behind the spore,
 * and the two of you meet behind PLAY.
 */
export { opensOnMenu } from "./menu-door.js";

export interface MenuBindings {
  jumpToWave: (wave: number) => void;
  /** The four holds. The menu owns exactly one of them, and only when solo. */
  run: RunState;
  /** The wave the field is on, for CONTINUE's line while one is open. */
  wave: () => number;
  /** The seat the view switch is on, and the way to move it. */
  seat: () => ViewRole;
  setSeat: (role: ViewRole) => void;
  openRoom: () => void;
  /** Join a room by code, with the room screen showing it. */
  joinRoom: (room: string) => void;
  /** Hang up: back to one device, both seats, and the menu. */
  leaveRoom: () => void;
  openTuning: () => void;
  /**
   * This seat is ready — the room's own START, sent by CONTINUE when there is a
   * room and nothing has been played in it yet. The room starts both devices
   * once the other seat says so too (`link.ts`), which is the only way a press
   * on one phone may begin a wave on two.
   */
  ready: () => void;
  /** Show the six pages that say what this game is, and put the menu back
   * afterwards. */
  openIntro: (back: () => void) => void;
  /** What the settings page needs of the rest of the app — see `menu-settings.ts`. */
  settings: SettingsHooks;
  /** One row per mechanic — see `demo-menu.ts`. */
  demos: DemoRow[];
  /** Switches the run to the demonstration's config and opens its wave. */
  openDemo: (id: MechanicId) => void;
}

export interface MainMenu {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  /** The link changed. The room line, the LEAVE entry and the seat lock follow it. */
  update: (status: LinkStatus) => void;
}

export function bindMainMenu(b: MenuBindings): MainMenu {
  /** The way in and the way out: one control, because on a phone it is one act. */
  const chip = document.getElementById("menuChip");
  const isOpen = (): boolean => dom.root.classList.contains("on");
  /** Whether anything has been played yet, which decides what CONTINUE means. */
  let opened = false;
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

  /**
   * LEAVE ROOM's question, once the page it sits on exists. Held here because
   * every way off this page puts it away again: a question that outlives the
   * screen it was asked on is a yes waiting to be pressed by accident.
   */
  let leaveStep: TwoStep | undefined;

  const close = (): void => {
    leaveStep?.cancel();
    dom.root.classList.remove("on");
    document.body.classList.remove("menu-open");
    if (chip) chip.textContent = "☰";
    dom.animate(false);
    b.run.hold("menu", false);
  };
  const open = (): void => {
    dom.show("root");
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
    opened = true;
    b.jumpToWave(wave);
    b.run.hold("hand", false);
    close();
  };
  /** The one way in that also turns switches on before the wave starts. */
  const playDemo = (id: MechanicId): void => {
    opened = true;
    b.openDemo(id);
    b.run.hold("hand", false);
    close();
  };

  // All three lists are handed the same actions: which page a row is drawn on
  // is `menu-entries.ts`'s decision, and nothing here has to know it.
  const actions: EntryActions = {
    /**
     * CONTINUE, and the three things it can mean. A field open under the menu is
     * the commonest case in a room — a room is where the menu does *not* stop
     * the world — and the answer is to get out of the way. With nothing played
     * yet the press is the room's own START, so the two devices begin together:
     * a press that started a wave on one of them would be two people playing two
     * different games. Off the wire, where the row is not drawn at all
     * (`menu-link.ts`), it is the furthest wave this device has reached.
     */
    carryOn: () => {
      if (opened) {
        b.run.hold("hand", false);
        close();
        return;
      }
      if (inRoom()) {
        b.ready();
        close();
        return;
      }
      play(readProgress().furthest);
    },
    play,
    close,
    show: (page) => dom.show(page),
    openRoom: b.openRoom,
    rejoin: () => {
      const room = pairRoom();
      if (room === "") return;
      close();
      b.joinRoom(room);
    },
    openTuning: b.openTuning,
    demoCount: b.demos.length,
    // The menu goes away behind it and comes back when it is done: the intro
    // is drawn on the canvas, and the menu is markup over the canvas
    // (`intro.ts`).
    openIntro: () => {
      close();
      b.openIntro(() => open());
    },
  };

  const dom = buildMenu({
    entries: menuEntries(actions),
    play: playEntries(actions),
    testing: testingEntries(actions),
    openIntro: actions.openIntro,
    demos: b.demos,
    onWave: play,
    onDemo: playDemo,
    settings: b.settings,
    onSeat: (role) => {
      b.setSeat(role);
      dom.paintSeat(role);
    },
  });

  // LEAVE ROOM drops the other player's game, so it asks in place first. Both
  // doors to it get the same two-step; the hold card's own LEAVE ROOM does
  // not, because that one answers a line that is already broken.
  /**
   * The room this device shares with the partner it played with last, or ""
   * when there is nobody to share one with yet. Derived rather than stored —
   * see `pairing.ts`.
   */
  const pairRoom = (): string => {
    const mine = readName();
    const theirs = readPartners()[0] ?? "";
    return mine && theirs ? roomForPair(mine, theirs) : "";
  };

  const leaveEntry = dom.entryRoot("leave");
  if (leaveEntry) {
    leaveStep = bindTwoStep(leaveEntry, "LEAVE", () => {
      b.leaveRoom();
      dom.show("root");
    });
  }

  /**
   * The page, repainted for whatever the link now says (`menu-link.ts`). The
   * one thing that stays here is the question LEAVE ROOM is holding: the entry
   * goes off with the room, and the question has to go with it, because the
   * row is the entry's sibling rather than its child.
   */
  const paintLink = (): void => {
    paintPage({ dom, link, pairRoom: pairRoom(), opened, wave: b.wave() });
    if (!inRoom()) leaveStep?.cancel();
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
