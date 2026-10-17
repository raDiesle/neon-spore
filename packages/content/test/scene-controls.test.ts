import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { blisterTarget } from "../src/scene-blister.js";
import { sceneScript } from "../src/scene-script.js";
import { SCENES_CONTROLS } from "../src/scenes-controls.js";
import { WAVES } from "../src/waves.js";

/**
 * The controls' films (`scenes-controls.ts`), played on the world a guide
 * plays: every blister the film sends up is knocked out by the hand the film
 * draws, from the seat the blister names, and none reaches the hull — a film
 * that mistimed a stroke would end on a lost wave, and the picture would be a
 * hand teaching a gesture that did not count.
 */

const FILMS = Object.entries(SCENES_CONTROLS);

function play(id: keyof typeof SCENES_CONTROLS): SimEvent[] {
  const scene = SCENES_CONTROLS[id];
  const run = new SceneRun(sceneScript(id, 0, DEFAULT_CONFIG));
  const events: SimEvent[] = [];
  for (let t = 0; t < scene.ticks - 1; t++) run.advance(events);
  return events;
}

describe("the controls' films", () => {
  it("are each the guide of the wave built for its control", () => {
    for (const [id, scene] of FILMS) {
      const wave = WAVES.find((w) => w.guide?.scene === id);
      expect(wave, `${id} is no wave's guide`).toBeDefined();
      const filmed = new Set(scene.entries.map((e) => e.gesture ?? "tap"));
      // The wave's own blisters all want the one gesture the film teaches.
      const blisters = wave?.entries.filter((e) => e.kind === "blister") ?? [];
      expect(new Set(blisters.map((e) => e.gesture ?? "tap"))).toEqual(filmed);
      expect(filmed.size, `${id} teaches more than one control`).toBe(1);
    }
  });

  it("put a hand on every blister, from the seat it names", () => {
    for (const [id, scene] of FILMS) {
      const hands = scene.acts.filter((a) => a.blister !== undefined);
      expect(hands.length, `${id}: one hand per blister`).toBe(scene.entries.length);
      for (const act of hands) {
        const t = blisterTarget(scene, act, DEFAULT_CONFIG);
        expect(t, `${id}: the hand at ${act.tick} is on no blister`).not.toBeNull();
        // The films send one blister per column, so the column names it.
        const entry = scene.entries.find((e) => e.col === act.col);
        expect(act.blister, `${id}: the hand at ${act.tick} is the wrong seat's`).toBe(
          entry?.by as 1 | 2,
        );
      }
    }
  });

  it("knock every blister out, and lose nothing", () => {
    for (const [id, scene] of FILMS) {
      const events = play(id as keyof typeof SCENES_CONTROLS);
      const out = events.filter((e) => e.type === "destroy" && e.kind === "blister");
      expect(out.length, `${id} knocks out ${out.length} of ${scene.entries.length}`).toBe(
        scene.entries.length,
      );
      expect(events.some((e) => e.type === "breach")).toBe(false);
      expect(events.some((e) => e.type === "pullShort")).toBe(false);
    }
  });

  it("show every way a stroke and a turn can go", () => {
    const ways = (id: keyof typeof SCENES_CONTROLS, fallback: string) =>
      new Set(SCENES_CONTROLS[id].entries.map((e) => e.way ?? fallback));
    expect(ways("swipeBlisters", "right")).toEqual(new Set(["up", "down", "left", "right"]));
    expect(ways("turnBlisters", "cw")).toEqual(new Set(["cw", "ccw"]));
  });
});
