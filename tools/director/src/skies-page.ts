/**
 * DOCUMENTATION → SKIES: every sky the field can sit in, drawn.
 *
 * The back of the field is one of eleven pictures and the wave picks it
 * (`packages/render/src/skies.ts`): wave `n` gets sky `n % 11`. This room is
 * the list — each sky's name, its line, which waves open under it, and the
 * field of the game started on the first of those waves, so the picture is
 * the shipping renderer against a `World` and cannot drift from the game.
 * The cards are live and at the phone's own size (`sky-live.ts`): a sky is
 * mostly its motion, and a still at two thirds size showed neither.
 *
 * Lazy, like every other room in this sheet: nothing is drawn until the tab is
 * clicked, and each card's frame waits until the card is on screen.
 */

import { WAVES } from "@neon-spore/content";
import { SKIES, type Sky } from "@neon-spore/render";
import { createWorld, DEFAULT_CONFIG, type SimConfig, startWave } from "@neon-spore/sim";
import { liveField } from "./sky-live.js";
import { whenSeen } from "./when-seen.js";

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
/** How many of a sky's waves to name before "and every eleventh after". */
const NAMED = 3;

let drawn = false;

/** The first few waves that open under sky `i`, by name. */
function wavesUnder(i: number): string {
  const names: string[] = [];
  for (let w = i; w < WAVES.length && names.length < NAMED; w += SKIES.length) {
    names.push(`${w} ${WAVES[w]?.name ?? ""}`.trim());
  }
  return `${names.join(" · ")} — and every ${SKIES.length}th wave after`;
}

function skyFrame(i: number): HTMLElement {
  const world = createWorld({ ...CFG }, 11);
  startWave(world, Math.min(i, WAVES.length - 1), [], [], null);
  return liveField(world, "p1");
}

function skyCard(sky: Sky, i: number): HTMLElement {
  const card = document.createElement("figure");
  card.className = "sky-card";
  const shot = document.createElement("div");
  shot.className = "sky-shot";
  whenSeen(shot, () => shot.appendChild(skyFrame(i)));
  const cap = document.createElement("figcaption");
  const name = document.createElement("b");
  name.textContent = sky.name;
  const line = document.createElement("span");
  line.textContent = sky.sentence;
  const waves = document.createElement("small");
  waves.textContent = wavesUnder(i);
  cap.append(name, line, waves);
  card.append(shot, cap);
  return card;
}

function renderSkies(): void {
  if (drawn) return;
  const body = document.getElementById("skiesBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren(...SKIES.map(skyCard));
}

export function bindSkiesTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="skies"]')
    ?.addEventListener("click", renderSkies);
}
