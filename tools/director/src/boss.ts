import { AUTHORED_COL_MAX, CREATURES, type Wave } from "@neon-spore/content";
import type { BossEntry } from "@neon-spore/sim";
import { currentWave, isCreaturePlacementBlocked, type Store } from "./state.js";

/**
 * The boss editor. A wave's `boss` field has no cell in the grid — she is not
 * placed at a beat, she is the whole wave — so she gets her own small panel
 * instead of a brush.
 *
 * The description text is written out here rather than parsed from
 * `docs/spec/bosses.md` the way `planned.ts` reads the bestiary: one boss does
 * not earn that machinery yet. If a second one is built, read both the same
 * way `planned.ts` does, rather than writing a second copy by hand here.
 */
export interface BossPanel {
  render(): void;
}

/** Column and petal count a freshly-added boss starts with. */
const BOSS_DEFAULT: BossEntry = { col: Math.floor(AUTHORED_COL_MAX / 2), petals: 9 };

/**
 * Give the wave a boss, or take it away. The counterpart of `paintPod`/
 * `removePod` in state.ts for the one thing on a wave that is not a cell in
 * the grid.
 */
function toggleBoss(wave: Wave): void {
  wave.boss = wave.boss ? undefined : { ...BOSS_DEFAULT };
}

export function bindBossPanel(store: Store, onEdit: () => void): BossPanel {
  const panel = document.getElementById("bossPanel");

  const render = (): void => {
    if (!panel) return;
    const wave = currentWave(store);
    panel.replaceChildren();
    if (!wave) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = wave.boss ? "REMOVE BOSS" : "+ ADD BOSS: BULB QUEEN";
    toggle.addEventListener("click", () => {
      toggleBoss(wave);
      store.dirty = true;
      onEdit();
    });
    panel.appendChild(toggle);

    if (!wave.boss) return;
    const boss = wave.boss;

    const fields = document.createElement("div");
    fields.className = "boss-fields";
    fields.append(
      numberField("starting column", 0, AUTHORED_COL_MAX, boss.col, (v) => {
        boss.col = v;
        store.dirty = true;
        onEdit();
      }),
      numberField("starting petals", 1, 30, boss.petals, (v) => {
        boss.petals = v;
        store.dirty = true;
        onEdit();
      }),
    );
    panel.appendChild(fields);

    const blurb = document.createElement("p");
    blurb.className = "note";
    blurb.textContent = CREATURES.queen.blurb;
    panel.appendChild(blurb);

    const table = document.createElement("table");
    table.className = "boss-phases";
    table.innerHTML =
      "<tr><th></th><th>above</th><th>bloom every</th><th>tell</th><th>open</th><th>also</th></tr>" +
      "<tr><td>CROWN</td><td>7</td><td>6 beats</td><td>2</td><td>2</td><td>—</td></tr>" +
      "<tr><td>BROOD</td><td>4</td><td>5 beats</td><td>2</td><td>2</td><td>runt</td></tr>" +
      "<tr><td>SCREAM</td><td>0</td><td>4 beats</td><td>1</td><td>2</td><td>runt + rock</td></tr>";
    panel.appendChild(table);

    const rule = document.createElement("p");
    rule.className = "note";
    rule.textContent =
      "She announces a column and a colour, then holds still until she opens. " +
      "The column is the pilot's, the colour is the navigator's — a bloom you " +
      "miss comes back as a rock in the column she opened in.";
    panel.appendChild(rule);

    if (isCreaturePlacementBlocked(wave)) {
      const guard = document.createElement("p");
      guard.className = "note";
      guard.textContent = "creature placement is off on a boss wave — pods and erase still work.";
      panel.appendChild(guard);
    }
  };

  render();
  return { render };
}

function numberField(
  labelText: string,
  min: number,
  max: number,
  value: number,
  onChange: (v: number) => void,
): HTMLElement {
  const row = document.createElement("label");
  row.className = "boss-field";
  const span = document.createElement("span");
  span.textContent = labelText;
  const input = document.createElement("input");
  input.type = "number";
  input.min = String(min);
  input.max = String(max);
  input.value = String(value);
  input.addEventListener("change", () => {
    const next = Number(input.value);
    if (!Number.isInteger(next) || next < min || next > max) {
      input.value = String(value);
      return;
    }
    value = next;
    onChange(next);
  });
  row.append(span, input);
  return row;
}
