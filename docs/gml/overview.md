# How GML maps to C# code

Stoneshard is a GameMaker game: everything in it - the player, enemies, items, menus, the save data - is GML objects, scripts, variables and data structures. StoneForge doesn't replace any of that. It gives C# a way in, in layers, each built on the one under it:

| Layer | What it is | Use it for |
|---|---|---|
| **Content APIs** | `Weapon`, `ModBuff`, `ModSkill`, `GameObject`, `UIWindow`, `SaveData`, `Time`... | Most mods: items, buffs, skills, UI, the world - written as C# classes, with the GML done for you. |
| **Generated API** | `Scripts.scr_atr`, `Events.o_player.Step_0`, `Objects.o_player`, `GameObjectId`, `Sprite`, `Sound`, `Room`, `StoneForge.GameItems`, `StoneForge.GameSkills`... | Hooking and calling the game's own scripts and events, reading its objects' variables - typed, with the game's names. |
| **Typed helpers** | `Gm`, `Instances`, `GameInstance`, `GmArray`, `GmStruct`, `DsMap`, `DsList` | Finding instances, common built-ins, the game's arrays, structs, maps and lists. |
| **By name** | `Game.CallBuiltin`, `Game.CallScript`, `Game.Global`, `Instance["name"]`, `GmValue` | Anything not covered above: any built-in, any script, any variable, by its GML name. |
| **The bridge** | StoneForge's native bridge inside the game | Not used directly: it carries every call and value between C# and GameMaker. |

You can mix layers freely. A typed instance always has its untyped `Instance` underneath (`player.Instance["any_variable"]`), and every generated script is also callable by name (`Game.CallScript("scr_atr", ...)`).

## Where the generated API comes from

The generated API is made from the game's own data at build time: `StoneForge.DataDump` reads Stoneshard's `data.win`, and a source generator turns it into C#:

| Generated | From | Example |
|---|---|---|
| `GameObjectId`, `Sprite`, `Sound`, `Room` | every asset | `GameObjectId.o_player`, `Sprite.s_weapondamage_electricity`, `Sound.snd_button_click` |
| `Scripts` | every GML script and function | `Scripts.scr_atr`, `Scripts.scr_player_move` |
| `StoneForge.Objects` | every object, following the game's inheritance, with the variables its events set | `o_player : o_unit`, `player.HP`, `player.max_hp` |
| `Events` | every object event | `Events.o_player.Step_0`, `Events.o_mainMenuButton.Other_25` |
| `StoneForge.GameItems` | the weapon, armour and consumable tables | `DrifterSword`, `LinenShirt`, `Wine` |
| `WeaponColumn`, `ArmorColumn`, `ConsumableColumn` | the item tables' columns | `WeaponColumn.Slashing_Damage`, `ArmorColumn.DEF` |
| `StoneForge.GameSkills`, `SkillColumn` | the skills and their table | `ChainLightning`, `StaticField` |
| `StoneForge.GameDamageTypes`, `DamageType.*` | the game's kinds of damage | `DamageType.Shock`, `DamageType.Fire` |

Because these are generated, a typo is a compile error rather than a silent failure in game, and your editor can autocomplete the game's names.

## A tour in one mod

```csharp
using StoneForge;
using StoneForge.Objects;

// Scripts this mod hooks must be declared, so the patcher makes them hookable.
[assembly: HookScript(nameof(Scripts.scr_player_move))]

namespace MyMod;

public class MyMod : IStoneMod, ITickable
{
    private ModContext _context = null!;

    public void Load(ModContext context)
    {
        _context = context;

        // Generated event, typed instance: player.HP rather than player.Get("HP").
        Events.o_player.Step_0.After(context, player =>
        {
            if (player.HP < player.max_hp * 0.25)
                context.Log("Low health!");
        });

        // Generated script hook: runs whenever the game calls scr_player_move.
        Scripts.scr_player_move.Before(context, call =>
        {
            context.Log($"{call.Name}({string.Join(", ", call.Args)})");
            return false;   // false: let the game's own code run
        });
    }

    public void Tick(double deltaTime)
    {
        // Typed helpers: find the player, read a built-in variable.
        if (Keyboard.Pressed(Keyboard.F4) && Instances.First<GameInstance>(GameObjectId.o_player) is { } player)
        {
            // By name: call any game script with any arguments.
            Game.CallScript("scr_atr_incr", player.Instance, "SP", 1);
            _context.Log($"An ability point, at ({player.X}, {player.Y})");
        }
    }

    public void Unload() { }
}
```

## Rules that apply everywhere

- **Write your usings.** Mods are compiled by the game without implicit usings: add `using System;`, `using System.Collections.Generic;` and `using System.Linq;` where you use `Math`, `Random`, collections or LINQ.
- **Game thread only.** Every call into the game must happen on its thread: in `Load`, a `Tick`, an event or hook handler, a UI callback or `DrawGui`. Don't call into the game from a `Task` or another thread.
- **Not before the game runs.** While mods load, the game isn't set up yet. `Game.Running` is false until it starts running frames; calls before then throw instead of crashing the game. Register things in `Load`; do things in events, `Tick` or UI callbacks.
- **Missing values aren't errors.** Reading a variable that doesn't exist gives `GmValue.Undefined`, and reading a value as the wrong type gives that type's default (a string read as a number is `0`). Check `Kind` or `IsUndefined` when it matters.
- **Failed calls throw.** A built-in or script call the bridge can't complete throws `GameCallException`, naming the function and why.
- **Handlers are isolated.** A handler that throws is logged and skipped: it doesn't take the game, or other mods, down.

## Where next

- [Values](values.md): `GmValue`, and the game's arrays, structs, maps and lists.
- [Instances and objects](instances.md): finding, reading and changing what's in the room.
- [Calling the game](calling-the-game.md): built-ins, scripts and globals.
- [Hooks: scripts and events](hooks.md): running your code around the game's.
- [Your own GML](../modding/gml-bindings.md): shipping GML functions with your mod and calling them from C#.
