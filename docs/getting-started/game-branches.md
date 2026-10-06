# Native and VM branches

Stoneshard on Steam comes in two builds, and StoneForge runs on both (since 0.7.0):

| Branch | Build | |
|---|---|---|
| **The default branch** | Native (YYC) | The game everyone gets. Its GML is compiled into `StoneShard.exe`. |
| **The VM modbranch** | VM | A beta branch for modding. Its GML is in `data.win`, run by GameMaker's runner. |

To switch, right-click Stoneshard in Steam > **Properties** > **Betas**, and pick the modbranch (or none, for the default branch). Install StoneForge again after switching: each build has its own game files.

## What works where

C# mods work on both. On the native build there's no GML to add to, so StoneForge does in C# what it did in GML; a few things still need the VM modbranch.

| | Native branch | VM modbranch |
|---|---|---|
| C# mods: items, buffs, skills, UI, events, hooks... | Yes | Yes |
| [A mod's own GML](../modding/gml-bindings.md) (its `GML` folder) | **No**: the mod isn't loaded, and its page in the Mods window says why | Yes |
| [Script hooks](../gml/hooks.md#script-hooks) | Any script, nothing to declare | The scripts the mod declares with `[assembly: HookScript]`, from the next start |
| [A mod's game objects](../content/game-objects.md) | Run their parents' events: an event no ancestor has never runs (the log says which) | Have every event of their own |

{% hint style="warning" %}
**GML only works on the VM modbranch.** A mod with a `GML` folder isn't loaded on the native branch. If your mod needs GML, say so on its page, and tell players to switch to the modbranch.
{% endhint %}

## Writing mods for both

- Declare the scripts you hook with `[assembly: HookScript]` anyway. The native build doesn't need it, and the VM build does.
- Give a [game object](../content/game-objects.md) a parent that has the events you override, or they won't run on the native build.
- Keep to C#: a mod with GML runs only on the VM modbranch.

`Game.IsNative` says which build the game is.

## Building StoneForge

StoneForge's typed game API is generated from the game's GML, which only the VM build's data has. Build StoneForge once with the game on the VM modbranch: the data it reads is kept in `%LOCALAPPDATA%\StoneForge\GameData`, and builds against the native branch use it. See [Building and testing](../development/building-and-testing.md).
