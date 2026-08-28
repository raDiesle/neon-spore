## `5fd32bd` — the SHAPES tab moving instead of catching

> with every card on the SHAPES tab moving, does the page run smoothly instead of catching every few seconds?

- **badge** implementation
- **subject** the SHAPES tab's frame rate, at its worst under the CILIA fringe
- **changed** cards off screen no longer animate, and CILIA measures its own contour instead of asking the browser a hundred times a frame
- **decide** does it move smoothly while you scroll, under CILIA as well as under LINE, with nothing catching?
- **before** the LINE button — the cheapest skin, the page at its best
- **after** the CILIA button — was 3.3 seconds a frame, now within ten of LINE
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, skin bar → CILIA, then scroll the column
