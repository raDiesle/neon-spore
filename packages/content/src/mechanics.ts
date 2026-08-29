import type { BossEntry, CreatureKind, PodKind, SimConfig } from "@neon-spore/sim";
import { MECHANICS } from "./mechanics-table.js";
import { AUTHORED_COLS, bossFromWave, podsFromWave, queueFromWave } from "./queue.js";
import type { Wave } from "./wave-types.js";
import { WAVES } from "./waves.js";

/**
 * Every mechanic the game has, so that something can be said about all of them
 * at once.
 *
 * Three questions were being asked and none of them could be: whether a
 * mechanic that is built is reachable from any wave, whether a wave may turn
 * one on, and whether each has a wave that demonstrates it. `CREATURES` knows
 * creatures, `BOSS_KINDS` knows bosses, and the wave opening and wind-up are
 * switches in config files known to nobody. Nothing knew the union, so nothing
 * could say a member of it was unused.
 *
 * **What counts as one.** A mechanic is a rule the pair has to learn *that the
 * game can be played without*. Take it away and there is still a game — one
 * that is missing something. That line puts the thirteen creatures, the six
 * bosses and the three pods in, and it keeps the substrate
 * out: the cannon, the shield, the beat, the hull, the score and the radar are
 * not mechanics, because a game without any of them is not a smaller game, it
 * is no game. THE GRIP and THE LANCE pass the test — a wave plays perfectly
 * well without either being used once — so they are in, and their rows say the
 * uncomfortable thing out loud: implemented, always available, demanded by no
 * wave.
 *
 * **One sentence each, and this is where it lives.** These sentences used to
 * be read out of the briefing catalogue, which was a record over a closed list
 * of card subjects. That catalogue is gone — help belongs to the wave that
 * needs it (`packages/content/src/wave-types.ts`, `docs/spec/briefings.md`) —
 * and a wave's guide speaks about *that wave*, which is a different sentence
 * from "what is a slick". So the recognisable one-liner is written here, where
 * the bestiary and the mechanic sheet read it, and the guide is written where
 * it is played. The kinds themselves come from the sim's unions, so a
 * creature, a boss or a pod added there is a type error here until it has a
 * row. What a wave contains is read by
 * running content's own translation (`queueFromWave` and its siblings) rather
 * than by re-resolving colours to silhouettes a second time.
 */

/**
 * A mechanic no wave contains — it is on for the whole run or for none of it.
 * They are named by hand because they are the only ones with nowhere else to be
 * named; everything else on the list comes from a union the simulation already
 * publishes.
 */
export type RunMechanicId = "briefing" | "windup" | "lance" | "grip";

/**
 * The closed list. `queen` and `warden` are a `CreatureKind` and a boss kind at
 * once, which is right — the body and the fight are one mechanic — so the
 * union deliberately collapses them and only `mirror` and `vane` are added.
 */
export type MechanicId =
  | CreatureKind
  | PodKind
  | Exclude<BossEntry["kind"], CreatureKind>
  | RunMechanicId;

/**
 * How to tell whether a wave reaches a mechanic — and, for one class, that the
 * question does not fit.
 *
 * - `spawn`: the wave puts it on the field. `mechanicsInWave` answers.
 * - `run`: one switch decides for the whole run, so every wave reaches it or
 *   none does. Asking which wave is asking the wrong question, and a caller
 *   that wants a warning about unused mechanics must leave these out rather
 *   than force an answer — `unreachedMechanics` does.
 *
 * There used to be a third, `gap`: a round that sat *between* two waves and
 * was reached from a table of its own rather than from any wave. Twelve of
 * those were designed and one was built, and all twelve are bosses now — so
 * the class went with the table, and THE GAUGE is a `spawn` like every other
 * boss. `docs/decisions.md` #20 has the argument.
 */
export type Reach = "spawn" | "run";

/**
 * The `SimConfig` field that turns a mechanic on, and the value that means off.
 * `field` is `keyof SimConfig`, so renaming the field in the simulation is a
 * type error here rather than a switch that silently stops being watched.
 *
 * `off` is a value and not a boolean, because `shotChargeBeats` is a grid in
 * beats whose zero means "no grid" — the shot wind-up is a switch that is not
 * a `boolean`, and pretending otherwise would have cost it its row.
 */
