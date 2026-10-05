# Game events

StoneForge tells a mod what happens in the game: a unit dies, a door opens, a save is written, the player picks something up. Each event is registered from the class it's about, as `Area.OnSomething(context, handler)`:

```csharp
Units.OnDied(context, (unit, killer) =>
{
    if (Units.IsPlayer(killer))
        context.Log($"You killed {ActionsLog.NameOf(unit)}");
});
Doors.OnChanged(context, (door, open) => context.Log(open ? "A door opens" : "A door closes"));
Rooms.OnEntered(context, room => context.Log($"Entered {Rooms.CurrentName}"));
```

Register them in `Load`. A mod's handlers go with it when it's switched off, and an exception in one is that mod's, as with any other handler: it's reported, and a mod that keeps failing is paused. You don't need `[assembly: HookScript]` for any of these; StoneForge makes the scripts they need hookable itself.

For anything not listed here, hook the game's own scripts and events: see [Hooks](../gml/hooks.md).

## Every event

| Event | Runs |
|---|---|
| **World** | |
| [`Rooms.OnEntered(room)`](../world/rooms-and-saves.md#entering-and-leaving-rooms) | Once the game has gone into a room of the game being played, its instances set up. Each dungeon floor counts. |
| [`Rooms.OnLeaving(room)`](../world/rooms-and-saves.md#entering-and-leaving-rooms) | As the game leaves one, its instances still there. |
| [`Turns.OnTurn()`](../world/units.md#turns) | After each world turn has passed. |
| [`Locations.OnSaved(preset)`](../world/locations-and-items.md#locations) | The game has saved the place the player is leaving. |
| [`Doors.OnChanged(door, open)`](../world/units.md#doors) | A door starts opening or closing, whoever does it. |
| [`MapMarkers.OnPlaced(marker)`, `OnRemoved(marker)`](../world/time-and-map.md#map-markers) | The player places a marker on the world map or takes one off. |
| **Saves** | |
| [`SaveData.OnLoaded(save)`](../world/rooms-and-saves.md#when-saves-are-read-and-written) | A save has been read, before the game sets itself up from it. |
| [`SaveData.OnSaving(save)`](../world/rooms-and-saves.md#when-saves-are-read-and-written) | A save is about to be written: the save data can still be changed. |
| **Units and combat** | |
| [`Units.OnSpawned(unit)`](../world/units.md#when-units-come-and-go) | A unit comes into play: summoned, spawned, made by a mod. |
| [`Units.OnDied(unit, killer)`](../world/units.md#when-units-come-and-go) | A unit dies, before it's destroyed. |
| [`Combat.OnAttack(attack)`, `OnHit(attack)`](../content/combat.md#every-attack) | Any attack is resolved; any attack strikes. |
| [`Skills.OnUsed(cast)`](../content/skills.md#any-skill-used) | Anyone uses a skill. |
| **The player** | |
| [`Player.OnDying()`](../world/player.md#death-and-levelling-up) | The player is about to die. Return true to stop it. |
| [`Player.OnLevelUp(level)`](../world/player.md#death-and-levelling-up) | The player levels up. |
| [`Quests.OnStarted`, `OnProgress`, `OnCompleted`, `OnFailed`](../world/player.md#quests) | A quest starts, moves on a step, is done or fails. |
| **Items** | |
| [`Inventory.OnAdded(item)`, `OnRemoved(item)`, `OnEquipped(item, on)`](../world/inventory-and-containers.md#inventory) | The player gains or loses an item, puts one on or takes one off. |
| [`Containers.OnOpened`, `OnClosed`, `OnItemAdded`, `OnItemRemoved`](../world/inventory-and-containers.md#containers) | A container opens or closes; an item goes into an open one or comes out. |
| [`GroundItems.OnAdded(item)`, `OnRemoved(item)`](../world/locations-and-items.md#ground-items) | An item comes onto the ground or leaves it. |
| **UI** | |
| [`ContextMenus.OnOpen(menu)`](../ui/context-menus.md) | A right-click menu opens. |

## What counts

Events report what happens **in play**. The units, items and doors a place already has as it loads, or a room is built with, don't count as spawned or added. Where an event says "on the frame after", the thing is set up by then (its data filled in); one that's gone again by then isn't reported.
