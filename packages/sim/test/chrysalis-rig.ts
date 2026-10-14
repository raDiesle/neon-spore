import { bastionPlateWay, bastionTrackAt, bastionTrackLen } from "../src/bastion-track.js";
import {
  type ChrysalisState,
  type ChrysalisStep,
  chrysalisBoss,
  chrysalisQuillOf,
  chrysalisTrackOf,
} from "../src/chrysalis.js";
import {
  type Bullet,
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  type DragTarget,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE CHRYSALIS's test rig: a script installed, a half of slime rubbed as a
 * thumb would count it — the press at nought and one more each turn back —
 * a quill pulled out along its track, the shield raised, and a bolt met.
 * THE BASTION's rig (`bastion-rig.ts`) on a body that is alive.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly ChrysalisStep[] = [
  { skin: "slime", rubs: 6, beats: 32 },
  { skin: "slime", rubs: 10, beats: 40 },
  { skin: "quills", beats: 36 },
  { skin: "quills", tracks: ["sweep", "sweep", "snake", "climb"], beats: 48 },
  { skin: "sacs", offsets: [-2, 1, 0, 2], beats: 40 },
  { skin: "sacs", offsets: [1, -1, 2, -2, 0], beats: 48 },
  { skin: "heart", offsets: [-1, 2, 0], colors: ["red", "cyan", "red"], beats: 32 },
  { skin: "heart", offsets: [2, -2, 1, -1], colors: ["cyan", "red", "red", "cyan"], beats: 40 },
];

export function install(steps: readonly ChrysalisStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "chrysalis", steps });
  return world;
}

export function chrysalis(world: World): ChrysalisState {
  const s = chrysalisBoss(world);
  if (s === null) throw new Error("the wave installed no chrysalis");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats of ticks; every event type seen. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the cocoon never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until a skin is lit. */
export function toSkin(world: World): Set<string> {
  return runUntil(world, (w) => chrysalis(w).phase === "skin");
}

function drag(player: 1 | 2, target: DragTarget, on: boolean, x = 0, y = 0, id?: number) {
  const command = { kind: "drag", target, on, fromMilli: x, fromYMilli: y } as const;
  return { tick: 0, player, command: id === undefined ? command : { ...command, id } };
}

/** `player`'s rub on `side`'s half, `turns` turns since it went down. */
export function rubAt(player: 1 | 2, side: 0 | 1, turns: number, on = true): TimedCommand {
  return drag(player, side === 0 ? "chrysalisRubLeft" : "chrysalisRubRight", on, 0, 0, turns);
}

/** `side`'s own seat rubs it `turns` times, a turn a tick, and lifts. The event types raised. */
export function rub(world: World, side: 0 | 1, turns: number): string[] {
  const player = side === 0 ? 1 : 2;
  const seen: string[] = [];
  for (let n = 0; n <= turns; n++) seen.push(...tick(world, [rubAt(player, side, n)]));
  return [...seen, ...tick(world, [rubAt(player, side, turns, false)])];
}

/** `player`'s thumb on `side`'s quills, carried `x`, `y` from where it went down. */
export function quill(player: 1 | 2, side: 0 | 1, x = 0, y = 0): TimedCommand {
  return drag(player, side === 0 ? "chrysalisQuillLeft" : "chrysalisQuillRight", true, x, y);
}

/** `player`'s thumb lifted off `side`'s quills. */
export function lift(player: 1 | 2, side: 0 | 1): TimedCommand {
  return drag(player, side === 0 ? "chrysalisQuillLeft" : "chrysalisQuillRight", false);
}

const STEP = 400;

/**
 * `side`'s next quill carried `along` its own track — to its end by default,
 * and a straight one past it — and let go, by the seat it belongs to.
 */
export function pullQuill(world: World, side: 0 | 1, along?: number): string[] {
  const s = chrysalis(world);
  const player = side === 0 ? 1 : 2;
  const i = Math.max(0, chrysalisQuillOf(s, side));
  const track = chrysalisTrackOf(s, i);
  const len = bastionTrackLen(world.cfg, track);
  const to = along ?? (track === "straight" ? len + STEP : len);
  const [wx, wy] = bastionPlateWay(i);
  const seen = tick(world, [quill(player, side)]);
  for (let m = Math.min(STEP, to); ; m = Math.min(to, m + STEP)) {
    const at =
      track === "straight"
        ? { x: Math.round((wx * m) / 1000), y: Math.round((wy * m) / 1000) }
        : bastionTrackAt(world.cfg, track, i, m);
    seen.push(...tick(world, [quill(player, side, at.x, at.y)]));
    if (m >= to) break;
  }
  return [...seen, ...tick(world, [lift(player, side)])];
}

export function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** The navigator slides the shield to `col`; the pilot raises it. Every event type seen. */
export function shield(world: World, col: number): Set<string> {
  const seen = new Set(
    tick(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col } }]),
  );
  for (const t of tick(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]))
    seen.add(t);
  return seen;
}

/** The script with only the skins named, each the first of it in `SCRIPT`. */
export function only(...skins: ChrysalisStep["skin"][]): ChrysalisStep[] {
  return skins.map((k) => {
    const found = SCRIPT.find((s) => s.skin === k);
    if (found === undefined) throw new Error(`no ${k} in the script`);
    return found;
  });
}

export { hashWorld };
