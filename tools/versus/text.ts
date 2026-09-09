/**
 * How a value and a paragraph are spelled where VERSUS talks to a person.
 *
 * It is generic — nothing here knows what a slot or a candidate is — which is
 * why it is its own file. `show` is the load-bearing half: it is how `adopt`
 * spells the value it is about to write into a shipped record, and how it
 * spells the value it expects to find there already, so the two comparisons
 * that decide whether an adoption is safe are made against one rendering.
 *
 * This was `prompt-text.ts`, the layout of a vote prompt nobody will paste
 * again. The owner said on 9 September 2026 that he decides a slot by saying
 * so in chat, so the prompt and its four companions went; the wrapper and the
 * value rendering stayed, because a command that writes a record still has to
 * say what it wrote.
 */

const WIDTH = 78;

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
  return out.join("\n");
}

export function list(items: readonly string[], joiner = "and"): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${joiner} ${items[items.length - 1]}`;
}

export const quoted = (items: readonly string[], joiner = "and"): string =>
  list(
    items.map((i) => `\`${i}\``),
    joiner,
  );

/**
 * A value as TypeScript spells it: a function as its source, a colour quoted,
 * a tuple in brackets.
 *
 * `adopt` writes this text straight into a record, so what comes out has to be
 * a valid expression and not a description of one. A function is the one value
 * it cannot honestly write — `toString` hands back what the transpiler made,
 * not how the file spells it — which is why `adopt` refuses a function field
 * outright rather than trying.
 */
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
