import { type ControlType, type FieldAction, typeUses, userOf, usersOf } from "./field-actions.js";
import type { FieldControlDef } from "./field-control-def.js";
import type { TouchArea } from "./field-focus.js";
import { cardArea, focusArt } from "./field-focus-art.js";
import { lookOf } from "./field-looks.js";
import { ROW_NOTES } from "./field-notes.js";
import { GESTURE_NOTES } from "./field-notes-gestures.js";
import { numbersBlock } from "./field-numbers.js";
import { stillsStrip } from "./field-stills-art.js";
import { compareStills, type StillsUse } from "./field-stills-compare.js";
import { LEAST_TARGET, narrowest } from "./field-touch-paint.js";
import { openTry } from "./field-try.js";
import { GESTURES } from "./gesture-catalogue.js";
import { card, text } from "./gestures-page.js";
import { openZoom, type ZoomView, zoomable } from "./picture-zoom.js";
import { poseNamed } from "./poses.js";

/**
 * How CONTROLS › ON THE FIELD draws one action (`field-page.ts` lays them
 * out): its heading with how many enemies and boss waves use it, each control
 * type under it, and under each type **one card per enemy or boss wave** — the
 * same type drawn the way that wave draws it.
 *
 * A card is the picture — cut to the control and enlarged on a click
 * (`field-focus-art.ts`, `picture-zoom.ts`) — who uses it, how the player finds it and what the
 * picture does while the finger moves (`field-looks.ts`). The row's own prose (where, seat,
 * does, source, pose) stays in `FIELD_CONTROLS` and off this page: the owner
 * asked for the action and its users, not the paragraph (6 October 2026).
 */

/** Two pictures side by side fit the sheet's column. */
const SHOT_WIDTH = 240;
/** Tallest a card's picture is drawn; a click draws it again as tall as the
 * window (`picture-zoom.ts`). */
const SHOT_CAP = 300;

export function suggested(line: string): HTMLElement {
  const p = text("p", "", "suggested");
  p.appendChild(text("b", "SUGGESTED "));
  p.appendChild(document.createTextNode(line));
  return p;
}

/** A wave's name as it is alphabetised: THE HIVE under H. */
const bare = (name: string): string => name.replace(/^THE /, "");

function countOf(n: number): HTMLElement {
  return text("span", `${n} ${n === 1 ? "USE" : "USES"}`, "count");
}

/** Under a card's picture: how wide its narrowest touch patch is, in red
 * under the platforms' least target (`field-touch-paint.ts`). */
function touchLine(area: TouchArea): HTMLElement {
  const least = narrowest(area);
  if (least === null) return text("p", "TOUCH AREA · not found on this frame", "touch-size");
  const line = text("p", `TOUCH AREA · narrowest ${Math.round(least)} pt`, "touch-size");
  if (least < LEAST_TARGET) line.classList.add("small");
  return line;
}

/** One enemy's or boss wave's use of a type: its rows, drawn once per look —
 * a left and a right handle posed in one frame are one picture. */
function useCard(user: string, rows: readonly FieldControlDef[]): HTMLElement {
  const card = document.createElement("section");
  card.className = "field-use";
  card.appendChild(text("h4", user));
  card.appendChild(text("p", rows.map((r) => r.name).join(" · "), "rows"));
  const shots = document.createElement("div");
  shots.className = "field-use-shots";
  for (const name of new Set(rows.map((r) => r.pose))) {
    const pose = poseNamed(name);
    const own = rows.filter((r) => r.pose === name);
    const title = `${user} · ${own.map((r) => r.name).join(" · ")}`;
    const views: ZoomView[] = [
      { label: "THE CONTROL", draw: (w, h) => focusArt(pose, own, w, h) },
      { label: "TOUCH AREA", draw: (w, h) => focusArt(pose, own, w, h, "touch") },
      { label: "WHOLE PHONE", draw: (w, h) => focusArt(pose, own, w, h, "whole") },
      {
        label: "STILLS",
        draw: (w, h) => stillsStrip(pose, own, Math.floor(w / 3) - 8, (h - 60) / 2),
      },
    ];
    const shot = document.createElement("div");
    shot.appendChild(zoomable(focusArt(pose, own, SHOT_WIDTH, SHOT_CAP), title, views));
    // The same frame, live and under the mouse (`field-try.ts`), and its
    // moments before, under and after AUTO's thumb (`field-stills-art.ts`).
    const play = text("button", "▶ TRY IT", "field-try");
    play.addEventListener("click", () => openTry(title, pose, own));
    const stills = text("button", "▤ STILLS", "field-try");
    stills.addEventListener("click", () => openZoom(title, views, views.length - 1));
    const buttons = document.createElement("div");
    buttons.className = "field-try-row";
    buttons.append(play, stills);
    shot.appendChild(touchLine(cardArea(pose, own)));
    shot.appendChild(buttons);
    shots.appendChild(shot);
  }
  card.appendChild(shots);
  const numbers = numbersBlock(rows.map((r) => r.name));
  if (numbers) card.appendChild(numbers);
  const look = lookOf(rows.map((r) => r.name));
  if (look) {
    const dl = document.createElement("dl");
    for (const [term, said] of [
      ["FIND IT", look.find],
      ["WHILE YOU MOVE", look.move],
    ] as const) {
      dl.append(text("dt", term), text("dd", said));
    }
    card.appendChild(dl);
  }
  for (const r of rows) {
    const note = ROW_NOTES[r.name];
    if (note) card.appendChild(suggested(note));
  }
  return card;
}

