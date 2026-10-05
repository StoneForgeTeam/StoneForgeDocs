# Units and turns

Stoneshard is turn-based on a grid of 26-pixel cells. Every unit - an enemy, an NPC, an animal, the player - stands on a cell, and the game keeps two grids: the **collision grid** (where units can walk) and the **position grid** (who stands where, which targeting, the cursor and pathing read). `Units` works with units as the game does, keeping both grids right.

## Cells

A cell is a `Cell`: its `X` and `Y` on the grid. Positions in the room, in pixels, are `Point`s.

```csharp
Cell cell = Units.CellOf(enemy);                       // the cell a unit stands on
Cell under = Cell.At(Mouse.WorldX, Mouse.WorldY);      // the cell a room position is in (or Mouse.Cell)
Point middle = cell.Center;                            // its middle, where a unit on it stands
Instance there = Units.At(cell.Offset(1, 0));          // who stands on a cell (none: no one)
if (cell.DistanceTo(Units.CellOf(Player.Instance)) <= 1)
    context.Log("Next to the player");
var (x, y) = cell;                                     // both deconstruct
```

The cell and unit under the mouse are `Mouse.Cell` and `Mouse.Unit` (see [the mouse in the world](../core/input.md#the-mouse-in-the-world)).

| `Cell` | |
|---|---|
| `X`, `Y` | Its column and row. `new Cell(x, y)` makes one. |
| `Cell.Size` | 26: a cell's size in pixels. |
| `Cell.At(x, y)`, `Cell.At(point)` | The cell a room position is in. |
| `Center`, `Corner` | Its middle (where a unit on it stands) and its top-left corner, as `Point`s in room coordinates. |
| `DistanceTo(other)`, `IsNextTo(other)` | How many steps apart two cells are, diagonals counting as one, as the game counts them; whether they're neighbours. |
| `Offset(dx, dy)`, `Neighbours`, `+`, `-` | The cell so many across and down; the 8 around it; adding and subtracting cells. |

| `Point` | |
|---|---|
| `X`, `Y` | A position or offset in pixels: in the room or on the screen, as the API it comes from says. |
| `DistanceTo(other)`, `+`, `-`, `*` | How far apart two points are; adding, subtracting and scaling them. |

| `Units` | |
|---|---|
| `CellOf(unit)` | The cell a unit stands on. |
| `At(cell)` | Who stands on a cell, as the position grid has it. |
| `IsPlayer(unit)` | Whether a unit is the player's character, whichever object it is. |

## Moving units

```csharp
Cell target = Units.CellOf(enemy).Offset(3, 0);
if (Units.NearestFreeCell(enemy, target) is { } free && Units.CanTake(enemy, free))
    Units.Move(enemy, free);
```

| | |
|---|---|
| `CanTake(unit, cell)` | Whether a unit may take a cell: it's free, or it's the unit's own. **Check this before `Move`.** `Move` takes the cell whoever's there, and the game would then read the wrong unit on it. |
| `Move(unit, cell, snap)` | Moves a unit as its own movement does: out of the old cell and into the new one in both grids, and a big unit's extra cells. It walks there by its own step for a short move; it jumps for more than two cells, or always with `snap`. |
| `Move(unit, cell, grids, poly, snap)` | The same, for moving many units: find the grids once with `Units.Current()`. |
| `NearestFreeCell(unit, cell)` | The free cell nearest one, as the game finds one; `null` if there's none. |

## Making and removing units

```csharp
Instance dummy = Units.Create(GameObjectId.o_enemy, cell);   // as the game spawns one
Units.SetRecord(dummy, "Caravan Dummy");                             // one of the game's mob records
// later
Units.Remove(dummy);
```

| | |
|---|---|
| `Create(obj, cell)` | A unit of an object on a cell, as the game spawns one; none if it wasn't made. |
| `SetRecord(unit, record)` | Gives a unit one of the game's mob records: its type, stats, resistances and icons (`"Caravan Dummy"`, `"Bandit Thug"`...). |
| `Remove(unit)` | Takes a unit out quietly: out of the grids, the turn list and its faction's list, the effects on it removed with it, then destroyed **without** its Destroy event - no loot, no corpse, no kill credit. Other units' references to it (their target, who last hit them...) are cleared, so their AI doesn't read a unit that's gone. |

{% hint style="warning" %}
Don't destroy a unit without its Destroy event yourself: effects left pointing at it crash the game when they read their target. `Units.Remove` takes them off first (`UnitEffects.RemoveAll`); do the same if you remove a unit another way.
{% endhint %}

## When units come and go

```csharp
Units.OnSpawned(context, unit => context.Log($"{ActionsLog.NameOf(unit)} appears"));
Units.OnDied(context, (unit, killer) =>
{
    if (Units.IsPlayer(killer))
        Player.GiveXp(10);
});
```

| | |
|---|---|
| `Units.OnSpawned(context, unit => ...)` | A unit comes into play (summoned, spawned, made by a mod with `Create`), on the frame after it's made and set up. Not the units a place has as it loads, nor those a room is built with. |
| `Units.OnDied(context, (unit, killer) => ...)` | A unit dies (its health gone), before it's destroyed, its loot dropped and its corpse left, so it can still be read. `killer` is its last attacker: the player or another unit; none if nobody. |

## Turns

Each turn the player's list of units to run (`o_player`'s enemy list) takes its turns, and the world's turn passes: time, effects, regeneration.

| | |
|---|---|
| `Units.EndTurn(unit, delay)` | Ends a unit's turn, as its own actions do. |
| `Units.TurnsCount()` | How many units the turn list holds. |
| `Units.RemoveFromTurns(unit => ..., betweenTurnsOnly)` | Takes units out of the turn list, so their AI isn't run. For a unit another game runs, say. By default only between turns, never while the turn walks the list. |
| `Units.ReturnToTurns(units)` | Gives units back their own turns: their AI on, and in the turn list again. For units another game ran, now this one's to run. Their references to units that are gone are cleared first. |
| `Turns.PassWorld()` | The world's turn passes (time, effects on everyone, regeneration), as the player's turn does. |
| `Turns.RunUnits()` | The units in the turn list take their turns. |

`Turns` is for a mod that keeps the world's clock itself, such as one following another game's turns. `Turns.OnTurn(context, () => ...)` runs after each world turn has passed: the player's action done, or waiting, or `PassWorld`.

## Doors

`Doors` are the doors in a room that open and close: a house's, a crypt's.

```csharp
foreach (Instance door in Doors.All())
    if (Doors.IsLocked(door))
        Doors.SetOpen(door, true);   // unlocks it, and opens it as the game does

Doors.OnChanged(context, (door, open) => context.Log(open ? "A door opens" : "A door closes"));
```

| `Doors` | |
|---|---|
| `All(includeCulled)` | The room's doors; off-screen ones too with `includeCulled` (their state can't be read until they're back: see [culling](../gml/instances.md#culling)). |
| `IsDoor(instance)` | Whether an instance is a door. |
| `IsOpen(door)`, `IsLocked(door)` | Whether it's open (or opening); whether it's locked. |
| `SetOpen(door, open, unlock)` | Opens or closes it as the game does: its animation, sound and the noise units nearby hear, its collision following. Opening a locked door unlocks it, unless `unlock` is false (then it stays shut). |
| `OnChanged(context, (door, open) => ...)` | A door starts opening or closing, whoever does it: the player, an NPC or enemy going through, the game's scripts, a mod. |

## Exits

`Exits` are the ways out of a place: an entrance, stairs, a dungeon's way in and out, a map edge.

```csharp
Instance exit = Exits.Nearest(Units.CellOf(Player.Instance));
if (!exit.IsNone)
    Exits.Use(exit);
```

`Exits.Nearest(cell)` (or a room position, `Exits.Nearest(point)`) finds the nearest way out, and `Exits.Use(exit)` uses it as the player clicking it does: through it at once if the player can reach it, else walking there first.
