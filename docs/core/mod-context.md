# The mod context

Every mod gets a `ModContext` in `Load`. It's how the mod registers everything it adds to the game, and what StoneForge uses to take it all back when the mod is switched off.

```csharp
using StoneForge;

namespace MyMod;

public class MyMod : IStoneMod
{
    public void Load(ModContext context)
    {
        context.Log($"Hello from {context.Name} {context.Manifest.Version}");
    }

    public void Unload() { }
}
```

## Lifecycle

| | |
|---|---|
| `Load(context)` | Runs once, as the game starts (or when the player switches the mod on). Register items, buffs, skills, objects, hooks, UI and settings here. The game isn't running frames yet: do things that touch the game in events, `Tick` or UI callbacks. |
| `Unload()` | The player switched the mod off while the game runs. Undo anything you changed that you *didn't* register through the context: globals you set, instances you made, files. Everything registered through the context is taken back for you afterwards. Not called when the game quits. |

What's taken back for you: event and script hooks, `ITickable`s, `DrawGui` handlers, UI and windows, main menu buttons, settings (saved first), and your items, buffs and skills (removed from the game; a save from before still has them for when the mod is back).

## Every frame: ITickable

A mod class that implements `ITickable` is ticked every frame from when it's loaded:

```csharp
public class MyMod : IStoneMod, ITickable
{
    public void Tick(double deltaTime)   // seconds since the last frame
    {
        if (Keyboard.Pressed(Keyboard.F7))
            _context.Items.Give(_blade);
    }
    ...
}
```

Anything else can be ticked with `context.AddTickable(thing)` (and stopped with `RemoveTickable`). Items and buffs that implement `ITickable` are ticked once they're added.

## What the context has

| Member | |
|---|---|
| `Manifest`, `Id`, `Name` | The mod's `mod.json`. |
| `Log(text)` | A line in the loader's log, tagged with the mod's name. |
| `Items`, `Buffs`, `Skills`, `Objects` | Registering [items](../content/items.md), [buffs](../content/buffs.md), [skills](../content/skills.md) and [game objects](../content/game-objects.md), and using them. |
| `ContentId(key)` | The full id of your content: `"mymod:key"`. |
| `Settings` | [Settings](settings.md) the player can change in the Mods window. |
| `UI` | [Screens](../ui/screens-and-elements.md) to put UI on. |
| `DrawGui`, `DrawHud` | Events to [draw](../ui/drawing-and-input.md) every frame: over everything, or with the game's HUD under its windows. |
| `OnScript`, `OnCode` | [Hooks](../gml/hooks.md) by name. |
| `LoadSprite`, `LoadSound` | Pictures and sounds from your `Assets` folder. |
| `Files` | Reading and writing files. |
| `AddTickable`, `RemoveTickable` | Ticking things other than the mod class. |

## Pictures and sounds

```csharp
int icon = context.LoadSprite("icon.png");                       // Assets\icon.png
int strip = context.LoadSprite("fx/spark.png", frames: 6);       // 6 frames side by side
int music = context.LoadSound("theme.ogg");                      // an OGG stream
```

Paths are relative to the mod's `Assets` folder. The sprite is owned by the mod: loading the same path again reuses it, and it's retired when the mod unloads (don't delete it yourself). Both return `-1` if the file is missing or can't be loaded.

## Files

Mods can't use `System.IO`. `context.Files` is their file access:

```csharp
var files = context.Files;
string names = files.ReadAllText(files.AssetPath("names.txt"));
files.WriteAllText("notes.txt", "...");                                  // mods\MyMod\notes.txt
string[] logs = files.ListFiles(files.ModFolder, "*.txt");                // full paths
```

| | |
|---|---|
| Relative paths | In the mod's own folder (`mods\<mod>\`). |
| Reading | Anywhere in the game's folder (`ModFiles.GameFolder`) or Stoneshard's data folder (`ModFiles.DataFolder`, `%LOCALAPPDATA%\StoneShard`: saves, settings). |
| Writing | Only in the data folder or the mod's own folder: never the game's files, the loader or other mods. |

`Exists`, `DirectoryExists`, `ReadAllText`, `ReadAllLines`, `ReadAllBytes`, `ListFiles`, `WriteAllText`, `AppendAllText`, `WriteAllBytes`, `Delete`, `CreateDirectory`. A path outside what's allowed throws `UnauthorizedAccessException`.

## Trusted mods

A mod can ask for full access with `"trusted": true` in its `mod.json`: its own DLLs, the whole of .NET (networking, threads, files, reflection) and `Game.CallBuiltinUnrestricted`. It runs only once the player allows it in the Mods window, warned that it can do anything a program on their PC can. Ask for it only when a mod truly needs it, such as for multiplayer networking.
