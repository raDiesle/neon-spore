import {
  type BossEntry,
  type Color,
  createRng,
  next,
  nextInt,
  type PodEntry,
  type SpawnEntry,
} from "@neon-spore/sim";
import { kindForColor } from "./creatures.js";
import { WAVES, type Wave } from "./waves.js";

const COLORS: Color[] = ["red", "cyan"];
/** The field waves are authored against. The real `cols` is remapped from it. */
export const AUTHORED_COLS = 7;
/**
 * The last authored column index — authoring uses 0..AUTHORED_COL_MAX. Its own
 * export so that a bound check elsewhere calls it instead of writing
 * `AUTHORED_COLS - 1` by hand, which is also `mapCol`'s own arithmetic and
 * would otherwise trip the guard meant to catch that formula re-derived.
 */
export const AUTHORED_COL_MAX = AUTHORED_COLS - 1;

/** Waves are authored for 7 columns. Remap, never re-author. */
export function mapCol(col: number, cols: number): number {
  const mapped = Math.round((col * (cols - 1)) / AUTHORED_COL_MAX);
  return Math.max(0, Math.min(cols - 1, mapped));
}

/**
 * Turn a wave into a spawn queue. Seeded by the wave index, so the same wave
 * always plays out the same way — see the randomness rule in
 * docs/spec/structure.md: only what one player knows and the other does not
 * may be random.
 */
export function buildQueue(waveIndex: number, cols: number): SpawnEntry[] {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (!wave) return buildContinuation(waveIndex, cols);
  return queueFromWave(wave, cols);
}

/**
 * The same translation, for a wave that is not in `WAVES` — the one the
 * director is editing before it has been saved.
 */
export function queueFromWave(wave: Wave, cols: number): SpawnEntry[] {
  const queue: SpawnEntry[] = [];
  for (const e of wave.entries) {
    const color = e.color;
    // A named kind wins, and the colour decides the silhouette only when the
    // entry does not say. That order is what THE LURE needs and no other kind
    // has ever exercised: a lure names both, because its colour is the
    // disguise's rather than its own (`wave-types.ts`). For everything else
    // the two are still never written together, so the `??` never fires and
    // this reads exactly as it always did.
    const kind = e.kind ?? (color ? kindForColor(color) : "meteor");
    // Which body a lure wears follows from the colour it was authored in,
    // exactly as a real arrival's does — one call, not a second copy of the
    // pairing. That is the whole disguise: a lure is a *correct* body in a
    // *correct* colour, and a bulb in red would be the one tell nothing else
    // in the game could produce. `e.wears` overrides it, and today nothing
    // does; a wave that ever did would be authoring a mismatch on purpose.
    const wears = kind === "lure" && color ? (e.wears ?? kindForColor(color)) : e.wears;
    queue.push({
      beat: e.beat,
      col: mapCol(e.col, cols),
      kind,
      color,
      wears,
      // The authored width, under the name everything downstream of here uses
      // for it (`SpawnEntry.span`). Only when the wave asked for one: an
      // absent span means "the kind's own", which is what `spanOf` answers.
      ...(e.size === undefined ? {} : { span: e.size }),
      // A ghost's path, on the same terms: only when the wave asked for
      // something other than the fall every other body takes, so a ghost
      // authored `"down"` — or written before crossing existed — carries no
      // field at all and produces the identical world.
      ...(e.path === undefined || e.path === "down" ? {} : { path: e.path }),
    });
  }
  return queue.sort((a, b) => a.beat - b.beat);
}

/**
 * The pods of a wave, remapped onto the real field the same way the spawns are.
 * A separate call rather than a second return value, because a pod queue is a
 * separate thing to the simulation: `startWave` takes them apart.
 */
export function buildPods(waveIndex: number, cols: number): PodEntry[] {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (wave) return podsFromWave(wave, cols);

  // Beyond the authored waves, every third one carries a pod. Seeded off the
  // wave index like everything else, and off a different stream from the
  // spawns, so the pod does not land under the same creature every time.
  const beyond = waveIndex - WAVES.length;
  if (beyond % 3 !== 0) return [];
  const rng = createRng(waveIndex + 9973);
  return [{ beat: 1 + nextInt(rng, 3), col: nextInt(rng, cols), row: 2 + nextInt(rng, 3) }];
}

/** `buildPods` for an unsaved wave. The sibling of `queueFromWave`. */
export function podsFromWave(wave: Wave, cols: number): PodEntry[] {
  return (wave.pods ?? []).map((p) => ({ ...p, col: mapCol(p.col, cols) }));
}

/** The boss of an authored wave, remapped onto the real field, or null. */
export function buildBoss(waveIndex: number, cols: number): BossEntry | null {
  const wave: Wave | undefined = WAVES[waveIndex];
  if (wave) return bossFromWave(wave, cols);
  return null;
}

/**
 * `buildBoss` for an unsaved wave. The sibling of `podsFromWave`.
 *
 * Only the queen has a column to remap — THE MIRROR stands over the ship
 * wherever the ship is, and THE WARDEN is a fixture dead centre, so neither
 * entry names a place at all and both pass through untouched.
 */
export function bossFromWave(wave: Wave, cols: number): BossEntry | null {
  const boss = wave.boss;
  if (!boss) return null;
  if (boss.kind === "mirror") return { ...boss, rounds: boss.rounds.map((r) => [...r]) };
  if (boss.kind === "warden") return { ...boss };
  // THE VANE hangs dead centre off the top edge, so it has no authored column
  // to remap either.
  if (boss.kind === "vane") return { ...boss };
  // THE MAZE has no authored column either: `mazeMouthCol` spreads its three
  // mouths across whatever field it is played on.
  if (boss.kind === "maze") return { ...boss, rounds: boss.rounds.map((t) => ({ ...t })) };
  // THE GAUGE has no field to have a column on. Its wave is its own screen.
  if (boss.kind === "gauge") return { ...boss };
  // THE FLEET is the one boss authored in the *real* field's squares, and it
  // is the exception this function otherwise exists to prevent. `mapCol`
  // rounds, and a rounded run of squares is not a run: a five-long hull put
  // through it comes out with gaps, which is a ship the pair can shoot
  // straight through the middle of. So a chart passes through untouched, and
  // `FleetShip` is where that is argued.
  if (boss.kind === "fleet") return { ...boss, ships: boss.ships.map((s) => ({ ...s })) };
  return { ...boss, col: mapCol(boss.col, cols) };
}

/** Beyond the authored waves: reproducible filler, clearly marked as such. */
function buildContinuation(waveIndex: number, cols: number): SpawnEntry[] {
  const rng = createRng(waveIndex);
  const beyond = waveIndex - WAVES.length;
  const creatures = Math.min(9, 3 + Math.floor(beyond / 2));
  const rocks = Math.min(3, 1 + Math.floor(beyond / 4));
  const queue: SpawnEntry[] = [];
  for (let k = 0; k < creatures + rocks; k++) {
    const isRock = k >= creatures;
    const color = isRock ? null : COLORS[nextInt(rng, COLORS.length)]!;
    queue.push({
      beat: Math.floor(k * 1.6 + next(rng) * 1.4),
      col: nextInt(rng, cols),
      kind: color ? kindForColor(color) : "meteor",
      color,
    });
  }
  return queue.sort((a, b) => a.beat - b.beat);
}
