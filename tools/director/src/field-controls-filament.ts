import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE FILAMENT's line, in a file of its own.
 *
 * The split `field-controls-instar.ts` made, for the same reason —
 * `field-controls-page.ts` is at its limit — and with the first target on
 * that page that is a **trace**: one `filament` target, no `id`, one ring
 * a seat, and the grab at a tile the simulation already holds — the head
 * for player 1, the tail for player 2 — so a drag's displacement resolves
 * to a tile of the field and either is the next tile on the filament or is
 * nothing (`sim/filament-hand.ts`, `render/filament-grip.ts`,
 * `docs/spec/bosses.md` §11.33).
 */
export const FILAMENT_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE FILAMENT'S LINE",
    where:
      "a red ring on the armed filament with its word beside it, while it is " +
      "being traced: on the head — the last tile lit — on player 1's screen, " +
      "with the whole path faint ahead of it; on the tail — the tile the " +
      "navigator is on — on player 2's, with only the lit run behind it and " +
      "one lit tile past it; both on the test screen",
    seat:
      "player 1 draws, player 2 follows — one ring each, and neither screen " +
      "shows the other's; the test screen is both",
    gesture: "grab and drag",
    does:
      "DRAW: the pilot's thumb carried a tile along the filament lights it, " +
      "a tile a beat; a second tile in the same beat snaps the filament back " +
      "to its free end. FOLLOW: the navigator's thumb carried onto the next " +
      "lit tile takes it, never the head's — her thumb reaching his is the " +
      "recoil — and never more than filamentGapTiles behind, or the filament " +
      "goes dark and starts again. Her thumb arriving on the root with his " +
      "pulls the filament out of the body, in THE SLOW, and the body is a " +
      "strand narrower; the seventh is the last (sim/filament-hand.ts).",
    source: "touch.ts — filamentGrabUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "filament",
    sends: ["drag"],
    pose: "THE FILAMENT · TRACE",
  },
];
