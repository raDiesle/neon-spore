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
 * QUEEN's bloom — is named here by hand, in `BY_HAND`, from the predicates
 * its own file exports (`cairnWaited`, `surgeEverting`,
 * `leadHolding`): the half that cannot be derived, and the half a lane
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
  // The pile stands, a hand on it is buying beats off its clock, a unit is on
  // its way down, the last is settled (`cairnWaited`, `cairnHeldNow`,
  // `CairnState.heldBeats`, `CairnState.settleCol`).
  cairn: ["stacked", "held", "leaving", "settled"],
  // The face square with its seam at twelve, slipping clockwise, that slip
  // stopped under a thumb, and stopped at the far end waiting to be turned
  // home (`WellState.phase`, `wellHeldNow`). It changes nothing about the
  // field in any of them: the state is where the picture puts things, and
  // the wave under it is the wave its author wrote (`well.ts`).
  well: ["still", "rolling", "held", "wound"],
  // A straw being fed, a round passed, the verdict held, and the clock spent
  // with the eater coming down (`spliceCurrent`, `SpliceState.eatBeat`).
  splice: ["feeding", "passed", "verdict", "eaten"],
  // Running the wave, sending a stretch of it back, held by a hand
  // (`repriseEchoing`, `repriseHeld`).
  reprise: ["running", "echoing", "held"],
  // Two axes, as SNAKE's and PINBALL's are (`boss-phases.ts`): what the core
  // is behind the cloth — covered, a lobe softened, bare — and what the rail
  // is, which is `CURTAIN_PHASES` minus the one it hangs in. `pinned` is the
  // state a hit leaves it in, and the one the hem is lifted in
  // (`curtainSoftAt`, `curtainCoreBare`, `CurtainState.phase`).
  curtain: ["covered", "soft", "bare", "pinned", "torn", "out"],
  // Hanging on its rope, a fibre held in the band, swinging off a snap,
  // caught out of that swing by both hands carried apart, falling, out
  // (`sinewHeld`, `sinewInZone`, `sinewSwinging`, `sinewCaught`,
  // `SinewState.fallBeat`, `outBeat`).
  sinew: ["hanging", "held", "swinging", "caught", "falling", "out"],
  // Shut, the pressure in the band, a rock of its own still falling, sealing
  // again after a burst, everting, out (`surgeInBand`, `surgeWarding`,
  // `surgeSealing`, `surgeEverting`).
  surge: ["shut", "band", "warding", "sealing", "everting", "out"],
  // Pacing a column a beat, running two, still, that still held open under a
  // thumb, passing the ship, down (`leadRunning`, `leadStill`, `leadHolding`,
  // `leadPassing`, `leadDown`).
  lead: ["pacing", "running", "still", "held", "passing", "down"],
  // A part attached, one hanging part under the pilot's thumb, one carried a
  // column along the frame, winding the last one back, down (`scuttleAttached`,
  // `ScuttleState.held`, `scuttleSwingable`, `scuttleWinding`, `scuttleDown`).
  scuttle: ["attached", "held", "swung", "winding", "down"],
  // The organs cycling, a candidate crossed off her rail, the rail still for a
  // pick, down (`antiphonStruck`, `antiphonCrossed`, `AntiphonState.crossed`,
  // `AntiphonState.stillBeat`, `antiphonDown`).
  antiphon: ["cycling", "pulled", "still", "down"],
};

/** The states of every boss, `BOSS_KINDS`' order, a table's names where one exists. */
export const BOSS_STATES: Record<BossKind, readonly string[]> = Object.fromEntries(
  BOSS_KINDS.map((kind) => [kind, BOSS_PHASES[kind] ?? BY_HAND[kind] ?? []]),
) as Record<BossKind, readonly string[]>;

/** What the boss is called on the sheet: the name of the wave that carries it. */
export function bossTitle(kind: BossKind): string {
  return WAVES.find((w) => w.boss?.kind === kind)?.name ?? kind.toUpperCase();
}
