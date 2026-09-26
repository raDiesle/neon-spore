import { breachHull } from "./hull-damage.js";
import { livingKindForColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import {
  type ScuttlePart,
  type ScuttleState,
  scuttleAttached,
  scuttleBoss,
  scuttleClearSwing,
  scuttleLeft,
  scuttlePartCol,
  scuttleSocketCol,
  scuttleThrowBeat,
  scuttleTwins,
  scuttleWindBeats,
  scuttleWinding,
} from "./scuttle.js";
import { openSlow } from "./slow.js";
import { spawnOne } from "./spawn.js";
import { MILLI, type World } from "./world.js";

/**
 * THE SCUTTLE's clock — the count, the detachment, the throw, the wind-up
 * and the collapse. What strikes a hanging part off is `scuttle-shot.ts`,
 * on the tick.
 *
 * Everything here runs on the **beat** from `stepBoss`, and in one order:
 * whatever hangs and is due is **thrown**, and then the next part comes
 * **loose** on the same beat, so that from the first throw to the last
 * there is always one part hanging and the cadence the pair counts is the
 * window they have. A part struck off leaves nothing hanging, and the next
 * comes loose on the beat after — the beat a strike buys.
 *
 * **What it throws is what its wave is** (`bossFillsWave`): a rock at the
 * top of the part's column, a slick or a bulb in the part's colour, or a pod
 * hung at `scuttlePodRow` for the pair to shoot loose and take. A pod not
 * taken loses the wave like any pod does — the owner's rule of 12 September
 * 2026 is not this boss's to bend — so the design's *it falls through* is
 * the wave lost, and a pod among the parts is a threat with a beat inside it.
 */

/** Install it from the wave's own `boss:` entry: the frame full, the parts sown by the seed. */
export function installScuttle(world: World): ScuttleState {
  const cfg = world.cfg;
  const parts: (ScuttlePart | null)[] = [];
  const count = Math.max(1, cfg.scuttleRows * cfg.scuttleCols);
  for (let i = 0; i < count; i++) {
    parts.push({
      kind: nextInt(world.rng, 3) === 0 ? "rock" : "body",
      color: nextInt(world.rng, 2) === 0 ? "red" : "cyan",
    });
  }
  // The pods, sown into sockets that are not the same one twice, and never
  // the last socket the seed would leave: the last part is the wind-up's.
  for (let sown = 0; sown < Math.min(cfg.scuttlePods, count - 1); ) {
    const i = nextInt(world.rng, count);
    const p = parts[i];
    if (p === null || p === undefined || p.kind === "pod") continue;
    p.kind = "pod";
    sown += 1;
  }
  const s: ScuttleState = {
    kind: "scuttle",
    parts,
    loose: [],
    live: -1,
    lastLive: -1,
    cycleBeat: world.beat,
    slack: 0,
    windBeat: -1,
    downBeat: -1,
    held: -1,
    swung: -1,
    swungCol: -1,
  };
  world.events.push({ type: "scuttleEnter", col: scuttleSocketCol(cfg, 0), parts: count });
  return s;
}

/** Which attached part is live this cycle: any of them, until the frame is fast — then the one farthest from the last, so the cannon crosses the field. */
function pickLive(world: World, s: ScuttleState, attached: number[]): number {
  const cfg = world.cfg;
  if (s.lastLive < 0 || scuttleLeft(s) > cfg.scuttleFastParts) {
    return attached[nextInt(world.rng, attached.length)] ?? -1;
  }
  const from = scuttleSocketCol(cfg, s.lastLive);
  let far = -1;
  const farthest: number[] = [];
  for (const i of attached) {
    const d = Math.abs(scuttleSocketCol(cfg, i) - from);
    if (d > far) {
      far = d;
      farthest.length = 0;
    }
    if (d === far) farthest.push(i);
  }
  return farthest[nextInt(world.rng, farthest.length)] ?? -1;
}

/** The next part comes loose — two, once the frame is thin enough, with the second never the last part in it. */
function detach(world: World, s: ScuttleState): void {
  const cfg = world.cfg;
  const attached = scuttleAttached(s);
  if (attached.length === 0) return;
  const live = pickLive(world, s, attached);
  s.loose = [live];
  s.live = live;
  s.lastLive = live;
  s.cycleBeat = world.beat;
  scuttleClearSwing(s);
  if (scuttleTwins(s, cfg) && attached.length > 2) {
    const rest = attached.filter((i) => i !== live);
    s.loose.push(rest[nextInt(world.rng, rest.length)] ?? live);
  }
  const throwBeat = scuttleThrowBeat(s, cfg);
  for (const i of s.loose) {
    world.events.push({
      type: "scuttleLoose",
      col: scuttleSocketCol(cfg, i),
      socket: i,
      live: i === live,
      throwBeat,
    });
  }
}

/** One part down its column as the arrival it is. */
function throwPart(world: World, col: number, p: ScuttlePart): void {
  if (p.kind === "pod") {
    world.pods.push({
      id: world.nextId++,
      colMilli: col * MILLI,
      rowMilli: world.cfg.scuttlePodRow * MILLI,
      driftMilli: 0,
      loose: false,
      // A piece of the frame's own plating, so what it gives is the shield
      // held: the beat it buys is `scuttlePodTaken`'s.
      kind: "ward",
      husk: false,
      crossMilli: 0,
    });
    return;
  }
  const kind = p.kind === "rock" ? "meteor" : livingKindForColor(p.color);
  spawnOne(world, { beat: world.beat, col, kind, color: p.kind === "rock" ? null : p.color });
}

/** Everything hanging is thrown. */
function throwLoose(world: World, s: ScuttleState): void {
  const cfg = world.cfg;
  for (const i of s.loose) {
    const p = s.parts[i];
    if (p === null || p === undefined) continue;
    const col = scuttlePartCol(s, cfg, i);
    throwPart(world, col, p);
    s.parts[i] = null;
    world.events.push({ type: "scuttleThrow", col, socket: i, left: scuttleLeft(s) });
  }
  s.loose = [];
  s.live = -1;
}

/** One part left: it draws back for the throw, and the field is watched at the slow rate while it does. */
function wind(world: World, s: ScuttleState): void {
  const cfg = world.cfg;
  const last = scuttleAttached(s)[0];
  if (last === undefined) return;
  s.loose = [last];
  s.live = last;
  s.lastLive = last;
  s.windBeat = world.beat;
  s.cycleBeat = world.beat;
  scuttleClearSwing(s);
  openSlow(world, cfg.scuttleSlowBeats, "ask");
  world.events.push({
    type: "scuttleWind",
    col: scuttleSocketCol(cfg, last),
    socket: last,
    throwBeat: s.windBeat + scuttleWindBeats(cfg),
  });
}

/** The last part thrown: straight through the hull, and the wave is lost to it (`wave-fail.ts`). */
function last(world: World, s: ScuttleState): void {
  const col = scuttleSocketCol(world.cfg, s.live);
  s.parts[s.live] = null;
  s.loose = [];
  s.live = -1;
  breachHull(world, col, "meteor", 0, "heavy");
  world.events.push({ type: "scuttleLast", col });
}

/** The beam stood in the last part's column: it goes in its socket, and the frame collapses. */
export function scuttleDown(world: World, s: ScuttleState): void {
  const col = scuttleSocketCol(world.cfg, s.live);
  s.parts[s.live] = null;
  s.loose = [];
  s.live = -1;
  s.downBeat = world.beat;
  world.events.push({ type: "scuttleDown", col });
}

/** A thrown pod was taken: every cadence from here on is a beat longer. Called by `pod-intake.ts` for every pod taken, and in this wave every pod is the frame's. */
export function scuttlePodTaken(world: World, col: number): void {
  const s = scuttleBoss(world);
  if (s === null || s.downBeat >= 0) return;
  s.slack += world.cfg.scuttlePodSlackBeats;
  world.events.push({ type: "scuttleSlack", col, slack: s.slack });
}

/** After a throw or a strike: the last part winds up, anything else comes loose. */
function settle(world: World, s: ScuttleState): void {
  if (scuttleLeft(s) === 1) wind(world, s);
  else detach(world, s);
}

/** One beat of the frame. */
export function stepScuttle(world: World, s: ScuttleState): void {
  const cfg = world.cfg;
  if (s.downBeat >= 0) {
    // Nulled here rather than at the beam, so the frame has its beats of
    // sockets closing before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - s.downBeat >= cfg.scuttleOutBeats) {
      world.events.push({ type: "scuttleOut", col: scuttleSocketCol(cfg, 0) });
      world.boss = null;
    }
    return;
  }
  if (scuttleWinding(s)) {
    if (world.beat >= scuttleThrowBeat(s, cfg)) last(world, s);
    return;
  }
  // The last part was thrown: the wave is lost and the frame is a frame.
  if (scuttleLeft(s) === 0) return;
  if (s.loose.length === 0) {
    // The count, before the first part; the beat a strike bought, after one.
    const rest = s.lastLive < 0 ? cfg.scuttleLookBeats : 0;
    if (world.beat - s.cycleBeat >= rest) settle(world, s);
    return;
  }
  if (world.beat >= scuttleThrowBeat(s, cfg)) {
    throwLoose(world, s);
    settle(world, s);
  }
}
