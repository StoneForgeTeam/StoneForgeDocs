# Dialogs and blackouts

## Confirmation dialogs

`GameDialogs.Confirm` asks a question in the game's own confirmation panel (the one its Exit uses): the question, Yes and No, the screen behind dimmed.

```csharp
GameDialogs.Confirm(context, "Leave the game?",
    onYes: () => Rooms.ToMainMenu(),
    onNo: () => context.Log("Staying"));
```

`onYes` runs when it's answered Yes; `onNo`, if given, when it's closed any other way. It returns `false` if the panel couldn't be shown. For anything more than a yes or no, make a [window](windows.md).

## Blackouts

`Blackout` holds the screen black, as the game's own fades do, with a line of text in the middle if wanted, while something happens behind it: another game's world on its way, a long load.

```csharp
Blackout.Show("Waiting for the host...");
// ... later
Blackout.Text = "Almost there...";
// ... when it's ready
Blackout.Hide();
```

| `Blackout` | |
|---|---|
| `Show(text)` | Fades the screen to black and holds it, with text in the middle. Already up: just the text. |
| `Text` | The text in the middle (`""` for none). |
| `Hide()` | Fades it back out. |
| `IsShown` | Whether it's up (fading in, or held). |

It stays until `Hide()` or the next room change, whose own fade takes it over.
