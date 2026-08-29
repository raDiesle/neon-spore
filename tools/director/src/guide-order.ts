import { WAVES } from "@neon-spore/content";
import { ackBriefing, type World } from "@neon-spore/sim";
import { AUTHORED_WAVE_COUNT, waveLabel, waveOpeningWorld } from "./guide-waves.js";
import { frameWorld, PHONE } from "./pose-art.js";

/**
 * How one wave opens, drawn in order: the introduction, then its guide.
 *
 * The question this answers used to be "which of a wave's several cards comes
 * first". A wave has one guide now, so the sequence is the two states of the
 * opening rather than a queue of subjects — and that is the more useful
 * picture anyway, because the introduction is the new part and the thing a
 * reader has not seen before.
 *
 * Each frame is a real world, posed by `startWave` and stepped forward by the
 * same ack the phone sends, so the second frame is what actually follows the
 * first rather than a second world built to look like it.
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
 * One wave's guide, drawn as the single unredacted `"test"`-role frame — the
 * picture `guide-sheet.ts`'s GUIDES sheet puts under each wave's heading.
 */
export function waveGuideFrame(waveIndex: number, label: string): HTMLElement {
  const world = waveOpeningWorld(waveIndex);
  ackBriefing(world, 1);
  ackBriefing(world, 2);
  return stateFrame(world, label);
}

function render(mount: HTMLElement, waveIndex: number): void {
  mount.replaceChildren();
  const wave = WAVES[waveIndex];

  const summary = document.createElement("p");
  summary.className = "note";
  summary.textContent = wave?.guide
    ? "Two states before the field: the introduction, then the guide. Both hold the wave."
    : "Nothing new here — this wave opens on its introduction and then plays.";
  mount.appendChild(summary);

  const row = document.createElement("div");
  row.className = "scenes";
  row.appendChild(stateFrame(waveOpeningWorld(waveIndex), "INTRODUCTION"));
  if (wave?.guide) row.appendChild(waveGuideFrame(waveIndex, "GUIDE"));
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
