/**
 * The little of markdown the spec actually writes, turned into DOM: headings,
 * paragraphs, bullets, blockquotes and tables, with bold, italics, code and
 * links inline. It exists because the panels used to show one parsed sentence
 * per entry while the paragraph that argued for it stayed in the file — the
 * Jammer's whole design is three sentences the director never showed.
 *
 * Text goes in through `textContent`, never `innerHTML`: the spec is a
 * trusted file, but a renderer that can be talked into markup is a renderer
 * whose output nobody can reason about.
 */

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]*)\]\([^)]*\)/g;

/** `**bold**`, `*italic*`, `` `code` `` and `[text](url)` — the link keeps its text. */
export function inline(target: HTMLElement, text: string): void {
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) target.appendChild(document.createTextNode(text.slice(last, at)));
    if (m[1] !== undefined) target.appendChild(tag("b", m[1]));
    else if (m[2] !== undefined) target.appendChild(tag("i", m[2]));
    else if (m[3] !== undefined) target.appendChild(tag("code", m[3]));
    else target.appendChild(document.createTextNode(m[4] ?? ""));
    last = at + m[0].length;
  }
  target.appendChild(document.createTextNode(text.slice(last)));
}

function tag(name: string, text: string): HTMLElement {
  const el = document.createElement(name);
  el.textContent = text;
  return el;
}

function isTable(line: string): boolean {
  return line.trim().startsWith("|");
}

function isBullet(line: string): boolean {
  return /^[-*]\s+/.test(line.trim());
}

/**
 * `1. ` and its siblings. The naming rules are four numbered items that read as
 * one wall of text if this is missed, which is exactly what they must not be —
 * rule 3 overrides the other two and the numbers are how that is said.
 */
function isNumbered(line: string): boolean {
  return /^\d+\.\s+/.test(line.trim());
}

function isBlock(line: string): boolean {
  const t = line.trim();
  return (
    t === "" || t.startsWith("#") || t.startsWith(">") || isTable(t) || isBullet(t) || isNumbered(t)
  );
}

function cells(line: string): string[] {
  return line
    .trim()
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

function table(out: HTMLElement, lines: string[], start: number): number {
  const el = document.createElement("table");
  el.className = "md-table";
  let i = start;
  let head = true;
  const body = document.createElement("tbody");
  while (i < lines.length && isTable(lines[i] ?? "")) {
    const row = cells(lines[i]!);
    i++;
    if (row.every((c) => /^:?-+:?$/.test(c) || c === "")) continue;
    const tr = document.createElement("tr");
    for (const cell of row) {
      const td = document.createElement(head ? "th" : "td");
      inline(td, cell);
      tr.appendChild(td);
    }
    if (head) {
      const thead = document.createElement("thead");
      thead.appendChild(tr);
      el.appendChild(thead);
      head = false;
    } else {
      body.appendChild(tr);
    }
  }
  el.appendChild(body);
  out.appendChild(el);
  return i;
}

function quote(out: HTMLElement, lines: string[], start: number): number {
  const text: string[] = [];
  let i = start;
  while (i < lines.length && lines[i]!.trim().startsWith(">")) {
    text.push(lines[i]!.trim().replace(/^>\s?/, ""));
    i++;
  }
  const el = document.createElement("blockquote");
  inline(el, text.join(" ").trim());
  out.appendChild(el);
  return i;
}

/** An item, plus any indented continuation lines under it. */
function list(out: HTMLElement, lines: string[], start: number, ordered: boolean): number {
  const el = document.createElement(ordered ? "ol" : "ul");
  const starts = ordered ? isNumbered : isBullet;
  const marker = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
  let i = start;
  let item: HTMLElement | null = null;
  const parts: string[] = [];
  const flush = (): void => {
    if (item) inline(item, parts.join(" ").trim());
    parts.length = 0;
  };
  while (i < lines.length) {
    const line = lines[i]!;
    if (starts(line)) {
      flush();
      item = document.createElement("li");
      el.appendChild(item);
      parts.push(line.trim().replace(marker, ""));
    } else if (item && line.trim() !== "" && !isBlock(line)) {
      parts.push(line.trim());
    } else {
      break;
    }
    i++;
  }
  flush();
  out.appendChild(el);
  return i;
}

function paragraph(out: HTMLElement, lines: string[], start: number): number {
  const parts: string[] = [];
  let i = start;
  while (i < lines.length && !isBlock(lines[i] ?? "")) {
    parts.push(lines[i]!.trim());
    i++;
  }
  const p = document.createElement("p");
  inline(p, parts.join(" "));
  out.appendChild(p);
  return i;
}

export function renderMarkdown(container: HTMLElement, text: string): void {
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (trimmed === "") {
      i++;
    } else if (isTable(trimmed)) {
      i = table(container, lines, i);
    } else if (trimmed.startsWith(">")) {
      i = quote(container, lines, i);
    } else if (isBullet(trimmed)) {
      i = list(container, lines, i, false);
    } else if (isNumbered(trimmed)) {
      i = list(container, lines, i, true);
    } else if (trimmed.startsWith("#")) {
      const level = Math.min(6, (trimmed.match(/^#+/)?.[0].length ?? 1) + 2);
      const h = document.createElement(`h${level}`);
      inline(h, trimmed.replace(/^#+\s*/, ""));
      container.appendChild(h);
      i++;
    } else {
      i = paragraph(container, lines, i);
    }
  }
}

/**
 * The expander a panel entry gets when the spec says more about it than the
 * one line the table carried. Shut by default — the panels are lists first,
 * and a list of nine open essays is not one — with the file and section it
 * came from on the summary, so what is being read is never in doubt.
 */
export function detailBox(detail: string, ref: string, label = "FULL TEXT"): HTMLElement {
  const box = document.createElement("details");
  box.className = "more";

  const summary = document.createElement("summary");
  summary.textContent = ref ? `${label} — ${ref}` : label;
  box.appendChild(summary);

  const body = document.createElement("div");
  body.className = "md";
  renderMarkdown(body, detail);
  box.appendChild(body);
  return box;
}
