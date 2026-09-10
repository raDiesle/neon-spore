/**
 * The reading half of `bun run test:profile`: a JUnit report from `bun test`
 * turned into the list a session actually wants — which files carry the
 * minutes, and which cases inside them.
 *
 * Bun's JUnit reporter is used rather than a `bun test <file>` per file for
 * two reasons. It is the same run as `bun run check` — one process, every
 * file, in the order bun runs them — so the figure a file gets is the figure
 * it costs the check, not the figure plus a process start. And it comes with
 * a time per *case*, which is where the answer usually is: a file of fourteen
 * tests where four of them are ninety seconds is not a slow file, it is one
 * slow loop written four times.
 *
 * Pure: strings in, records out. `profile.ts` runs the suite and prints.
 */

export interface FileTime {
  /** Repository-relative, forward slashes whatever bun wrote. */
  readonly file: string;
  readonly tests: number;
  readonly seconds: number;
}

export interface CaseTime {
  readonly file: string;
  readonly name: string;
  readonly seconds: number;
}

export interface Profile {
  /** What the reporter says the whole run took. */
  readonly total: number;
  /** Every file, slowest first. */
  readonly files: readonly FileTime[];
  /** Every case, slowest first. */
  readonly cases: readonly CaseTime[];
}

const FILE = /<testsuite name="([^"]+)" file="\1" tests="(\d+)"[^>]*? time="([\d.]+)"/g;
const CASE = /<testcase name="([^"]+)" classname="[^"]*" time="([\d.]+)" file="([^"]+)"/g;
const TOTAL = /<testsuites [^>]*? time="([\d.]+)"/;

const slash = (path: string): string => path.replaceAll("\\", "/");

/** JUnit escapes the five XML characters in a name; a report reads better with them back. */
function unescapeXml(text: string): string {
  return text
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

export function parseJunit(xml: string): Profile {
  const files: FileTime[] = [];
  for (const m of xml.matchAll(FILE)) {
    files.push({ file: slash(m[1] ?? ""), tests: Number(m[2]), seconds: Number(m[3]) });
  }
  const cases: CaseTime[] = [];
  for (const m of xml.matchAll(CASE)) {
    cases.push({ file: slash(m[3] ?? ""), name: unescapeXml(m[1] ?? ""), seconds: Number(m[2]) });
  }
  files.sort((a, b) => b.seconds - a.seconds);
  cases.sort((a, b) => b.seconds - a.seconds);
  const total = Number(xml.match(TOTAL)?.[1] ?? 0);
  return { total, files, cases };
}

/** Seconds per top-level directory pair (`packages/render`), largest first. */
export function byPackage(files: readonly FileTime[]): [string, number][] {
  const sums = new Map<string, number>();
  for (const f of files) {
    const key = f.file.split("/").slice(0, 2).join("/");
    sums.set(key, (sums.get(key) ?? 0) + f.seconds);
  }
  return [...sums].sort((a, b) => b[1] - a[1]);
}

const secs = (s: number): string => `${s.toFixed(1)}s`.padStart(7);

/**
 * The report, as lines. The share column is what makes a number a decision:
 * a file at thirty percent of the run is the one to open, whatever its
 * absolute figure is on this machine.
 */
export function report(profile: Profile, top: number): string[] {
  const { total, files, cases } = profile;
  const sum = files.reduce((s, f) => s + f.seconds, 0);
  const lines: string[] = [];
  lines.push(
    `${files.length} files, ${cases.length} cases, ${total.toFixed(1)}s in all` +
      (sum > 0 && Math.abs(sum - total) / total > 0.05
        ? ` (${sum.toFixed(1)}s inside files; the rest is loading them)`
        : ""),
  );
  lines.push("");
  lines.push(`The ${Math.min(top, files.length)} slowest files:`);
  for (const f of files.slice(0, top)) {
    const share = total > 0 ? `${((100 * f.seconds) / total).toFixed(0)}%`.padStart(4) : "";
    lines.push(`${secs(f.seconds)} ${share}  ${String(f.tests).padStart(6)}  ${f.file}`);
  }
  lines.push("");
  lines.push(`The ${Math.min(top, cases.length)} slowest cases:`);
  for (const c of cases.slice(0, top)) {
    lines.push(`${secs(c.seconds)}  ${c.file.split("/").pop()} — ${c.name}`);
  }
  lines.push("");
  lines.push("By package:");
  for (const [dir, s] of byPackage(files)) {
    if (s < 0.5) continue;
    lines.push(`${secs(s)}  ${dir}`);
  }
  return lines;
}
