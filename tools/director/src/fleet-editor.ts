import {
  DEFAULT_CONFIG,
  FLEET_LEN_MAX,
  FLEET_LEN_MIN,
  FLEET_SHIPS_MAX,
  type FleetEntry,
  type FleetShip,
  fleetCols,
  fleetFault,
  fleetOnBoard,
  fleetRows,
  fleetShipAt,
  shipCol,
  shipRow,
} from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * THE FLEET's placement, edited on the chart the pair will play it on.
 *
 * **Every other boss is authored as a number and this one is authored as a
 * picture**, which is why it gets a map rather than a form. Where the ships
 * are *is* the fight — how far the sights have to walk between two of them,
 * whether a long hull lies along a row the pair can name in one word — and
 * none of that is legible as five rows of `col`/`row`/`len`/`dir`.
 *
 * The map is the real chart: `cfg.cols` across by `fleetRows` down, the same
 * squares the game draws, with the same letters and numbers on them. It is
 * deliberately **not** the seven authored columns the beat grid next door uses
 * — a fleet is authored against the real field, because a run of squares
 * cannot survive `mapCol` (`FleetShip`).
 *
 * Two gestures and no modes: press a square with a hull on it to take that
 * ship, press an empty one to move the ship you are holding there. ROTATE
 * turns it about its own head. That is the whole editor, and it is the whole
 * editor on a phone as well as on a desk.
 */

/** What the wave is holding while it is being edited. */
interface FleetEdit {
  boss: FleetEntry;
  /** Which ship is being moved, by index. Kept across re-renders. */
  held: number;
}

const HELD: WeakMap<FleetEntry, number> = new WeakMap();

export function renderFleetEditor(panel: HTMLElement, boss: FleetEntry, onEdit: () => void): void {
  const state: FleetEdit = { boss, held: Math.min(HELD.get(boss) ?? 0, boss.ships.length - 1) };
  const redraw = (): void => {
    HELD.set(boss, state.held);
    onEdit();
  };

  panel.appendChild(
    el(
      "p",
      "note",
      "A chart of squares with ships hidden in it. Player 1 sees every hull and " +
        "holds the only trigger; player 2 walks the sights one square a press and " +
        "is shown nothing but water. Press a hull to take it, press water to move " +
        "it there.",
    ),
  );

  panel.appendChild(chart(state, redraw));
  panel.appendChild(ships(state, redraw));
  panel.appendChild(add(state, redraw));

  const fault = fleetFault(DEFAULT_CONFIG, boss.ships);
  if (fault === null) return;
  const warn = el("p", "note fleet-fault", `this is not a fleet yet: ${fault}`);
  panel.appendChild(warn);
}

/** The chart, as a grid of buttons — one per square, letters and numbers on the edges. */
function chart(state: FleetEdit, redraw: () => void): HTMLElement {
  const cfg = DEFAULT_CONFIG;
  const cols = fleetCols(cfg);
  const rows = fleetRows(cfg);
  const grid = el("div", "fleet-chart");
  grid.style.gridTemplateColumns = `auto repeat(${cols}, 1fr)`;

  grid.appendChild(el("span", "fleet-axis", ""));
  for (let col = 0; col < cols; col++) {
    grid.appendChild(el("span", "fleet-axis", String.fromCharCode(65 + col)));
  }

  for (let row = 0; row < rows; row++) {
    grid.appendChild(el("span", "fleet-axis", String(row + 1)));
    for (let col = 0; col < cols; col++) {
      grid.appendChild(square(state, col, row, redraw));
    }
  }
  return grid;
}

/** One square of the chart. */
function square(state: FleetEdit, col: number, row: number, redraw: () => void): HTMLElement {
  const at = fleetShipAt(state.boss.ships, col, row);
  const cell = button("", "fleet-cell");
  if (at !== -1) cell.classList.add("on");
  if (at !== -1 && at === state.held) cell.classList.add("held");
  cell.title = `${String.fromCharCode(65 + col)}${row + 1}`;
  cell.addEventListener("click", () => {
    // A press on a hull takes it; a press on water carries whichever hull is
    // already held. One gesture that means two things, decided by what is
    // under the finger rather than by a mode the editor has to show.
    if (at !== -1) {
      state.held = at;
      redraw();
      return;
    }
    const ship = state.boss.ships[state.held];
    if (!ship) return;
    if (!fits(ship.len, ship.dir, col, row)) return;
    ship.col = col;
    ship.row = row;
    redraw();
  });
  return cell;
}

