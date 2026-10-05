# Crash windows and reports

When something goes wrong, StoneForge shows what was running, so a crash can be traced to the game, to StoneForge or to a mod.

## The game crashes

A window shows:

- the GML that was running, innermost first: each code entry, with the instance running it;
- the game's own GML call stack: each script and line;
- the native stack: each module and offset.

The full report goes to `<Stoneshard>\dotnet\crash-report.txt`, with the last 512 code entries the game ran. The bridge traces code entries as they start and end for this; it's always on, and cheap.

## C# crashes the game

An exception nothing caught shows a window with its stack trace, and is written to the same report.

## A mod's handler throws

StoneForge catches an exception from a mod's handler (an event, a hook, `Tick`, UI) and the game goes on. A window shows its stack trace the first time for each mod and place, without stopping the game. A mod that keeps failing is paused.

## A GML error

A GML error shows the game's own error window: the script and what went wrong. `YYToolkit.log` in the game's folder gets the details.

## Settings

| | |
|---|---|
| `"errorWindows": false` in `<Stoneshard>\dotnet\stoneforge.json` | Turns StoneForge's C# windows off. The game's own crash window always shows. |
| A file named `yytoolkit-console.on` in `<Stoneshard>\dotnet` | Opens YYToolkit's console window ("YYToolkit Log") with the game. It's off otherwise; `YYToolkit.log` is written either way. |

```json
{
  "errorWindows": false
}
```
