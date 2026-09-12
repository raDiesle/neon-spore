import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { CREATURES, controlSetForWave, setHas } from "@neon-spore/content";
import { chargeMilli, laying, step, volleyPlatesLeft } from "@neon-spore/sim";
import { VARIANTS } from "../../versus/candidates/index.js";
import { slots } from "../../versus/variant.js";
import { POSE_GROUPS } from "../src/poses.js";
import { VERSUS_POSES } from "../src/poses-versus.js";
import { VOLLEY_POSE } from "../src/poses-volley.js";
import { poseForSlot } from "../src/versus-pose.js";

/** A pose by its name, for the tests about a pose whose slot has closed. */
function poseNamed(name: string) {
  const pose = POSE_GROUPS.flatMap((g) => g.poses).find((p) => p.name === name);
  if (!pose) throw new Error(`no pose called ${name}`);
  return pose;
}

/** The rows of `SLOT_POSE`, read off the source rather than the module: the
 * map is not exported, and the literal is what the two tests below are about. */
async function slotPoseRows(): Promise<string[]> {
  const source = await Bun.file(join(import.meta.dirname, "..", "src", "versus-pose.ts")).text();
  const start = source.indexOf("const SLOT_POSE");
  expect(start).toBeGreaterThan(-1);
  // Every slot decided leaves `{}` on the one line — no rows at all, the state
  // the map has been in since 12 September 2026.
  if (/const SLOT_POSE: Record<string, string> = \{\};/.test(source)) return [];
  const end = source.indexOf("\n};", start);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end).split("\n").slice(1);
}

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
/**
 * The creature a slot's pose has to put on the field, or `null` where the slot
 * is not about one body.
 *
 * **Derived, because the hand-kept version exempted whatever nobody
 * remembered.** This check began as a literal `Record` of four slots, and a
 * slot missing from it was not a failure and not a warning — it was simply not
 * checked, so the guard for the owner's complaint that every slot showed a
 * slick covered whichever slots somebody had added and silently let the rest
 * through. The list was extended by hand twice before it was written down.
 *
 * A slot is `area:thing`, and both halves are read: an area that names a body
 * (`crawler:pulse`, `warden:plates`) is that body, and the area `creature`
 * hands the question to the thing (`creature:meteor`). `CREATURES` is the
 * roster and is keyed by every `CreatureKind`, so "is this a body" is asked of
 * the bestiary rather than of a second list kept here.
 */
const NOT_ONE_BODY: Record<string, null> = {
  // A skin every living body wears, and a break every living body comes apart
  // into. Both are `creature:` slots whose second half is a *material* rather
  // than a kind, so there is no one creature a pose could be asked for — and
  // they are written here rather than left to fall through, because falling
  // through is the defect this whole function replaces.
  "creature:skin": null,
  "creature:break": null,
};

function isKind(name: string): boolean {
  return Object.hasOwn(CREATURES, name);
}

function subjectOf(slot: string): string | null {
  if (Object.hasOwn(NOT_ONE_BODY, slot)) return null;
  const [area, thing] = slot.split(":");
  if (area !== undefined && isKind(area)) return area;
  if (area !== "creature") return null;
  // A `creature:` slot names its body in the second half, and one that does
  // not has to say so above. Handing back the word unresolved is deliberate:
  // no creature has that kind, so the assertion fails naming the slot.
  return thing ?? null;
}

