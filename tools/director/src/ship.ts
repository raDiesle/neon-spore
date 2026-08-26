import type { SimConfig } from "@neon-spore/sim";

/**
 * What the ship can do, read off `SimConfig` rather than described.
 *
 * Every number here is anchored to the field that tunes it. A mechanic that is
 * removed takes its `SimConfig` field with it, and this list stops typechecking.
 */

interface Capability {
  name: string;
  value: string;
  note: string;
}

/**
 * The mechanics a wave can lean on, each anchored to the field that tunes it.
 * The anchor is the point: a mechanic that is removed takes its `SimConfig`
 * field with it, and this list stops typechecking.
 */
function capabilities(cfg: SimConfig): Capability[] {
  return [
    {
      name: "AIM — colour and column",
      value: `${cfg.fireEveryBeats} beats`,
      note: "Player 2 fires the colour, player 1 holds the column. Both or nothing.",
    },
    {
      name: "GUARD — the shared defence",
      value: `${cfg.guardWindowMs} ms`,
      note: "Player 2 places the shield, player 1 triggers it. Position alone is not enough.",
    },
    {
      name: "MAW — taking a pod in",
      value: `${cfg.intakeWindowMs} ms`,
      note: "Player 1 opens the cannon lobe inside out as the pod arrives.",
    },
    {
      name: "POD — shot loose, then caught",
      value: `+${cfg.podRepair} hull`,
      note: `Sinks ${cfg.podFallTilesPerBeat} tiles a beat and drifts ${cfg.podDriftTilesPerBeat} sideways, the way the rng picks.`,
    },
    {
      name: "GRIP — a hand on the field",
      value: `${cfg.gripSlowPermille} ‰ speed`,
      note: "Either player holds anything falling and it falls slower. Two hands compound.",
    },
    {
      name: "SCARS — damage that stays",
      value: `${cfg.maxScars} kept`,
      note: "Anything that reaches the hull breaks it visibly and the break does not heal.",
    },
    {
      name: "RADAR — what is coming",
      value: `${cfg.radarLead} beats`,
      note: "The strip above the grid is how far ahead either player can talk about.",
    },
    {
      name: "THE BEAT",
      value: `${cfg.bpm} BPM`,
      note: `A creature enters at the top and reaches the hull ${cfg.rows - 1} beats later.`,
    },
  ];
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
