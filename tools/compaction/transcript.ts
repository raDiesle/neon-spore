/**
 * One Claude Code transcript read as the events the compaction trial is judged
 * on: the model calls and their context, the landings, the compactions, the
 * edits between them, and the two things that must not happen — a session
 * dying with "Prompt is too long", and a checkpoint nobody reads.
 *
 * The trial started on 29 September 2026: an automatic compaction is held back
 * until the item lands (`tools/hooks/defer-compact.ts`), the owner's words are
 * checkpointed before one (`tools/hooks/before-compact.ts`), and the window went
 * from 200k to 120k. `docs/token-budget.md` has the reasoning; this is how it is
 * checked. Pure: text in, events out.
 */

export interface Call {
  at: number;
  /** Input, cache read and cache write, in tokens: what the call re-read. */
  context: number;
}

export interface Compaction {
  at: number;
  /** The context when it fired, from the boundary's own metadata. */
  pre: number;
  trigger: string;
  /** An edit was made since the session's last landing: the cut fell inside an item. */
  midItem: boolean;
}

export interface Session {
  calls: Call[];
  landings: number[];
  compactions: Compaction[];
  /** Times the harness answered "Prompt is too long": the ceiling failing. */
  tooLong: number[];
  /** Times the session opened a checkpoint `before-compact.ts` wrote. */
  checkpointReads: number[];
}

/** `bun run land` as a command of its own, anywhere in a compound one. */
const LAND = /(^|[;&|\n(])\s*bun run land\b/;
/** What `tools/land/say.ts` prints when a landing went through, since 4 September. */
const LANDED = "L A N D E D";
const EDITS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

type Block = { type?: string; name?: string; id?: string; input?: Record<string, unknown> };
type ResultBlock = { type?: string; tool_use_id?: string; content?: unknown };

function blocks<T>(content: unknown): T[] {
  return Array.isArray(content) ? (content.filter((b) => typeof b === "object" && b) as T[]) : [];
}

function contextOf(usage: Record<string, unknown> | undefined): number {
  if (usage === undefined) return 0;
  const n = (k: string): number => (typeof usage[k] === "number" ? (usage[k] as number) : 0);
  return n("input_tokens") + n("cache_read_input_tokens") + n("cache_creation_input_tokens");
}

/** Every event of one transcript, in the order the file holds them. */
export function readSession(text: string): Session {
  const session: Session = {
    calls: [],
    landings: [],
    compactions: [],
    tooLong: [],
    checkpointReads: [],
  };
  const seen = new Set<string>();
  const landIds = new Set<string>();
  let lastEdit = Number.NEGATIVE_INFINITY;
  let lastLand = Number.NEGATIVE_INFINITY;

  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    let entry: Record<string, unknown>;
    try {
      entry = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (entry.isSidechain === true || typeof entry.timestamp !== "string") continue;
    const at = Date.parse(entry.timestamp);
    const message = (entry.message ?? {}) as {
      id?: string;
      content?: unknown;
      usage?: Record<string, unknown>;
    };

    if (entry.subtype === "compact_boundary") {
      const meta = (entry.compactMetadata ?? {}) as { preTokens?: number; trigger?: string };
      session.compactions.push({
        at,
        pre: meta.preTokens ?? 0,
        trigger: meta.trigger ?? "",
        midItem: lastEdit > lastLand,
      });
    } else if (entry.type === "assistant") {
      const context = contextOf(message.usage);
      if (message.id !== undefined && !seen.has(message.id) && context > 0) {
        seen.add(message.id);
        session.calls.push({ at, context });
      }
      for (const b of blocks<Block & { text?: string }>(message.content)) {
        if (b.type === "text" && b.text?.startsWith("Prompt is too long")) session.tooLong.push(at);
        if (b.type !== "tool_use") continue;
        const input = b.input ?? {};
        if (b.name !== undefined && EDITS.has(b.name)) lastEdit = at;
        const said = String(input.file_path ?? input.command ?? "");
        if (said.includes("claude-checkpoint.md")) session.checkpointReads.push(at);
        if (b.name === "Bash" && b.id !== undefined && LAND.test(String(input.command ?? ""))) {
          landIds.add(b.id);
        }
      }
    } else if (entry.type === "user") {
      for (const b of blocks<ResultBlock>(message.content)) {
        // The banner, not the exit code: a `| tail` hides a failed land's.
        if (b.type !== "tool_result" || !landIds.has(b.tool_use_id ?? "")) continue;
        if (JSON.stringify(b.content ?? "").includes(LANDED)) {
          session.landings.push(at);
          lastLand = at;
        }
      }
    }
  }
  return session;
}

/**
 * Whether a project directory under `~/.claude/projects` belongs to this
 * checkout: the checkout's own, or one of its worktrees'. A prefix and a dash,
 * never a substring — a scratch directory whose path merely mentions the
 * repository is somebody else's sessions.
 */
export function isOurProject(dir: string, checkout: string): boolean {
  const own = checkout.replaceAll(/[^A-Za-z0-9]/g, "-");
  return dir === own || dir.startsWith(`${own}-`);
}
