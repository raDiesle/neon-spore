import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { THE_SEEDER } from "../src/scenes/the-seeder.js";

/**
 * THE SEEDER's rehearsal, played on the world a guide plays: the kill, the pod
 * it leaves, the shot that frees that pod and the maw that takes it, in that
 * order. A film timed off by a beat would show the pod breaking on the skin —
 * a tutorial teaching the debt by losing it.
 */

function play(): SimEvent[] {
  const run = new SceneRun(sceneScript("theSeeder", 0, DEFAULT_CONFIG));
  const events: SimEvent[] = [];
  for (let t = 0; t < THE_SEEDER.ticks - 1; t++) run.advance(events);
  return events;
}

describe("THE SEEDER's rehearsal", () => {
  const events = play();
  const first = (type: SimEvent["type"]) => events.findIndex((e) => e.type === type);

  it("kills it, hangs its pod, frees the pod and swallows it, in that order", () => {
    const order = ["destroy", "seederSeeds", "podLoose", "podTaken"] as const;
    const at = order.map(first);
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("loses nothing", () => {
    expect(events.some((e) => e.type === "podLost" || e.type === "breach")).toBe(false);
  });
});
