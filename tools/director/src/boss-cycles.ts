import { CREATURES } from "@neon-spore/content";
import {
  DEFAULT_CONFIG,
  VANE_CYCLE,
  VANE_CYCLE_BEATS,
  VANE_PHASES,
  vanePivotCol,
  vaneStageStart,
  WARDEN_PHASES,
  wardenColor,
} from "@neon-spore/sim";

/**
 * The two boss panels that are mostly a cycle, and the chrome all of them
 * share.
 *
 * Both of these render the simulation's own tables — `WARDEN_PHASES`,
 * `VANE_CYCLE`, `VANE_PHASES` — rather than a copy typed here, so a retune
 * shows up in the editor without anybody remembering to come and change it.
 * That is also why they are not in `boss.ts` any more: the queen's panel is a
 * form with two numbers on it, these two are documentation generated out of
 * the sim, and one file holding both went over the line limit.
 */

export function numberField(
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

export function placementNote(): HTMLElement {
  const guard = document.createElement("p");
  guard.className = "note";
  guard.textContent = "creature placement is off on a boss wave — pods and erase still work.";
  return guard;
}

/**
 * THE WARDEN's panel. Its one authored number is the plate count; everything
 * else about it is fixed — it stands dead centre, and the fight is the rope
 * rather than a clock, so the table below says what the pair does rather than
 * what beat it happens on.
 */
export function renderWarden(
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

  const cycle = document.createElement("table");
  cycle.className = "boss-phases";
  cycle.innerHTML =
    "<tr><th>cycle beat</th><th>what happens</th></tr>" +
    `<tr><td>0</td><td>a rope is lowered from the middle of the rim, ` +
    `${wardenColor(0)} on this cycle and ${wardenColor(1)} on the next</td></tr>` +
    "<tr><td>any</td><td>player 1 pulls the handle aside. The hatch and the " +
    "eyelids open in proportion to the tension, and nothing else opens them</td></tr>" +
    "<tr><td>any</td><td>fully taut: player 2 fires the rim's colour into the " +
    "pupil's column. One shot per rope</td></tr>" +
    "<tr><td>on a hit</td><td>a plate goes, the hatch shuts and the rope snaps back</td></tr>" +
    `<tr><td>${cfg.wardenCycleBeats}</td><td>the next rope, in the other colour</td></tr>`;
  panel.appendChild(cycle);

  const phases = document.createElement("table");
  phases.className = "boss-phases";
  phases.innerHTML =
    "<tr><th></th><th>plates above</th><th>pupil drift</th></tr>" +
    WARDEN_PHASES.map(
      (p) => `<tr><td>${p.name}</td><td>${p.above}</td><td>${p.drift}/beat</td></tr>`,
    ).join("");
  panel.appendChild(phases);
}

/**
 * One sentence about THE VANE, typed here for the same reason THE MIRROR's is:
 * it is not a `CreatureKind` and has no bestiary entry to read. It is not on
 * the field at all — it hangs off the top edge and never touches the grid.
 */
const VANE_BLURB =
  "An arm sweeping the top of the field, on a bearing hung off the top edge. " +
  "It attacks nothing. Everything that comes in under it is folded about the " +
  "column the tip is standing in — as far the other side of the arm as it came in.";

/**
 * THE VANE's panel. Its one authored number is the pin count; the cycle and the
 * phases are `VANE_CYCLE` and `VANE_PHASES` rendered, never a second copy typed
 * beside them — the arm's whole behaviour is those two tables and a wave author
 * has to be able to read the real ones.
 *
 * It is the one boss whose wave *needs* creatures in it, so there is no
 * placement note here: an empty wave under THE VANE is a mechanism turning over
 * nothing (`bossFillsWave` in the simulation says so, and `state.ts` asks it).
 */
export function renderVane(
  panel: HTMLElement,
  boss: { kind: "vane"; pins?: number },
  onEdit: () => void,
): void {
  const cfg = DEFAULT_CONFIG;
  const fields = document.createElement("div");
  fields.className = "boss-fields";
  fields.append(
    numberField("pins", 1, 12, boss.pins ?? cfg.vanePins, (v) => {
      boss.pins = v;
      onEdit();
    }),
  );
  panel.appendChild(fields);

  const blurb = document.createElement("p");
  blurb.className = "note";
  blurb.textContent = VANE_BLURB;
  panel.appendChild(blurb);

  const cycle = document.createElement("table");
  cycle.className = "boss-phases";
  cycle.innerHTML =
    "<tr><th>cycle beat</th><th>the arm</th></tr>" +
    VANE_CYCLE.map((s, i) => {
      const at = vaneStageStart(i);
      const span = s.beats === 1 ? `${at}` : `${at}–${at + s.beats - 1}`;
      return `<tr><td>${span}</td><td>${s.does}</td></tr>`;
    }).join("") +
    `<tr><td>${VANE_CYCLE_BEATS}</td><td>round again, the same way both times</td></tr>`;
  panel.appendChild(cycle);

  const phases = document.createElement("table");
  phases.className = "boss-phases";
  phases.innerHTML =
    "<tr><th></th><th>pins above</th><th>reach</th><th>folds about</th></tr>" +
    VANE_PHASES.map((p) => {
      const pivot = vanePivotCol(cfg);
      const lo = Math.max(0, pivot - p.reach);
      const hi = Math.min(cfg.cols - 1, pivot + p.reach);
      return `<tr><td>${p.name}</td><td>${p.above}</td><td>${p.reach} columns</td><td>${lo}–${hi}</td></tr>`;
    }).join("");
  panel.appendChild(phases);

  const rule = document.createElement("p");
  rule.className = "note";
  rule.textContent =
    "The radar names the column a thing was aimed at; the arm decides the one " +
    "it lands in. A pin only comes out on a shot that leaves the top of the " +
    "field in the split column, in the split's colour, while the arm is held " +
    "at an end — and every pin gone lets the arm reach a phase further out.";
  panel.appendChild(rule);
}
