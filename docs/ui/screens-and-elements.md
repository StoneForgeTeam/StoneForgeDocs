# Screens and elements

A mod's UI is built from elements - panels, labels, buttons, sliders, your own - placed on **screens**. The loader updates, draws and routes the mouse to them every frame they're shown, in the game's look.

## Screens

| `context.UI` | Shown |
|---|---|
| `MainMenu` | On the main menu. |
| `InGame` | While a game is played. |
| `Always` | Everywhere: the main menu, the game, its loading and menus. |
| `Hud` | While a game is played, with the game's HUD: see [Layers](#layers). |
| `When(() => condition, layer)` | While your condition says so (asked each frame), on a layer (default `UILayer.Gui`). |

```csharp
var panel = context.UI.MainMenu.Add(new ExamplePanel());
var notes = context.UI.InGame.Add(new NotesPanel());
context.UI.MainMenu.Hidden += () => panel.Visible = false;
```

A screen out of its context isn't drawn, updated or clicked, and as it leaves nothing stays held: the mouse lets go, an open dropdown closes, a text box lets go of the keyboard. Its elements keep their own `Visible` for when it's back. A screen has `IsActive`, `Shown` and `Hidden` events, and `MouseOverUI`.

While the mouse is over mod UI, the game doesn't get the click (a click on a panel doesn't walk or attack), and while a text box has the keyboard, the game's hotkeys stay quiet.

## Layers

Mod UI is drawn on one of two layers:

| `UILayer` | Drawn | Use it for |
|---|---|---|
| `Gui` (default) | Over everything: the world, the game's HUD and its windows. | Panels and windows of your own. |
| `Hud` | With the game's HUD: over the world, **under** its windows (inventory, map, dialogue, the Esc menu) and its bottom panel; hidden when its HUD is (UI turned off, a cutscene). | What belongs with the HUD: frames, markers, bars. |

```csharp
var bar = context.UI.Hud.Add(new UIProgressBar(8, 40, 0, max: 100));
var screen = context.UI.When(() => Gm.InGame && Player.InCombat, UILayer.Hud);
context.DrawHud += () => Draw.Text(8, 60, "With the HUD", Draw.White);
```

A HUD element only has the mouse where none of the game's UI drawn over it is under the mouse: a click on a game window over it is the window's. `context.DrawHud` draws on the HUD layer as `context.DrawGui` draws over everything. Mod windows (`UIWindow`) still open over everything.

## Elements

```csharp
public class ExamplePanel : UIPanel
{
    private readonly UILabel _clicks;
    private int _count;

    public ExamplePanel() : base(6, 0, 200, 120, UIAnchor.Left)
    {
        Add(new UILabel("Example", 10, 10));
        _clicks = Add(new UILabel("", 10, 30, Draw.Muted));
        var button = Add(new UIButton("Click me", 10, 0, 85) { Anchor = UIAnchor.BottomLeft, Y = 10 });
        button.Clicked += _ => _count++;
        Add(new UIButton("Close", 10, 0, 85, onClick: () => Visible = false) { Anchor = UIAnchor.BottomRight, Y = 10 });
    }

    protected override void OnUpdate(double deltaTime) => _clicks.Text = $"Clicks: {_count}";
}
```

Every element (`UIElement`) has:

| | |
|---|---|
| `X`, `Y`, `Anchor` | Where it is: an offset from its anchor point in its parent (`UIAnchor.TopLeft`, `Top`, `TopRight`, `Left`, `Center`, `Right`, `BottomLeft`, `Bottom`, `BottomRight`). |
| `Width`, `Height` | Its size, in the UI's units (the game's UI scale: see [Drawing](drawing-and-input.md)). |
| `Visible`, `Enabled`, `HitTest` | Hidden (with its children); drawn but not clicked; see-through to the mouse. |
| `Tooltip` | Shown in the game's hover frame when the mouse rests on it. |
| `Add(child)`, `Remove`, `Clear`, `Children`, `Parent` | Its children, drawn over it and placed in it. `Add` returns the child. |
| `Clicked`, `IsHovered`, `IsPressed` | The mouse. |
| `ClipChildren` | Cut its children to its area (for scrolling). |
| `ScreenX`, `ScreenY`, `Contains`, `IsShown` | Where it is on screen; whether it's shown. |

