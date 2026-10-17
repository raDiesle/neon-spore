/**
 * **A hand on a blister**, the field `SceneAct` takes for THE BLISTER's seven
 * gestures. Its own file because `scene-act-types.ts` stands at its line
 * limit, and because this one field is a whole gesture family.
 */
export interface BlisterAct {
  /**
   * The seat whose hand it is, authored for a tile's reason: which seat may
   * knock a blister down is the arrival's (`BlisterSpawn.by`), so the film
   * says whose finger this is the way the wave said whose blister.
   *
   * Nothing else is written. `col` says which blister — the latest the film
   * sent into that column — and the gesture, its way and its length are
   * that arrival's, so a film cannot put a swipe on a body that wants a
   * turn. The path the finger takes, the commands it sends and when it lifts
   * are all `scene-blister.ts`'.
   */
  blister?: 1 | 2;
}
