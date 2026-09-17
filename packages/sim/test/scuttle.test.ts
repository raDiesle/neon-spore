import { describe, expect, it } from "bun:test";
import { bossFillsWave, bossHoldsWave } from "../src/boss-kinds.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  livingKindForColor,
  type SimConfig,
  slowing,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { takeCargo } from "../src/pod-intake.js";
import {
  type ScuttleState,
  scuttleAttached,
  scuttleBoss,
  scuttleCadence,
  scuttleLeft,
  scuttleShootable,
  scuttleSocketCol,
  scuttleThrowBeat,
  scuttleWindBeats,
  scuttleWinding,
} from "../src/scuttle.js";
import { scuttleStruck } from "../src/scuttle-shot.js";
import type { Bullet, Color } from "../src/types.js";
import { failHolds } from "../src/wave-fail.js";
import { MILLI } from "../src/world.js";

/**
 * THE SCUTTLE: the boss racing the pair to its own death.
 *
 * What these pin is the clock and the judgment. That the frame comes in
 * full, with its pods sown and nothing on the field; that it looks for
 * `scuttleLookBeats` before the first part comes loose; that a loose part
 * hangs for the cadence and is then thrown as the arrival it is — a rock,
 * a body in its colour, a pod at `scuttlePodRow`; that a bolt in the live
 * part's column and colour takes it off the frame and the next comes loose
 * on the beat after, the other colour is said and any other column is not;
 * that two come loose from `scuttleTwinParts` and the cadence tightens from
 * `scuttleFastParts`, with the live part crossing the field; that a pod
 * taken adds `scuttlePodSlackBeats` to every cadence after; that the last
 * part winds up under THE SLOW for `lancePrimeBeats` and a beat of slack
 * and then costs the wave through the hull; that the beam ends it in that
 * wind-up and nowhere else; and that the frame collapses over
 * `scuttleOutBeats` before the wave is allowed to end.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "scuttle" });
  return world;
}

function frame(world: World): ScuttleState {
  const s = scuttleBoss(world);
  if (s === null) throw new Error("no frame installed");
  return s;
}

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** Take parts off the frame from the back until `n` are left — the fight further along, without playing it. */
function thin(world: World, n: number): ScuttleState {
  const s = frame(world);
  for (let i = s.parts.length - 1; i >= 0 && scuttleLeft(s) > n; i--) {
    if (!s.loose.includes(i)) s.parts[i] = null;
  }
  return s;
}

/** Run until a part hangs loose, and say how many beats it took. */
function untilLoose(world: World): number {
  const s = frame(world);
  for (let n = 0; n < 40; n++) {
    if (s.loose.length > 0) return n;
    beats(world, 1);
  }
  throw new Error("nothing came loose");
}

/** The live part's column and colour. */
function live(world: World): { socket: number; col: number; color: Color } {
  const s = frame(world);
  const p = s.parts[s.live];
  if (p === null || p === undefined) throw new Error("no live part");
  return { socket: s.live, col: scuttleSocketCol(CFG, s.live), color: p.color };
}

describe("the frame coming in", () => {
  it("comes in full, with its pods sown into sockets that are not the last, and nothing on the field", () => {
    const world = open();
    const s = frame(world);
    expect(s.parts).toHaveLength(CFG.scuttleRows * CFG.scuttleCols);
    expect(s.parts.filter((p) => p?.kind === "pod")).toHaveLength(CFG.scuttlePods);
    expect(s.loose).toEqual([]);
    expect(s.live).toBe(-1);
    expect(s.slack).toBe(0);
    expect(s.windBeat).toBe(-1);
    expect(world.creatures).toHaveLength(0);
    expect(world.events.some((e) => e.type === "scuttleEnter")).toBe(true);
  });

  it("is a fixture that holds its wave and fills it", () => {
    expect(bossHoldsWave("scuttle")).toBe(true);
    expect(bossFillsWave("scuttle")).toBe(true);
  });

  it("looks for scuttleLookBeats before the first part comes loose", () => {
    const world = open();
    const seen = beats(world, CFG.scuttleLookBeats - 1);
    expect(frame(world).loose).toEqual([]);
    expect(seen.has("scuttleLoose")).toBe(false);
    const then = beats(world, 2);
    expect(then.has("scuttleLoose")).toBe(true);
    expect(frame(world).loose).toHaveLength(1);
    expect(scuttleShootable(frame(world))).toBe(true);
  });
});

