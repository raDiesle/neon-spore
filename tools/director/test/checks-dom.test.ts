import { describe, expect, test } from "bun:test";

/**
 * `restatedRows` builds DOM, so the test brings the smallest document that can
 * answer `createElement` and `createTextNode`, then reads the tree back as a
 * string — the same shape `markdown.test.ts` uses. A `Proxy` catches whatever
 * property each element gets assigned (`href`, `target`, `src`, `alt`, …)
 * without this stub having to know every one of them in advance.
 */

interface Node {
  tag: string;
  textContent: string;
  kids: Node[];
  className: string;
  attrs: Record<string, string>;
  appendChild(kid: Node): void;
}

function node(tag: string): Node {
  const self: Node = {
    tag,
    textContent: "",
    kids: [],
    className: "",
    attrs: {},
    appendChild(kid: Node) {
      self.kids.push(kid);
    },
  };
  return new Proxy(self, {
    set(target, prop, value) {
      if (typeof prop === "string" && !(prop in target)) target.attrs[prop] = String(value);
      else (target as unknown as Record<string, unknown>)[prop as string] = value;
      return true;
    },
  });
}

const SHOWN = ["href", "target", "src", "alt"];

function serialize(n: Node): string {
  if (n.tag === "#text") return n.textContent;
  const attrs = Object.entries(n.attrs)
    .filter(([k]) => SHOWN.includes(k))
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  const inner = n.textContent + n.kids.map(serialize).join("");
  return `<${n.tag}${attrs}>${inner}</${n.tag}>`;
}

(globalThis as unknown as { document: unknown }).document = {
  createElement: (tag: string) => node(tag),
  createTextNode: (text: string) => {
    const n = node("#text");
    n.textContent = text;
    return n;
  },
};

const { restatedRows } = await import("../src/checks-dom.js");

function rows(r: Parameters<typeof restatedRows>[0]): string[] {
  return restatedRows(r).map((row) => serialize(row as unknown as Node));
}

const BASE = { subject: "the mark", changed: "a third mark appears", decide: "does it read?" };

describe("restatedRows — where", () => {
  test("a shell command in backticks stays text, code inside", () => {
    const [, , , where] = rows({ ...BASE, where: "`bun run dev`, the wave list on the left" });
    expect(where).toBe("<p>where — <code>bun run dev</code>, the wave list on the left</p>");
  });

  test("a director place (full URL) becomes a link that opens in a new tab", () => {
    const [, , , where] = rows({ ...BASE, where: "http://localhost:4174/?tab=cards" });
    expect(where).toBe(
      '<p>where — <a href="http://localhost:4174/?tab=cards" target="_blank">' +
        "http://localhost:4174/?tab=cards</a></p>",
    );
  });

  test("a path relative to the director's own origin is also a link", () => {
    const [, , , where] = rows({ ...BASE, where: "/?tab=cards&wave=THE_WARDEN" });
    expect(where).toContain('<a href="/?tab=cards&wave=THE_WARDEN" target="_blank">');
  });
});

describe("restatedRows — before/after", () => {
  test("neither field prints a row when a lane wrote neither", () => {
    expect(rows({ ...BASE, where: "`bun run preview`" })).toHaveLength(4);
  });

  test("prose stays prose", () => {
    const withBefore = rows({
      ...BASE,
      before: "nothing, this is new",
      where: "`bun run preview`",
    });
    expect(withBefore).toHaveLength(5);
    expect(withBefore[3]).toBe("<p>before — nothing, this is new</p>");
  });

  test("a captured frame under docs/checks/ becomes an <img>", () => {
    const withAfter = rows({
      ...BASE,
      after: "docs/checks/0980374-after.png",
      where: "`bun run preview`",
    });
    expect(withAfter[3]).toBe(
      '<p>after — <img src="/docs/checks/0980374-after.png" ' +
        'alt="after: docs/checks/0980374-after.png"></img></p>',
    );
  });
});
