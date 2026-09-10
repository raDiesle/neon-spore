# Where a session's time goes

Rough statistics, kept over days, so the bottlenecks in ordinary work become
visible. The owner asked for this on 10 September 2026: *"tasks take a lot of
time, I like to know the bottlenecks."*

**One `##` entry per lane**, written in the commit that lands it, with the
minutes read off commit timestamps, file modification times and the tools'
own durations — never instrumented, and rounded to five. The point is the
shape of the distribution across sessions, not precision. The rows are the
same every time so they can be compared:

- **reading** — finding the seam: the queue entry, the files it names, the
  pattern the last lane used, the docs.
- **writing** — code, tests, comments, candidates.
- **looking** — seeing the result: `versus:shot`, `bun run frames`, the
  browser pane, and the correcting that follows a picture.
- **friction** — commands that failed, hung or answered the wrong thing and
  had to be worked around or fixed before the work could go on.
- **landing** — `check:fast`, the commit, `bun run land`, and every rebase
  conflict or red full check between the first attempt and the trunk moving.

End each entry with the one bottleneck, in a sentence.

## 2026-09-10 · claude/queue-the-rind-and-the-lid-have-one-look-each-and-no-r

Three sheds and three bodies for THE RIND, three armours for THE LID, a hand
on the pose, and a pair that dropped half its events. About 2 h 35 min from
the first command to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue, `docs/versus.md`, the throb/crawler lane's shape, `rind-shed.ts`, `lid.ts`, the pose kit |
| writing | 50 | two look records and their shipped paint, `Pose.hand` and two poses, six candidates, then the `rind:body` seam and three more at the owner's asking |
| looking | 55 | fourteen `versus:shot` runs at two to three minutes each, reading each picture, and the tuning it asked for — POD's swing, IRIS's seam, FLAKES' colour, FACET's depth |
| friction | 20 | `--at` came back as prose (a wrong rectangle, read as a bug); the browser pane's screenshots timed out on the pair; no way to magnify a PNG already taken, so a throwaway script |
| landing | 15 | `check:fast` red on a file one line over; first `land` refused on four conflicts with thirteen commits landed meanwhile; second red on `docs/INDEX.md` rows; third landed |

Bottleneck: **looking**. A picture of one candidate costs two to three minutes
of director start-up and browser, and a candidate needs two or three pictures
before it is right — more than a third of the lane was waiting for
screenshots. The pair's own frame rate is not the cost; the start-up is.
