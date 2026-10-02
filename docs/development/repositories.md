# Repository layout

The organization is `StoneForgeTeam`.

| Repository | Contents | Versioning |
|---|---|---|
| [StoneForge](https://github.com/StoneForgeTeam/StoneForge) | API, loader, native bridge, patcher, source generators, DataDump, tests and build/install tooling | One coordinated StoneForge release |
| [ExampleMod](https://github.com/StoneForgeTeam/ExampleMod) | Sample C# code, GML, assets, manifest and editor project | Independent mod versions; `mod.json` declares the minimum StoneForge version |
| [StoneForgeDocs](https://github.com/StoneForgeTeam/StoneForgeDocs) | This documentation, published with GitBook | Follows StoneForge releases |

Keep the code checkouts as siblings, with the sample folder named `ExampleMod`. There are no submodules or project references between them. The sample references the API and GML generator from an installed StoneForge release; its README explains SDK configuration and installation.

The API, bridge and loader share runtime contracts. The patcher, DataDump and generators also depend on the same game-data and generated-code conventions. Keeping them together lets a change to these contracts be built, tested and released as one unit. Documentation lives in StoneForgeDocs; a StoneForge change that alters documented behavior should update the matching page for the same release.

Third-party libraries remain pinned under `lib/`, with their licenses, source provenance and rebuild tooling. The small Aurie patch stays alongside its pin; YYToolkit is unmodified. Separate forks are unnecessary for the current scope. A dedicated Aurie fork would make sense if native changes grow enough to need their own releases or upstream collaboration.

Regression fixtures stay in the main repository so its tests do not require the sample checkout. New independent mods can follow ExampleMod's repository structure.
