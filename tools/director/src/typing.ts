/**
 * Whether the keyboard belongs to a field rather than to the director.
 *
 * Three global `keydown` listeners ask it and each had written its own answer
 * down: the map's Backspace erases a creature, the stage's letters fire the
 * cannon, and the wave column's `[` and `]` open another wave — all three while
 * somebody may be typing a wave's name two panels away. The copies had already
 * drifted apart, and the shortest of them was the stage's, which is the one
 * holding the most keys: a letter typed into a `<select>` reached the field and
 * the cannon both.
 *
 * `unknown` rather than `Element` or `EventTarget`, because the three ask it of
 * different things — `document.activeElement` and an event's `target` — and
 * because the director's own tests answer with a stand-in that is neither
 * (`test/fake-dom.ts`). What is read is what every candidate has: a tag name,
 * and whether it says it is being edited.
 */
export function isTyping(target: unknown): boolean {
  const el = target as { tagName?: string; isContentEditable?: boolean } | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable === true;
}
