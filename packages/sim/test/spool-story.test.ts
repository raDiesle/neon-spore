import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  NO_BRAKE,
  type SimConfig,
  type SpoolState,
  spoolBoss,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE SPOOL's story between the ribs (§21 rows S1–S3, `sim/spool-story.ts`).
 *
 * What these pin: that each of the first three ribs eases into its own state
 * and the last one into none; that each state opens under THE SLOW and gives
 * no rib back; that the snag is freed by the brake let right off and gripped
 * again, the whip damped by a hold at full depth and the fray held by a grip
 * featherlight; that the wrong hold is no answer; that a state run out is the
 * spool's own blow at the hull and the same state from its head; and that the
 * rehearsal's switch leaves the movements as they were.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

function spool(world: World): SpoolState {
  const s = spoolBoss(world);
  if (s === null) throw new Error("the wave installed no spool");
  return s;
}

/**
 * A spool with `gone` ribs off, the last of them just done easing: the next
 * beat opens whatever follows it. Set rather than played to — `spool.test.ts`
 * proves the movements that get here.
 */
function eased(gone: number, over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 7);
  startWave(world, 0, [], [], { kind: "spool" });
  const s = spool(world);
  s.ribs -= gone;
  s.phase = "ease";
  s.phaseBeat = world.beat - world.cfg.spoolEaseBeats;
  return world;
}

/** The pilot's thumb at a depth, or off the brake. */
const brake = (tick: number, to: number | null): TimedCommand => ({
  tick,
  player: 1,
  command: {
    kind: "drag",
    target: "spoolBrake",
    on: to !== null,
    fromMilli: 0,
    fromYMilli: to ?? 0,
  },
});

/** `n` beats on, the brake set as `hold` says at the head of each; what went by. */
function beats(world: World, n: number, hold: (s: SpoolState) => number | null | "keep"): string[] {
  const seen: string[] = [];
  for (let b = 0; b < n; b++) {
    const s = spoolBoss(world);
    const want = s === null ? "keep" : hold(s);
    const cmds = want === "keep" ? [] : [brake(world.tick, want)];
    for (let t = 0; t < TPB; t++) {
      step(world, t === 0 ? cmds : []);
      for (const e of world.events) seen.push(e.type);
    }
  }
  return seen;
}

const off = (): null => null;
const deep = (): number => CFG.spoolReachMilli;
const light = (): number => 0;

describe("the story between the ribs", () => {
  it("opens the snag, the whip and the fray after the first three ribs, under THE SLOW", () => {
    for (const [gone, phase, event] of [
      [1, "snag", "spoolSnag"],
      [2, "whip", "spoolWhip"],
      [3, "fray", "spoolFray"],
    ] as const) {
      const world = eased(gone);
      const seen = beats(world, 1, () => "keep");
      expect(seen).toContain(event);
      expect(seen).not.toContain("spoolZone");
      const s = spool(world);
      expect(s.phase).toBe(phase);
      expect(s.ribs).toBe(4 - gone);
      expect(slowing(world)).toBe(true);
      expect(world.slowAsks).toBe(true);
    }
  });

  it("opens nothing between the movements with the rehearsal's switch off", () => {
    const world = eased(1, { spoolStory: false });
    expect(beats(world, 1, () => "keep")).toContain("spoolZone");
    expect(spool(world).phase).toBe("pay");
  });
});

