import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE UNDERTOW's one thumb**, in a file of its own, the split every boss
 * since THE INSTAR has made.
 *
 * One row, and **either seat's**. The fight's other answers are controls the
 * ship already has — the cannon and SUCK under a yellow lobe, the shield under
 * a cyan one — so the only thing the field itself has to offer is the lobe
 * left standing too long: tall, twice its height, and bursting through the
 * hull if nobody puts it back.
 *
 * Until the rework of 1 October 2026 there were two rows here, both the
 * navigator's: a pin ring that held a breach shut and a free ring that handed
 * the pilot his seat back. The owner asked for both to go, with the
 * unseating they answered.
 */
export const UNDERTOW_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE UNDERTOW'S TAP",
    where:
      "on a tall lobe itself — as high as it is drawn and a shoulder either " +
      "side — and on nothing else: a standing lobe is its colour's to answer, " +
      "so a thumb there falls through to the cannon strip behind it " +
      "(render/undertow-tap.ts)",
    seat: "either seat — both screens draw the lobes, and the tall one is the one both can see",
    gesture: "press",
    does:
      "Shrinks a tall lobe back to standing, with its count restarted, so it " +
      "is the colour's to answer again (sim/undertow-press.ts undertowTapped). " +
      "Left tall for undertowTallBeats, the lobe bursts: a hole in the hull, " +
      "a breach, and the wave to play again.",
    source: "handles.ts — undertowTapUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "undertowTap",
    sends: ["drag"],
    pose: "THE UNDERTOW · ONE",
  },
];
