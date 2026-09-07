import type { WaveEntry } from "@neon-spore/content";
import {
  CRAWLER_SIDES,
  type CrawlerSide,
  type GhostPath,
  type RockCross,
  type RockSize,
} from "@neon-spore/sim";
import { fenceCracksRow, fenceGapsRow } from "./cell-config-gaps.js";
import {
  beadLabel,
  bodyRow,
  choiceRow,
  crossLabel,
  labelled,
  pathLabel,
  sideLabel,
  sizeLabel,
  speedLabel,
} from "./cell-config-rows.js";
import {
  authorsBody,
  beadCountOf,
  CRAWLER_COUNTS,
  crawlerCountOf,
  crawlerSideOf,
  GHOST_PATHS,
  ghostPathOf,
  hasBeadCount,
  hasCrawlerFields,
  hasGhostPath,
  hasRockCross,
  hasRockWidth,
  isTieredRock,
  METEOR_SIZES,
  METEOR_SPEEDS,
  meteorSize,
  meteorSpeed,
  ROCK_CROSS_ROWS,
  ROCK_CROSSINGS,
  rockCrossOf,
  rockRowOf,
  STRAND_COUNTS,
  setBeadCount,
  setCrawlerCount,
  setCrawlerSide,
  setGhostPath,
  setMeteorSize,
  setMeteorSpeed,
  setRockCross,
  setRockRow,
} from "./entry-fields.js";
import { hasFenceGaps } from "./entry-fields-fence.js";

/**
 * The rows under the selected cell that configure the arrival in it: how fast
 * and how wide a rock comes down, which body is behind a lure, a shell, a
 * clasp, a dart or a ghost, and which way that ghost travels.
 *
 * **These used to be brushes.** Five meteor buttons in the palette were five
 * fall speeds, and the body under a shell was not authorable at all. Both are
 * facts about *one arrival* rather than about a tool, so they belong to the
 * cell you are pointing at — see `entry-fields.ts` for the reading and the
 * writing, and `brushes.ts` for why the palette lost four buttons.
 *
 * **How a row is drawn is `cell-config-rows.ts`**, cut off this file when the
 * torch got a width of its own and it reached its limit. The seam is the one
 * the paragraph above describes: this half is which questions the arrival
 * answers, and that half is every row made out of elements.
 *
 * Its own file rather than more of `cell-panel.ts` because the two answer
 * different questions: that one is what is in the cell and what can be done to
 * the cell, and this is what the thing in it *is*. That file is also at its
 * length limit, and this half is the one that grows — every future per-arrival
 * number is another row here and nothing at all there.
 *
 * Nothing here decides anything: it draws whatever `entry-fields.ts` says and
 * calls back when a button is pressed. A row whose question the entry does not
 * answer is not drawn at all rather than drawn disabled — a shell has no speed,
 * and a greyed-out speed row on one would read as a speed it happens to be at.
 */
export interface CellConfigOptions {
  /** The entry in the selected cell, or nothing. */
  entry(): WaveEntry | undefined;
  /** The entry changed: mark the wave dirty and redraw everything. */
  onEdit(): void;
}

