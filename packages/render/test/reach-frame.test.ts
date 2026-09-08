import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildPods, buildQueue } from "@neon-spore/content";
import {
  CRANK_TURN,
  createWorld,
  hullRow,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  windPerTickMilli,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawReachArm } from "../src/reach-arm.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveOnPanel,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CLAW's panel, drawn — and it is drawn by every pass the ordinary field
 * has, because that is what the panel is. No round replaces the picture here,
 * so the assertion worth making is not "something was drawn" but that the arm
 * really went out and came back while it was being drawn, through a canvas
 * that refuses what a real one refuses.
 */

beforeAll(installCanvasGlobals);

/** The wave THE CLAW's panel is played on, found by its control set rather
 * than by a number, so an act inserted ahead of it moves nothing here. */
function clawWave(): number {
  return waveOnPanel("claw");
}

function clawFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 5);
  const index = clawWave();
  startWave(world, index, buildQueue(index, CFG.cols), buildPods(index, CFG.cols));
  const seen = { out: false, home: false, held: false };
  // Where the rig's finger is round the crank. The arm does not come home by
  // itself any more — it is wound in, and a rig that only pressed REACH would
  // draw one frame of a hand going up and then nothing else forever
  // (`sim/crank.ts`). `windPerTickMilli` is the rate a hand that is not a hand
  // turns at, asked for rather than invented here.
  let bearing = 0;

  const frames = runFrames(world, role, ticks, {
    onTick: (tick, w) => {
      const commands: TimedCommand[] = [];
      // Slide **ahead of** the first power-up on the field and reach for it.
      // The rig reads `pods` to find one, which is player 2's half of the wave
      // — the same privilege every rig in this folder takes, and how a test
      // says what a talking pair would have said out loud.
      //
      // **Ahead of, and not at.** A crossing power-up is somewhere else by the
      // time the arm gets up there, so a rig that aimed where the thing
      // currently was would never catch one — which is not a shortcoming of
      // the rig, it is the panel, and the first draft of this file proved it
      // by failing. The lead is the pod's own speed times the arm's own climb,
      // and holding those two in your head is what the pair is really doing.
      const pod = w.pods.find((p) => !p.loose);
      if (pod !== undefined && w.reachDir === 0) {
        const climb =
          ((hullRow(CFG) * 1000 - pod.rowMilli) * ticksPerBeat(CFG)) /
          (CFG.reachTilesPerBeat * 1000);
        const want = (pod.colMilli + pod.crossMilli * climb) / 1000;
        const col = Math.max(0, Math.min(CFG.cols - 1, Math.round(want)));
        if (w.cannonCol !== col) {
          commands.push({ tick, player: 1, command: { kind: "cannonCol", col } });
        } else {
          commands.push({ tick, player: 1, command: { kind: "reach" } });
        }
      }
      // The winding, every tick the arm is on its way back: a bearing round
      // the crank, a little further on each time. The first one only says
      // where the finger started; the rope comes in on the ones after it.
      if (w.reachDir < 0) {
        commands.push({
          tick,
          player: 1,
          command: { kind: "drag", target: "crank", on: true, fromMilli: bearing },
        });
        bearing = (bearing + windPerTickMilli(CFG)) % CRANK_TURN;
      }
      // And the other seat's mouth, on the beat, so a pod brought down is met.
      if (w.tick % ticksPerBeat(CFG) === 0) {
        commands.push({ tick, player: 2, command: { kind: "intake" } });
      }
      step(w, commands);
      if (w.reachDir !== 0) seen.out = true;
      else if (seen.out) seen.home = true;
      if (w.reachHeld !== 0) seen.held = true;
    },
  });
  return { ...frames, seen };
}

describe("THE CLAW's panel draws on all three screens", () => {
  const TICKS = ticksPerBeat(CFG) * 24;

  for (const role of ROLES) {
    it(`draws the field, the arm and the panel on ${role}`, () => {
      const { ctx } = clawFrames(role, TICKS);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  /**
   * The owner's correction, as the one assertion that can hold it: *the claw
   * is there before it is used*. It used to be drawn only while it was out, so
   * a press made a hand appear on top of the swelling out of nothing; now the
   * fingers sit folded on the crown and a press only moves them. The subject
   * is the pass rather than a whole frame, because a whole frame draws five
   * hundred other things and would say nothing about this one.
   */
  it("draws the folded arm on a panel that carries it, out or not", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const world = createWorld(CFG, 5);
    const index = clawWave();
    startWave(world, index, buildQueue(index, CFG.cols), buildPods(index, CFG.cols));
    expect(world.reachDir).toBe(0);
    const surface = () => l.hullY;

    const home = stubCanvas();
    drawReachArm(home.ctx as never, l, world, surface, true, l.width / 2);
    expect(home.ctx.calls).toBeGreaterThan(0);

    // And nothing at all on every other panel in the game, where the swelling
    // is a gun and the mouth `hull.ts` draws in it is the picture.
    const gun = stubCanvas();
    drawReachArm(gun.ctx as never, l, world, surface, false, l.width / 2);
    expect(gun.ctx.calls).toBe(0);
  });

  it("really sent the arm out, closed it on something and brought it home", () => {
    const { seen } = clawFrames("test", TICKS);
    expect(seen.out).toBe(true);
    expect(seen.held).toBe(true);
    expect(seen.home).toBe(true);
  });
});
