import type { LinkStatus } from "@neon-spore/net";
import { roomLine } from "./join-words.js";
import type { MenuDom } from "./menu-view.js";
import { readPartners } from "./pairing.js";
import { progressLine, readProgress } from "./progress.js";

/**
 * WHAT A LINK CHANGES ON THE FRONT PAGE.
 *
 * Eight entries, the progress line and the seat lock all say something
 * different once this device is sharing a room, and `bindMainMenu` was the
 * only thing that knew which — a page's worth of `setEntry` calls inside a
 * closure over five other concerns. It is the part of that file with no state
 * of its own: hand it the page, the link and what the device has done, and the
 * same page comes out every time.
 *
 * Lifted out while `menu.ts` sat at its length limit, so the next page added
 * to the menu does not have to be squeezed in beside this.
 */

/**
 * A room is the one case where the menu must **not** stop the world, and it is
 * also what half the lines below are asking about. Exported because
 * `bindMainMenu` asks the same question of the run hold.
 */
export function inRoom(link: LinkStatus | null): boolean {
  return link !== null && link.state !== "solo";
}

export interface LinkPaint {
  dom: MenuDom;
  /** The link as it last reported itself, or null before there was one. */
  link: LinkStatus | null;
  /**
   * The room this device shares with the partner it played with last, or ""
   * when there is nobody to share one with yet — derived by `pairing.ts`, and
   * handed in rather than read here so the caller keeps the one definition.
   */
  pairRoom: string;
  /** Whether anything has been played yet, which decides RESUME versus PLAY. */
  opened: boolean;
  /** The wave the field is on, for the RESUME line. */
  wave: number;
}

/** Cheap, so it is redone rather than diffed. */
export function paintLink({ dom, link, pairRoom, opened, wave }: LinkPaint): void {
  const room = inRoom(link);
  dom.setEntry("resume", { on: opened, desc: `Back to wave ${wave + 1}.` });
  dom.setEntry("play", { on: !room });
  // How far this device has got: the line under the title, and the entry that
  // goes back there. Both off for a device that has never played, and in a
  // room, where the wave is the pair's rather than this device's.
  const far = readProgress();
  dom.setProgress(room ? "" : progressLine(far));
  dom.setEntry("continue", {
    on: !room && far.furthest > 0,
    desc: `From wave ${far.furthest + 1}, where this device got to.`,
  });
  // The way back in, once there is somebody to go back to. Off in a room,
  // where the pair is already together, and off before the first meeting,
  // which is what the four-character code is still for.
  const partner = readPartners()[0] ?? "";
  dom.setEntry("rejoin", {
    on: !room && pairRoom !== "",
    desc: `Back into the room you and ${partner} share. No code to read out.`,
  });
  dom.setEntry("leave", { on: room });
  dom.setEntry("room", {
    desc: link ? roomLine(link) : "Open a room, or type in the code you were told.",
  });
  dom.lockSeats(
    room && (link?.player ?? 0) !== 0,
    room && link?.player
      ? `The room gave you seat ${link.player}. Leave the room to play both halves on this device.`
      : "One device, both seats, or one seat each once you are in a room.",
  );
}
