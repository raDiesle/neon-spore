import { kindForColor } from "@neon-spore/content";
import {
  type BossEntry,
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  type PodEntry,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * The apparatus behind a posed frame: a world put into one named state.
 *
 * A state is a thing the game *does*, and the design writes it down in prose —
 * "the shield is passively useless", "the lobe fills over three beats", "one
 * of the two marks is real". A reader who has not seen it has to build the
 * picture themselves, and two readers build two different ones.
 *
 * So a pose is a real run of the real simulation, held at the moment it means
 * something, and `pose-art.ts` draws it with the shipping renderer. Not a
 * captured screenshot: a captured one is a picture of the game as it was on
 * the day somebody remembered to take it, and it goes quietly wrong the first
 * time a colour or a lobe changes. This one cannot — it is the same code the
 * phone runs, one frame of it.
 *
 * **A pose never sets a field it could reach.** `until` runs the world forward
 * until the state arrives, so the queen's mark opens because her own phase
 * clock opened it. A pose that assigned `boss.openBeat` by hand would draw a
 * world the game can never be in, which is the one thing a reference picture
 * must not do.
 */

/** The hull is held: a pose must not be able to end the run it is posing. */
const POSE_CONFIG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
export const POSE_TPB = ticksPerBeat(POSE_CONFIG);

/**
 * What a pose is, and the cadence a VERSUS pair replays one on — moved to
 * `pose-type.ts` when `Pose` grew a field and this file was at the ceiling,
 * and re-exported here because every caller already asks this file for them.
 */
export {
  type CropKind,
  cadenceElapsed,
  EVENT_CADENCE_SECONDS,
  type Pose,
  type PoseGroup,
} from "./pose-type.js";

/**
 * A living creature to spawn. The silhouette follows from the colour through
 * `kindForColor` and is never named beside it — a slick spelled out next to
 * "red" is a second copy of the one mapping the bestiary owns.
 */
export const living = (color: Color, col: number, beat = 0): SpawnEntry => ({
  beat,
  col,
  kind: kindForColor(color),
  color,
});

/**
 * Where a `tile` crop is centred: the first body of the kind the pose is named
 * after, read off the posed world rather than guessed.
 *
 * Here rather than in one of the pose files because two of them want it —
 * `poses-versus.ts` centres on a magnet, a rock and a strand, `poses-bodies.ts`
 * on a dart — and a second copy of "find the body this picture is about" is
 * how one sheet ends up centred on a creature the caption is not describing.
 */
export const firstOfKind =
  (kind: string) =>
  (w: World): { col: number; row: number } => {
    const c = w.creatures.find((x) => x.kind === kind) ?? w.creatures[0];
    return c ? { col: c.col, row: c.row } : { col: 5, row: 7 };
  };

/** A rock to spawn. It carries no colour, which is the whole of what it is. */
export const rock = (col: number, kind: SpawnEntry["kind"] = "meteor", beat = 0): SpawnEntry => ({
  beat,
  col,
  kind,
  color: null,
});

/**
 * A world at the start of a wave, with whatever the pose needs in it.
 *
 * `cfg` is for the poses that exist to show a *rule* rather than a body, and
 * it is deliberately per-pose rather than a change to `POSE_CONFIG`. A mechanic
 * that ships switched off — `shotChargeBeats` is the one this was added for —
 * cannot be posed at all out of the default config, and turning it on for
 * every pose would quietly re-time the shot in every other picture on the
 * sheet, including the ones a candidate hull skin is being judged in. A pose
 * that needs a rule turned on says so itself.
 *
 * `waveIndex` is the same kind of exception, for one pose. The band draws
 * whatever `WAVES[world.wave].controls` names, and wave 0 is `standard1` — no
 * GUARD, no INTAKE — so no pose had ever drawn an ACTION face.
 */
export function fresh(
  queue: SpawnEntry[] = [],
  pods: PodEntry[] = [],
  boss: BossEntry | null = null,
  cfg: Partial<SimConfig> = {},
  waveIndex = 0,
): World {
  const world = createWorld({ ...POSE_CONFIG, ...cfg }, 11);
  startWave(world, waveIndex, queue, pods, boss);
  return world;
}

/** Run `ticks` ticks, sending each command on the tick it is listed for. */
export function run(world: World, ticks: number, cmds: TimedCommand[] = []): void {
  const byTick = new Map<number, TimedCommand[]>();
  for (const c of cmds) byTick.set(c.tick, [...(byTick.get(c.tick) ?? []), c]);
  const stop = world.tick + ticks;
  while (world.tick < stop) step(world, byTick.get(world.tick) ?? []);
}

/**
 * Run until the world is in the state the pose is named after.
 *
 * It throws rather than returning what it got. A gallery of reference pictures
 * whose captions have drifted off their frames is worse than no gallery, and a
 * pose that can no longer reach its own state is exactly how that starts —
 * `test/poses.test.ts` runs every one of these for that reason.
 */
export function until(
  world: World,
  what: string,
  want: (world: World) => boolean,
  budget = POSE_TPB * 60,
): void {
  const stop = world.tick + budget;
  while (world.tick < stop) {
    if (want(world)) return;
    step(world, []);
  }
  if (!want(world)) throw new Error(`the world never reached ${what}`);
}

/**
 * Run with commands until the state arrives, a tick at a time — so the frame
 * is the tick it happened on rather than a beat later with the flash gone.
 * Throws on a budget it never reached, for the reason `until` gives.
 */
export function runUntil(
  world: World,
  what: string,
  cmds: TimedCommand[],
  want: (world: World) => boolean,
  budget = POSE_TPB * 60,
): void {
  const byTick = new Map<number, TimedCommand[]>();
  for (const c of cmds) byTick.set(c.tick, [...(byTick.get(c.tick) ?? []), c]);
  const stop = world.tick + budget;
  while (world.tick < stop) {
    step(world, byTick.get(world.tick) ?? []);
    if (want(world)) return;
  }
  throw new Error(`the world never reached ${what}`);
}

/** Commands, spelled short — a pose is mostly a list of these. `prime` is player 2's thumb on a colour: down fills the cannon lobe, up is the ordinary shot (`sim/lance.ts`). */
export const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
export const ward = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
export const guard = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "guard" },
});
export const suck = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});
export const prime = (tick: number, on: boolean, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "prime", on, color },
});
export const shoot = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
export const hold = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
