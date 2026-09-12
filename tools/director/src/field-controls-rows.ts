import type { FieldControlDef } from "./field-control-def.js";
import { FIELD_CONTROLS } from "./field-controls-page.js";
import { poseArt } from "./pose-art.js";
import { poseNamed } from "./poses.js";

/**
 * How one row of the ON THE FIELD tab is drawn — out of `field-controls-page.ts`
 * when every row got a picture and that file was at its limit.
 *
 * The picture is a gallery pose, by name, drawn with the shipping renderer at
 * the moment the control is answered in — the same frame the STATES sheet
 * shows under that name, so a reader can find it there and see it move. Text
 * under it says where on the picture to look, in the pose's own words.
 */

/** Same width as a PANELS card's band, so the two pages line up. */
const SHOT_WIDTH = 340;

function fieldControlRow(c: FieldControlDef): HTMLElement {
  const section = document.createElement("section");
  section.className = "field-control";

  const h3 = document.createElement("h3");
  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = c.gesture.toUpperCase();
  h3.append(stamp, document.createTextNode(c.name));
  section.appendChild(h3);

  const pose = poseNamed(c.pose);
  const shot = document.createElement("div");
  shot.className = "field-control-shot";
  shot.appendChild(poseArt(pose, SHOT_WIDTH));
  section.appendChild(shot);
  const look = document.createElement("p");
  look.className = "field-control-look";
  look.textContent = `Look at ${pose.lookAt ?? pose.note}`;
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
  row("WHERE", c.where);
  row("SEAT", c.seat);
  row("DOES", c.does, "does");
  row("SOURCE", c.source);
  row("POSE", `${c.pose} — on the STATES sheet, under its own name`);
  section.appendChild(dl);
  if (c.examples) section.appendChild(c.examples());
  return section;
}

/** ON THE FIELD, built once alongside PANELS: every row poses a world and
 * draws a canvas now, so it sits behind `renderControlSets`'s own gate
 * (`controlsets-page.ts`) the way the PANELS cards do. */
export function renderFieldControls(): void {
  const body = document.getElementById("fieldControlsBody");
  if (!body) return;
  body.replaceChildren();
  for (const c of FIELD_CONTROLS) body.appendChild(fieldControlRow(c));
}
