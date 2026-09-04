import { describe, expect, test } from "bun:test";
import type { Hold } from "@neon-spore/render";
import type { DragTarget } from "@neon-spore/sim";
import { FIELD_CONTROLS, TRIED_CONTROLS } from "../src/field-controls-page.js";

/**
 * The one guard the queue entry asks for: `FIELD_CONTROLS` is a hand-kept
 * list, not something read out of `packages/render/src/touch.ts` the way
 * `renderControlSets` reads `CONTROL_SETS` — `touch.ts` is a decision
 * procedure, not a data table, so there is nothing in it to iterate. What can
 * be checked mechanically is narrower: that this list still covers every
 * `Hold["kind"]` and every `DragTarget` that type declares.
 *
 * `documentedHoldKind` and `documentedDragTarget` are exhaustive switches. A
 * new member added to either union in `touch.ts` or `sim/types.ts` makes the
 * `default` branch's parameter something other than `never`, which fails to
 * *compile* — `bun run check`'s typecheck, not this file's assertions, is
 * what actually catches drift. The runtime tests below only prove the two
 * functions still agree with `FIELD_CONTROLS` today.
 *
 * What this cannot catch: a control built entirely outside `touch.ts`, the
 * way the guide's whole-screen hold is (`apps/game/src/briefing.ts`, by
 * design — see its own comment). That one has no `Hold` variant to miss, so
 * it stays honest only because a human read `briefing.ts` once and wrote it
 * down. `docs/spec/controls.md` says this in the same words.
 */

function assertNever(x: never): never {
  throw new Error(`on-field-controls.test.ts does not know this: ${JSON.stringify(x)}`);
}

/**
 * One arm per `Hold["kind"]`. `"lance"` is a panel lobe and nothing else —
 * `packages/content/src/controls.ts` already documents it — so it is named
 * here only to keep the switch exhaustive, not given a field entry.
 *
 * `"cannon"` and `"shield"` used to sit beside it, and no longer do: the same
 * two holds are now taken on the ship itself as well as on the strips
 * (`render/touch-ship.ts`), so each needs a field entry of its own however
 * fully the panel table describes the strip.
 */
function documentedHoldKind(kind: Hold["kind"]): "panel" | "field" {
  switch (kind) {
    case "lance":
      return "panel";
    case "cannon":
    case "shield":
    case "guard":
    case "shot":
    case "grip":
    case "drag":
      return "field";
    default:
      return assertNever(kind);
  }
}

function documentedDragTarget(target: DragTarget): DragTarget {
  switch (target) {
    case "mazeString":
    case "wardenTether":
    case "lidString":
      return target;
    default:
      return assertNever(target);
  }
}

describe("FIELD_CONTROLS against touch.ts's own types", () => {
  test("every field-kind Hold has a FIELD_CONTROLS entry", () => {
    const fieldKinds: Hold["kind"][] = (
      ["cannon", "shield", "guard", "shot", "grip", "drag"] as const
    ).filter((k) => documentedHoldKind(k) === "field");
    for (const kind of fieldKinds) {
      expect(
        FIELD_CONTROLS.some((c) => c.holdKind === kind),
        kind,
      ).toBe(true);
    }
  });

  test("every DragTarget has its own FIELD_CONTROLS entry", () => {
    const targets: DragTarget[] = (["mazeString", "wardenTether", "lidString"] as const).map(
      documentedDragTarget,
    );
    for (const target of targets) {
      expect(
        FIELD_CONTROLS.some((c) => c.holdKind === "drag" && c.dragTarget === target),
        target,
      ).toBe(true);
    }
  });

  test("the one entry with no Hold at all says so, and says why", () => {
    const guide = FIELD_CONTROLS.find((c) => c.holdKind === null);
    expect(guide?.name).toBe("THE GUIDE'S HOLD");
    expect(guide?.source).toContain("briefing.ts");
  });
});

describe("TRIED_CONTROLS points at the spec rather than repeating it", () => {
  test("every entry names a heading and nothing longer than a paragraph", () => {
    for (const c of TRIED_CONTROLS) {
      expect(c.specHeading.length, c.name).toBeGreaterThan(0);
      expect(c.note.length, c.name).toBeLessThan(600);
    }
  });
});
