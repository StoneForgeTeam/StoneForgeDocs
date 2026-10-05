# Calling the game

## Scripts

Every GML script and function in the game is generated in `Scripts`, with its name and argument count:

```csharp
GmValue level = Scripts.scr_atr.Call(player, "LVL");
Instance button = Scripts.scr_guiCreateInteractive.Call(nav, nav.buttonsContainer, GmValue.From(GameObjectId.o_mainMenuButton), nav.Depth - 1, 0, top);
```

`Call(self, args...)` runs the script as `self` (the global scope when `null`). Hooks that mods have put on the script run too; `CallOriginal` skips them (see [Hooks](hooks.md)).

By name, for anything else:

```csharp
Game.CallScript("scr_atr_incr", player.Instance, "SP", 1);
```

## Built-in functions

GameMaker's built-ins (`instance_number`, `draw_sprite_ext`, `sprite_get_name`...) are called by name:

```csharp
int enemies = Game.CallBuiltin("instance_number", GmValue.From(GameObjectId.o_enemy));
string name = Game.CallBuiltin("sprite_get_name", sprite);
Game.CallBuiltin("draw_sprite_ext", sprite, frame, x, y, 1, 1, 0, Draw.White, 1);
```

| | |
|---|---|
| `Game.CallBuiltin(name, args...)` | A built-in, with the global scope as `self`. |
| `Game.CallBuiltinAs(name, self, other, args...)` | A built-in run as an instance (for those that act on `self`, such as `event_user`). |
| `Game.CallBuiltinUnrestricted(name, self, other, args...)` | Any built-in, including those reaching outside the game. Trusted mods only. |

Built-ins that reach outside the game - files, the network, other programs - aren't available to mods and throw `UnauthorizedAccessException`. Use [`context.Files`](../core/mod-context.md#files) for files. A mod marked `"trusted": true` in its `mod.json`, and allowed by the player, can use `CallBuiltinUnrestricted`.

`CallBuiltin` is for GameMaker's built-in functions only. A name that isn't one (a script's, say) throws a `GameCallException` ("no built-in function named ..."): call scripts with `Game.CallScript`.

The common built-ins are typed in `Gm`: `Gm.InstanceExists`, `Gm.InstanceNumber`, `Gm.Create<T>`, `Gm.AssetGetIndex`, `Gm.ObjectGetName`, `Gm.AudioPlaySound(Sound...)`, `Gm.CurrentTime`, `Gm.Room`, `Gm.ShowDebugMessage`.

## Global variables

```csharp
string resolution = Game.Global["resolution"];
Game.Global["my_mod_flag"] = true;
```

Prefix globals of your own with your mod's id, so they don't clash with the game's or other mods'. Undo them in your mod's `Unload` if they change what the game does.

## The game's random numbers

`Gm.Irandom(max)`, `Gm.IrandomRange(min, max)` and `Gm.Random(max)` draw on the game's own generator, which it seeds for its world (levels, chests, loot). For a mod's own chances use C#'s `Random.Shared`, which leaves the game's rolls alone.

To make the game's own random calls repeatable - the same dungeon, the same loot - run them seeded:

```csharp
Game.WithSeed(12345, () =>
{
    // irandom, random, choose... draw the same numbers here every time, in every game
});
int roll = Game.WithSeed(12345, () => Gm.Irandom(100));
```

Afterwards the generator carries on unseeded, without repeating numbers.

## Is now a good time?

| | |
|---|---|
| `Game.Running` | The game has started running frames. Calls before this throw. |
| `Gm.InMainMenu`, `Gm.InGame` | On the main menu; a game being played. |
| `Game.IsBusy` | A room change, fade, dialogue or cutscene is under way: wait before moving the player, changing rooms, saving or loading. |
| `Game.IsCutscene` | A cutscene is playing. |

```csharp
if (Keyboard.Pressed(Keyboard.F1) && Gm.InGame && !Game.IsBusy)
    Rooms.Change(Rooms.Current);
```

## Logging

`context.Log(text)` writes a line to the loader's log (`<Stoneshard>\dotnet\bridge.log`), tagged with your mod's name. `Game.Log` writes untagged.
