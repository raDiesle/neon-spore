import { describe, expect, it } from "bun:test";
import type { World } from "../src/index.js";
import { rimeStruck } from "../src/rime-shot.js";
import { slowing } from "../src/slow.js";
import { CFG, MID, rime, rub, runUntil, SCRIPT, shield, shot, toStep } from "./rime-rig.js";

/**
 * THE RIME's refreeze (§29 row 11): the third hit spends the core, a film
 * crawls back over it before the lens shatters, and a reflex wipe or shield
 * scatters the crack for a beat more.
 *
 * What these pin is the count a picture cannot show: how long it lasts left
 * alone, that it is a beat a scatter costs and not a touch, that a wipe on
 * either half and a shield anywhere both count, that the wrong seat's hand
 * costs nothing, and that the scatters are capped.
 */

/** The last shot in and the film starting to form. */
function toRefreeze(): World {
  const world = toStep(SCRIPT.length - 1);
  rimeStruck(world, shot("cyan"));
  runUntil(world, (w) => rime(w).phase === "refreeze");
  return world;
}

/** Beats from the refreeze opening to the lens shattering. */
function refreezeLength(world: World): number {
  const opened = rime(world).phaseBeat;
  runUntil(world, (w) => rime(w).phase === "shattered");
  return world.beat - opened;
}

describe("THE RIME's refreeze", () => {
  it("opens under THE SLOW once the last shot is in, the core spent", () => {
    const world = toRefreeze();
    expect(world.events.some((e) => e.type === "rimeRefreeze")).toBe(true);
    expect(world.events.some((e) => e.type === "rimeShatter")).toBe(false);
    expect(slowing(world)).toBe(true);
    expect(world.slowAsks).toBe(true);
    expect(world.slowHolds).toBe(true);
    expect(rime(world).jars).toBe(0);
  });

  it("left alone, runs its beats, then shatters and lets THE SLOW go", () => {
    const world = toRefreeze();
    const seen = runUntil(world, (w) => rime(w).phase === "shattered");
    expect(seen.has("rimeShatter")).toBe(true);
    expect(seen.has("rimeScatter")).toBe(false);
    const world2 = toRefreeze();
    expect(refreezeLength(world2)).toBe(CFG.rimeRefreezeBeats);
    expect(slowing(world2)).toBe(false);
  });

  it("scattered by a wipe on either half, takes a beat longer", () => {
    for (const side of ["left", "right"] as const) {
      const world = toRefreeze();
      rub(world, side, true);
      expect(rub(world, side, true, 1)).toContain("rimeScatter");
      rub(world, side, false);
      expect(refreezeLength(world)).toBe(CFG.rimeRefreezeBeats + 1);
    }
  });

  it("scattered by a shield wherever it stands, takes a beat longer", () => {
    for (const col of [MID, 0]) {
      const world = toRefreeze();
      expect(shield(world, col).has("rimeScatter")).toBe(true);
      expect(refreezeLength(world)).toBe(CFG.rimeRefreezeBeats + 1);
    }
  });

  it("costs one beat for a whole rub and a shield in one beat, not one a touch", () => {
    const world = toRefreeze();
    const beat = world.beat;
    let scatters = 0;
    rub(world, "left", true);
    for (let n = 1; n <= 3; n++)
      scatters += rub(world, "left", true, n).filter((t) => t === "rimeScatter").length;
    if (shield(world).has("rimeScatter")) scatters++;
    rub(world, "left", false);
    expect(world.beat).toBe(beat);
    expect(scatters).toBe(1);
    expect(rime(world).jars).toBe(1);
  });

  it("costs nothing for a thumb put down still, or the wrong seat's hand", () => {
    const world = toRefreeze();
    rub(world, "left", true);
    rub(world, "left", false);
    rub(world, "right", true, 0, 1);
    rub(world, "right", true, 3, 1);
    rub(world, "left", true, 3, 2);
    expect(rime(world).jars).toBe(0);
    expect(refreezeLength(world)).toBe(CFG.rimeRefreezeBeats);
  });

  it("takes as many scatters as it allows, one a beat, and no more", () => {
    const world = toRefreeze();
    const opened = rime(world).phaseBeat;
    let n = 0;
    while (rime(world).phase === "refreeze") {
      const at = world.beat;
      rub(world, "left", true, ++n);
      runUntil(world, (w) => w.beat > at || rime(w).phase !== "refreeze");
    }
    expect(rime(world).phase).toBe("shattered");
    expect(rime(world).jars).toBe(CFG.rimeRefreezeScatters);
    expect(world.beat - opened).toBe(CFG.rimeRefreezeBeats + CFG.rimeRefreezeScatters);
  });
});
