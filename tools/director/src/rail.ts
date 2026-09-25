import {
  CONTROL_SETS,
  type ControlSetId,
  controlSet,
  DEFAULT_CONTROL_SET_ID,
} from "@neon-spore/content";
import { bindBossTypeField } from "./boss-type-field.js";
import { renderControlSetNote } from "./control-set-note.js";
import { bindRailFilter } from "./rail-filter.js";
import { renderRows } from "./rail-list.js";
import { bindWaveSteps } from "./rail-steps.js";
import { bindRailSymbols } from "./rail-symbols.js";
import { copyWave, currentWave, emptyWave, type Store } from "./state.js";

/**
 * The wave list and the fields every wave must carry.
 *
 * There is no `sentence` field under `name` any more: the owner took it off
 * every wave on 25 September 2026 — *name of wave and number is good enough*.
 * Nor a GUIDE section, which went the same day: *it is enough to navigate in
 * the game itself and see it*. A guide is written in `packages/content`, and
 * read with BRIEFINGS on, on the stage.
 *
 * The control set sits at the same level as `name` for the
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
  const controlsField = document.getElementById("fControlSet") as HTMLSelectElement | null;
  const controlsWhy = document.getElementById("fControlSetWhy");
  const controlsRoster = document.getElementById("fControlSetRoster");
  const waveCopyBtn = document.getElementById("waveCopy") as HTMLButtonElement | null;
  const waveDelBtn = document.getElementById("waveDel") as HTMLButtonElement | null;
  // The two arrows in the tab bar over this column, and the two keys that are
  // the same step without the mouse (`rail-steps.ts`).
  const steps = bindWaveSteps(store, onSelect);
  // The field above the list. It redraws the list and touches nothing else —
  // see `rail-filter.ts` for why it is a typed field and not a row of chips.
  const filter = bindRailFilter(() => renderList());
  // The four marks as presses, ORed with each other and ANDed with the field
  // above — the owner's *either or is enough* (`rail-symbols.ts`).
  const symbols = bindRailSymbols(document.getElementById("waveMarksFilter"), () => renderList());

  // Over the control set, for the reason it is over it in the markup: which
  // kind of boss this is, on the waves that have one (`boss-type-field.ts`).
  const bossTypeField = bindBossTypeField(document.getElementById("bossTypeField"));

  if (controlsField) {
    controlsField.replaceChildren();
    for (const set of CONTROL_SETS) {
      const opt = document.createElement("option");
      opt.value = set.id;
      opt.textContent = set.name;
      controlsField.appendChild(opt);
    }
  }

  /** The one way a row changes which wave is open, pressed or opened. */
  const select = (i: number): void => {
    store.index = i;
    onSelect();
  };

  const renderList = (): void => {
    if (!list) return;
    const passes = (waves: Store["waves"], i: number): boolean =>
      filter.passes(waves, i) && symbols.passes(waves, i);
    filter.report(renderRows(list, store, passes, select), store.waves.length, symbols.active());
  };

  const renderFields = (): void => {
    const wave = currentWave(store);
    if (name) name.value = wave?.name ?? "";
    const active = controlSet(wave?.controls);
    if (controlsField) controlsField.value = active.id;
    if (controlsWhy) controlsWhy.textContent = active.why;
    // What the choice puts in their hands, beside the choice itself.
    renderControlSetNote(controlsRoster, active);

    bossTypeField.render(wave);

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
    steps.render();
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

  // A control set is a shape choice, the same weight as the boss: it changes
  // what the band would draw, not just what a wave says about itself. So it
  // goes through `onSelect` (the caller's full refresh) rather than `onEdit`
  // the way `name` does.
  controlsField?.addEventListener("change", () => {
    const wave = currentWave(store);
    if (!wave || !controlsField) return;
    const picked = controlsField.value as ControlSetId;
    wave.controls = picked === DEFAULT_CONTROL_SET_ID ? undefined : picked;
    store.dirty = true;
    onSelect();
  });

  // Through `onEdit`, unlike the panel: the kind of boss is what the wave says
  // about itself and changes nothing the stage draws.
  bossTypeField.onChange((type) => {
    const wave = currentWave(store);
    if (!wave?.boss) return;
    wave.bossType = type;
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
