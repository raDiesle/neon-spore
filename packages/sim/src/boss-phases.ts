import { BATON_STAGES } from "./baton.js";
import type { BossEntry } from "./boss-entries.js";
import { CANDLE_PHASES } from "./candle.js";
import { DIASTOLE_PHASES } from "./diastole.js";
import { FILAMENT_PHASES } from "./filament.js";
import { FLEET_PHASES } from "./fleet-state.js";
import { GAUGE_PHASES } from "./gauge.js";
import { GORGE_PHASES } from "./gorge.js";
import { INSTAR_PHASES } from "./instar.js";
import { LEDGER_PHASES } from "./ledger.js";
import { MAZE_PHASES } from "./maze.js";
import { ORRERY_PHASES } from "./orrery.js";
import { PINBALL_PHASES } from "./pinball.js";
import { PULSE_PHASES } from "./pulse.js";
import { SCOUT_PHASES } from "./scout.js";
import type { MirrorPhase } from "./simon.js";
import { SNAKE_GRIPS, SNAKE_PHASES } from "./snake.js";
import { STARE_PHASES } from "./stare.js";
import { TASTER_PHASES } from "./taster.js";
import { THROAT_PHASES } from "./throat.js";
import { UNDERTOW_PHASES } from "./undertow.js";
import { VANE_PHASES } from "./vane-cycle.js";
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
 * pose owed on the sheet.** A boss with no table — THE CAIRN's pile, THE
 * HIVE's seals — is absent here and named by hand on the
 * director's side, which is the half of this that cannot be derived. THE
 * MIRROR is the one boss whose phases are a bare union (`MirrorPhase`), so
 * its row is a record keyed by that union: a name added to the union without
 * one here is a type error on this line.
 */
const MIRROR_PHASES: Record<MirrorPhase, 0> = { lead: 0, show: 0, listen: 0, verdict: 0, hold: 0 };

export const BOSS_PHASES: Partial<Record<BossEntry["kind"], readonly string[]>> = {
  mirror: Object.keys(MIRROR_PHASES),
  warden: WARDEN_PHASES.map((p) => p.name.toLowerCase()),
  vane: VANE_PHASES.map((p) => p.name.toLowerCase()),
  maze: MAZE_PHASES,
  gauge: GAUGE_PHASES,
  // Both of SNAKE's axes: the round's clock, and what the body has become
  // (`snake.ts`). The second is a state the pair meets a new gesture in and
  // the sheet would be lying by omission without it.
  snake: [...SNAKE_PHASES, ...SNAKE_GRIPS],
  pinball: PINBALL_PHASES,
  pulse: PULSE_PHASES,
  scout: SCOUT_PHASES,
  stare: STARE_PHASES,
  diastole: DIASTOLE_PHASES,
  baton: BATON_STAGES,
  throat: THROAT_PHASES,
  undertow: UNDERTOW_PHASES,
  orrery: ORRERY_PHASES,
  candle: CANDLE_PHASES,
  gorge: GORGE_PHASES,
  taster: TASTER_PHASES,
  ledger: LEDGER_PHASES,
  instar: INSTAR_PHASES,
  filament: FILAMENT_PHASES,
  fleet: FLEET_PHASES,
};
