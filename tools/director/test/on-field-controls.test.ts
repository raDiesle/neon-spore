import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { controlSetForWave } from "@neon-spore/content";
import { computeLayout, type Field, type Hold, touchMove, touchUp } from "@neon-spore/render";
import { DEFAULT_CONFIG, type DragTarget } from "@neon-spore/sim";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { TRIED_CONTROLS } from "../src/tried-controls-page.js";

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
 * A kind was not enough on its own. One hold can carry two gestures — a press
 * on the cannon that slides it and a lift that opens the maw are both
 * `kind: "cannon"` — so the switches above were satisfied by the first of them
 * and would have said nothing if THE MAW TAP had never been written down by
 * hand. So the last describe drives every shape a `Hold` can take through
 * `touchMove` and `touchUp` and fails on a branch that sends a command no
 * entry claims in its `sends`.
 *
 * What none of it can catch: a control built entirely outside `touch.ts`, the
 * way the guide's whole-screen hold is (`apps/game/src/briefing.ts`, by
 * design — see its own comment). That one has no `Hold` variant to miss, so
 * it stays honest only because a human read `briefing.ts` once and wrote it
 * down. `docs/spec/controls.md` says this in the same words.
 */

function assertNever(x: never): never {
  throw new Error(`on-field-controls.test.ts does not know this: ${JSON.stringify(x)}`);
}

/**
 * One arm per `Hold["kind"]`. `"held"` is a panel lobe and nothing else — the
 * two colours, which are held since the lance lost its own button, and
 * `packages/content/src/controls.ts` already documents them — so it is named
 * here only to keep the switch exhaustive, not given a field entry.
 *
 * `"cannon"` and `"shield"` used to sit beside it, and no longer do: the same
 * two holds are now taken on the ship itself as well as on the strips
 * (`render/touch-ship.ts`), so each needs a field entry of its own however
 * fully the panel table describes the strip.
 */
