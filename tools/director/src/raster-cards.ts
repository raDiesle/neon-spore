import type { RasterCaps } from "@neon-spore/render";
import apngUrl from "../../../assets/raster/burst.apng";
import webpUrl from "../../../assets/raster/burst.webp";
import { el } from "./checks-dom.js";
import { stripDemo } from "./raster-demos.js";

/**
 * The card builders for "THE BURST, THREE WAYS" and the caps table for
 * "WHAT THIS BROWSER CAN DO" — split out of `raster-page.ts` to keep it under
 * the line ceiling. Nothing here runs until `raster-page.ts`'s `drawRaster`
 * calls it, on first click of the tab.
 */

export const DEMO_W = 300;

export function waysCard(label: string, size: string, content: HTMLElement): HTMLElement {
  const card = el("div", "plan holder-card");
  const head = el("div", "head");
  head.appendChild(el("span", "name", label));
  head.appendChild(el("span", "stamp", size));
  card.appendChild(head);
  card.appendChild(content);
  return card;
}

export function apngCard(): HTMLElement {
  const img = document.createElement("img");
  img.src = apngUrl;
  img.width = DEMO_W;
  img.height = DEMO_W;
  img.className = "holder-shot";
  img.alt = "the burst, played from an APNG";
  return img;
}

export function webpCard(): HTMLElement {
  const img = document.createElement("img");
  img.src = webpUrl;
  img.width = DEMO_W;
  img.height = DEMO_W;
  img.className = "holder-shot";
  img.alt = "the burst, played from an animated WebP";
  return img;
}

export function stripCard(): HTMLElement {
  const canvas = document.createElement("canvas");
  canvas.className = "holder-shot";
  stripDemo(canvas, DEMO_W, DEMO_W);
  return canvas;
}

const CAP_ROWS: { key: keyof RasterCaps; label: string; what: string }[] = [
  {
    key: "apng",
    label: "APNG",
    what: "an <img> will play it rather than showing its still fallback.",
  },
  {
    key: "animatedWebp",
    label: "ANIMATED WEBP",
    what: "an <img> will decode it at all.",
  },
  {
    key: "imageDecoder",
    label: "IMAGEDECODER",
    what:
      "WebCodecs' ImageDecoder is present — the only way to ask an animated " +
      "file for frame n instead of letting the wall clock choose.",
  },
  {
    key: "imageBitmap",
    label: "IMAGEBITMAP",
    what: "createImageBitmap is present, so the atlas can be decoded off the main thread.",
  },
];

export function capsTable(caps: RasterCaps): HTMLTableElement {
  const table = document.createElement("table");
  table.className = "concept-table";
  const head = table.insertRow();
  head.insertCell().textContent = "";
  head.insertCell().textContent = "here";
  head.insertCell().textContent = "means";
  for (const row of CAP_ROWS) {
    const tr = table.insertRow();
    tr.insertCell().textContent = row.label;
    tr.insertCell().textContent = caps[row.key] ? "YES" : "no";
    tr.insertCell().textContent = row.what;
  }
  return table;
}
