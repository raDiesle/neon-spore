import type { Hold } from "@neon-spore/render";
import type { DragTarget } from "@neon-spore/sim";

/**
 * The other half of the CONTROLS tab (`controlsets-page.ts`) — split out on
 * line count, the way `handles.ts` split out of `touch.ts` for the same
 * reason. Two lists: what is touched **on the field itself**, and what used
 * to be but was set aside. Neither is a `ControlSet` — `packages/content` has
 * no vocabulary for either, because a wave does not pick them by name the way
 * it picks a panel.
 */

/**
 * A control touched **on the field**, never on the panel below it — grabbed,
 * held or pressed directly against the creatures, the hull or a rope hanging
 * from a boss. None of these has a `ControlDef`: they follow from what a wave
 * *contains* (a maze, a warden, something falling), not from a panel it
 * names.
 *
 * `holdKind` and `dragTarget` exist so `on-field-controls.test.ts` can check
 * this array against `touch.ts`'s own types without retyping them: a new
 * `Hold` kind or `DragTarget` that this file does not mention fails that
 * test's exhaustive switch to *compile*, which is the closest a hand-kept
 * list can get to being derived from code that is a decision procedure
 * rather than a data table.
 */
export interface FieldControlDef {
  name: string;
  /** Where on the field it appears, and under what condition. */
  where: string;
  /** Which seat may use it — the field belongs to both, so this is the one
   * fact a strip's position already gives away for free and a field control
   * has to say out loud. */
  seat: string;
  gesture: "press" | "hold" | "grab and drag";
  does: string;
  /** The function in `touch.ts` (or, for the guide, in `briefing.ts`) that
   * answers this control — read the code there, this is only a pointer. */
  source: string;
  /** The `Hold["kind"]` this entry documents, or `null` where — like the
   * guide's hold — the control is deliberately answered outside `touch.ts`
   * altogether and no `Hold` variant exists for it. */
  holdKind: Hold["kind"] | null;
  /** Set only when `holdKind` is `"drag"` — which rope or string this is. */
  dragTarget?: DragTarget;
}

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
  },
  {
    name: "THE CANNON",
    where: "on the cannon swelling itself, wherever it is standing on the hull",
    seat: "player 1 — the pilot's own lobe; player 2's press on it loads instead",
    gesture: "grab and drag",
    does:
      "Slides the cannon along the hull, the same absolute column the strip " +
      "in the band sends. A second way to reach a control that already " +
      "exists, never a replacement for the strip.",
    source: "touch-ship.ts — pilot() under shipUnder()",
    holdKind: "cannon",
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
  },
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

/**
 * A control the game was played with before something else replaced it —
 * kept because the owner asked to, not because it is still reachable by any
 * wave. The write-up stays in the spec; this only names the section and
 * quotes nothing beyond it, so the two cannot say different things about
 * the same idea.
 */
export interface TriedControlDef {
  name: string;
  /** Where the write-up lives, named so a reader can find it with a text
   * search rather than a line number that will move. */
  specHeading: string;
  note: string;
}

export const TRIED_CONTROLS: readonly TriedControlDef[] = [
  {
    name: "HOLD-TO-TEAR",
    specHeading:
      "bosses.md 11.4 — Hold-to-tear, a window closed by succeeding rather than by giving up",
    note:
      "THE WARDEN's tether before the pull replaced it: hold, and only hold — " +
      "no drag, no direction, a thumb on the line that accumulates ticks " +
      "toward a tear. Implemented and working, not merely designed; the owner " +
      "asked for it kept and possibly tested on another wave or boss.",
  },
];

function triedControlRow(c: TriedControlDef): HTMLElement {
  const section = document.createElement("section");
  section.className = "tried-control";
  const h3 = document.createElement("h3");
  h3.textContent = c.name;
  section.appendChild(h3);
  const note = document.createElement("p");
  note.textContent = c.note;
  section.appendChild(note);
  const ref = document.createElement("p");
  ref.className = "ref";
  ref.textContent = c.specHeading;
  section.appendChild(ref);
  return section;
}

/** TRIED AND SET ASIDE, built once alongside PANELS — see `renderFieldControls`. */
export function renderTriedControls(): void {
  const body = document.getElementById("controlsTriedBody");
  if (!body) return;
  body.replaceChildren();
  for (const c of TRIED_CONTROLS) body.appendChild(triedControlRow(c));
}
