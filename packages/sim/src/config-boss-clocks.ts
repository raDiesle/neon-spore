import { ANTIPHON_DEFAULTS, type AntiphonConfig } from "./config-antiphon.js";
import { BATON_DEFAULTS, type BatonConfig } from "./config-baton.js";
import { CAIRN_DEFAULTS, type CairnConfig } from "./config-cairn.js";
import { CURTAIN_DEFAULTS, type CurtainConfig } from "./config-curtain.js";
import { CYST_DEFAULTS, type CystConfig } from "./config-cyst.js";
import { DAVIT_DEFAULTS, type DavitConfig } from "./config-davit.js";
import { FILAMENT_DEFAULTS, type FilamentConfig } from "./config-filament.js";
import { GIMBAL_DEFAULTS, type GimbalConfig } from "./config-gimbal.js";
import { GORGE_DEFAULTS, type GorgeConfig } from "./config-gorge.js";
import { GRINDSTONE_DEFAULTS, type GrindstoneConfig } from "./config-grindstone.js";
import { HASP_DEFAULTS, type HaspConfig } from "./config-hasp.js";
import { HIVE_DEFAULTS, type HiveConfig } from "./config-hive.js";
import { INSTAR_DEFAULTS, type InstarConfig } from "./config-instar.js";
import { KEEL_DEFAULTS, type KeelConfig } from "./config-keel.js";
import { LEAD_DEFAULTS, type LeadConfig } from "./config-lead.js";
import { LEDGER_DEFAULTS, type LedgerConfig } from "./config-ledger.js";
import { MANTLE_DEFAULTS, type MantleConfig } from "./config-mantle.js";
import { MAZE_GRIP_DEFAULTS, type MazeGripConfig } from "./config-maze-grip.js";
import { MAZE_TURN_DEFAULTS, type MazeTurnConfig } from "./config-maze-turn.js";
import { MIRROR_DEFAULTS, type MirrorConfig } from "./config-mirror.js";
import { OCULUS_DEFAULTS, type OculusConfig } from "./config-oculus.js";
import { PLUMB_DEFAULTS, type PlumbConfig } from "./config-plumb.js";
import { RATCHET_DEFAULTS, type RatchetConfig } from "./config-ratchet.js";
import { RIME_DEFAULTS, type RimeConfig } from "./config-rime.js";
import { SCUTTLE_DEFAULTS, type ScuttleConfig } from "./config-scuttle.js";
import { SEAM_DEFAULTS, type SeamConfig } from "./config-seam.js";
import { SINEW_DEFAULTS, type SinewConfig } from "./config-sinew.js";
import { SLING_DEFAULTS, type SlingConfig } from "./config-sling.js";
import { SPOOL_DEFAULTS, type SpoolConfig } from "./config-spool.js";
import { STARE_DEFAULTS, type StareConfig } from "./config-stare.js";
import { SURGE_DEFAULTS, type SurgeConfig } from "./config-surge.js";
import { TASTER_DEFAULTS, type TasterConfig } from "./config-taster.js";
import { THROAT_DEFAULTS, type ThroatConfig } from "./config-throat.js";
import { TRIVET_DEFAULTS, type TrivetConfig } from "./config-trivet.js";
import { UNDERTOW_DEFAULTS, type UndertowConfig } from "./config-undertow.js";
import { VALVE_DEFAULTS, type ValveConfig } from "./config-valve.js";
import { VANE_HAND_DEFAULTS, type VaneHandConfig } from "./config-vane.js";
import { VISE_DEFAULTS, type ViseConfig } from "./config-vise.js";
import { WARDEN_HAND_DEFAULTS, type WardenHandConfig } from "./config-warden.js";
import { WELL_DEFAULTS, type WellConfig } from "./config-well.js";

export { BATON_DEFAULTS, type BatonConfig } from "./config-baton.js";
export { STARE_DEFAULTS, type StareConfig } from "./config-stare.js";
export { THROAT_DEFAULTS, type ThroatConfig } from "./config-throat.js";
export { UNDERTOW_DEFAULTS, type UndertowConfig } from "./config-undertow.js";

