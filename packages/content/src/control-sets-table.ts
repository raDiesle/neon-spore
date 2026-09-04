import type { ControlSet } from "./control-sets.js";

/**
 * Every panel in the game, as a table.
 *
 * Split out of `control-sets.ts` on line count, along the seam `controls.ts`
 * and `controls-round.ts` already cut: next door is what a set *is* and the
 * questions everything asks one, and this is the list itself — the half that
 * grows by an entry every time a round or a rung is added.
 *
 * `default` is the ordinary field: slide, trigger, swallow, fire. It used to
 * carry the lance as well, which meant every wave in the game shipped a button
 * for a coupling only one of them asks for.
 *
 * `lance` is that coupling's own panel, and the interesting part is what it
 * gives up. It is **not** the default with a button added: the maw is gone.
 * That is not tidiness, it is the simulation's own arithmetic — the maw *is*
 * the cannon lobe turned inside out (docs/spec/systems.md 5.7), so `intake`
 * empties a fill (`applyCommand` in `packages/sim/src/commands.ts`). A panel
 * carrying both puts two buttons on one opening and one of them undoes the
 * other. Warding stays, because a rock has no other answer and a panel that
 * could never carry one would not be a panel, it would be a demonstration.
 *
 * **The four numbered STANDARDs are the ladder**, and they are the one place
 * in here where a set is written as *less* of another one (`ControlSet.reduces`).
 * The owner's instruction was that the first waves must not hand a pair six
 * buttons at once, and that the ones they do get have to stand exactly where
 * they will stand for the rest of the game — so a rung is the standard panel
 * with buttons held back, never a panel of its own with the survivors
 * rearranged. Each adds exactly one thing to the one above it: red, then cyan,
 * then the trigger, then the plate that trigger fires, and finally the maw,
 * which is the full panel and needs no entry of its own.
 */
export const CONTROL_SETS: readonly ControlSet[] = [
  {
    id: "default",
    name: "STANDARD",
    why: "The field as it is taught: slide, trigger, swallow, fire.",
    controls: ["cannon", "guard", "intake", "shield", "fireRed", "fireCyan"],
  },
  {
    id: "standard1",
    name: "STANDARD 1",
    why: "A column and a colour, and nothing else yet: player 1 carries the cannon, player 2 has red.",
    reduces: "default",
    controls: ["cannon", "fireRed"],
  },
  {
    id: "standard2",
    name: "STANDARD 2",
    why: "Cyan joins red, so what leaves the cannon is a decision. Nothing defends yet.",
    reduces: "default",
    controls: ["cannon", "fireRed", "fireCyan"],
  },
  {
    id: "standard3",
    name: "STANDARD 3",
    why: "The trigger arrives, and it fires the plate where the plate already stands — nobody can move it yet.",
    reduces: "default",
    controls: ["cannon", "guard", "fireRed", "fireCyan"],
  },
  {
    id: "standard4",
    name: "STANDARD 4",
    why: "Player 2 gets the plate itself, so a ward is two hands again. The maw is the last thing held back.",
    reduces: "default",
    controls: ["cannon", "guard", "shield", "fireRed", "fireCyan"],
  },
  {
    id: "lance",
    name: "LANCE PANEL",
    why: "The maw traded for the lance, because they are the same opening and one empties the other.",
    controls: ["cannon", "guard", "lance", "shield", "fireRed", "fireCyan"],
  },
  {
    id: "gauge",
    name: "THE GAUGE",
    why: "The field is gone, so the band is too: two held slabs for the valve, one for the call.",
    controls: ["gaugeLeft", "gaugeRight", "gaugeCall"],
  },
  {
    id: "fleet",
    name: "THE FLEET",
    why: "One trigger against four arrows: the seat that can see the ships cannot move the sights, and the seat that can move them is shown nothing.",
    controls: ["salvo", "aimLeft", "aimUp", "aimDown", "aimRight"],
  },
  {
    id: "snake",
    name: "SNAKE",
    why: "One of you drives it and the other one works it: two quarter turns against a trigger and a mouth.",
    controls: ["snakeLeft", "snakeRight", "snakeFire", "snakeMaw"],
  },
  {
    id: "pinball",
    name: "PINBALL",
    why: "Three slabs against one: the seat that holds the bucket also stops the needle, and the seat that does not hold it is the only one that can fire.",
    controls: ["pinLeft", "pinLatch", "pinRight", "pinLaunch"],
  },
];
