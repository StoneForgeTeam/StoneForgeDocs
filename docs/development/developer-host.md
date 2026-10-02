# Developer host and live probe

{% hint style="info" %}
Paths and commands on this page are relative to a checkout of the [StoneForge repository](https://github.com/StoneForgeTeam/StoneForge).
{% endhint %}

## Developer host

The developer host is **off by default**. Enable it for a test session with `STONEFORGE_TEST=1`, or create an empty `dotnet/testhost.enable` file beside the loader before launching. Remove the marker/unset the variable and restart to disable it. The shipped package includes neither marker nor probe mod.

The host creates a current-user-only named pipe, `stoneforge-<process id>`, and records its name in `dotnet/testhost.pipe`. Requests execute on the game thread after startup completes. The queue is bounded, input lines are limited to 16,384 characters, and queued requests expire after ten seconds. A timeout after execution starts does not guarantee a mutation was cancelled.

From the source workspace, PowerShell examples:

```powershell
.\build\Inspect.ps1 -Request '{"cmd":"smoke"}'
.\build\Inspect.ps1 -Request '{"cmd":"status"}'
.\build\Inspect.ps1 -Request '{"cmd":"objects","name":"o_mainMenuButton"}'
.\build\Inspect.ps1 -Request '{"cmd":"inspect","id":397872,"names":["x","y","object_index"]}'
.\build\Inspect.ps1 -Request '{"cmd":"globals","names":["room","mainMenuRoom"]}'
.\build\Inspect.ps1 -Request '{"cmd":"builtin","name":"abs","args":[-17.25]}'
.\build\Inspect.ps1 -Request '{"cmd":"trace.watch","name":"scr_stonemod_draw_gui"}'
.\build\Inspect.ps1 -Request '{"cmd":"trace.read"}'
.\build\Inspect.ps1 -Request '{"cmd":"trace.stop"}'
```

Use `-GameFolder 'C:\path\to\test-game'` for another installation. IDs above are examples; use `objects` to obtain current IDs. Inspection reads selected names, not a full enumeration of every variable. Built-in calls use the normal mod API restrictions; this interface does not evaluate arbitrary C#.

Tracing currently records **input arguments and self ID**, not the original script's return value. It can attach to a script whose hook flag already exists, usually because a loaded mod declared and subscribed to it. It does not patch a new script while the game is running. Traces retain at most 128 calls and 32 watches; `trace.clear` clears recordings and `trace.stop` removes all diagnostic watches.

`mod.reload` and `mod.disable` take a `name` and queue a change for the next frame. They do not persist the player's enabled preference. Use `status` afterward to inspect the result. Reloading game-content mods can remove their items, just as the Mods window does.

## Reproducible live probe

Use a disposable copy of the game at its main menu, without loading a save. Copy the **contents** of `StoneForge.Tests/live` into `mods/ReliabilityProbe` and enable the developer host. The probe needs game data already prepared by StoneForge, including `o_stonemod_gui` and `o_stonemod_modal`.

At startup the log should show `LIVE PASS` for sprite import/deduplication, stored callback instances, stored-instance call context, and rejecting a destroyed instance. The probe imports `Assets/probe.png`, a 2×2 test image. It creates and immediately destroys its own temporary modal instance.

```powershell
.\build\Inspect.ps1 -Request '{"cmd":"mod.reload","name":"Reliability Probe"}'
.\build\Inspect.ps1 -Request '{"cmd":"status"}'
.\build\Inspect.ps1 -Request '{"cmd":"mod.disable","name":"Reliability Probe"}'
```

Repeated reloads should retain one active sprite with the same ID, printed in the log. Disable should leave zero active probe sprites and one retired sprite; `sprite_get_width` for that ID should return 1 instead of 2. Retired IDs remain valid because game objects might still reference them. Reuse is restricted to the same owner/path/options; adding entirely new asset paths still allocates new IDs.

To test fault isolation, enable/reload the probe and set its development flag:

```powershell
.\build\Inspect.ps1 -Request '{"cmd":"builtin","name":"variable_global_set","args":["stoneforge_probe_fault",true]}'
```

After three game frames, `status` should show `RuntimeError`, and the log should contain one exception plus one pause message. A `smoke` request should still pass. Set the flag to `false`, then reload the probe to recover. Remove the probe after testing.
