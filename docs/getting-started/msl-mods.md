# MSL mods (.sml)

StoneForge runs [ModShardLauncher](https://github.com/ModShardTeam/ModShardLauncher) (MSL) mods alongside its own, since 0.8.0. You don't need to install MSL: StoneForge bundles its patching code.

{% hint style="warning" %}
**MSL mods work only on the VM modbranch**, as GML does. See [Native and VM branches](game-branches.md).
{% endhint %}

## Installing an MSL mod

1. Put the `.sml` file directly in `<Stoneshard>\mods` (not in a subfolder).
2. Start the game.

Packages are **enabled by default**. They appear in the Mods window marked `[MSL]`, with their name, author, version and description, and a warning that they run unrestricted code. To switch one off, untick **Enabled**: it takes effect the next time the game starts.

{% hint style="danger" %}
**Only install `.sml` packages you trust.** An MSL mod runs unrestricted C# while it patches the game: StoneForge's sandbox doesn't apply to it. The helper that runs it is a separate process to keep MSL's older libraries apart, not a security boundary.
{% endhint %}

## How it works

When the game starts, StoneForge's patcher prepares the game data:

1. It starts from the preserved, unpatched game data (`dotnet\data_base.win`).
2. The bundled MSL 0.13.2.0 helper (or [MSL Enhanced](#msl-enhanced)) applies the enabled packages, in filename order (or the order you set in [`msl-runtime.json`](#msl-runtimejson)).
3. StoneForge applies its own patches on top.

The result is kept until something changes. Adding, changing, disabling or removing a package rebuilds the game data from the preserved base on the next start. A console window shows the helper's progress while it works.

- **No hot reload.** Unlike StoneForge's C# mods, MSL packages only change at a restart.
- **File names identify packages.** Renaming a disabled package makes it a new, enabled one.
- **A failed patch changes nothing.** If the helper fails, the last game data stays in place. Don't assume a changed selection was applied after an error: the log says what went wrong.

## MSL Enhanced

StoneForge also bundles [MSL Enhanced](https://www.nexusmods.com/stoneshard/mods/103?tab=description) by Tbonex28b (the September 17, 2026 build, Nexus 1.15), in `dotnet\msle`. You don't need to install or run Enhanced's launcher.

By default (`auto`), StoneForge uses Enhanced when an enabled package needs it: it uses Enhanced's extended resource format, or MSL types and members that regular MSL lacks. Otherwise it uses regular MSL. One runtime prepares all the enabled packages together, and packages prepared with Enhanced show `[MSLE]` in the Mods window.

Enhanced packages can also replace sounds, fonts and shaders outside `data.win`. StoneForge keeps the originals in `dotnet\msl-audio-base` and puts them back when those mods are removed, or when StoneForge is uninstalled: keep that folder. Fonts and shaders go in the game's usual `StoneShard\fonts` and `StoneShard\shaders` folders in AppData.

Enhanced's errors stop preparation, with details in `dotnet\msl-patch.log`: missing dependencies, load-order problems, resource conflicts, and patch or import errors. Nothing is changed then. Enhanced's own native-branch (YYC) features and launcher UI aren't supported.

### msl-runtime.json

An optional `dotnet\msl-runtime.json` chooses the runtime and the order packages run in:

```json
{
  "Mode": "auto",
  "EnhancedDirectory": "msle",
  "PackageOrder": ["ShardMaster.sml", "AmbientAnimals.sml"]
}
```

| | |
|---|---|
| `Mode` | `auto` (the default); `enhanced`, for packages whose needs `auto` can't see (through reflection, say); or `standard`, regular MSL only, refusing packages that need Enhanced. |
| `EnhancedDirectory` | Where Enhanced is, from `dotnet` (`msle`). |
| `PackageOrder` | Packages to run first, by file name, in this order. The rest follow in file name order. It doesn't enable a disabled package. |

Everything is optional. Changes take effect at the next start, and the Mods window keeps the file as it is.

## Requirements and limits

- The **.NET 10 Windows Desktop Runtime (x64)**, not just the base .NET 10 Runtime: MSL is a WPF program. The installer warns if it's missing, and preparation checks it before running the helper. See [Installation](installation.md#requirements).
- The **VM modbranch**. On the native branch, packages show in the Mods window with an error, and the game data step refuses to apply them: disable them, or switch to the modbranch.
- **Clean base data.** The preserved base must be unpatched modbranch data, not data MSL's own launcher already patched. If it is, StoneForge refuses to apply packages and says so: restore clean modbranch data first.
- **Unsupported:** mods that depend on MSL's launcher window or its scripting server. Other mods work as far as their MSL API and the game version allow: test each with a spare save.

## Troubleshooting

| | |
|---|---|
| `dotnet\msl-patch.log` | The helper's full log for the last preparation. |
| The package's page in the Mods window | Whether it was applied, and why not. "The package changed, but this run still contains its previous patches" means restart to apply it. |

StoneForge's own C# mods and MSL packages can be used together: both load in the same game, and the loading screen and main menu count both.
