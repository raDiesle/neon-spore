import type { SimConfig } from "@neon-spore/sim";
import { fieldsIn, GROUP_NOTE, GROUP_ORDER } from "./ship-fields.js";

/**
 * What the ship can do, read off `SimConfig` rather than described.
 *
 * `ship-fields.ts` carries the part that has to typecheck: a
 * `Record<keyof SimConfig, GroupName>` that sorts every field into one of the
 * cards below. This file only formats the nine mechanics worth a hand-written
 * sentence — `VALUE` — and falls back to the raw field for everything else, so
 * a tunable that lands today shows up as `fieldName: 12` tomorrow rather than
 * not at all. Five fields landed on 27 Aug 2026 (`briefings`,
 * `forkBetweenWaves`, `interludes`, the six `gauge*` fields, `shotChargeBeats`)
 * and none of them appeared here — that gap is what this file is now built to
 * refuse.
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
  "THE GAUGE — an interlude's own round": (cfg) => (cfg.interludes ? "ON" : "off"),
};

/** Every field of `group`, as `name: value`, for the ones `VALUE` does not word by hand. */
function rawLine(cfg: SimConfig, group: Parameters<typeof fieldsIn>[0]): string {
  return fieldsIn(group)
    .map((k) => `${k}: ${cfg[k]}`)
    .join(", ");
}

function capabilities(cfg: SimConfig): Capability[] {
  return GROUP_ORDER.map((group) => ({
    name: group,
    value: VALUE[group]?.(cfg) ?? rawLine(cfg, group),
    note: GROUP_NOTE[group],
  }));
}

export function renderShip(cfg: SimConfig): void {
  const caps = document.getElementById("caps");
  if (!caps) return;
  caps.replaceChildren();
  for (const cap of capabilities(cfg)) {
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
    caps.appendChild(el);
  }
}
