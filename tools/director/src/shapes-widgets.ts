/**
 * The two things every control row is built out of: a button, and a named
 * group around a row of them.
 *
 * Their own file because both axis files need them — `shapes-axes.ts` for
 * SKIN, MOTION and LIGHT, `shapes-effect-axes.ts` for GLOW, HIT and TAIL — and
 * having either import from the other would be a cycle for the sake of two
 * functions.
 *
 * A `group` is what an axis *is*, as far as the page is concerned: a heading a
 * reader parses as a heading, one line of prose in the page's own voice saying
 * what the axis picks and what is currently picked, and then the row. The
 * description is what makes the current state legible without hovering
 * anything; the highlighted button confirms it rather than being the only
 * place it is said.
 */

export function button(
  host: HTMLElement,
  label: string,
  on: boolean,
  hint: string,
  pick: () => void,
) {
  const b = document.createElement("button");
  b.className = on ? "skin is-on" : "skin";
  b.textContent = label;
  b.title = hint;
  b.addEventListener("click", pick);
  host.appendChild(b);
  return b;
}

/**
 * One named axis: a heading, a description line that says what the axis
 * picks, that it is independent of the other two, and what is currently
 * picked — then the row of buttons themselves. The description is the thing
 * that makes the current pick legible without hovering a button; the
 * highlighted button is a confirmation of it, not the only place it is said.
 */
export function group(
  host: HTMLElement,
  heading: string,
  desc: string,
  build: (row: HTMLElement) => void,
): void {
  const wrap = document.createElement("div");
  wrap.className = "control-group";

  const h = document.createElement("h3");
  h.className = "control-heading";
  h.textContent = heading;
  wrap.appendChild(h);

  const p = document.createElement("p");
  p.className = "control-desc";
  p.textContent = desc;
  wrap.appendChild(p);

  const row = document.createElement("div");
  row.className = "control-row";
  build(row);
  wrap.appendChild(row);

  host.appendChild(wrap);
}

/**
 * Build the four axis groups into `axes`, which is `shapesAxes` inside the
 * COMPOSE half of `index.html`. The caller has already emptied it and decided
 * that COMPOSE is the view showing; this file only fills it.
 */
