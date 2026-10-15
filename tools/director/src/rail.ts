import { bindRailArrival } from "./rail-arrive.js";
import { moveWave, rowDrag } from "./rail-drag.js";
import { bindRailFilter } from "./rail-filter.js";
import { bindFoldAll } from "./rail-fold-all.js";
import { bindRailFolds } from "./rail-folds.js";
import { dropWave } from "./rail-groups.js";
import { renderRows } from "./rail-list.js";
import { bindWaveSteps } from "./rail-steps.js";
import { bindRailSymbols } from "./rail-symbols.js";
import { copyWave, currentWave, emptyWave, type Store } from "./state.js";
import { bindWaveSettingsFields } from "./wave-settings-fields.js";

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
  // The open row brought into view whenever the list is (`rail-arrive.ts`).
  const arrival = bindRailArrival(list);
  // Waves folded under the wave a drag put them in, and which groups are open
  // (`rail-groups.ts`, `rail-folds.ts`). A filter opens every group: a match
  // folded out of sight would be a match the list did not show.
  const folds = bindRailFolds(() => renderList());
  bindFoldAll(document.getElementById("waveFoldAll"), folds, () => store.waves);
  const folded = (head: number): boolean =>
    !filter.active() && !symbols.active() && !folds.open(store.waves[head]?.id ?? "");

  // NAME, NOTE, the kind of boss and the control set (`wave-settings-fields.ts`).
  const fields = bindWaveSettingsFields(store, {
    select: onSelect,
    edit: onEdit,
    rename: () => renderList(),
  });

  /** The one way a row changes which wave is open, pressed or opened. */
  const select = (i: number): void => {
    store.index = i;
    onSelect();
  };

  // A row let go on another carries its wave there — a head carries its group
  // — or, let go on the row's middle, into that row's group as a child; and
  // the stage is rebuilt for the same reason it is after ↑ and ↓
  // (`rail-drag.ts`, `dropWave`).
  const drag = rowDrag((from, to, zone) => {
    dropWave(store, from, to, zone, folded);
    store.dirty = true;
    onSelect();
  });

  const renderList = (): void => {
    if (!list) return;
    const passes = (waves: Store["waves"], i: number): boolean =>
      filter.passes(waves, i) && symbols.passes(waves, i);
    const matched = renderRows(list, store, passes, select, drag, {
      folded,
      toggle: (head) => folds.toggle(store.waves[head]?.id ?? ""),
    });
    arrival.mark();
    filter.report(matched, store.waves.length, symbols.active());
  };

  const renderFields = (): void => {
    const wave = currentWave(store);
    fields.render();

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

  bindAction("waveAdd", () => {
    store.waves.push(emptyWave(store.waves.map((w) => w.id)));
    store.index = store.waves.length - 1;
  });
  bindAction("waveCopy", () => {
    const wave = currentWave(store);
    // A boss exists exactly once. Duplicating a boss wave would produce a
    // second wave carrying the same boss, so the action refuses outright
    // rather than quietly stripping the boss from the copy — the owner's
    // sentence was "duplicates of boss cannot exist", not "copies lose it".
    if (!wave || wave.boss) return;
    // A copy is folded under the wave it was copied from: copying a wave to
    // vary it is how a group is made (`rail-groups.ts`), and a copy that stood
    // on its own would take the original's variants as its own.
    const copy = copyWave(
      wave,
      store.waves.map((w) => w.id),
    );
    copy.variant = true;
    store.waves.splice(store.index + 1, 0, copy);
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
  moveWave(store, store.index, store.index + delta);
}