describe("the snag", () => {
  it("slips free once the brake is let right off and gripped again, and the next movement opens", () => {
    const world = eased(1);
    beats(world, 1, () => "keep");
    const seen = beats(world, CFG.spoolSnagBeats + 2, (s) =>
      s.runBeats >= CFG.spoolSnagBeats ? 300 : null,
    );
    expect(seen).toContain("spoolFree");
    expect(seen).toContain("spoolZone");
    expect(spool(world).phase).toBe("pay");
    expect(spool(world).ribs).toBe(3);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("counts again from nought on a grip taken too soon", () => {
    const world = eased(1);
    beats(world, 1, () => "keep");
    beats(world, CFG.spoolSnagBeats - 1, off);
    beats(world, 1, () => 300);
    expect(spool(world).runBeats).toBe(0);
    expect(spool(world).phase).toBe("snag");
  });

  it("held through, snaps taut against the hull and snags again", () => {
    const world = eased(1);
    beats(world, 1, () => "keep");
    const opened = spool(world).phaseBeat;
    const seen = beats(world, CFG.spoolSnagWindowBeats, () => 500);
    expect(seen).toContain("spoolSnap");
    expect(seen).toContain("breach");
    expect(world.failTick).not.toBe(NOT_FAILED);
    const s = spool(world);
    expect(s.phase).toBe("snag");
    expect(s.phaseBeat).toBeGreaterThan(opened);
    expect(s.ribs).toBe(3);
  });

  it("names itself on the breach, so the blow comes out of the spool", () => {
    const world = eased(1);
    beats(world, 1, () => "keep");
    beats(world, CFG.spoolSnagWindowBeats - 1, () => 500);
    const events: typeof world.events = [];
    for (let t = 0; t < TPB; t++) {
      step(world, []);
      events.push(...world.events);
    }
    const breach = events.find((e) => e.type === "breach");
    expect(breach && "by" in breach ? breach.by : null).toBe("spool");
  });
});

describe("the whip", () => {
  it("damps flat under the brake held at full depth", () => {
    const world = eased(2);
    beats(world, 1, () => "keep");
    const seen = beats(world, CFG.spoolWhipBeats + 1, deep);
    expect(seen).toContain("spoolDamp");
    expect(spool(world).phase).toBe("pay");
    expect(spool(world).ribs).toBe(2);
  });

  it("is not damped by a shallow brake or none, and lashes the hull", () => {
    for (const hold of [light, off]) {
      const world = eased(2);
      beats(world, 1, () => "keep");
      const seen = beats(world, CFG.spoolWhipWindowBeats, hold);
      expect(seen).not.toContain("spoolDamp");
      expect(seen).toContain("spoolLash");
      expect(spool(world).phase).toBe("whip");
    }
  });
});

describe("the fray", () => {
  it("holds under a grip featherlight, and the last movement opens", () => {
    const world = eased(3);
    beats(world, 1, () => "keep");
    const seen = beats(world, CFG.spoolFrayBeats + 1, light);
    expect(seen).toContain("spoolFeather");
    expect(spool(world).phase).toBe("pay");
    expect(spool(world).ribs).toBe(1);
  });

  it("is not held by no hand at all, nor a deep one, and a strand whips the hull", () => {
    for (const hold of [off, deep]) {
      const world = eased(3);
      beats(world, 1, () => "keep");
      const seen = beats(world, CFG.spoolFrayWindowBeats, hold);
      expect(seen).not.toContain("spoolFeather");
      expect(seen).toContain("spoolStrand");
      expect(spool(world).phase).toBe("fray");
    }
  });
});

describe("after the last rib", () => {
  it("opens no state: the spool goes slack", () => {
    const world = createWorld(CFG, 7);
    startWave(world, 0, [], [], { kind: "spool" });
    const s = spool(world);
    s.ribs = 1;
    s.phase = "pay";
    s.leg = 0;
    s.legBeat = world.beat - CFG.spoolLegBeats;
    s.phaseBeat = world.beat - CFG.spoolLegBeats;
    s.brakeMilli = NO_BRAKE;
    s.paidMilli = s.wantMilli;
    s.wantRateMilli = CFG.spoolRateFastMilli;
    const seen = beats(world, 1, () => "keep");
    expect(seen).toContain("spoolSlack");
    expect(seen).not.toContain("spoolSnag");
  });
});

describe("the fingerprint", () => {
  it("carries the story's run", () => {
    const world = eased(2);
    beats(world, 1, () => "keep");
    const before = hashWorld(world);
    spool(world).runBeats += 1;
    expect(hashWorld(world)).not.toBe(before);
  });
});
