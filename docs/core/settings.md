# Settings

A mod's settings are declared once, in `Load`. Each is saved for the mod and shown on its page in the Mods window, where the player can change it.

```csharp
public void Load(ModContext context)
{
    var sparks = context.Settings.Toggle("sparks", "Sparks on crits", true, "Whether the blade's crits spark.");
    var chance = context.Settings.Slider("shockChance", "Shock chance", 33, min: 0, max: 100, step: 1);
    chance.Format = value => $"{value:0}%";
    var side = context.Settings.Choice("notesSide", "Notepad side", new[] { "Left", "Right" });
    var greeting = context.Settings.Text("greeting", "Greeting", "Hello from C#!", maxLength: 40);

    if (sparks.Value) { }                        // read it whenever it's needed
    chance.Changed += value => context.Log($"Now {value}%");   // or follow its changes
    context.Log(greeting);                       // a setting converts to its value
}
```

| Setting | Shown as | Value |
|---|---|---|
| `Toggle(key, label, default, tooltip)` | A checkbox | `bool` |
| `Slider(key, label, default, min, max, step, tooltip)` | A slider (`step` 0: any value); `Format` sets how the value is shown | `double` |
| `Choice(key, label, options, defaultIndex, tooltip)` | A dropdown; `Selected` is the chosen text | `int`, the option's index |
| `Text(key, label, default, maxLength, tooltip)` | A text box | `string` |

Every setting has `Value` (setting it saves it and raises `Changed`), `Default`, `Reset()`, `Label`, `Tooltip` and `Visible` (a hidden setting is saved but not shown). `context.Settings.All` lists them, and `ResetAll()` resets them all.

## Keys

Settings are saved by `key`, in Stoneshard's data folder (`StoneForge\Settings\<mod>.json`), so they survive the mod being updated. Don't change a key once players have the mod. A choice is saved by its option's *text*, so reordering options keeps the player's choice.

A saved value that no longer fits - a different type, out of range, an option that's gone - gives way to the default.

## A settings class

Grouping settings in a class keeps them typed and in one place, as ExampleMod does:

```csharp
public sealed class MySettings
{
    public ToggleSetting Sparks { get; }
    public SliderSetting ShockChance { get; }

    public MySettings(ModSettings settings)
    {
        Sparks = settings.Toggle("sparks", "Sparks on crits", true);
        ShockChance = settings.Slider("shockChance", "Shock chance", 33, min: 0, max: 100, step: 1);
    }
}

// In Load:
var settings = new MySettings(context.Settings);
_blade = new MyBlade(settings);
```
