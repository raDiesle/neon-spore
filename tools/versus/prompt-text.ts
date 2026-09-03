/**
 * The text layout a vote prompt is set in: a wrapper, the two row shapes its
 * header uses, small-number words, lists, and how a value is spelled.
 *
 * It is generic — nothing here knows what a slot or a candidate is — which is
 * why it comes out of `prompt.ts` first. The prompt is read as prose by a
 * session three weeks late, so the wrapping is the part that has to be right
 * every time and is the part with no domain in it at all.
 */

const WIDTH = 78;
const WORDS = ["no", "one", "two", "three", "four", "five", "six"];

/**
 * A space the wrapper must not collapse or break on. The header rows line up
 * a name against its sentence with a fixed `  -  ` between them, and a greedy
 * wrapper that splits on `\s+` would eat exactly that alignment.
 */
const HARD = String.fromCharCode(1);

export function wrap(text: string, first = "", cont = first): string {
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
export function row(label: string, value: string): string {
  return wrap(value, `    ${label.padEnd(8)}`, " ".repeat(12));
}

/** `warm      -  "amber where the ship is violet"`, as one unbreakable head. */
export function named(name: string, width: number, tail: string): string {
  return `${name.padEnd(width)}  -  `.replaceAll(" ", HARD) + tail;
}

export const count = (n: number): string => WORDS[n] ?? String(n);
export const Count = (n: number): string => count(n).replace(/^./, (c) => c.toUpperCase());

export function list(items: readonly string[], joiner = "and"): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${joiner} ${items[items.length - 1]}`;
}

export const quoted = (items: readonly string[], joiner = "and"): string =>
  list(
    items.map((i) => `\`${i}\``),
    joiner,
  );

/** A value as the prompt spells it: a function as its source, a colour quoted. */
export function show(value: unknown): string {
  if (typeof value === "function") return value.toString();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map(show).join(", ")}]`;
  if (value === undefined) return "(absent)";
  return JSON.stringify(value);
}

/** Indent a rendered value under a step, keeping its own inner shape. */
export function block(text: string): string[] {
  const lines = text.split("\n");
  const rest = lines.slice(1).filter((l) => l.trim());
  const pad = rest.length ? Math.min(...rest.map((l) => l.length - l.trimStart().length)) : 0;
  return lines.map((l, i) => `          ${i === 0 ? l : l.slice(pad)}`);
}
