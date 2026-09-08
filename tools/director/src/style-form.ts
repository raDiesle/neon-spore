/**
 * The form half of the STYLE page: how a body is drawn, how big it ships, what
 * makes one nameable, and why a surface is placed rather than posed.
 *
 * Every specimen comes out of `tools/style-guide`, which draws them with
 * `livingPath`, `PALETTE` and `STROKE` — the values the field uses. Nothing
 * here is a picture *of* the look; it is the look, run at a size an eye can
 * read. The same functions write `docs/reference/style-guide.svg`, so the page
 * and the sheet cannot disagree.
 */

import { BULB, type CreatureSilhouette, livingPoints, rimCount } from "@neon-spore/content";
import { PALETTE, STROKE } from "@neon-spore/render";
import { DEPTH_SIZE, DEPTH_STEPS, placed, posed } from "@neon-spore/style-guide/depth.js";
import { body, KINDS } from "@neon-spore/style-guide/form.js";

const CYAN = [PALETTE.cyan, PALETTE.cyanRim, PALETTE.cyanDark] as const;
/** The size a creature ships at, and how much a cell blows it up to be read. */
const SHIPPED = 26;
const MAGNIFY = 3.6;
const LADDER = [11, 20, 26, 40, 96];

/** One specimen in a frame of its own, centred, with room for its aura. */
function specimen(extent: number, markup: string, scale = 1): string {
  const half = (extent * scale) / 2 + 10;
  const side = Math.round(half * 2);
  return `<svg class="sg-spec" viewBox="${-half} ${-half} ${half * 2} ${half * 2}" width="${side}" height="${side}"><g transform="scale(${scale})">${markup}</g></svg>`;
}

function cell(art: string, caption: string, sub = "", dim = false): HTMLElement {
  const div = document.createElement("div");
  div.className = dim ? "sg-cell is-dim" : "sg-cell";
  div.innerHTML = art;
  const name = document.createElement("div");
  name.className = "sg-caption";
  name.textContent = caption;
  div.appendChild(name);
  if (sub) {
    const under = document.createElement("div");
    under.className = "sg-sub";
    under.textContent = sub;
    div.appendChild(under);
  }
  return div;
}

function section(title: string, note: string, cells: HTMLElement[]): HTMLElement {
  const el = document.createElement("section");
  el.className = "sg-section";
  const h2 = document.createElement("h2");
  h2.textContent = title;
  el.appendChild(h2);
  const p = document.createElement("p");
  p.className = "note";
  p.textContent = note;
  el.appendChild(p);
  const row = document.createElement("div");
  row.className = "sg-row";
  for (const c of cells) row.appendChild(c);
  el.appendChild(row);
  return el;
}

/** The shipped draw order, one pass at a time, and then the light going out. */
export function lineSection(): HTMLElement {
  const steps: Array<[string, Parameters<typeof body>[5], boolean]> = [
    ["outline only", {}, false],
    [`+ aura x${STROKE.glowPasses}`, { aura: true }, false],
    ["+ dark fill", { aura: true, fill: true }, false],
    ["+ inner line", { aura: true, fill: true, inner: true }, false],
    ["shot in the wrong colour", { blocked: true }, true],
  ];
  const cells = steps.map(([name, draw, dim]) =>
    cell(
      specimen(SHIPPED, body(BULB, SHIPPED, CYAN[0], CYAN[1], CYAN[2], draw), MAGNIFY),
      name,
      "",
      dim,
    ),
  );
  return section(
    "HOW A BODY IS DRAWN",
    `A bulb at its shipped ${SHIPPED} px, magnified ${MAGNIFY} times so the passes can be told apart. Left to right is the order the renderer works in: the outline at ${STROKE.outline} px, then ${STROKE.glowPasses} aura passes around it, then the dark interior, then the inner line. The last cell is the same creature hit by the wrong colour — same shape, same place, and the light simply gone. That is the message, and it is why nothing else on the field may glow for decoration.`,
    cells,
  );
}

/** The readability floor, made visible instead of quoted. */
export function sizeSection(): HTMLElement {
  const cells = LADDER.map((px) =>
    cell(
      specimen(px, body(BULB, px, CYAN[0], CYAN[1], CYAN[2], { aura: true, fill: true })),
      px === SHIPPED ? `${px} px · shipped` : `${px} px`,
      "",
      px <= 11,
    ),
  );
  return section(
    "HOW BIG IT SHIPS",
    "The same bulb down the ladder, each one drawn at its true size. A creature on the field is 20 to 26 px across. At 11 px, on the left, nothing of a figure survives — which is why a body is made lively by how it moves and never by adding detail to it.",
    cells,
  );
}

/** The nameability axes, side by side: rim count, aspect, and the drawn size. */
export function silhouetteSection(): HTMLElement {
  const cells = KINDS.map(([name, shape]: [string, CreatureSilhouette]) => {
    const pts = livingPoints(shape, 0);
    let w = 0;
    let h = 0;
    for (const p of pts) {
      w = Math.max(w, Math.abs(p.x) * 2);
      h = Math.max(h, Math.abs(p.y) * 2);
    }
    const big = specimen(
      120,
      body(shape, 120, CYAN[0], CYAN[1], CYAN[2], { aura: true, fill: true }),
    );
    const small = specimen(
      SHIPPED,
      body(shape, SHIPPED, CYAN[0], CYAN[1], CYAN[2], { aura: true, fill: true }),
    );
    return cell(
      `${big}${small}`,
      name,
      `${rimCount(shape)} lobes · ${Math.round((w / h) * 100) / 100} wide to tall`,
    );
  });
  return section(
    "ONE WORD, EVERY TIME",
    "The five living shapes, big and then at the size the pair actually sees. All in one colour on purpose: a shape has no colour of its own — it arrives wearing the ammunition that kills it, so the same body is red on one wave and cyan on the next. The two numbers under each are what keeps them apart when they are named out loud.",
    cells,
  );
}

/** The one section that is an argument rather than an inventory. */
export function depthSection(): HTMLElement {
  const el = document.createElement("section");
  el.className = "sg-section";
  const h2 = document.createElement("h2");
  h2.textContent = "WHY A SURFACE TURNS";
  el.appendChild(h2);
  const p = document.createElement("p");
  p.className = "note";
  p.textContent =
    "Eight marks on a body, through half a turn. The top row squashes the whole body at one rate — every mark stays visible and nothing is ever revealed. The bottom row gives each mark its own longitude, so they crowd together at the edge and go behind. Watch the marks, not the outline: the outline is the same in both.";
  el.appendChild(p);

  for (const [label, note, draw] of [
    ["SQUASHED", "one rate, nothing hidden", posed],
    ["TURNED", "each mark on its own longitude", placed],
  ] as const) {
    const row = document.createElement("div");
    row.className = "sg-row sg-turn";
    const name = document.createElement("div");
    name.className = "sg-rowname";
    name.innerHTML = `<b>${label}</b><span>${note}</span>`;
    row.appendChild(name);
    for (let s = 0; s < DEPTH_STEPS; s++) {
      row.appendChild(cell(specimen(DEPTH_SIZE, draw((s / DEPTH_STEPS) * Math.PI)), ""));
    }
    el.appendChild(row);
  }
  return el;
}
