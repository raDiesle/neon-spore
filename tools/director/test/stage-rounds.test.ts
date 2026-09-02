import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTROL_SETS, control, panelForm } from "@neon-spore/content";
import { Glob } from "bun";

/**
 * Every slab a round draws is answered by a listener in the director.
 *
 * **This test exists because prose failed twice.** `stage-touch.ts` routes the
 * canvas through the game's own `touchDown`, which knows about the field and
 * nothing else, so a round's own buttons do nothing at all unless a
 * `stage-<round>.ts` names them. THE GAUGE shipped that way and the owner
 * reported it as "i cannot test the gauge"; `stage-snake.ts` was then written
 * with a paragraph at the top saying so, "before the same thing can be said
 * about this round" — and PINBALL shipped that way anyway, and the owner
 * reported that FIRE and SET did nothing.
 *
 * A warning in a header is read by whoever is already looking at the file. The
 * person adding the twelfth round will be looking at `waves.ts` and a new
 * boss, and the only thing that reaches them there is a failing test.
 *
 * **The check is by control id, not by round.** A listener that exists but has
 * forgotten one of its four buttons is the same defect wearing a smaller hat,
 * and naming the id is what makes the failure say which button.
 */

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

/** Every `stage-*.ts` listener's source, concatenated. Where an id must appear. */
const LISTENERS = await (async () => {
  const glob = new Glob("stage-*.ts");
  const parts: string[] = [];
  for await (const file of glob.scan({ cwd: DIR })) {
    parts.push(await Bun.file(join(DIR, file)).text());
  }
  return parts.join("\n");
})();

/** Every slab in the game, as `set id` pairs — a round's whole panel. */
function slabIds(): { set: string; id: string }[] {
  const out: { set: string; id: string }[] = [];
  for (const set of CONTROL_SETS) {
    if (panelForm(set) !== "slabs") continue;
    for (const id of set.controls) {
      if (control(id).form === "slab") out.push({ set: set.id, id });
    }
  }
  return out;
}

describe("the director answers every round's slabs", () => {
  it("finds at least one slab panel to check", () => {
    // A guard on the guard: a change that stopped `panelForm` reporting slabs
    // would make every assertion below vacuous and say nothing about it.
    expect(slabIds().length).toBeGreaterThan(3);
  });

  it.each(slabIds())("$set · $id is named by a stage listener", ({ set, id }) => {
    expect(
      LISTENERS.includes(`"${id}"`),
      `control set ${set} draws ${id}, and no tools/director/src/stage-*.ts names it — ` +
        "a slab no listener answers is a button that does nothing when the owner clicks it",
    ).toBe(true);
  });
});
