# Writing a mod

A mod is a folder in `Stoneshard\mods`: its `mod.json`, its C# source (`*.cs`, in any subfolders), its pictures and sounds in `Assets\`, its translations in `Localization\` (see [Localization](../core/localization.md)), its NPC dialogue edits in `Dialogue\` (see [NPC dialogues](../ui/npc-dialogues.md#where-edits-go)), and optionally its GML in `GML\` (see [GML bindings](gml-bindings.md); GML runs only on the VM modbranch). StoneForge compiles and checks the source when the game starts. A folder holds one mod.

## mod.json

```json
{
  "id": "examplemod",
  "name": "Example Mod",
  "version": "1.0.0",
  "author": "you",
  "description": "What it does, in a sentence or two.",
  "stoneforge": "0.9.1",
  "requires": ["othermod"],
  "after": ["thirdmod"]
}
```

| Key | | |
|---|---|---|
| `id` | required | The mod's permanent ID: lowercase letters and digits, single underscores between them (`examplemod`, `yourname_examplemod`). Its settings, whether it's switched on, and its content are known by it - don't change it once players have the mod. |
| `name` | required | Shown in the Mods window, its log lines and "Mod: ..." on its items. |
| `version` | required | Your mod's version. |
| `author`, `description` | optional | Shown in the Mods window. |
| `stoneforge` | optional | The StoneForge version it needs, at least (`"0.9.1"`). An older StoneForge doesn't load it and says so. `"latest"` marks a mod in development: see below. |
| `requires` | optional | Mods it needs, by ID. It loads after them, only if they're all there and running, and it can use their public types. See [Using other mods](../core/other-mods.md). |
| `after` | optional | Mods to load after, if they're there. |
| `github` | optional | The mod's GitHub repository (`"YourAccount/YourMod"`, or its URL), for [bug reports](../getting-started/bug-reports.md) from the Esc menu. |
| `contributors` | optional | Steam accounts (as strings: account IDs or SteamID64s) that can use the mod's dev tools, such as the [dialogue editor](../ui/npc-dialogues.md#the-in-game-dialogue-editor). `context.IsContributor` checks the current one. |
| `trusted` | optional | `true` asks for full access: its own DLLs, the whole of .NET and no sandbox. It runs only once the player allows it in the Mods window. See [Trusted mods](../core/mod-context.md#trusted-mods). |

### Mods in development: "latest"

While you develop a mod against StoneForge's `main` - between releases, for its newest API - set `"stoneforge": "latest"`. Any StoneForge loads it, the version check is skipped, and the log calls it a development build. In code, `context.Manifest.InDevelopment` says so. When you release the mod, set the version of StoneForge it was built against.

Without a valid `mod.json` the folder isn't loaded; the Mods window says what's wrong. Two folders with the same `id`: the second isn't loaded. Code reads the manifest as `context.Manifest`.

## The mod class

```csharp
using StoneForge;

namespace MyMod;

public class MyMod : IStoneMod
{
    public void Load(ModContext context) => context.Log("Hello from " + context.Name);
    public void Unload() { }
}
```

One public `IStoneMod` class per folder. Its name, version and so on come from `mod.json`.

## The editor project

The game compiles a mod's `.cs` files itself when it starts, so a mod needs no build step. A project file is still worth having: it gives your editor (Visual Studio, Rider, VS Code) autocomplete, the generated game API and errors as you type. Nothing it builds is loaded.

A mod folder, with its project:

```
Stoneshard\mods\MyMod  mod.json
  MyMod.csproj
  MyMod.cs
  Items\...
  Assets\         pictures and sounds (icon.png for the Mods window)
  GML\            optional: GML functions of your own
```

`MyMod.csproj`, as the [Example Mod](https://github.com/StoneForgeTeam/ExampleMod)'s:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <!-- For editing in an IDE only: the game compiles this folder's .cs files itself when it starts (and checks
       them - only what's safe for a mod is allowed). Nothing built here is loaded. -->
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <!-- As the game compiles mods: no implicit usings, C# 12. -->
    <ImplicitUsings>disable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <LangVersion>12</LangVersion>
    <PlatformTarget>x64</PlatformTarget>
    <!-- StoneForge as installed in the game: STONESHARD_DIR, else the game folder this mod is in. -->
    <StoneForgeSdkDir Condition="'$(StoneForgeSdkDir)' == '' and '$(STONESHARD_DIR)' != ''">$(STONESHARD_DIR)\dotnet</StoneForgeSdkDir>
    <StoneForgeSdkDir Condition="'$(StoneForgeSdkDir)' == ''">$(MSBuildThisFileDirectory)..\..\dotnet</StoneForgeSdkDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- StoneForge.API as installed in the game: what the game compiles mods against. -->
    <Reference Include="StoneForge.API">
      <HintPath>$(StoneForgeSdkDir)\StoneForge.API.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <!-- GML functions of your own (the GML folder) as C#: the generator makes MyMod.Gml from them, as the game does. -->
    <Analyzer Include="$(StoneForgeSdkDir)\StoneForge.GmlGenerator.dll" />
    <AdditionalFiles Include="GML\**\*.gml" />
  </ItemGroup>

  <Target Name="ValidateStoneForgeSdk" BeforeTargets="ResolveReferences">
    <Error Condition="!Exists('$(StoneForgeSdkDir)\StoneForge.API.dll') or !Exists('$(StoneForgeSdkDir)\StoneForge.GmlGenerator.dll')"
           Text="Install StoneForge and set STONESHARD_DIR to the game folder, or pass -p:StoneForgeSdkDir=path-to-its-dotnet-folder." />
  </Target>

</Project>
```

It finds StoneForge in one of three ways:

- **Inside the game:** a mod in `<Stoneshard>\mods\MyMod` finds `<Stoneshard>\dotnet` on its own.
- **Elsewhere** (a Git checkout, say): set `STONESHARD_DIR` to the game folder before opening your editor:
  ```powershell
  $env:STONESHARD_DIR = 'C:\Program Files (x86)\Steam\steamapps\common\Stoneshard'
  dotnet build MyMod.csproj
  ```
- **Or** pass `-p:StoneForgeSdkDir="C:\path\to\Stoneshard\dotnet"`.

The project needs the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0). `ImplicitUsings` and `LangVersion` match how the game compiles mods, so code that builds here builds in the game - though the game's sandbox can still refuse what isn't allowed for mods (files, threads, reflection...), which the editor doesn't check. The folder's name decides the generated GML class: `MyMod.Gml` (see [Your own GML](gml-bindings.md)).

When copying a mod into the game from elsewhere, leave out `bin`, `obj`, `.git` and `.vs`.

## Content IDs

Items, consumables, buffs and skills are created with a short key, and StoneForge puts the mod's ID in front of it, so two mods can use the same key without clashing:

```csharp
public class Tonic : Wine
{
    public Tonic() : base("tonic") { DisplayName = "Example Tonic"; }
}
// context.Items.Add(tonic): tonic.Id is "examplemod:tonic"
```

| | |
|---|---|
| `Key` | `"tonic"`: what you wrote. Keys can't start with `_` or contain `:`. |
| `Id` | `"examplemod:tonic"`: how code refers to it, including other mods (`Items.Give("examplemod:Example Blade")`, `RequireSkill("othermod:bolt")`). |
| in the game's data | `examplemod__tonic`: its objects (`o_inv_examplemod__tonic`), table rows and saves. |

A mod's ID has no `__` and keys don't start with `_`, so no two mods' content can ever get the same name in the game. Keys (and the mod's ID) are what saves refer to: changing them loses that content from existing saves.

## Next steps

* [The mod context](../core/mod-context.md): loading, ticking, logging, pictures, files.
* [How GML maps to C# code](../gml/overview.md): how StoneForge's API reaches into the game.
* [Items](../content/items.md), [buffs](../content/buffs.md) and [skills](../content/skills.md): content of your own.
* [Screens and elements](../ui/screens-and-elements.md): UI of your own.
