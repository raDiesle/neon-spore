import { type BalanceSheet, balanceSheet, share, type World } from "@neon-spore/sim";

/**
 * The balance sheet, as numbers, while the wave is still running.
 *
 * The stage next to it draws the real after-run screen — the one the phone
 * shows — but only once the run is over, and a screen you can only reach by
 * dying is a screen nobody tunes. This panel is the same sheet with the lid
 * off: it moves as the wave is played, so a change to the guard window can be
 * judged against the number it is supposed to move.
 *
 * SHEET in the transport ends the run, which is how the drawn version is
 * reached without waiting for a hull that the director deliberately holds.
 *
 * The panel itself folds behind `#ledgerToggle`, a button in the same
 * `.transport` row as `▣ SHEET` and `✓ CARD` — pressed once it shows
 * `#balanceSheetPanel` (the heading, this panel and the notes below it) and
 * stays shown until pressed again. It is called LEDGER rather than a second
 * "sheet": `▣ SHEET` already names the after-run screen, and a row holding
 * two buttons called the same thing is not a row anyone reads at a glance.
 */

export interface BalancePanel {
  /** Repaint if anything changed. Cheap enough to call every frame. */
  render(): void;
}

interface Line {
  label: string;
  /** How many of how many. */
  count: string;
  /** 0..100, or null when the run has not asked this of the pair yet. */
  pct: number | null;
}

/**
 * The rows of the sheet, in the order the drawn screen puts them. Kept apart
 * from the DOM so the arithmetic on the way to the label can be tested — the
 * panel below is only `document.createElement`.
 */
export function sheetLines(sheet: BalanceSheet): Line[] {
  return [
    { label: "WARDS", count: count(sheet.wards.good, sheet.wards.of), pct: share(sheet.wards) },
    { label: "TIMING", count: count(sheet.timing.good, sheet.timing.of), pct: share(sheet.timing) },
    { label: "COLOUR", count: count(sheet.color.good, sheet.color.of), pct: share(sheet.color) },
    { label: "PODS", count: count(sheet.pods.good, sheet.pods.of), pct: share(sheet.pods) },
  ];
}

/** The memories: things that happened, never rounded into a share. */
export function sheetMemories(sheet: BalanceSheet): [string, string][] {
  return [
    ["longest clean run", `${sheet.bestStreak}`],
    ["pods shot loose", `${sheet.podsFreed}`],
    ["waves cleared", `${sheet.wavesCleared}`],
    ["score", `${sheet.score}`],
  ];
}

function count(good: number, of: number): string {
  return of === 0 ? "—" : `${good}/${of}`;
}

export function bindBalance(world: () => World): BalancePanel {
  const host = document.getElementById("balanceSheet");
  const panel = document.getElementById("balanceSheetPanel");
  const toggle = document.getElementById("ledgerToggle");
  let last = "";

  toggle?.addEventListener("click", () => {
    const shown = !panel?.classList.contains("on");
    panel?.classList.toggle("on", shown);
    toggle.classList.toggle("on", shown);
  });

  const render = (): void => {
    if (!host) return;
    const sheet = balanceSheet(world());
    // The sheet is read every frame and changes a few times a wave. Comparing
    // the numbers is far cheaper than rebuilding four rows into the document
    // sixty times a second for nothing.
    const signature = JSON.stringify(sheet);
    if (signature === last) return;
    last = signature;

    host.textContent = "";
    host.append(syncBlock(sheet));
    for (const line of sheetLines(sheet)) host.append(lineRow(line));
    for (const [label, value] of sheetMemories(sheet)) host.append(memoryRow(label, value));
  };

  render();
  return { render };
}

function syncBlock(sheet: BalanceSheet): HTMLElement {
  const box = document.createElement("div");
  box.className = "sync";

  const value = document.createElement("div");
  value.className = "sync-value";
  value.textContent = sheet.sync === null ? "—" : `${sheet.sync}%`;

  const label = document.createElement("div");
  label.className = "sync-label";
  label.textContent =
    sheet.moments === 0
      ? "SYNC — nothing asked of the pair yet"
      : `SYNC — over ${sheet.moments} joint moment${sheet.moments === 1 ? "" : "s"}`;

  box.append(value, label);
  return box;
}

function lineRow(line: Line): HTMLElement {
  const row = document.createElement("div");
  row.className = "sheet-row";

  const label = document.createElement("span");
  label.className = "sheet-label";
  label.textContent = line.label;

  const track = document.createElement("span");
  track.className = "sheet-track";
  const fill = document.createElement("span");
  fill.className = "sheet-fill";
  fill.style.width = `${line.pct ?? 0}%`;
  track.append(fill);

  const value = document.createElement("span");
  value.className = "sheet-count";
  value.textContent = line.count;

  row.append(label, track, value);
  return row;
}

function memoryRow(label: string, value: string): HTMLElement {
  const row = document.createElement("div");
  row.className = "sheet-memory";
  const name = document.createElement("span");
  name.textContent = label;
  const num = document.createElement("span");
  num.textContent = value;
  row.append(name, num);
  return row;
}
