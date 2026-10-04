# Time and the world map

## The clock

`Time` is the game's clock: what time it is in the world, setting it and moving it on, and how many turns have passed. It's there only in a game: check `Time.Available` first.

```csharp
if (Time.Available)
{
    GameTime now = Time.Now;
    context.Log($"{now.Hours:00}:{now.Minutes:00} ({now.OfDay}), month {now.Months + 1}, day {now.Days + 1}, turn {Time.Turns}");
}
```

| `Time` | |
|---|---|
| `Available` | A game is loaded or begun. |
| `Now`, `Timestamp` | The time in the world; as minutes since the calendar began. |
| `OfDay` | `TimeOfDay.Morning`, `Day`, `Evening` or `Night`: what NPCs follow (where they work and sleep, whether they carry a lantern). |
| `IsFrozen` | The game is holding time still (the Black Tablet's ritual). |
| `Turns` | Turns the game has completed. |
| `Advance(minutes)` | Let time pass as play does: minute by minute, with every hour's, day's and month's effects (upkeep, villages restocking, dungeons resetting, contract deadlines). A long stretch takes a moment. |
| `Set(time)` | Set the clock at once: nothing in between happens. |

```csharp
if (Keyboard.Pressed(Keyboard.F9) && Time.Available && !Game.IsBusy)
    Time.Advance(60);   // an hour passes, as in play
```

`GameTime` is a moment of the game's calendar - months of 30 days, days of 24 hours - with `Months`, `Days`, `Hours`, `Minutes`, `Seconds`, `Timestamp`, `OfDay` and `DayFraction` (0 at midnight). Make one with `new GameTime(months, days, hours, minutes)` or `GameTime.FromTimestamp(minutes)`.

## The world map

`WorldMap` reads the world map: which cell the player is on and each cell's values - its areas' seeds, its location, its dungeon. It's there only in a game, out of the prologue (which has a map of its own): check `WorldMap.Available`.

```csharp
if (WorldMap.Here is { } here)
{
    var seeds = here.Seeds;
    context.Log($"{WorldMap.Place}: cell {here.Tag} ({here.Location ?? "wilds"}), layout seed {seeds.Layout}");
    if (here.Dungeon is { } dungeon)
        context.Log($"A dungeon: boss alive {dungeon["boss_alive"]}, open {dungeon["dungeon_is_open"]}");
}
```

| `WorldMap` | |
|---|---|
| `Available`, `InPrologue` | |
| `Width`, `Height` | Cells across and down. |
| `PlayerCell`, `Here` | The cell the player is on. |
| `Tile(x, y)` | Any cell. |
| `Floor` | The dungeon floor the player is on (0 on the surface). |
| `DungeonFloor` | The floor as the game numbers it for the dungeon's own records (its seeds, its floors' layouts). |
| `Place` | Where the player is, as one string, the same in every game for the same spot: `"r_globalmap_forest#f2@12_7"` (room, dungeon floor, cell). |

| `WorldTile` | |
|---|---|
| `X`, `Y`, `Tag` | The cell, and the game's name for it (`"12_7"`). |
| `this[key]`, `Get(key, layer)` | A value of the cell: the saved one, else the generated one (`TileLayer.Saved`, `Generated` or `Any`). Setting one saves it, through the game's own script. |
| `Saved`, `Generated` | The cell's two stores, as maps. |
| `Seeds` | The seeds its areas are built from: `Layout`, `Growth`, `Mobs`, `Preset`, `Containers`, `Trade` (`-1`: not visited yet; `-2`: to be rolled again). The same seed builds the same area. |
| `Location` | The location here, by the game's key (`"Osbrook"`...), or `null`. |
| `Dungeon` | The cell's dungeon (`WorldDungeon`), or `null`: its values (`this[key]`, `Keys`), nested maps and lists (`GetMap`, `GetList`, `SetMap`, `SetList`). |
| `SetDungeonValue(key, value)`, `SetDungeonMap(key, map)`, `SetDungeonList(key, list)` | Set a value of the cell's dungeon as the game does, making the dungeon if the cell has none yet. |

Writes go through the game's own scripts, so anything hooking them sees them.
