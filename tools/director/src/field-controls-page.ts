import type { FieldControlDef } from "./field-control-def.js";
import { BALLOON_CONTROLS } from "./field-controls-balloon.js";

/**
 * The other half of the CONTROLS tab (`controlsets-page.ts`) — split out on
 * line count, the way `handles.ts` split out of `touch.ts` for the same
 * reason: what is touched **on the field itself**, never on the panel below
 * it. It is not a `ControlSet` — `packages/content` has no vocabulary for one
 * of these, because a wave does not pick them by name the way it picks a
 * panel.
 *
 * The list that used to sit under it, of controls tried and set aside, is next
 * door in `tried-controls-page.ts`: this file went over its own limit in turn,
 * and those two lists only ever shared a tab. What one row *is* went the same
 * way when THE PUSH arrived — `field-control-def.ts`, re-exported below so
 * nothing that reached for a `FieldControlDef` through here had to move.
 */

export type { FieldControlDef } from "./field-control-def.js";

export const FIELD_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "GRIP",
    where: "on the field, over anything currently falling",
    seat: "either seat — the field is not split between them",
    gesture: "hold",
    does:
      "Slows whatever the finger landed on for as long as it stays down. " +
      "Letting it through is what costs the hull (sim/grip.ts).",
    source: "touch.ts — creatureAt() under touchDown()",
    holdKind: "grip",
    sends: ["grip"],
  },
  {
    name: "THE PUSH",
    where: "on the same held body, on either screen",
    seat: "either seat — the same hand the grip is",
    gesture: "grab and drag",
    does:
      "Carry the finger a tile sideways and the body under it steps one " +
      "column that way, then stands still for a beat. One hold and two " +
      "gestures, the arrangement the cannon has: the press slows the fall " +
      "and the move takes a lane. Two hands against each other cancel " +
      "(sim/grip-push.ts).",
    source: "touch.ts — the grip branch of touchMove()",
    holdKind: "grip",
    dragTarget: "gripBody",
    sends: ["drag"],
  },
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
    source: "touch-ship.ts — pilot() under shipUnder(), sucksOnLift() on the lift",
    holdKind: "cannon",
    sends: ["intake"],
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
    source: "touch-ship.ts — navigator() under shipUnder(), swipeColor() on the lift",
    holdKind: "shot",
    sends: ["fire"],
  },
  {
    name: "THE MAZE'S STRING",
    where: "on the drum's resting circle, only while the wheel is being read",
    seat: "player 1 — the pilot's half of the round; player 2's press falls through",
    gesture: "grab and drag",
    does: "Turns the wheel by how far the hand has come from where it grabbed.",
    source: "touch.ts — mazeStringUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mazeString",
    sends: ["drag"],
  },
  {
    name: "THE WARDEN'S TETHER",
    where: "on the tether's resting circle, while one hangs from the rim",
    seat: "player 1 — the pilot pulls, player 2 keeps both colours",
    gesture: "grab and drag",
    does:
      "Pulls the line taut; held taut long enough it opens a hatch " +
      "(render/tether.ts, sim/config-boss.ts).",
    source: "touch.ts — wardenRopeUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "wardenTether",
    sends: ["drag"],
  },
  {
    name: "THE LID'S CORD",
    where: "on the cord's resting circle, under every armoured eye on the field",
    seat: "player 1 — the pilot pulls, player 2 keeps both colours",
    gesture: "grab and drag",
    does:
      "Parts the plates over the lens in proportion to the pull, and only " +
      "while they stand fully apart does a shot land. Letting go shuts them " +
      "(sim/lid.ts, render/lid-string.ts). The one drag target that is a " +
      "creature, so the command names which body by id.",
    source: "touch.ts — lidCordUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "lidString",
    sends: ["drag"],
  },
  {
    name: "THE CHOIR'S LEFT ARROW",
    where: "against the left wall of the field, while a membrane is up",
    seat: "player 1 — the pilot makes the gesture, player 2 finishes the body",
    gesture: "grab and drag",
    does:
      "Carried outward — leftward, over the wall it stands against — it opens " +
      "a two-beat window and the whole screen starts shaking. Carried inward " +
      "it is wrong, and the thing sings: the hull pays for the chord. It is " +
      "the alternative to shaking the phone, drawn always rather than behind " +
      "a check, because no browser can be asked reliably whether a shake is " +
      "available (sim/choir-gesture.ts, render/choir-arrows.ts).",
    source: "touch.ts — choirArrowUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "choirLeft",
    sends: ["drag"],
  },
  {
    name: "THE CHOIR'S RIGHT ARROW",
    where: "against the right wall of the field, while a membrane is up",
    seat: "player 1 — the pilot makes the gesture, player 2 finishes the body",
    gesture: "grab and drag",
    does:
      "The same control at the other wall, and the second half of one " +
      "gesture: carried outward inside the window the first one opened, the " +
      "two draw together into a single slick or bulb. Two pulls on one side " +
      "is one gesture done twice and opens nothing (sim/choir-gesture.ts).",
    source: "touch.ts — choirArrowUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "choirRight",
    sends: ["drag"],
  },
  // THE BALLOON's two, next door in `field-controls-balloon.ts` — spread in at
  // the position they belong in, after the four handles that are the pilot's
  // and before the guide's hold, which is not a field control at all.
  ...BALLOON_CONTROLS,
  {
    name: "THE GUIDE'S HOLD",
    where: "anywhere on the screen, while a guide or the ready gate is up",
    seat: "both, independently — each seat fills its own circle",
    gesture: "hold",
    does:
      "Fills this seat's ready circle; the wave starts once both are full " +
      "(sim/briefing.ts). Letting go before it is full empties it again.",
    source:
      "apps/game/src/briefing.ts — bindBriefing(), a second listener on the " +
      "same canvas rather than a case in touch.ts, by design",
    holdKind: null,
    sends: ["brief"],
  },
];

function fieldControlRow(c: FieldControlDef): HTMLElement {
  const section = document.createElement("section");
  section.className = "field-control";

  const h3 = document.createElement("h3");
  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = c.gesture.toUpperCase();
  h3.append(stamp, document.createTextNode(c.name));
  section.appendChild(h3);

  const dl = document.createElement("dl");
  const row = (term: string, text: string, cls?: string): void => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    if (cls) dd.className = cls;
    dd.textContent = text;
    dl.append(dt, dd);
  };
  row("WHERE", c.where);
  row("SEAT", c.seat);
  row("DOES", c.does, "does");
  row("SOURCE", c.source);
  section.appendChild(dl);
  return section;
}

/** ON THE FIELD, built once alongside PANELS — no canvas of its own, so
 * nothing here is worth deferring past `renderControlSets`'s own gate
 * (`controlsets-page.ts`). */
export function renderFieldControls(): void {
  const body = document.getElementById("fieldControlsBody");
  if (!body) return;
  body.replaceChildren();
  for (const c of FIELD_CONTROLS) body.appendChild(fieldControlRow(c));
}
