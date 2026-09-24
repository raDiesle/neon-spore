import { describe, expect, it } from "bun:test";
import { bossHoldsWave } from "../src/boss-kinds.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  slowing,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type LeadState,
  leadAim,
  leadBoss,
  leadForecasts,
  leadHeading,
  leadPace,
  leadPassing,
  leadRunning,
  leadStill,
  leadWalk,
} from "../src/lead.js";
import { leadStruck } from "../src/lead-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE LEAD: the one boss the pair has to shoot where it is not yet.
 *
 * What these pin is everything the design says and a phone cannot show.
 * That the body comes in over the middle facing right and paces a column a
 * beat, turning at the walls, with the stalk leaning where it goes next;
 * that a shot out of the top is put in the air for `leadFlightBeats` and
 * judged against the column the body is in **then** — so the column to
 * shoot is `leadAim`, the sum the pair is doing; that a hit takes a segment
 * and one a beat at most; that a beat on which every shot missed turns it
 * round; that from `leadFastSegments`
 * it runs, and drops a torch behind and a rock ahead on their cadences;
 * that from `leadForecastSegments` the lean says the beat after next; that
 * the last segment stops it dead and unhittable, with the lean giving the
 * pass away on the still's last beat; that the pass goes to the farther
 * wall at `leadPassCols` a beat and a wall is another still; that only
 * the beam standing in a column the pass goes through ends it, and only the
 * `leadStillFills`th, each before it stopping the body dead where it met it;
 * that THE SLOW spans each still and its pass and shuts on the last beam;
 * and that the wave ends after.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;
const LAST = CFG.cols - 1;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "lead" });
  return world;
}

function body(world: World): LeadState {
  const s = leadBoss(world);
  if (s === null) throw new Error("no body installed");
  return s;
}

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** A beam standing the whole way up `col`, the way `lance-burn.ts` leaves one. */
function beam(world: World, col: number): void {
  world.beam = { col, color: "red", left: TPB, topMilli: 0 };
}

/** Beams met on the last movement already, so the next is the one that ends it. */
function spent(s: LeadState): LeadState {
  s.stillFills = CFG.leadStillFills - 1;
  return s;
}

/** The body stopped dead in `col`, the way the fourth hit leaves it: put a pace short of it, and hit where it will be. */
function stilled(world: World, col = midCol(CFG)): LeadState {
  const s = body(world);
  s.segments = 2;
  s.col = col - s.dir * leadPace(s, CFG);
  leadStruck(world, shot(world, leadAim(s, CFG)));
  beats(world, 1);
  if (!leadStill(s)) throw new Error("the fourth hit did not stop it");
  return s;
}

describe("the body coming in", () => {
  it("stands over the middle facing right with every segment on the stalk", () => {
    const world = open();
    const s = body(world);
    expect(s.col).toBe(midCol(CFG));
    expect(s.dir).toBe(1);
    expect(s.lean).toBe(0);
    expect(s.segments).toBe(CFG.leadSegments);
    expect(s.flights).toEqual([]);
    expect(s.stillBeat).toBe(-1);
    expect(s.passBeat).toBe(-1);
    expect(s.downBeat).toBe(-1);
    expect(world.events.some((e) => e.type === "leadEnter")).toBe(true);
  });

  it("is a fixture that holds its wave and, walking, falls nothing of its own", () => {
    const world = open();
    expect(bossHoldsWave("lead")).toBe(true);
    beats(world, 6);
    expect(world.creatures.length).toBe(0);
    expect(leadBoss(world)).not.toBeNull();
  });
});

describe("the pace", () => {
  it("moves one column a beat with the stalk leaning where it goes next", () => {
    const world = open();
    const s = body(world);
    const seen = beats(world, 1);
    expect(s.col).toBe(midCol(CFG) + 1);
    expect(s.lean).toBe(1);
    expect(seen.has("leadPace")).toBe(true);
    expect(leadPace(s, CFG)).toBe(CFG.leadPaceCols);
  });

  it("turns at the wall, and the lean flips on the beat it gets there", () => {
    const world = open();
    const s = body(world);
    const seen = beats(world, LAST - midCol(CFG));
    expect(s.col).toBe(LAST);
    expect(s.dir).toBe(-1);
    expect(s.lean).toBe(-1);
    expect(seen.has("leadTurn")).toBe(true);
    beats(world, 1);
    expect(s.col).toBe(LAST - 1);
  });

  it("walks by the rule the pair is told: stop at the wall, face away from it", () => {
    expect(leadWalk(LAST - 1, 1, 2, CFG)).toEqual({ col: LAST, dir: -1 });
    expect(leadWalk(1, -1, 2, CFG)).toEqual({ col: 0, dir: 1 });
    expect(leadWalk(4, 1, 1, CFG)).toEqual({ col: 5, dir: 1 });
  });
});

