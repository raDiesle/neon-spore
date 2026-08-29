import type { Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import {
  BOSS_GROUP,
  fieldsIn,
  GROUP_NOTE,
  GROUP_ORDER,
  type GroupName,
  SHIP_GROUPS,
} from "./ship-fields.js";

/**
 * What the ship can do, read off `SimConfig` rather than described.
 *
 * `ship-fields.ts` carries the part that has to typecheck: a
 * `Record<keyof SimConfig, GroupName>` that sorts every field into one of the
 * cards below. This file only formats the nine mechanics worth a hand-written
 * sentence — `VALUE` — and falls back to the raw field for everything else, so
 * a tunable that lands today shows up as `fieldName: 12` tomorrow rather than
 * not at all. Five fields landed on 27 Aug 2026 (`briefings`,
 * `forkBetweenWaves`, the `gauge*` fields, `shotChargeBeats`)
 * and none of them appeared here — that gap is what this file is now built to
 * refuse.
 *
 * `renderShip` and `renderShipSheet` are the split `docs/queue.md`'s brief
 * asked for: `aimMillis` is the same number on every wave, so it does not
 * belong beside the one wave being edited. `renderShip` paints the WAVE tab's
 * SHIP card with only what the current wave actually contains — its boss, if
 * it has one, THE GAUGE included, since that is a boss now — and
 * `renderShipSheet` paints GAME MECHANICS' SHIP tab with the ship's own
 * dials, the same on every wave. `renderShipSheet` needs no lazy render or
 * open/close wiring of its own: `main.ts` already calls it every time `cfg`
 * changes (tuning, the pair panel, a demo), so `#shipSheetBody` stays current
 * whether or not that tab is the one on screen — see `docs/queue.md`'s
 * `claude/burn-topbar-fold` entry for why that made its own sheet redundant.
 */

interface Capability {
  name: string;
  value: string;
  note: string;
}

/** Curated wording for the mechanics worth a sentence rather than a number dump. */
const VALUE: Partial<Record<string, (cfg: SimConfig) => string>> = {
  "AIM — colour and column": (cfg) => `${cfg.fireEveryBeats} beats`,
  "GUARD — the shared defence": (cfg) => `${cfg.guardWindowMs} ms`,
  "MAW — taking a pod in": (cfg) => `${cfg.intakeWindowMs} ms`,
  "POD — shot loose, then caught": (cfg) => `+${cfg.podRepair} hull`,
  "LANCE — a column marked, then spent": (cfg) => `${cfg.lancePrimeBeats} beats`,
  "GRIP — a hand on the field": (cfg) => `${cfg.gripSlowPermille} ‰ speed`,
  "HULL — damage and repair": (cfg) => `${cfg.maxScars} scars kept`,
  "RADAR — what is coming": (cfg) => `${cfg.radarLead} beats`,
  "THE BEAT": (cfg) => `${cfg.bpm} BPM`,
  "THE FORK — the seam between waves": (cfg) => (cfg.forkBetweenWaves ? "ON" : "off"),
  "BRIEFING — the card a wave opens on": (cfg) => (cfg.briefings ? "ON" : "off"),
  "THE GAUGE — a round with no field in it": (cfg) => `${cfg.gaugeMarks} marks`,
};

/** Every field of `group`, as `name: value`, for the ones `VALUE` does not word by hand. */
function rawLine(cfg: SimConfig, group: Parameters<typeof fieldsIn>[0]): string {
  return fieldsIn(group)
    .map((k) => `${k}: ${cfg[k]}`)
    .join(", ");
}

function capability(cfg: SimConfig, group: GroupName): Capability {
  return {
    name: group,
    value: VALUE[group]?.(cfg) ?? rawLine(cfg, group),
    note: GROUP_NOTE[group],
  };
}

function capEl(cap: Capability): HTMLElement {
  const el = document.createElement("div");
  el.className = "cap";
  const head = document.createElement("b");
  head.textContent = cap.name;
  const num = document.createElement("span");
  num.className = "num";
  num.textContent = cap.value;
  const body = document.createElement("p");
  body.textContent = cap.note;
  el.append(num, head, body);
  return el;
}

/**
 * Which groups belong to the wave open right now: its own boss, if it has one.
 * THE GAUGE used to need a second question here — whether the gap in front of
 * this wave carried a round — and it does not any more, because the round is a
 * boss and `wave.boss` is the whole answer.
 */
function groupsForWave(wave: Wave | undefined): GroupName[] {
  const present = new Set<GroupName>();
  if (wave?.boss) present.add(BOSS_GROUP[wave.boss.kind]);
  return GROUP_ORDER.filter((g) => present.has(g));
}

/**
 * The WAVE tab's SHIP card: only what the wave in front of you contains. Empty
 * far more often than not — most waves carry no boss and open on no gap — and
 * that emptiness is the point rather than a bug to paper over with the ship's
 * global dials, which is what used to sit here.
 */
export function renderShip(cfg: SimConfig, wave: Wave | undefined): void {
  const caps = document.getElementById("caps");
  if (!caps) return;
  caps.replaceChildren();
  const groups = groupsForWave(wave);
  if (groups.length === 0) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent =
      "Nothing here is specific to this wave — no boss, no gap that carries a round. " +
      "The ship's own dials are the same on every wave; open ⚙ SHIP on the topbar for those.";
    caps.appendChild(note);
    return;
  }
  for (const group of groups) caps.appendChild(capEl(capability(cfg, group)));
}

/** GAME MECHANICS' SHIP tab: the ship's own dials, the same on every wave, all of them reachable. */
export function renderShipSheet(cfg: SimConfig): void {
  const body = document.getElementById("shipSheetBody");
  if (!body) return;
  body.replaceChildren();
  for (const group of SHIP_GROUPS) body.appendChild(capEl(capability(cfg, group)));
}
