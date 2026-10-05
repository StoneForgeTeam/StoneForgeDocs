# StoneForge

StoneForge is a C# mod loader for Stoneshard on Windows. Mods are source folders with a `mod.json` manifest, C# code and optional assets and GML bindings. StoneForge compiles and checks them when the game starts, and provides context APIs for items, consumables, buffs, skills, UI and game hooks.

## Where to start

* **Playing with mods:** [Installation](getting-started/installation.md).
* **Your first mod:** [Writing a mod](modding/writing-a-mod.md), then [the mod context](core/mod-context.md). The [profiler](core/profiler.md) (Ctrl+Shift+P) shows what each mod costs a frame. The [Example Mod](https://github.com/StoneForgeTeam/ExampleMod) shows most of the API in one mod.
* **How it reaches into the game:** [How GML maps to C# code](gml/overview.md): values, instances, calling the game's scripts and built-ins, and hooking its scripts and events.
* **Adding content:** [items](content/items.md), [buffs](content/buffs.md), [skills](content/skills.md), [damage](content/combat.md), [effects](content/fx.md) and [game objects](content/game-objects.md).
* **UI:** [screens and elements](ui/screens-and-elements.md), [windows](ui/windows.md), [drawing and input](ui/drawing-and-input.md), [dialogs](ui/dialogs.md), [the main menu](ui/main-menu.md), [the Esc menu](ui/esc-menu.md), [right-click menus](ui/context-menus.md).
* **The world:** [the player](world/player.md), [units and turns](world/units.md), [time and the world map](world/time-and-map.md), [rooms and saves](world/rooms-and-saves.md), [locations and ground items](world/locations-and-items.md), [character looks](world/character-look.md).
* **Working on StoneForge itself:** [Building and testing](development/building-and-testing.md), the [developer host](development/developer-host.md) and the [repository layout](development/repositories.md).

## Repositories

| Repository | Contents |
|---|---|
| [StoneForge](https://github.com/StoneForgeTeam/StoneForge) | The loader, API, native bridge, patcher, generators, tests and build tooling |
| [ExampleMod](https://github.com/StoneForgeTeam/ExampleMod) | The sample mod |
| [StoneForgeDocs](https://github.com/StoneForgeTeam/StoneForgeDocs) | This documentation |
