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
2. The bundled MSL 0.13.2.0 helper applies the enabled packages, in filename order.
3. StoneForge applies its own patches on top.

The result is kept until something changes. Adding, changing, disabling or removing a package rebuilds the game data from the preserved base on the next start. A console window shows the helper's progress while it works.

- **No hot reload.** Unlike StoneForge's C# mods, MSL packages only change at a restart.
- **File names identify packages.** Renaming a disabled package makes it a new, enabled one.
- **A failed patch changes nothing.** If the helper fails, the last game data stays in place. Don't assume a changed selection was applied after an error: the log says what went wrong.

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
