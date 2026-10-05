# The profiler

StoneForge's profiler shows where each frame goes. Press **Ctrl+Shift+P** in game for an overlay with:

- the frame rate and the worst frame over the last second;
- each mod's time per frame, slowest mod first, with the total of its code and its slowest parts: the average and worst over the last second, and how many times each ran.

StoneForge times every mod handler itself: `Tick`, frame and Draw GUI handlers, script hooks (before and after), code hooks, and so a mod's objects' events. Its own UI (mod screens and windows) is listed under StoneForge. Nothing is timed while the overlay is off.

## Timing parts of your own

Wrap work of your own in `Profiler.Measure` to see it listed under your mod:

```csharp
Profiler.Measure(context, "loot sync", () => SyncLoot());
int count = Profiler.Measure(context, "count enemies", () => Instances.Count((int)GameObjectId.o_enemy));
```

The work runs either way; it's only timed while the overlay shows.

## From code

| `Profiler` | |
|---|---|
| `Visible` | Whether the overlay shows (and timing is on). Setting it switches it. |
| `Timings` | The last second's timings, slowest first (empty while the overlay's off): each a `Timing` with `Mod`, `Name`, `Section`, `Average` and `Worst` (ms per frame), and `CallsPerFrame`. |
| `Fps`, `WorstFrameMs` | The last second's frame rate and slowest frame. |
| `Measure(context, name, work)` | Times a part of your mod's own. |