describe("the cadence and the throw", () => {
  it("hangs a part for scuttleThrowBeats and then throws it down its column as what it is", () => {
    const world = open();
    untilLoose(world);
    const s = frame(world);
    const { socket, col } = live(world);
    expect(scuttleThrowBeat(s, CFG) - s.cycleBeat).toBe(CFG.scuttleThrowBeats);
    s.parts[socket] = { kind: "body", color: "cyan" };
    const seen = beats(world, CFG.scuttleThrowBeats + 1);
    expect(seen.has("scuttleThrow")).toBe(true);
    expect(s.parts[socket]).toBeNull();
    const body = world.creatures.find((c) => c.col === col);
    expect(body?.kind).toBe(livingKindForColor("cyan"));
    expect(body?.color).toBe("cyan");
    // And the next part is already hanging: there is always a window.
    expect(s.loose.length).toBeGreaterThan(0);
  });

  it("throws a rock as a meteor and a pod as a pod hung at scuttlePodRow", () => {
    const world = open();
    untilLoose(world);
    const s = frame(world);
    const first = live(world);
    s.parts[first.socket] = { kind: "rock", color: "red" };
    beats(world, CFG.scuttleThrowBeats + 1);
    expect(world.creatures.some((c) => c.col === first.col && c.kind === "meteor")).toBe(true);
    const second = live(world);
    s.parts[second.socket] = { kind: "pod", color: "red" };
    beats(world, CFG.scuttleThrowBeats + 1);
    const pod = world.pods.find((p) => p.colMilli === second.col * MILLI);
    expect(pod?.rowMilli).toBe(CFG.scuttlePodRow * MILLI);
    expect(pod?.kind).toBe("ward");
  });
});

describe("the strike", () => {
  it("takes the live part off the frame for a bolt in its column and colour, and the next comes loose a beat later", () => {
    const world = open();
    untilLoose(world);
    const s = frame(world);
    const { socket, col, color } = live(world);
    const before = scuttleLeft(s);
    scuttleStruck(world, shot(world, col, color));
    expect(s.parts[socket]).toBeNull();
    expect(s.loose).toEqual([]);
    expect(s.live).toBe(-1);
    expect(world.events.some((e) => e.type === "scuttleStruck" && e.left === before - 1)).toBe(
      true,
    );
    expect(world.creatures).toHaveLength(0);
    const seen = beats(world, 1);
    expect(seen.has("scuttleLoose")).toBe(true);
    expect(s.loose).toHaveLength(1);
  });

  it("says a bolt of the other colour and takes nothing; says nothing of another column", () => {
    const world = open();
    untilLoose(world);
    const s = frame(world);
    const { socket, col, color } = live(world);
    const other: Color = color === "red" ? "cyan" : "red";
    scuttleStruck(world, shot(world, col, other));
    expect(world.events.some((e) => e.type === "scuttleRebuff")).toBe(true);
    expect(s.parts[socket]).not.toBeNull();
    world.events.length = 0;
    scuttleStruck(world, shot(world, (col + 1) % CFG.cols, color));
    expect(world.events).toHaveLength(0);
    expect(s.parts[socket]).not.toBeNull();
  });

  it("gives the beam nothing while a part hangs", () => {
    const world = open();
    untilLoose(world);
    const s = frame(world);
    const { socket, col, color } = live(world);
    scuttleStruck(world, shot(world, col, color, true));
    expect(s.parts[socket]).not.toBeNull();
    expect(s.downBeat).toBe(-1);
  });
});