describe("poseForSlot", () => {
  test("every open slot resolves to a real pose that reaches its own state", () => {
    for (const slot of slots(VARIANTS)) {
      const pose = poseForSlot(slot.slot);
      const world = pose.build();
      expect(world.tick, `${slot.slot} · ${pose.name}`).toBeGreaterThan(0);
    }
  });

  /**
   * The header always said a decided slot's row goes with its candidates, and
   * nothing did it: by 10 September 2026 the map carried a row for every slot
   * that had ever closed — `cannon:shot`, `shield:ward`, `creature:strand`,
   * `slick:hit` and on, twice as many rows as open slots. `bun run versus
   * adopt` and `drop` take the row now (`tools/versus/pose-row.ts`), and this
   * is what keeps a row from outliving its slot by any other route.
   */
  test("every row in SLOT_POSE names a slot that still has a candidate", async () => {
    const open = new Set(slots(VARIANTS).map((s) => s.slot));
    for (const row of await slotPoseRows()) {
      const slot = /^ {2}"([^"]+)":/.exec(row)?.[1] ?? row;
      expect(
        open.has(slot),
        `${slot} — no candidate directory names it; its row goes with the slot`,
      ).toBe(true);
    }
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
    const checked: string[] = [];
    for (const slot of slots(VARIANTS)) {
      const kind = subjectOf(slot.slot);
      if (kind === null) continue;
      checked.push(slot.slot);
      const pose = poseForSlot(slot.slot);
      expect(
        pose.build().creatures.some((c) => c.kind === kind),
        `${slot.slot} · ${pose.name}`,
      ).toBe(true);
    }
    // A derivation that quietly matches nothing is the same silence in a
    // different place: the day `slots` or the naming changes shape, a loop
    // that ran zero times would pass. So an empty run has to be *explained*
    // by the open slots themselves — every one is a panel, a surface or a
    // slot `NOT_ONE_BODY` names — which is how it stood on 12 September 2026
    // when `creature:throb`, the last creature slot, was decided.
    if (checked.length === 0) {
      for (const slot of slots(VARIANTS)) {
        expect(
          slot.slot.startsWith("creature:") ? Object.hasOwn(NOT_ONE_BODY, slot.slot) : true,
          `${slot.slot} names a creature and was not checked`,
        ).toBe(true);
      }
    }
  });

  test("the meteor is handed over unmarked, with a bolt still in the air", () => {
    // The defect this began as: `METEOR · CRATERED` spent all four shots
    // inside `build`, so the pair opened on a rock already full of holes and
    // never saw one open. The fix left three of them inside `build` and only
    // the fourth on screen, which the owner met on 8 September 2026 with the
    // obvious question — what does the rock look like before anything hits it.
    // Nothing is fired inside `build` now: `holes` is 0 at hand-over and every
    // crater this rock ever has opens where somebody can see it. The slot is
    // decided and gone (12 September 2026); the pose stays in the gallery, so
    // the assertion is made on it by name, the way the band pose's is below.
    const world = poseNamed("METEOR · A SHOT ARRIVING").build();
    const bullet = world.bullets[0];
    const rock = world.creatures[0];
    expect(bullet).toBeDefined();
    expect(rock?.holes ?? 0).toBe(0);
    // Eleven rows and not two: a bolt covers twelve tiles a beat, so two rows
    // of separation is a tenth of a second and nobody sees the clean rock at
    // all. This is the assertion that the *unmarked* state is on screen long
    // enough to be looked at.
    const gap = (bullet?.row ?? 0) - (rock?.row ?? 0);
    expect(gap).toBeLessThanOrEqual(11);
    expect(gap).toBeGreaterThan(6);
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

  test("the shot pose hands over a world with the shot still in the muzzle", () => {
    // The defect this replaces: `SHOT · IN FLIGHT` is held thirty ticks after
    // the press, so every part of firing a shot had already happened inside
    // `build` and the page showed only a bolt in transit. A candidate for how
    // a shot *leaves* had nothing to be compared against. `cannon:shot` is
    // decided and its row gone; the pose is asked for by name, as the band
    // test above does, because the assertion outlives the slot.
    const world = poseNamed("SHOT · BEING LAID").build();
    expect(laying(world)).toBe(true);
    expect(world.bullets).toHaveLength(0);
    expect(chargeMilli(world)).toBeLessThan(1000);
  });

  test("and keeps firing on its own, with nobody pressing anything", () => {
    // What `versus-pair.ts` does: step, and rebuild when the world asks for a
    // wave. Nothing else. If the loop stops, the sheet goes quiet after one
    // shot and the difference between two candidates is gone with it.
    const pose = poseNamed("SHOT · BEING LAID");
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

  /**
   * The volley's pose keeps a hand on the shield, and the whole point of it
   * is that every ward happens on screen: a pose that lost its hand would
   * show `creature:volley` a whole ball falling and never the skeleton the
   * slot is about. So the hand is stepped the way the pair steps it, and the
   * count has to come down within the pose's own cadence. The slot was decided
   * on 11 September 2026 and its row is gone; the pose stays on the POSES page
   * and is held to the same promise by name.
   */
  test("the volley is warded on the page, not inside build", () => {
    const pose = VOLLEY_POSE;
    const world = pose.build();
    const whole = world.creatures.find((c) => c.kind === "volley");
    expect(whole).toBeDefined();
    expect(volleyPlatesLeft(whole as never)).toBe(world.cfg.volleyPlates);
    let fewest = world.cfg.volleyPlates;
    const ticks = Math.round((pose.cadenceSeconds ?? 0) * world.cfg.tickHz);
    for (let i = 0; i < ticks; i++) {
      step(world, pose.hand?.(world) ?? []);
      const v = world.creatures.find((c) => c.kind === "volley");
      if (v) fewest = Math.min(fewest, volleyPlatesLeft(v));
    }
    expect(fewest).toBeLessThan(world.cfg.volleyPlates);
  });

  test("a slot with no dedicated pose still gets a real one", () => {
    const pose = poseForSlot("some:unmapped-slot");
    expect(pose.build().tick).toBeGreaterThan(0);
  });

  /**
   * The map is rows and nothing else. It carried a paragraph over every row
   * once; three lanes landing slots on one afternoon each added a row and a
   * paragraph, and a rebase that kept two of them put the trunk over the line
   * ceiling. The reason a slot is judged on a pose goes on that pose's own
   * docstring in `poses-*.ts`, so this reads the literal and refuses a comment
   * inside it — a rule called here rather than remembered by the next lane.
   */
  test("SLOT_POSE carries rows alone — a slot's reason lives on its pose", async () => {
    const rows = await slotPoseRows();
    for (const row of rows) {
      expect(row.trim().startsWith("//") || row.includes("/*"), row).toBe(false);
      expect(row, row).toMatch(/^ {2}"[a-z-]+:[a-z-]+": ".+",$/);
    }
    // The map shrinks as slots are decided — eleven were on 11 September 2026
    // and none by the next evening — so there is no floor: a row per open
    // slot, and an empty map when there is no open slot.
    expect(rows.length).toBe(slots(VARIANTS).length);
  });
});
