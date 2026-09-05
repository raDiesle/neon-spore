import { nextInt } from "./rng.js";
import { beadColor, beadDrop, STRAND_STEP, strandBeadCount, strandSpan } from "./strand-shape.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * How a thread comes onto the field: one queue entry in, two to five bodies
 * out.
 *
 * Its own file beside `strand-round.ts`, cut out when THE STRAND's wave took
 * that one past its 250-line limit, and along the seam `spawn.ts` already cuts
 * for the whole simulation: everything next door happens to a thread that is
 * already standing, and this is the single place one comes into existence.
 */

/**
 * Thread the rest of a strand onto the bead that has just arrived, and settle
 * that bead's own place on it.
 *
 * The queue entry becomes the **leftmost** bead — `spawnArrivals` has already
 * pushed it — and this hangs the others out to its right, `STRAND_STEP`
 * columns apart and every other one a row lower (`beadDrop`), shifting the
 * whole run inside the field when there is not room for it. The leftmost
 * bead carries the authored colour and every other alternates from it, so a
 * wave composes a thread by naming one end of a pattern.
 *
 * It mutates that first bead rather than returning a replacement for it,
 * because `world.nextId` is spent inside the object literal next door and a
 * strand's name *is* its first bead's id. The first lit end is rolled here
 * rather than through `lightStrandEnd`, for the same reason: the other beads
 * are not on the field yet, so there is no run for that function to read — and
 * it spends exactly the one draw that function would.
 */
export function stringStrand(world: World, first: Creature, asked: number | undefined): Creature[] {
  const count = strandBeadCount(world.cfg, asked);
  const fromLeft = nextInt(world.rng, 2) === 0;
  const lo = Math.max(0, Math.min(first.col, world.cfg.cols - strandSpan(count)));
  // The leftmost bead's colour, which is what the wave authored. Not null: a
  // strand names a colour (`authorsColor`).
  const left = first.color ?? "red";
  // The row the whole thread hangs from, kept before anything moves: the first
  // bead takes its own drop below, and every other one is measured from where
  // the thread arrived rather than from where that bead ended up.
  const baseRow = first.row;
  const baseFrom = first.fromRow;
  const born: Creature[] = [];
  for (let place = 0; place < count; place++) {
    const col = lo + place * STRAND_STEP;
    // Where this bead hangs on the beat it arrives, read off the same rule the
    // wave is read off — so a thread enters already in the shape it will keep
    // undulating through, rather than snapping into it on its first beat.
    const drop = beadDrop(place, world.beat);
    const color = beadColor(left, place);
    if (place === 0) {
      first.col = col;
      first.fromCol = col;
      first.row += drop;
      first.fromRow += drop;
      first.color = color;
      first.strandId = first.id;
      first.strandOrder = place;
      first.strandLit = fromLeft;
      continue;
    }
    born.push({
      id: world.nextId++,
      kind: "strand",
      col,
      row: baseRow + drop,
      // Out of the bead that arrived, so the first frame draws the thread
      // paying itself out rather than five bodies appearing in a row — the
      // same glide THE GYRE's rim comes out of its hub on.
      fromRow: baseFrom + drop,
      fromCol: first.col,
      color,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      throbOpen: false,
      shell: 0,
      strandId: first.id,
      strandOrder: place,
      strandLit: !fromLeft && place === count - 1,
    });
  }
  return born;
}
