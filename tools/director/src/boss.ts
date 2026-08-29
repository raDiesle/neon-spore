import { AUTHORED_COL_MAX, CREATURES, type Wave } from "@neon-spore/content";
import type { BossEntry, QueenEntry } from "@neon-spore/sim";
import { numberField, placementNote, renderVane, renderWarden } from "./boss-cycles.js";
import { MIRROR_DEFAULT, renderSimonEditor } from "./simon-editor.js";
import { currentWave, isCreaturePlacementBlocked, type Store } from "./state.js";

/**
 * The boss editor. A wave's `boss` field has no cell in the grid — she is not
 * placed at a beat, she is the whole wave — so she gets her own small panel
 * instead of a brush.
 *
 * What each boss *is* comes from `CREATURES` where the boss is a creature
 * kind, and its numbers come from the simulation's own tables. THE MIRROR and
 * THE VANE are the two that have to be written out, because neither is on the
 * field as a creature and so neither has a bestiary entry to read.
 *
 * This file is the queen's form and the choice between the four. The two
 * panels that are mostly a rendered cycle live in `boss-cycles.ts`.
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
function setBoss(wave: Wave, kind: BossEntry["kind"] | null): void {
  if (kind === null) wave.boss = undefined;
  else if (kind === "queen") wave.boss = { ...QUEEN_DEFAULT };
  else if (kind === "warden") wave.boss = { kind: "warden" };
  else if (kind === "vane") wave.boss = { kind: "vane" };
  else wave.boss = { kind: "mirror", rounds: MIRROR_DEFAULT.rounds.map((r) => [...r]) };
}

export function bindBossPanel(store: Store, onEdit: () => void): BossPanel {
  const panel = document.getElementById("bossPanel");

  const render = (): void => {
    if (!panel) return;
    const wave = currentWave(store);
    panel.replaceChildren();
    if (!wave) return;

    const pick = (label: string, kind: BossEntry["kind"] | null): HTMLButtonElement => {
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
    if (wave.boss?.kind !== "warden") bar.appendChild(pick("+ THE WARDEN", "warden"));
    if (wave.boss?.kind !== "vane") bar.appendChild(pick("+ THE VANE", "vane"));
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
    if (wave.boss.kind === "warden") {
      renderWarden(panel, wave.boss, () => {
        store.dirty = true;
        onEdit();
      });
      if (isCreaturePlacementBlocked(wave)) panel.appendChild(placementNote());
      return;
    }
    if (wave.boss.kind === "maze") {
      const blurbZ = document.createElement("p");
      blurbZ.className = "note";
      blurbZ.textContent =
        "A wheel of rings turns behind the ship, with ways in round its rim. " +
        "Both screens see the same light. The wheel is authored in " +
        "packages/content/src/maze-rounds.ts and is not editable here yet.";
      panel.appendChild(blurbZ);
      if (isCreaturePlacementBlocked(wave)) panel.appendChild(placementNote());
      return;
    }
    if (wave.boss.kind === "vane") {
      renderVane(panel, wave.boss, () => {
        store.dirty = true;
        onEdit();
      });
      return;
    }
    const boss = wave.boss;
    // THE GAUGE has nothing to author: no column, no health, no rounds. Its
    // whole difficulty is `config-gauge.ts`, which is the SHIP card's, not
    // this panel's.
    if (boss.kind === "gauge") return;

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
 * One sentence about THE MIRROR. The only boss blurb typed here, because it is
 * the only one that is not a `CreatureKind` and so has no bestiary entry the
 * panel could read instead.
 */
const MIRROR_BLURB =
  "An exact copy of your own ship, upside down at the top of the field and " +
  "the colour of something that went wrong. It performs sequences of your " +
  "own controls and asks for them back.";
