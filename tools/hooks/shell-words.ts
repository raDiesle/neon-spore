/**
 * A command line, split the way the rules in `guard.ts` need to read it: into
 * commands, and each command into its arguments.
 *
 * A shell glob is tested against the whole line, which is why a rule written
 * against `--am` also refused `--amend`, and why a commit message that merely
 * *quoted* a refused form was refused for quoting it. Here quotes, backslash
 * escapes and heredoc bodies are text rather than syntax: a `-m` argument that
 * reads like a footgun is one argument, and the body of a heredoc is data the
 * shell never runs.
 *
 * This is not a shell parser. It knows quoting, the operators that end a
 * command (`;`, `&&`, `||`, `|`, newline) and where a heredoc body ends;
 * expansion, subshells and redirection targets are left as ordinary words,
 * because no rule asks about them.
 */

/**
 * A backslash outside quotes escapes the next character — but a Windows path
 * is made of backslashes, and this repo runs on Windows. Only the characters
 * that mean something to the shell are treated as escaped; `C:\Users` keeps
 * both of its own.
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

/** Every command in `line`, each as its list of arguments with quoting removed. */
export function commandsIn(line: string): string[][] {
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
    if (c === "'") {
      const close = line.indexOf("'", i + 1);
      const end = close === -1 ? line.length : close;
      token += line.slice(i + 1, end);
      started = true;
      i = end;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      for (; j < line.length && line[j] !== '"'; j++) {
        if (line[j] === "\\" && QUOTED_ESCAPABLE.has(line[j + 1] ?? "")) {
          token += line[j + 1];
          j++;
        } else {
          token += line[j];
        }
      }
      started = true;
      i = j;
      continue;
    }
    if (c === "\\" && i + 1 < line.length) {
      const next = line.charAt(i + 1);
      token += BARE_ESCAPABLE.has(next) ? next : c + next;
      started = true;
      i++;
      continue;
    }
    if (c === "<" && line[i + 1] === "<") {
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
