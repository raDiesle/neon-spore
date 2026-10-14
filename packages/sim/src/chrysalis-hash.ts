import { BASTION_TRACKS } from "./bastion-track.js";
import { CHRYSALIS_PHASES, CHRYSALIS_SKINS, type ChrysalisState } from "./chrysalis.js";

/**
 * What THE CHRYSALIS puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE BASTION's reason
 * (`bastion-hash.ts`), each skin's turns, tracks, columns and colours with
 * their lengths ahead of them. The pieces off go in because they are the
 * fight; each seat's thumb, its quill's pull and whether it ripped under it
 * because a lift is judged on them; the rub's last count and each half's
 * turns because the next count is read against them; and the sac's swell
 * because the shield is judged against it.
 */
export function chrysalisHashParts(s: ChrysalisState): number[] {
  const out = [
    CHRYSALIS_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.goneMask,
    s.pieces,
    s.down.length,
    ...s.down.map((d) => (d ? 1 : 0)),
    s.pullMilli.length,
    ...s.pullMilli,
    s.tore.length,
    ...s.tore.map((t) => (t ? 1 : 0)),
    s.rubAt.length,
    ...s.rubAt,
    s.rubbed.length,
    ...s.rubbed,
    s.sprayBeat,
    s.swellTick,
    s.nextSwellBeat,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(CHRYSALIS_SKINS.indexOf(step.skin) + 1);
    out.push(step.beats);
    out.push(step.rubs ?? 0);
    const tracks = step.tracks ?? [];
    out.push(tracks.length);
    for (const t of tracks) out.push(BASTION_TRACKS.indexOf(t) + 1);
    const offsets = step.offsets ?? [];
    out.push(offsets.length);
    for (const o of offsets) out.push(o);
    const colors = step.colors ?? [];
    out.push(colors.length);
    for (const c of colors) out.push(c === "red" ? 1 : 2);
  }
  return out;
}
