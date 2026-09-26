import type { FieldControlDef } from "./field-control-def.js";

/**
 * The ship's own handles on the field — the cannon, its maw, the shield's
 * plate and trigger, and the navigator's muzzle — cut out of
 * `field-controls-page.ts` when that file came within twenty lines of its
 * ceiling (26 September 2026). They are one group because they are the only
 * rows whose seat is decided by the hull rather than by a wave: each is a lobe
 * of the ship, and which player's press it answers is the ship's arrangement.
 * Spread back in where they always stood, so the page's order is unchanged.
 */
export const SHIP_FIELD_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CANNON",
    where: "on the cannon swelling itself, wherever it is standing on the hull",
    seat: "player 1 — the pilot's own lobe; player 2's press on it loads instead",
    gesture: "grab and drag",
    does:
      "Slides the cannon along the hull, the same absolute column the strip " +
      "in the band sends. A second way to reach a control that already " +
      "exists, never a replacement for the strip. A hand that takes hold and " +
      "carries it nowhere is the maw instead — see THE MAW TAP below.",
    source: "touch-ship.ts — pilot() under shipUnder()",
    holdKind: "cannon",
    sends: ["cannonCol"],
    pose: "HULL · AT REST",
  },
  {
    name: "THE MAW TAP",
    where: "on the same cannon swelling, on player 1's screen",
    seat: "player 1 — the pilot's own lobe, and their own second gesture on it",
    gesture: "press",
    does:
      "Let go of the cannon without having carried it anywhere and the maw " +
      "opens, the same window the SUCK lobe in the band opens. Carry it a " +
      "column and the lift says nothing: one swelling, two gestures, and the " +
      "lift is what tells them apart — exactly as player 2's muzzle already " +
      "works one seat over. Only on a panel that has a maw on it at all.",
    source: "touch-ship.ts — pilot() under shipUnder(); touch-hand.ts — sucksOnLift() on the lift",
    holdKind: "cannon",
    sends: ["intake"],
    pose: "MAW · OPEN",
  },
  {
    name: "THE SHIELD PLATE",
    where: "on the shield swelling itself, wherever it is standing on the hull",
    seat: "player 2 — the navigator aims it; player 1's press on it fires it",
    gesture: "grab and drag",
    does:
      "Slides the shield along the hull, the same absolute column the strip " +
      "in the band sends. It still does nothing until player 1 triggers it.",
    source: "touch-ship.ts — navigator() under shipUnder()",
    holdKind: "shield",
    sends: ["shieldCol"],
    pose: "SHIELD · ARMED",
  },
  {
    name: "THE SHIELD TRIGGER",
    where: "on the same shield swelling, on player 1's screen",
    seat: "player 1 — the pilot fires what player 2 has aimed",
    gesture: "press",
    does:
      "Opens the guard window where the plate is standing, and does not move " +
      "it. The trigger and the aim in different hands is the rule the whole " +
      "defence rests on, and pressing the plate does not cross it.",
    source: "touch-ship.ts — pilot() under shipUnder()",
    holdKind: "guard",
    sends: ["guard"],
    pose: "WARD · DEFLECTED",
  },
  {
    name: "THE MUZZLE SWIPE",
    where: "on the cannon swelling, on player 2's screen only",
    seat: "player 2 — the navigator holds both colours and no cannon",
    gesture: "grab and drag",
    does:
      "Carry the muzzle left for red or right for cyan and let go: the lift " +
      "fires, the press says nothing, and a hand that comes back to the " +
      "middle fires nothing at all. Left and right are the order the two " +
      "colours stand in on player 2's own band.",
    source:
      "touch-ship.ts — navigator() under shipUnder(); touch-hand.ts — swipeColor() on the lift",
    holdKind: "shot",
    sends: ["fire"],
    pose: "SHOT · BEING LAID",
  },
];
