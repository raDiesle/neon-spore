import { BRIEFINGS } from "@neon-spore/content";
import { BRIEFING_SUBJECTS, type BriefingId } from "@neon-spore/sim";
import { AUTHORED_WAVE_COUNT, waveBriefingWorld, waveLabel } from "./card-waves.js";
import { frameWorld, PHONE } from "./pose-art.js";

/**
 * The card sheet's third question, drawn: not every card, one wave's actual
 * due list — the order and the count a fresh pair would really raise it in,
 * which is a different thing from listing the catalogue.
 *
 * Each frame is the same world with `brief.due` cut down to what is left at
 * that point in the sequence, so the counter in the corner ("NEW — 2 TO
 * READ", then "NEW") reads the same as it would on the phone stepping through
 * them one tap at a time — `card-waves.ts` builds the due list once and this
 * file only ever narrows it.
 */

function cardFrame(world: ReturnType<typeof waveBriefingWorld>, seat: string): HTMLElement {
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

function render(mount: HTMLElement, waveIndex: number): void {
  mount.replaceChildren();
  const world = waveBriefingWorld(waveIndex);
  const due = [...world.brief.due];
  const subjects: BriefingId[] = due.map((i) => BRIEFING_SUBJECTS[i]!);

  const summary = document.createElement("p");
  summary.className = "note";
  summary.textContent =
    subjects.length === 0
      ? "Nothing due — a fresh pair has already met everything this wave sends."
      : `A fresh pair opens on ${subjects.length} card${subjects.length === 1 ? "" : "s"}, in this order: ${subjects
          .map((s) => BRIEFINGS[s].title)
          .join(" → ")}.`;
  mount.appendChild(summary);

  const row = document.createElement("div");
  row.className = "scenes";
  for (let k = 0; k < due.length; k++) {
    world.brief.due = due.slice(k);
    row.appendChild(cardFrame(world, `CARD ${k + 1} OF ${due.length}`));
  }
  mount.appendChild(row);
}

/**
 * The picker and the frames it drives, built once into `mount`. Every
 * authored wave answers the same question the check names for wave 1, so a
 * button per wave rather than a single fixed frame — reusing the plain
 * `<button>`/`.on` styling the tab bars already carry, since this page adds
 * no stylesheet of its own.
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
