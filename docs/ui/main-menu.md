# The main menu

`MainMenu` changes the main menu's list of buttons: add your own anywhere in it, move, remove or re-add the game's own, or clear it and build a menu of your own. The in-game [Esc menu](esc-menu.md) works the same way.

```csharp
MainMenu.AddButton(context, "My Mod", window.Open);                   // above Exit
MainMenu.AddAfter(context, VanillaButton.Play, "Multiplayer", lobby.Open);
MainMenu.AddBefore(context, "Credits", "Patch Notes", notes.Open);   // by name or text
```

## The game's buttons

`VanillaButton` names the game's own buttons, from the main list and its play screens:

`Play`, `Settings`, `Credits`, `Exit`, `Continue`, `NewGame`, `LoadGame`, `Prologue`, `Adventure`, `Back`.

Each does in your menu what it does in the game's - greyed out as the game's is (and `Continue`, with no last save, left out). Their text is the game's, in its language.

## Removing the game's buttons

```csharp
MainMenu.RemoveButton(context, VanillaButton.Credits);
MainMenu.RemoveButton(context, "Other Mod's Button");   // by its text
```

## Building a menu of your own

```csharp
MainMenu.ClearButtons(context);
MainMenu.AddButton(context, VanillaButton.Play);
MainMenu.AddButton(context, "Multiplayer", lobby.Open);
MainMenu.AddButton(context, VanillaButton.Settings);
MainMenu.AddButton(context, VanillaButton.Exit);
```

Menus can lead to menus. A button can clear the list and add others, with the game's `Back` to return:

```csharp
MainMenu.AddAfter(context, VanillaButton.Credits, "More", () =>
{
    MainMenu.ClearButtons(context);
    MainMenu.AddButton(context, VanillaButton.Continue);
    MainMenu.AddButton(context, VanillaButton.NewGame);
    MainMenu.AddButton(context, "Load Newest Save", LoadNewest);
    MainMenu.AddButton(context, VanillaButton.Back);   // the main menu as it started
});
```

## Reference

| `MainMenu` | |
|---|---|
| `AddButton(context, text, onClick)` | Your button, above Exit (or last). |
| `AddBefore(context, anchor, text, onClick)` | Just above a button. |
| `AddAfter(context, anchor, text, onClick)` | Just below a button. |
| `AddButton(context, VanillaButton)`, `AddBefore(context, anchor, VanillaButton)`, `AddAfter(...)` | One of the game's buttons, back in, or moved if it's already there. |
| `RemoveButton(context, VanillaButton)`, `RemoveButton(context, name)` | Take a button out. A named button that isn't there yet (another mod's, added later) goes when it comes. |
| `ClearButtons(context)` | Empty the menu: the game's buttons and every mod's added so far. |
| `RestoreButtons(context)` | The menu as it was when the game started, with what every mod did while it loaded. |
| `UndoChanges(context)` | Undo just this mod's changes since it loaded (other mods' stay): for a change a mod makes for a while. |

An **anchor** is a `VanillaButton`, or a button's name: the game button's name (`"Play"` or `"Start"`, `"Settings"`, `"Credits"`, `"Exit"`), the text shown on any button (in the game's language), or the text of a button a mod added. Case doesn't matter. If the anchor isn't in the menu, the new button goes above Exit (or last).

The menu is laid out from every loaded mod's calls in the order they were made (mods load in folder order), and shows a change at once. A mod switched off takes what it did with it: its buttons go, and what it cleared comes back.
