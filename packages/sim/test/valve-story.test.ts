import { describe, expect, it } from "bun:test";
import { slowing } from "../src/slow.js";
import { valveBracing, valveJetting, valveWiping } from "../src/valve.js";
import { valveStruck } from "../src/valve-shot.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answerMovement,
  CFG,
  chord,
  freeze,
  install,
  MID,
  pin,
  pull,
  rub,
  runUntil,
  shot,
  tap,
  tick,
  toTurn,
  turnOnto,
  valve,
} from "./valve-rig.js";

/**
 * THE VALVE's story between the pins (`valve-story.ts`, §25 rows 5–6, 12–13,
 * 17–19): the first socket's jet capped with a tap, the shudder braced with
 * both thumbs, the film rubbed off, and the bare seal held open — each under
 * THE SLOW, and each run out a blow of the drum's own against the hull.
 */

/** The first pin just out, the jet blowing. */
function jet() {
  const world = install();
  toTurn(world);
  turnOnto(world);
  freeze(world);
  pull(world);
  return world;
}

/** The second pin just out, the drum shuddering. */
function brace() {
  const world = install();
  answerMovement(world);
  valveStruck(world, shot(MID, "red"));
  runUntil(world, (w) => valve(w).phase === "turn");
  turnOnto(world);
  freeze(world);
  pull(world);
  return world;
}

/** The last pin just out, the film on the face. */
function wipe() {
  const world = brace();
  chord(world);
  runUntil(world, (w) => valve(w).phase === "turn");
  turnOnto(world);
  freeze(world);
  pull(world);
  return world;
}

describe("the jet", () => {
  it("blows from the first empty socket under THE SLOW", () => {
    const world = jet();
    expect(valveJetting(valve(world))).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("is capped by either seat's tap, and the spark leaks after it", () => {
    for (const seat of [1, 2] as const) {
      const world = jet();
      const seen = tap(world, seat);
      expect(seen.has("valveCap")).toBe(true);
      expect(seen.has("valveSpark")).toBe(true);
      expect(valve(world).phase).toBe("list");
      expect(slowing(world)).toBe(false);
    }
  });

  it("is not capped by a thumb still resting from the pull", () => {
    const world = install();
    toTurn(world);
    turnOnto(world);
    freeze(world);
    tick(world, [pin(world.tick, 1, 700)]);
    expect(valve(world).phase).toBe("jet");
    tick(world, [pin(world.tick, 1, 700)]);
    expect(valve(world).phase).toBe("jet");
  });

  it("left open blows against the hull", () => {
    const world = jet();
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.valveJetBeats + 2);
    expect(seen.has("valveBlow")).toBe(true);
    expect(valveJetting(valve(world))).toBe(true);
  });
});

describe("the brace", () => {
  it("shudders once the second pin is out", () => {
    const world = brace();
    expect(valveBracing(valve(world))).toBe(true);
    expect(valve(world).phase).toBe("brace");
    expect(slowing(world)).toBe(true);
  });

  it("is stilled by both thumbs held together, and the third movement lights", () => {
    const world = brace();
    const seen = chord(world);
    expect(seen.has("valveBrace")).toBe(true);
    expect(valve(world).movement).toBe(3);
    runUntil(world, (w) => valve(w).phase === "turn");
  });

  it("is not stilled by one thumb, and run out shakes a plate against the hull", () => {
    const world = brace();
    tick(world, [pin(world.tick, 1)]);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.valveShudderBeats + 2);
    expect(seen.has("valveBrace")).toBe(false);
    expect(seen.has("valveShake")).toBe(true);
  });
});

describe("the wipe", () => {
  it("weeps a film over the face once the last pin is out", () => {
    const world = wipe();
    expect(valveWiping(valve(world))).toBe(true);
    expect(slowing(world)).toBe(true);
  });

  it("runs dry on reversals from both thumbs between them, and the seal strains", () => {
    const world = wipe();
    rub(world, 1, CFG.valveWipeRubs - 1);
    expect(valve(world).phase).toBe("wipe");
    const seen = rub(world, 2, 1);
    expect(seen.has("valveDry")).toBe(true);
    expect(seen.has("valveStrain")).toBe(true);
    expect(valve(world).phase).toBe("seal");
  });

  it("left slick smears against the hull, and the film comes back whole", () => {
    const world = wipe();
    rub(world, 1, 1);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.valveWipeBeats + 2);
    expect(seen.has("valveSmear")).toBe(true);
    expect(valve(world).wiped).toBe(0);
  });
});

describe("the seal", () => {
  it("held by both thumbs opens clean", () => {
    const world = wipe();
    rub(world, 1, CFG.valveWipeRubs);
    const seen = chord(world);
    expect(seen.has("valveSeal")).toBe(true);
    expect(valve(world).phase).toBe("open");
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("unheld blows open rough, against the hull — the face open either way", () => {
    const world = wipe();
    rub(world, 1, CFG.valveWipeRubs);
    const seen = runUntil(world, (w) => valve(w).phase === "open", CFG.valveStrainBeats + 2);
    expect(seen.has("valveRough")).toBe(true);
    expect(seen.has("valveOpen")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});
