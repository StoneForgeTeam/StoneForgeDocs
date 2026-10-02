# Building and testing

{% hint style="info" %}
Paths and commands on this page are relative to a checkout of the [StoneForge repository](https://github.com/StoneForgeTeam/StoneForge).
{% endhint %}

## Building

The managed runtime projects use .NET 10; install the .NET 10 SDK for builds and the x64 .NET 10 Runtime for the game. Roslyn source generators intentionally remain `netstandard2.0` so Visual Studio can load them. The ExampleMod editor project targets `net10.0` too.

Build the solution with Visual Studio's MSBuild (the native bridge is a C++ project, which `dotnet build` can't load):

```powershell
& "<Visual Studio>\MSBuild\Current\Bin\MSBuild.exe" StoneForge.slnx -restore -p:Configuration=Release -p:PlatformToolset=v145
```

`build\Package.ps1` builds and makes a release in `artifacts\`.

**Stoneshard must be installed** (the Steam version, VM modbranch). The typed game API (`Sprite`, `GameObject`, `Scripts`, `GameItems`, `GameSkills`...) is generated from the game's own data, which isn't in the repository: the API build runs `StoneForge.DataDump` on this machine's install into `StoneForge.API\obj\GameData`. It reads `dotnet\data_base.win` (StoneForge's preserved unpatched copy) when StoneForge is installed, else `data.win`, and only re-reads it when that file changes (about 4 s; otherwise a fraction of a second). The game is found through Steam; elsewhere, set `STONESHARD_DIR` or pass `-p:StoneshardDir=<folder>`. Run it by hand with `dotnet StoneForge.DataDump\bin\Release\net10.0\StoneForge.DataDump.dll <output folder> [--game <folder>] [--data <data.win>]`.

## Patcher and UndertaleModLib

StoneForge owns the small editing adapter in `StoneForge.Patcher/GameData/GameDataEditor.cs`. Each build has its own `UndertaleData` context. UndertaleModLib reads/writes data.win and compiles/decompiles GML; WPF is not a dependency. The VM **modbranch is still required**.

Both Patcher and DataDump reference UndertaleModLib 0.9.2.0 and its matching Underanalyzer DLL in `lib/UndertaleModLib`; see its README for exact source revisions, checksums and licenses. The editor uses `CodeImportGroup` and the Underanalyzer decompiler. Functions are imported as standard global scripts, with their global initialization entries maintained by the library. The argument rewrite remains in place for this upgrade; simplifying it is separate work.

The integration tests (`StoneForge.Patcher.Tests`, xUnit) patch unpatched VM game data once, save it to a temporary file and read it back. They check all loader patches, custom consumable/skill inheritance, mod GML, script hooks, function metadata after serialization, unchanged original asset IDs, and error handling. The data is `STONEFORGE_TEST_DATA` if set, otherwise the Steam install's `dotnet\data_base.win` (StoneForge's preserved unpatched copy); with neither, the tests are skipped. The input is never changed.

```powershell
dotnet test StoneForge.Patcher.Tests -c Release
$env:STONEFORGE_TEST_DATA = "C:\path\to\unpatched-data.win"; dotnet test StoneForge.Patcher.Tests -c Release
```

The offline tests (`StoneForge.Tests`, xUnit) need no game: the mod sandbox cases, ModFiles' path rules, the loader against a fake bridge, the context APIs and GML bindings. Run `dotnet test StoneForge.Tests -c Release`, or both projects from Visual Studio's Test Explorer.

Use a disposable game copy for live testing. Packaging rejects stale UndertaleModTool application and Serilog DLLs; clean/rebuild the patcher if that check fails. An installed upgrade removes obsolete files recorded in StoneForge's installation manifest.
