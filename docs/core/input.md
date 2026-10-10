# Keyboard and mouse

Read the keyboard and the mouse anywhere code runs every frame: a mod's `Tick`, a draw handler, a hook on a Step event. `Pressed` and `Released` are true for one frame only.

## Keyboard

```csharp
if (Keyboard.Pressed(Keyboard.F8))
    _notes.Visible = !_notes.Visible;
if (Keyboard.Down(Keyboard.Shift) && Keyboard.Pressed('S'))
    Save();
```

| `Keyboard` | |
|---|---|
| `Pressed(key)`, `Released(key)` | This frame. |
| `Down(key)` | Held. |
| `Typed` | What's been typed (GameMaker's `keyboard_string`). |

Keys are GameMaker's codes: letters and digits are their capital character (`'A'`, `'1'`); the rest are constants: `Keyboard.Enter`, `Escape`, `Space`, `Shift`, `Control`, `Alt`, `Tab`, `Backspace`, `Delete`, `ArrowLeft`, `ArrowUp`, `ArrowRight`, `ArrowDown`, and `F1` to `F12`.

## Mouse

```csharp
if (Mouse.Pressed() && Mouse.Over(x, y, 100, 26))
    Clicked();
```

| `Mouse` | |
|---|---|
| `X`, `Y`, `Position` | Where it is, in GUI coordinates (as [`Draw`](../ui/drawing.md)); `Position` both as a `Point`. |
| `Pressed(button)`, `Released(button)`, `Down(button)` | `Mouse.Left` (default), `Right`, `Middle`. |
| `Over(x, y, w, h)` | Whether it's over a rectangle. |
| `Wheel` | `1` up, `-1` down, `0` none, this frame. |

[UI elements](../ui/screens-and-elements.md) handle the mouse for you (`Clicked`, `OnClick`, `OnWheel`...); use `Mouse` for drawing of your own in `DrawGui`.

### The mouse in the world

`Mouse` also knows where it is in the game world, and whether it's over the game's UI or a mod's, so a mod can tell a click meant for the world from one on a window:

```csharp
if (Mouse.ClickedWorld())
{
    Cell cell = Mouse.Cell;
    context.Log(Mouse.Unit.IsNone ? $"Clicked empty cell {cell}" : $"Clicked {ActionsLog.NameOf(Mouse.Unit)}");
}
```

| | |
|---|---|
| `WorldX`, `WorldY`, `World` | Where it is in the room's coordinates (its camera taken into account), as units' `x` / `y` are; `World` both as a `Point`. |
| `Cell` | The 26-pixel grid [`Cell`](../world/units.md#cells) it's over, as units stand on it. |
| `Unit` | The unit standing on that cell: an enemy, an NPC, the player, another mod's unit; none for an empty cell. |
| `OverGameUI`, `OverModUI`, `OverUI` | Whether it's over the game's UI (a window, the bottom panel, a button), a mod's UI, or either. |
| `HasFocus` | Whether the game's window has the focus. Mod UI stays visible without it, as the game's does; a click held or text being typed is let go when it's lost. |
| `ClickedWorld(button)` | Pressed this frame on the world: in the focused window, not on any UI. A click meant for the world, as the game takes one to move or attack. |
