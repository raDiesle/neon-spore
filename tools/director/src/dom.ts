/**
 * The two element helpers every panel in the director builds its rows out of.
 *
 * They lived in `checks-dom.ts` until the TO CHECK sheet was removed, which is
 * a bad place for them and always was: seven modules with nothing to do with
 * checks imported from it, so deleting a sheet took the vocabulary of the whole
 * director with it. Here they belong to nobody, which is what they always were.
 */

export function el(tag: string, cls = "", text = ""): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

export function button(label: string, cls = ""): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.textContent = label;
  return b;
}
