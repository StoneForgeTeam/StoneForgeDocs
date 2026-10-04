# Right-click menus

`ContextMenus` changes the game's right-click menus: what a click on a unit, an object or an item offers (Talk, Attack, Explore...). A mod can add an option of its own to the menus of the instances it picks, or change any menu as it opens.

## An option of your own

```csharp
ContextMenus.Add(context, "Inspect",
    appliesTo: target => target.As<GameInstance>().IsA((int)GameObjectId.o_enemy),
    onClick: target => context.Log($"Inspecting {ActionsLog.NameOf(target)}"),
    hover: "Look this one over.");
```

`appliesTo` is asked as each menu opens, with what it's for; `onClick` runs on that instance when the option is clicked. Then the menu closes, as for the game's own options.

## Changing a menu as it opens

```csharp
ContextMenus.OnOpen(context, menu =>
{
    if (menu.Has("Attack") && Units.IsPlayer(menu.Target))
        menu.Remove("Attack");
    if (menu.Has("Talk"))
        menu.SetText("Talk", "Chat");
    menu.Add("Wave", target => context.Log("You wave."), index: 0, enabled: !Player.InCombat);
});
```

The handler gets the menu with its options as the game made them. Change it there: the game builds the menu's buttons from it afterwards.

| `ContextMenu` | |
|---|---|
| `Target` | What the menu's for: the instance right-clicked. |
| `Items` | Its options, top to bottom (`ContextMenuItem`: `Key`, `Text`, `Enabled`, `Hover`). |
| `Has(key)` | Whether it has an option. The game's keys are `"Attack"`, `"Talk"`, `"Explore"`... |
| `Add(text, onClick, index, enabled, hover)` | Adds an option, at the bottom or at `index`, greyed out unless `enabled`, with the game's hint on hover. Returns its key. |
| `Remove(key)`, `SetText(key, text)`, `SetEnabled(key, enabled)` | Removes, renames or greys out an option. |

A menu left with no options isn't shown, and one that grows is sized again as the game sizes it. A greyed-out option of yours doesn't run when clicked.

StoneForge makes the game's menu script hookable itself: no `[assembly: HookScript]` is needed.
