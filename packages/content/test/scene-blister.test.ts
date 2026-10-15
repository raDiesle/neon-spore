import { describe, expect, it } from "bun:test";
import { blisterIsUp, DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { THE_BLISTER } from "../src/scenes/the-blister.js";

/**
 * THE BLISTER's rehearsal, played on the world a guide plays: its one tap
 * lands while the body is up and knocks it out, and nothing reaches the hull. A tap timed
 * against the old two-beat window, or a film still teaching three taps, would
 * be silent in the picture — a tutorial showing a blow that never counts.
 */

function play(): { up: boolean[]; events: SimEvent[] } {
  const run = new SceneRun(sceneScript("theBlister", 0, DEFAULT_CONFIG));
  const out = { up: [] as boolean[], events: [] as SimEvent[] };
  for (let t = 0; t < THE_BLISTER.ticks - 1; t++) {
    run.advance(out.events);
    out.up.push(run.world.creatures.some(blisterIsUp));
  }
  return out;
}

describe("THE BLISTER's rehearsal", () => {
  const played = play();

  it("knocks it out with its one tap", () => {
    const blows = played.events.filter((e) => e.type === "blisterBlow");
    expect(blows.length).toBe(1);
    expect(played.events.some((e) => e.type === "destroy" && e.kind === "blister")).toBe(true);
  });

  it("taps while it is up, not before", () => {
    const tap = THE_BLISTER.acts[0]?.tick ?? 0;
    expect(played.up[tap - 1]).toBe(true);
  });

  it("never reaches the hull", () => {
    expect(played.events.some((e) => e.type === "breach")).toBe(false);
  });
});
