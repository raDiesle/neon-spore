import { WAVES } from "@neon-spore/content";
import { guidePages, guideStepHeard, type World } from "@neon-spore/sim";
import { AUTHORED_WAVE_COUNT, waveLabel, waveOpeningWorld } from "./guide-waves.js";
import { frameWorld, PHONE } from "./pose-art.js";

/**
 * How one wave opens, drawn in order: every page of its guide, ending on the
 * gate that carries the wave's own name.
 *
 * The question this answers used to be "which of a wave's several cards comes
 * first". A wave has one guide now, and that guide is a stack of pages the pair
 * turns itself (`packages/sim/src/guide-steps.ts`) — so the sequence is those
 * pages, in the order a pair meets them.
 *
 * **Each frame is a real world**, posed by `startWave` and walked forward by
 * the same `guideStep` a thumb on NEXT sends, so page four is what actually
 * follows page three rather than a fourth world built to look like it. It used
 * to draw two frames, one labelled INTRODUCTION and one labelled GUIDE, and
 * after the pages landed the first of those was page one of the guide under a
 * heading that said otherwise.
 */

function stateFrame(world: World, seat: string): HTMLElement {
  const framed = frameWorld(
    world,
    "test",
    "full",
    PHONE.width,
    undefined,
    undefined,
    Number.POSITIVE_INFINITY,
  );
  const box = document.createElement("div");
  box.className = "scene";
  const shot = document.createElement("div");
  shot.className = "scene-shot";
  shot.appendChild(framed.canvas);
  box.appendChild(shot);
  const label = document.createElement("p");
  label.className = "seat";
  label.textContent = seat;
  box.appendChild(label);
  return box;
}

/**
 * Every page of one wave's guide, in order, as unredacted `"test"`-role frames
 * — the pictures `guide-sheet.ts`'s GUIDES sheet puts under each wave's
 * heading, and what the ORDER page shows in a row.
 *
 * A fresh world per page rather than one world redrawn: `frameWorld` keeps the
 * canvas it drew into, so two frames off one world would be two references to
 * one picture. Walking each world forward from the top costs nothing anybody
 * can measure and is the honest way round.
 */
export function waveGuideFrames(waveIndex: number, label: string): HTMLElement[] {
  const pages = guidePages(waveOpeningWorld(waveIndex));
  const out: HTMLElement[] = [];
  for (let page = 0; page < pages; page++) {
    const world = waveOpeningWorld(waveIndex);
    for (let i = 0; i < page; i++) {
      guideStepHeard(world, 1, false);
      guideStepHeard(world, 2, false);
    }
    const last = page === pages - 1;
    out.push(stateFrame(world, `${label} · ${last ? "READY" : `PAGE ${page + 1}`}`));
  }
  return out;
}

function render(mount: HTMLElement, waveIndex: number): void {
  mount.replaceChildren();
  const wave = WAVES[waveIndex];

  const summary = document.createElement("p");
  summary.className = "note";
  summary.textContent = wave?.guide
    ? "The pages this wave's guide is read in, ending on the gate both seats have to answer."
    : "Nothing new here — this wave opens on its introduction and then plays.";
  mount.appendChild(summary);

  const row = document.createElement("div");
  row.className = "scenes";
  if (wave?.guide) row.append(...waveGuideFrames(waveIndex, "GUIDE"));
  else row.appendChild(stateFrame(waveOpeningWorld(waveIndex), "INTRODUCTION"));
  mount.appendChild(row);
}

/**
 * The picker and the frames it drives, built once into `mount`. Every authored
 * wave answers the same question, so a button per wave rather than a single
 * fixed frame — reusing the plain `<button>`/`.on` styling the tab bars
 * already carry, since this page adds no stylesheet of its own.
 */
export function bindOrderPicker(mount: HTMLElement): void {
  const bar = document.createElement("div");
  bar.className = "soundbar";

  const frames = document.createElement("div");

  const select = (i: number, buttons: HTMLButtonElement[]): void => {
    for (const b of buttons) b.classList.toggle("on", Number(b.dataset.wave) === i);
    render(frames, i);
  };

  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < AUTHORED_WAVE_COUNT; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.wave = String(i);
    b.textContent = waveLabel(i);
    b.className = i === 0 ? "on" : "";
    b.addEventListener("click", () => select(i, buttons));
    buttons.push(b);
    bar.appendChild(b);
  }

  mount.appendChild(bar);
  mount.appendChild(frames);
  render(frames, 0);
}
