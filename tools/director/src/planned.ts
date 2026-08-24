/**
 * The part of the design that has no code yet, shown next to the part that
 * does, so the editor says what the game is going to be and not only what it
 * currently is. The list is parsed out of the spec on every request — nobody
 * maintains a second copy.
 */

interface Planned {
  name: string;
  kind: string;
  note: string;
  built: boolean;
}

interface Roster {
  creatures: Planned[];
  accepted: Planned[];
  bosses: Planned[];
}

function renderGroup(container: HTMLElement, heading: string, items: Planned[]): void {
  const h2 = document.createElement("h2");
  h2.textContent = heading;
  container.appendChild(h2);

  for (const item of items) {
    const div = document.createElement("div");
    div.className = item.built ? "plan is-built" : "plan";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = item.name;
    div.appendChild(name);

    const stamp = document.createElement("span");
    stamp.className = "stamp";
    stamp.textContent = item.built ? "BUILT" : "NOT BUILT";
    div.appendChild(stamp);

    if (item.kind) {
      const kind = document.createElement("span");
      kind.className = "kind";
      const isNumber = /^\d+$/.test(item.kind);
      kind.textContent = isNumber ? `act ${item.kind}` : item.kind;
      div.appendChild(kind);
    }

    if (item.note) {
      const blurb = document.createElement("p");
      blurb.className = "blurb";
      blurb.textContent = item.note;
      div.appendChild(blurb);
    }

    container.appendChild(div);
  }
}

export async function renderPlanned(): Promise<void> {
  const planned = document.getElementById("planned");
  if (!planned) return;

  try {
    const res = await fetch("/api/roster");
    if (!res.ok) throw new Error(res.statusText);
    const roster = (await res.json()) as Roster;

    planned.replaceChildren();
    renderGroup(planned, "CREATURES", roster.creatures);
    renderGroup(planned, "ACCEPTED", roster.accepted);
    renderGroup(planned, "BOSSES", roster.bosses);
  } catch {
    planned.replaceChildren();
    const msg = document.createElement("p");
    msg.textContent = "no server — read only";
    msg.style.color = "var(--dim)";
    planned.appendChild(msg);
  }
}
