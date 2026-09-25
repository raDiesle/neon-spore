import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import { createWorld, snakeCrashed, startWave, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout, computeStage, type ViewRole } from "../src/layout.js";
import { snakeMawLit } from "../src/snake-button.js";
import { snakeArena } from "../src/snake-draw.js";
import { snakeJawsCircle, snakeTailCircle } from "../src/snake-grip.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * SNAKE'S OWN PICTURE, THROUGH A CANVAS THAT REFUSES WHAT A REAL ONE REFUSES.
 *
 * A round replaces the whole stage, so none of the field's frames ever reach a
 * line of it: the field's own draw returns before it starts. That is the exact
 * shape of the gap these files exist to close — every type right, every test
 * green, and the first frame of the round throws on a colour.
 *
 * Long enough to cross the morph and the play and to have crashed, which is
 * the only way to reach the bump and the folded body (`snake-crash.ts`) and
 * the verdict drawn over them. Nothing here drives, so the body meets the
 * enemy standing in front of it and the crash picture is unavoidable — and
 * a crash is a hit, so the field holds from that tick (`sim/wave-fail.ts`)
 * and every frame after it is the hold: the bump, then the body standing
 * where it stopped under the verdict.
 */

beforeAll(installCanvasGlobals);

/**
 * Whether the log carries a dial centred on this handle: an `arc` whose centre
 * is the ring's, within a pixel.
 *
 * The radius is not checked — `drawHandleRing` owns the 1.55 the dial stands
 * at, and a test repeating it would be a second copy of a number this file has
 * no opinion about. The centre is the whole question: it is where the hit test
 * answers.
 */
function dialAt(log: string[], at: { x: number; y: number }): boolean {
  for (const call of log) {
    if (!call.startsWith("arc(")) continue;
    const [x, y] = call.slice(4).split(",").map(Number);
    if (x === undefined || y === undefined) continue;
    if (Math.abs(x - at.x) < 1 && Math.abs(y - at.y) < 1) return true;
  }
  return false;
}

describe("SNAKE draws on all three screens", () => {
  const index = waveWith("snake");

  function snakeFrames(role: ViewRole, ticks: number) {
    const world = createWorld(CFG, 7, []);
    startWave(world, index, [], [], buildBoss(index, CFG.cols));
    return runFrames(world, role, ticks);
  }

  for (const role of ROLES) {
    // The emergence on its own: the body still inside the ship, the hull's
    // throat open, the slime over its lip — every line of it drawn after the
    // hull inside the clip (`snake-emerge.ts`), and none of it reached by the
    // run below once the body is out.
    it(`draws the body coming out of the ship on ${role}`, () => {
      const { world, ctx } = snakeFrames(role, Math.floor(ticksPerBeat(CFG) * 2.5));
      expect(ctx.calls).toBeGreaterThan(500);
      const boss = world.boss;
      expect(boss?.kind === "snake" && boss.phase === "morph").toBe(true);
    });

    it(`draws the morph, the arena and the body on ${role}`, () => {
      const { world, ctx } = snakeFrames(role, ticksPerBeat(CFG) * 30);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
      // It got past the fold and the body has been going long enough to have
      // met a wall, which is the frame the verdict and the scar hang off.
      const boss = world.boss;
      expect(boss?.kind === "snake" && boss.phase !== "morph").toBe(true);
      // And it went wrong, so every line of the bump was drawn through the
      // stub as well as every line of the body.
      expect(boss?.kind === "snake" && snakeCrashed(boss)).toBe(true);
    });
  }

  /**
   * **The two hands the body grows** (`snake-grip.ts`), in the frame they are
   * drawn in.
   *
   * A held ring is the one thing in this picture with a dial on it, so what
   * this asks is not that the frame survived — every case above already asks
   * that — but that the ring the hit test answers is the ring the canvas put
   * down, in the same place. The layout is built off the **stage** and not the
   * viewport, which is what `Canvas2DRenderer` draws through (`frameLayout`):
   * a layout taken from the window is a pixel and a half out, which is near
   * enough to look right in a picture and far enough to be a lie in a test.
   */
  it("draws both rings on the body they are taken on", () => {
    const stage = computeStage(VIEWPORT);
    const l = computeLayout(
      { width: stage.width, height: stage.height, dpr: VIEWPORT.dpr },
      CFG,
      "test",
    );
    const world = createWorld(CFG, 7, []);
    startWave(world, index, [], [], buildBoss(index, CFG.cols));
    const boss = world.boss;
    if (boss?.kind !== "snake") throw new Error("SNAKE's wave installed no round");
    boss.phase = "play";
    boss.dirCol = 0;
    boss.dirRow = -1;
    boss.body = Array.from({ length: CFG.snakeShedTiles + 2 }, (_, i) => ({ col: 4, row: 3 + i }));
    boss.stepTick = world.tick;
    // Both held, which is the only state either ring draws its dial in: the
    // mouth **standing** open — half way through its window rather than on the
    // tick it was opened, where the gape is still nought (`snake-clock.ts`) —
    // and her thumb down on the tail.
    boss.mawTick = world.tick - Math.floor(CFG.snakeMawTicks / 2);
    boss.tailHeld = true;
    const log: string[] = [];
    // Nothing stepped between the arrangement and the picture: a body that
    // moved would take both rings with it.
    runFrames(world, "test", 1, {
      every: 1,
      onTick: () => {},
      onCanvas: (c) => {
        c.log = log;
      },
    });
    for (const at of [
      snakeJawsCircle(l, CFG, boss, world.tick),
      snakeTailCircle(l, CFG, boss, world.tick),
    ]) {
      if (at === null) throw new Error("a body with no handle on it");
      expect(dialAt(log, at)).toBe(true);
    }
  });

  // MAW's face says *press me* only while the press is heard: past
  // `snakeGorgeTiles` the jaws stick and `snakeHeard` refuses it, under
  // `gorge` and `shed` alike.
  it("darkens the MAW face once the jaws stick", () => {
    const world = createWorld(CFG, 7, []);
    startWave(world, index, [], [], buildBoss(index, CFG.cols));
    const boss = world.boss;
    if (boss?.kind !== "snake") throw new Error("SNAKE's wave installed no round");
    boss.phase = "play";
    const lit = (length: number) => {
      boss.body = Array.from({ length }, (_, i) => ({ col: 4, row: 3 + i }));
      return snakeMawLit(world);
    };
    expect(lit(CFG.snakeGorgeTiles)).toBe(true);
    expect(lit(CFG.snakeGorgeTiles + 1)).toBe(false);
    expect(lit(CFG.snakeShedTiles + 1)).toBe(false);
  });

  // The arena is every pixel the round has: the field's own width, or the
  // whole of the air down to the hull — one of the two, on any screen, or the
  // box the owner asked to have removed has come back as a margin.
  it("fills the field's width or reaches the hull", () => {
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      const a = snakeArena(l, CFG);
      const w = a.tile * a.cols;
      const h = a.tile * a.rows;
      expect(a.y + h).toBeCloseTo(l.hullY, 3);
      expect(a.x + w / 2).toBeCloseTo(l.gridLeft + l.gridWidth / 2, 3);
      const wide = Math.abs(w - l.gridWidth) < 1;
      const tall = a.y <= l.playHeight * 0.2;
      expect(wide || tall).toBe(true);
    }
  });
});
