import { describe, expect, test } from "bun:test";
import { authorsBodyColor, CREATURES, queueFromWave, type WaveEntry } from "@neon-spore/content";
import { type CreatureKind, fallTilesPerBeat, isMeteorKind, spanOf } from "@neon-spore/sim";
import { BRUSHES } from "../src/brushes.js";
import {
  authorsBody,
  bodyOf,
  isTieredRock,
  METEOR_SIZES,
  METEOR_SPEEDS,
  meteorSize,
  meteorSpeed,
  setBody,
  setMeteorSize,
  setMeteorSpeed,
} from "../src/entry-fields.js";
import { brushOf, emptyWave, paint } from "../src/state.js";

/**
 * The palette used to carry five meteor buttons, and the wave could not say
 * what colour the body inside a shell was. Both facts moved onto the entry.
 * This file holds the two halves of that to being true at once: the palette is
 * one button, and everything the five buttons used to express is still
 * expressible — which is the failure mode of a consolidation.
 */

const at = (wave: ReturnType<typeof emptyWave>): WaveEntry => {
  const entry = wave.entries[0];
  if (!entry) throw new Error("nothing was painted");
  return entry;
};

describe("the palette carries one meteor", () => {
  test("METEOR, TORCH and VEER, and no tier buttons beside them", () => {
    // The two rocks with brushes of their own are the two that are not tiers:
    // a torch has a speed nothing else has, and a veer changes lane. The five
    // tiers are one METEOR with a number under the map.
    const rocks = BRUSHES.filter((b) => {
      const kind = b.brush as CreatureKind;
      return kind in CREATURES && isMeteorKind(kind as CreatureKind);
    });
    expect(BRUSHES.filter((b) => b.brush === "rock")).toHaveLength(1);
    expect(BRUSHES.filter((b) => b.brush === "torch")).toHaveLength(1);
    expect(BRUSHES.filter((b) => b.brush === "veer")).toHaveLength(1);
    expect(rocks.map((b) => b.brush).sort()).toEqual(["torch", "veer"]);
  });

  test("every speed tier reads back as that one brush", () => {
    for (const speed of METEOR_SPEEDS) {
      const wave = emptyWave();
      paint(wave, 0, 3, "rock");
      setMeteorSpeed(at(wave), speed);
      expect(brushOf(at(wave))).toBe("rock");
    }
  });

  test("the torch is not a tier and keeps its own brush", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "torch");
    expect(brushOf(at(wave))).toBe("torch");
    expect(isTieredRock(at(wave))).toBe(false);
  });

  test("THE VEER is not a tier either, so the speed dial cannot overwrite it", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "veer");
    expect(brushOf(at(wave))).toBe("veer");
    expect(isTieredRock(at(wave))).toBe(false);
  });
});

describe("a rock's speed", () => {
  test("is the tier, and the tier is tiles a beat", () => {
    for (const speed of METEOR_SPEEDS) {
      const wave = emptyWave();
      paint(wave, 0, 3, "rock");
      setMeteorSpeed(at(wave), speed);
      expect(meteorSpeed(at(wave))).toBe(speed);
      // The number in the panel is not a label the tool made up: it is what
      // the simulation will actually move the rock by.
      expect(fallTilesPerBeat(at(wave).kind as CreatureKind)).toBe(speed);
    }
  });

  test("survives a change of width, and the width survives a change of speed", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "rock");
    setMeteorSize(at(wave), 2);
    setMeteorSpeed(at(wave), 4);
    expect(meteorSize(at(wave))).toBe(2);
    expect(meteorSpeed(at(wave))).toBe(4);
  });
});

describe("a rock's width", () => {
  test("is one tile until it is asked to be two", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "rock");
    expect(meteorSize(at(wave))).toBe(1);
    for (const size of METEOR_SIZES) {
      setMeteorSize(at(wave), size);
      expect(meteorSize(at(wave))).toBe(size);
    }
  });

  test("writes no field at all at one tile, so an unwidened wave saves unchanged", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "rock");
    setMeteorSize(at(wave), 2);
    setMeteorSize(at(wave), 1);
    expect(at(wave).size).toBeUndefined();
  });

  test("reaches the field: the queue carries the span the sim reads", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "rock");
    setMeteorSize(at(wave), 2);
    const queue = queueFromWave(wave, 11);
    expect(queue[0] && spanOf(queue[0])).toBe(2);
  });
});

describe("the kinds whose colour a wave authors", () => {
  const bodied = (Object.keys(CREATURES) as CreatureKind[]).filter(authorsBodyColor);

  test("is exactly the eleven", () => {
    // The lure's disguise, the shell's core, the clasp's prisoner, the dart's
    // colour, the ghost's, the echo's, the rind's, the lid's lens, the
    // recoil's first body, the carom's prisoner and the volley's — eleven
    // bodies whose colour is a fact about one arrival rather than about the
    // kind. The recoil's is the shortest-lived of them: an author writes which
    // trigger answers it *first*, and every bounce turns it over from there
    // (`recoilStruck`). The carom's is the opposite — it never changes and
    // then stops existing, because what the shot leaves behind is a rock with
    // no colour at all. The volley's is that one read backwards: it never
    // changes either, and it stops being sealed in rock instead of becoming
    // it (`hatchVolley`).
    expect(new Set(bodied)).toEqual(
      new Set([
        "lure",
        "shell",
        "clasp",
        "dart",
        "ghost",
        "echo",
        "rind",
        "recoil",
        "lid",
        "carom",
        "volley",
      ]),
    );
  });

  test("is never offered on the throb, which is answered by the beat and not a colour", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "throb");
    expect(authorsBody(at(wave))).toBe(false);
    expect(at(wave).color).toBeNull();
  });

  for (const kind of bodied) {
    test(`${kind} arrives on the slick and can be switched to the bulb`, () => {
      const wave = emptyWave();
      paint(wave, 0, 3, kind);
      expect(authorsBody(at(wave))).toBe(true);
      expect(bodyOf(at(wave))).toBe("slick");
      setBody(at(wave), "bulb");
      expect(bodyOf(at(wave))).toBe("bulb");
      // Still the same creature: the colour names the body, it does not
      // replace the kind.
      expect(brushOf(at(wave))).toBe(kind);
    });
  }

  test("a lure's disguise follows the body it was given, with nothing written twice", () => {
    const wave = emptyWave();
    paint(wave, 0, 3, "lure");
    setBody(at(wave), "bulb");
    // `wears` is deliberately not stored — `queueFromWave` derives it from the
    // colour, so the tool cannot author a lure whose colour and body disagree.
    expect(at(wave).wears).toBeUndefined();
    expect(queueFromWave(wave, 11)[0]?.wears).toBe("bulb");
  });
});
