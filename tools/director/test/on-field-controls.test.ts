import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { computeLayout, type Hold, touchMove, touchUp } from "@neon-spore/render";
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
 * `documentedHoldKind` is an exhaustive switch and `TARGET_PLACE` is a
 * `Record` keyed by the whole of `DragTarget`. A new member added to either
 * union in `touch.ts` or `sim/types.ts` fails to *compile* here — the switch's
 * `default` parameter stops being `never`, the record is missing a key — so
 * `bun run check`'s typecheck, not this file's assertions, is what catches
 * drift. The runtime tests below only prove the two still agree with
 * `FIELD_CONTROLS` today.
 *
 * The record replaced a hand-typed array of twenty-three target names on 21
 * September 2026, which is how twenty-four handles came to be built with no
 * row anywhere and nothing red.
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
    case "light":
      return "field";
    default:
      return assertNever(kind);
  }
}

/**
 * **Where every member of `DragTarget` is answered**, as a table over the
 * whole union rather than a list of part of it.
 *
 * This was a `switch` returning its own argument, and beside it the test
 * walked a hand-typed array of twenty-three names. The switch was held to the
 * union by `assertNever` and so could not go stale; the array was held to
 * nothing, so every handle built after THE CURTAIN — twenty-four of them, by
 * 21 September 2026 — had a paragraph in the switch and no row on the tab, no
 * row in the spec and nothing failing. A `Record` keyed by the union is both
 * halves at once: a member added to `DragTarget` fails to *compile* here until
 * it is placed, and the keys are the list the tests below walk, so there is no
 * second copy to keep.
 *
 * Three places, because a target is in one of exactly three states:
 *
 * - **`panel`** — not on the field at all. `crank` alone: a lobe on THE CLAW's
 *   panel, turned rather than pressed, described with the other buttons in
 *   `packages/content/controls.ts`.
 * - **`field`** — a handle a thumb can reach on a screen today, which must
 *   have a `FIELD_CONTROLS` row.
 * - **`unbuilt`** — heard by the simulation with nothing drawn to take hold
 *   of, which must **not** have one. That is **the walk**'s precedent, and
 *   the row's own fields are why: `where` is a place on the screen and
 *   `source` is a branch of `touch.ts`, and neither exists while the target is
 *   only heard. The first ring made the walk one lane later, `sinewLeft` and
 *   `sinewRight` the lane after that, `curtainHem` in two halves of one lane, `pulseMeter` the fifth, THE VANE's two the sixth —
 *   and the seventeen still sitting here are the backlog, each of them a look before it is a row.
 *
 * **The `unbuilt` comments say "as every one above it" and not a number.**
 * They carried a running tally until 21 September 2026 and every one of them
 * was wrong by then — three above two, five above four, thirteen above nine —
 * because a count of a list is a fact that goes stale on the lane that shortens
 * the list, and nothing here reads it.
 *
 * So the test below is one assertion in both directions: a `field` target
 * without a row is a tab that has fallen behind the game, and an `unbuilt` one
 * *with* a row is a table nobody updated when the look landed.
 */
type TargetPlace = "panel" | "field" | "unbuilt";

