import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { cueFor, panForCol, pitchForRow } from "../src/bind.js";
import { HEAVY_BREACH_DAMAGE } from "../src/bind-breach.js";
import { hasSound } from "../src/catalogue.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * The `SimEvent` union, read out of the simulation rather than copied here.
 * A copied list is a list that stops being true the day someone adds an event,
 * which is exactly the day the new event silently has no sound.
 *
 * **All three files**, because the union is written in three: what a covering
 * did is `ArmourEvent` in `events-armour.ts`, what a body one of them cannot
 * see did is `CreatureEvent` in `events-creature.ts` — the same two seams this
 * package's own `bind-armour.ts` and `bind-creatures.ts` read on — and
 * `SimEvent` is those two arms plus the ship, the field, the pods and the
 * bosses. Reading only the first would let a creature event ship with no
 * sound, which is the exact failure this test was written for.
 */
async function eventTypes(): Promise<string[]> {
  const found: string[] = [];
  for (const [file, decl] of [
    ["packages/sim/src/events.ts", "export type SimEvent ="],
    ["packages/sim/src/events-creature.ts", "export type CreatureEvent ="],
    // THE CAROM's four, cut out of the file above when they took it over its
    // 250-line limit. Named here rather than globbed for the reason the two
    // above are: a file this test cannot find is a file whose events go
    // silently unheard, so the list has to be a thing somebody adds to on
    // purpose — and forgetting is a failure here rather than a silence.
    ["packages/sim/src/events-carom.ts", "export type CaromEvent ="],
    // THE VOLLEY's two, on exactly the same terms and for the same reason.
    ["packages/sim/src/events-volley.ts", "export type VolleyEvent ="],
    // And THE STRAND's three, cut out for the same reason again.
    ["packages/sim/src/events-strand.ts", "export type StrandEvent ="],
    // THE GHOST's three and THE CRAWLER's two, both cut out of
    // `events-creature.ts` on the day THE CRAWLER needed room in it.
    ["packages/sim/src/events-ghost.ts", "export type GhostEvent ="],
    ["packages/sim/src/events-crawler.ts", "export type CrawlerEvent ="],
  ] as const) {
    const src = await Bun.file(join(ROOT, file)).text();
    const start = src.indexOf(decl);
    expect(start, file).toBeGreaterThan(-1);
    const union = src.slice(start);
    found.push(...[...union.matchAll(/type:\s*"([a-zA-Z]+)"/g)].map((m) => m[1] as string));
  }
  return [...new Set(found)];
}

