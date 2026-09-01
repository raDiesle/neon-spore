import { authorsBodyColor, CREATURES } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import {
  type Color,
  type CreatureKind,
  type PodKind,
  SHELL_INTACT,
  type World,
} from "@neon-spore/sim";
import { trimToSubject } from "./brush-trim.js";
import { type Brush, LIVING_BRUSH_KINDS } from "./brushes.js";
import { frameWorld } from "./pose-art.js";
import {
  aim,
  fresh,
  living,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
  until,
} from "./pose-kit.js";

/**
 * The moment each brush is photographed at, and the frame that photographs it.
 *
 * Split from `brush-art.ts`, which is now only the cache and the element the
 * three callers hang on their page. The line between them is the one worth
 * having: this file knows what a shell looks like with a plate off and when a
 * torch is on the field at all, and knows nothing about who is asking.
 *
 * `silhouette.ts`'s plain contour told a wave author which shape a brush was;
 * it never told them what colour it fills, what it glows, or what a shield or
 * a plate looks like laid over it. So these are real frames — the same
 * `Canvas2DRenderer` the phone runs, against a real `World`.
 *
 * Two things make a frame a *picture of the creature* rather than a picture of
 * the game with the creature somewhere in it, and both used to be missing:
 *
 *  - the frame is drawn **bare** (`ViewState.bare`), so the starfield, the
 *    radar and the grid are not there to be mistaken for the subject at 34 px;
 *  - and the crop is **measured, not declared** (`brush-trim.ts`) — the body
 *    is found in the black and centred as large as it will go, so a moored pod
 *    and a lure with its ring both fill their chip.
 *
 * What each builder still decides is the *moment*: a shell with one plate
 * already off, a clasp inside its bubble, a torch on the one beat it is on the
 * field at all. That is the part no measurement can recover.
 *
 * Built once per brush and kept as a data URL: a settled frame costs dozens of
 * simulation ticks and a full render pass, and the same picture is wanted in
 * three places at three sizes — the palette, the map's cells and the hover
 * card — where one canvas element cannot be in two of them at once.
 */

const COL = 3;
/** The square a specimen is drawn into before it is measured and cut down. */
const SOURCE = 320;
/** The square it is cut down to. Bigger than any use of it, so the hover
 * card's picture is a picture rather than a magnified thumbnail. */
const ART = 256;
/** `ERASE` paints nothing, so there is nothing to draw a picture of. It is
 * the only one: `THROB` used to be here too, on the grounds that its settled
 * shape said less than its outline did — which was true of a crop of the
 * field with a dim body somewhere in it, and is not true of the body drawn
 * bare and filling the frame. */
const SKIP: ReadonlySet<Brush> = new Set(["erase"]);

const cache = new Map<Brush, string | null>();

function creatureAt(world: World, kind?: CreatureKind): { col: number; row: number } {
  const c = (kind ? world.creatures.find((x) => x.kind === kind) : undefined) ?? world.creatures[0];
  return c ? { col: c.col, row: c.row } : { col: COL, row: 7 };
}

function podAt(world: World): { col: number; row: number } {
  const p = world.pods[0];
  return p ? { col: p.colMilli / 1000, row: p.rowMilli / 1000 } : { col: COL, row: 3 };
}

/**
 * One bare frame around `at`, trimmed to whatever it drew.
 *
 * `span` is no longer the picture's framing — the trim decides that — it is
 * the *reach*: how far from the body something may be and still count as part
 * of it. Generous enough for a lure's exclamation and a torch's tail, tight
 * enough that a neighbouring column could never wander in.
 */
function tile(
  world: World,
  at: { col: number; row: number },
  span = 4,
  role: ViewRole = "test",
): HTMLCanvasElement {
  const framed = frameWorld(world, role, "tile", SOURCE, at, span, Number.POSITIVE_INFINITY, true);
  return trimToSubject(framed.canvas, ART);
}

/** A settled meteor. */
function meteorArt(): HTMLCanvasElement {
  const world = fresh([rock(COL, "meteor")]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, "meteor"));
}

/**
 * THE TORCH, on the one beat it can be seen at all.
 *
 * It falls thirteen tiles a beat (`fallTilesPerBeat`), so it enters at row
 * -13, stands on row 0 exactly once, and is past the hull before the beat
 * after that. Two beats of settling — what every other brush here does — drew
 * an empty square, and the thumbnail had been a picture of nothing for as long
 * as it had existed. So this one runs until the rock is on the field and stops
 * there.
 */
