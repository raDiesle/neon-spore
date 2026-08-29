import {
  BRIEFINGS,
  CONTROL_SETS,
  type ControlSetId,
  controlSet,
  DEFAULT_CONTROL_SET_ID,
} from "@neon-spore/content";
import { bindCardPicker } from "./card-picker.js";
import { cardsForWave, wavesWithCards } from "./card-waves.js";
import { copyWave, currentWave, emptyWave, type Store } from "./state.js";

/**
 * The wave list and the fields every wave must carry.
 *
 * `sentence` sits directly under `name` and above the grid on purpose. It is
 * the test a wave has to pass, and a field you scroll past is a field nobody
 * fills in.
 *
 * The control set sits at the same level as `name` and `sentence` for the
 * same reason `boss.ts` gets its own panel rather than a cell in the grid:
 * *this wave is not the ordinary thing*. Unlike the boss it needs no panel of
 * its own — every set is a name in `CONTROL_SETS`, so a `<select>` says the
 * whole of it, and `controlsets-page.ts` is where a name turns into the panel
 * it stands for.
 */
export interface RailPanel {
  render(): void;
}

export function bindRail(store: Store, onSelect: () => void, onEdit: () => void): RailPanel {
  const list = document.getElementById("waveList");
  const name = document.getElementById("fName") as HTMLInputElement | null;
  const sentence = document.getElementById("fSentence") as HTMLTextAreaElement | null;
  const hint = document.getElementById("fHint") as HTMLTextAreaElement | null;
  const controlsField = document.getElementById("fControlSet") as HTMLSelectElement | null;
  const controlsWhy = document.getElementById("fControlSetWhy");

  // `docs/queue.md` puts this beside CONTROL SET, the other field that says
  // "this wave is not the ordinary thing" — see `card-picker.ts` for why it
  // is built there rather than declared in `index.html`.
  const cardPicker = bindCardPicker(controlsWhy);

  if (controlsField) {
    controlsField.replaceChildren();
    for (const set of CONTROL_SETS) {
      const opt = document.createElement("option");
      opt.value = set.id;
      opt.textContent = set.name;
      controlsField.appendChild(opt);
    }
  }

  const cardWaves = wavesWithCards();
  const renderList = (): void => {
    if (!list) return;
    list.replaceChildren();
    for (const [i, wave] of store.waves.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = i === store.index ? "on" : "";
      const n = document.createElement("span");
      n.className = "n";
      n.textContent = String(i + 1).padStart(2, "0");
      button.append(n);
      // A boss wave is not one entry among several; a small mark says so at a
      // glance without spending a whole tab on the one wave that needs it.
      if (wave.boss) {
        const mark = document.createElement("span");
        mark.className = "boss-mark";
        mark.textContent = wave.boss.kind === "mirror" ? "◑ " : "♛ ";
        button.append(mark);
      }
      // A second mark, not folded into the one above: the boss and the panel
      // are independent choices, and the card-assignment lane is due a third
      // of these — each stays its own span and its own glyph so a fourth mark
      // is one more `if`, not a rewrite of what is already here.
      const set = controlSet(wave.controls);
      if (set.id !== DEFAULT_CONTROL_SET_ID) {
        const mark = document.createElement("span");
        mark.className = "control-mark";
        mark.textContent = "⎈ ";
        mark.title = set.name;
        button.append(mark);
      }
      // A third mark. `cardWaves` reads the shipped `WAVES` the same way
      // `wavesUsingSet` (`control-sets.ts`) already does for the mark above —
      // this list is one editing session's unsaved draft, and the derivation
      // is over the wave order that ships, not that draft. See `card-waves.ts`.
      //
      // A span, not a nested button — `button` already is one, and a button
      // inside a button is invalid markup. The click still needs its own
      // stop: without it, opening the sheet also re-selects the row, which
      // reads as two actions firing off one tap.
      if (cardWaves.has(i)) {
        const mark = document.createElement("span");
        mark.className = "card-mark";
        mark.textContent = "✎ ";
        const names = cardsForWave(i)
          .map((id) => BRIEFINGS[id].title)
          .join(", ");
        mark.title = `opens on: ${names} — click to see every card and its wave`;
        mark.addEventListener("click", (e) => {
          e.stopPropagation();
          document.getElementById("cardsOpen")?.dispatchEvent(new MouseEvent("click"));
        });
        button.append(mark);
      }
      button.append(document.createTextNode(wave.name || "— unnamed —"));
      button.addEventListener("click", () => {
        store.index = i;
        onSelect();
      });
      list.appendChild(button);
    }
  };

  const renderFields = (): void => {
    const wave = currentWave(store);
    if (name) name.value = wave?.name ?? "";
    if (sentence) sentence.value = wave?.sentence ?? "";
    if (hint) hint.value = wave?.hint ?? "";
    const active = controlSet(wave?.controls);
    if (controlsField) controlsField.value = active.id;
    if (controlsWhy) controlsWhy.textContent = active.why;

    cardPicker.render(wave, store.index);
  };

  const render = (): void => {
    renderList();
    renderFields();
  };

  // Typing a name changes the list but must not restart the stage — only the
  // shape of a wave does that, never its prose.
  name?.addEventListener("input", () => {
    const wave = currentWave(store);
    if (!wave || !name) return;
    wave.name = name.value;
    store.dirty = true;
    renderList();
    onEdit();
  });
  for (const [field, key] of [
    [sentence, "sentence"],
    [hint, "hint"],
  ] as const) {
    field?.addEventListener("input", () => {
      const wave = currentWave(store);
      if (!wave || !field) return;
      wave[key] = field.value;
      store.dirty = true;
      onEdit();
    });
  }

  // A control set is a shape choice, the same weight as the boss: it changes
  // what the band would draw, not just what a wave says about itself. So it
  // goes through `onSelect` (the caller's full refresh) rather than `onEdit`
  // the way `name`, `sentence` and `hint` do.
  controlsField?.addEventListener("change", () => {
    const wave = currentWave(store);
    if (!wave || !controlsField) return;
    const picked = controlsField.value as ControlSetId;
    wave.controls = picked === DEFAULT_CONTROL_SET_ID ? undefined : picked;
    store.dirty = true;
    onSelect();
  });

  // Also through `onSelect`: which card a wave raises is not drawn on the
  // stage, but it is exactly what the card sheet (`card-page.ts`) reads next,
  // and `onSelect` is what keeps every panel that reads `store` in step.
  cardPicker.onChange((card) => {
    const wave = currentWave(store);
    if (!wave) return;
    wave.card = card;
    store.dirty = true;
    onSelect();
  });

  bindAction("waveAdd", () => {
    store.waves.push(emptyWave());
    store.index = store.waves.length - 1;
  });
  bindAction("waveCopy", () => {
    const wave = currentWave(store);
    if (!wave) return;
    store.waves.splice(store.index + 1, 0, copyWave(wave));
    store.index += 1;
  });
  bindAction("waveUp", () => move(store, -1));
  bindAction("waveDown", () => move(store, 1));
  bindAction("waveDel", () => {
    if (store.waves.length <= 1) return;
    store.waves.splice(store.index, 1);
    store.index = Math.min(store.index, store.waves.length - 1);
  });

  function bindAction(id: string, act: () => void): void {
    document.getElementById(id)?.addEventListener("click", () => {
      act();
      store.dirty = true;
      onSelect();
    });
  }

  render();
  return { render };
}

/** The stage is rebuilt after a move to reflect the wave's new position. */
function move(store: Store, delta: number): void {
  const to = store.index + delta;
  if (to < 0 || to >= store.waves.length) return;
  const [wave] = store.waves.splice(store.index, 1);
  if (!wave) return;
  store.waves.splice(to, 0, wave);
  store.index = to;
}
