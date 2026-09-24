/**
 * Merging the director's `SLOT_POSE` map when a lane and the trunk both
 * changed its rows
 *
 * `tools/director/src/versus-pose.ts` holds one row a VERSUS slot, written by
 * the lane that opens the slot and taken out by `adopt` and `drop`
 * (`tools/versus/pose-row.ts`). It is the other file every slot touches, and
 * unlike `candidates/registry.ts` it is not generated, so it cannot be settled
 * by running a command: two lanes each adding a row, or one adding while
 * another's `drop` takes out the last, edit the same two lines and git stops
 * the landing on an agreement.
 *
 * The rows are keyed by slot, which makes the merge `queue-merge.ts`'s: start
 * from the trunk's rows, take every row either side added, changed or took
 * out, and append the lane's new ones in the order it wrote them. **It refuses
 * rather than decide** — both sides giving one slot different poses, or both
 * rewriting anything outside the map, returns `null` and the landing stops the
 * way it always did.
 */

export const POSE_FILE = "tools/director/src/versus-pose.ts";

const OPEN = "const SLOT_POSE: Record<string, string> = {";
const ROW = /^ {2}("(?:[^"\\]|\\.)*"): (".*"),$/;

/** The file cut round the map: what is before it, its rows in order, what is after. */
interface Parts {
  before: string;
  rows: [string, string][];
  after: string;
}

/** `null` when the map is not where a hand-written file keeps it, or holds anything but rows. */
function parts(source: string): Parts | null {
  const at = source.indexOf(OPEN);
  if (at === -1) return null;
  const from = at + OPEN.length;
  const end = source.indexOf("};", from);
  if (end === -1) return null;
  const rows: [string, string][] = [];
  for (const line of source.slice(from, end).split("\n")) {
    if (line === "") continue;
    const row = ROW.exec(line);
    if (!row?.[1] || !row[2]) return null;
    rows.push([row[1], row[2]]);
  }
  return { before: source.slice(0, at), rows, after: source.slice(end + 2) };
}

/** The side that changed, or `null` when both did and differently — `undefined` is a row absent. */
function pick<T>(base: T, trunk: T, lane: T): T | null {
  if (lane === base || lane === trunk) return trunk;
  if (trunk === base) return lane;
  return null;
}

/**
 * The three-way merge, or `null` when the sides genuinely disagree.
 *
 * `base` is the version the lane branched from, `trunk` what it is landing
 * onto, `lane` what it wrote. The map is printed the way `pose-row.ts` leaves
 * it, `{}` when the last row is gone.
 */
export function mergePoses(base: string, trunk: string, lane: string): string | null {
  const b = parts(base);
  const t = parts(trunk);
  const l = parts(lane);
  if (!b || !t || !l) return null;
  const before = pick(b.before, t.before, l.before);
  const after = pick(b.after, t.after, l.after);
  if (before === null || after === null) return null;

  const baseAt = new Map(b.rows);
  const trunkAt = new Map(t.rows);
  const laneAt = new Map(l.rows);
  const order = t.rows.map(([slot]) => slot);
  for (const [slot] of l.rows) if (!trunkAt.has(slot)) order.push(slot);

  const rows: string[] = [];
  for (const slot of order) {
    const pose = pick(baseAt.get(slot), trunkAt.get(slot), laneAt.get(slot));
    if (pose === null) return null;
    if (pose !== undefined) rows.push(`  ${slot}: ${pose},`);
  }
  const map = rows.length === 0 ? `${OPEN}};` : `${OPEN}\n${rows.join("\n")}\n};`;
  return `${before}${map}${after}`;
}
