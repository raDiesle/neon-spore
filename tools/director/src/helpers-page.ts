import { AIM_GROUP, BODY_GROUP, MARK_GROUP } from "./helpers-aim.js";
import { CALL_GROUP, LOCK_GROUP } from "./helpers-calls.js";
import type { HelperDef, HelperGroup } from "./helpers-def.js";
import { poseArt } from "./pose-art.js";
import type { Pose } from "./pose-kit.js";
import { poseNamed } from "./poses.js";

/**
 * CONTROLS › HELPERS — every picture the game draws on the field to explain
 * something rather than to be touched: the siren, the scanner box, the
 * gunsight, EMBER, NEXT TO FALL. The owner asked for it on 10 October 2026,
 * beside ON THE FIELD and in its shape (`field-controls-rows.ts`): a frame of
 * the shipping renderer on the seat that is shown the helper, and under it
 * where it stands, whose screen, what it says and the file that draws it.
 *
 * The drawing vocabulary behind these, piece by piece and for a builder, is
 * `docs/controls-catalogue.md`; this page is the reader's half — what a pair
 * is being told, and on which screen.
 */

export const HELPER_GROUPS: readonly HelperGroup[] = [
  CALL_GROUP,
  LOCK_GROUP,
  AIM_GROUP,
  BODY_GROUP,
  MARK_GROUP,
];

/** The same width as an ON THE FIELD row's picture, so the two tabs line up. */
const SHOT_WIDTH = 340;

const SEAT_STAMP: Record<HelperDef["role"], string> = {
  p1: "P1'S SCREEN",
  p2: "P2'S SCREEN",
  test: "BOTH HALVES",
};

/** The row's pose, drawn as the screen and cut the row names. */
export function helperPose(h: HelperDef): Pose {
  const pose = typeof h.pose === "string" ? poseNamed(h.pose) : h.pose;
  if (h.zoom) return { ...pose, role: h.role, crop: "tile", at: h.zoom.at, span: h.zoom.span };
  return { ...pose, role: h.role, crop: h.crop ?? pose.crop };
}

function helperRow(h: HelperDef): HTMLElement {
  const section = document.createElement("section");
  section.className = "field-control";

  const h3 = document.createElement("h3");
  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = SEAT_STAMP[h.role];
  h3.append(stamp, document.createTextNode(h.name));
  section.appendChild(h3);

  const shot = document.createElement("div");
  shot.className = "field-control-shot";
  shot.appendChild(poseArt(helperPose(h), SHOT_WIDTH));
  section.appendChild(shot);

  const look = document.createElement("p");
  look.className = "field-control-look";
  look.textContent = `Look at ${h.lookAt}`;
  section.appendChild(look);

  const dl = document.createElement("dl");
  const row = (term: string, text: string, cls?: string): void => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    if (cls) dd.className = cls;
    dd.textContent = text;
    dl.append(dt, dd);
  };
  row("WHERE", h.where);
  row("SEAT", h.seat);
  row("SAYS", h.says, "does");
  row("SOURCE", `packages/render/src/${h.source}`);
  if (typeof h.pose === "string")
    row("POSE", `${h.pose} — on the STATES sheet, under its own name`);
  section.appendChild(dl);
  return section;
}

function groupHead(g: HelperGroup): HTMLElement {
  const head = document.createElement("div");
  head.className = "field-part";
  const h2 = document.createElement("h2");
  h2.textContent = g.title;
  const sub = document.createElement("p");
  sub.className = "sub";
  sub.textContent = g.sub;
  head.append(h2, sub);
  return head;
}

let drawn = false;

/** The whole tab, once: every row poses a world and draws a canvas. */
export function renderHelpers(): void {
  if (drawn) return;
  const body = document.getElementById("helpersBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren();
  for (const g of HELPER_GROUPS) {
    body.appendChild(groupHead(g));
    for (const h of g.rows) body.appendChild(helperRow(h));
  }
}

/** Drawn on its own tab's first click — before the sheet is mounted, so a
 * reload at `sub=helpers` replays that click into a listener already here. */
export function bindHelpersTab(): void {
  document
    .querySelector<HTMLButtonElement>('#controlsInnerTabs button[data-tab="helpers"]')
    ?.addEventListener("click", renderHelpers);
}