/**
 * The generic gestures an action or a type is made of, drawn before its uses
 * — the owner, 9 October 2026: *"GESTURES THE GAME READS … are first picture
 * of each categories above related."* What is left of that list, used by no
 * action, is drawn under its old heading (`field-page.ts`).
 */
export function concepts(names: readonly string[] | undefined): HTMLElement | null {
  if (!names?.length) return null;
  const box = document.createElement("div");
  box.className = "field-concepts gesture-grid";
  for (const name of names) {
    const g = GESTURES.find((x) => x.name === name);
    if (!g) continue;
    const c = card(g);
    c.classList.add("field-concept");
    const note = GESTURE_NOTES[g.name];
    if (note) c.appendChild(suggested(note));
    box.appendChild(c);
  }
  return box;
}

/** Every gesture an action or one of its types draws first. */
export const placedGestures = (a: FieldAction): string[] => [
  ...(a.gestures ?? []),
  ...a.types.flatMap((t) => t.gestures ?? []),
];

/** A type's uses as the comparison lists them: one per enemy or boss wave
 * and picture, in the cards' own order. */
function stillsUses(t: ControlType, byName: ReadonlyMap<string, FieldControlDef>): StillsUse[] {
  return [...usersOf(t.rows)]
    .sort((a, b) => bare(a).localeCompare(bare(b)))
    .flatMap((user) => {
      const rows = t.rows
        .filter((name) => userOf(name) === user)
        .flatMap((name) => byName.get(name) ?? []);
      return [...new Set(rows.map((r) => r.pose))].map((pose) => ({
        user,
        pose: poseNamed(pose),
        rows: rows.filter((r) => r.pose === pose),
      }));
    });
}

function typeBlock(
  t: ControlType,
  showTitle: boolean,
  byName: ReadonlyMap<string, FieldControlDef>,
): HTMLElement {
  const box = document.createElement("div");
  box.className = `field-type field-type-${t.key}`;
  if (showTitle) {
    const h = text("h3", t.title, "field-type-title");
    // A step in the page's outline: named by the bar, not listed.
    h.dataset.depth = "3";
    h.dataset.label = t.title;
    h.appendChild(countOf(typeUses(t)));
    box.appendChild(h);
  }
  box.appendChild(text("p", t.says, "says"));
  box.appendChild(text("p", `USED BY · ${usersOf(t.rows).join(" · ")}`, "users"));
  if (t.suggest) box.appendChild(suggested(t.suggest));
  const own = concepts(t.gestures);
  if (own) box.appendChild(own);
  const compare = text("button", "▤ COMPARE ALL USES", "field-try");
  compare.addEventListener("click", () =>
    openZoom(`${t.title} · EVERY USE`, [
      { label: "STILLS", draw: (w) => compareStills(stillsUses(t, byName), w) },
    ]),
  );
  box.appendChild(compare);
  const grid = document.createElement("div");
  grid.className = "field-uses";
  for (const user of [...usersOf(t.rows)].sort((a, b) => bare(a).localeCompare(bare(b)))) {
    const rows = t.rows
      .filter((name) => userOf(name) === user)
      .map((name) => byName.get(name))
      .filter((r): r is FieldControlDef => r !== undefined);
    grid.appendChild(useCard(user, rows));
  }
  box.appendChild(grid);
  return box;
}

/** An action's heading and every type under it, in the order given. The
 * heading carries the id CONTENTS jumps to (`bindContents`, `tabs.ts`). */
export function actionSection(
  a: FieldAction,
  uses: number,
  types: readonly ControlType[],
  byName: ReadonlyMap<string, FieldControlDef>,
): HTMLElement {
  const box = document.createElement("div");
  box.className = "field-action";
  const head = document.createElement("div");
  head.className = "field-part depth-2";
  head.id = `fa-${a.key}`;
  const h2 = text("h2", a.title);
  h2.dataset.depth = "2";
  head.appendChild(h2);
  // The count stays out of the h2, whose text is what CONTENTS lists.
  const sub = text("p", ` ${a.says}`, "sub");
  sub.prepend(countOf(uses));
  head.appendChild(sub);
  box.appendChild(head);
  const own = concepts(a.gestures);
  if (own) box.appendChild(own);
  // An action with one type is that type: its title would only repeat the
  // action's own.
  const showTitles = types.length > 1;
  for (const t of types) box.appendChild(typeBlock(t, showTitles, byName));
  return box;
}
