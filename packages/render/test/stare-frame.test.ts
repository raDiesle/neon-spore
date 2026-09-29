import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bandLobes } from "../src/band-lobes.js";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE STARE's eye — resting, teaching in blue, open and shut on a live pass,
 * charging under its lid — on all three screens.
 *
 * The phases are **set** rather than played to, `hive-frame.test.ts`'s
 * arrangement: `sim/test/stare.test.ts` proves the fight, and what this file
 * asks is whether every state of the picture is one a canvas accepts, that an
 * open eye is another picture than a shut one and a blue one another than a
 * red one, that the lid and its ring are on every screen while the eye
 * charges, and that the flash of a catch lights the caught seat's panel and
 * is a transient the next run does not inherit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the eye in, stepped past beat zero so a `phaseBeat` set in the past is a beat it saw. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function eye(world: World): StareState {
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  return s;
}

/** The eye in `phase`, a beat in, open or shut, with the lid `lidMilli` down under `lidSeat`. */
function set(
  world: World,
  phase: StareState["phase"],
  open = false,
  lidSeat: 0 | 1 | 2 = 0,
  lidMilli = 0,
): StareState {
  const s = eye(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.open = open;
  s.lidSeat = lidSeat;
  s.lidMilli = lidMilli;
  return s;
}

interface Drawn {
  calls: number;
  text: string;
}

/** Frames drawn with nothing stepped, so the state set is the state drawn. */
function drawn(world: World, role: ViewRole, ticks: number): Drawn {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: () => {},
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the eye set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): Drawn {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE STARE's eye", () => {
  it.each(ROLES)("draws the cowled eye in every phase on %s", (role) => {
    const rest = frame(role, (w) => set(w, "rest"));
    expect(rest.calls).toBeGreaterThan(100);
    expect(rest.text).toContain(PALETTE.rockDark);
    for (const phase of ["teach", "live", "charge", "hurt", "dying"] as const) {
      expect(frame(role, (w) => set(w, phase)).calls).toBeGreaterThan(100);
    }
  });

  it.each(ROLES)(
    "opens on an open beat, red on a live pass and cyan on the blue one, on %s",
    (role) => {
      const shut = frame(role, (w) => set(w, "live", false));
      const live = frame(role, (w) => set(w, "live", true));
      const teach = frame(role, (w) => set(w, "teach", true));
      expect(live.text).not.toBe(shut.text);
      // The gaze is a gradient down the field, and it is on every screen now:
      // both seats freeze.
      expect(count(live.text, "createLinearGradient")).toBeGreaterThan(
        count(shut.text, "createLinearGradient"),
      );
      // The same open eye in another ink: the blue pass is another picture.
      expect(teach.text).not.toBe(live.text);
    },
  );

  it.each(ROLES)("rings the beat the eye is on in the score on %s", (role) => {
    const one = frame(role, (w) => set(w, "live"));
    const two = frame(role, (w) => {
      set(w, "live").phaseBeat = w.beat - 2;
    });
    expect(two.text).not.toBe(one.text);
  });

  it.each(ROLES)("brings the lid down with its handle on %s while the eye charges", (role) => {
    // A lid half down fills its channel green behind the knob (`pull-track.ts`)
    // — the one green in the picture — and it is on every screen: either seat
    // may pull.
    const half = frame(role, (w) => set(w, "charge", false, 1, CFG.stareLidPullMilli / 2));
    const none = frame(role, (w) => set(w, "charge"));
    expect(count(half.text, PALETTE.good)).toBeGreaterThan(0);
    expect(count(half.text, PALETTE.rockDark)).toBeGreaterThan(count(none.text, PALETTE.rockDark));
    // And no lid at all outside the charge.
    expect(count(frame(role, (w) => set(w, "live")).text, PALETTE.good)).toBe(0);
  });

  it("keeps the vent and the blast as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "stareVent", player: 2 }], L, 0, () => 0, CFG);
    // A burst to each side, and no flash: nothing was caught.
    expect(fx.boss.stare.flash).toBe(0);
    expect(fx).not.toEqual(new Effects());
    fx.ingest([{ type: "stareBlast", col: 3 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    // The beam is a lesser flash with no seat under it, so no panel lights.
    expect(fx.boss.stare.flash).toBeGreaterThan(0);
    expect(fx.boss.stare.flash).toBeLessThan(0.6);
    expect(fx.boss.stare.caught).toBe(0);
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it("keeps the flash of a catch as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [{ type: "stareCaught", player: 1, command: { kind: "cannonCol", col: 3 }, col: 3 }],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.stare.flash).toBeGreaterThan(0);
    expect(fx.boss.stare.caught).toBe(1);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it("washes the caught seat's panel for a press with no button, and not the other's", () => {
    // The same frames with and without the catch, and the press is the cannon
    // strip — a verb no circle on the band sends, so the fallback is what is
    // drawn: on the caught seat's screen the panel is one more red rectangle,
    // and on the other's nothing moved.
    const run = (role: ViewRole, caught: boolean) => {
      const world = hung();
      set(world, "live", true);
      const log: string[] = [];
      runFrames(world, role, 6, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (caught && tick === 1) {
            w.events.push({
              type: "stareCaught",
              player: 1,
              command: { kind: "cannonCol", col: 3 },
              col: 3,
            });
          }
        },
      });
      return log.join("|");
    };
    // The wash is one rectangle from the band's top to the bottom of the
    // screen; the burst out of the eye is on both screens by design, so the
    // count is of a rectangle starting at the band's top and not of every
    // `fillRect`. (The width is the renderer's own, which is not the layout
    // this file computes, so the top is what identifies it.)
    const wash = (role: ViewRole, caught: boolean) =>
      count(run(role, caught), `fillRect(0, ${computeLayout(VIEWPORT, CFG, role).bandTop}, `);
    expect(wash("p1", true)).toBeGreaterThan(0);
    expect(wash("p1", false)).toBe(0);
    expect(wash("p2", true)).toBe(0);
    expect(count(run("p2", true), PALETTE.red)).toBeGreaterThan(
      count(run("p2", false), PALETTE.red),
    );
  });

  it("puts the flash on the button the caught press came through", () => {
    // The design is *flash on the button somebody pressed anyway*, and until
    // 21 September 2026 every catch washed the whole panel because nothing in
    // `render/` could turn a command back into a circle. `controlSays` does,
    // so this asks the same `bandLobes` the band draws from where the circle
    // is and then looks for a flash on it.
    const set = controlSet("default");
    const drawn = (command: Command) => {
      const fx = new Effects();
      fx.ingest([{ type: "stareCaught", player: 1, command, col: 3 }], L, 0, () => 0, CFG);
      const { ctx } = stubCanvas();
      const log: string[] = [];
      ctx.log = log;
      fx.boss.stare.drawCaught(ctx as unknown as CanvasRenderingContext2D, L, "p1", set);
      return log.join("|");
    };
    const shown = (n: number) => Math.round(n * 1000) / 1000;
    const guard = bandLobes(L, set, 1).find((b) => b.control.id === "guard");
    if (guard === undefined) throw new Error("the standard panel has no trigger for player 1");
    // A press that came through a button: the circle lights and the panel is
    // left alone.
    const pressed = drawn({ kind: "guard" });
    expect(pressed).toContain(`arc(${shown(guard.circle.x)}, ${shown(guard.circle.y)}, `);
    expect(pressed).not.toContain("fillRect(");
    // And a press with no button — the strip a thumb slid, which is a column
    // and not a circle — still washes the panel it came from.
    const slid = drawn({ kind: "cannonCol", col: 3 });
    expect(slid).toContain(`fillRect(0, ${shown(L.bandTop)}, `);
    expect(slid).not.toContain("arc(");
  });

  it("tells the two colours apart, which a command kind alone cannot", () => {
    // Both trigger lobes send `prime`, so the colour is the only thing that
    // says which circle the thumb was on — and it is why the event carries the
    // whole command rather than `command.kind` (`sim/events-stare.ts`).
    const set = controlSet("default");
    const fx = new Effects();
    fx.ingest(
      [
        {
          type: "stareCaught",
          player: 2,
          command: { kind: "prime", on: true, color: "cyan" },
          col: 3,
        },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    fx.boss.stare.drawCaught(ctx as unknown as CanvasRenderingContext2D, L, "p2", set);
    const shown = (n: number) => Math.round(n * 1000) / 1000;
    const lobe = (id: string) => bandLobes(L, set, 2).find((b) => b.control.id === id);
    const cyan = lobe("fireCyan");
    const red = lobe("fireRed");
    if (cyan === undefined || red === undefined)
      throw new Error("the standard panel lost a colour");
    expect(log.join("|")).toContain(`arc(${shown(cyan.circle.x)}, ${shown(cyan.circle.y)}, `);
    expect(log.join("|")).not.toContain(`arc(${shown(red.circle.x)}, ${shown(red.circle.y)}, `);
  });
});
