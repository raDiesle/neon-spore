/**
 * VERSUS — the text a vote puts on the clipboard, and the only thing it leaves.
 *
 * A vote writes no file, no git, no localStorage and no server call. After the
 * prompt has been pasted and run, `main` holds one version and no candidates,
 * so the whole decision rides on one string built here. It lives beside
 * `variant.ts` rather than in the director because it is pure string work with
 * no DOM in it, which is exactly the part worth a test.
 *
 * The reader it is written for is a session pasting it three weeks late with
 * no memory of the vote. Two things follow, and they are the whole design.
 *
 * Every field carries its own `old -> new`, with the left-hand side read off
 * the live record at the moment of the vote rather than copied into the
 * candidate. A record that has since moved makes one left-hand value disagree
 * with the file, and step 0 turns that into a refusal instead of a silent
 * revert of somebody's later edit. The instruction there is to *name which
 * value disagreed*, never to work out which is newer: a cold session cannot
 * know, and guessing destroys work quietly.
 *
 * And nothing here predicts a result. `git grep` is emitted with no claim
 * about what it will find — the one place proposal 3's prompt was wrong was a
 * sentence asserting what that grep would return, and it was wrong about five
 * files. `docs/versus.md` carries the design and the template.
 */

import { currentValues, declaration, type Patch, patchedFields, type Variant } from "./variant.js";

/** One decision, and everything the prompt cannot derive from the registry. */
export interface Vote {
  /** The question, `ship:hull-skin`. */
  readonly slot: string;
  /** Every candidate offered in it, winner included, in registry order. */
  readonly candidates: readonly Variant[];
  /** The winner, one of `candidates` — or `null`, which is `KEEP CURRENT`. */
  readonly won: Variant | null;
  /**
   * What the records said *before* anything was applied, one entry per patch
   * of `won`, in the same order. Read with `readCurrent` at the moment of the
   * vote; never copied into a candidate, because a copy of a shipped value in
   * a tool is the drift this whole arrangement exists to prevent.
   */
  readonly current: readonly Record<string, unknown>[];
  /** The sentence a person typed before pressing. Quoted verbatim. */
  readonly why: string;
  /** The sha the vote was cast against. Shortened to git's own seven. */
  readonly head: string;
  /** Whether the tree was dirty then — the values may not be in any commit. */
  readonly dirty: boolean;
  /** `2026-08-27`. Passed in: nothing here reads a clock. */
  readonly date: string;
}

/** The `old` column, read off the live records. Call it before `apply`. */
export function readCurrent(v: Variant): Record<string, unknown>[] {
  return v.patches.map(currentValues);
}

const WIDTH = 78;
const WORDS = ["no", "one", "two", "three", "four", "five", "six"];

/**
 * A space the wrapper must not collapse or break on. The header rows line up
 * a name against its sentence with a fixed `  -  ` between them, and a greedy
 * wrapper that splits on `\s+` would eat exactly that alignment.
 */
const HARD = String.fromCharCode(1);

function wrap(text: string, first = "", cont = first): string {
  const out: string[] = [];
  let line = first;
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const started = line.length > (out.length === 0 ? first.length : cont.length);
    if (started && line.length + 1 + w.length > WIDTH) {
      out.push(line);
      line = cont + w;
    } else line = started ? `${line} ${w}` : line + w;
  }
  if (line.trim()) out.push(line);
  return out.join("\n").replaceAll(HARD, " ");
}

/** `    slot    creature:bulb`, wrapping onto the value column. */
function row(label: string, value: string): string {
  return wrap(value, `    ${label.padEnd(8)}`, " ".repeat(12));
}

/** `warm      -  "amber where the ship is violet"`, as one unbreakable head. */
function named(name: string, width: number, tail: string): string {
  return `${name.padEnd(width)}  -  `.replaceAll(" ", HARD) + tail;
}

const count = (n: number): string => WORDS[n] ?? String(n);
const Count = (n: number): string => count(n).replace(/^./, (c) => c.toUpperCase());

function list(items: readonly string[], joiner = "and"): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${joiner} ${items[items.length - 1]}`;
}

const quoted = (items: readonly string[], joiner = "and"): string =>
  list(
    items.map((i) => `\`${i}\``),
    joiner,
  );

