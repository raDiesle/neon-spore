/**
 * The bosses' and creatures' look records, and the parts kept beside each —
 * what the SHAPES page's LIBRARY draws on the real body: THE LID, the mount,
 * THE QUEEN, the recoil cage, THE RIND, THE VEIL, THE VOLLEY, THE WARDEN and
 * THE WISP. Out of `index.ts` on 13 October 2026, when the barrel stood
 * fifteen lines under the ceiling.
 */

export { drawLid } from "./lid.js";
export { bevel } from "./lid-bevel.js";
export { iris } from "./lid-iris.js";
export { LID_LOOK, type LidLook, type LidPlates } from "./lid-look.js";
export { drawPlates } from "./lid-plates.js";
export { MOUNT_LOOK, type MountLook } from "./mount-look.js";
export { rasp } from "./mount-rasp.js";
export { taproot } from "./mount-taproot.js";
export { carapace } from "./queen-carapace.js";
export { facet as facetShell } from "./queen-facet.js";
export { armour, QUEEN_LOOK, type QueenLook, type ShellDraw } from "./queen-look.js";
export { scutes } from "./queen-scutes.js";
export { drawRecoilCage } from "./recoil.js";
export { calyx } from "./recoil-calyx.js";
export { foam as foamCage } from "./recoil-foam.js";
export { globe } from "./recoil-globe.js";
export { type CageDraw, RECOIL_LOOK, type RecoilLook, springs } from "./recoil-look.js";
export { moons } from "./recoil-moons.js";
export { flakes } from "./rind-flakes.js";
export { RIND_LOOK, type RindLook, type RindShed, rindWears } from "./rind-look.js";
export { pod } from "./rind-pod.js";
export { drawShed } from "./rind-skin.js";
export { slough } from "./rind-slough.js";
export { drawVeilCloud } from "./veil.js";
export { foam } from "./veil-foam.js";
export { VEIL_LOOK, type VeilLook, type VeilMassDraw } from "./veil-look.js";
export { anvil } from "./veil-mass.js";
export { strata } from "./veil-strata.js";
export { vortex } from "./veil-vortex.js";
export { drawVolleyShell, showsVolleyCore } from "./volley.js";
export { drawVolleyCore } from "./volley-core.js";
export { emberSeams } from "./volley-ember.js";
export { VOLLEY_LOOK, type VolleyLook, type VolleyShell } from "./volley-look.js";
export { pittedStone } from "./volley-pitted.js";
export { shippedSeams, shippedStone } from "./volley-stone.js";
export { drawWarden } from "./warden.js";
export { WARDEN_LOOK, type WardenLook } from "./warden-look.js";
export { mantle } from "./warden-mantle.js";
export { roll } from "./warden-roll.js";
export { drawWardenSurface, type WardenSurfaceDraw } from "./warden-surface.js";
export { whorl } from "./warden-whorl.js";
// THE WISP whole, and its fringe record, so the SHAPES page's LIBRARY can
// draw the real jellyfish wearing each fringe the owner kept
// (`tools/director/src/library`). Drawing only — the jump is read off a beat
// the card supplies, and no world is touched.
export { type WispJump, wispJump } from "./wisp.js";
export { arms } from "./wisp-arms.js";
export { drawWispBody } from "./wisp-body.js";
export { WISP_LOOK, type WispFringe, type WispLook } from "./wisp-look.js";
export { drawTentacles, strandWave } from "./wisp-tentacles.js";
