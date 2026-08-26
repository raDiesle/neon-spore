import type { ViewRole } from "@neon-spore/render";

/**
 * The view switch, always on screen.
 *
 * Playing alone at a desk needs every control and the whole test rig; judging
 * how the finished game reads needs the opposite — one player's half of the
 * band and nothing else, because that is what decides how much of the screen
 * the field actually gets. Switching is the only honest way to see both, so it
 * is one tap away rather than a build flag.
 *
 * The mode changes what is drawn and what answers a touch. It never changes the
 * simulation: the same world is running behind all three.
 */
const ROLES: { role: ViewRole; label: string; title: string }[] = [
  { role: "p1", label: "P1", title: "Player 1's device — cannon and trigger" },
  { role: "p2", label: "P2", title: "Player 2's device — shield and colours" },
  { role: "test", label: "TEST", title: "Both halves plus the test rig" },
];

const STORAGE_KEY = "neon-spore.view";

export interface ViewSwitch {
  role: () => ViewRole;
  /**
   * Take the view over. The room hands out the seat, and a device showing the
   * other player's controls is a device whose touches go nowhere — so joining
   * decides the view rather than asking the player to remember to.
   */
  set: (role: ViewRole) => void;
}

export function bindViewSwitch(onChange: (role: ViewRole) => void): ViewSwitch {
  const bar = document.getElementById("viewSwitch");
  let role = restore();

  const set = (next: ViewRole): void => {
    role = next;
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Private browsing refuses to store. The switch still works.
    }
    paint();
    onChange(role);
  };

  const buttons = ROLES.map((r) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = r.label;
    b.title = r.title;
    b.addEventListener("click", () => set(r.role));
    bar?.appendChild(b);
    return { role: r.role, el: b };
  });

  const paint = (): void => {
    for (const b of buttons) b.el.classList.toggle("on", b.role === role);
    // The test rig belongs to nobody's device, so it goes away with the mode.
    document.body.classList.toggle("player-view", role !== "test");
  };

  paint();
  onChange(role);
  return { role: () => role, set };
}

function restore(): ViewRole {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "p1" || v === "p2" || v === "test") return v;
  } catch {
    // Ignored, same reason as above.
  }
  return "test";
}