/** A value as the prompt spells it: a function as its source, a colour quoted. */
function show(value: unknown): string {
  if (typeof value === "function") return value.toString();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map(show).join(", ")}]`;
  if (value === undefined) return "(absent)";
  return JSON.stringify(value);
}

/** Indent a rendered value under a step, keeping its own inner shape. */
function block(text: string): string[] {
  const lines = text.split("\n");
  const rest = lines.slice(1).filter((l) => l.trim());
  const pad = rest.length ? Math.min(...rest.map((l) => l.length - l.trimStart().length)) : 0;
  return lines.map((l, i) => `          ${i === 0 ? l : l.slice(pad)}`);
}

/**
 * One record's changes. Short values go in an aligned `old -> new` table; a
 * replacement function or a tuple of four stops gets its own before-and-after,
 * because a value that will not fit in a column is still a value that has to
 * be checked against the file before it is written.
 */
function changes(p: Patch, current: Record<string, unknown>): string[] {
  const out: string[] = [];
  const next = p.fields as Record<string, unknown>;
  const short: [string, string, string][] = [];
  const long: string[] = [];
  for (const f of patchedFields(p)) {
    const [o, n] = [show(current[f]), show(next[f])];
    if (o.length <= 28 && n.length <= 28 && !o.includes("\n") && !n.includes("\n")) {
      short.push([f, o, n]);
    } else long.push(f);
  }
  if (short.length > 0) {
    const fw = Math.max(...short.map((s) => s[0].length)) + 3;
    const ow = Math.max(...short.map((s) => s[1].length)) + 2;
    out.push("");
    for (const [f, o, n] of short) out.push(`          ${f.padEnd(fw)}${o.padEnd(ow)}->  ${n}`);
  }
  for (const f of long) {
    // A function is the one value the tool cannot quote off the file: it only
    // has the live one, and what `toString` hands back has been through the
    // transpiler, so it is what the record *computes* and not how the file
    // spells it. Saying "reads exactly this" there would fail step 0 on every
    // whitespace difference, which is a refusal that teaches a session to
    // ignore refusals. So the claim is weakened to exactly what is true.
    const fn = typeof current[f] === "function" || typeof next[f] === "function";
    out.push(
      "",
      wrap(
        fn
          ? `\`${f}\` is a function, and the tool can only read it back through ` +
              "the runtime, transpiled — compare what it computes, not how it is " +
              "spelled. Right now it computes this:"
          : `\`${f}\` reads exactly this right now —`,
        "      ",
      ),
      "",
    );
    out.push(...block(show(current[f])), "");
    out.push(
      wrap(
        fn ? "and it must compute exactly this instead:" : "— and must read exactly this instead:",
        "      ",
      ),
      "",
    );
    out.push(...block(show(next[f])));
  }
  return out;
}

/** `packages/render`, or both packages, as the slot's patches name them. */
function packagesOf(v: Variant): string[] {
  const seen = new Set(v.patches.map((p) => p.where.file.split("/").slice(0, 2).join("/")));
  return [...seen].sort();
}

/**
 * The whole text, for `ADOPT <name>` when `won` is a candidate and for
 * `KEEP CURRENT` when it is null. The two forms differ in five places and no
 * others — the `won` row, the `lost` rows, steps 1 to 3 and step 6's
 * `shapes:report`, step 7's staging list, and the trailers — which is what
 * `test/prompt.test.ts` holds them to. A keep is an adoption whose file list
 * happens to be empty, and making it look like a different, easier kind of job
 * is how a decided slot survives on the sheet with a vote button still under it.
 */
