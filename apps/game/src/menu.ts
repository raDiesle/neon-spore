import type { MechanicId } from "@neon-spore/content";
import type { LinkStatus } from "@neon-spore/net";
import { DIFFICULTIES } from "@neon-spore/sim";
import { bindTwoStep, type TwoStep } from "./confirm.js";
import type { MainMenu, MenuBindings } from "./menu-bindings.js";
import {
  type EntryActions,
  levelEntries,
  menuEntries,
  playEntries,
  testingEntries,
} from "./menu-entries.js";
import { inRoom as linkIsRoom, paintLink as paintPage } from "./menu-link.js";
import type { MenuPage } from "./menu-parts.js";
import { buildMenu } from "./menu-view.js";
import { readName } from "./nickname.js";
import { readPartners, roomForPair } from "./pairing.js";
import { readProgress } from "./progress.js";

export type { MainMenu, MenuBindings } from "./menu-bindings.js";
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
   * Whether the run in this room is no longer trustworthy: the two worlds have
   * parted and neither phone is playing the other's game any more
   * (`link-run.ts`'s fingerprints). It is what turns CONTINUE from *back to the
   * field* into *start again, together* — going back to a field that has forked
   * is going back to nothing.
   */
  const broken = (): boolean => link?.state === "desync";

  /**
   * LEAVE ROOM's question, once the page it sits on exists. Held here because
   * every way off this page puts it away again: a question that outlives the
   * screen it was asked on is a yes waiting to be pressed by accident.
   */
  let leaveStep: TwoStep | undefined;

  const close = (): void => {
    leaveStep?.cancel();
    for (const step of levelSteps) step.cancel();
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
      if (opened && !broken()) {
        b.run.hold("hand", false);
        close();
        return;
      }
      if (inRoom()) {
        // **The menu stays up.** This press is half of a start: the room needs
        // the other seat's too, and a phone that closed the menu on its own
        // press would be sitting in front of a field that is not running with
        // nothing saying what it is waiting for. The row itself says it
        // (`menu-link.ts`), and beat zero is what takes the menu away
        // (`shell.ts`), on both phones at once.
        b.ready();
        paintLink();
        return;
      }
      // A parted run off the wire cannot happen — there is no second world to
      // part from — so what is left here is the ordinary solo press.
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
    levels: levelEntries(),
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
   * The three difficulties, each behind the question LEAVE ROOM is behind:
   * changing the level takes the run back to the first wave (`progress.ts`), so
   * a row that acted on one press would be a wave count lost to a thumb landing
   * while the page was still arriving.
   */
  const levelSteps: TwoStep[] = [];
  for (const level of DIFFICULTIES) {
    const row = dom.entryRoot(level);
    if (!row) continue;
    levelSteps.push(
      bindTwoStep(row, "START AGAIN", () => {
        if (level !== b.level()) b.setLevel(level);
        dom.show("play");
      }),
    );
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
