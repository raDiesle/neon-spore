import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { THE_GLUTTON } from "../src/scenes/the-glutton.js";

/**
 * THE GLUTTON's rehearsal, played on the world a guide plays: the pod freed,
 * the maw taking it, and only then the glutton killed — hungry, so by one shot.
 * A film timed off by a beat would show it eating, which is the thing the film
 * exists to show the pair how to stop.
 */

function play(): SimEvent[] {
  const run = new SceneRun(sceneScript("theGlutton", 0, DEFAULT_CONFIG));
  const events: SimEvent[] = [];
  for (let t = 0; t < THE_GLUTTON.ticks - 1; t++) run.advance(events);
  return events;
}

describe("THE GLUTTON's rehearsal", () => {
  const events = play();
  const first = (type: SimEvent["type"]) => events.findIndex((e) => e.type === type);

  it("frees the pod, swallows it, then kills the glutton, in that order", () => {
    const order = ["podLoose", "podTaken", "destroy"] as const;
    const at = order.map(first);
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("loses nothing, and feeds it nothing", () => {
    const bad = ["podLost", "breach", "gluttonFeeds", "gluttonShrinks"];
    expect(events.some((e) => bad.includes(e.type))).toBe(false);
  });
});
