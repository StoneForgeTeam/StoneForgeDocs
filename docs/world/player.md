# The player

`Player` is the player's character: its attributes as the game reads them, whether enemies are after it, experience as the game gives it, its stats and psyche, and walking it somewhere. It's there only in a game: check `Player.Exists`.

```csharp
if (Player.Exists && !Player.InCombat)
{
    Player.GiveXp(50);
    context.Log($"Level {Player.Level}, health cap {Player.HealthCap}%");
}
```

| `Player` | |
|---|---|
| `Exists`, `Instance` | Whether there's a player; its instance (`o_player`). |
| `Attribute(name)` | One of its attributes, as the game reads them (`scr_atr`, with any mod's hooks on it): `"LVL"`, `"STR"`, `"Head"`, `"nameKey"`... |
| `Level` | Its level. |
| `HealthCap`, `EnergyCap` | The share of its maximum health and energy it can have now, in % (wounds and hunger lower them): 100 when nothing does. |
| `InCombat` | Whether enemies are after it, as the game counts it. |
| `IsHuntedBy(unit)` | Whether a unit is after it. |
| `GiveXp(xp, killed)` | Gives XP as the game does (bonuses, levelling up). With `killed`, the combat log says so as for a kill of that unit. Returns the XP it got. |
| `KillXp(unit)` | The XP a unit's death is worth to the player, as the game works it out. |
| `WalkTo(cell)` | Walks it to a cell, as a click on the world does: its path, a cell a turn. |
| `CrossAreaEdge()` | Takes it across the area's edge into the next one on the world map, as walking off it does. |
| `AddStat(stat, amount)` | Adds to a statistic on its character page: `"contractsFailed"`, `"attacks"`... |
| `ChangePsyche(what, amount, reason)` | Changes its psyche as the game does: `"MoraleSituational"`, `"Sanity"`..., with the game's key for why. |

```csharp
// XP for a kill a mod handled itself, logged as the game logs one.
double xp = Player.KillXp(enemy);
Player.GiveXp(xp, killed: enemy);

// Walk to where the mouse is.
if (Mouse.ClickedWorld(Mouse.Right))
    Player.WalkTo(Mouse.Cell);
```

## Journal and contracts

```csharp
if (Journal.Contracts is { } taken)
    context.Log($"{taken.Count} contracts taken");
```

| `Journal` | |
|---|---|
| `Data` | The journal's data (`journalDataMap`). |
| `Contracts`, `Failed` | Its lists of tasks: the contracts taken, the tasks failed (indexes into the contract list). |
| `AddTask(list, index)`, `RemoveTask(list, index)`, `Lists(list, index)` | List and unlist a task as the game does; whether a list has it. |
| `ShowInDiary(task, asNew)`, `DiaryShows(task)` | Show a task on the diary page (as newly taken with `asNew`); whether it's showing one. |

`Contracts.Delete(contract)` takes a contract away as the game does when it's over (unlisted, and failed if it wasn't done). `Contracts.DeleteQuestItems(contract)` takes its quest items out of the inventory, as the game does when one fails.

## The actions log

The log of what happens, at the bottom left:

```csharp
ActionsLog.Write("noDamage", ActionsLog.NameOf(enemy));
```

`ActionsLog.NameOf(unit)` is a unit's name as the log writes it (coloured by who it is), and `ActionsLog.Write(key, values...)` writes one of the game's own lines, by its key (`"knockback"`, `"noDamage"`...), with the values it fills in.

## Steam

`Steam.PersonaName` is the player's Steam name (`""` without Steam).
