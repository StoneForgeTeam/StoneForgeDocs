# Windows

A `UIWindow` is a window as the game's own: a frame, its title and close button, in the middle of the screen over it dimmed. While it's open nothing under it takes the mouse or the game's hotkeys, and Escape closes it.

## A settings-style window

`UISettingsWindow` is laid out as the game's Settings menu: tabs down its left, a scrolling page on its right and buttons along its bottom.

```csharp
public class ExampleWindow : UISettingsWindow
{
    private readonly ModContext _context;

    public ExampleWindow(ModContext context) : base("Example Mod") => _context = context;

    protected override void OnOpen()
    {
        SetTabs("About", "Options");
        AddButton("Say hello").Clicked += _ => _context.Log("Hello!");
        AddCloseButton();
        Tabs.Tabs[0].Open();
    }

    protected override void OnTabOpened(UITab tab)
    {
        Page.Clear();
        Page.AddHeader(tab.Text);
        if (tab.Index == 0)
            Page.AddText("Drawn by StoneForge in the game's look.");
        else
            Page.AddCheckbox("Sparks", true).Changed += on => _context.Log($"Sparks: {on}");
    }
}
```

Put it on a screen and open it, from a main menu button for instance:

```csharp
var window = context.UI.MainMenu.Add(new ExampleWindow(context));
MainMenu.AddButton(context, "Example Mod", window.Open);
```

Each `Open` builds it anew: `OnOpen` runs every time.

| `UISettingsWindow` | |
|---|---|
| `SetTabs(names...)` | The tabs down its left; more than fit scroll. |
| `Tabs` | The `UITabStrip`: `Tabs.Tabs[0].Open()` opens one. |
| `OnTabOpened(tab)`, `TabOpened`, `SelectedTab` | A tab was opened: fill the page for it. |
| `Page` | The scrolling page (`UIScrollArea`): `AddHeader`, `AddText`, `AddImage`, `AddCheckbox`, or any element. |
| `AddButton(text)`, `AddCloseButton(text)`, `Buttons` | Buttons along the bottom, in the places the frame has for them. |

## Any frame

A plain `UIWindow` takes any sprite as its frame - the game's or your own - or none (a plain panel). What goes in it is added to `Content`: the frame's inside, less its borders.

```csharp
public class JournalWindow : UIWindow
{
    public JournalWindow() : base("Journal")
    {
        FrameSprite = (int)Sprite.s_journal_window;
        ContentInsets = new UIInsets(20, 30, 20, 20);
    }

    protected override void OnOpen()
    {
        var page = Content.Add(new UIScrollArea(0, 0, Content.Width, Content.Height - 34));
        page.AddText("Hello");
        var buttons = Content.Add(new UIButtonRow(0, Content.Height - 26, Content.Width));
        buttons.Add("Close", Close);
    }
}
```

| `UIWindow` | |
|---|---|
| `Title`, `TitleX`, `TitleY` | Its title, drawn from the middle of the frame's top. |
| `FrameSprite` | The frame's sprite (`-1`: none, a plain panel). |
| `AdaptiveSprite` | Draw the game's version of the sprite for the resolution (`<name>_<view height>`), as the game's windows do (default: yes). |
| `Slice`, `FrameWidth`, `FrameHeight` | 9-slice the sprite to any size: its corners stay as drawn, its edges stretch along, its middle both ways. |
| `ContentInsets` | The frame's borders: `Content` is the frame less these. |
| `Content` | What's in the window: sized and emptied each time it opens, before `OnOpen`. |
| `CloseButton` | The game's close button at the frame's top right: hide it or move it as the frame needs. |
| `DimBackground` | Dim the screen behind it (default: yes). |
| `Open()`, `Close()`, `IsOpen`, `Opened`, `Closed` | |
| `OnFit()`, `OnOpen()`, `OnClosed()` | Opening (sized for the resolution: change insets and the close button here), opened, closed. |

### A dialog in the game's confirm panel

```csharp
public class ConfirmWindow : UIWindow
{
    public ConfirmWindow()
    {
        FrameSprite = (int)Sprite.s_skill_confirm_panel;
        ContentInsets = new UIInsets(26, 26, 26, 7);
        CloseButton.Visible = false;
    }

    protected override void OnOpen()
    {
        Content.Add(new UILabel("Are you sure?", 0, 20) { Width = Content.Width, Align = Draw.AlignCenter });
        // The two button places drawn in the panel's picture.
        var buttons = Content.Add(new UIButtonRow(0, 64, Content.Width) { Positions = new double[] { 27, 129 } });
        buttons.Add("Yes", Close);
        buttons.Add("No", Close);
    }
}
```

### A frame 9-sliced bigger

```csharp
FrameSprite = (int)Sprite.s_skill_confirm_panel;
Slice = new UIInsets(24, 26, 24, 40);   // left, top, right, bottom borders
FrameWidth = 360;
FrameHeight = 220;
```

## Layout helpers

| | |
|---|---|
| `UIInsets(left, top, right, bottom)` | Space in from each edge; `UIInsets(all)` and `UIInsets(horizontal, vertical)` too. |
| `UIButtonRow` | Buttons across a width: spread evenly (`Align`), packed to a side, or at set `Positions` (a frame's button places); `Pin` keeps one in its place; `ButtonWidth`, `Spacing`. |
| `UITabStrip(x, y, w, h, vertical)` | Tabs in a column (scrolling when more than fit) or a row: `SetTabs`, `TabOpened`, `Selected`, `TabHeight`, `TabSprite`. |
| `UIScrollArea` | A scrolling column: `AddHeader`, `AddText`, `AddImage`, `AddCheckbox`, `ScrollTo`, `ScrollToShow`. |

```csharp
var tabs = Content.Add(new UITabStrip(0, 0, 100, Content.Height));
tabs.TabOpened += tab => ShowPage(tab.Index);
tabs.SetTabs("General", "Advanced");
tabs.Tabs[0].Open();
```
