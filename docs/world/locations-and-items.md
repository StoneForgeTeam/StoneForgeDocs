# Locations and ground items

These APIs read and write the game's saved world state in its own format: what a stash, trade, loot or multiplayer mod needs to move things between places, players or games.

## Locations

A location's saved state is what's dead, taken, opened and moved in it. A location (by tag: its world-map cell, `"12_7"`) has rooms - `"r_global"` outdoors, `"r_dungeon_<floor>"` for a dungeon's floors, a building's own room name - and each room has presets, each with its saved entities and flags. A location is saved as the player leaves it.

```csharp
if (Locations.Here is var (locationTag, roomTag) && Locations.Get(locationTag) is { } location)
{
    foreach (GmValue tag in location.Rooms)
    {
        if (location.Room(tag) is not { } room)
            continue;
        foreach (GmValue presetTag in room.Presets)
            if (room.Preset(presetTag) is { } preset)
                context.Log($"{tag} / {presetTag}: flags {preset.Flags}, saved: {preset.HasSaveData}");
    }
}
```

| `Locations` | |
|---|---|
| `Available`, `Tags` | Whether there are locations (a game); every location with saved state. |
| `Get(tag)`, `At(x, y)` | A location by tag or world-map cell (`null` if it has no saved state). |
| `TagAt(x, y)` | The tag the game gives a cell's location (`"12_7"`), whether or not there's one there yet. |
| `Exists(tag)` | Whether the game has a location by this tag: its rooms have been made, or stored. |
| `Here` | Where the player is: the location's and room's tags. |
| `Store(state)` | Put a saved state (perhaps another game's) where the game keeps it, so the next visit loads it. |

| | |
|---|---|
| `Location` | `Tag`, `Rooms`, `Room(tag)`, `SetFlags(flags)`, `Delete()` (built afresh next visit). |
| `LocationRoom` | `Presets`, `Preset(tag)`, `HasSaveData`, `SetFlags`, `Delete()`. |
| `LocationPreset` | `Flags`, `SetFlags`, `UnsetFlags`, `ResetFlags`, `HasSaveData`, `EntitiesJson`, `Entities` (a copy: destroy it, and `SetEntities` to save changes), `Delete()`, `Export()`. |
| `LocationState` | A preset's state as plain data, to keep or send: `ToJson()`, `FromJson()`, then `Locations.Store(state)`. |

`LocationFlags` say what spawns afresh on the next visit: `Mobs`, `Npc`, `Corpses`, `LootRoom`, `LootDrop`, `Doors`, `ContainersRoom`... The game sets them when a location respawns.

`Locations.OnSaved(context, preset => ...)` runs once the game has saved the place the player is leaving: the preset it saved, its entities and flags as they are now.

```csharp
// Respawn this location's mobs and loot on the next visit.
location.SetFlags(LocationFlags.Mobs | LocationFlags.LootRoom);

// Carry a preset to another game.
string json = preset.Export().ToJson();
// ... in the other game:
if (LocationState.FromJson(json) is { } state)
    Locations.Store(state);
```

## Ground items

`GroundItems` finds the items lying on the ground (the game's `o_loot` and its children), saves and remakes them in the game's own save format, puts new ones down, and replays the hop a dropped item makes.

```csharp
using System;
using System.Linq;

// Copy the nearest dropped item, from its saved state.
var nearest = GroundItems.All()
    .Where(item => !item.IsStatic)
    .OrderBy(item => Math.Pow(item.X - x, 2) + Math.Pow(item.Y - y, 2))
    .FirstOrDefault();
if (nearest.ToJson() is { } json && GroundItems.Create(json) is { } copy)
    context.Log($"Copied {copy.ObjectName} at ({copy.X}, {copy.Y})");

// A wine at your feet, tossed onto a free tile as the game drops loot.
GroundItems.Spawn("wine", x, y, hop: true);
```

| `GroundItems` | |
|---|---|
| `All(includeCulled = true)` | Every item on the ground in the room, those off screen too. |
| `Create(json)`, `Create(map)` | An item made from its saved state, as loading a location makes it. |
| `Spawn(name, x, y, hop, quality)` | A new item: a game item by its `o_inv_` name less `o_inv_` (`"wine"`), or a weapon or armour by name. |

| `GroundItem` | |
|---|---|
| `X`, `Y`, `ObjectName`, `IsOnGround` | Where it is; its object (`"o_loot_wine"`, `"o_weapon_loot"`); whether it's still there. |
| `IsStatic` | Placed with the location and never saved (only dynamic items have a saved state). |
| `ToJson()`, `Save()` | Its saved state, as the game keeps it. |
| `InFlight`, `Flight`, `Fly(flight)`, `Land()` | Its hop through the air: read it, replay another item's (perhaps another game's), or land it now. |

An item off screen (culled) is still there: reading or changing it wakes it for the moment and puts it back.

```csharp
GroundItems.OnAdded(context, item => context.Log($"{item.ObjectName} lands at ({item.X}, {item.Y})"));
GroundItems.OnRemoved(context, item => context.Log($"{item.ObjectName} is gone"));
```

`GroundItems.OnAdded` runs as an item comes onto the ground in play (dropped or thrown by anyone, left by a kill, an arrow, or made by a mod) on the frame after it's made, its data set. `GroundItems.OnRemoved` runs as one leaves it (picked up, destroyed, taken by a mod) while it can still be read. Neither runs for the items a place has as it loads, or leaves behind as the room is left.
