# StoneForge

StoneForge is a C# mod loader for Stoneshard on Windows. Mods are source folders with a `mod.json` manifest, C# code and optional assets and GML bindings. StoneForge compiles and checks them when the game starts, and provides context APIs for items, consumables, buffs, skills, UI and game hooks.

## Where to start

* **Playing with mods:** [Installation](getting-started/installation.md).
* **Writing a mod:** [Writing a mod](modding/writing-a-mod.md) covers the manifest, the mod class and content IDs. [GML bindings](modding/gml-bindings.md) and [API lifetime rules](modding/api-lifetime-rules.md) go further. The [Example Mod](https://github.com/StoneForgeTeam/ExampleMod) shows items, buffs, skills, UI and GML.
* **Working on StoneForge itself:** [Building and testing](development/building-and-testing.md), the [developer host](development/developer-host.md) and the [repository layout](development/repositories.md).

## Repositories

| Repository | Contents |
|---|---|
| [StoneForge](https://github.com/StoneForgeTeam/StoneForge) | The loader, API, native bridge, patcher, generators, tests and build tooling |
| [ExampleMod](https://github.com/StoneForgeTeam/ExampleMod) | The sample mod |
| [StoneForgeDocs](https://github.com/StoneForgeTeam/StoneForgeDocs) | This documentation |
