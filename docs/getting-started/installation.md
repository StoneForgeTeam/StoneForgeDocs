# Installation

## Requirements

* Stoneshard (Steam), on the **VM modbranch**.
* The **.NET 10 Runtime, x64** to play with mods: [download](https://dotnet.microsoft.com/download/dotnet/10.0). The installer tells you if it's missing.

StoneForge uses UndertaleModLib 0.9.2.0 and Underanalyzer directly to patch game data. Game data is read from your local install.

## Install

1. Close Stoneshard.
2. Download `StoneForge-<version>.zip` from the [StoneForge releases](https://github.com/StoneForgeTeam/StoneForge/releases), extract it and run `Install StoneForge.cmd`. It finds Stoneshard through Steam (or asks for its folder), copies StoneForge in, and sets the game up. Your game's own files are kept, so it can all be undone.
3. Start Stoneshard as usual. The main menu has a Mods button.

Re-running the installer from a newer release updates an existing installation.

## Mods

Mod folders go in `<Stoneshard>\mods`. Open the in-game Mods window to enable or disable them.

{% hint style="warning" %}
GML mods carry a warning: their scripts execute directly in GameMaker, outside the C# source restrictions, and need a game restart after edits. See [GML bindings](../modding/gml-bindings.md).
{% endhint %}

## Steam updates

Game updates and Steam's "Verify integrity of game files" put the game's own `StoneShard.exe` back, which turns StoneForge off until you install it again. To have it put back automatically, set Stoneshard's launch options in Steam (right-click Stoneshard > Properties > General > Launch options) to:

```
"<Stoneshard>\dotnet\patcher\StoneForge.Patcher.exe" run %command%
```

The installer prints this line with your game's folder filled in.

## Uninstall

Close Stoneshard and run `Uninstall StoneForge.cmd`. The game's own files are put back and StoneForge's removed; your mods folder is kept.

## What it changes in the game folder

* `StoneShard.exe` is patched to load StoneForge (the original is kept as `StoneShard.exe.vanilla`).
* `data.win` gets StoneForge's additions (the original is kept as `dotnet\data_base.win`).
* `AurieCore.dll`, `aurie\` and `dotnet\` hold StoneForge itself; `mods\` holds your mods.