export interface MechanicSwitch {
  field: keyof SimConfig;
  off: boolean | number;
}

export interface Mechanic {
  /** One sentence a person would recognise it by. */
  what: string;
  reach: Reach;
  /**
   * Another mechanic that brings this one with it. The tether is only ever
   * installed by THE WARDEN and the torch rides on the queen's wings, so a
   * wave reaches both without naming either.
   */
  carriedBy?: MechanicId;
  switch?: MechanicSwitch;
  /**
   * Whether a `WaveEntry` may write this kind in its `kind` field — true for
   * exactly the creatures that carry no colour and are placed by an author.
   * `WaveKind` below is derived from these flags, so a colourless creature
   * whose row sets this is placeable the moment the row exists, and the union
   * a wave is typed against can never fall behind the bestiary again.
   */
  waveNames?: true;
}

export { MECHANICS } from "./mechanics-table.js";

/** Every id, in table order. */
export const MECHANIC_IDS = Object.keys(MECHANICS) as MechanicId[];

/**
 * One row, widened back to the interface. `MECHANICS` is `as const` so that
 * `WaveKind` can be read out of it, which leaves each row its own exact type
 * and makes `MECHANICS[someId].switch` an error on the rows that carry no
 * switch. Every reader that holds an id rather than a literal goes through
 * here instead.
 */
export function mechanic(id: MechanicId): Mechanic {
  return MECHANICS[id];
}

/**
 * The kinds a `WaveEntry` may name, read back out of the table above rather
 * than written beside it. It used to be `RockKind | "runt" | "throb"`, spelled
 * by hand, so a third colourless creature needed the union extended by hand
 * too — and a forgotten extension is a director that quietly casts an entry no
 * wave can play.
 */
export type WaveKind = {
  [K in CreatureKind]: (typeof MECHANICS)[K] extends { waveNames: true } ? K : never;
}[CreatureKind];

/** Whether a run configured this way has the mechanic at all. */
export function mechanicOn(cfg: SimConfig, id: MechanicId): boolean {
  const s = mechanic(id).switch;
  return s === undefined || cfg[s.field] !== s.off;
}

/**
 * Everything a wave puts in front of the pair, as ids.
 *
 * The wave is run through content's own translation instead of being read
 * field by field: `queueFromWave` is where a colour becomes a silhouette and
 * where a `kind` that was left out becomes a rock, and a second reading of
 * those rules here would be a second reading that drifts. The column count
 * given to it is the authored one, since nothing here asks *where*.
 */
export function mechanicsInWave(wave: Wave): Set<MechanicId> {
  const found = new Set<MechanicId>();
  for (const e of queueFromWave(wave, AUTHORED_COLS)) found.add(e.kind);
  for (const p of podsFromWave(wave, AUTHORED_COLS)) found.add(p.kind ?? "mend");
  const boss = bossFromWave(wave, AUTHORED_COLS);
  if (boss) found.add(boss.kind);
  addCarried(found);
  return found;
}

/**
 * Whatever rides along with what is already there, to a fixed point — a chain
 * rather than one pass, because a carrier may itself be carried.
 */
function addCarried(found: Set<MechanicId>): void {
  for (let grew = true; grew; ) {
    grew = false;
    for (const id of MECHANIC_IDS) {
      const by = mechanic(id).carriedBy;
      if (by !== undefined && found.has(by) && !found.has(id)) {
        found.add(id);
        grew = true;
      }
    }
  }
}

/**
 * The mechanics that are built and that no wave in the game plays through. The
 * `run` mechanics are left out rather than reported as unreached: they are on
 * for every wave or for none, so their answer is `mechanicOn`, not a wave.
 */
export function unreachedMechanics(waves: readonly Wave[] = WAVES): MechanicId[] {
  const reached = new Set<MechanicId>();
  for (const wave of waves) for (const id of mechanicsInWave(wave)) reached.add(id);
  return MECHANIC_IDS.filter((id) => mechanic(id).reach !== "run" && !reached.has(id));
}