export function votePrompt(vote: Vote): string {
  const { slot, candidates, won, why, head, dirty, date } = vote;
  const shape = candidates[0];
  if (!shape) throw new Error(`votePrompt: ${slot} has no candidates`);
  if (won && !candidates.includes(won)) {
    throw new Error(`votePrompt: ${won.name} is not a candidate of ${slot}`);
  }
  for (const c of candidates) {
    for (const p of c.patches) {
      // Not a style rule. The simulation is not votable, and a prompt that
      // ever named a path under it would be asking for the one change this
      // whole directory exists to stay out of.
      if (p.where.file.startsWith("packages/sim/")) {
        throw new Error(`votePrompt: ${slot} patches ${p.where.file} — sim is not votable`);
      }
    }
  }
  if (won && vote.current.length !== won.patches.length) {
    throw new Error(
      `votePrompt: ${won.name} has ${won.patches.length} patches and ` +
        `${vote.current.length} current readings — they are read per patch, in order`,
    );
  }

  const subject = slot.slice(slot.indexOf(":") + 1).replace(/-/g, " ");
  const pkgs = packagesOf(shape);
  const dirs = candidates.map((c) => c.dir);
  const nameWidth = Math.max(...candidates.map((c) => c.name.length));
  const isContent = (won?.patches ?? []).some((p) => p.where.file.startsWith("packages/content/"));
  const files = [...new Set((won?.patches ?? []).map((p) => p.where.file))];
  const out: string[] = [];

  // ── the header, and what was decided ────────────────────────────────────
  out.push(
    wrap(
      `Neon Spore, on \`main\`. ${Count(candidates.length)} candidate ` +
        `look${candidates.length === 1 ? "" : "s"} for the ${subject} ` +
        "were drawn side by side in the director's VERSUS tab — one world, one " +
        "frame, animated, both sides through the shipping renderer at 380 x 820 " +
        "CSS pixels, uncapped — and one was chosen by eye. Adopt what won, " +
        "remove every candidate in the slot, commit.",
    ),
    "",
    row("slot", slot),
  );
  if (won) out.push(row("won", named(won.name, nameWidth, `"${won.sentence}"`)));
  else out.push(row("won", named("current", nameWidth, `nothing changes in ${quoted(pkgs)}`)));
  for (const c of candidates) {
    if (c === won) continue;
    out.push(row("lost", named(c.name, nameWidth, `"${c.sentence}"`)));
  }
  out.push(
    row("why", why),
    row("voted", `${date}, against ${head.slice(0, 7)}, tree ${dirty ? "dirty" : "clean"}`),
    "",
  );

  // ── 0 ───────────────────────────────────────────────────────────────────
  out.push(
    wrap(
      "**0. BEFORE ANYTHING ELSE.** Every change below is written `old -> new`. " +
        "If a left-hand value is not what the file says right now, this prompt is " +
        "stale — the record moved after the vote, or the candidate did. Stop, and " +
        "say which value disagreed and what it says instead. Do not work out which " +
        "is newer, do not adopt the spirit of it, and do not re-run the comparison " +
        "yourself.",
    ),
    "",
  );

  if (won) {
    // ── 1 ─────────────────────────────────────────────────────────────────
    const dirs1 = new Set(files.map((f) => f.slice(0, f.lastIndexOf("/"))));
    const where =
      dirs1.size === 1 ? `, ${files.length > 1 ? "both" : ""} under \`${[...dirs1][0]}\`` : "";
    out.push(
      wrap(
        `**1. ADOPT \`${won.name}\`.** ${Count(files.length)} ` +
          `file${files.length === 1 ? "" : "s"}${where}, and these values are ` +
          "the whole of it.",
      ),
    );
    won.patches.forEach((p, i) => {
      const letter = String.fromCharCode(97 + i);
      const rest = Object.keys(p.target).filter((k) => !patchedFields(p).includes(k));
      out.push("", `  (${letter}) ${declaration(p.where)}`);
      out.push(...changes(p, vote.current[i] ?? {}));
      out.push("");
      out.push(
        wrap(
          (rest.length > 0 && rest.length <= 6
            ? `${quoted(rest)} do not change. `
            : "No other field of this record changes. ") +
            `The doc comment directly above \`${p.where.symbol}\` is the file's ` +
            "claim about it, not decoration — read it, and if this change makes " +
            "any clause of it false, rewrite that clause. Do not delete it, and " +
            "do not leave it standing if it is now wrong.",
          "      ",
        ),
      );
    });
    out.push("");

    // ── 2 ─────────────────────────────────────────────────────────────────
    const symbols = [...new Set(won.patches.map((p) => p.where.symbol))];
    out.push(
      wrap(
        "**2. FIND THE READERS THE VOTE DID NOT SHOW YOU.** Run " +
          `${symbols.length === 1 ? "it" : "each of these"}, and read the output ` +
          "rather than watching it exit:",
      ),
      "",
    );
    for (const s of symbols) out.push(`        git grep -n "\\b${s}\\b" -- packages apps tools`);
    out.push(
      "",
      wrap(
        "Every hit is a reader of a record this prompt just changed. The " +
          `${count(files.length)} file${files.length === 1 ? "" : "s"} under step 1 ` +
          `${files.length === 1 ? "is the one" : "are the ones"} it changed on ` +
          "purpose. For each of the others decide only this: does it draw the " +
          `${subject} somewhere the vote did not show — a menu, a sheet, a card, a ` +
          "test that pins a number? Name what you find, in the report and in step " +
          '7\'s trailer. Do not "fix" any of them, and do not add a second record ' +
          "so that one of them can keep the old numbers.",
      ),
      "",
    );

    // ── 3 ─────────────────────────────────────────────────────────────────
    if (isContent) {
      out.push(
        "**3. REGENERATE WHAT IS DERIVED FROM THEM.**",
        "",
        "        bun run shapes",
        "",
        wrap(
          "`tools/shape-sheet/shape-sheet.svg` and " +
            "`tools/shape-sheet/motion-sheet.svg` are committed files built from " +
            "the records step 1 just changed, and nothing in `bun run check` would " +
            "notice one of them becoming a lie. A derived artefact that is " +
            "committed goes stale in silence, so run this and stage whatever it " +
            "rewrites. If it rewrites nothing, stage nothing — that is a correct " +
            "outcome, not a failure.",
        ),
        "",
      );
    }
  }

  // ── 4 ───────────────────────────────────────────────────────────────────
  out.push(
    wrap(
      '**4. REMOVE THE SLOT.** Every candidate in it, including one that won. "Removed" means, exactly:',
    ),
    "",
  );
  for (const d of dirs) out.push(`        git rm -r ${d}`);
  out.push(
    "",
    wrap(
      `— the whole directory${dirs.length === 1 ? "" : " each time"}, not the one ` +
        "file you can see, because a candidate may have grown a helper beside it. " +
        "Then, in `tools/versus/candidates/index.ts`, delete the " +
        `${count(dirs.length)} \`import\` line${dirs.length === 1 ? "" : "s"} that ` +
        `named ${dirs.length === 1 ? "that directory" : "those directories"} and ` +
        `the ${dirs.length === 1 ? "entry it" : `${count(dirs.length)} entries they`} ` +
        "contributed to the `VARIANTS` array. Nothing else in the repository " +
        `refers to ${dirs.length === 1 ? "it" : "any of them"}; if the typecheck says ` +
        "otherwise, that is a real finding — report it, do not add an export to " +
        "satisfy it.",
    ),
    "",
    wrap(
      `A winning candidate's directory goes too. Its values live in ${quoted(pkgs)} ` +
        "now, and a second copy of them in a tool is the drift this whole " +
        "arrangement exists to prevent.",
    ),
    "",
    wrap(
      "If `VARIANTS` ends up empty, leave it as an empty array and leave the " +
        "file. `tools/versus/variant.ts`, `seed.ts`, `prompt.ts`, `run.ts` and " +
        "`candidates/index.ts` all stay whether or not a slot is open — they are " +
        "the seam, not scaffolding, the way `Effects` stays whether or not " +
        "anything is exploding.",
    ),
    "",
  );

  // ── 5 ───────────────────────────────────────────────────────────────────
  const forbidden = quoted(
    ["variant", "candidate", "current", ...candidates.map((c) => c.name)],
    "or",
  );
  const untouched = [
    ...new Set(
      shape.patches.flatMap((p) =>
        Object.keys(p.target).filter((k) => !patchedFields(p).includes(k)),
      ),
    ),
  ];
  out.push(
    "**5. WHAT NOT TO DO.**",
    "",
    wrap(
      "Do not touch `packages/sim`. Nothing here is visible to the simulation " +
        "and nothing here may become visible to it.",
      "- ",
      "  ",
    ),
    wrap(
      "Do not add a variant flag, a second silhouette, a config field, an " +
        "optional argument or an `if` anywhere in `packages/render` or " +
        `\`packages/content\`. The game drew one ${subject} before this and draws ` +
        `one ${subject} after it. If you find yourself typing the words ` +
        `${forbidden} into either package, the instruction has been misread.`,
      "- ",
      "  ",
    ),
    wrap(
      (untouched.length > 0 && untouched.length <= 8
        ? `Do not touch ${quoted(untouched, "or")}, `
        : "Do not touch a field this vote did not name, ") +
        "or any record this slot did not name. The obvious next thought after a " +
        "change like this is one more change beside it, and that is a different " +
        "question that nobody voted on.",
      "- ",
      "  ",
    ),
    "",
  );

  // ── 6 ───────────────────────────────────────────────────────────────────
  out.push("**6. CHECK.**", "");
  if (won && isContent) out.push("        bun run shapes:report");
  out.push("        bun run check", "");
  if (won && isContent) {
    out.push(
      wrap(
        "`shapes:report` prints the patched silhouettes' geometry as numbers, and " +
          "the change of step 1 should be measurable in it — read the output, do " +
          "not just watch it exit 0.",
      ),
      "",
    );
  }
  out.push(
    wrap(
      "`bun run check` is the typecheck, biome and the full suite, including " +
        "`packages/render/test/frame.test.ts`, which draws whole frames through a " +
        "canvas that refuses a NaN coordinate or an unparseable colour, and " +
        "`tools/versus/test/variants.test.ts`, which will be running over a " +
        "registry with one fewer slot in it.",
    ),
    "",
  );

  // ── 7 ───────────────────────────────────────────────────────────────────
  out.push(wrap("**7. COMMIT,** on CLAUDE.md's four conditions. Stage only these paths:"), "");
  const staged: [string, string][] = [];
  for (const f of files) staged.push([f, ""]);
  staged.push(["tools/versus/candidates/index.ts", ""]);
  for (const d of dirs) staged.push([`${d}/`, "(deleted)"]);
  if (won && isContent) {
    staged.push(["tools/shape-sheet/shape-sheet.svg", "(if step 3 rewrote it)"]);
    staged.push(["tools/shape-sheet/motion-sheet.svg", "(if step 3 rewrote it)"]);
  }
  const pw = Math.max(...staged.map((s) => s[0].length)) + 5;
  for (const [path, note] of staged) out.push(`        ${note ? path.padEnd(pw) + note : path}`);
  out.push(
    "",
    wrap(
      "The subject is a sentence in this history's voice. The body carries the " +
        "`why` line above verbatim and names what lost — that sentence is the only " +
        "durable record of the decision, so do not compress it to a line naming " +
        "the winner.",
    ),
    "",
  );

  if (won) {
    out.push(
      wrap(
        `Trailers. Do **not** write a \`Check:\` for how the ${subject} reads on ` +
          "the field. That is what the vote was: at true size, at tempo, beside " +
          "the thing it replaces, and a trailer would put a settled thing back on " +
          "a list whose only value is that everything on it is real. Do write " +
          "exactly one `Check:` for each reader step 2 turned up that the vote did " +
          "not put on either phone — a title screen, a sheet, a card. One line, " +
          "prose, naming what to open.",
      ),
    );
  } else {
    out.push(
      wrap(
        `Trailers. Write no \`Check:\` at all. Not for how the ${subject} reads — ` +
          "that is what the vote was, and a trailer would put a settled thing back " +
          "on a list whose only value is that everything on it is real — and not " +
          `for a reader, because nothing in ${quoted(pkgs)} changed for one to read.`,
      ),
    );
  }
  out.push(
    "",
    wrap(
      "And if `bun run checks` lists an outstanding check naming this slot " +
        `(\`versus ${slot}\`, written when the candidates landed), that check is ` +
        `now settled: record it PASS with the note \`voted ${won ? won.name : "current"}\`.`,
    ),
    "",
  );

  return `${out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()}\n`;
}
