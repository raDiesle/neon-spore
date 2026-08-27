import { AUTHORED_COL_MAX, CREATURES, type Wave } from "@neon-spore/content";
import {
  DEFAULT_CONFIG,
  type QueenEntry,
  WARDEN_PHASES,
  wardenClampedControl,
  wardenColor,
  wardenReachBeats,
} from "@neon-spore/sim";
import { MIRROR_DEFAULT, renderSimonEditor } from "./simon-editor.js";
import { currentWave, isCreaturePlacementBlocked, type Store } from "./state.js";

/**
 * The boss editor. A wave's `boss` field has no cell in the grid — she is not
 * placed at a beat, she is the whole wave — so she gets her own small panel
 * instead of a brush.
 *
 * What each boss *is* comes from `CREATURES` where the boss is a creature
 * kind, and its numbers come from the simulation's own tables — the Warden's
 * phases are `WARDEN_PHASES` rendered, not a second copy of them typed here.
 * THE MIRROR is the one that has to be written out, because it is not on the
 * field at all and so has no bestiary entry to read.
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
function setBoss(wave: Wave, kind: "queen" | "mirror" | "warden" | null): void {
  if (kind === null) wave.boss = undefined;
  else if (kind === "queen") wave.boss = { ...QUEEN_DEFAULT };
  else if (kind === "warden") wave.boss = { kind: "warden" };
  else wave.boss = { kind: "mirror", rounds: MIRROR_DEFAULT.rounds.map((r) => [...r]) };
}

export function bindBossPanel(store: Store, onEdit: () => void): BossPanel {
  const panel = document.getElementById("bossPanel");

  const render = (): void => {
    if (!panel) return;
    const wave = currentWave(store);
    panel.replaceChildren();
    if (!wave) return;

    const pick = (label: string, kind: "queen" | "mirror" | "warden" | null): HTMLButtonElement => {
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
 * One sentence about THE MIRROR. The only boss blurb typed here, because it is
 * the only one that is not a `CreatureKind` and so has no bestiary entry the
 * panel could read instead.
 */
const MIRROR_BLURB =
  "An exact copy of your own ship, upside down at the top of the field and " +
  "the colour of something that went wrong. It performs sequences of your " +
  "own controls and asks for them back.";

/**
 * THE WARDEN's panel. Its one authored number is the plate count; everything
 * else about it is fixed — it stands dead centre, and its cycle follows from
 * `wardenRow` and how fast a tether falls. So the panel is mostly the cycle
 * itself, rendered from the simulation's own tables so that a retune shows up
 * here without anyone remembering to come and change it.
 */
function renderWarden(
  panel: HTMLElement,
  boss: { kind: "warden"; plates?: number },
  onEdit: () => void,
): void {
  const cfg = DEFAULT_CONFIG;
  const fields = document.createElement("div");
  fields.className = "boss-fields";
  fields.append(
    numberField("plates", 1, 12, boss.plates ?? cfg.wardenPlates, (v) => {
      boss.plates = v;
      onEdit();
    }),
  );
  panel.appendChild(fields);

  const blurb = document.createElement("p");
  blurb.className = "note";
  blurb.textContent = CREATURES.warden.blurb;
  panel.appendChild(blurb);

  const reach = wardenReachBeats(cfg);
  const cycle = document.createElement("table");
  cycle.className = "boss-phases";
  cycle.innerHTML =
    "<tr><th>cycle beat</th><th>what happens</th></tr>" +
    `<tr><td>0</td><td>a line takes the ${wardenClampedControl(0)} (${wardenColor(0)} rim), ` +
    `then the ${wardenClampedControl(1)} (${wardenColor(1)}) next cycle</td></tr>` +
    `<tr><td>0–${reach}</td><td>it draws down that column. Only the other player may pull it</td></tr>` +
    `<tr><td>${reach}–${reach + 2}</td><td>torn in time: the pupil snaps wide, one shot counts</td></tr>` +
    `<tr><td>${reach + 2}</td><td>the iris shuts and vents a rock, torn or not</td></tr>` +
    `<tr><td>${cfg.wardenCycleBeats}</td><td>the next line, on the other control</td></tr>`;
  panel.appendChild(cycle);

  const phases = document.createElement("table");
  phases.className = "boss-phases";
  phases.innerHTML =
    "<tr><th></th><th>plates above</th><th>pupil drift</th><th>vent</th></tr>" +
    WARDEN_PHASES.map(
      (p) =>
        `<tr><td>${p.name}</td><td>${p.above}</td><td>${p.drift}/beat</td><td>${p.vent}</td></tr>`,
    ).join("");
  panel.appendChild(phases);
}

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