/** One of each event, filled with values a real world would carry. */
const SAMPLES: Record<string, SimEvent> = {
  beat: { type: "beat", beat: 4 },
  waveStart: { type: "waveStart", wave: 0 },
  needWave: { type: "needWave", wave: 1 },
  fire: { type: "fire", col: 3, color: "red", lance: false },
  lanceFull: { type: "lanceFull", col: 3 },
  lanceSpilled: { type: "lanceSpilled", col: 3 },
  destroy: { type: "destroy", col: 3, row: 4, color: "cyan" },
  hole: { type: "hole", col: 2, row: 5 },
  reject: { type: "reject", col: 2, row: 5 },
  deflect: { type: "deflect", col: 2, span: 1, kind: "meteor", fromRow: 9 },
  grip: { type: "grip", player: 1, col: 1, row: 3 },
  podLoose: { type: "podLoose", col: 4, row: 2 },
  podTaken: { type: "podTaken", col: 4, kind: "ward" },
  podLost: { type: "podLost", col: 4 },
  breach: {
    type: "breach",
    col: 5,
    damage: 12,
    span: 1,
    kind: "slick",
    fromRow: 10,
    color: "red",
    beat: 8,
  },
  petal: { type: "petal", col: 3, row: 1, left: 2 },
  queenDown: { type: "queenDown", col: 3, row: 1 },
  tether: { type: "tether", col: 2, color: "cyan" },
  eyeOpen: { type: "eyeOpen", col: 5, color: "red" },
  plate: { type: "plate", col: 5, row: 2, left: 3, color: "red" },
  wardenDown: { type: "wardenDown", col: 5, row: 2 },
  mirrorShow: { type: "mirrorShow", step: "guard", index: 1, of: 3, col: 3 },
  mirrorEcho: { type: "mirrorEcho", step: "guard", index: 2, of: 3 },
  mirrorVerdict: { type: "mirrorVerdict", right: false, col: 3, reason: "bait" },
  mirrorDown: { type: "mirrorDown", col: 3 },
  mazeCommit: { type: "mazeCommit", mouth: 1, col: 5 },
  mazeProbe: { type: "mazeProbe", ring: 1, angleMilli: 2000, of: 3 },
  mazeVerdict: { type: "mazeVerdict", right: false, col: 5, reason: "silence" },
  mazeDown: { type: "mazeDown", col: 5 },
  lureHit: { type: "lureHit", col: 3, row: 4, color: "cyan" },
  lureSeen: { type: "lureSeen", col: 3 },
  strandBead: { type: "strandBead", id: 6, col: 2, row: 3, color: "red", left: 2 },
  strandSwell: { type: "strandSwell", id: 6, col: 2, row: 3, color: "cyan", left: 3 },
  strandBroke: { type: "strandBroke", col: 3, row: 5 },
  lureVanished: { type: "lureVanished", col: 3, row: 4, color: "cyan" },
  shellBreak: { type: "shellBreak", col: 3, row: 4, left: 1 },
  shellBare: { type: "shellBare", col: 3, row: 5, color: "cyan" },
  rindShed: { type: "rindShed", col: 3, row: 5, color: "red", left: 1, id: 7 },
  recoilBounce: {
    type: "recoilBounce",
    id: 7,
    col: 3,
    row: 5,
    toCol: 4,
    toRow: 3,
    color: "cyan",
    left: 2,
  },
  caromBounce: { type: "caromBounce", col: 0, row: 5, dir: 1 },
  caromCrack: { type: "caromCrack", col: 3, row: 5, span: 2, color: "red" },
  caromEject: { type: "caromEject", id: 9, col: 3, row: 5, color: "red" },
  chuteOpen: { type: "chuteOpen", col: 3, row: 0, color: "red" },
  chuteCut: { type: "chuteCut", col: 3, row: 6, color: "red", kind: "slick" },
  volleyReturn: { type: "volleyReturn", id: 4, col: 2, row: 13, left: 2 },
  volleyHatch: { type: "volleyHatch", col: 2, row: 6, kind: "slick", color: "red" },
  claspBreak: { type: "claspBreak", id: 7, col: 3, row: 5, kind: "bulb", color: "cyan" },
  veilMorph: { type: "veilMorph", col: 3, row: 4, color: "red" },
  veilRebuff: { type: "veilRebuff", col: 3, row: 4 },
  veilTorn: { type: "veilTorn", col: 3, row: 4, color: "cyan", kind: "bulb" },
  wispHop: { type: "wispHop" },
  ghostRelease: { type: "ghostRelease", col: 3, row: 4, color: "red" },
  ghostTurn: { type: "ghostTurn", col: 0, row: 3, laps: 2 },
  ghostCharge: { type: "ghostCharge", col: 0, row: 3 },
  fleetSalvo: { type: "fleetSalvo", col: 4, row: 6 },
  fleetSplash: { type: "fleetSplash", col: 4, row: 6 },
  fleetHit: { type: "fleetHit", col: 4, row: 6 },
  fleetSunk: { type: "fleetSunk", col: 4, row: 6, len: 3, left: 2 },
  fleetDown: { type: "fleetDown", col: 4, row: 6 },
  gyreBroke: { type: "gyreBroke", col: 3, row: 7 },
  crawlerBreak: { type: "crawlerBreak", col: 5, row: 10, color: "cyan" },
  crawlerBeam: { type: "crawlerBeam", col: 6, row: 10 },
  crawlerBurrow: { type: "crawlerBurrow", col: 10, row: 10, links: 4 },
};