export function cellConfig({ entry, onEdit }: CellConfigOptions): HTMLElement | null {
  const e = entry();
  if (!e) return null;

  const rows: HTMLElement[] = [];
  if (isTieredRock(e)) {
    rows.push(
      choiceRow("SPEED", METEOR_SPEEDS, meteorSpeed(e), speedLabel, (speed) => {
        setMeteorSpeed(e, speed);
        onEdit();
      }),
    );
  }
  // The width, on its own test. It used to hang off the speed row's, and the
  // two came apart the day the torch got one: a torch is not a tier and has no
  // speed to set, and it is the one rock the game now leaves standing in a
  // single column all by itself, when a coil's dome comes off (`sim/coil.ts`).
  // So a torch draws SIZE and no SPEED, and every plain tier draws both.
  if (hasRockWidth(e)) {
    rows.push(
      choiceRow("SIZE", METEOR_SIZES, meteorSize(e), sizeLabel, (size: RockSize) => {
        setMeteorSize(e, size);
        onEdit();
      }),
    );
  }
  // The route, and the row it is taken along. The owner asked for a rock that
  // comes over a wall instead of down a column, and it is two rows here rather
  // than two more brushes for `WaveEntry.cross`'s reason: the pair says the
  // same sentence about a crossing rock and a falling one, and what changes is
  // how long the column stays true.
  //
  // The ROW row is only drawn once a route is chosen. A rock that falls has no
  // row to be authored at — it enters at the top like everything else — and a
  // row offered on one would be a number the field never reads.
  if (hasRockCross(e)) {
    const cross = rockCrossOf(e);
    rows.push(
      choiceRow("ROUTE", ROCK_CROSSINGS, cross, crossLabel, (next: RockCross | null) => {
        setRockCross(e, next);
        onEdit();
      }),
    );
    if (cross !== null) {
      rows.push(
        choiceRow("ROW", ROCK_CROSS_ROWS, rockRowOf(e), beadLabel, (row: number) => {
          setRockRow(e, row);
          onEdit();
        }),
      );
    }
  }
  if (authorsBody(e)) {
    rows.push(bodyRow(e, onEdit));
  }
  if (hasGhostPath(e)) {
    // THE GHOST's own row, and the second per-arrival fact in the game that
    // changes how a body *moves* rather than what it is. DOWN is the ordinary
    // fall; ACROSS prowls a row sideways, turns at each wall, and dives at the
    // ship when its temper runs out (`ghost.ts`). Not two brushes, for the
    // reason `WaveEntry.path` gives: the pair says the same sentence about
    // both, and what changes is how long it stays true.
    rows.push(
      choiceRow("PATH", GHOST_PATHS, ghostPathOf(e), pathLabel, (path: GhostPath) => {
        setGhostPath(e, path);
        onEdit();
      }),
    );
  }
  if (hasBeadCount(e)) {
    // THE STRAND's own row, and the third per-arrival fact in the game that
    // changes what an entry *is* rather than only how it moves. How many beads
    // hang on the thread is how many times the pair has to say the same two
    // halves of one sentence — not two creatures, for the reason
    // `WaveEntry.beads` gives, so it is a number here rather than four more
    // brushes in the palette.
    rows.push(
      choiceRow("BEADS", STRAND_COUNTS, beadCountOf(e), beadLabel, (beads: number) => {
        setBeadCount(e, beads);
        onEdit();
      }),
    );
  }
  if (hasCrawlerFields(e)) {
    // THE CRAWLER's two rows, and the fourth and fifth per-arrival facts in
    // the game. SEGMENTS is how many times the pair has to change control on
    // one body; SIDE is which wall it comes over, and it is offered as a
    // choice rather than left to the column because the column is also what
    // the radar strip announces — a wave may want a worm called on one side
    // and entering over the other (`WaveEntry.side`).
    rows.push(
      choiceRow("SEGMENTS", CRAWLER_COUNTS, crawlerCountOf(e), beadLabel, (segments: number) => {
        setCrawlerCount(e, segments);
        onEdit();
      }),
      choiceRow("SIDE", CRAWLER_SIDES, crawlerSideOf(e), sideLabel, (side: CrawlerSide) => {
        setCrawlerSide(e, side);
        onEdit();
      }),
    );
  }
  if (hasFenceGaps(e)) {
    // THE FENCE's own row, and the sixth per-arrival fact in the game — the
    // first that is a *set*. Which columns the wall is open in is the whole of
    // what this creature asks the pair to say out loud, so it is the one thing
    // about a wall an author composes anything else against (`WaveEntry.gaps`).
    rows.push(fenceGapsRow(e, onEdit, labelled));
    // And where it is cracked, which is the other half of the same question:
    // the gaps are what the *shield* answers and the cracks are what the
    // *cannon* does, and a wall is authored by deciding how much of each
    // answer it leaves the pair (`entry-fields-fence.ts`).
    rows.push(fenceCracksRow(e, onEdit, labelled));
  }
  if (!rows.length) return null;

  const box = document.createElement("div");
  box.className = "cell-config";
  box.append(...rows);
  return box;
}
