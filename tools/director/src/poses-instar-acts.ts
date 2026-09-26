import type { Pose } from "./pose-kit.js";
import { falling } from "./poses-instar-spit.js";

/**
 * THE INSTAR's third and fourth acts in the gallery, three beats into each
 * pose's window while nobody answers — the body settled, its marks up. One
 * card a pose, so a look can be checked in any of them without a throwaway
 * edit (`render/instar-poses-third.ts`, `render/instar-poses-fourth.ts`).
 */
const LOOK = "whether the body reads as this pose and nothing else, and each mark sits on its part";

export const INSTAR_ACT_POSES: readonly Pose[] = [
  falling(
    "crouch",
    "INSTAR · CROUCHED",
    "THE INSTAR crouched face-on, low and wide over the ship, jaws shut, the eyes narrowed: a tap mark on each eye.",
    LOOK,
  ),
  falling(
    "perch",
    "INSTAR · PERCHED",
    "THE INSTAR perched high side-on, wings full up, the brood on its back over both halves: a shoot mark on each nest.",
    LOOK,
  ),
  falling(
    "roar",
    "INSTAR · ROARING",
    "THE INSTAR's head thrown back small at the top, jaws wide at the sky, one glob of fire coming down the middle: a shield mark under it.",
    LOOK,
  ),
  falling(
    "sprawl",
    "INSTAR · SPRAWLED",
    "THE INSTAR flat along the hull side-on, wings folded, the fork of its tail laid on the ship: a pull-up mark on each blade.",
    LOOK,
  ),
  falling(
    "twist",
    "INSTAR · TWISTED",
    "THE INSTAR along a diagonal, head down at the hull on the left, tail thrown up on the right: pull the head up, pull the tail down.",
    LOOK,
  ),
  falling(
    "hover",
    "INSTAR · HOVERING",
    "THE INSTAR hovering high side-on, wings up, its tail hung down with the fork over the hull: a shoot mark on each blade.",
    LOOK,
  ),
  falling(
    "bow",
    "INSTAR · BOWED",
    "THE INSTAR bowed face-on, the head low over the ship, jaws shut, horns forward: a hold mark on each side of the head.",
    LOOK,
  ),
  falling(
    "arch",
    "INSTAR · ARCHED",
    "THE INSTAR arched side-on, head and rear down at the hull, the back bridged over the ship: tap the nest at the top, pull the tail up.",
    LOOK,
  ),
  falling(
    "rise",
    "INSTAR · RISEN",
    "THE INSTAR upright on its tail side-on, wings wide, embers falling on both halves: a suck mark under each.",
    LOOK,
  ),
  falling(
    "loom",
    "INSTAR · LOOMING",
    "THE INSTAR face-on and so close the head fills the field, jaws wide on the ship: pull the lower lip up, the upper down.",
    LOOK,
  ),
];