describe("the sum", () => {
  it("puts a bolt out of the top into the air, due one flight later", () => {
    const world = open();
    const s = body(world);
    leadStruck(world, shot(world, 2));
    expect(s.flights).toEqual([{ col: 2, dueBeat: world.beat + CFG.leadFlightBeats }]);
    expect(world.events.some((e) => e.type === "leadFlight")).toBe(true);
  });

  it("takes a segment from a shot put where the body will be, and asks nothing slowly", () => {
    const world = open();
    const s = body(world);
    const aim = leadAim(s, CFG);
    expect(aim).toBe(s.col + s.dir * CFG.leadPaceCols * CFG.leadFlightBeats);
    leadStruck(world, shot(world, aim));
    const seen = beats(world, CFG.leadFlightBeats);
    expect(s.segments).toBe(CFG.leadSegments - 1);
    expect(s.flights).toEqual([]);
    expect(seen.has("leadHit")).toBe(true);
    expect(seen.has("leadReverse")).toBe(false);
    expect(slowing(world)).toBe(false);
  });

  it("turns round on a beat every shot missed, and the lean flips with it", () => {
    const world = open();
    const s = body(world);
    leadStruck(world, shot(world, s.col));
    const seen = beats(world, CFG.leadFlightBeats);
    expect(s.segments).toBe(CFG.leadSegments);
    expect(s.dir).toBe(-1);
    expect(s.lean).toBe(-1);
    expect(seen.has("leadMiss")).toBe(true);
    expect(seen.has("leadReverse")).toBe(true);
    beats(world, 1);
    expect(s.col).toBe(midCol(CFG));
  });

  it("takes one segment a beat, however many arrive, and a hit beside a miss is a hit", () => {
    const world = open();
    const s = body(world);
    const aim = leadAim(s, CFG);
    leadStruck(world, shot(world, aim));
    leadStruck(world, shot(world, aim));
    leadStruck(world, shot(world, aim + 3));
    const seen = beats(world, CFG.leadFlightBeats);
    expect(s.segments).toBe(CFG.leadSegments - 1);
    expect(s.dir).toBe(1);
    expect(seen.has("leadReverse")).toBe(false);
  });
});

describe("the run", () => {
  it("runs from the fourth segment, at the fast pace", () => {
    const world = open();
    const s = body(world);
    expect(leadRunning(s, CFG)).toBe(false);
    s.segments = CFG.leadFastSegments;
    expect(leadRunning(s, CFG)).toBe(true);
    expect(leadPace(s, CFG)).toBe(CFG.leadFastCols);
    const from = s.col;
    beats(world, 1);
    expect(s.col).toBe(from + CFG.leadFastCols);
  });

  it("drops a torch in the column it left and a rock where a shot has to go", () => {
    const world = open();
    const s = body(world);
    s.segments = CFG.leadFastSegments;
    let torch: { col: number; from: number } | null = null;
    let rock: { col: number; aim: number } | null = null;
    for (let i = 0; i < Math.max(CFG.leadTorchEveryBeats, CFG.leadRockEveryBeats) + 1; i++) {
      const from = s.col;
      beats(world, 1);
      for (const e of world.events) {
        if (e.type === "leadTorch") torch = { col: e.col, from };
        if (e.type === "leadRock") rock = { col: e.col, aim: leadAim(s, CFG) };
      }
    }
    if (torch === null || rock === null) throw new Error("the run dropped nothing");
    expect(torch.col).toBe(torch.from);
    expect(rock.col).toBe(rock.aim);
    expect(world.creatures.some((c) => c.kind === "torch")).toBe(true);
    expect(world.creatures.some((c) => c.kind === "meteor")).toBe(true);
  });

  it("leans the wall turn a beat early from the second segment", () => {
    const world = open();
    const s = body(world);
    s.segments = CFG.leadForecastSegments;
    expect(leadForecasts(s, CFG)).toBe(true);
    s.col = LAST - 2 * CFG.leadFastCols;
    beats(world, 1);
    expect(s.col).toBe(LAST - CFG.leadFastCols);
    expect(s.dir).toBe(1);
    expect(s.lean).toBe(-1);
    expect(leadHeading(s, CFG, 1)).toBe(-1);
  });
});

