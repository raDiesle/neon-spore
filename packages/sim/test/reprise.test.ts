import { describe, expect, it } from "bun:test";
import {
  BOSS_KINDS,
  bossFillsWave,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE REPRISE: the wave sent again with nothing drawn.
 *
 * What is worth holding here is the claim the fight is made of, and it is a
 * claim about *two runs of the same script*: the stretch that comes back has
 * to be the stretch that came down — same bodies, same columns, same gaps, in
 * the same order — or the pair is being asked to remember something that never
 * happened. Nothing in `reprise.ts` can be checked by eye for that, because
 * what it does is read a queue by index against a clock it is itself holding.
 *
 * The hull is invulnerable throughout. The point is not that the bodies are
 * beaten — a pair that misses one is playing the same wave, and `hull-damage.ts`
 * is not this boss's code — it is that the arrivals keep coming and the wave
 * reaches its end, which a lost wave would freeze before the second echo
 * (`wave-fail.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: false, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);
/** How long a stretch of wave runs before it is sent again. */
const EVERY = 12;

/**
 * The shipped wave's own figure, written out here rather than read off
 * `WAVES`: `packages/sim` may not import `packages/content`, so a sim test
 * authors its own queue. Two stretches, and the second crosses over itself —
 * three to remember, then four.
 */
const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 1, kind: "slick", color: "red" },
  { beat: 3, col: 5, kind: "slick", color: "cyan" },
  { beat: 6, col: 9, kind: "slick", color: "red" },
  { beat: 12, col: 3, kind: "slick", color: "cyan" },
  { beat: 14, col: 7, kind: "slick", color: "red" },
  { beat: 18, col: 0, kind: "slick", color: "red" },
  { beat: 21, col: 10, kind: "slick", color: "cyan" },
];

interface Arrival {
  beat: number;
  col: number;
  color: string;
  unseen: boolean;
}

/** A wave of that figure with the mechanism over it. */
function repriseWorld(): World {
  const world = createWorld(CFG, 5);
  startWave(world, 3, [...QUEUE], [], { kind: "reprise", beat: EVERY });
  return world;
}

/** Every body that came onto the field, in the order it did, beat by beat. */
function play(world: World, beats: number): { arrivals: Arrival[]; prints: number[] } {
  const arrivals: Arrival[] = [];
  const prints: number[] = [];
  const known = new Set<number>();
  for (let beat = 1; beat <= beats; beat++) {
    for (let t = 0; t < TPB; t++) step(world, []);
    for (const c of world.creatures) {
      if (known.has(c.id)) continue;
      known.add(c.id);
      arrivals.push({ beat, col: c.col, color: c.color ?? "none", unseen: c.unseen === true });
    }
    prints.push(hashWorld(world));
  }
  return { arrivals, prints };
}

/** One arrival as a word, for comparing a stretch with its echo. */
const shape = (a: Arrival): string => `${a.col}·${a.color}`;
/** The beats between one arrival and the next, which is what "the same
 * spacing" means when the whole run has been offset to now. */
const gaps = (run: Arrival[]): number[] =>
  run.slice(1).map((a, i) => a.beat - (run[i] as Arrival).beat);

describe("THE REPRISE", () => {
  it("is a wave the author fills, and its tag is appended to the list", () => {
    expect(bossFillsWave("reprise")).toBe(false);
    // The index is a wire value (`boss-kinds.ts`): a name slipped into the
    // middle of that list renumbers every boss after it, and a replay recorded
    // on yesterday's build fingerprints as a different world.
    expect(BOSS_KINDS.indexOf("reprise")).toBe(14);
  });

  it("sends the stretch again — same bodies, same columns, same gaps, unseen", () => {
    const { arrivals } = play(repriseWorld(), 24);
    const seen = arrivals.filter((a) => !a.unseen).slice(0, 3);
    const echoed = arrivals.filter((a) => a.unseen).slice(0, 3);
    expect(seen.map(shape)).toEqual(["1·red", "5·cyan", "9·red"]);
    expect(echoed.map(shape)).toEqual(seen.map(shape));
    expect(gaps(echoed)).toEqual(gaps(seen));
    // And it is a second run of the script rather than a second script: the
    // queue is the seven entries its author wrote, whatever the field has had
    // on it (`reprise.ts` never appends).
    expect(QUEUE).toHaveLength(7);
  });

  it("holds the wave's own arrivals while the echo plays, and takes up after it", () => {
    const { arrivals } = play(repriseWorld(), 24);
    const echo = arrivals.filter((a) => a.unseen);
    const first = (echo[0] as Arrival).beat;
    const last = (echo[echo.length - 1] as Arrival).beat;
    const during = arrivals.filter((a) => !a.unseen && a.beat >= first && a.beat <= last);
    expect(during, "the wave went on falling under its own echo").toEqual([]);
    // The stretch after it is the wave again, seen, in the columns its author
    // wrote — the queue took up where the echo stopped it rather than skipping
    // the beats it stood still for.
    const after = arrivals.filter((a) => !a.unseen && a.beat > last);
    expect(after.map(shape).slice(0, 2)).toEqual(["3·cyan", "7·red"]);
  });

  it("sends the last stretch again too, and then the mechanism goes", () => {
    const world = repriseWorld();
    const { arrivals } = play(world, 80);
    const seen = arrivals.filter((a) => !a.unseen);
    const echoed = arrivals.filter((a) => a.unseen);
    // Every body the author wrote, sent again exactly once and in the order it
    // came — which is the two echoes of a two-stretch wave, said as the thing
    // that actually has to hold rather than as a grouping of beats.
    expect(echoed.map(shape)).toEqual(seen.map(shape));
    const tail = echoed.slice(3);
    expect(gaps(tail), "the last stretch came back at somebody else's spacing").toEqual(
      gaps(seen.slice(3)),
    );
    // And it came back *after* the script was spent: the last stretch is
    // echoed like any other rather than being the one the wave ends on.
    expect((tail[0] as Arrival).beat).toBeGreaterThan((seen[seen.length - 1] as Arrival).beat);
    // Nothing left to send again and nothing left standing: the mechanism
    // takes itself off, which is the only way a wave with a boss on it ends
    // (`beat.ts`).
    expect(world.boss, "the mechanism outlived its script").toBeNull();
    expect(world.balance.wavesCleared).toBe(1);
  });

  it("fingerprints the same twice, beat for beat, over both echoes", () => {
    const first = play(repriseWorld(), 60);
    const second = play(repriseWorld(), 60);
    // Two runs in one process rather than a pinned constant: what has to hold
    // for lockstep is that two phones on the same build agree, and a number
    // written down here would move with every legitimate change to
    // `hashWorld` (`docs/decisions.md` #19).
    expect(first.prints).toEqual(second.prints);
    expect(first.arrivals).toEqual(second.arrivals);
  });
});
