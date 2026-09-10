import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
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
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  thirdOf,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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

/**
 * Every second tick, unless a caller is one of three sharing the play. A
 * thread steps down every `strandFallBeats` beats and the reel over a bead
 * rolls on the wall clock rather than on the beat, so a sampling pinned to
 * beat boundaries would draw one turn of it over and over.
 */
const EVERY_SECOND = { every: 2, phase: 0 };

function strandFrames(
  role: ViewRole,
  ticks: number,
  beads = 4,
  col = 3,
  shoot = false,
  sampling = EVERY_SECOND,
) {
  const world: World = createWorld(CFG, 3, [strand(beads, col)]);
  let shrivelled = 0;
  const frames = runFrames(world, role, ticks, {
    ...sampling,
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

  // Each seat draws a third of the every-second-tick play (`thirdOf`), so
  // the reel is still caught between beats and the thread is drawn once.
  for (const [i, role] of ROLES.entries()) {
    it(`draws the thread and the bodies on it for ${role}`, () => {
      const { ctx } = strandFrames(role, TICKS, 4, 3, false, thirdOf(2, i));
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  /**
   * The wall and the length are **paired rather than crossed**, and that is a
   * decision about what this case is for.
   *
   * The two axes are independent — `strandShape.ts` reads a column to clamp the
   * thread inside the field and a count to space the beads along it, and
   * neither term appears in the other — so a wall with the short thread and the
   * other wall with the long one puts every value of both through the canvas.
   * Crossing them was four full thirty-beat plays in one `it`, four times what
   * any of its neighbours does, and it ran close enough to bun's 5000 ms
   * default that a busy machine failed it as a timeout rather than reporting it
   * as slow. A test that only passes on an idle box is a test somebody re-runs
   * on its own and stops reading.
   */
  // Twelve beats rather than the thirty the seat plays run: what these two
  // are for is the clamp at the wall and the spacing along the thread, and
  // both are in every frame from the first. Twelve is six steps of the fall
  // (`strandFallBeats`), which is the clamp holding as the thread moves; the
  // landing is the same breach at any column and the seat plays draw it.
  const WALL_TICKS = ticksPerBeat(CFG) * 12;

  for (const [col, beads] of [
    [0, 2],
    [CFG.cols - 1, 5],
  ] as const) {
    it(`keeps the canvas happy at column ${col} with ${beads} beads`, () => {
      const { ctx } = strandFrames("p1", WALL_TICKS, beads, col);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  // A pair answering every bead the moment it is offered has the first one
  // shrivelled inside two beats and the third spent inside four, and the
  // thread leaves no transient behind it (`effects-ingest-silent.ts`) — so
  // eight beats is the raisin, the sweep and the sparks the last shot threw,
  // and the twenty-two beyond it that this play used to run were an empty
  // field drawn three times over.
  const CHASE_TICKS = ticksPerBeat(CFG) * 8;

  for (const role of ROLES) {
    it(`draws a shrivelled bead and the sweep after the last one for ${role}`, () => {
      // The two pictures a standing thread never shows. `drawRaisin` needs a
      // bead that has been shot and is still hanging; the sweep needs the last
      // live one spent, which takes the thread off the field entirely.
      const { ctx, world, shrivelled } = strandFrames(role, CHASE_TICKS, 3, 5, true);
      expect(shrivelled, "no bead was ever shot, so no raisin was drawn").toBeGreaterThan(0);
      expect(world.creatures.filter((c) => c.kind === "strand")).toHaveLength(0);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
