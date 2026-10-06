import { type ControlType, type FieldAction, typeUses, userOf, usersOf } from "./field-actions.js";
import type { FieldControlDef } from "./field-control-def.js";
import { lookOf } from "./field-looks.js";
import { ROW_NOTES } from "./field-notes.js";
import { text } from "./gestures-page.js";
import { poseArt } from "./pose-art.js";
import { poseNamed } from "./poses.js";

/**
 * How CONTROLS › ON THE FIELD draws one action (`field-page.ts` lays them
 * out): its heading with how many enemies and boss waves use it, each control
 * type under it, and under each type **one card per enemy or boss wave** — the
 * same type drawn the way that wave draws it.
 *
 * A card is the picture, who uses it, how the player finds it and what the
 * picture does while the finger moves (`field-looks.ts`). The row's own prose (where, seat,
 * does, source, pose) stays in `FIELD_CONTROLS` and off this page: the owner
 * asked for the action and its users, not the paragraph (6 October 2026).
 */

/** Two pictures side by side fit the sheet's column. */
const SHOT_WIDTH = 240;

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

/** One enemy's or boss wave's use of a type: its rows, drawn once per look —
 * a left and a right handle posed in one frame are one picture. */
function useCard(user: string, rows: readonly FieldControlDef[]): HTMLElement {
  const card = document.createElement("section");
  card.className = "field-use";
  card.appendChild(text("h4", user));
  card.appendChild(text("p", rows.map((r) => r.name).join(" · "), "rows"));
  const shots = document.createElement("div");
  shots.className = "field-use-shots";
  for (const pose of new Set(rows.map((r) => r.pose))) {
    shots.appendChild(poseArt(poseNamed(pose), SHOT_WIDTH));
  }
  card.appendChild(shots);
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

function typeBlock(
  t: ControlType,
  showTitle: boolean,
  byName: ReadonlyMap<string, FieldControlDef>,
): HTMLElement {
  const box = document.createElement("div");
  box.className = `field-type field-type-${t.key}`;
  if (showTitle) {
    const h = text("h3", t.title, "field-type-title");
    h.appendChild(countOf(typeUses(t)));
    box.appendChild(h);
  }
  box.appendChild(text("p", t.says, "says"));
  box.appendChild(text("p", `USED BY · ${usersOf(t.rows).join(" · ")}`, "users"));
  if (t.suggest) box.appendChild(suggested(t.suggest));
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
  head.className = "field-part";
  head.id = `fa-${a.key}`;
  head.appendChild(text("h2", a.title));
  // The count stays out of the h2, whose text is what CONTENTS lists.
  const sub = text("p", ` ${a.says}`, "sub");
  sub.prepend(countOf(uses));
  head.appendChild(sub);
  box.appendChild(head);
  // An action with one type is that type: its title would only repeat the
  // action's own.
  const showTitles = types.length > 1;
  for (const t of types) box.appendChild(typeBlock(t, showTitles, byName));
  return box;
}
