/**
 * `docs/queue.md` — the ordered work an autonomous run walks.
 *
 * It is a third list, and the two that already exist are the reason it has to
 * be. `bun run checks` derives obligations: work that landed and that nobody
 * has looked at. `docs/parked.md` holds offers: ideas nobody has decided to
 * do. Neither answers the question a run asks every twenty minutes — *what is
 * the next thing, and is somebody already on it* — so neither could be made
 * to carry it without stopping being what it is.
 *
 * An entry leaves by being **deleted**, the same rule as parked: once its
 * branch is on the trunk the history holds the work, and a queue of ticked
 * boxes is a queue nobody reads to the bottom of. Nothing here records
 * progress, because progress is derivable — a lane is done when its branch is
 * an ancestor of the trunk, and that fact survives a session dying mid-run,
 * which no file written by the session would.
 */

export interface Lane {
  title: string;
  /** The branch the lane is built on. One lane, one branch, one worktree. */
  branch: string;
  /**
   * The paths this lane may edit. Nothing else may touch them while it runs —
   * this is the whole of what keeps parallel lanes from meeting in a rebase.
   */
  owns: string[];
  /** What it is and what finished looks like, verbatim. */
  brief: string;
}

/** What git says about a lane's branch. Everything here is derived, not stored. */
export interface LaneFact {
  exists: boolean;
  /** Its tip is an ancestor of the trunk: the work is in. */
  landed: boolean;
  /** Commits it has that the trunk has not. */
  ahead: number;
  /** The worktree holding it, or "" — a lane with none has not been started. */
  worktree: string;
}

export type Status = "landed" | "flying" | "opened" | "waiting";

const HEADING = /^## (.+)$/;
const META = /^_(.+)_$/;

export function parseQueue(md: string): Lane[] {
  const lanes: Lane[] = [];
  const body = new Map<Lane, string[]>();
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    const heading = HEADING.exec(line.trim());
    if (heading) {
      const lane: Lane = { title: (heading[1] ?? "").trim(), branch: "", owns: [], brief: "" };
      lanes.push(lane);
      body.set(lane, []);
      continue;
    }
    const lane = lanes.at(-1);
    if (!lane) continue;
    const meta = META.exec(line.trim());
    if (meta && !lane.branch) {
      const [branch, owns] = (meta[1] ?? "").split("·");
      lane.branch = (branch ?? "").trim();
      lane.owns = (owns ?? "").trim().split(/\s+/).filter(Boolean);
      continue;
    }
    body.get(lane)?.push(line);
  }
  for (const lane of lanes) lane.brief = (body.get(lane) ?? []).join("\n").trim();
  return lanes.filter((lane) => lane.title && lane.branch);
}

export function statusOf(fact: LaneFact | undefined): Status {
  if (!fact?.exists) return "waiting";
  if (fact.landed) return "landed";
  if (fact.ahead > 0) return "flying";
  return "opened";
}

/**
 * Two lanes that own the same path, or one whose path sits inside another's.
 *
 * This is the only thing standing between "four sessions at once" and four
 * rebases that all conflict in the same file, so it is checked before a batch
 * starts rather than discovered when the second one tries to land.
 */
export function clashes(lanes: readonly Lane[]): string[] {
  const found: string[] = [];
  const live = lanes.filter((lane) => lane.owns.length > 0);
  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i];
      const b = live[j];
      if (!a || !b) continue;
      for (const one of a.owns) {
        for (const two of b.owns) {
          if (one === two || one.startsWith(`${two}/`) || two.startsWith(`${one}/`)) {
            found.push(
              `${a.branch} and ${b.branch} both own ${one === two ? one : `${one} / ${two}`}`,
            );
          }
        }
      }
    }
  }
  return found;
}

/** The first lane nobody has opened a branch for. Where a resumed run starts. */
export function nextLane(
  lanes: readonly Lane[],
  facts: ReadonlyMap<string, LaneFact>,
): Lane | null {
  return lanes.find((lane) => statusOf(facts.get(lane.branch)) === "waiting") ?? null;
}

const GLYPH: Record<Status, string> = {
  landed: "✓",
  flying: "▶",
  opened: "·",
  waiting: "▢",
};

export function render(lanes: readonly Lane[], facts: ReadonlyMap<string, LaneFact>): string {
  if (lanes.length === 0) {
    return "the queue is empty — bun run burn --candidates for what could go in it";
  }
  const counted = { landed: 0, flying: 0, opened: 0, waiting: 0 };
  const rows: string[] = [];
  const width = Math.min(46, Math.max(...lanes.map((lane) => lane.title.length)));
  for (const lane of lanes) {
    const fact = facts.get(lane.branch);
    const status = statusOf(fact);
    counted[status]++;
    const tail =
      status === "flying"
        ? `${fact?.ahead} commit(s)${fact?.worktree ? ` · ${fact.worktree}` : ""}`
        : status === "opened"
          ? "branch open, nothing on it yet"
          : "";
    rows.push(
      `  ${GLYPH[status]} ${lane.title.padEnd(width)}  ${lane.branch}${tail ? `  ${tail}` : ""}`,
    );
  }
  const head = `QUEUE — ${counted.landed} landed, ${counted.flying} in flight, ${counted.waiting} waiting`;
  const clash = clashes(lanes.filter((lane) => statusOf(facts.get(lane.branch)) !== "landed"));
  return [
    head,
    "",
    ...rows,
    ...(clash.length ? ["", "  ⚠ ownership clash:"] : []),
    ...clash.map((c) => `    ${c}`),
  ].join("\n");
}
