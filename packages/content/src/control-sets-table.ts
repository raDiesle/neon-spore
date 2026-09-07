import type { ControlSet } from "./control-sets.js";

/**
 * Every panel in the game, as a table.
 *
 * Split out of `control-sets.ts` on line count, along the seam `controls.ts`
 * and `controls-round.ts` already cut: next door is what a set *is* and the
 * questions everything asks one, and this is the list itself — the half that
 * grows by an entry every time a round or a rung is added.
 *
 * `default` is the ordinary field: slide, trigger, swallow, fire. It carries
 * the lance as well now, and carries it without a button: the two colours are
 * **held** rather than tapped, and a thumb that stays on one fills the cannon
 * lobe (`packages/sim/src/lance.ts`).
 *
 * **There used to be a LANCE PANEL, and the owner took it out on 7 September
 * 2026.** It was the default with the maw traded for a fifth button, which
 * meant the whole game shipped one wave that could reach a weapon and no other
 * wave that could. A control every panel with a colour on it already has costs
 * no panel anything, and the arithmetic that forced the trade is unchanged —
 * the maw *is* the cannon lobe turned inside out (docs/spec/systems.md 5.7),
 * so `intake` still empties a fill. It empties it under a thumb that is still
 * there, which is a thing a player can see and answer, where a button that was
 * not on the panel at all was not.
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
  {
    id: "pulse",
    name: "THE PULSE",
    why: "The first panel that is the same in both seats: four lanes each, against one chart neither of you can read all of.",
    controls: [
      "pulse1Slick",
      "pulse1Bulb",
      "pulse1Meteor",
      "pulse1Pod",
      "pulse2Slick",
      "pulse2Bulb",
      "pulse2Meteor",
      "pulse2Pod",
    ],
  },
  {
    id: "claw",
    name: "THE CLAW",
    why: "The gun is a hand: player 1 slides it and reaches up a column, and the mouth moves to player 2, so nothing is caught by one person alone.",
    controls: ["cannon", "reach", "mawTake"],
  },
];
