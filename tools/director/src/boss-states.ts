import { WAVES } from "@neon-spore/content";
import { BOSS_KINDS, BOSS_PHASES, type BossEntry } from "@neon-spore/sim";

export type BossKind = BossEntry["kind"];

/**
 * **Every state every boss can be in**, by name — the list the BOSSES
 * category of the STATES sheet is drawn from and held to.
 *
 * The owner asked on 18 September 2026 that every boss's states be documented
 * on that sheet, in a category of their own, and that the documentation be
 * *forced* to change whenever a boss does. The forcing is in two halves.
 * A boss whose states are a phase table in the simulation is read off
 * `BOSS_PHASES` (`sim/boss-phases.ts`), so a phase added there is a state
 * here with no pose, and `test/boss-states.test.ts` goes red until one is
 * written. A boss whose states are not a table — THE CAIRN's pile, THE
 * HIVE's seals, THE QUEEN's bloom — is named here by hand, in `BY_HAND`,
 * from the predicates its own file exports (`cairnWaited`, `hiveOpen`,
 * `surgeEverting`): the half that cannot be derived, and the half a lane
 * changing one of those bosses owes a line to (`.claude/skills/new-boss`).
 *
 * A kind in `BOSS_KINDS` with a row in neither is the same test red, so the
 * thirty-fourth boss cannot land without a row.
 */
const BY_HAND: Partial<Record<BossKind, readonly string[]>> = {
  // Armoured and still, then a bloom for two beats, and every eight a torch
  // out of one wing (`queen-mark.ts`, `queen-torch.ts`). Under BROOD the
  // bloom is pried open by player 1's thumb, under SCREAM it is held open
  // by it (`queen-hand.ts`) — two states the look lane owes a pose.
  queen: ["shut", "open", "pried", "held", "torch"],
  // The pile stands, a unit is on its way down, the last is settled
  // (`cairnWaited`, `CairnState.settleCol`).
  cairn: ["stacked", "leaving", "settled"],
  // It is a projection and changes nothing: one state (`well.ts`).
  well: ["projected"],
  // A straw being fed, a round passed, the verdict held (`spliceCurrent`).
  splice: ["feeding", "passed", "verdict"],
  // Running the wave, sending a stretch of it back, held by a hand
  // (`repriseEchoing`, `repriseHeld`).
  reprise: ["running", "echoing", "held"],
  // Lobes on, one softened, the core bare, torn, out (`curtainSoftAt`,
  // `curtainCoreBare`, `CurtainState.tornBeat`, `outBeat`).
  curtain: ["covered", "soft", "bare", "torn", "out"],
  // Hanging on its rope, a fibre held in the band, swinging off a snap,
  // falling, out (`sinewHeld`, `sinewInZone`, `sinewSwinging`,
  // `SinewState.fallBeat`, `outBeat`).
  sinew: ["hanging", "held", "swinging", "falling", "out"],
  // Shut, the pressure in the band, sealing again after a burst, everting,
  // out (`surgeInBand`, `surgeSealing`, `surgeEverting`).
  surge: ["shut", "band", "sealing", "everting", "out"],
  // Pacing a column a beat, running two, still, passing the ship, down
  // (`leadRunning`, `leadStill`, `leadPassing`, `leadDown`).
  lead: ["pacing", "running", "still", "passing", "down"],
  // A part attached, winding one back, down (`scuttleAttached`,
  // `scuttleWinding`, `scuttleDown`).
  scuttle: ["attached", "winding", "down"],
  // The organs cycling, the rail still for a pick, down (`antiphonStruck`,
  // `AntiphonState.stillBeat`, `antiphonDown`).
  antiphon: ["cycling", "still", "down"],
  // Sealed, a cell open, spilling, down (`hiveOpen`, `HiveState.spillBeat`,
  // `hiveDown`).
  hive: ["sealed", "open", "spilling", "down"],
};

/** The states of every boss, `BOSS_KINDS`' order, a table's names where one exists. */
export const BOSS_STATES: Record<BossKind, readonly string[]> = Object.fromEntries(
  BOSS_KINDS.map((kind) => [kind, BOSS_PHASES[kind] ?? BY_HAND[kind] ?? []]),
) as Record<BossKind, readonly string[]>;

/** What the boss is called on the sheet: the name of the wave that carries it. */
export function bossTitle(kind: BossKind): string {
  return WAVES.find((w) => w.boss?.kind === kind)?.name ?? kind.toUpperCase();
}
