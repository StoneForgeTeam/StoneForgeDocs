# Units and turns

Stoneshard is turn-based on a grid of 26-pixel cells. Every unit - an enemy, an NPC, an animal, the player - stands on a cell, and the game keeps two grids: the **collision grid** (where units can walk) and the **position grid** (who stands where, which targeting, the cursor and pathing read). `Units` works with units as the game does, keeping both grids right.

## Cells

```csharp
var (cellX, cellY) = Units.CellOf(enemy);            // the cell a unit stands on
int column = Units.CellOf(Mouse.WorldX);               // the cell a room position is in
double x = Units.PositionOf(cellX);                    // a cell's middle, where a unit on it stands
Instance there = Units.At(cellX + 1, cellY);           // who stands on a cell (none: no one)
```

The cell and unit under the mouse are `Mouse.Cell` and `Mouse.Unit` (see [the mouse in the world](../core/input.md#the-mouse-in-the-world)).

| `Units` | |
|---|---|
| `CellSize` | 26: a cell's size in pixels. |
| `CellOf(unit)`, `CellOf(position)` | The cell a unit stands on; the cell a room position is in. |
| `PositionOf(cell)` | A cell's middle, in room coordinates. |
| `At(cellX, cellY)` | Who stands on a cell, as the position grid has it. |
| `IsPlayer(unit)` | Whether a unit is the player's character, whichever object it is. |

## Moving units

```csharp
var (x, y) = Units.CellOf(enemy);
if (Units.NearestFreeCell(enemy, x + 3, y) is var (freeX, freeY) && Units.CanTake(enemy, freeX, freeY))
    Units.Move(enemy, freeX, freeY);
```

| | |
|---|---|
| `CanTake(unit, cellX, cellY)` | Whether a unit may take a cell: it's free, or it's the unit's own. **Check this before `Move`.** `Move` takes the cell whoever's there, and the game would then read the wrong unit on it. |
| `Move(unit, cellX, cellY, snap)` | Moves a unit as its own movement does: out of the old cell and into the new one in both grids, and a big unit's extra cells. It walks there by its own step for a short move; it jumps for more than two cells, or always with `snap`. |
| `Move(unit, cellX, cellY, grids, poly, snap)` | The same, for moving many units: find the grids once with `Units.Current()`. |
| `NearestFreeCell(unit, cellX, cellY)` | The free cell nearest one, as the game finds one; `null` if there's none. |

## Making and removing units

```csharp
Instance dummy = Units.Create(GameObjectId.o_enemy, cellX, cellY);   // as the game spawns one
Units.SetRecord(dummy, "Caravan Dummy");                             // one of the game's mob records
// later
Units.Remove(dummy);
```

| | |
|---|---|
| `Create(obj, cellX, cellY)` | A unit of an object on a cell, as the game spawns one; none if it wasn't made. |
| `SetRecord(unit, record)` | Gives a unit one of the game's mob records: its type, stats, resistances and icons (`"Caravan Dummy"`, `"Bandit Thug"`...). |
| `Remove(unit)` | Takes a unit out quietly: out of the grids and the turn list, the effects on it removed with it, then destroyed **without** its Destroy event - no loot, no corpse, no kill credit. |

{% hint style="warning" %}
Don't destroy a unit without its Destroy event yourself: effects left pointing at it crash the game when they read their target. `Units.Remove` takes them off first (`UnitEffects.RemoveAll`); do the same if you remove a unit another way.
{% endhint %}

## Turns

Each turn the player's list of units to run (`o_player`'s enemy list) takes its turns, and the world's turn passes: time, effects, regeneration.

| | |
|---|---|
| `Units.EndTurn(unit, delay)` | Ends a unit's turn, as its own actions do. |
| `Units.TurnsCount()` | How many units the turn list holds. |
| `Units.RemoveFromTurns(unit => ..., betweenTurnsOnly)` | Takes units out of the turn list, so their AI isn't run. For a unit another game runs, say. By default only between turns, never while the turn walks the list. |
| `Turns.PassWorld()` | The world's turn passes (time, effects on everyone, regeneration), as the player's turn does. |
| `Turns.RunUnits()` | The units in the turn list take their turns. |

`Turns` is for a mod that keeps the world's clock itself, such as one following another game's turns.

## Doors

```csharp
Instance door = Doors.Nearest(Player.Instance["x"].AsReal, Player.Instance["y"].AsReal);
if (!door.IsNone)
    Doors.Use(door);
```

`Doors.Nearest(x, y)` finds the nearest way out - a door, stairs, a dungeon's entrance or exit - and `Doors.Use(door)` uses it as the player clicking it does: through it at once if the player can reach it, else walking there first.
