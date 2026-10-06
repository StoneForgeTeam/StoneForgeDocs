# Hooks: scripts and events

Hooks run your C# around the game's own GML: before it (and optionally instead of it) or after it. There are two kinds:

- **Script hooks**: a GML script or function, whenever anything calls it.
- **Event hooks**: an object's event (Create, Step, Draw, an alarm, a user event...), whenever it runs for any instance of that object.

Both are taken back automatically when your mod is switched off.

## Script hooks

```csharp
// Declare every script your mod hooks, once, anywhere in the mod:
[assembly: HookScript(nameof(Scripts.scr_player_move))]
[assembly: HookScript(nameof(Scripts.scr_atr))]
```

On the VM modbranch, StoneForge's patcher reads these declarations before the game starts and makes those scripts hookable; a new declaration takes effect the next time the game starts, and hooking a script that isn't declared throws. On the native branch any script can be hooked, with nothing declared and no restart. Declare them anyway, so the mod works on both (see [Native and VM branches](../getting-started/game-branches.md)).

### Before

```csharp
Scripts.scr_player_move.Before(context, call =>
{
    context.Log($"{call.Name}({string.Join(", ", call.Args)}) by {call.Self}");
    return false;   // let the game's code run
});
```

Return `true` to skip the game's code. Set `call.Result` first: that's what the caller gets.

```csharp
Scripts.scr_atr.Before(context, call =>
{
    if (call.Args.Length > 0 && call.Args[0].AsString == "LVL")
    {
        call.Result = 99;   // the character's level, as far as the game knows
        return true;
    }
    return false;
});
```

### After

```csharp
Scripts.scr_atr.After(context, call =>
{
    if (call.Args[0].AsString == "STR")
        call.Result = call.Result.AsReal + 2;   // change what the caller gets
});
```

### Replace

`Replace` swaps the whole call for yours. `CallOriginal` inside it runs the game's own version, without any mod's hooks:

```csharp
Scripts.scr_atr.Replace(context, call =>
{
    GmValue value = Scripts.scr_atr.CallOriginal(call);
    return call.Args[0].AsString == "LVL" ? (GmValue)(value.AsReal * 2) : value;
});
```

### ScriptCall

| | |
|---|---|
| `Name` | The script's name. |
| `Self`, `Other` | The instances it runs as. |
| `Args` | Its arguments. |
| `Result` | What it returns: set in a before handler that replaces the call; in an after handler, what it returned (change it to change what the caller gets). |

By name, without the generated API: `context.OnScript("scr_atr", before: call => ..., after: call => ...)`.

## Event hooks

Every object event is generated in `Events`, named as GameMaker names its code: `Events.<object>.<event>`. Your handler gets the instance as its generated class:

```csharp
Events.o_player.Step_0.After(context, player =>
{
    if (++_steps % 600 == 0)
        context.Log($"HP {(double)player.HP:0.#}/{(double)player.max_hp:0.#}");
});

// Before the game's code: return true to skip it.
Events.o_mainMenuButton.Other_25.Before(context, button => false);

// With the event's "other" instance.
Events.o_inv_slot.Other_10.After(context, (slot, other) => { });
```

Event names follow GameMaker's: `Create_0`, `Step_0` (Begin Step is `Step_1`, End Step `Step_2`), `Draw_0`, `Draw_64` (Draw GUI), `Alarm_0`..., `Other_10` to `Other_25` (user events 0 to 15), `CleanUp_0`, `Destroy_0`. Event hooks need no declaration.

By name: `context.OnCode("gml_Object_o_player_Draw_0", before: (self, other) => false, after: (self, other) => { })`. This is handy for drawing in the game world, which only works in a Draw event:

```csharp
context.OnCode("gml_Object_o_player_Draw_0", after: (player, _) =>
    Game.CallBuiltin("draw_sprite_ext", sprite, player["image_index"], player["x"].AsReal + 26, player["y"],
        player["image_xscale"], player["image_yscale"], 0, Draw.White, 1));
```

## Order and conflicts

Several mods can hook the same script or event. Each hook has an **order**: lower runs first, then load order for the same number. It's an optional last parameter on `Before`, `After` and `Replace`, and on `context.OnScript` / `OnCode`:

```csharp
// Watch every call, before anyone changes it.
Scripts.scr_atr.After(context, call => context.Log($"{call.Args[0]} = {call.Result}"), HookOrder.First);

// Have the last word on what the script returns.
Scripts.scr_atr.Replace(context, call => Scripts.scr_atr.CallOriginal(call), HookOrder.Last);

// Just after the Late ones.
Events.o_player.Step_0.After(context, player => { }, HookOrder.Late + 10);
```

| `HookOrder` | |
|---|---|
| `First` | -200: for hooks that only watch. |
| `Early` | -100 |
| `Normal` | 0, the default. |
| `Late` | 100 |
| `Last` | 200: for a mod that must have the last word on a script. |

Any number between works too.

If a before handler skips the game's code, later before handlers still run. When two mods' before hooks both **replace** the same call, the later one's `Result` is used (for a code entry, the game's code is skipped for both). That's a **conflict**: StoneForge logs it once, naming both mods and the script or code entry, and shows it on both mods' pages in the Mods window. It's found as it happens, so a hook that only sometimes replaces isn't a conflict until it does. A mod's own hooks never conflict with each other.

Before they conflict, mods with before hooks on the same script or code entry at the **same order** (so which runs first is only load order) are listed once the mods have loaded: a line in the log for each pair ("Possible hook conflicts"), and a Possible Conflicts section on each mod's page in the Mods window. Yellow lines are calls both mods replaced; grey lines are calls both hook at the same order. Moving a hook to another order ends it.

## Errors

- A handler that throws is logged and skipped. If the same handler throws three times in a row, the mod is paused: its handlers stop, its windows close, and the Mods window shows "Paused:" with the error. Reload it from the Mods window to try again.
- Keep handlers quick: Step and Draw events run every frame for every instance of the object.
