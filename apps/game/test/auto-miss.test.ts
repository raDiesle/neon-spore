import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { createWorld, guideHolds, midCol, onReadyPage, step, type World } from "@neon-spore/sim";
import type { GameAudio } from "../src/audio.js";
import { askMisser } from "../src/auto-miss.js";
import { gameAutopilot } from "../src/autopilot.js";
import { InputBuffer } from "../src/input-buffer.js";
import { playConfig } from "../src/main-world.js";
import { createWaveProgression } from "../src/waves.js";

/**
 * **AUTO with its hands off every other ask reaches a boss's own blow**
 * (`auto-miss.ts`), which AUTO alone and no hands at all both never did — the
 * reason `bun run frames --until breach` found nothing on these bosses.
 *
 * Played through the game's own tick, as `autopilot.test.ts` plays it: the
 * guide turned by two thumbs, AUTO into the buffer, `step`, the progression.
 */

const SILENT = { restarted: () => {} } as unknown as GameAudio;
const LOOK = 6000;

function readThrough(world: World, buffer: InputBuffer): void {
  if (!guideHolds(world)) return;
  for (const seat of [1, 2] as const) {
    const held = seat === 1 ? world.brief.holdP1 : world.brief.holdP2;
    if (!onReadyPage(world, seat)) buffer.push(seat, { kind: "guideStep" });
    else if (!held) buffer.push(seat, { kind: "brief", on: true });
  }
}

type Heard = World["events"][number];

/** The first breach the boss itself lands, as `by`, or null inside the look. */
function bossBlow(name: string, miss: boolean): { by: string; kind: string } | null {
  const e = firstHeard(name, miss, (e, kind) => e.type === "breach" && e.by === kind);
  return e?.type === "breach" && e.by !== undefined ? { by: e.by, kind: e.by } : null;
}

/** The first event `wanted` picks under the wave's own boss, or null inside the look. */
function firstHeard(
  name: string,
  miss: boolean,
  wanted: (e: Heard, kind: string) => boolean,
): Heard | null {
  const cfg = playConfig();
  const world = createWorld(cfg, 0);
  const buffer = new InputBuffer();
  const progression = createWaveProgression({ world, cfg, audio: SILENT, buffer });
  const auto = gameAutopilot();
  auto.setMode("both");
  const misser = askMisser();
  const index = WAVES.findIndex((w) => w.name === name);
  expect(index).toBeGreaterThan(-1);
  progression.jumpToWave(index);
  // The boss this wave opened on: a wave beaten inside the look hands the
  // field to the next one, whose own blow is not the one asked about.
  let own = "";
  for (let i = 0; i < LOOK && !world.over; i++) {
    progression.tickOpening(1 / cfg.tickHz);
    readThrough(world, buffer);
    const kind = world.boss?.kind ?? "";
    if (own === "") own = kind;
    else if (kind !== "" && kind !== own) return null;
    if (!(miss && misser.withholds(world))) auto.press(world, buffer);
    else for (const c of misser.presses(world)) buffer.push(c.player, c.command);
    step(world, buffer.drain(world.tick));
    for (const e of world.events) if (wanted(e, kind)) return e;
    if (world.events.length) progression.handle(world.events);
  }
  return null;
}

describe("--auto-miss", () => {
  // THE OCULUS left the list on 2 October 2026: its rework in three levels
  // has no blow at all, a level run out springing open and a shot waiting.
  for (const name of [
    "THE VISE",
    "THE TRIVET",
    "THE RATCHET",
    "THE CYST",
    "THE SLING",
    "THE GALL",
    "THE FILAMENT",
  ]) {
    it(`reaches ${name}'s timeout blow, which AUTO alone never lands`, () => {
      expect(bossBlow(name, false)).toBeNull();
      expect(bossBlow(name, true)).not.toBeNull();
    });
  }
});

describe("--auto-miss on THE FLUE", () => {
  // Its SLOW is a show and an ember left alone runs the level again, so
  // holding AUTO off was never a miss: the misser fires wide itself.
  it("spends a shot wide, which AUTO alone never does", () => {
    const missed = (e: Heard) => e.type === "flueMiss";
    expect(firstHeard("THE FLUE", false, missed)).toBeNull();
    expect(firstHeard("THE FLUE", true, missed)).not.toBeNull();
  });
});

describe("askMisser", () => {
  const world = (from: number, to: number, asks: boolean, beat: number) =>
    ({ slowFromBeat: from, slowToBeat: to, slowAsks: asks, beat, boss: null }) as World;

  it("lets the first ask go, answers the next, and lets the third go", () => {
    const m = askMisser();
    expect(m.withholds(world(10, 14, true, 10))).toBe(true);
    expect(m.withholds(world(10, 14, true, 13))).toBe(true);
    expect(m.withholds(world(10, 14, true, 14))).toBe(false);
    expect(m.withholds(world(20, 24, true, 21))).toBe(false);
    expect(m.withholds(world(30, 32, true, 30))).toBe(true);
  });

  it("keeps a window extended as the same window", () => {
    const m = askMisser();
    expect(m.withholds(world(10, 14, true, 12))).toBe(true);
    expect(m.withholds(world(10, 18, true, 16))).toBe(true);
  });

  it("holds off THE GALL's lit fire step and slides the cannon off the root", () => {
    const cfg = playConfig();
    const mid = midCol(cfg);
    const gall = (bared: boolean, ask: "fire" | "close") =>
      ({
        slowFromBeat: -1,
        slowToBeat: -1,
        slowAsks: false,
        beat: 40,
        cfg,
        cannonCol: mid,
        boss: { kind: "gall", bared, phase: "lit", cursor: 0, steps: [{ ask, beats: 4 }] },
      }) as unknown as World;
    const m = askMisser();
    expect(m.withholds(gall(true, "fire"))).toBe(true);
    expect(m.presses(gall(true, "fire"))).toEqual([
      { player: 1, command: { kind: "cannonCol", col: mid - 1 } },
    ]);
    expect(m.presses({ ...gall(true, "fire"), cannonCol: mid - 1 } as World)).toEqual([]);
    expect(m.withholds(gall(false, "fire"))).toBe(false);
    expect(m.presses(gall(true, "close"))).toEqual([]);
  });

  it("never holds off a show, or a field with no window up", () => {
    const m = askMisser();
    expect(m.withholds(world(10, 14, false, 11))).toBe(false);
    expect(m.withholds(world(-1, -1, false, 11))).toBe(false);
    expect(m.withholds(world(20, 24, true, 20))).toBe(true);
  });
});
