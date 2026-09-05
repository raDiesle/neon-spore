import { authorsBodyColor, CREATURES } from "@neon-spore/content";
import { type Color, type CreatureKind, type PodKind, SHELL_INTACT } from "@neon-spore/sim";
import { COL, creatureAt, podAt, tile } from "./brush-frame.js";
import { echoArt } from "./brush-poses-echo.js";
import { type Brush, LIVING_BRUSH_KINDS } from "./brushes.js";
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
 * The moment each brush is photographed at.
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
 * The frame itself — bare, and cropped by measuring rather than by declaring
 * — is `brush-frame.ts`. What each builder here decides is the *moment*: a
 * shell with one plate already off, a clasp inside its bubble, a torch on the
 * one beat it is on the field at all, an echo one beat after it came apart.
 * That is the part no measurement can recover.
 *
 * Built once per brush and kept as a data URL: a settled frame costs dozens of
 * simulation ticks and a full render pass, and the same picture is wanted in
 * three places at three sizes — the palette, the map's cells and the hover
 * card — where one canvas element cannot be in two of them at once.
 */

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
  // Held on a beat it *hangs*, and that is what puts it in the frame rather
  // than half out of the top of it. A body is drawn between the row it left
  // and the row it is on (`drawnRow`), and at a beat boundary that is the row
  // it left — which after a dart's diagonal is two rows up, exactly the reach
  // this crop has, so the body sat on the crop's own edge and was cut in half.
  // On a hanging beat `fromRow` and `row` are the same number and the question
  // does not arise. It is also the state the creature is *about*: `dart.ts`
  // hangs it every other beat, and that is when it is looked at.
  until(world, "the dart hanging", (w) => {
    const c = w.creatures.find((x) => x.kind === "dart");
    return !!c && c.dartFloat === true && c.fromRow === c.row;
  });
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

/**
 * THE CAROM, a tick short of settling rather than settled on the beat.
 *
 * Every other living pose lands exactly on a beat boundary, where a body is
 * still drawn from the tile it left rather than the one `creatureAt` now
 * reports (`drawnRow`, `drawnCol`) — true of every kind, but invisible for an
 * ordinary faller, whose *from* and *to* are one row apart and both sit well
 * inside `tile`'s reach. A carom crosses up to three columns a beat
 * (`caromCols`), so the same instant draws it three lanes from where the crop
 * was told to centre, and a square built around the tile it is about to leave
 * catches only a sliver of the rock it is actually standing in. THE DART and
 * THE TORCH already stop a tick early for the same reason; this is that fix
 * for the same seam.
 */
function caromArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "carom", color: "cyan" }]);
  run(world, TPB * 3 - 1);
  return tile(world, creatureAt(world, "carom"));
}

const BUILDERS: Partial<Record<Brush, () => HTMLCanvasElement>> = {
  rock: meteorArt,
  torch: torchArt,
  lure: lureArt,
  shell: shellArt,
  clasp: claspArt,
  dart: dartArt,
  echo: echoArt,
  carom: caromArt,
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
