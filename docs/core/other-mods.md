# Using other mods

A mod can need another mod, load after one, and use what it offers.

## requires and after

In `mod.json`:

```json
{
  "id": "mymod",
  "name": "My Mod",
  "version": "1.0.0",
  "requires": ["othermod"],
  "after": ["thirdmod"]
}
```

| | |
|---|---|
| `requires` | Mods that must be there. The mod loads after them, and is **compiled against them**, so it can use their public types as its own. It's loaded with the copy of each that is running. |
| `after` | Mods to load after if they're there. Each is optional, and their types can't be used. |

Mods still load in folder order, except that each one waits for the mods it names.

### When a required mod isn't running

A mod whose required mod isn't running is switched off, and that's saved for the next start. The log and its page in the Mods window say which mod it needs and why it isn't running: not installed, didn't load, switched off, or not allowed yet. It comes back on when that mod is switched on.

- Switching a mod on switches on what it requires (or, if that can't be done, it goes back off and says why).
- Switching off a required mod switches off the mods that require it too. They come back when it's switched on again. The Mods window warns about this on the required mod's page.
- Both are saved for the next start.
- Requires that form a loop are refused. An `after` that forms a loop is ignored, with a warning.

The Mods window shows what each mod requires.

## context.Mods

`context.Mods` finds another running mod:

```csharp
// mod.json: "requires": ["othermod"]
var other = context.Mods.Get<OtherMod.OtherMod>("othermod")!;
other.Register("from my mod");

// Any mod, optional: as an IStoneMod.
if (context.Mods.IsLoaded("thirdmod"))
    context.Log($"Running alongside {context.Mods.Manifest("thirdmod")!.Name}");
```

| `context.Mods` | |
|---|---|
| `Get(id)` | A running mod's mod class, as an `IStoneMod`; `null` if it isn't running (not there, switched off, or it failed to load). |
| `Get<T>(id)` | As its own class `T`, from a mod you require; `null` if it isn't running or isn't a `T`. |
| `Get<T>()` | The running mod whose mod class is a `T`. |
| `IsLoaded(id)` | Whether a mod is running. |
| `Manifest(id)` | A running mod's `mod.json`. |
| `All` | Every mod running, in the order they loaded (this one too, once its `Load` is done). |

A mod that's switched off is gone from here, and so are the mods that require it. A mod you only load `after` can be found, but not as its own type: use `Get(id)`.

`ModManifest` has `Requires` and `After`.

## Offering an API

Anything public in a mod is usable by the mods that require it: its mod class's methods, its own classes and interfaces. Keep what you offer stable once other mods use it, as you would a library's API.

Hooks from several mods on the same game script are ordered and checked for conflicts: see [Order and conflicts](../gml/hooks.md#order-and-conflicts).
