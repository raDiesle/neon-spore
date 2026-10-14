/**
 * **A lab's door in the topbar opens its card** on CONTROLS › ON THE FIELD,
 * scrolled to — the owner, 13 October 2026, choosing it over keeping the
 * window over everything or taking the doors out (`docs/queue.md`). Every
 * lab has stood as a card there, beside the gesture it is the bare form of,
 * since 12 October (`field-action-cards.ts`); the door is now only the way
 * in. The window over everything is still what `?pulllab=` and its siblings
 * restore, so `bun run shot` photographs a lab with no clicks (`lab-shell.ts`).
 */

/** Which lab a card holds, as `field-action-cards.ts` marks it in `data-lab`. */
export type LabKind = "pull" | "hold" | "press" | "rub" | "combo" | "lever";

/** Each lab's door, by its id in `index.html`. */
export const LAB_DOORS: readonly { door: string; kind: LabKind }[] = [
  { door: "pullLabOpen", kind: "pull" },
  { door: "holdLabOpen", kind: "hold" },
  { door: "pressLabOpen", kind: "press" },
  { door: "rubLabOpen", kind: "rub" },
  { door: "comboLabOpen", kind: "combo" },
  { door: "leverLabOpen", kind: "lever" },
];

/** The clicks that put CONTROLS › ON THE FIELD up, each by its own wiring. */
export const FIELD_ROOM = {
  sheet: "states",
  open: "statesOpen",
  room: '#statesTabs button[data-tab="controlsets"]',
  page: '#controlsInnerTabs button[data-tab="field"]',
} as const;

/**
 * CONTROLS › ON THE FIELD up, and the first card of `kind` brought to the
 * top of the screen. Each step is the button a person would press, so
 * every listener a sheet, a room and a tab keep runs as it would by hand —
 * the URL, the lazy render, the topbar's lit door (`sheet-doors.ts`). The
 * sheet's door is pressed only while the sheet is shut: pressed while it is
 * open, it goes back to the editor.
 */
export function openLabCard(kind: LabKind): void {
  const sheet = document.getElementById(FIELD_ROOM.sheet);
  if (!sheet?.classList.contains("on")) document.getElementById(FIELD_ROOM.open)?.click();
  document.querySelector<HTMLButtonElement>(FIELD_ROOM.room)?.click();
  document.querySelector<HTMLButtonElement>(FIELD_ROOM.page)?.click();
  // The room is drawn by the clicks themselves, so the card is there now. A
  // jump, not a glide: a glide passes every card above on its way, each fills
  // as it is passed (`when-seen.ts`), and the card it was going to moves down
  // out of reach. Not in a frame callback either: a hidden tab never runs one.
  document
    .querySelector<HTMLElement>(`.field-lab[data-lab="${kind}"]`)
    ?.scrollIntoView({ block: "start" });
}

/** Every lab's door, to its card. */
export function bindLabDoors(): void {
  for (const { door, kind } of LAB_DOORS) {
    document.getElementById(door)?.addEventListener("click", () => openLabCard(kind));
  }
}