/**
 * **The bosses that are a clock**, as one block of `SimConfig`.
 *
 * Split out of `config.ts` when THE THROAT's seven dials took that file two
 * lines over its 250-line limit — `config-rounds.ts`' cut made a second time,
 * for the reason that file gives: four lines of barrel a boss adds up faster
 * than anything else in the game, and nine more rounds are designed.
 *
 * The seam is not "the newest four". Every one of these bosses is a *beat
 * count the pair says out loud* — how long the eye takes to turn, how far
 * apart two cadences that never divide each other are, how many beats a
 * handover is in the air, how many beats until the next inhale, how many a
 * plate bows before the lobe comes through it — and that is
 * why each of them got a file of its own rather than a field in
 * `config-boss.ts` next door. That file is where a boss's *place* lives: the
 * queen's row, the Warden's row, the pile's. A place can be read off the
 * screen; a count has to be counted, and a wave that authored its own would be
 * several different bosses wearing one name.
 *
 * `SimConfig` extends `BossClockConfig` rather than nesting it, exactly as it
 * extended the five separately: every call site still reads `cfg.stareTurnBeats`
 * and `cfg.throatInhaleBeats`, and nothing outside this file learns there is a
 * grouping at all.
 */
export interface BossClockConfig
  extends StareConfig,
    BatonConfig,
    ThroatConfig,
    UndertowConfig,
    GorgeConfig,
    CurtainConfig,
    TasterConfig,
    SinewConfig,
    LedgerConfig,
    SurgeConfig,
    LeadConfig,
    ScuttleConfig,
    AntiphonConfig,
    HiveConfig,
    InstarConfig,
    FilamentConfig,
    GimbalConfig,
    MantleConfig,
    KeelConfig,
    ValveConfig,
    SeamConfig,
    OculusConfig,
    ViseConfig,
    RimeConfig,
    TrivetConfig,
    PlumbConfig,
    SlingConfig,
    GrindstoneConfig,
    CystConfig,
    DavitConfig,
    SpoolConfig,
    HaspConfig,
    RatchetConfig,
    MirrorConfig,
    MazeGripConfig,
    MazeTurnConfig,
    WardenHandConfig,
    VaneHandConfig,
    CairnConfig,
    WellConfig {}

export const BOSS_CLOCK_DEFAULTS: BossClockConfig = {
  ...STARE_DEFAULTS,
  ...BATON_DEFAULTS,
  ...THROAT_DEFAULTS,
  ...UNDERTOW_DEFAULTS,
  ...GORGE_DEFAULTS,
  ...CURTAIN_DEFAULTS,
  ...TASTER_DEFAULTS,
  ...SINEW_DEFAULTS,
  ...LEDGER_DEFAULTS,
  ...SURGE_DEFAULTS,
  ...LEAD_DEFAULTS,
  ...SCUTTLE_DEFAULTS,
  ...ANTIPHON_DEFAULTS,
  ...HIVE_DEFAULTS,
  ...INSTAR_DEFAULTS,
  ...FILAMENT_DEFAULTS,
  ...GIMBAL_DEFAULTS,
  ...MANTLE_DEFAULTS,
  ...KEEL_DEFAULTS,
  ...VALVE_DEFAULTS,
  ...SEAM_DEFAULTS,
  ...OCULUS_DEFAULTS,
  ...VISE_DEFAULTS,
  ...RIME_DEFAULTS,
  ...TRIVET_DEFAULTS,
  ...PLUMB_DEFAULTS,
  ...SLING_DEFAULTS,
  ...GRINDSTONE_DEFAULTS,
  ...CYST_DEFAULTS,
  ...DAVIT_DEFAULTS,
  ...SPOOL_DEFAULTS,
  ...HASP_DEFAULTS,
  ...RATCHET_DEFAULTS,
  ...MIRROR_DEFAULTS,
  ...MAZE_GRIP_DEFAULTS,
  ...MAZE_TURN_DEFAULTS,
  ...WARDEN_HAND_DEFAULTS,
  ...VANE_HAND_DEFAULTS,
  ...CAIRN_DEFAULTS,
  ...WELL_DEFAULTS,
};
