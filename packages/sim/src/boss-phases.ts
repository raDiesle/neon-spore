import { BATON_STAGES } from "./baton.js";
import type { BossEntry } from "./boss-entries.js";
import { CYST_PHASES } from "./cyst.js";
import { FILAMENT_PHASES } from "./filament.js";
import { FLEET_PHASES } from "./fleet-state.js";
import { GAUGE_PHASES } from "./gauge.js";
import { GAUGE_GRIPS } from "./gauge-hand.js";
import { GIMBAL_PHASES } from "./gimbal.js";
import { GORGE_PHASES } from "./gorge.js";
import { GRINDSTONE_PHASES } from "./grindstone.js";
import { HASP_PHASES } from "./hasp.js";
import { HIVE_PHASES } from "./hive.js";
import { HIVE_LOBES } from "./hive-lobe.js";
import { INSTAR_PHASES } from "./instar.js";
import { KEEL_PHASES } from "./keel.js";
import { LEDGER_PHASES } from "./ledger.js";
import { MANTLE_PHASES } from "./mantle.js";
import { MAZE_PHASES } from "./maze.js";
import { OCULUS_PHASES } from "./oculus.js";
import { PIN_SHOTS, PINBALL_PHASES } from "./pinball.js";
import { PLUMB_PHASES } from "./plumb.js";
import { PULSE_HEARTS, PULSE_PHASES } from "./pulse.js";
import { RATCHET_PHASES } from "./ratchet.js";
import { RIME_PHASES } from "./rime.js";
import { SCOUT_LOADS, SCOUT_PHASES } from "./scout.js";
import { SEAM_PHASES } from "./seam.js";
import type { MirrorPhase } from "./simon.js";
import { SLING_PHASES } from "./sling.js";
import { SNAKE_GRIPS, SNAKE_PHASES } from "./snake.js";
import { SPOOL_PHASES } from "./spool.js";
import { STARE_PHASES } from "./stare.js";
import { TASTER_PHASES } from "./taster.js";
import { THROAT_PHASES } from "./throat.js";
import { TRIVET_PHASES } from "./trivet.js";
import { UNDERTOW_PHASES } from "./undertow.js";
import { VALVE_PHASES } from "./valve.js";
import { VANE_PHASES } from "./vane-cycle.js";
import { VISE_PHASES } from "./vise.js";
import { WARDEN_PHASES } from "./warden-cycle.js";

/**
 * **Every boss's phases, in one table**, for the director's STATES sheet.
 *
 * The owner asked on 18 September 2026 for a BOSSES category on that sheet
 * documenting every boss's states, kept in step with the bosses themselves.
 * The names a boss's states go by were already in this package, one table per
 * boss — `STARE_PHASES`, `BATON_STAGES`, `WARDEN_PHASES` — but a sheet that
 * imported nineteen tables would learn about the twentieth only when somebody
 * remembered to add it, and a boss whose phases are *derived* rather than
 * stored (THE WARDEN's from its plates, THE GORGE's from its beads) names them
 * in a shape of its own. So: one table, read by `tools/director/src/
 * boss-states.ts` and refused by `tools/director/test/boss-states.test.ts`
 * when a state here has no picture there.
 *
 * **A boss with a phase table is listed here, and a phase added to one is a
 * pose owed on the sheet.** A boss with no table — THE CAIRN's pile — is
 * absent here and named by hand on the director's side, which is the half of
 * this that cannot be derived. THE
 * MIRROR is the one boss whose phases are a bare union (`MirrorPhase`), so
 * its row is a record keyed by that union: a name added to the union without
 * one here is a type error on this line.
 *
 * **And a state is not only a phase.** A state is any named condition of the
 * boss the pair meets a different gesture in — THE SNAKE's body, THE PULSE's
 * meter, THE GAUGE's dead valve — because that is what the sheet is for: a
 * reader looking up what the two of them do here. A boss with a second axis
 * gets a second table **out of the simulation**, spread onto its row beside
 * the phases, and never a list written by hand on the director's side. That is
 * not a preference: `boss-states.ts` reads `BOSS_PHASES[kind] ?? BY_HAND[kind]`,
 * so a boss with a phase table can never reach the hand-written half at all,
 * and a name kept there would be a state with no table to go stale against.
 * THE GORGE's pinch and its pry are the next two to ask (`docs/queue.md`,
 * 21 September 2026).
 */
