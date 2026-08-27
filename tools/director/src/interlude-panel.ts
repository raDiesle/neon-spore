import type { InterludeEntry, SimConfig, World } from "@neon-spore/sim";
import { playControls } from "./interlude-play.js";

/**
 * The interlude panel — reach it, read it, play it, move it. The boss panel's
 * four answers (`boss.ts`), given to the one authored thing a boss panel never
 * had to cover: a round that is not *this* wave, but the gap in front of it.
 *
 * `GAPS` in `packages/content/src/interludes.ts` is `Record<number,
 * InterludeEntry>`, keyed by the wave the gap precedes — not a field on the
 * wave the way `boss` is, so this panel does not read `Store`. It reads the
 * one number the WAVE tab already has selected (`currentWaveIndex`) and asks
 * whether *that* wave has a gap in front of it, the same question a person
 * standing on the WAVE tab is already asking about everything else there.
 *
 * Playing a round is `interlude-play.ts`'s half — split out on line count,
 * the way `boss-cycles.ts` sits beside `boss.ts`.
 */

/** The gaps being edited, and whether they have been saved since they last changed. */
export interface GapStore {
  gaps: Record<number, InterludeEntry>;
  dirty: boolean;
}

export interface InterludePanel {
  render(): void;
}

/**
 * Every kind this file knows how to add, paired with what a fresh one starts
 * out as — the interlude equivalent of `QUEEN_DEFAULT` in `boss.ts`. One entry
 * today; a second interlude is a second row here and a second case in
 * `blurbFor`, nothing else.
 */
const INTERLUDE_DEFAULTS: Record<InterludeEntry["kind"], InterludeEntry> = {
  gauge: { kind: "gauge" },
};

function blurbFor(kind: InterludeEntry["kind"]): string {
  if (kind === "gauge") {
    return (
      "One needle, two marks. The pilot holds a valve that pushes the needle " +
      "either way — his screen shows the dial with nothing drawn on it to aim " +
      "at. The navigator sees the band the needle has to sit in and cannot " +
      "move anything; her one verb is the call, made when she believes it is " +
      "seated. The band drifts on the beat, so the pair is never done, only " +
      "currently right."
    );
  }
  return kind;
}

async function loadGaps(): Promise<Record<number, InterludeEntry>> {
  try {
    const res = await fetch("/api/interludes");
    if (!res.ok) throw new Error(res.statusText);
    return (await res.json()) as Record<number, InterludeEntry>;
  } catch {
    return {};
  }
}

async function saveGaps(gaps: Record<number, InterludeEntry>): Promise<string | null> {
  try {
    const res = await fetch("/api/interludes", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(gaps),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) return body.error ?? res.statusText;
    return null;
  } catch (err) {
    return String(err);
  }
}

export function bindInterludePanel(
  currentWaveIndex: () => number,
  wavesCount: () => number,
  stageWorld: () => World,
  cfg: SimConfig,
  onPairChanged: () => void,
): InterludePanel {
  const panel = document.getElementById("interludePanel");
  const store: GapStore = { gaps: {}, dirty: false };

  const render = (): void => {
    if (!panel) return;
    panel.replaceChildren();
    const wave = currentWaveIndex();

    if (wave <= 0) {
      const note = document.createElement("p");
      note.className = "note";
      note.textContent =
        "wave zero never opens one — the first thing a pair meets in a run is " +
        "the field, or the game has taught them a round whose rules it then " +
        "throws away (docs/decisions.md #20).";
      panel.appendChild(note);
      return;
    }

    const entry = store.gaps[wave];

    const bar = document.createElement("div");
    bar.className = "boss-pick";
    if (entry) {
      const remove = pickButton("REMOVE INTERLUDE", () => {
        delete store.gaps[wave];
        store.dirty = true;
        render();
      });
      bar.appendChild(remove);
    } else {
      for (const kind of Object.keys(INTERLUDE_DEFAULTS) as InterludeEntry["kind"][]) {
        const add = pickButton(`+ ${kind.toUpperCase()}`, () => {
          store.gaps[wave] = { ...INTERLUDE_DEFAULTS[kind] };
          store.dirty = true;
          render();
        });
        bar.appendChild(add);
      }
    }
    panel.appendChild(bar);

    if (!entry) return;

    const blurb = document.createElement("p");
    blurb.className = "note";
    blurb.textContent = blurbFor(entry.kind);
    panel.appendChild(blurb);

    panel.appendChild(
      moveField(wave, wavesCount(), (target) => {
        delete store.gaps[wave];
        store.gaps[target] = entry;
        store.dirty = true;
        render();
      }),
    );

    panel.appendChild(playControls(entry, wave, cfg, stageWorld, onPairChanged));
    panel.appendChild(saveRow(store, render));
  };

  void loadGaps().then((gaps) => {
    store.gaps = gaps;
    render();
  });

  return { render };
}

export function pickButton(label: string, onClick: () => void): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  el.addEventListener("click", onClick);
  return el;
}

/** "plays before wave #", a number field rather than a drag — nine gaps is a small enough list to type into. */
function moveField(
  wave: number,
  wavesCount: number,
  onMove: (target: number) => void,
): HTMLElement {
  const row = document.createElement("div");
  row.className = "boss-fields";

  const label = document.createElement("label");
  label.className = "field";
  label.textContent = "plays before wave #";
  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.max = String(Math.max(1, wavesCount - 1));
  input.value = String(wave);
  label.appendChild(input);
  row.appendChild(label);

  const go = pickButton("MOVE", () => {
    const target = Math.min(wavesCount - 1, Math.max(1, Math.floor(Number(input.value))));
    if (target !== wave) onMove(target);
  });
  row.appendChild(go);
  return row;
}

function saveRow(store: GapStore, onSaved: () => void): HTMLElement {
  const row = document.createElement("div");
  row.className = "boss-fields";
  const status = document.createElement("span");
  status.className = "note";
  status.textContent = store.dirty ? "unsaved" : "saved";
  const save = pickButton("SAVE GAPS", () => {
    void saveGaps(store.gaps).then((err) => {
      if (err) {
        status.textContent = `save failed: ${err}`;
        return;
      }
      store.dirty = false;
      onSaved();
    });
  });
  row.append(save, status);
  return row;
}
