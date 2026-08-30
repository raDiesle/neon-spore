/**
 * The smallest document a skin can be built into, outside a browser.
 *
 * **Why this exists at all.** Every skin lives in `skins/` and builds itself
 * out of `document.createElementNS`. That is the right shape for the thing they
 * are — the director draws them live, and a skin that had to hand back a data
 * structure could not animate itself. The cost is that the one question a skin
 * exists to answer, *does this interior read*, was reachable only by starting a
 * server, opening the SHAPES tab and clicking a switcher.
 *
 * That cost was paid in full once. The lane that wrote `skins/chamber.ts` drew
 * its interior twice — once in a throwaway script so it could see anything at
 * all, and once for real — and landed the real one having never drawn it. Two
 * copies of one picture, and only one of them had been looked at.
 *
 * **A shim rather than a dependency.** `checks-dom.test.ts` and
 * `markdown.test.ts` already stand up hand-rolled documents for the same
 * reason, and the surface a skin actually touches is four methods wide: the
 * grep that decided this found `createElementNS`, `setAttribute`,
 * `appendChild` and one `getAttribute`. A DOM library would be several
 * megabytes to serve four calls, and it would still not be the browser the
 * director runs in — so it would buy fidelity it cannot deliver while costing
 * an install on every clone.
 *
 * **What it is not.** No layout, no styles, no measurement. `getBBox` and
 * `getTotalLength` are absent on purpose rather than stubbed: a skin that needs
 * to measure a path (CILIA does, through `contour-ruler.ts`) is asking a
 * question about rendered geometry, and a shim that answered it with a made-up
 * number would produce a still that quietly disagrees with the card. It throws
 * instead, and `skin-still.ts` says which skins that rules out.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/** Attribute values are escaped; nothing here ever writes text content. */
function esc(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/**
 * One element. Structurally an `SVGElement` as far as a skin can tell, which
 * is why `skin-still.ts` casts rather than widening every signature in
 * `skins/` to a union — the shim is a test double for a browser, and a type
 * that admitted it everywhere would let it leak into the director itself.
 */
export interface ShimElement {
  tag: string;
  attrs: Map<string, string>;
  kids: ShimElement[];
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  appendChild<T extends ShimElement>(kid: T): T;
}

export function element(tag: string): ShimElement {
  const self: ShimElement = {
    tag,
    attrs: new Map(),
    kids: [],
    setAttribute(name, value) {
      self.attrs.set(name, String(value));
    },
    getAttribute(name) {
      return self.attrs.get(name) ?? null;
    },
    appendChild(kid) {
      self.kids.push(kid);
      return kid;
    },
  };
  return self;
}

/** The element tree as markup, indented so a diff of a still is readable. */
export function serialise(node: ShimElement, indent = 0): string {
  const pad = "  ".repeat(indent);
  const attrs = [...node.attrs].map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
  if (node.kids.length === 0) return `${pad}<${node.tag}${attrs}/>`;
  const kids = node.kids.map((k) => serialise(k, indent + 1)).join("\n");
  return `${pad}<${node.tag}${attrs}>\n${kids}\n${pad}</${node.tag}>`;
}

/**
 * Install the shim as the global `document` for the duration of `fn`.
 *
 * A global, because that is what a skin reaches for and changing that is the
 * change this file exists to avoid making. Restored afterwards even when `fn`
 * throws, so a failing still never leaves a half-document behind for whatever
 * runs next in the same process — which, under `bun test`, is another test.
 */
export function withDocument<T>(fn: () => T): T {
  const g = globalThis as unknown as Record<string, unknown>;
  const hadDoc = "document" in g ? g.document : undefined;
  const hadStyle = "getComputedStyle" in g ? g.getComputedStyle : undefined;
  const root = element("html");
  g.document = {
    documentElement: root,
    createElementNS: (_ns: string, tag: string) => element(tag),
  };
  // NACRE-FILM reads a CSS variable off the page. There is no page, and an
  // empty string is what `getPropertyValue` genuinely returns for a variable
  // that is not set — so the skin takes its own fallback rather than being
  // handed a colour this file invented.
  g.getComputedStyle = () => ({ getPropertyValue: () => "" });
  try {
    return fn();
  } finally {
    if (hadDoc === undefined) delete g.document;
    else g.document = hadDoc;
    if (hadStyle === undefined) delete g.getComputedStyle;
    else g.getComputedStyle = hadStyle;
  }
}

export { SVG_NS };
