import { describe, expect, test } from "bun:test";
import { controlSetForWave, setHas } from "@neon-spore/content";
import { chargeMilli, laying, step } from "@neon-spore/sim";
import { VARIANTS } from "../../versus/candidates/index.js";
import { slots } from "../../versus/variant.js";
import { VERSUS_POSES } from "../src/poses-versus.js";
import { poseForSlot } from "../src/versus-pose.js";

/**
 * Every open slot gets a pose that actually reaches the state it patches —
 * the fix for the second half of the owner's guess: the
 * sheet used to open every slot on one fixed pose regardless of which one
 * was showing, so a `cannon:shot` or `shield:ward` candidate sat beside its
 * shipped look with nothing on screen to tell them apart. `poseForSlot`
 * throws on a name `poses.ts` no longer carries, and `pose.build()` throws if
 * the pose it names never reaches its own state (`pose-kit.ts`'s `until`) —
 * together they mean a slot that regresses to the wrong pose fails here
 * rather than showing a silent nothing on the real page.
 */
describe("poseForSlot", () => {
  test("every open slot resolves to a real pose that reaches its own state", () => {
    for (const slot of slots(VARIANTS)) {
      const pose = poseForSlot(slot.slot);
      const world = pose.build();
      expect(world.tick, `${slot.slot} · ${pose.name}`).toBeGreaterThan(0);
    }
  });

  test("cannon:shot and shield:ward each get the pose that puts their own body on screen", () => {
    expect(poseForSlot("cannon:shot").name).toBe("SHOT · BEING LAID");
    expect(poseForSlot("cannon:mouth").name).toBe("SHOT · BEING LAID");
    expect(poseForSlot("shield:ward").name).toBe("WARD · DEFLECTED");
  });

  /**
   * The owner's complaint, as a test: *"is it showing the right enemies? it
   * always shows slick."* Every slot resolving to a real pose was never the
   * question — `SLICK · FALLING` is a real pose, and it is what five of the
   * nine open candidates were being compared on. What has to hold is that the
   * pose puts the slot's **own subject** on the field, and that is a different
   * assertion from the one above it.
   */
  test("no open slot falls through to the default pose", () => {
    for (const slot of slots(VARIANTS)) {
      expect(poseForSlot(slot.slot).name, slot.slot).not.toBe("SLICK · FALLING");
    }
  });

  test("each creature slot's pose actually puts that creature on the field", () => {
    const kinds: Record<string, string> = {
      "creature:meteor": "meteor",
      "creature:magnet": "magnet",
      "creature:strand": "strand",
      "crawler:pulse": "crawler",
    };
    for (const [slot, kind] of Object.entries(kinds)) {
      const world = poseForSlot(slot).build();
      expect(
        world.creatures.some((c) => c.kind === kind),
        `${slot} · ${poseForSlot(slot).name}`,
      ).toBe(true);
    }
  });

  test("the meteor is handed over with a bolt still in the air", () => {
    // The defect: `METEOR · CRATERED` spent all four shots inside `build`, so
    // the pair opened on a rock that was already full of holes and never saw
    // one open. A candidate for how a crater opens had nothing to show.
    const world = poseForSlot("creature:meteor").build();
    const bullet = world.bullets[0];
    const rock = world.creatures[0];
    expect(bullet).toBeDefined();
    expect(rock?.holes ?? 0).toBeGreaterThanOrEqual(3);
    expect((bullet?.row ?? 0) - (rock?.row ?? 0)).toBeLessThanOrEqual(2);
  });

  /**
   * `panel:action-face` is decided and gone, but its pose is not: it is the
   * only card in the gallery that draws the panel's own two faces, and the
   * wave it opens on is the only reason it can. A wave list reordered under
   * `WAVE_WITH_BOTH_FACES` would leave it drawing a band with neither button
   * on it, silently, so the assertion outlives the slot it was written for.
   */
  test("the band pose draws a wave whose control set carries both action faces", () => {
    const pose = VERSUS_POSES.find((p) => p.name === "BAND · THE ACTION FACES");
    expect(pose).toBeDefined();
    const world = pose?.build();
    const set = controlSetForWave(world?.wave ?? 0);
    expect(setHas(set, "guard"), set.id).toBe(true);
    expect(setHas(set, "intake"), set.id).toBe(true);
  });

  test("a cannon slot is handed a world with the shot still in the muzzle", () => {
    // The defect this replaces: `SHOT · IN FLIGHT` is held thirty ticks after
    // the press, so every part of firing a shot had already happened inside
    // `build` and the page showed only a bolt in transit. A candidate for how
    // a shot *leaves* had nothing to be compared against.
    const world = poseForSlot("cannon:shot").build();
    expect(laying(world)).toBe(true);
    expect(world.bullets).toHaveLength(0);
    expect(chargeMilli(world)).toBeLessThan(1000);
  });

  test("and keeps firing on its own, with nobody pressing anything", () => {
    // What `versus-pair.ts` does: step, and rebuild when the world asks for a
    // wave. Nothing else. If the loop stops, the sheet goes quiet after one
    // shot and the difference between two candidates is gone with it.
    const pose = poseForSlot("cannon:shot");
    let world = pose.build();
    let departures = 0;
    let inTheMuzzle = 0;
    const TICKS = 900;
    for (let i = 0; i < TICKS; i++) {
      step(world, []);
      departures += world.events.filter((e) => e.type === "fire").length;
      if (laying(world)) inTheMuzzle++;
      if (world.events.some((e) => e.type === "needWave")) world = pose.build();
    }
    // Roughly one every 148 ticks, and every one of them seen live rather
    // than spent inside `build`.
    expect(departures).toBeGreaterThan(4);
    // And a quarter of the time there is something in the mouth to look at.
    expect(inTheMuzzle).toBeGreaterThan(TICKS / 6);
  });

  /**
   * The owner's second complaint on the same page: *"I don't see GUARD and
   * INTAKE"* — on a page that described them in three paragraphs. A pose that
   * says which part of the screen it is judged on but never says where to
   * look is a reference picture with no caption, so every pose a slot is
   * pointed at now carries one line naming the thing itself.
   */
  test("every open slot's pose says in plain words where to look", () => {
    for (const slot of slots(VARIANTS)) {
      const pose = poseForSlot(slot.slot);
      expect(pose.lookAt, `${slot.slot} · ${pose.name}`).toBeTruthy();
    }
  });

  test("a slot with no dedicated pose still gets a real one", () => {
    const pose = poseForSlot("some:unmapped-slot");
    expect(pose.build().tick).toBeGreaterThan(0);
  });
});
