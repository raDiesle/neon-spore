import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import type { MechanicId } from "./mechanics.js";
import { WAVES, type Wave } from "./waves.js";

/**
 * Which wave to open to see each mechanic, and what the run has to be switched
 * to before it shows.
 *
 * `unreachedMechanics` answers a narrower question — is anything built and
 * played by nothing — and it answers it about the catalogue as a whole. This
 * answers the one a person actually asks when they have just finished
 * something: *where do I go to watch it work.* One wave per mechanic, named,
 * so that the answer is a wave number rather than an afternoon.
 *
 * **A `Wave` does not carry its own configuration, and should not.** The
 * obvious shape for this file was a `config?: Partial<SimConfig>` field on
 * `Wave` itself, so that opening the wave turned its mechanic on. Three things
 * are wrong with it, in rising order of seriousness.
 *
 * It is world state. A field that changes what a tick does has to enter
 * `hashWorld` and be recorded by every replay, or two devices reading the same
 * wave list could still tick differently — that much is only a cost, and a
 * payable one.
 *
 * It is a switch on the wrong noun. A wave's opening is a property of the run
 * being played with two people in front of it, not of the wave: `briefings`
 * off is a headless caller with no thumbs, and a per-wave override would put
 * the pair's gate in front of one of those in a place it cannot see coming.
 *
 * And it would put the two-thumb gate back where `DEFAULT_CONFIG` exists to
 * keep it out of. `config-pair.ts` says it plainly: those switches are off by
 * default because a headless caller has no thumbs — the director's loop
 * answering its own `needWave`, a replay walking recorded input, a determinism
 * run, a shape sheet. An override scattered through the wave list puts a gate
 * in front of every one of them, in a place none of them can see coming.
 *
 * So a `run` mechanic is not demonstrated by a wave. It is demonstrated by a
 * **named starting point**: a wave to open, and the configuration to open it
 * with, applied where a configuration is already chosen — at `createWorld`, by
 * the caller that has two thumbs. `apps/game` already turns all three on, so
 * for a person opening the game the switching is done and only the wave number
 * was ever missing. Nothing here is read by the simulation, nothing is part of
 * a `Wave`, and `DEFAULT_CONFIG` is untouched.
 */
export interface Demonstration {
  /**
   * The wave to open, by its stable `id` (`Wave.id`) rather than by index or by
   * name. An index would survive neither the director's reordering nor its
   * rewrites; a *name* survives reordering but not a rename, and the rename is
   * the one that has already landed `main` red — the director edits a wave's
   * name from its own screen, and four references written against the old name
   * were left behind. The id is the one handle the director never edits, so a
   * reference written against it holds through both.
   */
  waveId: string;
  /**
   * What the run has to be switched to on top of `DEFAULT_CONFIG` for the
   * mechanic to show at all. Absent for everything a wave puts on the field by
   * itself, which is most of them.
   */
  config?: Partial<SimConfig>;
}

/**
 * One row per mechanic, total by construction: a kind added to the simulation
 * fails the type check here until somebody has said where it can be watched.
 * That is the whole point of the file — the registry can already say a
 * mechanic is reached, and reached is not the same as *shown to somebody*.
 */
export const DEMONSTRATIONS: Record<MechanicId, Demonstration> = {
  slick: { waveId: "first-step" },
  bulb: { waveId: "two-colours" },
  lure: { waveId: "the-lure" },
  throb: { waveId: "the-throb" },
  shell: { waveId: "the-third-shot" },
  meteor: { waveId: "the-rock" },
  meteorMedium: { waveId: "the-ward" },
  meteorFast: { waveId: "the-ward" },
  meteorFaster: { waveId: "the-ward" },
  meteorFastest: { waveId: "the-ward" },
  torch: { waveId: "torch" },
  queen: { waveId: "bulb-queen" },
  warden: { waveId: "the-warden" },
  tether: { waveId: "the-warden" },
  mirror: { waveId: "the-mirror" },
  maze: { waveId: "the-maze" },
  vane: { waveId: "the-vane" },
  mend: { waveId: "salvage" },
  purge: { waveId: "the-purge" },
  ward: { waveId: "the-ward" },
  clasp: { waveId: "the-clasp" },
  dart: { waveId: "the-dart" },
  veil: { waveId: "the-veil" },
  lid: { waveId: "the-lid" },
  wisp: { waveId: "the-wisp" },
  ghost: { waveId: "the-ghost" },
  echo: { waveId: "the-echo" },
  rind: { waveId: "the-rind" },
  gyre: { waveId: "the-gyre" },
  // The six on the rim are watched in that same wave and can be watched
  // nowhere else: nothing authors a mount, a wheel brings them.
  mount: { waveId: "the-gyre" },
  gauge: { waveId: "the-gauge" },
  fleet: { waveId: "the-fleet" },
  snake: { waveId: "snake" },
  pinball: { waveId: "pinball" },
  // A fresh pair meeting the slick, which is the first card the game ever
  // raises and the shortest wave to raise one.
  briefing: { waveId: "first-step", config: { briefings: true } },
  // The grid is worth watching where the beat is already the enemy: a Throb
  // can only be hit while it is open, and a laid shot leaves on a named
  // moment. Half a beat is the value `apps/game` ships.
  windup: { waveId: "the-throb", config: { shotChargeBeats: 0.5 } },
  lance: { waveId: "the-lance" },
  // Three rocks on one beat and one shield: the only way through is a hand on
  // two of them, which is THE GRIP with nothing else in the way.
  grip: { waveId: "the-hand" },
};

/** Where the demonstration wave sits in `WAVES`, or -1 if it has gone. */
export function demonstrationIndex(id: MechanicId): number {
  return WAVES.findIndex((w) => w.id === DEMONSTRATIONS[id].waveId);
}

/** The wave itself. Throws rather than returning undefined — an id that no
 * longer exists is a broken registry, not an empty answer. */
export function demonstrationWave(id: MechanicId): Wave {
  const wave = WAVES[demonstrationIndex(id)];
  if (!wave) {
    throw new Error(`${id} names wave id "${DEMONSTRATIONS[id].waveId}", which is not in WAVES`);
  }
  return wave;
}

/**
 * The configuration to open that wave with. The patch is applied over a base —
 * `DEFAULT_CONFIG` for a headless caller, the game's own config for the game —
 * and never over `DEFAULT_CONFIG` in place: this returns a new object and the
 * default stays what every replay and every shape sheet already assumes.
 */
export function demonstrationConfig(id: MechanicId, base: SimConfig = DEFAULT_CONFIG): SimConfig {
  return { ...base, ...DEMONSTRATIONS[id].config };
}
