import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import {
  createWorld,
  guideHolds,
  onReadyPage,
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
 * **AUTO on BOTH clears ONE LAST CHANCE through the game's own tick.**
 *
 * The same body `frame.ts` runs per tick, less the lockstep a phone alone
 * does not have: the autopilot presses into the buffer, the buffer is drained
 * onto the tick, `step` runs, and the wave's events go to the progression that
 * opens waves and answers the introduction. Played on the config this build
 * plays at (`playConfig`), introduction and all, from `jumpToWave` — the door
 * the TEST panel picks a wave through.
 *
 * `jumpToWave` opens ONE LAST CHANCE on its guide, and AUTO does not read a
 * guide — no hand does, the director's included. So the pair here does what
 * two thumbs do: each seat turns pages until it is at the gate, then holds
 * READY until the guide lets the wave go.
 */

const SILENT = { restarted: () => {} } as unknown as GameAudio;
const WAVE = WAVES.findIndex((w) => w.name === "ONE LAST CHANCE");

/** Two thumbs on a guide: NEXT until the gate, then the hold. */
function readThrough(world: World, buffer: InputBuffer): void {
  if (!guideHolds(world)) return;
  for (const seat of [1, 2] as const) {
    const held = seat === 1 ? world.brief.holdP1 : world.brief.holdP2;
    if (!onReadyPage(world, seat)) buffer.push(seat, { kind: "guideStep" });
    else if (!held) buffer.push(seat, { kind: "brief", on: true });
  }
}

function playOut(mode: "off" | "both") {
  const cfg = playConfig();
  const world = createWorld(cfg, 0);
  const buffer = new InputBuffer();
  const progression = createWaveProgression({ world, cfg, audio: SILENT, buffer });
  const auto = gameAutopilot();
  auto.setMode(mode);
  progression.jumpToWave(WAVE);
  const tickSeconds = 1 / cfg.tickHz;
  const budget = 400 * ticksPerBeat(cfg);
  for (let i = 0; i < budget && world.balance.wavesCleared === 0 && !world.over; i++) {
    progression.tickOpening(tickSeconds);
    readThrough(world, buffer);
    auto.press(world, buffer);
    step(world, buffer.drain(world.tick));
    if (world.events.length) progression.handle(world.events);
  }
  return world;
}

describe("the TEST panel's AUTO", () => {
  it("clears ONE LAST CHANCE on BOTH, unscarred", () => {
    expect(WAVE).toBeGreaterThanOrEqual(0);
    const world = playOut("both");
    expect(world.balance.wavesCleared).toBe(1);
    expect(world.scars).toEqual([]);
  });

  it("presses nothing on OFF, so the wave is not cleared by itself", () => {
    const world = playOut("off");
    expect(world.balance.wavesCleared).toBe(0);
  });
});
