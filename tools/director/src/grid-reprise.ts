import type { Wave } from "@neon-spore/content";
import { DEFAULT_CONFIG, type RepriseEcho, repriseEvery, reprisePlan } from "@neon-spore/sim";

/**
 * **Where THE REPRISE's dark falls, on the map.**
 *
 * The owner asked on 25 September 2026 for *the row in map editor when it's
 * going to happen*: the panel had one number — beats before the stretch is
 * sent again — and nothing on the map agreed with it, so an author could not
 * see which bodies a stretch would hold without counting rows by hand. Each
 * echo is drawn as a band across the last row its stretch covers, naming how
 * many bodies come back and from which rows, with a heavy line under it: the
 * row below waits until the echo is over.
 *
 * The rows are the simulation's, not worked out here: `reprisePlan` walks the
 * same clock `sim/reprise.ts` runs and is held to it by
 * `packages/sim/test/reprise-plan.test.ts`. It is off by a beat from a naive
 * `every`, because the beat the dark falls on is itself held — which is
 * exactly the kind of thing a second copy of the arithmetic would get wrong.
 */
export function repriseEchoes(wave: Wave): RepriseEcho[] {
  const boss = wave.boss;
  if (boss?.kind !== "reprise") return [];
  const every = repriseEvery(DEFAULT_CONFIG, boss);
  return reprisePlan(
    wave.entries.map((e) => e.beat),
    every,
  );
}

/** The band across the row an echo falls after. */
export function repriseBand(echo: RepriseEcho): HTMLElement {
  const host = document.createElement("div");
  host.className = "rowtags reprise-cut";
  const bodies = echo.count === 1 ? "1 body" : `${echo.count} bodies`;
  const rows = `rows ${echo.firstRow}–${echo.lastRow}`;
  host.title = `After beat ${echo.lastRow} the ${bodies} of ${rows} are sent again, unseen. The wave waits until they have all been sent.`;
  const tag = document.createElement("span");
  tag.className = "rowtag";
  const who = document.createElement("span");
  who.className = "who";
  who.textContent = `▼ ${echo.count} SENT AGAIN`;
  const span = document.createElement("span");
  span.className = "span";
  span.textContent = rows;
  tag.append(who, span);
  host.appendChild(tag);
  host.dataset.beat = String(echo.lastRow);
  host.style.gridRow = `${echo.lastRow + 2} / ${echo.lastRow + 3}`;
  host.style.gridColumn = "2 / -2";
  return host;
}
