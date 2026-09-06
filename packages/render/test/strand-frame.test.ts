import { beforeAll, describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  beadIsSpent,
  beadStrand,
  createWorld,
  type SpawnEntry,
  step,
  strandHead,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE STRAND, drawn: the thread the beads hang on, the reel player 2 sees in
 * place of a body, and the raisin a shrivelled one leaves behind.
 *
 * Every other creature in the game is drawn again through the stub canvas that
 * refuses what a real one refuses — which is what catches a value that is a
 * perfectly good `string` and not a colour. These three pictures were not:
 * `drawStrands`, `drawReelBead` and `drawRaisin` each take a colour out of
 * `PALETTE` and put it through `hazed`, and none of them is reached at all
 * without a `strand` on the field, which no other frame test puts there.
 *
 * So the thread is played rather than posed. The pair here answers every bead
 * in turn at a speed no real pair could manage, which is the only way to reach
 * the two states a standing thread never shows: a bead shrivelled and still
 * hanging, and the last one spent, after which the whole thread is swept.
 */

beforeAll(installCanvasGlobals);

const strand = (beads: number, col: number): SpawnEntry => ({
  beat: 0,
  col,
  kind: "strand",
  color: "red",
  beads,
});

/**
 * The cannon under the one bead the thread will answer, and the trigger in its
 * colour. Exactly one bead of a thread is answerable at a time and it is the
 * next one along the order, so `strandHead` is asked rather than a column being
 * named — which is what player 2's screen asks and what the shot asks.
 */
function chase(w: World): TimedCommand[] {
  const bead = w.creatures.find((c) => c.kind === "strand");
  if (!bead) return [];
  const head = strandHead(w, beadStrand(bead));
  if (!head?.color) return [];
  return [
    { tick: w.tick, player: 1, command: { kind: "cannonCol", col: head.col } },
    { tick: w.tick, player: 2, command: { kind: "fire", color: head.color } },
  ];
}

function strandFrames(role: ViewRole, ticks: number, beads = 4, col = 3, shoot = false) {
  const world: World = createWorld(CFG, 3, [strand(beads, col)]);
  let shrivelled = 0;
  const frames = runFrames(world, role, ticks, {
    // A thread steps down every `strandFallBeats` beats and the reel over a
    // bead rolls on the wall clock rather than on the beat, so a sampling
    // pinned to beat boundaries would draw one turn of it over and over.
    every: 2,
    controls: controlSet("default"),
    onTick: (_tick, w) => {
      step(w, shoot ? chase(w) : []);
      shrivelled = Math.max(
        shrivelled,
        w.creatures.filter((c) => c.kind === "strand" && beadIsSpent(c)).length,
      );
    },
  });
  return { ...frames, shrivelled };
}

describe("the strand", () => {
  // Long enough for the thread to hang, fall the height of the field on its own
  // slower clock, and land on the hull.
  const TICKS = ticksPerBeat(CFG) * 30;

  for (const role of ROLES) {
    it(`draws the thread and the bodies on it for ${role}`, () => {
      const { ctx } = strandFrames(role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("keeps the canvas happy off either wall, and at either length", () => {
    for (const col of [0, CFG.cols - 1]) {
      for (const beads of [2, 5]) {
        const { ctx } = strandFrames("p1", TICKS, beads, col);
        expect(ctx.calls).toBeGreaterThan(1000);
      }
    }
  });

  for (const role of ROLES) {
    it(`draws a shrivelled bead and the sweep after the last one for ${role}`, () => {
      // The two pictures a standing thread never shows. `drawRaisin` needs a
      // bead that has been shot and is still hanging; the sweep needs the last
      // live one spent, which takes the thread off the field entirely.
      const { ctx, world, shrivelled } = strandFrames(role, TICKS, 3, 5, true);
      expect(shrivelled, "no bead was ever shot, so no raisin was drawn").toBeGreaterThan(0);
      expect(world.creatures.filter((c) => c.kind === "strand")).toHaveLength(0);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
