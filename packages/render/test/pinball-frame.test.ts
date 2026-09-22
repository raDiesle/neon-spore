import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { ControlSet } from "@neon-spore/content";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  PINBALL_MORPH_BEATS,
  type PinballState,
  pinballRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stripsDrawn,
  thirdOf,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * PINBALL over the whole stage, played rather than watched.
 *
 * A round replaces the field, so no creature ever reaches a line of it — and a
 * table nobody presses anything on is a sweep that walks for half a minute and
 * a ball that never leaves. The two verbs are pressed in the order the round
 * demands (latch the needle, launch on the bar), and the cannon is slid on the
 * ship's own strip while a ball is down, so the aim fan, the power bar, a ball
 * in flight, a lit piece and a moving cannon are all drawn.
 */

beforeAll(installCanvasGlobals);

interface Watched {
  phases: Set<string>;
  shots: Set<string>;
  /** Pieces knocked out, which is the only thing a still frame cannot show. */
  cleared: number;
}

function pinballFrames(
  role: ViewRole,
  ticks: number,
  controls?: ControlSet,
  sampling: { every?: number; phase?: number } = {},
) {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  // The round takes itself off the world when it closes, so what it did has to
  // be read while it is running rather than off the world at the end.
  const watched: Watched = { phases: new Set(), shots: new Set(), cleared: 0 };

  const frames = runFrames(world, role, ticks, {
    ...sampling,
    controls,
    onTick: (tick, w) => {
      const p = w.boss?.kind === "pinball" ? w.boss : null;
      const commands: TimedCommand[] = [];
      if (p !== null) {
        watched.phases.add(p.phase);
        if (p.phase === "play") {
          watched.shots.add(p.shot);
          watched.cleared = Math.max(
            watched.cleared,
            p.alive.filter((standing) => !standing).length,
          );
          // Stop the needle, and fire on the bar a few ticks later so the
          // power reading is not always the same one.
          if (p.shot === "aim") {
            commands.push({ tick, player: 1, command: { kind: "latch" } });
          } else if (p.shot === "power" && tick % 7 === 0) {
            commands.push({ tick, player: 2, command: { kind: "launch" } });
          }
          // And the cannon walks under it on the ship's own strip, which is
          // the only control that answers while a ball is in the air.
          if (p.shot === "flight" && tick % 11 === 0) {
            commands.push({
              tick,
              player: 1,
              command: { kind: "cannonCol", col: (w.cannonCol + 1) % w.cfg.cols },
            });
          }
        }
      }
      step(w, commands);
    },
  });
  return { ...frames, watched };
}

