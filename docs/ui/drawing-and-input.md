# Drawing and input

## Drawing

`Draw` draws on the screen in GUI coordinates: `(0, 0)` is the top left, and the screen is `Draw.Width` x `Draw.Height`. Coordinates are in units of the game's UI scale (`Draw.Scale`: its camera scale, 2 in a window around 1280x720), so mod UI is the size of the game's and its pixel art as crisp.

Draw from an element's `OnDraw` (see [Screens and elements](screens-and-elements.md)), from `context.DrawGui`, which runs every frame in the game's Draw GUI pass, over everything, or from `context.DrawHud`, with the game's HUD, under its windows (see [Layers](screens-and-elements.md#layers)):

```csharp
context.DrawGui += () =>
{
    if (!Gm.InGame)
        return;
    Draw.Panel(8, 8, 140, 24);
    Draw.Text(16, 14, $"Turn {Time.Turns}", Draw.White);
};
```

Drawing outside a draw pass does nothing.

| `Draw` | |
|---|---|
| `Panel(x, y, w, h, colour, alpha)` | The game's menu background with its border. |
| `Frame(x, y, w, h, alpha)` | The frame of the game's hover windows. |
| `Text(x, y, text, colour, halign, valign, alpha)` | Text as the game draws it, with a shadow. `TextWidth(text)`. |
| `Text(x, y, text, colour, halign, valign, font, alpha)` | In one of the game's fonts: `GameFont.Default` (names, descriptions, the log) or `GameFont.Digits` (numbers on bars, buttons' text). |
| `PlainText(x, y, text, colour, halign, valign, shadow)` | Text in the font being drawn with, not the GUI's: a name over a unit in the world, say. |
| `TextWrapped(x, y, text, width, colour)` | Wrapped at a width. `TextHeight(text, width)`. |
| `Rectangle(x1, y1, x2, y2, colour, alpha, outline)` | A filled rectangle, or its outline. |
| `Circle(x, y, radius, colour, outline, alpha)` | A circle, filled or its outline. |
| `Triangle(x1, y1, x2, y2, x3, y3, colour, alpha)` | A filled triangle. |
| `Line(x1, y1, x2, y2, colour, width, alpha)` | A line. |
| `Sprite(sprite, x, y, ...)` | A game sprite (`Sprite.s_...`) or one of yours (`int`), scaled. |
| `SpritePart(...)` | Part of a sprite, as the game draws its health bars. |
| `SpriteSliced(sprite, frame, x, y, w, h, cap)` | Stretched but for its ends (a button). |
| `SpriteNineSlice(sprite, frame, x, y, w, h, borders)` | 9-sliced to any size (a window frame). |
| `SpriteExt(sprite, frame, x, y, xscale, yscale, angle, colour, alpha)` | A sprite's frame as GameMaker draws one: scaled, turned, tinted. |
| `SpriteWidth`, `SpriteHeight`, `SpriteOrigin` | A sprite's size in pixels; the point of it drawn at `(x, y)`. |
| `SpriteExists`, `SpriteName` | Whether a sprite exists; its name. |

| Colours | |
|---|---|
| `Draw.Rgb(r, g, b)` | A colour (0-255 each), as GameMaker stores them. |
| `Draw.White`, `Draw.Black` | |
| `Draw.Muted` | The game's muted text colour (hover texts, labels). |
| `Draw.PanelColour` | The game's panel colour. |
| `AlignLeft`, `AlignCenter`, `AlignRight`, `AlignTop`, `AlignMiddle`, `AlignBottom` | For `Text`'s alignment. |

To draw in the game *world* rather than over the screen - next to the player, say - draw in an object's Draw event with a hook. See [Hooks](../gml/hooks.md#event-hooks).

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
| `X`, `Y` | Where it is, in GUI coordinates (as `Draw`). |
| `Pressed(button)`, `Released(button)`, `Down(button)` | `Mouse.Left` (default), `Right`, `Middle`. |
| `Over(x, y, w, h)` | Whether it's over a rectangle. |
| `Wheel` | `1` up, `-1` down, `0` none, this frame. |

UI elements handle the mouse for you (`Clicked`, `OnClick`, `OnWheel`...); use `Mouse` for drawing of your own in `DrawGui`.

### The mouse in the world

`Mouse` also knows where it is in the game world, and whether it's over the game's UI or a mod's, so a mod can tell a click meant for the world from one on a window:

```csharp
if (Mouse.ClickedWorld())
{
    var (cellX, cellY) = Mouse.Cell;
    context.Log(Mouse.Unit.IsNone ? $"Clicked empty cell {cellX}, {cellY}" : $"Clicked {ActionsLog.NameOf(Mouse.Unit)}");
}
```

| | |
|---|---|
| `WorldX`, `WorldY` | Where it is in the room's coordinates (its camera taken into account), as units' `x` / `y` are. |
| `Cell` | The 26-pixel grid cell it's over, as units stand on it. |
| `Unit` | The unit standing on that cell: an enemy, an NPC, the player, another mod's unit; none for an empty cell. |
| `OverGameUI`, `OverModUI`, `OverUI` | Whether it's over the game's UI (a window, the bottom panel, a button), a mod's UI, or either. |
| `HasFocus` | Whether the game's window has the focus. |
| `ClickedWorld(button)` | Pressed this frame on the world: in the focused window, not on any UI. A click meant for the world, as the game takes one to move or attack. |
