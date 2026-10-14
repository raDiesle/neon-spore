import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TALKER } from "@neon-spore/render";
import {
  faultsNow,
  gripsCreature,
  guardArmed,
  handoverLeft,
  ticksSinceGuard,
  type World,
} from "@neon-spore/sim";
import { groupRows } from "../src/helpers-def.js";
import { HELPER_GROUPS, helperPose } from "../src/helpers-page.js";
import {
  BEATBOX_UP,
  EMPTY_FIELD,
  FENCE_UP,
  HUSK_UP,
  LOCKED,
  LURE_UP,
  MAGNET_UP,
  MINE_BLIND,
  MINE_UP,
  MOULT_UP,
  PUSHED_ONCE,
  STRIP_BUSY,
  TORCH_COMING,
  VEIL_UP,
  WISP_UP,
} from "../src/helpers-poses.js";
import { CANNON_FAULT, CODEX_ON, FLIP_ON, SHIELD_FAULT } from "../src/helpers-poses-faults.js";
import { HANDOVER_PLATE, VERDICT_GIVEN } from "../src/helpers-poses-marks.js";
import {
  GUARD_FADING,
  GUARD_LIT,
  PUSH_FLASH,
  THROAT_SHIELD,
  VOLLEY_TURNED,
} from "../src/helpers-poses-shield.js";
import { SIREN_GROUP, sirenRoster } from "../src/helpers-siren.js";
import {
  SIREN_DARK,
  SIREN_EARLY,
  SIREN_FENCE_OPEN,
  SIREN_FENCE_SHUT,
  SIREN_HARPOON,
  SIREN_MINE_P1,
  SIREN_TRADED,
  SIREN_TWO_WORDS,
} from "../src/helpers-siren-poses.js";
import { SIREN_STATES, sirenLit, sirenReads } from "../src/helpers-siren-states.js";
import type { Pose } from "../src/pose-kit.js";
import { poseNamed } from "../src/poses.js";

/**
 * CONTROLS › HELPERS: every row's picture is a pose that exists and reaches
 * the moment its helper is drawn in, and every file a row names as its
 * source is a file. The drawing itself is a canvas and belongs to a browser;
 * what is drawn is a world, and a world is testable.
 */

const RENDER_SRC = join(import.meta.dir, "../../../packages/render/src");
const ROWS = HELPER_GROUPS.flatMap(groupRows);