describe("bindings", () => {
  it("has a sample for every event the simulation can report", async () => {
    expect(Object.keys(SAMPLES).sort()).toEqual((await eventTypes()).sort());
  });

  it("names a sound that exists for every event but the one that is bookkeeping", () => {
    for (const [type, e] of Object.entries(SAMPLES)) {
      const cue = cueFor(e, 7, 12);
      if (type === "needWave") {
        expect(cue).toBeNull();
        continue;
      }
      expect(cue, `${type} has no cue`).not.toBeNull();
      expect(hasSound(cue?.id ?? ""), `${type} names a sound that is not in the catalogue`).toBe(
        true,
      );
    }
  });

  /**
   * The one binding in the game whose *absence* of a pan is load-bearing.
   * A crossing ghost turns at a wall, so a cue placed where it happened would
   * tell player 1 — who is never shown the column — which edge of the field
   * it is standing at. Nothing else here needs a test of its own for a
   * missing field, and this one does, because the field being missing is a
   * decision that reads exactly like an oversight.
   */
  it("never places a ghost's turn in the stereo field", () => {
    const cue = cueFor({ type: "ghostTurn", col: 0, row: 3, laps: 1 }, 7, 12);
    expect(cue?.id).toBe("creature.ghostTurn");
    expect(cue?.pan).toBeUndefined();
  });

  it("tells the two colours apart in both directions", () => {
    expect(cueFor({ type: "fire", col: 0, color: "red", lance: false }, 7, 12)?.id).toBe(
      "ship.fireRed",
    );
    expect(cueFor({ type: "fire", col: 0, color: "cyan", lance: false }, 7, 12)?.id).toBe(
      "ship.fireCyan",
    );
    expect(cueFor({ type: "destroy", col: 0, row: 0, color: "red" }, 7, 12)?.id).toBe(
      "impact.destroyRed",
    );
    expect(cueFor({ type: "destroy", col: 0, row: 0, color: "cyan" }, 7, 12)?.id).toBe(
      "impact.destroyCyan",
    );
  });

  it("accents every fourth beat and no other", () => {
    const ids = [0, 1, 2, 3, 4].map((beat) => cueFor({ type: "beat", beat }, 7, 12)?.id);
    expect(ids).toEqual(["beat.accent", "beat.tick", "beat.tick", "beat.tick", "beat.accent"]);
  });

  /**
   * **In whole hull points, which is the unit the event carries.** The
   * threshold was `8000` — thousandths — and every damage the simulation emits
   * is under 20, so the comparison was always false and the heavy cue had
   * never played: a rock reaching the hull sounded exactly like a slick
   * brushing it. This test is the reason it survived, because `20_000` and
   * `3_000` fall on the right side of the line whichever unit is meant. The
   * fixtures are the simulation's own numbers now, so they cannot.
   */
  it("splits a breach by what it cost, not by what hit", () => {
    const rock = {
      type: "breach",
      col: 0,
      damage: DEFAULT_CONFIG.damageMeteor,
      span: 1,
      kind: "meteor",
      fromRow: 9,
      color: null,
      beat: 1,
    } as const;
    const body = { ...rock, damage: DEFAULT_CONFIG.damageCreature, kind: "slick" as const };
    expect(cueFor(rock, 7, 12)?.id).toBe("hull.breachHeavy");
    expect(cueFor(body, 7, 12)?.id).toBe("hull.breachLight");
  });

  /**
   * And the line itself, held against the numbers either side of it rather
   * than against a repeat of `15`. A body that merely arrived is light; a rock
   * and the one arrival that *aimed* at the ship are heavy. Move either
   * config value across the line and this fails, which is the whole of what
   * kept the old threshold from being noticed.
   */
  it("draws the line between an arrival and a rock", () => {
    expect(DEFAULT_CONFIG.damageCreature).toBeLessThan(HEAVY_BREACH_DAMAGE);
    expect(DEFAULT_CONFIG.damageGhostDive).toBeGreaterThanOrEqual(HEAVY_BREACH_DAMAGE);
    expect(DEFAULT_CONFIG.damageMeteor).toBeGreaterThanOrEqual(HEAVY_BREACH_DAMAGE);
    expect(DEFAULT_CONFIG.damageCarom).toBeGreaterThanOrEqual(HEAVY_BREACH_DAMAGE);
  });

  it("gives each of THE MIRROR's steps its own sound", () => {
    const steps = ["fireRed", "fireCyan", "guard", "intake", "cannonLeft", "cannonRight"] as const;
    const ids = steps.map(
      (step) => cueFor({ type: "mirrorShow", step, index: 1, of: 1, col: 0 }, 7, 12)?.id,
    );
    expect(new Set(ids).size).toBe(steps.length);
    for (const id of ids) expect(hasSound(id ?? "")).toBe(true);
  });

  it("puts a column across the stereo field without ever reaching the edge", () => {
    expect(panForCol(0, 7)).toBeCloseTo(-0.75, 6);
    expect(panForCol(3, 7)).toBeCloseTo(0, 6);
    expect(panForCol(6, 7)).toBeCloseTo(0.75, 6);
    expect(panForCol(0, 1)).toBe(0);
  });

  it("raises the pitch of something that happened further up the field", () => {
    expect(pitchForRow(0, 12)).toBeCloseTo(1.5, 6);
    expect(pitchForRow(11, 12)).toBeCloseTo(1, 6);
    expect(pitchForRow(0, 1)).toBe(1);
  });
});

