/**
 * A command line, split the way the rules in `guard.ts` need to read it: into
 * commands, and each command into its arguments.
 *
 * A shell glob is tested against the whole line, which is why a rule written
 * against `--am` also refused `--amend`, and why a commit message that merely
 * *quoted* a refused form was refused for quoting it. Here quotes, escapes and
 * heredoc bodies are text rather than syntax: a `-m` argument that reads like a
 * footgun is one argument, and the body of a heredoc is data the shell never
 * runs.
 *
 * This is not a shell parser. It knows quoting, the operators that end a
 * command (`;`, `&&`, `||`, `|`, newline) and where a heredoc body ends;
 * expansion, subshells and redirection targets are left as ordinary words,
 * because no rule asks about them.
 *
 * It reads two dialects, because this session has two shells. The rules are the
 * same in both — `git add -A` is spelled `git add -A` in PowerShell — but the
 * quoting is not, and a splitter that reads the wrong one either loses an
 * argument or finds a command inside a string. The caller knows which tool the
 * line came from, so it says; nothing here guesses.
 */

/** Which shell typed the line. `posix` is bash; `powershell` is the Windows tool. */
export type Dialect = "posix" | "powershell";

/**
 * A backslash outside quotes escapes the next character — but a Windows path
 * is made of backslashes, and this repo runs on Windows. Only the characters
 * that mean something to the shell are treated as escaped; `C:\Users` keeps
 * both of its own. PowerShell has no such trouble: its escape is a backtick,
 * which escapes whatever follows it, and a backslash is only ever a separator.
 */
const BARE_ESCAPABLE = new Set([
  '"',
  "'",
  "`",
  "$",
  "&",
  "|",
  ";",
  "<",
  ">",
  "(",
  ")",
  " ",
  "\t",
  "\n",
  "\\",
]);
const QUOTED_ESCAPABLE = new Set(['"', "`", "$", "\\", "\n"]);
const DELIMITER_END = new Set([" ", "\t", "\n", ";", "&", "|", "<", ">"]);
/** A quoted run with no escape character of its own: a bash or PowerShell `'...'`. */
const EMPTY: ReadonlySet<string> = new Set<string>();

/** The word a heredoc body ends on, and where the word stops. `<<<` is a herestring, whose word is data rather than a body. */
function heredocDelimiter(line: string, at: number): { delim: string; next: number } | null {
  let i = at + 2;
  if (line[i] === "<") return null;
  if (line[i] === "-") i++;
  while (line[i] === " " || line[i] === "\t") i++;
  const quote = line[i] === "'" || line[i] === '"' ? line[i] : "";
  if (quote) {
    const close = line.indexOf(quote, i + 1);
    const end = close === -1 ? line.length : close;
    return { delim: line.slice(i + 1, end), next: end + 1 };
  }
  let delim = "";
  while (i < line.length && !DELIMITER_END.has(line.charAt(i))) {
    delim += line.charAt(i);
    i++;
  }
  return delim ? { delim, next: i } : null;
}

/** The index of the newline that closes a heredoc body, or the end of the line. */
function heredocEnd(line: string, from: number, delim: string): number {
  let i = from;
  while (i < line.length) {
    const newline = line.indexOf("\n", i);
    const end = newline === -1 ? line.length : newline;
    if (line.slice(i, end).trim() === delim) return end;
    if (newline === -1) return line.length;
    i = newline + 1;
  }
  return line.length;
}

/**
 * Where a PowerShell here-string ends: the first line that *starts* with `'@`
 * or `"@`, at column zero, as the language requires. The body between is data,
 * the same way a heredoc body is.
 */
function hereStringEnd(line: string, from: number, close: string): number {
  let newline = line.indexOf("\n", from);
  while (newline !== -1) {
    const start = newline + 1;
    if (line.startsWith(close, start)) return start + close.length;
    newline = line.indexOf("\n", start);
  }
  return line.length;
}

/**
 * The text of a quoted run and where it ends.
 *
 * `escapable` says which characters the dialect's escape actually escapes:
 * `null` for all of them, an empty set for a run that has none. In PowerShell a
 * doubled quote inside a run of the same quote is a literal one (`'it''s'`),
 * which is the only way to write one; in bash it is a close followed by a fresh
 * open, and `'a''b'` is `ab`.
 */
function readQuoted(
  line: string,
  at: number,
  quote: string,
  escapeChar: string,
  escapable: ReadonlySet<string> | null,
  doubledIsLiteral: boolean,
): { text: string; next: number } {
  let text = "";
  let i = at + 1;
  while (i < line.length) {
    const c = line.charAt(i);
    if (c === quote) {
      if (doubledIsLiteral && line[i + 1] === quote) {
        text += quote;
        i += 2;
        continue;
      }
      return { text, next: i + 1 };
    }
    if (
      c === escapeChar &&
      i + 1 < line.length &&
      (escapable === null || escapable.has(line.charAt(i + 1)))
    ) {
      text += line.charAt(i + 1);
      i += 2;
      continue;
    }
    text += c;
    i++;
  }
  return { text, next: i };
}

/** Every command in `line`, each as its list of arguments with quoting removed. */
export function commandsIn(line: string, dialect: Dialect = "posix"): string[][] {
  const ps = dialect === "powershell";
  const escapeChar = ps ? "`" : "\\";
  const commands: string[][] = [];
  let args: string[] = [];
  let token = "";
  let started = false;
  let heredoc: string | null = null;

  const endToken = () => {
    if (started) args.push(token);
    token = "";
    started = false;
  };
  const endCommand = () => {
    endToken();
    if (args.length > 0) commands.push(args);
    args = [];
  };

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" || c === '"') {
      // A single-quoted run is literal in both dialects; a double-quoted one
      // takes the dialect's escape.
      const escapable = c === "'" ? EMPTY : ps ? null : QUOTED_ESCAPABLE;
      const read = readQuoted(line, i, c, escapeChar, escapable, ps);
      token += read.text;
      started = true;
      i = read.next - 1;
      continue;
    }
    if (ps && c === "@" && (line[i + 1] === "'" || line[i + 1] === '"')) {
      // `@'...'@` — the body is data, like a heredoc's, and never a command.
      endToken();
      i = hereStringEnd(line, i + 2, `${line[i + 1]}@`) - 1;
      continue;
    }
    if (c === escapeChar && i + 1 < line.length) {
      const next = line.charAt(i + 1);
      token += ps || BARE_ESCAPABLE.has(next) ? next : c + next;
      started = true;
      i++;
      continue;
    }
    if (!ps && c === "<" && line[i + 1] === "<") {
      const found = heredocDelimiter(line, i);
      if (found) {
        heredoc = found.delim;
        endToken();
        i = found.next - 1;
        continue;
      }
      endToken();
      i++;
      continue;
    }
    if (c === "\n") {
      endCommand();
      if (heredoc !== null) {
        i = heredocEnd(line, i + 1, heredoc);
        heredoc = null;
      }
      continue;
    }
    if (c === ";" || c === "&" || c === "|") {
      endCommand();
      if (line[i + 1] === c) i++;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      endToken();
      continue;
    }
    token += c;
    started = true;
  }
  endCommand();
  return commands;
}
