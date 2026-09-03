/**
 * The technical queue: what a session found and did not do, written in a shape
 * a fresh session can pick up cold. Parsing lives here rather than in the CLI
 * so the format is a test instead of a convention — an entry a later session
 * cannot act on without asking is not an entry, it is a note.
 *
 * `docs/parked.md` is read through the same parser on purpose. Work somebody
 * set aside half-done is the same kind of thing as work nobody started: a
 * session with nothing else in it can finish either, and only one of the two
 * rots while it waits.
 */

export type Source = "queue" | "parked";

export type Item = {
  readonly source: Source;
  readonly title: string;
  /** The `Found:` line's text — a date, and whatever the finder said after it. */
  readonly found: string;
  /** Paths the next session should open first. */
  readonly files: readonly string[];
  /** Everything under the heading, comments and blank edges removed. */
  readonly body: string;
};

const HEADING = /^##\s+(\S.*?)\s*$/;
const FOUND = /^-\s+\*\*Found:\*\*\s+(\d{4}-\d{2}-\d{2}\b.*)$/;
const FILES = /^-\s+\*\*Files:\*\*\s+(\S.*)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/**
 * Both files carry their own instructions — in an HTML comment, and in a fenced
 * block showing the format. A heading inside either is prose about an entry,
 * not an entry, and the queue must not offer it to somebody as work.
 */
function stripProse(md: string): string {
  let fenced = false;
  return md.replace(/<!--[\s\S]*?-->/g, "").replace(/^.*$/gm, (line) => {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      return "";
    }
    return fenced ? "" : line;
  });
}

function fieldOf(body: string, re: RegExp): string {
  for (const line of body.split("\n")) {
    const m = re.exec(line.trim());
    if (m?.[1] !== undefined) return m[1];
  }
  return "";
}

/** Splits a `Files:` value — a comma-separated list, backticks optional. */
export function splitFiles(value: string): string[] {
  return value
    .split(",")
    .map((p) => p.replace(/`/g, "").trim())
    .filter(Boolean);
}

/** Every `##` section of one file, in the order they are written. */
export function parseItems(md: string, source: Source): Item[] {
  const lines = stripProse(md).split("\n");
  const items: Item[] = [];
  let title: string | null = null;
  let body: string[] = [];

  const flush = (): void => {
    if (title === null) return;
    const text = body.join("\n").trim();
    items.push({
      source,
      title,
      found: fieldOf(text, FOUND),
      files: splitFiles(fieldOf(text, FILES)),
      body: text,
    });
  };

  for (const line of lines) {
    const m = HEADING.exec(line);
    if (m) {
      flush();
      title = m[1] ?? "";
      body = [];
    } else if (title !== null) {
      body.push(line);
    }
  }
  flush();
  return items;
}

/**
 * What is wrong with an entry, in the words a session would need to fix it.
 * Empty means the entry can be handed to somebody who has read nothing else.
 */
export function problemsIn(items: readonly Item[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const where = `${item.source}: "${item.title}"`;
    if (seen.has(item.title)) problems.push(`${where} — a second entry has this title`);
    seen.add(item.title);
    if (item.title.length > 80) problems.push(`${where} — title over 80 characters`);
    if (!ISO_DATE.test(item.found)) {
      problems.push(`${where} — no "- **Found:** YYYY-MM-DD, <branch>" line`);
    }
    if (item.files.length === 0) {
      problems.push(`${where} — no "- **Files:** <paths>" line`);
    }
    const prose = item.body
      .split("\n")
      .filter((l) => l.trim() && !l.trim().startsWith("- **"))
      .join("");
    if (!prose.trim()) problems.push(`${where} — nothing but fields; say what to change and why`);
  }
  return problems;
}

/**
 * Queue order. Parked work comes first: it is already half-done, and half-done
 * work is the only kind that gets harder the longer it sits.
 */
export function order(queue: readonly Item[], parked: readonly Item[]): Item[] {
  return [...parked, ...queue];
}

/** The markdown with one `##` section taken out. Throws if the title is not there. */
export function removeItem(md: string, title: string): string {
  const lines = md.split("\n");
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const m = HEADING.exec(line);
    if (!m) continue;
    if (start === -1 && m[1] === title) start = i;
    else if (start !== -1) {
      end = i;
      break;
    }
  }
  if (start === -1) throw new Error(`no entry titled ${JSON.stringify(title)}`);
  const kept = [...lines.slice(0, start), ...lines.slice(end)];
  return `${kept
    .join("\n")
    .replace(/\n{3,}$/, "\n\n")
    .trimEnd()}\n`;
}

/** Resolves what the CLI was given: a 1-based position, or part of a title. */
export function pick(items: readonly Item[], arg: string): Item {
  const n = Number(arg);
  const byPosition = Number.isInteger(n) && n >= 1 ? items[n - 1] : undefined;
  if (byPosition) return byPosition;
  const needle = arg.toLowerCase();
  const hits = items.filter((i) => i.title.toLowerCase().includes(needle));
  const only = hits[0];
  if (hits.length === 1 && only) return only;
  if (hits.length === 0) throw new Error(`nothing in the queue matches ${JSON.stringify(arg)}`);
  throw new Error(
    `${JSON.stringify(arg)} matches ${hits.length} entries: ${hits.map((h) => h.title).join(" | ")}`,
  );
}