const TARGET_PLACE: Record<DragTarget, TargetPlace> = {
  crank: "panel",
  mazeString: "field",
  wardenTether: "field",
  lidString: "field",
  gripBody: "field",
  choirLeft: "field",
  choirRight: "field",
  balloonLeft: "field",
  balloonRight: "field",
  sinewLeft: "field",
  sinewRight: "field",
  // `surgeBulb` is the same again, and the first one target both seats
  // send: heard by `sim/surge-hand.ts`, answered anywhere on the bulb by
  // `render/surge-grip.ts` (`docs/spec/bosses.md` §11.28).
  surgeBulb: "field",
  // `antiphonOrgan` is the first on one screen only: heard by
  // `sim/antiphon-hand.ts` from either seat, answered on the organ by
  // `render/antiphon-grip.ts` where the organ is drawn, which is the
  // pilot's screen and never the navigator's (`docs/spec/bosses.md` §11.31).
  antiphonOrgan: "field",
  // `instarMark` is one target that is six gestures: `id` names the mark
  // and the mark's own `gesture` says what the thumb on it means, heard by
  // `sim/instar-hand.ts` and answered by `instarMarkUnder` under
  // `handleUnder()` — a turn mark through `turnAbout`, the crank's reading
  // about the ring (`render/instar-marks.ts`, `docs/spec/bosses.md` §11.32).
  instarMark: "field",
  // `filament` is the first target that is a **trace**: no `id`, both
  // seats, and the grab is at a tile the simulation already holds — the
  // head for player 1, the tail for player 2 — so the displacement
  // resolves to a tile (`sim/filament-hand.ts`), answered by
  // `filamentGrabUnder` under `handleUnder()` at the ring each screen
  // draws (`render/filament-grip.ts`, `docs/spec/bosses.md` §11.33).
  filament: "field",
  // `stareLid` is heard by `sim/stare-hand.ts` — a depth on the y from the
  // seat the eye is not looking at — answered by `stareLidUnder` under
  // `handleUnder()` at the ring only that seat's screen draws
  // (`render/stare-lid.ts`, `docs/spec/bosses.md` §11.16).
  stareLid: "field",
  // `queenMark` is THE BULB QUEEN's two marks under player 1's thumb —
  // pried open under BROOD, held open under SCREAM (`sim/queen-hand.ts`,
  // `field-controls-queen.ts`).
  queenMark: "field",
  // `mirrorLobe` is THE MIRROR's own ship under both thumbs — the last
  // round reflected on it, then pinned (`sim/mirror-hand.ts`,
  // `field-controls-mirror.ts`).
  mirrorLobe: "field",
  // `gorgeLobe` is THE GORGE's intakes under one thumb each — player 1's
  // pinch on a full one, player 2's pry on the mouth (`sim/gorge-hand.ts`,
  // `field-controls-gorge.ts`).
  gorgeLobe: "field",
  // `mazeHeart` is THE MAZE's heart under the navigator's thumb, torn out
  // while the pilot braces the string (`sim/maze-hand.ts`,
  // `field-controls-maze.ts`).
  mazeHeart: "field",
  // `gaugeNeedle` and `gaugeBand` are THE GAUGE's dial under one thumb each
  // — his hand swinging the needle while the valve is jammed, her thumb
  // holding the wound band open (`sim/gauge-hand.ts`, `render/gauge-grip.ts`,
  // `field-controls-gauge.ts`).
  gaugeNeedle: "field",
  gaugeBand: "field",
  // `wardenEye` and `wardenHatch` are THE WARDEN's second and third hands —
  // player 2's thumb resting on the eye under NARROW, player 1's swipe
  // across the hatch under GLARE (`sim/warden-hand.ts`,
  // `field-controls-warden.ts`).
  wardenEye: "field",
  wardenHatch: "field",
  // THE FLEET's three thumbs on its chart — the navigator's hold on the
  // plume, the pilot's rake along the hull, her pull on the wreck
  // (`sim/fleet-hand.ts`, `render/fleet-grip.ts`,
  // `field-controls-fleet.ts`). All three land on the one square, and
  // which seat it answers is the state the round is in.
  fleetBreach: "field",
  fleetRake: "field",
  fleetWreck: "field",
  // THE VANE's two hands on its own mechanism — the pilot's thumb pinning
  // the sweeping arm under VEER, the navigator's carry off the seized
  // housing under SEIZE (`sim/vane-hand.ts`, `render/vane-grip.ts`). The
  // arm's ring is the one on this tab that *moves*, because the column the
  // thumb lands in is what the press decides.
  vaneArm: "field",
  vaneHousing: "field",
  // SNAKE's two hands on its own body — player 1 prising the jaws that have
  // stuck on the neck behind them, player 2 lifting the tail clear of the
  // arena (`sim/snake-controls.ts`, `render/snake-grip.ts`,
  // `field-controls-snake.ts`). The first two on this tab drawn on a thing
  // that moves *between* beats, which is why `Field` carries a tick.
  snakeJaws: "field",
  snakeTail: "field",
  // PINBALL's two hands on its table — player 1 winding the plunger his own
  // hard launch left slack, player 2 shoving the cabinet through a flight
  // (`sim/pinball-hand.ts`). Drawn from 22 September 2026, and the only pair
  // on this tab that cannot both be on a screen: the wind is offered through
  // `power` and the shove through `flight`, so they share the one band of air
  // this round keeps clear above the ship, his at its right end and hers at
  // its left (`render/pinball-grip.ts`, `field-controls-pinball.ts`).
  pinPlunger: "field",
  pinTable: "field",
  // THE SCOUT's two hands — player 2's line home on a laden ship, player 1's
  // carry priming a thruster three motes have made labour
  // (`sim/scout-hand.ts`). Drawn from 22 September 2026, and the only pair on
  // this tab in the *same place* on two screens: both are the little ship, and
  // the round's split is that the pilot is shown a nose and the navigator is
  // not, so hers is the ship's middle and his stands off its stern
  // (`render/scout-grip.ts`, `field-controls-scout.ts`).
  scoutLine: "field",
  scoutPrime: "field",
  // THE PULSE's meter, the one thing in the game both seats may take hold of
  // at once, and the only handle here on an **interlude**: a hand on a
  // reading rather than on a body, so the bar itself is the button and there
  // is no ring (`sim/pulse-hand.ts`). The fifth to make the walk,
  // and the one the wave's own guide had been promising the whole time —
  // *Bar low: a thumb on it carries them* over a bar with nothing on it
  // (`render/pulse-grip.ts`, `field-controls-pulse.ts`).
  pulseMeter: "field",
  // THE BATON's own arm, the one handle whose seat the *beat* decides: the
  // locked-out seat strips a swelling socket, and under `merging` a thumb
  // each draws the two beads into one (`sim/baton-hand.ts`,
  // `render/baton-grip.ts`, `field-controls-baton.ts`).
  batonSocket: "field",
  // THE UNDERTOW's two thumbs, both the navigator's and both on the hull
  // itself: a pin is a second plate on a standing lobe, and the free hauls
  // the plate off a pilot the floor unseated (`sim/undertow-hand.ts`). Drawn
  // from 22 September 2026 — a ring per standing lobe just clear of the
  // plating, and one a tile above it over the stuck column with the count on
  // its dial (`render/undertow-grip.ts`).
  undertowPin: "field",
  undertowFree: "field",
  // THE THROAT's two, and the only pair the fight hands out as it loses: a
  // thumb on a ring already gone slack holds the gullet's breath, and in
  // `open` a carry drags the tube itself a column off its meal
  // (`sim/throat-hand.ts`, `render/throat-grip.ts`). The seventh and eighth
  // to make the walk, and the first whose *cue* was already on the
  // field: `CINCH` and `HAUL` have been printed over bare tube since the
  // fight shipped, and this is the pair of rings they were pointing at.
  throatRing: "field",
  throatTube: "field",
  // THE CURTAIN's hem, the pilot's alone and heard only while the rail is
  // jammed: carried **up** past `curtainLiftMilli`, it holds a gap open over
  // the core for as long as the thumb stays there (`sim/curtain-hand.ts`).
  // The fourth to make the walk, and in two halves of one lane: the lift was heard by the simulation
  // with nothing on the screen to take hold of, and the look gave it a ring
  // on the fabric's own edge and a row (`render/curtain-grip.ts`,
  // `field-controls-curtain.ts`, `docs/spec/bosses.md` §11.24).
  curtainHem: "field",
  // THE TASTER's three, one per movement of one fight and the first set on a
  // boss no part of which is hidden from either seat: the pilot pins a
  // growing blade while the fan is `fanning`, the navigator wipes a soft
  // column while it is `hurrying`, and the pilot prises the `closed`
  // interlock open for her beam (`sim/taster-hand.ts`). The fifth set to make
  // the walk, and the first to make it three at once: all three
  // were heard by the simulation with nothing on the screen to take hold of,
  // and the look gave each a ring on its own movement's problem — the root of
  // an undecided blade, the air over a gap, the middle of the shut crest
  // (`render/taster-grip.ts`, `field-controls-taster.ts`).
  tasterBlade: "field",
  tasterGap: "field",
  tasterLock: "field",
  // THE LEDGER's four, the first set whose seats were decided by what each
  // seat is shown of one drawn object: the navigator walks the cord's foot
  // along the plating while it is `rooting` and plugs the socket from
  // `paying` on, and the pilot hauls the soonest return a beat down while
  // the cord is `whipping` and tears the cord out by hand once it is `taut`
  // and she has carried the plate out of the socket's column
  // (`sim/ledger-hand.ts`).
  //
  // **Her two are the sixth set to make the walk, and the first to
  // land on one circle.** They are the same hand on the same thing at two
  // times — the root of the cord — and they are never offered together, so
  // the look gave them one ring a tile and a fifth above the plating and
  // let the movement say which gesture it is, standing clear of the lock that
  // names the column. **It is the one handle on this field the other seat is
  // not shown dimmed**: it stands in the socket's own column, so a dim one on
  // his screen would read out the rooted column the cord is faded out above
  // the plating to keep from him (`render/ledger-grip.ts`,
  // `field-controls-ledger.ts`).
  ledgerFoot: "field",
  ledgerSocket: "field",
  // And his two, the other half of that lane and the half of this object his
  // screen *can* read. **Neither of them stands on the root**, which is the
  // whole of their placement: the cord fades out above the plating on his
  // screen so he cannot name the rooted column, and a ring drawn in that
  // stretch would put back exactly what the fade takes away. So the pull's
  // rides the bead it is about, down a cord only he is shown, and the haul's
  // stands still at a fixed place above the fade — which is why that one is
  // on **both** screens, dim on hers: it gives her nothing new, and the tear
  // is refused while her plate covers the socket, a column he cannot see
  // (`render/ledger-pull.ts`, `ledger-haul.ts`, `sim/ledger-gates.ts`).
  ledgerBead: "field",
  ledgerCord: "field",
  // THE LEAD's stalk, and the first handle given to a boss that shipped as
  // a fixture: the navigator takes the stalk while the body stands dead
  // still, and it keeps standing while her thumb is on it — the still's
  // fuse does not burn — so the beat she lets go is the beat it passes and
  // the beam has as long as she gives it, up to `leadHoldBeats`
  // (`sim/lead-hand.ts`, `render/lead-grip.ts`, `field-controls-lead.ts`).
  leadStalk: "field",
  // THE SCUTTLE's hanging part, and the one handle in this union that buys
  // a **place** rather than time: the pilot carries a part that has come
  // loose one column along the frame, once a cycle and never on the
  // wind-up, and it is thrown down the column he put it in rather than its
  // socket's (`sim/scuttle-hand.ts`, `render/scuttle-grip.ts`,
  // `field-controls-scuttle.ts`).
  scuttlePart: "field",
  // `antiphonRail` is the navigator's half of the boss whose other handle
  // is the pilot's: she carries a candidate down off her rail, `id` naming
  // its place on it, and it stops counting — a bolt into that column and
  // colour is nothing, and it cannot fall on them when the cycle ends
  // (`sim/antiphon-hand.ts`). Pull the one he is describing and the cycle
  // hardens, exactly as firing at a decoy does, so it is a risk rather
  // than a free elimination (`docs/spec/bosses.md` §11.31).
  antiphonRail: "field",
  // `wellSeam` is the pilot's thumb on the one sector of THE WELL's clock
  // face that holds no column — where the field's two walls meet when the
  // field is rolled into a circle. He takes hold of it and it is read two
  // ways by what the face is doing: while the face slips, holding it still
  // buys the pair four beats; once it has stopped at the far end, carrying
  // it turns the hours back onto their columns (`sim/well-hand.ts`). It is
  // on his screen and his alone, because the well is drawn on one of the
  // two — which is why the answer is her reading the flat field out loud
  // (`render/touch-well.ts`, `field-controls-well.ts`).
  wellSeam: "field",
  // `hiveLobe` is the same shape as the seam above and the first of them
  // split between the two seats: the underside of THE HIVE, read two ways
  // by what the mass is doing. Clenched, the whole underside is the handle
  // and the pilot drags it back within reach, which is the only answer
  // there is to a state that puts every breach out of a bolt's reach too.
  // Swelling, one lobe is the handle, `id` names which, and the navigator
  // holds it until the colour is wrung out of it — hers because she is the
  // only seat a swell is drawn for, as the seam is his because the clock
  // is drawn on his (`sim/hive-hand.ts`, `render/hive-grip.ts`,
  // `field-controls-hive.ts`, `docs/spec/bosses.md` §11.14).
  hiveLobe: "field",
  // THE GIMBAL's two rings, and **the first pair here that are one handle
  // gripped from its two faces**: `gimbalOuter` is the pilot's rim and
  // `gimbalInner` the navigator's, each answered on the seat that owns it and
  // on no other (`render/gimbal-grip.ts`, `handles.ts`). Two rows rather than
  // one because they are two targets offered at once, which no entry above
  // them is — and what the rows may not say is which way to turn, since the
  // whole fight is that the same turn is two turns (`field-controls-gimbal.ts`,
  // `docs/spec/bosses.md` §11.34).
  gimbalOuter: "field",
  gimbalInner: "field",
  // THE SPOOL's brake, one target and one seat: the pilot holds it at a depth
  // and is shown nothing but the mark's own grip, while the figure it has to
  // be matched against is on the navigator's screen. On the field because the
  // mark is on the line where it leaves the spool, and the row may not say a
  // depth — that is the sentence the pair has to say (`render/spool-grip.ts`,
  // `sim/spool-hand.ts`, `docs/spec/bosses.md` §11.36).
  spoolBrake: "field",
  // THE HASP's two, and the arrangement neither of the pairs above has:
  // `haspLatch` is the pilot's bar and `haspWheel` the navigator's rim,
  // both live at the same time and neither one doing anything without the
  // other — the wheel only turns while the latch is down, so a hand off
  // either control stops the pair rather than costing one of them a turn.
  // Two rows because they are two targets offered at once, and what the
  // rows may not say is how long the latch will last: the fuse is the
  // pilot's to read and to say (`sim/hasp-hand.ts`,
  // `docs/spec/bosses.md` §11.37).
  haspLatch: "field",
  haspWheel: "field",
  // THE RATCHET's two: the navigator's catch, a depth read as a level, and
  // the pilot's pawl, a press read on the tick it lands and judged by her
  // catch. Two rows, one seat each, and neither says the other's state
  // (`sim/ratchet-hand.ts`, `docs/spec/bosses.md` §11.38).
  ratchetCatch: "field",
  ratchetPawl: "field",
  // THE MANTLE's two knobs, one a seat by geometry though both screens draw
  // both, and the ring round its core, tapped from either seat in turn
  // (`render/mantle-grip.ts`, `docs/spec/bosses.md` §11.40).
  mantleLeft: "field",
  mantleRight: "field",
  mantleCore: "field",
  // THE KEEL: simulation lane only, no look yet.
  keelJoint: "unbuilt",
  valveWheel: "unbuilt",
  valvePin: "unbuilt",
  // THE OCULUS, the same.
  oculusLeafLeft: "unbuilt",
  oculusLeafRight: "unbuilt",
  // THE VISE, the same.
  viseLobeLeft: "unbuilt",
  viseLobeRight: "unbuilt",
  // THE RIME, the same.
  rimeHalfLeft: "unbuilt",
  rimeHalfRight: "unbuilt",
  trivetPadFront: "unbuilt",
  trivetPadRear: "unbuilt",
  plumbLevelLeft: "unbuilt",
  plumbLevelRight: "unbuilt",
};

