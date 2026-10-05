# The Esc menu

`EscMenu` changes the in-game Esc menu's buttons as [`MainMenu`](main-menu.md) does the main menu's: add your own, add, move or remove the game's, or build it again from scratch.

```csharp
EscMenu.AddButton(context, "Mod Options", window.Open);            // above the exit
EscMenu.AddAfter(context, EscButton.Resume, "Quick Save", () => SaveData.Save());
```

## The game's buttons

`EscButton` names the game's own: `Resume`, `Settings`, `MessageLog`, `LoadGame`, `Exit`, `SaveAndExit`, `ExitGame` (to the desktop). Their text is the game's, in its language.

The menu starts each time as the game makes it there - Load Game only with saves outside permadeath, Exit in place of Save and Exit where the game can't save - and the mods' changes are applied to that.

A mod that mustn't let the player save, such as a multiplayer client:

```csharp
EscMenu.RemoveButton(context, EscButton.SaveAndExit);
EscMenu.AddButton(context, EscButton.Exit);
```

## Reference

| `EscMenu` | |
|---|---|
| `AddButton(context, text, onClick)` | Your button, above the exit (Save and Exit, or Exit), or last. |
| `AddBefore(context, anchor, text, onClick)`, `AddAfter(...)` | Just above or below a button. |
| `AddButton(context, EscButton)`, `AddBefore(context, anchor, EscButton)`, `AddAfter(...)` | One of the game's buttons, back in, or moved if it's already there. |
| `RemoveButton(context, EscButton)`, `RemoveButton(context, name)` | Takes a button out. A named button that isn't there yet (another mod's, added later) goes when it comes. |
| `ClearButtons(context)` | Empties the menu. |
| `RestoreButtons(context)` | The menu as it was when the game started, with what every mod did while it loaded. |
| `UndoChanges(context)` | Undoes just this mod's changes since it loaded: for a change a mod makes for a while. |

An **anchor** or name is an `EscButton`, its name (`"SaveAndExit"`, `"Save and Exit"`), the text shown on a button, or the text of a button a mod added. Case doesn't matter. Changes show at once, whether the menu is open or not, laid out and centred as the game lays it out. A mod switched off takes what it did with it.
