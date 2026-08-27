import { describe, expect, test } from "bun:test";

/**
 * The renderer builds DOM, so the test brings the smallest document that can
 * answer `createElement` and `createTextNode` and then reads the tree back as
 * a string. Nothing here is a browser — what is being checked is the parse:
 * which lines become a table, which become a list, which join into one
 * paragraph, and that `**bold**` never survives as literal asterisks.
 */

interface Node {
  tag: string;
  textContent: string;
  kids: Node[];
  className: string;
  appendChild(kid: Node): void;
}

function node(tag: string): Node {
  const self: Node = {
    tag,
    textContent: "",
    kids: [],
    className: "",
    appendChild(kid: Node) {
      self.kids.push(kid);
    },
  };
  return self;
}

function serialize(n: Node): string {
  if (n.tag === "#text") return n.textContent;
  const inner = n.textContent + n.kids.map(serialize).join("");
  return `<${n.tag}>${inner}</${n.tag}>`;
}

(globalThis as unknown as { document: unknown }).document = {
  createElement: (tag: string) => node(tag),
  createTextNode: (text: string) => {
    const n = node("#text");
    n.textContent = text;
    return n;
  },
};

const { renderMarkdown } = await import("../src/markdown.js");

function render(markdown: string): string {
  const root = node("root");
  renderMarkdown(root as unknown as HTMLElement, markdown);
  return root.kids.map(serialize).join("");
}

describe("renderMarkdown", () => {
  test("wrapped lines are one paragraph, and bold is not asterisks", () => {
    expect(render("**The Jammer — dark strip.**\nWhile it is alive,\nthe radar blanks.")).toBe(
      "<p><b>The Jammer — dark strip.</b> While it is alive, the radar blanks.</p>",
    );
  });

  test("a blank line ends the paragraph", () => {
    expect(render("One.\n\nTwo.")).toBe("<p>One.</p><p>Two.</p>");
  });

  test("a link keeps its text and drops its target", () => {
    expect(render("see [latency](latency.md) for it")).toBe("<p>see latency for it</p>");
  });

  test("code spans and italics", () => {
    expect(render("`radar` is *owned*")).toBe("<p><code>radar</code> is <i>owned</i></p>");
  });

  test("a table keeps its header row and drops the separator", () => {
    const table = "| Phase | Tell |\n|---|---|\n| CROWN | 2 beats |";
    expect(render(table)).toBe(
      "<table><thead><tr><th>Phase</th><th>Tell</th></tr></thead>" +
        "<tbody><tr><td>CROWN</td><td>2 beats</td></tr></tbody></table>",
    );
  });

  test("a bullet swallows its indented continuation", () => {
    expect(render("- **Echo** — one second\n  earlier for one player\n- **Moulting**")).toBe(
      "<ul><li><b>Echo</b> — one second earlier for one player</li><li><b>Moulting</b></li></ul>",
    );
  });

  test("a numbered list is a list, not one run-on paragraph", () => {
    expect(render("1. Blob and slime.\n2. The name says\n   the behaviour.")).toBe(
      "<ol><li>Blob and slime.</li><li>The name says the behaviour.</li></ol>",
    );
  });

  test("a blockquote is one quote, however many lines it wraps over", () => {
    expect(render("> Status: three\n> of twenty built.")).toBe(
      "<blockquote>Status: three of twenty built.</blockquote>",
    );
  });

  test("a heading lands two levels down, so a spec h2 does not fight the panel's", () => {
    expect(render("## 10.2 Newly accepted")).toBe("<h4>10.2 Newly accepted</h4>");
  });

  test("a section with everything in it comes out in order", () => {
    const text = "# Title\n\nProse.\n\n- one\n\n> aside\n\n| a |\n|---|\n| b |";
    expect(render(text)).toBe(
      "<h3>Title</h3><p>Prose.</p><ul><li>one</li></ul><blockquote>aside</blockquote>" +
        "<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>",
    );
  });
});
