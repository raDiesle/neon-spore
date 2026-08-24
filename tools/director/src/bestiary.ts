import { CREATURES, type CreatureDef } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { boundsOver, SUBJECTS, type Subject } from "@neon-spore/shape-sheet";
import type { SimConfig } from "@neon-spore/sim";

/**
 * What the game currently has, drawn from the game rather than described.
 *
 * Every creature here is an entry in `CREATURES`, every silhouette is the one
 * the shape sheet draws, and every number in the capability list is read off
 * `SimConfig`. Nothing on this panel can go stale without a type error or a
 * missing entry, which is the only kind of inventory worth having.
 */
export function renderBestiary(cfg: SimConfig): void {
  const beasts = document.getElementById("beasts");
  if (beasts) {
    beasts.replaceChildren();
    for (const def of Object.values(CREATURES)) beasts.appendChild(beastRow(def));
    beasts.appendChild(extraRow("POD", "not a creature — cargo, and never cleared"));
  }

  const caps = document.getElementById("caps");
  if (!caps) return;
  caps.replaceChildren();
  for (const cap of capabilities(cfg)) {
    const el = document.createElement("div");
    el.className = "cap";
    const head = document.createElement("b");
    head.textContent = cap.name;
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = cap.value;
    const body = document.createElement("p");
    body.textContent = cap.note;
    el.append(num, head, body);
    caps.appendChild(el);
  }
}

function beastRow(def: CreatureDef): HTMLElement {
  const row = document.createElement("div");
  row.className = "beast";
  row.appendChild(silhouette(def.kind.toUpperCase(), colorOf(def)));

  const text = document.createElement("div");
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = def.kind.toUpperCase();

  const meta = document.createElement("div");
  meta.className = "meta";
  for (const group of def.controls) {
    const tag = document.createElement("span");
    tag.className = `tag ${group}`;
    tag.textContent = group;
    meta.appendChild(tag);
  }
  meta.appendChild(document.createTextNode(def.color ?? "no colour"));

  const blurb = document.createElement("div");
  blurb.className = "blurb";
  blurb.textContent = def.blurb;

  text.append(name, meta, blurb);
  row.appendChild(text);
  return row;
}

function extraRow(subject: string, note: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "beast";
  row.appendChild(silhouette(subject, PALETTE.pod));
  const text = document.createElement("div");
  const name = document.createElement("div");
  name.className = "name";
  name.textContent = subject;
  const blurb = document.createElement("div");
  blurb.className = "blurb";
  blurb.textContent = note;
  text.append(name, blurb);
  row.appendChild(text);
  return row;
}

function colorOf(def: CreatureDef): string {
  if (def.color === "red") return PALETTE.red;
  if (def.color === "cyan") return PALETTE.cyan;
  return PALETTE.rock;
}

const BOX = 58;

/**
 * The contour at rest, through the same functions the canvas calls. Still,
 * not animated: the shape sheet is where motion is judged, and a panel that
 * ran three wobble loops beside a live simulation would be spending frames on
 * a question it is not asking.
 */
function silhouette(name: string, stroke: string): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${BOX} ${BOX}`);
  svg.setAttribute("width", String(BOX));
  svg.setAttribute("height", String(BOX));

  const subject: Subject | undefined = SUBJECTS.find((s) => s.name === name);
  if (!subject) return svg;

  const b = boundsOver(subject, [0]);
  const scale = (BOX - 14) / Math.max(b.x1 - b.x0, b.y1 - b.y0);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", subject.path(subject.pointsAt(0)));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", String(2 / scale));
  path.setAttribute(
    "transform",
    `translate(${BOX / 2} ${BOX / 2}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})`,
  );
  svg.appendChild(path);
  return svg;
}

interface Capability {
  name: string;
  value: string;
  note: string;
}

/**
 * The mechanics a wave can lean on, each anchored to the field that tunes it.
 * The anchor is the point: a mechanic that is removed takes its `SimConfig`
 * field with it, and this list stops typechecking.
 */
function capabilities(cfg: SimConfig): Capability[] {
  return [
    {
      name: "AIM — colour and column",
      value: `${cfg.fireEveryBeats} beats`,
      note: "Player 2 fires the colour, player 1 holds the column. Both or nothing.",
    },
    {
      name: "GUARD — the shared defence",
      value: `${cfg.guardWindowMs} ms`,
      note: "Player 2 places the shield, player 1 triggers it. Position alone is not enough.",
    },
    {
      name: "MAW — taking a pod in",
      value: `${cfg.intakeWindowMs} ms`,
      note: "Player 1 opens the cannon lobe inside out as the pod arrives.",
    },
    {
      name: "POD — shot loose, then caught",
      value: `+${cfg.podRepair} hull`,
      note: `Sinks ${cfg.podFallTilesPerBeat} tiles a beat and drifts ${cfg.podDriftTilesPerBeat} sideways, the way the rng picks.`,
    },
    {
      name: "SCARS — damage that stays",
      value: `${cfg.maxScars} kept`,
      note: "Anything that reaches the hull breaks it visibly and the break does not heal.",
    },
    {
      name: "RADAR — what is coming",
      value: `${cfg.radarLead} beats`,
      note: "The strip above the grid is how far ahead either player can talk about.",
    },
    {
      name: "THE BEAT",
      value: `${cfg.bpm} BPM`,
      note: `A creature enters at the top and reaches the hull ${cfg.rows - 1} beats later.`,
    },
  ];
}
