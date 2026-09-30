import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import {
  createWorld,
  guideHolds,
  onReadyPage,
  type SimEvent,
  seamBoss,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { GameAudio } from "../src/audio.js";
import { gameAutopilot } from "../src/autopilot.js";
import { InputBuffer } from "../src/input-buffer.js";
import { playConfig } from "../src/main-world.js";
import { createWaveProgression } from "../src/waves.js";

/**
 * **AUTO on BOTH plays THE SEAM through its false point and its dark.**
 *
 * `bun run frames --wave "THE SEAM" --auto both` lost the wave at step 7, the
 * false point: `seamBaited` seven ticks after it lit. The hand sends nothing
 * on a decoy, and the seven ticks were not the input delay. They were the
 * last of a bolt's climb. The hand had fired at the point before the grit
 * until that point took its shot, so two more bolts were climbing behind the
 * one that answered it, and a third was laid in the muzzle. The last of them
 * came off the top under the false point (`boss-hands-seam.ts`).
 *
 * Played the way `autopilot.test.ts` plays ONE LAST CHANCE: the game's config,
 * `jumpToWave`, the guide read through, the autopilot pressing into the
 * `InputBuffer` and the buffer drained onto the tick.
 */

const SILENT = { restarted: () => {} } as unknown as GameAudio;
const WAVE = WAVES.findIndex((w) => w.name === "THE SEAM");

/** Two thumbs on a guide: NEXT until the gate, then the hold. */
function readThrough(world: World, buffer: InputBuffer): void {
  if (!guideHolds(world)) return;
  for (const seat of [1, 2] as const) {
    const held = seat === 1 ? world.brief.holdP1 : world.brief.holdP2;
    if (!onReadyPage(world, seat)) buffer.push(seat, { kind: "guideStep" });
    else if (!held) buffer.push(seat, { kind: "brief", on: true });
  }
}

function playOut(): { world: World; heard: SimEvent[]; furthest: number } {
  const cfg = playConfig();
  const world = createWorld(cfg, 0);
  const buffer = new InputBuffer();
  const progression = createWaveProgression({ world, cfg, audio: SILENT, buffer });
  const auto = gameAutopilot();
  auto.setMode("both");
  progression.jumpToWave(WAVE);
  const heard: SimEvent[] = [];
  let furthest = -1;
  const budget = 200 * ticksPerBeat(cfg);
  for (let i = 0; i < budget && world.balance.wavesCleared === 0 && !world.over; i++) {
    progression.tickOpening(1 / cfg.tickHz);
    readThrough(world, buffer);
    auto.press(world, buffer);
    step(world, buffer.drain(world.tick));
    furthest = Math.max(furthest, seamBoss(world)?.cursor ?? -1);
    heard.push(...world.events);
    if (world.events.length) progression.handle(world.events);
  }
  return { world, heard, furthest };
}

describe("THE SEAM under the game's AUTO", () => {
  const { world, heard, furthest } = playOut();
  const count = (type: SimEvent["type"]) => heard.filter((e) => e.type === type).length;

  it("gets past step 12 with the false point never baited", () => {
    expect(WAVE).toBeGreaterThanOrEqual(0);
    expect(furthest).toBeGreaterThan(12);
    expect(count("seamFade")).toBe(1);
    expect(count("seamBaited")).toBe(0);
  });

  it("sends nothing into the dark and misses no step", () => {
    expect(count("seamReseal")).toBe(0);
    expect(count("seamMiss")).toBe(0);
  });

  it("clears the wave, unscarred", () => {
    expect(count("seamSplit")).toBe(1);
    expect(world.balance.wavesCleared).toBe(1);
    expect(world.scars).toEqual([]);
  });
});
