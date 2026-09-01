import {
  CONTROL_SETS,
  type ControlSetId,
  controlSet,
  DEFAULT_CONTROL_SET_ID,
} from "@neon-spore/content";
import { autoGrowTextarea, bindGuideFields, setGrownValue } from "./guide-fields.js";
import { wavesWithGuides } from "./guide-waves.js";
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
 * *this wave is not the ordinary thing*. Unlike the boss it needs no panel
 * of its own — every set is a name in `CONTROL_SETS`, so a `<select>` says
 * the whole of it, and `controlsets-page.ts` turns a name into the panel it
 * stands for.
 */
export interface RailPanel {
  render(): void;
}

export function bindRail(store: Store, onSelect: () => void, onEdit: () => void): RailPanel {
  const list = document.getElementById("waveList");
  const name = document.getElementById("fName") as HTMLInputElement | null;
  const sentence = document.getElementById("fSentence") as HTMLTextAreaElement | null;
  const controlsField = document.getElementById("fControlSet") as HTMLSelectElement | null;
  const controlsWhy = document.getElementById("fControlSetWhy");
  const waveCopyBtn = document.getElementById("waveCopy") as HTMLButtonElement | null;
  const waveDelBtn = document.getElementById("waveDel") as HTMLButtonElement | null;

  // One of the four textareas that grow with their content; the other three are the guide's.
  if (sentence) autoGrowTextarea(sentence);

  // Directly under SENTENCE, which is where the owner asked for it: a wave's
  // prose is its name, why it exists, and what the pair has to be told before
  // it starts. See `guide-fields.ts` for why the three fields are built rather
  // than declared in `index.html`.
  const guideFields = bindGuideFields(document.getElementById("guideFields"));

  if (controlsField) {
    controlsField.replaceChildren();
    for (const set of CONTROL_SETS) {
      const opt = document.createElement("option");
      opt.value = set.id;
      opt.textContent = set.name;
      controlsField.appendChild(opt);
    }
  }

  const guideWaves = new Set(wavesWithGuides());
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
      // A third mark: this wave carries a guide, read off the wave itself
      // rather than derived from the campaign. No `title` — a tooltip here
      // is what the owner rejected — and no second copy of the guide's own
      // text, which already sits under SENTENCE (`guideFields.render`,
      // below); this is only a glance-level flag and a shortcut into GAME
      // MECHANICS' GUIDES tab.
      //
      // A span, not a nested button — a button inside a button is invalid
      // markup, and the click needs its own stop or it would also re-select
      // the row. Two clicks: the sheet must open before its own bar has a
      // GUIDES button.
      if (guideWaves.has(i)) {
        const mark = document.createElement("span");
        mark.className = "card-mark";
        mark.textContent = "✎ ";
        mark.addEventListener("click", (e) => {
          e.stopPropagation();
          document.getElementById("statesOpen")?.dispatchEvent(new MouseEvent("click"));
          document
            .querySelector('#statesTabs button[data-tab="guides"]')
            ?.dispatchEvent(new MouseEvent("click"));
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
    if (sentence) setGrownValue(sentence, wave?.sentence ?? "");
    const active = controlSet(wave?.controls);
    if (controlsField) controlsField.value = active.id;
    if (controlsWhy) controlsWhy.textContent = active.why;

    guideFields.render(wave);

    // A boss wave cannot be copied or deleted (see the two guards in
    // `bindAction`, the actual enforcement). `setBossGuard`, below, is the
    // other half: it makes the refusal visible before the press.
    const hasBoss = Boolean(wave?.boss);
    setBossGuard(waveCopyBtn, hasBoss, "A boss wave cannot be duplicated.");
    setBossGuard(waveDelBtn, hasBoss, "A boss wave cannot be deleted.");
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
  sentence?.addEventListener("input", () => {
    const wave = currentWave(store);
    if (!wave || !sentence) return;
    wave.sentence = sentence.value;
    store.dirty = true;
    onEdit();
  });

  // A control set is a shape choice, the same weight as the boss: it changes
  // what the band would draw, not just what a wave says about itself. So it
  // goes through `onSelect` (the caller's full refresh) rather than `onEdit`
  // the way `name`, `sentence` and the guide do.
  controlsField?.addEventListener("change", () => {
    const wave = currentWave(store);
    if (!wave || !controlsField) return;
    const picked = controlsField.value as ControlSetId;
    wave.controls = picked === DEFAULT_CONTROL_SET_ID ? undefined : picked;
    store.dirty = true;
    onSelect();
  });

  // Through `onEdit`, not `onSelect`: a guide is prose like `name` and
  // `sentence`, and restarting the stage on every keystroke of it would make
  // the wave unwritable. What reads it next is the wave note above the fields.
  guideFields.onChange((guide) => {
    const wave = currentWave(store);
    if (!wave) return;
    wave.guide = guide;
    store.dirty = true;
    onEdit();
  });

  bindAction("waveAdd", () => {
    store.waves.push(emptyWave());
    store.index = store.waves.length - 1;
  });
  bindAction("waveCopy", () => {
    const wave = currentWave(store);
    // A boss exists exactly once. Duplicating a boss wave would produce a
    // second wave carrying the same boss, so the action refuses outright
    // rather than quietly stripping the boss from the copy — the owner's
    // sentence was "duplicates of boss cannot exist", not "copies lose it".
    if (!wave || wave.boss) return;
    store.waves.splice(store.index + 1, 0, copyWave(wave));
    store.index += 1;
  });
  bindAction("waveUp", () => move(store, -1));
  bindAction("waveDown", () => move(store, 1));
  bindAction("waveDel", () => {
    const wave = currentWave(store);
    // A boss wave is not one entry among several: deleting it would delete
    // the only place its boss exists, so it is not deletable.
    if (!wave || wave.boss) return;
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

// `.disabled` and `title` are the whole guard now. They used to need inline
// opacity and cursor beside them, because the stylesheet's only `:disabled`
// rule was scoped to `.cell-actions` and `button` sets a flat `color` and
// `cursor: pointer` unconditionally — so a disabled COPY/DELETE rendered
// pixel-identical to a live one. `index.html` carries an unscoped
// `button:disabled` now, which greys every disabled button in the director
// rather than the two this file could reach.
function setBossGuard(btn: HTMLButtonElement | null, hasBoss: boolean, why: string): void {
  if (!btn) return;
  btn.disabled = hasBoss;
  btn.title = hasBoss ? why : "";
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
