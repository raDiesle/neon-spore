import { copyWave, currentWave, emptyWave, type Store } from "./state.js";

/**
 * The wave list and the three fields every wave must carry.
 *
 * `sentence` sits directly under `name` and above the grid on purpose. It is
 * the test a wave has to pass, and a field you scroll past is a field nobody
 * fills in.
 */
export interface RailPanel {
  render(): void;
}

export function bindRail(store: Store, onSelect: () => void, onEdit: () => void): RailPanel {
  const list = document.getElementById("waveList");
  const name = document.getElementById("fName") as HTMLInputElement | null;
  const sentence = document.getElementById("fSentence") as HTMLTextAreaElement | null;
  const hint = document.getElementById("fHint") as HTMLTextAreaElement | null;

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