/** Whether a ship of this length and heading fits with its head here. */
function fits(len: number, dir: FleetShip["dir"], col: number, row: number): boolean {
  const cfg = DEFAULT_CONFIG;
  const lastCol = dir === "h" ? col + len - 1 : col;
  const lastRow = dir === "v" ? row + len - 1 : row;
  return fleetOnBoard(cfg, col, row) && fleetOnBoard(cfg, lastCol, lastRow);
}

/** One row per ship: which square it starts in, how long, which way, and gone. */
function ships(state: FleetEdit, redraw: () => void): HTMLElement {
  const list = el("div", "fleet-ships");
  state.boss.ships.forEach((ship, at) => {
    const row = el("div", at === state.held ? "fleet-ship held" : "fleet-ship");
    const take = button(
      `${String.fromCharCode(65 + ship.col)}${ship.row + 1} · ${ship.len} · ${ship.dir === "h" ? "across" : "down"}`,
      "fleet-take",
    );
    take.addEventListener("click", () => {
      state.held = at;
      redraw();
    });

    const shorter = button("−", "fleet-len");
    shorter.disabled = ship.len <= FLEET_LEN_MIN;
    shorter.addEventListener("click", () => {
      ship.len -= 1;
      state.held = at;
      redraw();
    });

    const longer = button("+", "fleet-len");
    longer.disabled =
      ship.len >= FLEET_LEN_MAX || !fits(ship.len + 1, ship.dir, ship.col, ship.row);
    longer.addEventListener("click", () => {
      ship.len += 1;
      state.held = at;
      redraw();
    });

    const turn = button("ROTATE", "fleet-rotate");
    turn.addEventListener("click", () => {
      rotate(ship);
      state.held = at;
      redraw();
    });

    const drop = button("REMOVE", "fleet-remove");
    drop.disabled = state.boss.ships.length <= 1;
    drop.addEventListener("click", () => {
      state.boss.ships.splice(at, 1);
      state.held = Math.max(0, Math.min(state.held, state.boss.ships.length - 1));
      redraw();
    });

    row.append(take, shorter, longer, turn, drop);
    list.appendChild(row);
  });
  return list;
}

/**
 * A quarter turn about the ship's own head, and the head is pulled back in if
 * the turn would take the tail off the chart.
 *
 * Pulled back rather than refused: a ship near the bottom edge is exactly the
 * one an author most wants to turn, and a button that silently does nothing
 * there reads as broken. The whole ship shifts by however much it has to and
 * not a square more.
 */
function rotate(ship: FleetShip): void {
  const cfg = DEFAULT_CONFIG;
  ship.dir = ship.dir === "h" ? "v" : "h";
  const overCol = shipCol(ship, ship.len - 1) - (fleetCols(cfg) - 1);
  const overRow = shipRow(ship, ship.len - 1) - (fleetRows(cfg) - 1);
  if (overCol > 0) ship.col -= overCol;
  if (overRow > 0) ship.row -= overRow;
  ship.col = Math.max(0, ship.col);
  ship.row = Math.max(0, ship.row);
}

/** One more hull, put in the first square it fits in. */
function add(state: FleetEdit, redraw: () => void): HTMLElement {
  const more = button(`ADD SHIP (${state.boss.ships.length}/${FLEET_SHIPS_MAX})`, "fleet-add");
  more.disabled = state.boss.ships.length >= FLEET_SHIPS_MAX;
  more.addEventListener("click", () => {
    const cfg = DEFAULT_CONFIG;
    for (let row = 0; row < fleetRows(cfg); row++) {
      for (let col = 0; col < fleetCols(cfg); col++) {
        if (!fits(FLEET_LEN_MIN, "h", col, row)) continue;
        if (fleetShipAt(state.boss.ships, col, row) !== -1) continue;
        if (fleetShipAt(state.boss.ships, col + 1, row) !== -1) continue;
        state.boss.ships.push({ col, row, len: FLEET_LEN_MIN, dir: "h" });
        state.held = state.boss.ships.length - 1;
        redraw();
        return;
      }
    }
  });
  return more;
}
