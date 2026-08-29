## `bc4d0d3` — the wheel's detent

> pulling the string until a way in lights on a column — does it click into place and hold, or does the wheel feel like it slips past

- **badge** implementation
- **subject** the string that turns THE MAZE's wheel, and the way in that lights when it lines up
- **changed** the maze is a turning wheel now; pulling the string swings a way in onto a column and it locks there
- **decide** does it click onto the column and hold, or does the wheel feel like it slides past?
- **before** the old maze, a still lattice with no string to pull
- **after** the wheel, turned by holding the string until a mouth lights
- **where** `bun run preview`, THE MAZE, hold the string and watch a mouth cross a column

## `bc4d0d3` — where a wrong shot stopped

> when the shot takes the wrong way in, can you see where it stopped and why, or does it only fail to arrive

- **badge** implementation
- **subject** a shot that goes in the wrong way and never reaches the middle
- **changed** the drum is drawn closed, so a failed route stays lit dim with a red cap on the cell it stopped in
- **decide** can you see where it stopped and why, or does it just fail to arrive?
- **before** nothing, this is new — the old maze had no shot travelling it
- **after** the failed route left lit under a red cap for the rest of the wheel
- **where** `bun run preview`, THE MAZE, fire into a way in that does not reach the middle