function torchArt(): HTMLCanvasElement {
  const world = fresh([rock(COL, "torch")]);
  until(world, "the torch on the field", (w) => {
    const c = w.creatures.find((x) => x.kind === "torch");
    return !!c && c.row >= 0;
  });
  // And then all but one tick of that beat. A body is drawn between the row it
  // left and the row it is on (`drawnRow`), so at the instant the row changes
  // it is still being drawn from where it came — which for a torch is thirteen
  // tiles above the top of the field. Every other brush here gets away with
  // that because a tile of overshoot fits inside its reach; this one does not.
  run(world, TPB - 1);
  return tile(world, creatureAt(world, "torch"), 2.8);
}

/**
 * THE LURE, disguised as a bulb, drawn from player 2's own screen — the ring
 * and the exclamation are the one thing that screen carries and the other does
 * not, and without them a lure is a bulb. The words beside them are laid out
 * against a phone's width and are left off a bare frame (`lure-alarm.ts`); the
 * hover card says the same thing in a place it fits.
 */
function lureArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "lure", color: "cyan", wears: "bulb" }]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, "lure"), 4, "p2");
}

/** THE SHELL, a bulb inside it, one plate already off — a resting shell reads
 * as a plain armoured body with no reason to be feared twice as much as a
 * bare one; the reversal the creature exists for is the moment a column
 * stands open beside a column that still does not. */
function shellArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "shell", color: "cyan" }]);
  run(world, TPB);
  runUntil(
    world,
    "one shell piece off",
    [aim(world.tick, COL), shoot(world.tick + TPB, "red")],
    (w) => {
      const c = w.creatures.find((x) => x.kind === "shell");
      return !!c && c.shell !== SHELL_INTACT && c.shell !== 0;
    },
  );
  return tile(world, creatureAt(world, "shell"));
}

/** THE CLASP, a bulb held inside its shield — `clasp.ts` draws the bubble the
 * moment a clasp is on the field, so nothing has to be struck to see it. */
function claspArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "clasp", color: "cyan" }]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, "clasp"));
}

/**
 * THE DART, hanging. Player 1's screen, which is the seat that is shown *no*
 * guides at all (`showsDartArrow`) — the arrow, the dotted legs and the hollow
 * placeholder are a plan drawn across four tiles, and in a chip the size of a
 * fingernail they crowded the body down to a speck and read as clutter. A
 * brush says which body it paints; where that body is going is a thing to
 * watch on the field.
 */
function dartArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "dart", color: "red" }]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, "dart"), 4, "p1");
}

/** A pod, moored — `mend`, `purge` and `ward` are three marks on the one
 * shape (`pods.ts`), never the torch. */
function podArt(kind: PodKind | undefined): HTMLCanvasElement {
  const world = fresh([], [{ beat: 0, col: COL, row: 3, kind }]);
  run(world, TPB * 2);
  return tile(world, podAt(world), 2.4);
}

/** Every living kind this module has no special picture for — a settled body,
 * its own colour where it has one and a bulb where the wave has to say. */
function livingArt(kind: CreatureKind): HTMLCanvasElement {
  const def = CREATURES[kind];
  const world = fresh([
    def.color
      ? living(def.color, COL)
      : { beat: 0, col: COL, kind, color: authorsBodyColor(kind) ? ("cyan" as Color) : null },
  ]);
  run(world, TPB * 3);
  return tile(world, creatureAt(world, kind));
}

const BUILDERS: Partial<Record<Brush, () => HTMLCanvasElement>> = {
  rock: meteorArt,
  torch: torchArt,
  lure: lureArt,
  shell: shellArt,
  clasp: claspArt,
  dart: dartArt,
  mend: () => podArt(undefined),
  purge: () => podArt("purge"),
  ward: () => podArt("ward"),
};

/**
 * The picture for a brush, drawn fresh, or null when there is nothing to draw
 * — a brush with no builder that is not a living kind either. Uncached on
 * purpose: `brush-art.ts` owns that, and a second cache under it would be a
 * second answer to when a frame is stale.
 */
export function brushSpecimen(brush: Brush): HTMLCanvasElement | null {
  const special = BUILDERS[brush];
  if (special) return special();
  if (LIVING_BRUSH_KINDS.includes(brush as CreatureKind)) return livingArt(brush as CreatureKind);
  return null;
}
