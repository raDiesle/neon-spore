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
   * The wave to open, by its `id`.
   *
   * Not by index: the director reorders `WAVES` and rewrites the file, and an
   * index written here would go on pointing somewhere plausible and wrong.
   * And not by *name*, which is what this used to be — the director can
   * rename a wave from its own screen, so a name here made the owner's save
   * land `main` red. It happened: ON THE BEAT became THE THROB and HOLD IT
   * OPEN became THE LID, and the four places naming those waves by string
   * stayed where they were. An `id` is the one field that rename does not
   * touch (`Wave.id`).
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
  slick: { wave: "firstStep" },
  bulb: { wave: "cyan" },
  lure: { wave: "theLure" },
  strand: { wave: "theStrand" },
  crawler: { wave: "theCrawler" },
  throb: { wave: "theThrob" },
  shell: { wave: "theThirdShot" },
  meteor: { wave: "theRock" },
  meteorMedium: { wave: "theWard" },
  meteorFast: { wave: "theWard" },
  meteorFaster: { wave: "theWard" },
  meteorFastest: { wave: "theWard" },
  torch: { wave: "torch" },
  veer: { wave: "theVeer" },
  queen: { wave: "bulbQueen" },
  warden: { wave: "theWarden" },
  tether: { wave: "theWarden" },
  mirror: { wave: "theMirror" },
  maze: { wave: "theMaze" },
  vane: { wave: "theVane" },
  mend: { wave: "salvage" },
  purge: { wave: "thePurge" },
  ward: { wave: "theWard" },
  clasp: { wave: "theClasp" },
  dart: { wave: "theDart" },
  veil: { wave: "theVeil" },
  lid: { wave: "theLid" },
  wisp: { wave: "theWisp" },
  ghost: { wave: "theGhost" },
  echo: { wave: "theEcho" },
  rind: { wave: "theRind" },
  recoil: { wave: "theRecoil" },
  gyre: { wave: "theGyre" },
  carom: { wave: "theCarom" },
  // Watched in that same wave and nowhere else: nothing authors a chute, a
  // carom throws one out.
  chute: { wave: "theCarom" },
  volley: { wave: "theVolley" },
  // The six on the rim are watched in that same wave and can be watched
  // nowhere else: nothing authors a mount, a wheel brings them.
  mount: { wave: "theGyre" },
  gauge: { wave: "theGauge" },
  fleet: { wave: "theFleet" },
  snake: { wave: "snake" },
  pinball: { wave: "pinball" },
  // A fresh pair meeting the slick, which is the first card the game ever
  // raises and the shortest wave to raise one.
  briefing: { wave: "firstStep", config: { briefings: true } },
  // The grid is worth watching where the beat is already the enemy: a Throb
  // can only be hit while it is open, and a laid shot leaves on a named
  // moment. Half a beat is the value `apps/game` ships.
  windup: { wave: "theThrob", config: { shotChargeBeats: 0.5 } },
  lance: { wave: "theLance" },
  // Three rocks on one beat and one shield: the only way through is a hand on
  // two of them, which is THE GRIP with nothing else in the way.
  grip: { wave: "theHand" },
  // A wreck on one side and a body on the other, with one cannon between them:
  // the pod is the only thing in the game that makes where the cannon *stands*
  // matter for something other than a shot, so it is the only wave where the
  // hand reaching further than the strip is a thing that can be watched rather
  // than merely described.
  lock: { wave: "catchAndAim" },
};

/** Where the demonstration wave sits in `WAVES`, or -1 if it has gone. */
export function demonstrationIndex(id: MechanicId): number {
  return WAVES.findIndex((w) => w.id === DEMONSTRATIONS[id].wave);
}

/** The wave itself. Throws rather than returning undefined — a name that no
 * longer exists is a broken registry, not an empty answer. */
export function demonstrationWave(id: MechanicId): Wave {
  const wave = WAVES[demonstrationIndex(id)];
  if (!wave) {
    throw new Error(`${id} names wave id "${DEMONSTRATIONS[id].wave}", which is not in WAVES`);
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