describe("CONTROLS › HELPERS", () => {
  test("every gallery pose a row names is in the gallery", () => {
    for (const h of ROWS) {
      if (typeof h.pose !== "string") continue;
      expect(() => poseNamed(h.pose as string), `${h.name} → ${h.pose}`).not.toThrow();
    }
  });

  test("every row resolves to a pose drawn as the screen it names", () => {
    for (const h of ROWS) expect(helperPose(h).role, h.name).toBe(h.role);
  });

  test("names are unique, so the contents list has one entry each", () => {
    const names = ROWS.map((h) => h.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every source file a row names exists in packages/render/src", () => {
    for (const h of ROWS) {
      const files = h.source.match(/[a-z0-9-]+\.ts/g) ?? [];
      expect(files.length, h.name).toBeGreaterThan(0);
      for (const f of files) expect(existsSync(join(RENDER_SRC, f)), `${h.name} → ${f}`).toBe(true);
    }
  });

  test("the page has its tab and the tab has its page", () => {
    const html = readFileSync(join(import.meta.dir, "../index.html"), "utf8");
    expect(html).toContain('<button type="button" data-tab="helpers">HELPERS</button>');
    expect(html).toContain('id="ctl-helpers"');
    expect(html).toContain('data-contents="helpersBody"');
  });
});

describe("THE SIREN's roster", () => {
  test("names every creature that lights the siren, and stands just before the split", () => {
    const named = new Set(sirenRoster().map((l) => l.what));
    for (const [kind, talker] of Object.entries(TALKER))
      if (talker !== null) expect(named.has(`THE ${kind.toUpperCase()}`), kind).toBe(true);
    const at = HELPER_GROUPS.indexOf(SIREN_GROUP);
    expect(HELPER_GROUPS[at + 1]?.title).toBe("WHAT ONE SCREEN HAS AND THE OTHER HAS NOT");
  });

  test("a group holds rows, smaller groups or a table, never none", () => {
    const walk = (g: (typeof HELPER_GROUPS)[number]): void => {
      const held = (g.rows?.length ?? 0) + (g.parts?.length ?? 0) + (g.table ? 1 : 0);
      expect(held, g.title).toBeGreaterThan(0);
      for (const p of g.parts ?? []) walk(p);
    };
    for (const g of HELPER_GROUPS) walk(g);
  });
});

describe("the frames built for HELPERS reach their moment", () => {
  const kinds = (p: { build: () => World }) => p.build().creatures.map((c) => c.kind);

  test("one body of each kind is on the field", () => {
    expect(kinds(LURE_UP)).toContain("lure");
    expect(kinds(VEIL_UP)).toContain("veil");
    expect(kinds(WISP_UP)).toContain("wisp");
    expect(kinds(MINE_UP)).toContain("mine");
    expect(kinds(MAGNET_UP)).toContain("magnet");
    expect(kinds(MINE_BLIND)).toContain("mine");
    expect(kinds(FENCE_UP)).toContain("fence");
    expect(kinds(MOULT_UP)).toContain("moult");
    expect(kinds(BEATBOX_UP)).toContain("beatbox");
    expect(HUSK_UP.build().pods[0]?.husk).toBe(true);
  });

  test("the gunsight's field is empty and its wave still running", () => {
    const w = EMPTY_FIELD.build();
    expect(w.creatures.length).toBe(0);
    expect(w.spawned).toBeLessThan(w.queue.length);
  });

  test("the torch and the strip's arrivals are still on the strip", () => {
    for (const p of [TORCH_COMING, STRIP_BUSY]) {
      const w = p.build();
      expect(w.creatures.length, p.name).toBe(0);
      expect(w.spawned, p.name).toBeLessThan(w.queue.length);
    }
  });

  test("the pushed body has been pushed, and the locked one is in player 1's hand", () => {
    expect(PUSHED_ONCE.build().creatures[0]?.pushed).toBe(true);
    const w = LOCKED.build();
    const c = w.creatures[0];
    expect(c).toBeDefined();
    expect(gripsCreature(w, 1, c?.id ?? -1)).toBe(true);
  });

  test("THE SHIELD's frames end on their moment", () => {
    const said = (w: World) => w.events.map((e) => e.type);
    expect(said(PUSH_FLASH.build())).toContain("shieldPush");
    expect(said(VOLLEY_TURNED.build())).toContain("volleyReturn");
    expect(guardArmed(GUARD_LIT.build())).toBe(true);
    // Shut, and only just: the button's fade is a few ticks long (`guard-lapse.ts`).
    const fading = GUARD_FADING.build();
    expect(guardArmed(fading)).toBe(false);
    expect(ticksSinceGuard(fading)).toBeLessThan(6);
    const throat = THROAT_SHIELD.build().boss;
    expect(throat?.kind === "throat" && throat.mode).toBe("shield");
  });

  test("the verdict's frame ends on the judging tick, the plate's inside the trade", () => {
    expect(VERDICT_GIVEN.build().events.map((e) => e.type)).toContain("capstanBright");
    expect(handoverLeft(HANDOVER_PLATE.build())).toBeGreaterThan(0);
  });

  test("each fault's frame has its fault in force", () => {
    const pairs = [
      [CANNON_FAULT, "cannon"],
      [SHIELD_FAULT, "shield"],
      [CODEX_ON, "codex"],
      [FLIP_ON, "flip"],
    ] as const;
    for (const [pose, kind] of pairs)
      expect(
        faultsNow(pose.build()).map((f) => f.kind),
        pose.name,
      ).toContain(kind);
  });
});

describe("THE SIREN's every state", () => {
  test("each state's world puts the siren in the state its row says", () => {
    const seen = new Set<string>();
    for (const s of SIREN_STATES) {
      const w = s.pose.build();
      const lit = sirenLit(s, w);
      const words = [sirenReads(s, w, "p1"), sirenReads(s, w, "p2")];
      seen.add(s.pose.name);
      // Only the dark state is unlit, and an unlit siren writes nothing.
      if (s.pose === SIREN_DARK) {
        expect(lit, s.pose.name).toBeNull();
        expect(words, s.pose.name).toEqual([null, null]);
      } else {
        expect(lit === null ? false : lit.p1 || lit.p2, s.pose.name).toBe(true);
        expect(
          words.some((x) => x !== null),
          s.pose.name,
        ).toBe(true);
      }
    }
    expect(seen.size).toBe(SIREN_STATES.length);
  });

  test("the cases the field picks say what their rows say they do", () => {
    const read = (p: Pose, seat: "p1" | "p2") => {
      const s = SIREN_STATES.find((x) => x.pose === p);
      if (!s) throw new Error(p.name);
      return sirenReads(s, p.build(), seat);
    };
    expect(read(SIREN_FENCE_OPEN, "p2")).toBe("FIND GAP FOR SHIELD");
    expect(read(SIREN_FENCE_SHUT, "p2")).toBe("SHOOT THE CRACK");
    expect(read(SIREN_MINE_P1, "p1")).toBe("SAY THE TILE");
    expect(read(SIREN_HARPOON, "p2")).toBe("MOVE CANNON!");
    expect(read(SIREN_TWO_WORDS, "p1")).toContain(" · ");
    expect(SIREN_EARLY.build().creatures.length).toBe(0);
    const traded = SIREN_STATES.find((x) => x.pose === SIREN_TRADED);
    if (!traded) throw new Error("traded");
    const w = SIREN_TRADED.build();
    expect(sirenLit(traded, w)).toEqual({ p1: false, p2: true });
    expect([sirenReads(traded, w, "p1"), sirenReads(traded, w, "p2")]).toEqual([null, "COLOUR"]);
  });
});