describe("FIELD_CONTROLS against touch.ts's own types", () => {
  test("every field-kind Hold has a FIELD_CONTROLS entry", () => {
    const fieldKinds: Hold["kind"][] = (
      ["cannon", "shield", "guard", "shot", "grip", "drag", "light"] as const
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
  test("every DragTarget on the field has a row, and every one off it has none", () => {
    const rowed = new Set(FIELD_CONTROLS.map((c) => c.dragTarget));
    const places = Object.entries(TARGET_PLACE) as [DragTarget, TargetPlace][];
    // The union is not empty and this walks all of it: a table that lost its
    // keys would pass every assertion below by making none.
    expect(places.length).toBeGreaterThan(50);
    for (const [target, place] of places) {
      expect(
        rowed.has(target),
        place === "field"
          ? `${target} is answered on the field and has no FIELD_CONTROLS row`
          : `${target} is ${place} and has a FIELD_CONTROLS row — place it "field"`,
      ).toBe(place === "field");
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
 * The layout every gesture below is answered against. No field: a move and a
 * lift are answered by the `Hold` alone, and the hold is what carries the seat
 * that took it (`render/touch.ts`).
 */
const CFG = DEFAULT_CONFIG;
const LAYOUT = computeLayout({ width: 390, height: 844, dpr: 3 }, CFG, "test");

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
  {
    why: "a thumb dragged across the dark into a new square",
    hold: { kind: "light", player: 2, col: 0, row: 0 },
    at: { x: 300, y: 300 },
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
    for (const kind of [
      "cannon",
      "shield",
      "guard",
      "grip",
      "held",
      "shot",
      "drag",
      "light",
    ] as const) {
      expect(driven.has(kind), `${kind} is never driven`).toBe(true);
      documentedHoldKind(kind);
    }
  });

  test("no move or lift sends a command no entry describes", () => {
    for (const { why, hold, at } of GESTURES) {
      if (documentedHoldKind(hold.kind) === "panel") continue;
      const sent = [touchMove(LAYOUT, hold, at?.x ?? 0, at?.y ?? 0), touchUp(LAYOUT, hold, at)];
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
    const carried = touchUp(LAYOUT, { kind: "cannon" }, { x: 300, y: 700 });
    const tapped = touchUp(
      LAYOUT,
      { kind: "cannon", suck: { x: 120, y: 500 } },
      {
        x: 120,
        y: 500,
      },
    );
    expect(carried).toBeNull();
    expect(tapped?.command?.kind).toBe("intake");
    expect(FIELD_CONTROLS.filter((c) => c.holdKind === "cannon").length).toBe(2);
  });
});
