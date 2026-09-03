import { brushArtImage } from "./brush-art.js";
import { BRUSH_MECHANIC, firstWaveFor } from "./brush-wave.js";
import { BRUSHES, type Brush } from "./brushes.js";

/** How big the hover card's picture is. Large enough to be looked *at* — the
 * chip in the palette is small enough that a shell's plating and a clasp's
 * bubble are a texture rather than a thing. */
const CARD_ART = 148;
/** Clear of the pointer, so the card never opens under the cursor and
 * flickers itself shut. */
const GAP = 12;

/**
 * The hover text for a brush: the wave that first introduces what it paints,
 * named by number and by name since a number alone is hard to hold, or the
 * plain fact that no wave carries it yet. `undefined` for a brush that paints
 * nothing (`ERASE`), which has no such answer to give.
 */
export function brushTooltip(brush: Brush): string | undefined {
  if (!BRUSH_MECHANIC[brush]) return undefined;
  const wave = firstWaveFor(brush);
  return wave ? `First in WAVE ${wave.number} · ${wave.name}` : "No wave carries this yet";
}

function line(className: string, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  return el;
}

/**
 * What a brush is, on one card: its picture at a size worth looking at, its
 * name, the wave it first arrives in, and the sentence the bestiary already
 * writes about it.
 *
 * The three facts were all reachable before and none of them were together.
 * The picture was 34 px in a chip; the description was hidden behind SHOW
 * DESCRIPTIONS, which is a switch about the *whole* palette and so is either
 * off when one brush is being wondered about or on when twenty are being
 * scanned; and the wave lived in a `title` attribute, which the browser draws
 * as a grey box of system text a second and a half after the pointer stops,
 * and which cannot hold a picture at all.
 */
export function brushCard(brush: Brush): HTMLElement | null {
  const spec = BRUSHES.find((b) => b.brush === brush);
  if (!spec) return null;
  const card = document.createElement("div");
  card.className = "brush-card";
  const art = brushArtImage(brush, CARD_ART);
  if (art) card.appendChild(art);
  card.appendChild(line("brush-card-name", spec.label));
  const wave = brushTooltip(brush);
  if (wave) card.appendChild(line("brush-card-wave", wave));
  if (spec.note) card.appendChild(line("brush-card-note", spec.note));
  // The way to that wave, said where the wave is named. A modifier on a click
  // is the one kind of control nothing on screen can advertise by itself: the
  // palette lights the brushes it works on while the key is down
  // (`palette.ts`), and this is the sentence that says the key exists at all.
  if (firstWaveFor(brush)) card.appendChild(line("brush-card-jump", "Ctrl-click to open it"));
  return card;
}

/** The one card on the page. Shared: only one thing is hovered at a time, and
 * a card per brush would rebuild an image on every render of the palette. */
let host: HTMLElement | null = null;

function tipHost(): HTMLElement {
  if (!host) {
    host = document.createElement("div");
    host.id = "brushTip";
    host.hidden = true;
    document.body.appendChild(host);
  }
  return host;
}

/** Beside the anchor if the window has room to its right, over it on the left
 * if it has not — and never off the bottom. Measured after the card is in the
 * document, since its height depends on how long the description runs. */
function place(tip: HTMLElement, anchor: HTMLElement): void {
  const at = anchor.getBoundingClientRect();
  const box = tip.getBoundingClientRect();
  const right = at.right + GAP;
  const x = right + box.width <= window.innerWidth - 4 ? right : at.left - GAP - box.width;
  const y = Math.min(Math.max(4, at.top), window.innerHeight - box.height - 4);
  tip.style.left = `${Math.max(4, x)}px`;
  tip.style.top = `${Math.max(4, y)}px`;
}

/**
 * Show the card for `brush` while the pointer is on `anchor`.
 *
 * Bound per element rather than once on the document: the palette and the map
 * both rebuild their buttons wholesale on every edit, and a delegated listener
 * would have to look a brush up out of the DOM — which means writing the brush
 * into a data attribute and reading it back as a string, one more place the
 * set of brushes is spelled out.
 */
export function bindBrushCard(anchor: HTMLElement, brush: Brush): void {
  const open = (): void => {
    const card = brushCard(brush);
    if (!card) return;
    const tip = tipHost();
    tip.replaceChildren(card);
    tip.hidden = false;
    place(tip, anchor);
  };
  const shut = (): void => {
    if (host) host.hidden = true;
  };
  anchor.addEventListener("pointerenter", open);
  anchor.addEventListener("pointerleave", shut);
  // A click paints, and the palette rebuilds under the pointer: the card would
  // otherwise be left open beside a button that no longer exists.
  anchor.addEventListener("click", shut);
}
