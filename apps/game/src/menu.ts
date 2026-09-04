import type { MechanicId } from "@neon-spore/content";
import type { LinkStatus } from "@neon-spore/net";
import type { ViewRole } from "@neon-spore/render";
import { bindTwoStep, type TwoStep } from "./confirm.js";
import type { DemoRow } from "./demo-menu.js";
import { roomLine } from "./join-words.js";
import { menuEntries } from "./menu-entries.js";
import type { SettingsHooks } from "./menu-settings.js";
import { buildMenu } from "./menu-view.js";
import { readName } from "./nickname.js";
import { readPartners, roomForPair } from "./pairing.js";
import { progressLine, readProgress } from "./progress.js";
import type { RunState } from "./run-state.js";

/**
 * The main menu, and the way in.
 *
 * It used to be behind `?menu`, because a tester opens the game a hundred
 * times a day to look at one wave and a title screen in front of that is a tap
 * nobody asked for. That reasoning still holds — it is just no longer the
 * majority case. Somebody who opens the address is a player, and a player who
 * lands straight on a field with no seat, no room and no way to reach either
 * has been dropped into the middle of a game.
 *
 * So the default is inverted and the escape hatch is kept: `?play` goes
 * straight to the field with no menu bound at all, which is what
 * `tools/frames` drives and what a tester opening one wave wants. Everything
 * else — the plain address, the director's `/game?menu=1` link, a room link —
 * lands here.
 */
const PLAY_PARAM = "play";

/** Pure, so the rule that decides the front door can be tested. */
export function opensOnMenu(url: string): boolean {
  const parsed = new URL(url, "http://game.invalid/");
  if (parsed.searchParams.has(PLAY_PARAM)) return false;
  return parsed.hash.replace(/^#/, "") !== PLAY_PARAM;
}

export interface MenuBindings {
  jumpToWave: (wave: number) => void;
  /** The four holds. The menu owns exactly one of them, and only when solo. */
  run: RunState;
  /** The wave the field is on, for the RESUME line. */
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
  /** Whether anything has been played yet, which decides RESUME versus PLAY. */
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
  const inRoom = (): boolean => link !== null && link.state !== "solo";

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

  const dom = buildMenu({
    entries: menuEntries({
      resume: () => {
        b.run.hold("hand", false);
        close();
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
    }),
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

  /** The three things on this page that a link changes. Cheap, so it is redone. */
  const paintLink = (): void => {
    dom.setEntry("resume", { on: opened, desc: `Back to wave ${b.wave() + 1}.` });
    dom.setEntry("play", { on: !inRoom() });
    // How far this device has got: the line under the title, and the entry
    // that goes back there. Both off for a device that has never played, and
    // in a room, where the wave is the pair's rather than this device's.
    const far = readProgress();
    dom.setProgress(inRoom() ? "" : progressLine(far));
    dom.setEntry("continue", {
      on: !inRoom() && far.furthest > 0,
      desc: `From wave ${far.furthest + 1}, where this device got to.`,
    });
    // The way back in, once there is somebody to go back to. Off in a room,
    // where the pair is already together, and off before the first meeting,
    // which is what the four-character code is still for.
    const partner = readPartners()[0] ?? "";
    dom.setEntry("rejoin", {
      on: !inRoom() && pairRoom() !== "",
      desc: `Back into the room you and ${partner} share. No code to read out.`,
    });
    dom.setEntry("leave", { on: inRoom() });
    // The entry itself goes off with the room; its question has to go with it,
    // because the row is the entry's sibling rather than its child.
    if (!inRoom()) leaveStep?.cancel();
    dom.setEntry("room", {
      desc: link ? roomLine(link) : "Open a room, or type in the code you were told.",
    });
    dom.lockSeats(
      inRoom() && (link?.player ?? 0) !== 0,
      inRoom() && link?.player
        ? `The room gave you seat ${link.player}. Leave the room to play both halves on this device.`
        : "One device, both seats, or one seat each once you are in a room.",
    );
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