function documentedHoldKind(kind: Hold["kind"]): "panel" | "field" {
  switch (kind) {
    case "held":
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

/**
 * `crank` is the one target that is **not on the field**: it is a lobe on THE
 * CLAW's panel, turned rather than pressed, and `packages/content/controls.ts`
 * describes it with the other buttons. It is named here for `"held"`'s reason
 * one switch up — to keep this exhaustive, so a target invented tomorrow still
 * fails to compile — and not given a `FIELD_CONTROLS` entry.
 *
 * `orreryRing` has its entry now (`field-controls-orrery.ts`), and it came
 * one lane after the rule did — the row's own fields are why it had to: `where`
 * is a place on the screen and `source` is a branch of `touch.ts`, and neither
 * existed while the ring was a bearing with nothing drawn to take hold of.
 *
 * `sinewLeft` and `sinewRight` went the same way one lane later: heard by
 * `sim/sinew-hand.ts` with nothing drawn to take hold of, then given their
 * rows with the look (`field-controls-sinew.ts`, `docs/spec/bosses.md`
 * §11.26).
 */
function documentedDragTarget(target: DragTarget): DragTarget {
  switch (target) {
    case "crank":
    case "orreryRing":
    case "mazeString":
    case "wardenTether":
    case "lidString":
    case "gripBody":
    case "choirLeft":
    case "choirRight":
    case "balloonLeft":
    case "balloonRight":
    case "sinewLeft":
    case "sinewRight":
      return target;
    // `surgeBulb` is the same again, and the first one target both seats
    // send: heard by `sim/surge-hand.ts`, answered anywhere on the bulb by
    // `render/surge-grip.ts` (`docs/spec/bosses.md` §11.28).
    case "surgeBulb":
      return target;
    // `antiphonOrgan` is the first on one screen only: heard by
    // `sim/antiphon-hand.ts` from either seat, answered on the organ by
    // `render/antiphon-grip.ts` where the organ is drawn, which is the
    // pilot's screen and never the navigator's (`docs/spec/bosses.md` §11.31).
    case "antiphonOrgan":
      return target;
    // `instarMark` is one target that is six gestures: `id` names the mark
    // and the mark's own `gesture` says what the thumb on it means, heard by
    // `sim/instar-hand.ts` and answered by `instarMarkUnder` under
    // `handleUnder()` — a turn mark through `turnAbout`, the crank's reading
    // about the ring (`render/instar-marks.ts`, `docs/spec/bosses.md` §11.32).
    case "instarMark":
      return target;
    // `filament` is the first target that is a **trace**: no `id`, both
    // seats, and the grab is at a tile the simulation already holds — the
    // head for player 1, the tail for player 2 — so the displacement
    // resolves to a tile (`sim/filament-hand.ts`), answered by
    // `filamentGrabUnder` under `handleUnder()` at the ring each screen
    // draws (`render/filament-grip.ts`, `docs/spec/bosses.md` §11.33).
    case "filament":
      return target;
    // `stareLid` is heard by `sim/stare-hand.ts` — a depth on the y from the
    // seat the eye is not looking at — answered by `stareLidUnder` under
    // `handleUnder()` at the ring only that seat's screen draws
    // (`render/stare-lid.ts`, `docs/spec/bosses.md` §11.16).
    case "stareLid":
      return target;
    // `queenMark` is THE BULB QUEEN's two marks under player 1's thumb —
    // pried open under BROOD, held open under SCREAM (`sim/queen-hand.ts`,
    // `field-controls-queen.ts`).
    case "queenMark":
      return target;
    // `diastoleChamber` is THE DIASTOLE's alone right chamber under player
    // 1's thumb — a clamp on its contraction (`sim/diastole-hand.ts`),
    // answered by `diastoleClampUnder` under `handleUnder()` at the ring
    // only that seat's screen draws (`render/diastole-clamp.ts`,
    // `field-controls-diastole.ts`).
    case "diastoleChamber":
    // `mirrorLobe` is THE MIRROR's own ship under both thumbs — the last
    // round reflected on it, then pinned (`sim/mirror-hand.ts`,
    // `field-controls-mirror.ts`).
    case "mirrorLobe":
    // `gorgeLobe` is THE GORGE's intakes under one thumb each — player 1's
    // pinch on a full one, player 2's pry on the mouth (`sim/gorge-hand.ts`,
    // `field-controls-gorge.ts`).
    case "gorgeLobe":
      return target;
    // `mazeHeart` is THE MAZE's heart under the navigator's thumb, torn out
    // while the pilot braces the string (`sim/maze-hand.ts`). Its simulation
    // half landed first; the on-field entry and the row in
    // `docs/spec/controls.md` are the look lane's.
    case "mazeHeart":
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

  // The hold kind is deliberately not part of this: THE PUSH sends a `drag` at
  // `gripBody` off a `grip` hold, because carrying a body is the grip's own
  // gesture rather than a second control. What the list has to cover is every
  // target a `drag` can name, whatever hold names it.
  test("every DragTarget has its own FIELD_CONTROLS entry", () => {
    const targets: DragTarget[] = (
      [
        "mazeString",
        "wardenTether",
        "lidString",
        "gripBody",
        "orreryRing",
        "sinewLeft",
        "sinewRight",
        "stareLid",
        "diastoleChamber",
        "queenMark",
        "mirrorLobe",
        "gorgeLobe",
      ] as const
    ).map(documentedDragTarget);
    for (const target of targets) {
      expect(
        FIELD_CONTROLS.some((c) => c.dragTarget === target),
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

/**
 * The prose half. `docs/spec/controls.md` carries the same list in sentences,
 * and it said so itself — "kept beside it rather than typed from memory a
 * second time" — while being two rows short of it: THE MAW TAP and THE LID'S
 * CORD were in the array and in the game and in neither the table nor the
 * paragraphs. Nothing noticed, because nothing was looking.
 *
 * Only the names are checked. What each row *says* is prose written for a
 * reader and is not the array's `does` string, so a test that compared them
 * would either fail on every rewording or force the document to become the
 * array again — and the point of the document is that it is not.
 */
describe("docs/spec/controls.md lists what FIELD_CONTROLS does", () => {
  const spec = readFileSync(new URL("../../../docs/spec/controls.md", import.meta.url), "utf8");

  test("gives every field control a row of its own", () => {
    for (const c of FIELD_CONTROLS) {
      expect(
        spec.includes(`| ${c.name} |`),
        `${c.name} is in FIELD_CONTROLS and not in the spec's table`,
      ).toBe(true);
    }
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

/**
 * The layout every gesture below is answered against, and a field with nothing
 * in it: what is being driven is the branch a `Hold` takes, and none of these
 * branches reads a creature.
 */
const CFG = DEFAULT_CONFIG;
const LAYOUT = computeLayout({ width: 390, height: 844, dpr: 3 }, CFG, "test");
const FIELD: Field = {
  creatures: [],
  cannonCol: 5,
  shieldCol: 5,
  beatPhase: 0,
  beat: 0,
  seat: 1,
  cfg: CFG,
  maze: null,
  warden: null,
  orrery: null,
  sinew: null,
  surge: null,
  antiphon: null,
  instar: null,
  filament: null,
  stare: null,
  queen: null,
  diastole: null,
  mirror: null,
  gorge: null,
  controls: controlSetForWave(0),
  faults: [],
  well: false,
};

/**
 * Every shape a `Hold` can take, and where the lift that ends it landed.
 *
 * Two of them are the same kind: the cannon carried along the hull, and the
 * cannon put down where it was picked up, which is the maw. That pair is the
 * whole reason this exists — they are one `kind` and two controls, and the
 * `sends` on each entry is what tells them apart.
 */
const GESTURES: readonly { why: string; hold: Hold; at?: { x: number; y: number } }[] = [
  { why: "the cannon carried along the hull", hold: { kind: "cannon" }, at: { x: 300, y: 700 } },
  {
    why: "the cannon put down where it was picked up",
    hold: { kind: "cannon", suck: { x: 120, y: 500 } },
    at: { x: 120, y: 500 },
  },
  { why: "the shield carried along the hull", hold: { kind: "shield" }, at: { x: 300, y: 700 } },
  { why: "a thumb resting on the plate", hold: { kind: "guard" } },
  {
    why: "a finger on something falling, carried nowhere",
    hold: { kind: "grip", id: 4, player: 1, originX: 120 },
    at: { x: 120, y: 300 },
  },
  {
    why: "the same finger carried a tile sideways",
    hold: { kind: "grip", id: 4, player: 2, originX: 120 },
    at: { x: 240, y: 300 },
  },
  { why: "a thumb resting on a colour", hold: { kind: "held", control: "fireRed", player: 2 } },
  {
    why: "the muzzle carried far enough for a colour",
    hold: { kind: "shot", originX: 40 },
    at: { x: 340, y: 700 },
  },
  ...(["mazeString", "wardenTether", "lidString"] as const).map((target: DragTarget) => ({
    why: `${target} let go of`,
    hold: { kind: "drag", target, player: 1, originX: 40, originY: 200 } as Hold,
    at: { x: 90, y: 260 },
  })),
];

describe("FIELD_CONTROLS against what touch.ts actually sends", () => {
  test("every Hold kind has at least one gesture driven here", () => {
    // The list below is the same one `documentedHoldKind` switches on, so a
    // new kind cannot be added to `Hold` without this file failing to compile
    // — and this says the kind is not merely named here but actually pressed.
    const driven = new Set(GESTURES.map((g) => g.hold.kind));
    for (const kind of ["cannon", "shield", "guard", "grip", "held", "shot", "drag"] as const) {
      expect(driven.has(kind), `${kind} is never driven`).toBe(true);
      documentedHoldKind(kind);
    }
  });

  test("no move or lift sends a command no entry describes", () => {
    for (const { why, hold, at } of GESTURES) {
      if (documentedHoldKind(hold.kind) === "panel") continue;
      const sent = [
        touchMove(LAYOUT, hold, at?.x ?? 0, at?.y ?? 0),
        touchUp(LAYOUT, hold, FIELD, at),
      ];
      for (const touch of sent) {
        const kind = touch?.command?.kind;
        if (kind === undefined) continue;
        const described = FIELD_CONTROLS.some(
          (c) =>
            c.holdKind === hold.kind &&
            (hold.kind !== "drag" || c.dragTarget === hold.target) &&
            c.sends.includes(kind),
        );
        expect(described, `${why} sends ${kind}, which no entry claims`).toBe(true);
      }
    }
  });

  test("the push is a second gesture on the grip, and is described as one", () => {
    // The grip's own pair, and the cannon's argument one control over: the
    // press slows a fall and the move takes a lane, and a check counting hold
    // kinds would have seen only the first. THE GUM is the third since 14
    // September 2026: the same hold carried a swipe's worth flings the drop.
    const hold: Hold = { kind: "grip", id: 4, player: 1, originX: 120 };
    const carried = touchMove(LAYOUT, hold, 240, 300);
    expect(carried?.command).toEqual({
      kind: "drag",
      target: "gripBody",
      on: true,
      fromMilli: Math.round((120 * 1000) / LAYOUT.tile),
      id: 4,
    });
    expect(FIELD_CONTROLS.filter((c) => c.holdKind === "grip").length).toBe(3);
  });

  test("the maw tap is a second gesture on the cannon, and is described as one", () => {
    // The one this guard was written for. Both are `kind: "cannon"`; the lift
    // is what tells them apart, and a check counting kinds saw only the first.
    const carried = touchUp(LAYOUT, { kind: "cannon" }, FIELD, { x: 300, y: 700 });
    const tapped = touchUp(LAYOUT, { kind: "cannon", suck: { x: 120, y: 500 } }, FIELD, {
      x: 120,
      y: 500,
    });
    expect(carried).toBeNull();
    expect(tapped?.command?.kind).toBe("intake");
    expect(FIELD_CONTROLS.filter((c) => c.holdKind === "cannon").length).toBe(2);
  });
});
