# Localization

StoneForge's own interface (the Mods window, settings, warnings, loading status) follows the language selected in Stoneshard. Only US English (`en-US`) ships so far; anything without a translation stays in English. Logs and compiler messages are always in English.

A C# mod can translate its own text the same way.

## Translation files

Put them in the mod's `Localization` folder, one file for each language, named by culture:

```text
mods/MyMod/Localization/en-US.json
mods/MyMod/Localization/fr.json
mods/MyMod/Localization/fr-CA.json
```

Each is a UTF-8 JSON object of keys and text:

```json
{
  "challenge.reward": "Reward: {0:N0} crowns",
  "settings.title": "Challenge settings"
}
```

## Reading text

```csharp
string reward = context.Localization.Get("challenge.reward", 100);
string language = context.Localization.Language;   // e.g. "en-US"
```

| `context.Localization` | |
|---|---|
| `Get(key, arguments...)` | The text for the game's language, formatted with the arguments. |
| `GetTemplate(key)` | The text unformatted, placeholders and all. |
| `Language` | The game's language, as a culture name. |
| `TranslationsChanged` | The language or a translation file changed. |
| `LanguageChanged` | The game's language changed (only that). |
| `Bind(target, refresh)` | Runs `refresh` on `target` now and whenever translations change. |

A lookup tries the game's culture, then its parent (`fr-CA`, then `fr`), then `en-US` and `en`. A key that's missing everywhere comes back as the key itself. Each mod has its own catalog, so two mods can use the same keys.

- **Placeholders** are numbered (`{0}`, `{1}`) and can be reordered in a translation, but each translation must use the same numbers as the English entry. `{{` and `}}` are literal braces.
- **Numbers** are formatted for the game's culture.
- Write **whole sentences**, not fragments to join.
- **Errors** fall back to English, and are logged: malformed JSON, duplicate keys, bad format strings, or mismatched placeholders. A catalog is limited to 1 MB.

## Live editing

StoneForge watches the `Localization` folder. A saved file shows in the game within moments, with no reload of the mod. While a file is malformed, the last good version stays in use.

## Keeping UI up to date

Text already given to a UI element doesn't change by itself. Refresh it when translations change:

```csharp
context.Localization.TranslationsChanged += () =>
    rewardLabel.Text = context.Localization.Get("challenge.reward", reward);
```

Or bind it, which also sets it now:

```csharp
context.Localization.Bind(rewardLabel,
    label => label.Text = context.Localization.Get("challenge.reward", reward));

MainMenu.AddButton(context, () => context.Localization.Get("settings.title"), OpenSettings);
```

A binding holds its target weakly: don't capture the target in the callback (use the parameter). Callbacks run on the game thread and go with the mod.

`MainMenu.AddButton`, `AddBefore`, `AddAfter` and `EscMenu.AddButton` take their text as a function, too, so it follows the language.

Settings labels, item names and skill descriptions aren't translated for you: pass localized text when you define them. Dialogues, quests and contracts take text keys (`TextKey`, `TitleKey`...) from the mod's catalog.

MSL mods keep their own localization: StoneForge doesn't change their text.

## Languages

Stoneshard's languages: Russian, English, Chinese, German, Spanish (Latin America), French, Italian, Portuguese, Polish, Turkish, Japanese and Korean. Check other scripts' characters and longer text in the game before shipping a translation.

StoneForge's own catalog is `StoneForge.API/Localization/en-US.json` in its repository. More languages go beside it, named by culture; they're built into the API.