describe("the last movement", () => {
  it("stops dead on the fourth hit, stalk upright, and lets nothing through to it", () => {
    const world = open();
    const s = stilled(world);
    const col = s.col;
    expect(s.segments).toBe(1);
    expect(s.lean).toBe(0);
    leadStruck(world, shot(world, col));
    expect(s.flights).toEqual([]);
    leadStruck(world, shot(world, col, "red", true));
    expect(s.downBeat).toBe(-1);
    beam(world, col);
    beats(world, CFG.leadStillBeats - 1);
    expect(s.col).toBe(col);
    expect(s.segments).toBe(1);
    expect(leadStill(s)).toBe(true);
  });

  it("gives the pass away on the still's last beat, then goes toward the farther wall", () => {
    const world = open();
    const s = stilled(world);
    const col = s.col;
    beats(world, CFG.leadStillBeats - 1);
    expect(s.lean).toBe(0);
    beats(world, 1);
    expect(s.lean).toBe(1);
    expect(s.col).toBe(col);
    const seen = beats(world, 1);
    expect(seen.has("leadPass")).toBe(true);
    expect(leadPassing(s)).toBe(true);
    expect(s.col).toBe(col + CFG.leadPassCols);
  });

  it("stands still again at the wall, and passes back the other way", () => {
    const world = open();
    const s = stilled(world);
    beats(world, CFG.leadStillBeats + 1);
    const seen = new Set<string>();
    while (!seen.has("leadWall")) for (const e of beats(world, 1)) seen.add(e);
    expect(s.col).toBe(LAST);
    expect(leadStill(s)).toBe(true);
    beats(world, CFG.leadStillBeats + 1);
    expect(s.col).toBe(LAST - CFG.leadPassCols);
  });

  it("stops dead where a beam short of the last met the pass, a whole new still", () => {
    const world = open();
    const s = stilled(world);
    expect(slowing(world)).toBe(true);
    beats(world, CFG.leadStillBeats);
    const col = s.col + CFG.leadPassCols - 1;
    beam(world, col);
    const seen = beats(world, 1);
    expect(seen.has("leadStill")).toBe(true);
    expect(s.downBeat).toBe(-1);
    expect(s.stillFills).toBe(1);
    expect(s.col).toBe(col);
    expect(leadStill(s)).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("is ended by the beam standing in a column the pass goes through, and the wave ends after", () => {
    const world = open();
    const s = spent(stilled(world));
    beats(world, CFG.leadStillBeats);
    beam(world, s.col + CFG.leadPassCols - 1);
    const seen = beats(world, 1);
    expect(seen.has("leadDown")).toBe(true);
    expect(s.segments).toBe(0);
    expect(s.downBeat).toBe(world.beat);
    expect(slowing(world)).toBe(false);
    const out = beats(world, CFG.leadOutBeats);
    expect(out.has("leadOut")).toBe(true);
    expect(leadBoss(world)).toBeNull();
  });

  it("is ended by a beam fired up its own column on the pass", () => {
    const world = open();
    const s = spent(stilled(world));
    beats(world, CFG.leadStillBeats + 1);
    expect(leadPassing(s)).toBe(true);
    leadStruck(world, shot(world, s.col, "red", true));
    expect(s.downBeat).toBe(world.beat);
  });

  it("walks past a beam that something on the field stopped short of the top", () => {
    const world = open();
    const s = stilled(world);
    beats(world, CFG.leadStillBeats);
    world.beam = { col: s.col + 1, color: "red", left: TPB, topMilli: 4000 };
    beats(world, 1);
    expect(s.downBeat).toBe(-1);
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs of the same seed, and moves with a shot in the air", () => {
    const a = open(7);
    const b = open(7);
    leadStruck(a, shot(a, 4));
    leadStruck(b, shot(b, 4));
    beats(a, 3);
    beats(b, 3);
    expect(hashWorld(a)).toBe(hashWorld(b));
    const c = open(7);
    leadStruck(c, shot(c, 4));
    leadStruck(c, shot(c, 5));
    expect(hashWorld(c)).not.toBe(hashWorld(open(7)));
  });
});
