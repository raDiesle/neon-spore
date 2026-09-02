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
   * The wave to open, by name rather than by index. The director reorders
   * `WAVES` and rewrites the file, and an index written here would go on
   * pointing somewhere plausible and wrong; a name that stops existing is a
   * failing test.
   */
  wave: string;
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
  slick: { wave: "FIRST STEP" },
  bulb: { wave: "TWO COLOURS" },
  lure: { wave: "THE LURE" },
  throb: { wave: "ON THE BEAT" },
  shell: { wave: "THE THIRD SHOT" },
  meteor: { wave: "THE ROCK" },
  meteorMedium: { wave: "THE WARD" },
  meteorFast: { wave: "THE WARD" },
  meteorFaster: { wave: "THE WARD" },
  meteorFastest: { wave: "THE WARD" },
  torch: { wave: "TORCH" },
  queen: { wave: "BULB QUEEN" },
  warden: { wave: "THE WARDEN" },
  tether: { wave: "THE WARDEN" },
  mirror: { wave: "THE MIRROR" },
  maze: { wave: "THE MAZE" },
  vane: { wave: "THE VANE" },
  mend: { wave: "SALVAGE" },
  purge: { wave: "THE PURGE" },
  ward: { wave: "THE WARD" },
  clasp: { wave: "THE CLASP" },
  dart: { wave: "THE DART" },
  veil: { wave: "THE VEIL" },
  wisp: { wave: "THE WISP" },
  ghost: { wave: "THE GHOST" },
  gauge: { wave: "THE GAUGE" },
  fleet: { wave: "THE FLEET" },
  snake: { wave: "SNAKE" },
  // A fresh pair meeting the slick, which is the first card the game ever
  // raises and the shortest wave to raise one.
  briefing: { wave: "FIRST STEP", config: { briefings: true } },
  // The grid is worth watching where the beat is already the enemy: a Throb
  // can only be hit while it is open, and a laid shot leaves on a named
  // moment. Half a beat is the value `apps/game` ships.
  windup: { wave: "ON THE BEAT", config: { shotChargeBeats: 0.5 } },
  lance: { wave: "THE LANCE" },
  // Three rocks on one beat and one shield: the only way through is a hand on
  // two of them, which is THE GRIP with nothing else in the way.
  grip: { wave: "THE HAND" },
};

/** Where the demonstration wave sits in `WAVES`, or -1 if it has gone. */
export function demonstrationIndex(id: MechanicId): number {
  return WAVES.findIndex((w) => w.name === DEMONSTRATIONS[id].wave);
}

/** The wave itself. Throws rather than returning undefined — a name that no
 * longer exists is a broken registry, not an empty answer. */
export function demonstrationWave(id: MechanicId): Wave {
  const wave = WAVES[demonstrationIndex(id)];
  if (!wave) {
    throw new Error(`${id} names wave "${DEMONSTRATIONS[id].wave}", which is not in WAVES`);
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
