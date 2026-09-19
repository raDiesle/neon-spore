import { type LinkStatus, linkIsFault } from "@neon-spore/net";
import { chipText } from "./join-words.js";

/**
 * The corner chip: the network indicator, and the door back into the room
 * screen for a player already in one.
 *
 * The chip is gone entirely while there is no room. It used to sit in the
 * corner saying SOLO, which is a button that reports the absence of the
 * thing it opens: nobody reads "SOLO" as "press here for two devices". The
 * way to two devices is the menu now, and the chip comes back the moment
 * there is a room for it to be about.
 *
 * Lifted out of `join.ts`: its text, its three classes and its click are the
 * whole of what it does, and nothing else in that file touches it.
 */
export interface Chip {
  /** Repaints the chip from the link's own status. A no-op with no chip in
   * the page. */
  paint: (status: LinkStatus) => void;
}

export function bindChip(onClick: () => void): Chip {
  const chip = document.getElementById("linkChip") as HTMLButtonElement | null;
  chip?.addEventListener("click", onClick);
  return {
    paint: (status) => {
      if (!chip) return;
      chip.textContent = chipText(status);
      chip.classList.toggle("on", status.state !== "solo");
      chip.classList.toggle("fault", linkIsFault(status.state));
      chip.classList.toggle("live", status.state === "live");
    },
  };
}
