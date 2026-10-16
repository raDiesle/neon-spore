import { describe, expect, it } from "bun:test";
import { untaughtComplaint, untaughtKeys, WAVES, type Wave, waveKeys } from "../src/index.js";

/**
 * **Nothing is used before it is taught** (`wave-keys.ts`), on the list on
 * disk and on lists moved about the way a generator might move them. Waves are
 * found by id, never by index: an act gaining a wave moves every number after
 * it.
 */
const byId = (id: string): Wave => {
  const w = WAVES.find((x) => x.id === id);
  if (!w) throw new Error(`no wave ${id}`);
  return w;
};

/** The list with `id` moved to stand just before `before`. */
function moved(id: string, before: string): Wave[] {
  const wave = byId(id);
  const out = WAVES.filter((w) => w !== wave);
  out.splice(
    out.findIndex((w) => w.id === before),
    0,
    wave,
  );
  return out;
}

describe("nothing used before it is taught", () => {
  it("holds for the list on disk", () => {
    expect(untaughtComplaint(WAVES)).toBeNull();
  });

  it("reads a wave's mechanics, its panel, every button on it and the hold", () => {
    const keys = waveKeys(byId("theBrood"));
    expect(keys).toContain("brood");
    expect(keys).toContain("panel standard2");
    expect(keys).toContain("button fireCyan");
    expect(keys).not.toContain("the hold");
    expect(waveKeys(byId("theLance"))).toContain("the hold");
  });

  it("refuses a boss moved ahead of the wave that teaches what it carries, guide or not", () => {
    // THE BROOD has a guide; it is about the sac, not about the cyan button.
    const found = untaughtKeys(moved("theBrood", "cyan"));
    expect(found.map((u) => u.name)).toEqual(["THE BROOD"]);
    expect(found[0]?.keys).toEqual(["bulb", "panel standard2", "button fireCyan"]);
  });

  it("reads the bodies a boss puts on the field as keys its wave uses", () => {
    // THE BROOD's buds drop as slicks and bulbs. Its panel is taught early,
    // but a bulb is not carried by THE BROOD: without `spawns` the wave's
    // keys were `brood` and its panel, and a boss whose panel came first
    // would hand the pair a body no wave had taught.
    const keys = waveKeys(byId("theBrood"));
    expect(keys).toContain("slick");
    expect(keys).toContain("bulb");
    // On the panel taught just before CYAN, ahead of CYAN: only the bulb.
    const cyan = WAVES.findIndex((w) => w.id === "cyan");
    const early = { ...byId("theBrood"), controls: WAVES[cyan - 1]?.controls };
    const list = WAVES.filter((w) => w.id !== "theBrood");
    list.splice(
      list.findIndex((w) => w.id === "cyan"),
      0,
      early,
    );
    expect(untaughtKeys(list).find((u) => u.name === "THE BROOD")?.keys).toEqual(["bulb"]);
  });

  it("lets a boss introduce what is its own", () => {
    // THE BROOD is the first and only wave to carry its own sac, and says so
    // by being fought; moved ahead of nothing it needs, it is allowed.
    expect(untaughtKeys(WAVES).some((u) => u.name === "THE BROOD")).toBe(false);
    expect(waveKeys(byId("theBrood"))).toContain("brood");
  });

  it("refuses an unguided wave moved ahead of its lesson", () => {
    // TWO COLOURS teaches nothing; in front of CYAN it would hand the pair a
    // bulb no wave had shown them.
    const found = untaughtKeys(moved("twoColours", "cyan"));
    expect(found[0]?.name).toBe(byId("twoColours").name);
    expect(found[0]?.keys).toContain("bulb");
  });
});
