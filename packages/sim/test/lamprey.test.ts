import { describe, expect, it } from "bun:test";
import { midCol } from "../src/config.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type LampreyState,
  type LampreyStep,
  lampreyBoss,
  lampreyPinner,
  lampreyTapper,
} from "../src/lamprey.js";
import { lampreyStruck } from "../src/lamprey-shot.js";
import { slowing } from "../src/slow.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE LAMPREY's rules: one seat keeps a thumb on the crawling jaw, and the
 * other taps the one lit tooth before it snaps back
 * (`docs/spec/bosses.md` §11.59). What a phone cannot show: that a jaw let go
 * bites deeper a step a beat and a full bite is the hull; that only the
 * pinner's thumb near the jaw holds it; that only the tapper's edge on the lit
 * tooth cracks it, the next lit two places on; that a gullet's shot run out
 * is a re-bite whose teeth are not lost. AUTO playing it through:
 * `tools/director/test/autopilot-lamprey.test.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
const BITE = { teeth: 3, toothBeats: 3, crawl: 1, crawlBeats: 3, beats: 0 } as const;
const SCRIPT: readonly LampreyStep[] = [
  { ask: "bite", pinner: 1, col: 2, color: "either", ...BITE },
  {
    ...BITE,
    ask: "bite",
    pinner: 2,
    teeth: 2,
    toothBeats: 2,
    col: 8,
    crawl: -1,
    crawlBeats: 2,
    color: "either",
  },
  {
    ...BITE,
    ask: "gullet",
    pinner: 1,
    teeth: 2,
    toothBeats: 2,
    col: 2,
    crawlBeats: 1,
    color: "red",
    beats: 3,
  },
  {
    ...BITE,
    ask: "gullet",
    pinner: 1,
    teeth: 2,
    toothBeats: 2,
    col: 2,
    crawlBeats: 1,
    color: "cyan",
    beats: 3,
  },
  {
    ...BITE,
    ask: "gullet",
    pinner: 1,
    teeth: 2,
    toothBeats: 2,
    col: 2,
    crawlBeats: 1,
    color: "either",
    beats: 3,
  },
];

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "lamprey", steps: SCRIPT });
  return world;
}

function eel(world: World): LampreyState {
  const s = lampreyBoss(world);
  if (s === null) throw new Error("the wave installed no lamprey");
  return s;
}

function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

function drag(world: World, player: 1 | 2, target: string, id: number, on: boolean): string[] {
  const command = { kind: "drag", target, on, fromMilli: 0, id } as TimedCommand["command"];
  return tick(world, [{ tick: world.tick, player, command }]);
}

/** A press on `tooth` from `player`, down and lifted; the event types of both ticks. */
function tap(world: World, player: 1 | 2, tooth: number): string[] {
  return [
    ...drag(world, player, "lampreyTooth", tooth, true),
    ...drag(world, player, "lampreyTooth", tooth, false),
  ];
}

/** The pinner's thumb put down on the jaw's column. */
function pin(world: World): void {
  const s = eel(world);
  drag(world, lampreyPinner(s) ?? 1, "lampreyJaw", s.jawCol, true);
}

function runUntil(world: World, until: (w: World) => boolean, beats = 60): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the lamprey never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

const toBite = (world: World) => runUntil(world, (w) => eel(w).phase === "bite");
const toRear = (world: World) => runUntil(world, (w) => eel(w).phase === "rearing");

/** Every tooth the bite asks for, cracked by its tapper. */
function pullBite(world: World): void {
  const cursor = eel(world).cursor;
  const rebiting = eel(world).rebiting;
  while (eel(world).phase === "bite") {
    const s = eel(world);
    tap(world, lampreyTapper(s) ?? 2, s.litTooth);
    if (!rebiting && eel(world).cursor > cursor + 1) throw new Error("ran past the bite");
  }
}

function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

describe("THE LAMPREY bites", () => {
  it("swims in, then bites the pilot's to pin and the navigator's to tap, under THE SLOW", () => {
    const world = install();
    expect(eel(world).phase).toBe("entering");
    const seen = toBite(world);
    const s = eel(world);
    expect(seen.has("lampreyBite")).toBe(true);
    expect([lampreyPinner(s), lampreyTapper(s)]).toEqual([1, 2]);
    expect(s.jawCol).toBe(2);
    expect(slowing(world)).toBe(true);
  });

  it("chews a step a beat with the jaw let go, and a full bite is the hull", () => {
    const world = install();
    toBite(world);
    const at = world.beat + 1;
    runUntil(world, (w) => w.beat >= at);
    expect(eel(world).biteMilli).toBe(CFG.lampreyBiteStepMilli);
    const seen = runUntil(world, (w) => w.events.some((e) => e.type === "lampreyFull"), 30);
    expect(seen.has("lampreyGnaw")).toBe(true);
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
  });

  it("holds while the pinner's thumb follows the jaw, and not off it or from the tapper", () => {
    const world = install();
    toBite(world);
    const s = eel(world);
    drag(world, 2, "lampreyJaw", s.jawCol, true);
    runUntil(world, (w) => w.events.some((e) => e.type === "lampreyGnaw"));
    const deep = eel(world).biteMilli;
    pin(world);
    const seen = new Set<string>();
    for (let b = 0; b < 2; b++) {
      for (const t of runUntil(world, (w) => w.events.some((e) => e.type === "lampreyCrawl")))
        seen.add(t);
      pin(world);
    }
    expect(seen.has("lampreyGnaw")).toBe(false);
    expect(eel(world).biteMilli).toBe(deep);
    drag(world, 1, "lampreyJaw", eel(world).jawCol + CFG.lampreyGripCols + 1, true);
    runUntil(world, (w) => w.events.some((e) => e.type === "lampreyGnaw"));
  });
});

describe("the teeth", () => {
  it("crack only the lit one from the tapper, and the next lit is two places on", () => {
    const world = install();
    toBite(world);
    const lit = eel(world).litTooth;
    expect(tap(world, 1, lit)).not.toContain("lampreyCrack");
    expect(tap(world, 2, lit)).toContain("lampreyCrack");
    expect(eel(world).litTooth).toBe((lit + 2) % 7);
  });

  it("snap the last one back on a wrong tooth, and on a window run out", () => {
    const world = install();
    toBite(world);
    tap(world, 2, eel(world).litTooth);
    const lit = eel(world).litTooth;
    expect(tap(world, 2, (lit + 1) % 7)).toContain("lampreySnap");
    expect(eel(world).pulled).toEqual([]);
    expect(eel(world).litTooth).toBe(lit);
    tap(world, 2, lit);
    const seen = runUntil(world, (w) => w.events.some((e) => e.type === "lampreySnap"), 10);
    expect(seen.has("lampreyCrack")).toBe(false);
    expect(eel(world).pulled).toHaveLength(0);
  });

  it("count a thumb left down once", () => {
    const world = install();
    toBite(world);
    drag(world, 2, "lampreyTooth", eel(world).litTooth, true);
    const lit = eel(world).litTooth;
    expect(drag(world, 2, "lampreyTooth", lit, true)).not.toContain("lampreyCrack");
    expect(eel(world).pulled).toHaveLength(1);
  });

  it("let the mouth go once the bite's teeth are out, and the second bite trades the seats", () => {
    const world = install();
    toBite(world);
    pullBite(world);
    expect(eel(world).phase).toBe("loose");
    expect(eel(world).teethOut.toString(2).replaceAll("0", "")).toHaveLength(3);
    toBite(world);
    const s = eel(world);
    expect([lampreyPinner(s), lampreyTapper(s), s.jawCol, s.crawlDir]).toEqual([2, 1, 8, -1]);
  });
});

describe("the gullet", () => {
  function reared(): World {
    const world = install();
    for (let b = 0; b < 2; b++) {
      toBite(world);
      pullBite(world);
    }
    toRear(world);
    return world;
  }

  it("rears in its colour, wants that colour, and the middle column", () => {
    const world = reared();
    expect(lampreyStruck(world, shot("cyan"))).toBe(true);
    expect(lampreyStruck(world, shot("red", MID + 1))).toBe(false);
    expect(eel(world).hits).toBe(0);
    expect(lampreyStruck(world, shot("red"))).toBe(true);
    expect([eel(world).hits, eel(world).phase]).toEqual([1, "recoil"]);
  });

  it("lunges when the shot runs out, and the re-bite's teeth are not lost", () => {
    const world = reared();
    const out = eel(world).teethOut;
    const seen = toBite(world);
    expect(seen.has("lampreyLunge")).toBe(true);
    expect(eel(world).rebiting).toBe(true);
    pullBite(world);
    expect(eel(world).teethOut).toBe(out);
    expect(toRear(world).has("lampreyRear")).toBe(true);
    expect(eel(world).cursor).toBe(2);
  });

  it("three hits and the eel is spent and out, the same twice from one seed", () => {
    const play = () => {
      const world = reared();
      for (const color of ["red", "cyan", "red"] as const) {
        toRear(world);
        lampreyStruck(world, shot(color));
      }
      runUntil(world, (w) => w.boss === null);
      return hashWorld(world);
    };
    expect(play()).toBe(play());
  });
});