const MIRROR_PHASES: Record<MirrorPhase, 0> = { lead: 0, show: 0, listen: 0, verdict: 0, hold: 0 };

export const BOSS_PHASES: Partial<Record<BossEntry["kind"], readonly string[]>> = {
  mirror: Object.keys(MIRROR_PHASES),
  warden: WARDEN_PHASES.map((p) => p.name.toLowerCase()),
  vane: VANE_PHASES.map((p) => p.name.toLowerCase()),
  maze: MAZE_PHASES,
  // Both of THE GAUGE's axes, as the four rounds below: the round's clock, and
  // the two conditions the pair's own last call puts it in (`gauge-hand.ts`).
  // These two are not one enum and a pair can be in both at once, which costs
  // the sheet nothing — it wants the names, not the shape they came in.
  gauge: [...GAUGE_PHASES, ...GAUGE_GRIPS],
  // Both of SNAKE's axes: the round's clock, and what the body has become
  // (`snake.ts`). The second is a state the pair meets a new gesture in and
  // the sheet would be lying by omission without it.
  snake: [...SNAKE_PHASES, ...SNAKE_GRIPS],
  // Both of PINBALL's axes, as SNAKE's are above: the round's clock, and
  // where one shot has got to. Each of the three shots waits on a different
  // thumb, and since 18 September 2026 two of them have a hand on the table
  // as well (`pinball.ts`).
  pinball: [...PINBALL_PHASES, ...PIN_SHOTS],
  // Both of THE PULSE's axes, as the three rounds above: the stage's clock,
  // and what the shared meter has become (`pulse.ts`).
  pulse: [...PULSE_PHASES, ...PULSE_HEARTS],
  // Both of THE SCOUT's axes, as SNAKE's and PINBALL's are: the round's
  // clock, and what the motes aboard have made of the little ship. The
  // second is the one the pair puts it in (`scout.ts`).
  scout: [...SCOUT_PHASES, ...SCOUT_LOADS],
  // Both of THE HIVE's axes, as the rounds above: where the mass itself is,
  // and what one lobe of the underside has become. The pair meet a different
  // thumb in each — the clench is hauled, the swelling lobe is wrung — so a
  // sheet with only the first would be lying by omission (`hive-lobe.ts`).
  hive: [...HIVE_PHASES, ...HIVE_LOBES],
  stare: STARE_PHASES,
  baton: BATON_STAGES,
  throat: THROAT_PHASES,
  undertow: UNDERTOW_PHASES,
  gorge: GORGE_PHASES,
  taster: TASTER_PHASES,
  ledger: LEDGER_PHASES,
  instar: INSTAR_PHASES,
  nettle: INSTAR_PHASES,
  filament: FILAMENT_PHASES,
  gimbal: GIMBAL_PHASES,
  spool: SPOOL_PHASES,
  hasp: HASP_PHASES,
  ratchet: RATCHET_PHASES,
  mantle: MANTLE_PHASES,
  keel: KEEL_PHASES,
  valve: VALVE_PHASES,
  seam: SEAM_PHASES,
  oculus: OCULUS_PHASES,
  vise: VISE_PHASES,
  rime: RIME_PHASES,
  trivet: TRIVET_PHASES,
  plumb: PLUMB_PHASES,
  sling: SLING_PHASES,
  grindstone: GRINDSTONE_PHASES,
  cyst: CYST_PHASES,
  fleet: FLEET_PHASES,
};