describe("PINBALL draws on all three screens", () => {
  // The ship folding into the bucket, and then the table for as long as the
  // first board is given.
  const TICKS = ticksPerBeat(CFG) * (PINBALL_MORPH_BEATS + 20);

  // Each seat draws a third of the morph and the board (`thirdOf`).
  for (const [i, role] of ROLES.entries()) {
    it(`draws the morph, the table and a ball in flight on ${role}`, () => {
      const { ctx } = pinballFrames(role, TICKS, undefined, thirdOf(4, i));
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("draws the panel it was handed, not the one the wave index names", () => {
    // The director plays a *draft* wave: `world.wave` indexes the shipped
    // `WAVES` and says PINBALL, while the picker has written some other set
    // onto the draft and the game's own `touchDown` hit-tests against that one.
    // Buttons drawn where nothing answers them is the failure
    // `test/stage-rounds.test.ts` exists to prevent, arriving through the
    // drawing side.
    //
    // The shield's strip is the tell: PINBALL's own panel carries the cannon
    // and nothing else, so a screen that draws player 2's channel is a screen
    // drawing the set it was given.
    const ticks = ticksPerBeat(CFG) * (PINBALL_MORPH_BEATS + 4);
    const handed = stripsDrawn(() => pinballFrames("test", ticks, controlSet("default")));
    const own = stripsDrawn(() => pinballFrames("test", ticks));
    expect(handed).toContain("shield");
    expect(own).not.toContain("shield");
    expect(own).toContain("cannon");
  });

  it("really launched a ball and knocked something out, or the frames proved nothing", () => {
    const { watched } = pinballFrames("test", TICKS);
    expect(watched.phases.has("morph")).toBe(true);
    expect(watched.phases.has("play")).toBe(true);
    expect([...watched.shots].sort()).toEqual(["aim", "flight", "power"]);
    expect(watched.cleared).toBeGreaterThan(0);
  });
});

describe("the two hands on the table", () => {
  // **Counted by the one thing only a ring puts on this stage.** A handle
  // fills its disc with the background colour before its own, so whatever it
  // hangs over does not show through it (`handle-draw.ts`) — and this stage
  // paints its background with a gradient rather than that flat colour, so the
  // count is the number of rings and nothing else. Calls will not do it: the
  // board, the preview fan and the bar all change with the shot.
  //
  // **It counts the seat's own**, since 22 September 2026: the dim copy of the
  // other seat's handle is drawn (the last case here proves it) and punches no
  // disc, because a hole the seat cannot see a wash inside came out as a hole
  // in the board — which is what this stage's lit surface makes of one.
  const rings = (role: ViewRole, set: (state: PinballState) => void): number => {
    const world = stopped();
    set(pinballState(world));
    const log: string[] = [];
    runFrames(world, role, 1, {
      every: 1,
      onCanvas: (c) => {
        c.log = log;
      },
      // A stepped round would sweep the needle and fly the ball off whatever
      // shot it was set on; a still one holds it for the whole frame.
      onTick: () => {},
    });
    return count(log.join("|"), PALETTE.background);
  };

  it.each(ROLES)("draws no handle at all on an ordinary shot for %s", (role) => {
    expect(rings(role, (p) => (p.shot = "aim"))).toBe(0);
    expect(
      rings(role, (p) => {
        p.shot = "power";
        p.slack = false;
      }),
    ).toBe(0);
  });

  /** The seats the plunger is *theirs* on, and the ones the shove is: his is
   * the spring, hers is the table, and the rig may press either. */
  const HIS: ViewRole[] = ROLES.filter((r) => r !== "p2");
  const HERS: ViewRole[] = ROLES.filter((r) => r !== "p1");

  it.each(HIS)("punches the plunger's disc on a slack spring, and only then, for %s", (role) => {
    expect(
      rings(role, (p) => {
        p.shot = "power";
        p.slack = true;
      }),
    ).toBe(1);
  });

  it.each(HERS)("punches the shove's through a flight and takes it off a tilt for %s", (role) => {
    expect(rings(role, (p) => (p.shot = "flight"))).toBe(1);
    expect(
      rings(role, (p) => {
        p.shot = "flight";
        p.tilted = true;
      }),
    ).toBe(0);
  });

  it("punches nothing for the seat that may not press it, on either handle", () => {
    // The whole of the change: she reads his plunger and he reads her shove,
    // and neither reading cuts a hole in the board between them.
    expect(
      rings("p2", (p) => {
        p.shot = "power";
        p.slack = true;
      }),
    ).toBe(0);
    expect(rings("p1", (p) => (p.shot = "flight"))).toBe(0);
  });

  it("gives each seat the other's handle dimmed, and the rig neither", () => {
    // Neither can feel the other's thumb, so each is drawn on both screens,
    // bright on the seat it belongs to and dim on the other
    // (`pinball-grip.ts`). The navigator reads the plunger dim because it is
    // his; he reads the shove dim because it is hers; the rig owns both.
    const dim = (role: ViewRole, set: (state: PinballState) => void): number => {
      const world = stopped();
      set(pinballState(world));
      const log: string[] = [];
      runFrames(world, role, 1, {
        every: 1,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: () => {},
      });
      return count(log.join("|"), PALETTE.dim);
    };
    const wound = (p: PinballState) => {
      p.shot = "power";
      p.slack = true;
    };
    const falling = (p: PinballState) => {
      p.shot = "flight";
    };
    expect(dim("p2", wound)).toBeGreaterThan(dim("p1", wound));
    expect(dim("p1", falling)).toBeGreaterThan(dim("p2", falling));
  });
});

function count(text: string, tell: string): number {
  return text.split(tell).length - 1;
}

/** A table standing at `play`, with nothing stepping it afterwards. */
function stopped(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * ticksPerBeat(CFG); i++) {
    if (pinballState(world).phase === "play") return world;
    step(world, []);
  }
  throw new Error("the round never reached play");
}

function pinballState(world: World): PinballState {
  const state = pinballRound(world);
  if (state === null) throw new Error("PINBALL's wave installed no round");
  return state;
}