/**
 * Which sound each body's events reach for, spelled out.
 *
 * The test above proves every event names *a* sound that exists, which is the
 * check that catches a typo and nothing else: swap two ids and it still
 * passes. These bindings are decisions, and several of them are decisions
 * about telling two things apart — a rind shedding is `impact.split` and not a
 * destroy because the column has not closed; a clasp breaking is
 * `creature.moult` and not a split because it has only ever had one covering.
 * A swap is exactly the change nobody would notice, and it costs the pair the
 * distinction the comment in `bind-creatures.ts` argues for.
 */
const CREATURE_IDS: Record<string, string> = {
  shellBreak: "impact.split",
  shellBare: "creature.moult",
  rindShed: "impact.split",
  recoilBounce: "impact.bounce",
  claspBreak: "creature.moult",
  lureHit: "impact.wrongTarget",
  lureSeen: "signal.lureWarn",
  lureVanished: "creature.lureFold",
  veilMorph: "signal.radarUnknown",
  veilRebuff: "impact.absorb",
  veilTorn: "creature.veilFlash",
  wispHop: "signal.bearing",
  ghostRelease: "creature.ghostRelease",
  ghostTurn: "creature.ghostTurn",
  ghostCharge: "creature.ghostCharge",
  strandBead: "impact.split",
  strandSwell: "impact.wrongTarget",
};

/**
 * The same table for THE CAROM's four, which are bound in `bind-carom.ts` —
 * their own file for their own creature, the way `events-carom.ts` is the
 * simulation's. Kept apart here rather than folded in above so the two source
 * files and the two tables stay one-to-one: a case list checked against the
 * wrong file is a check that passes while saying nothing.
 */
const CAROM_IDS: Record<string, string> = {
  caromBounce: "impact.bounce",
  caromCrack: "impact.split",
  caromEject: "creature.gateLoop",
  chuteOpen: "creature.moult",
  chuteCut: "impact.split",
};

/**
 * And the same table again for THE VOLLEY's two, bound in `bind-volley.ts`.
 * Apart for `CAROM_IDS`' reason: one table per source file, so a case list is
 * always checked against the file it came from.
 */
const VOLLEY_IDS: Record<string, string> = {
  volleyReturn: "impact.bounce",
  volleyHatch: "creature.moult",
};

describe("what one body did", () => {
  it("covers every event `creatureCue` names, so a new one cannot be left out", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-creatures.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(CREATURE_IDS).sort());
  });

  it("covers every event `caromCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-carom.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(CAROM_IDS).sort());
  });

  it("covers every event `volleyCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-volley.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(VOLLEY_IDS).sort());
  });

  for (const [type, id] of Object.entries({ ...CREATURE_IDS, ...CAROM_IDS, ...VOLLEY_IDS })) {
    it(`plays ${id} for ${type}`, () => {
      const sample = SAMPLES[type];
      expect(sample, `${type} has no sample`).toBeDefined();
      expect(cueFor(sample as SimEvent, 7, 12)?.id).toBe(id);
    });
  }
});
