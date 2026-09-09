import { edgeLit, faceHex, PALETTE, type Shard, shardAt } from "@neon-spore/render";
import { label, page, r, WIDTH } from "./page.js";
import { piecesOf, SUBJECTS, type Subject } from "./subjects.js";

/**
 * Every break the bench knows, drawn across time.
 *
 * One row per subject, one column per moment, and the whole arc of a break on
 * one page. That is the thing a running preview cannot give a session: a break
 * lasts about a second, and the only way to judge the shape of one is to see
 * where the pieces are at 0.05 s and at 0.9 s **at the same time**.
 *
 * It draws the pieces `shatter.ts` cuts and colours them with `faceHex` and
 * `edgeLit`, which are the field's own two rules exported for exactly this: a
 * sheet that mixed its own colours would keep looking right on the day the game
 * stopped.
 */

/** The moments each row is drawn at, in seconds.
 *
 * Uneven on purpose, and this is the only interesting number on the page. A
 * break is nearly over in its first fifth of a second — that is where the
 * pieces separate, and where a tuning is right or wrong — so four of the seven
 * columns are spent there and the last three are the long settle. Even spacing
 * gave four identical pictures of debris lying on a floor. */
const MOMENTS = [0, 0.05, 0.12, 0.22, 0.4, 0.7, 1.05];

const LEFT = 32;
const CELL = (WIDTH - LEFT * 2) / MOMENTS.length;
const ROW_H = 152;
/**
 * One body-width in sheet pixels (`subjects.ts` scales every contour to one).
 *
 * A fifth of a cell, which looks far too small written down and is right: a
 * piece thrown at one body-width a second for a second lands three body-widths
 * out, so the *break* is five times the size of the body it came from. At a
 * third of a cell the rows ran into each other and every column was drawn over
 * its neighbour, which made the sheet useless for the one thing it is for.
 */
const SCALE = CELL * 0.2;

function polygon(s: Shard, t: number, subject: Subject): string {
  const pose = shardAt(s, t, subject.fall);
  if (pose.alpha <= 0.01) return "";
  const pts = s.points
    .map((p) => {
      const c = Math.cos(pose.angle);
      const sn = Math.sin(pose.angle);
      return `${r((p.x * c - p.y * sn) * SCALE)},${r((p.x * sn + p.y * c) * SCALE)}`;
    })
    .join(" ");
  const lit = edgeLit(s.depth, pose.landed);
  const stroke =
    lit > 0.02
      ? ` stroke="${subject.hex}" stroke-opacity="${r(lit * 0.55)}" stroke-width="0.9" stroke-linejoin="round"`
      : "";
  return `<polygon points="${pts}" fill="${faceHex(s.depth, subject.hex, subject.dark)}" fill-opacity="${r(pose.alpha)}"${stroke} transform="translate(${r(pose.x * SCALE)} ${r(pose.y * SCALE)})"/>`;
}

/** How far down the cell the body's own middle sits. High enough that the
 * floor and everything settled on it is still inside the row. */
const BODY_Y = 72;

/** One cell: the pieces of one subject at one moment, about the body's middle. */
function cell(subject: Subject, pieces: readonly Shard[], t: number, x: number, y: number): string {
  const floor = subject.fall.floor;
  const ground =
    floor === undefined
      ? ""
      : `<line x1="${r(-CELL * 0.44)}" y1="${r(floor * SCALE)}" x2="${r(CELL * 0.44)}" y2="${r(floor * SCALE)}" stroke="${PALETTE.grid}" stroke-width="1"/>`;
  const body = pieces.map((s) => polygon(s, t, subject)).join("");
  return `    <g transform="translate(${r(x)} ${r(y)})">${ground}${body}</g>`;
}

function row(subject: Subject, top: number): string {
  const pieces = piecesOf(subject);
  const cells = MOMENTS.map((t, i) =>
    cell(subject, pieces, t, LEFT + CELL * (i + 0.5), top + BODY_Y),
  ).join("\n");
  const stamps = MOMENTS.map((t, i) =>
    label(LEFT + CELL * (i + 0.5), top + ROW_H - 8, `${t.toFixed(2)}s`, 8, PALETTE.dim, "middle"),
  ).join("\n    ");
  return `  <g>
    <line x1="${LEFT}" y1="${r(top)}" x2="${WIDTH - LEFT}" y2="${r(top)}" stroke="${PALETTE.grid}"/>
    ${label(LEFT, top + 20, subject.name, 12, PALETTE.pod)}
    ${label(LEFT, top + 36, subject.note, 9, PALETTE.dim)}
    ${label(WIDTH - LEFT, top + 20, `${pieces.length} pieces`, 9, PALETTE.dim, "end")}
${cells}
    ${stamps}
  </g>`;
}

export function sheet(): string {
  let y = 86;
  const rows: string[] = [];
  for (const s of SUBJECTS) {
    rows.push(row(s, y));
    y += ROW_H;
  }
  return page("NEON SPORE · BREAKS", y + 24, rows.join("\n"));
}
