import { AUTHORED_COL_MAX, CREATURES, type Wave } from "@neon-spore/content";
import type { QueenEntry } from "@neon-spore/sim";
import { MIRROR_DEFAULT, renderSimonEditor } from "./simon-editor.js";
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

/** Column and petal count a freshly-added queen starts with. */
const QUEEN_DEFAULT: QueenEntry = {
  kind: "queen",
  col: Math.floor(AUTHORED_COL_MAX / 2),
  petals: 9,
};

/**
 * Give the wave a boss, or take it away. The counterpart of `paintPod`/
 * `removePod` in state.ts for the one thing on a wave that is not a cell in
 * the grid. A wave carries one boss, so choosing the other replaces it — a
 * wave with two bosses is not a wave anybody has designed.
 */
function setBoss(wave: Wave, kind: "queen" | "mirror" | null): void {
  if (kind === null) wave.boss = undefined;
  else if (kind === "queen") wave.boss = { ...QUEEN_DEFAULT };
  else wave.boss = { kind: "mirror", rounds: MIRROR_DEFAULT.rounds.map((r) => [...r]) };
}

export function bindBossPanel(store: Store, onEdit: () => void): BossPanel {
  const panel = document.getElementById("bossPanel");

  const render = (): void => {
    if (!panel) return;
    const wave = currentWave(store);
    panel.replaceChildren();
    if (!wave) return;

    const pick = (label: string, kind: "queen" | "mirror" | null): HTMLButtonElement => {
      const el = document.createElement("button");
      el.type = "button";
      el.textContent = label;
      el.addEventListener("click", () => {
        setBoss(wave, kind);
        store.dirty = true;
        onEdit();
      });
      return el;
    };

    const bar = document.createElement("div");
    bar.className = "boss-pick";
    if (wave.boss) bar.appendChild(pick("REMOVE BOSS", null));
    if (wave.boss?.kind !== "queen") bar.appendChild(pick("+ BULB QUEEN", "queen"));
    if (wave.boss?.kind !== "mirror") bar.appendChild(pick("+ THE MIRROR", "mirror"));
    panel.appendChild(bar);

    if (!wave.boss) return;
    if (wave.boss.kind === "mirror") {
      const blurbM = document.createElement("p");
      blurbM.className = "note";
      blurbM.textContent = MIRROR_BLURB;
      panel.appendChild(blurbM);
      renderSimonEditor(panel, wave.boss, () => {
        store.dirty = true;
        onEdit();
      });
      if (isCreaturePlacementBlocked(wave)) panel.appendChild(placementNote());
      return;
    }
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

    if (isCreaturePlacementBlocked(wave)) panel.appendChild(placementNote());
  };

  render();
  return { render };
}

/**
 * One sentence about THE MIRROR, written here rather than parsed out of
 * `docs/spec/bosses.md` — the same bargain the queen's phase table makes two
 * panels up. A third boss is the point at which both should be read the way
 * `planned.ts` reads the bestiary instead.
 */
const MIRROR_BLURB =
  "An exact copy of your own ship, upside down at the top of the field and " +
  "the colour of something that went wrong. It performs sequences of your " +
  "own controls and asks for them back.";

function placementNote(): HTMLElement {
  const guard = document.createElement("p");
  guard.className = "note";
  guard.textContent = "creature placement is off on a boss wave — pods and erase still work.";
  return guard;
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
