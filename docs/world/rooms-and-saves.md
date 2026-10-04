# Rooms and saves

## Moving between rooms

`Rooms` moves between screens as the game does: a fade to black, the room changer's events, then the next room. Each call returns `false`, doing nothing, when it can't be done now: another room change is under way (`IsChanging`), or it isn't the screen for it.

```csharp
// Go into the room you're in again, as a door to it would: the room saved, a fade, rebuilt from its save.
if (Gm.InGame && !Game.IsBusy)
    Rooms.Change(Rooms.Current);
```

| `Rooms` | |
|---|---|
| `Current`, `CurrentName` | The room the game is in (`"r_globalmap_forest"`). |
| `InMainMenu`, `IsChanging` | |
| `Change(room, saveLocation, fade)` | Another room of the game being played, as a door does. The room being left is saved first, unless `saveLocation` is false. By index or name. |
| `ToMainMenu(save)` | Back to the main menu, as the Esc menu's Exit does - or, with `save`, as Save and Exit does. |
| `LoadSave(save)` | Load a save, as the save menu does (from the main menu, or from a game, left without saving). |
| `StartNew(prologue, permadeath)` | A new game, from the main menu, as its New Game buttons do. |

## Saves on disk: SaveSlots

`SaveSlots` reads the saved games on disk, as the game's save menu shows them: character folders (slots, `"character_1"` up to 10), newest first, each with its info and its saves.

```csharp
using System.Linq;

foreach (var slot in SaveSlots.All)
{
    context.Log($"{slot.Name}: {slot.Info?.CharacterName ?? "?"}, saved {slot.Info?.SavedAt}, {slot.Saves.Count} save(s)");
    foreach (var save in slot.Saves)
        context.Log($"  {save.Name} ({save.Kind}): {save.Info?.LocationTitleKey}");
}

// Load the newest save:
var newest = SaveSlots.All.SelectMany(slot => slot.Saves.Take(1)).FirstOrDefault();
if (newest != null)
    Rooms.LoadSave(newest);
```

| `SaveSlots` | |
|---|---|
| `All` | Every character folder, newest first. |
| `Current`, `CurrentSave` | The folder and save of the game being played (`null` if never saved). |
| `Get(name)` | A folder by name. |
| `OnInfoSaving(context, (slot, info) => ...)` | Add values of your own to a folder's info as the game writes it, each time it saves. |
| `SetTitle(context, slot => ...)` | Give folders a header of your own in the save menu (`null` keeps the game's). |

`SaveSlot` has `Name`, `Number`, `Exists`, `Info` (`SlotInfo`: `CharacterName`, `IsPermadeath`, `IsPrologue`, `SavedAt`, and any value by name) and `Saves`. Each `SaveFile` has `Slot`, `Name`, `Kind` (`SaveKind.Manual`, `Auto` or `Exit`) and `Info` (`SaveInfo`: `CharacterName`, `LocationTitleKey`, `Avatar`, `SavedAt`, `IsValid`...).

A mod's values in the save menu - here, how many saves were made with the mod on:

```csharp
SaveSlots.OnInfoSaving(context, (slot, info) =>
    info["example_saves"] = (slot.Info?["example_saves"] is { Kind: GmKind.Real } count ? count.AsInt : 0) + 1);

SaveSlots.SetTitle(context, slot => slot.Info is { } info && info["example_saves"] is { Kind: GmKind.Real } count
    ? $"{info.CharacterName ?? "?"} - {count.AsInt} save(s) with Example Mod"
    : null);
```

## The game being played: SaveData

`SaveData` is the save data of the game being played (the game's `global.saveDataMap`): everything a save writes, in sections. It's live: the game keeps changing it and writes it to disk as it saves. It's there only in a game: check `SaveData.Available`.

```csharp
if (SaveData.Available)
{
    context.Log($"Sections: {string.Join(", ", SaveData.Sections)}");
    string? character = SaveData.CharacterJson();   // who's playing, without their world
}
```

| `SaveData` | |
|---|---|
| `Available`, `Map` | The save data itself (the game's: never destroy it). |
| `Sections`, `CharacterSections`, `WorldSections` | Section names: the character's (who they are, stats, skills, inventory, scrolls, cleared fog) and the world's (the map, locations, quests, contracts, time, weather...). |
| `Section(name)`, `SectionList(name)` | A section as a map (`"gameDataMap"`) or list (`"inventoryDataList"`). |
| `ToJson()`, `ToJson(sections)`, `CharacterJson()` | As JSON, as the game writes it. |
| `ModMap(key)` | A map of your own in the save data, saved and loaded with the game. |

### Keeping a mod's own data in saves

```csharp
DsMap stash = SaveData.ModMap("mymod_stash");   // made empty the first time
stash["gold"] = stash.Get("gold", 0) + 10;
```

Use a key of your mod's own: the game's sections are the save data's other keys.