## Built-in elements

| Element | |
|---|---|
| `UIPanel(x, y, w, h, anchor)` | The game's menu background with a border; `Framed` for the hover-window frame. |
| `UIGroup` | A plain container that draws nothing. |
| `UILabel(text, x, y, colour)` | Text as the game draws it; `Wrap` wraps it at its `Width`, `Align` aligns it. |
| `UIImage(sprite, x, y, scale)` | A sprite, such as one from `context.LoadSprite`. |
| `UIButton(text, x, y, w, h, onClick)` | The game's button (100x26 is its own size). |
| `UICheckbox(text, x, y, checked)` | The game's checkbox; `Changed` gives the new state. |
| `UIHeader(text)` | A section header, as the Settings pages have. |

## Controls

```csharp
var health = Add(new UISlider(70, 31, value: 0.75, width: 120) { Tooltip = "Drag it, click the bar or use the wheel." });
var bar = Add(new UIProgressBar(12, 74, health.Value, style: UIBarStyle.Health, width: 196));
health.Changed += value => bar.Value = value;

var difficulty = Add(new UIDropdown(new[] { "Easy", "Normal", "Hard" }, 70, 102, 140, selected: 1));
difficulty.Changed += index => Say($"Difficulty: {difficulty.Selected}");

var name = Add(new UITextBox(70, 124, 140, placeholder: "Type a name...") { MaxLength = 24 });
name.Submitted += text => Say($"Hello, {text}!");

var list = Add(new UIScrollList(12, 148, 196, 104));
for (int row = 1; row <= 20; row++)
    list.Add(new UIButton($"Row {row}", 0, 0, height: 14));
```

| Control | |
|---|---|
| `UISlider` | The game's volume slider: `Min`, `Max`, `Step`, `Value`, `Format`, `Changed`. |
| `UIProgressBar` | The game's health (`UIBarStyle.Health`) or energy (`Energy`) bar: `Value`, `Max`, `Text`, `Smooth`. |
| `UIDropdown` | The Settings menu's combobox: `Options`, `SelectedIndex`, `Selected`, `MaxVisibleRows`, `Changed`. Its list draws over everything. |
| `UITextBox` | The game's text input: `Text`, `Placeholder`, `MaxLength`, `TextChanged`, `Submitted`, `Focus()`, `Blur()`. |
| `UIScrollList` | Rows scrolled one at a time, with the game's scrollbar. |
| `UIScrollArea` | A smoothly scrolled column, as the Settings page: `AddHeader`, `AddText`, `AddImage`, `AddCheckbox`, `ScrollTo`. |
| `UIButtonRow` | A row of buttons, spread or packed, or at set `Positions`. |
| `UITabStrip` | A row or column of tabs (see [Windows](windows.md)). |

## Your own elements

Inherit `UIElement` (or any element) and override what you need:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using StoneForge;

public class FpsGraph : UIElement
{
    private readonly Queue<double> _frames = new();

    protected override void OnUpdate(double deltaTime)
    {
        _frames.Enqueue(deltaTime);
        while (_frames.Count > 100)
            _frames.Dequeue();
    }

    protected override void OnDraw(double x, double y)
    {
        Draw.Rectangle(x, y, x + Width - 1, y + Height - 1, Draw.Rgb(18, 16, 26));
        double average = _frames.Count / Math.Max(_frames.Sum(), 0.001);
        Draw.Text(x + 4, y + 3, $"{average:0} fps", IsHovered ? Draw.White : Draw.Muted);
    }
}
```

| Override | |
|---|---|
| `OnUpdate(deltaTime)` | Every frame, before drawing. |
| `OnDraw(x, y)` | Draw it, its top-left corner at `(x, y)` on screen; its children are drawn after. |
| `OnDrawAfter(x, y)` | Draw over its children. |
| `OnClick`, `OnPress`, `OnMouseEnter`, `OnMouseLeave` | The mouse. |
| `OnWheel(delta)` | The wheel over it; return `true` if used, or it goes to the parent. |
| `ClipArea` | Where its children are cut when `ClipChildren` is set. |
