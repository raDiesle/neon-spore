import { describe, expect, it } from "bun:test";
import {
  chrysalisGone,
  chrysalisLeft,
  chrysalisPiecesAll,
  chrysalisQuillOf,
} from "../src/chrysalis.js";
import { chrysalisStruck, chrysalisVerdict } from "../src/chrysalis-shot.js";
import {
  CFG,
  chrysalis,
  hashWorld,
  install,
  lift,
  MID,
  only,
  pullQuill,
  quill,
  rub,
  rubAt,
  runUntil,
  shield,
  shot,
  TPB,
  tick,
  toSkin,
} from "./chrysalis-rig.js";

/**
 * THE CHRYSALIS's receipts, one rule a test (`sim/chrysalis.ts`): each seat
 * rubs only its own half of the slime and keeps its turns through a lift;
 * each pulls only its own quills, and a quill let go short snaps back; a sac
 * is burst by the shield and swells again when it is not; the heart is met in
 * its column in its colour, and the wrong colour loses the wave; a skin run
 * out grows back with no hull hit; and the last skin off kills the grub.
 */

describe("THE CHRYSALIS", () => {
  it("installs every skin on, and lights the slime after it comes in", () => {
    const world = install();
    const s = chrysalis(world);
    expect(s.phase).toBe("enter");
    expect(chrysalisPiecesAll(s)).toBe(2 + 2 + 8 + 8 + 4 + 5 + 3 + 4);
    const seen = toSkin(world);
    expect(seen.has("chrysalisSkin")).toBe(true);
    expect(chrysalis(world).cursor).toBe(0);
  });

  it("wipes a half clear at its turns of the rub, and only that half", () => {
    const world = install(only("slime"));
    toSkin(world);
    const s = chrysalis(world);
    const types = rub(world, 0, 6);
    expect(types.filter((t) => t === "chrysalisRub")).toHaveLength(6);
    expect(types).toContain("chrysalisWipe");
    expect(chrysalisGone(s, 0)).toBe(true);
    expect(chrysalisGone(s, 1)).toBe(false);
  });

  it("keeps a half's turns when the thumb lifts part way", () => {
    const world = install(only("slime"));
    toSkin(world);
    const s = chrysalis(world);
    rub(world, 1, 4);
    expect(s.rubbed[1]).toBe(4);
    expect(s.rubAt[1]).toBe(-1);
    const types = rub(world, 1, 2);
    expect(types).toContain("chrysalisWipe");
    expect(chrysalisGone(s, 1)).toBe(true);
  });

  it("says a rub on the partner's half, and counts nothing on it", () => {
    const world = install(only("slime"));
    toSkin(world);
    const s = chrysalis(world);
    expect(tick(world, [rubAt(2, 0, 0)])).toContain("chrysalisWrong");
    tick(world, [rubAt(2, 0, 3)]);
    expect(s.rubbed).toEqual([0, 0]);
  });

  it("sheds the slime when both halves are clear, and lights the quills", () => {
    const world = install(only("slime", "quills"));
    toSkin(world);
    rub(world, 0, 6);
    const types = rub(world, 1, 6);
    expect(types).toContain("chrysalisShed");
    expect(chrysalis(world).phase).toBe("shed");
    toSkin(world);
    expect(chrysalis(world).steps[chrysalis(world).cursor]?.skin).toBe("quills");
  });

  it("rips a quill pulled out along its track, and snaps one let go short", () => {
    const world = install(only("quills"));
    toSkin(world);
    const s = chrysalis(world);
    expect(pullQuill(world, 0)).toContain("chrysalisRip");
    expect(chrysalisQuillOf(s, 0)).toBe(1);
    expect(pullQuill(world, 1, CFG.bastionPullMilli / 2)).toContain("chrysalisSnap");
    expect(chrysalisQuillOf(s, 1)).toBe(4);
    expect(chrysalisLeft(s)).toBe(7);
  });

  it("says a thumb on the partner's quills, and moves nothing", () => {
    const world = install(only("quills"));
    toSkin(world);
    const s = chrysalis(world);
    expect(tick(world, [quill(1, 1)])).toContain("chrysalisWrong");
    tick(world, [quill(1, 1, 900, -900)]);
    tick(world, [lift(1, 1)]);
    expect(s.pullMilli).toEqual([0, 0]);
    expect(chrysalisLeft(s)).toBe(8);
  });

  it("bursts a swelling sac under a raised shield", () => {
    const world = install(only("sacs"));
    toSkin(world);
    const s = chrysalis(world);
    expect(s.sprayBeat).toBeGreaterThan(0);
    const seen = shield(world, MID - 2);
    expect(seen.has("chrysalisBurst")).toBe(true);
    expect(chrysalisLeft(s)).toBe(3);
  });

  it("swells the same sac again when its spores came down unanswered", () => {
    const world = install(only("sacs"));
    toSkin(world);
    const s = chrysalis(world);
    const seen = runUntil(world, (w) => chrysalis(w).sprayBeat < 0);
    expect(seen.has("chrysalisSpray")).toBe(true);
    expect(chrysalisLeft(s)).toBe(4);
    const again = runUntil(world, (w) => chrysalis(w).sprayBeat >= 0, 4);
    expect(again.has("chrysalisSwell")).toBe(true);
  });

  it("takes the heart in its column and colour, and loses the wave on the other colour", () => {
    const world = install(only("heart"));
    toSkin(world);
    const s = chrysalis(world);
    expect(chrysalisVerdict(world, MID, "red")).toBe("armour");
    expect(chrysalisVerdict(world, MID - 1, "cyan")).toBe("wrong");
    chrysalisStruck(world, shot(MID - 1, "red"));
    expect(world.events.map((e) => e.type)).toContain("chrysalisHeart");
    expect(chrysalisLeft(s)).toBe(2);
    expect(chrysalisVerdict(world, MID + 2, "cyan")).toBe("target");
    chrysalisStruck(world, shot(MID + 2, "red"));
    expect(chrysalisLeft(s)).toBe(2);
    expect(world.failCause).toBe("wrongColour");
  });

  it("grows a skin run out back whole, with no hull hit, and lights it again", () => {
    const world = install(only("slime"));
    toSkin(world);
    const s = chrysalis(world);
    rub(world, 0, 6);
    const scars = world.scars.length;
    const seen = runUntil(world, (w) => chrysalis(w).phase === "regrow", 50);
    expect(seen.has("chrysalisRegrow")).toBe(true);
    expect(world.scars.length).toBe(scars);
    toSkin(world);
    expect(chrysalisLeft(s)).toBe(2);
    expect(s.rubbed).toEqual([0, 0]);
  });

  it("kills the grub after the last skin, and leaves", () => {
    const world = install(only("heart"));
    toSkin(world);
    chrysalisStruck(world, shot(MID - 1, "red"));
    chrysalisStruck(world, shot(MID + 2, "cyan"));
    chrysalisStruck(world, shot(MID, "red"));
    expect(chrysalis(world).phase).toBe("spent");
    const seen = runUntil(world, (w) => w.boss === null, CFG.chrysalisSpentBeats + 2);
    expect(seen.has("chrysalisOut")).toBe(true);
  });

  it("plays the same cocoon to the same hash", () => {
    const run = () => {
      const world = install();
      toSkin(world);
      rub(world, 0, 3);
      for (let t = 0; t < TPB * 3; t++) tick(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