describe("the frame thinning", () => {
  it("lets two come loose from scuttleTwinParts, with exactly one of them live", () => {
    const world = open();
    thin(world, CFG.scuttleTwinParts);
    untilLoose(world);
    const s = frame(world);
    expect(s.loose).toHaveLength(2);
    expect(s.loose).toContain(s.live);
    const lives = world.events.filter((e) => e.type === "scuttleLoose" && e.live);
    expect(lives).toHaveLength(1);
  });

  it("tightens the cadence to scuttleFastBeats from scuttleFastParts, and sends the cannon across the field", () => {
    const world = open();
    thin(world, CFG.scuttleFastParts);
    untilLoose(world);
    const s = frame(world);
    expect(scuttleCadence(s, CFG)).toBe(CFG.scuttleFastBeats);
    const from = live(world).col;
    beats(world, CFG.scuttleFastBeats + 1);
    const to = live(world).col;
    const far = Math.max(
      ...scuttleAttached(s)
        .concat(s.loose)
        .map((i) => Math.abs(scuttleSocketCol(CFG, i) - from)),
    );
    expect(Math.abs(to - from)).toBe(far);
  });

  it("adds scuttlePodSlackBeats to every cadence once a thrown pod is taken", () => {
    const world = open();
    untilLoose(world);
    const s = frame(world);
    const { col } = live(world);
    takeCargo(world, col, "ward");
    expect(s.slack).toBe(CFG.scuttlePodSlackBeats);
    expect(world.events.some((e) => e.type === "scuttleSlack")).toBe(true);
    expect(scuttleCadence(s, CFG)).toBe(CFG.scuttleThrowBeats + CFG.scuttlePodSlackBeats);
  });
});

describe("the last part", () => {
  it("winds up under THE SLOW for lancePrimeBeats and a beat of slack, then costs the wave through the hull", () => {
    const world = open();
    thin(world, 1);
    const n = untilLoose(world);
    const s = frame(world);
    expect(scuttleWinding(s)).toBe(true);
    expect(scuttleShootable(s)).toBe(false);
    expect(slowing(world)).toBe(true);
    expect(scuttleThrowBeat(s, CFG) - s.windBeat).toBe(scuttleWindBeats(CFG));
    expect(CFG.lancePrimeBeats + CFG.scuttleWindSlackBeats).toBe(scuttleWindBeats(CFG));
    // A bolt does nothing to it now.
    const { socket, col, color } = live(world);
    scuttleStruck(world, shot(world, col, color));
    expect(s.parts[socket]).not.toBeNull();
    const seen = beats(world, scuttleWindBeats(CFG) + 1);
    expect(n).toBeGreaterThan(0);
    expect(seen.has("scuttleLast")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    expect(failHolds(world)).toBe(true);
    expect(scuttleLeft(s)).toBe(0);
  });

  it("goes down to the beam standing in its column, and the frame is gone scuttleOutBeats later", () => {
    const world = open();
    thin(world, 1);
    untilLoose(world);
    const s = frame(world);
    const { col } = live(world);
    scuttleStruck(world, shot(world, (col + 1) % CFG.cols, "red", true));
    expect(s.downBeat).toBe(-1);
    scuttleStruck(world, shot(world, col, "red", true));
    expect(s.downBeat).toBe(world.beat);
    expect(scuttleWinding(s)).toBe(false);
    expect(scuttleLeft(s)).toBe(0);
    expect(world.events.some((e) => e.type === "scuttleDown")).toBe(true);
    const seen = beats(world, CFG.scuttleOutBeats + 1);
    expect(seen.has("scuttleOut")).toBe(true);
    expect(world.boss).toBeNull();
    expect(failHolds(world)).toBe(false);
  });
});

describe("determinism", () => {
  it("fingerprints the same for the same seed", () => {
    const a = open(11);
    const b = open(11);
    for (let i = 0; i < 12 * TPB; i++) {
      step(a, []);
      step(b, []);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
    expect(scuttleLeft(frame(a))).toBeLessThan(CFG.scuttleRows * CFG.scuttleCols);
  });
});
