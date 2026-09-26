import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { type InstarState, step, type World } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE INSTAR's body in every pose and phase, its marks up, half answered
 * and done, and its end, on all three screens.
 *
 * The states are **set** rather than played to, `hive-frame.test.ts`'s
 * arrangement: `sim/test/instar.test.ts` proves the script, the thumbs and
 * the landing, and what this file asks is whether every branch of the
 * picture is one a canvas accepts — every step of the script mid-morph and
 * acting, face-on and side-on, a mark under a thumb, a mark done, the body
 * down, out, and the three strikes — and the
 * two things nothing else could catch: that the marks are drawn **only
 * while the window is open**, and that the split is **the hands** — the
 * same body on both screens, a mark's word and brightness differing by
 * whose it is — plus that the jolt is a transient the next run does not
 * inherit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const L = computeLayout(VIEWPORT, CFG, "test");

/** Step `cursor` halfway through its morph. */
function morphing(world: World, cursor = 0): InstarState {
  const s = acting(world, cursor);
  s.phase = "morph";
  s.phaseBeat = world.beat - Math.floor((s.steps[cursor]?.morphBeats ?? 2) / 2);
  return s;
}

/** The first step's first mark half pulled under the pilot's thumb. */
function pulled(world: World): InstarState {
  const s = acting(world, 0);
  const need = s.steps[0]?.marks[0]?.need ?? 2;
  s.progress[0] = Math.floor(need / 2);
  s.thumbs[0] = 1;
  return s;
}

/** The first step's first mark done, its partner not. */
function halfDone(world: World): InstarState {
  const s = acting(world, 0);
  s.progress[0] = s.steps[0]?.marks[0]?.need ?? 1;
  s.doneBeat[0] = world.beat;
  return s;
}

/** The last step landed a beat ago: the body is down. */
function down(world: World): InstarState {
  const s = acting(world, 0);
  s.cursor = s.steps.length;
  s.phase = "down";
  s.phaseBeat = world.beat - 1;
  s.progress = [];
  s.doneBeat = [];
  s.ref = [];
  s.thumbs = [];
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the body set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

/** The body's own fill: the deep sheen at nine tenths, which nothing else on the field wears. */
const PLATE = rgba(PALETTE.sheenDeep, 0.9);
/** The same sheen at any opacity. */
const HIDE = PLATE.slice(0, PLATE.lastIndexOf(","));

describe("THE INSTAR's body", () => {
  const STEPS = INSTAR_SCRIPT.map((_, i) => i);

  it.each(ROLES)("draws every pose mid-morph and acting on %s", (role) => {
    for (const cursor of STEPS) {
      const morph = frame(role, (w) => morphing(w, cursor));
      const act = frame(role, (w) => acting(w, cursor));
      expect(morph.calls).toBeGreaterThan(200);
      // Mid-turn both views are drawn, each at its share of the turn, so the
      // hide is counted in the sheen at any opacity.
      expect(count(morph.text, HIDE)).toBeGreaterThan(0);
      expect(count(act.text, PLATE)).toBeGreaterThan(0);
      expect(morph.text).not.toBe(act.text);
    }
  });

  it.each(ROLES)("puts the marks up only while the window is open, on %s", (role) => {
    const act = frame(role, (w) => acting(w, 0));
    const morph = frame(role, (w) => {
      const s = morphing(w, 0);
      // Early in the morph, before the anticipation glows up.
      s.phaseBeat = w.beat;
    });
    const gone = frame(role, (w) => {
      const s = acting(w, 0);
      s.phase = "land";
    });
    expect(count(act.text, PALETTE.red)).toBeGreaterThan(count(morph.text, PALETTE.red));
    expect(count(act.text, PALETTE.red)).toBeGreaterThan(count(gone.text, PALETTE.red));
    expect(count(morph.text, PALETTE.red)).toBe(count(gone.text, PALETTE.red));
  });

  it("draws the same body on both screens and a different word over each mark", () => {
    // A step that asks one mark of each seat: the same rings, the pilot's
    // bright on his screen and the navigator's on hers — two different
    // pictures of one body. Each seat's own frame is in its own colours, so
    // the pictures are compared by what the body and the marks are painted in.
    // A mark for both seats is bright on both, so its step is the same
    // picture everywhere and only the first two hold. A step that asks one
    // seat for more — the fire tapped out between the bites, the third bite's
    // tap and pull — is brighter on that seat's screen.
    for (const cursor of STEPS) {
      const at = (role: ViewRole) => frame(role, (w) => acting(w, cursor));
      const marks = INSTAR_SCRIPT[cursor]?.marks ?? [];
      const ask = (seat: string) => marks.filter((m) => m.seat === seat).length;
      const bright = (role: ViewRole) => count(at(role).text, PALETTE.text);
      expect(count(at("p1").text, PLATE)).toBe(count(at("p2").text, PLATE));
      expect(Math.sign(bright("p1") - bright("p2"))).toBe(Math.sign(ask("p1") - ask("p2")));
      if (INSTAR_SCRIPT[cursor]?.marks.some((m) => m.seat === "both")) continue;
      // The test screen holds both seats, so both words are the gesture's, bright.
      expect(count(at("test").text, PALETTE.text)).toBeGreaterThan(
        count(at("p1").text, PALETTE.text),
      );
    }
  });

  it.each(["jaw", "eggs", "tail", "head"] as const)(
    "draws the %s's strike over the field",
    (part) => {
      const run = (strike: boolean): number => {
        const world = hung();
        acting(
          world,
          INSTAR_SCRIPT.findIndex((s) => s.marks.some((m) => m.part === part)),
        );
        const { ctx } = runFrames(world, "p1", 9, {
          every: 3,
          onTick: (tick, w) => {
            step(w, []);
            if (strike && tick === 0) w.events.push({ type: "instarStrike", part, col: 5 });
          },
        });
        return ctx.calls;
      };
      expect(run(true)).toBeGreaterThan(run(false));
    },
  );

  it.each(ROLES)("fills a mark's arc under a thumb and dots it when done, on %s", (role) => {
    const bare = frame(role, (w) => acting(w, 0));
    const half = frame(role, pulled);
    const done = frame(role, halfDone);
    expect(half.text).not.toBe(bare.text);
    expect(count(half.text, PALETTE.redRim)).toBeGreaterThan(count(bare.text, PALETTE.redRim));
    expect(done.text).not.toBe(bare.text);
    expect(done.text).not.toBe(half.text);
  });

  it.each(ROLES)("sags the body and fades it once the last step lands, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, (w) => acting(w, 0));
    expect(count(going.text, PLATE)).toBeLessThan(count(stood.text, PLATE));
    expect(count(going.text, PALETTE.red)).toBeLessThan(count(stood.text, PALETTE.red));
    const gone = frame(role, (w) => {
      down(w).phaseBeat = w.beat - CFG.instarOutBeats - 1;
    });
    expect(count(gone.text, PLATE)).toBe(0);
  });

  it("keeps the jolt, the flinch and the strike as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [
        { type: "instarLand", step: 0, col: 5 },
        { type: "instarRefuse", mark: 0, player: 2, col: 5 },
        { type: "instarStrike", part: "jaw", col: 5 },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.instar.jolt).toBeGreaterThan(0);
    expect(fx.boss.instar.flinch).toBeGreaterThan(0);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
