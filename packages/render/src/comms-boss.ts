import { antiphonBoss, antiphonExplainer, flueBoss, type World } from "@neon-spore/sim";
import type { CommsCall } from "./comms.js";
import type { ViewRole } from "./view-role.js";

/**
 * **The siren for a boss whose split is the whole fight** — THE ANTIPHON's,
 * the first (the owner, 5 October 2026: *player 1 sees text "explain
 * shape" and player 2 sees "choose shape". every level the roles of p1 and
 * p2 switch*).
 *
 * `comms.ts` lights the siren off creatures, and this boss has none: its
 * split is one seat shown the organ and the other the rail, which swap
 * every level (`antiphonExplainer`). So the call is lit for the explainer,
 * whose mouth the fight is waiting on, and each seat is given its job under
 * the dial — the rig both, as `duty.ts` gives it both. Up from the body's
 * arrival until it is down, through the rest between levels, so the swap is
 * read before the next organ grows.
 */

const EXPLAIN = "EXPLAIN SHAPE";
const CHOOSE = "CHOOSE SHAPE";

function explainer(world: World): 1 | 2 | null {
  const s = antiphonBoss(world);
  return s === null || s.downBeat >= 0 ? null : antiphonExplainer(s);
}

/**
 * **THE FLUE's**, the second (the owner, 6 October 2026: *show siren … p1
 * needs to tell p2 when to shoot*). The panel shown the ember is the pilot's,
 * so the call is the pilot's panel's, said in panels like every creature's;
 * the flue trades the panels every other level, and `siren.ts` turns a call
 * into the person holding it. Up from the flue's arrival until it is spent.
 */
const SAY_WHEN = "SAY WHEN TO SHOOT";
const SHOOT_ON_IT = "SHOOT WHEN TOLD";

function flueUp(world: World): boolean {
  const s = flueBoss(world);
  return s !== null && s.phase !== "spent";
}

/** Whether the siren stands top right for this boss rather than top centre:
 * THE FLUE's own picture holds the middle of the top (`siren.ts`). */
export function bossSirenRight(world: World): boolean {
  return flueUp(world);
}

/** The explainer's chip lit, or null with no such boss up. */
export function bossCall(world: World): CommsCall | null {
  if (flueUp(world)) return { p1: true, p2: false };
  const e = explainer(world);
  return e === null ? null : { p1: e === 1, p2: e === 2 };
}

/** This screen's job under the dial, or null with no such boss up. */
export function bossDuty(role: ViewRole, world: World): string | null {
  if (flueUp(world)) {
    if (role === "p1") return SAY_WHEN;
    return role === "p2" ? SHOOT_ON_IT : `${SAY_WHEN} · ${SHOOT_ON_IT}`;
  }
  const e = explainer(world);
  if (e === null) return null;
  const p1 = e === 1 ? EXPLAIN : CHOOSE;
  const p2 = e === 2 ? EXPLAIN : CHOOSE;
  if (role === "p1") return p1;
  if (role === "p2") return p2;
  return `${p1} · ${p2}`;
}
