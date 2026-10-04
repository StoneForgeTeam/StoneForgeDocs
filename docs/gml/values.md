# Values

Everything that crosses between C# and the game is a `GmValue`: GameMaker's dynamic value, which can hold a number, a string, a bool, an instance, an array, a struct, or `undefined`.

## GmValue

`GmValue` converts implicitly to and from the C# types, so most code never names it:

```csharp
double hp = player.HP;          // GmValue -> double
player.HP = 50;                 // int -> GmValue
string resolution = Game.Global["resolution"];   // "1280x720"...
GmValue level = Game.CallScript("scr_atr", player.Instance, "LVL");
```

| Member | |
|---|---|
| `Kind` | What it holds: `GmKind.Undefined`, `Real`, `String`, `Bool`, `Instance`, `Array` or `Struct`. |
| `IsUndefined`, `GmValue.Undefined` | `undefined`: a missing variable, a script that returns nothing. |
| `AsReal`, `AsInt`, `AsBool`, `AsString` | The value as that type. A bool is `1` / `0` as a number; `AsBool` is GameMaker's truthiness (a number above 0.5, or true). |
| `AsInstance`, `As<T>()` | An instance, untyped or as a [generated object class](instances.md) (`value.As<o_player>()`). |
| `AsArray`, `AsStruct` | The game's array or struct, or `null` if it isn't one. |
| `AsDsMap`, `AsDsList` | The game's `ds_map` / `ds_list` with this number, or `null`. |
| `GmValue.From(asset)` | An asset id from a generated enum: `GmValue.From(GameObjectId.o_player)`, `GmValue.From(Sprite.s_hcorner)`. |

Reading a value as the wrong type doesn't throw: it gives that type's default (`0`, `false`, `""`). When the difference matters, check `Kind` first:

```csharp
if (slot.Info?["example_saves"] is { Kind: GmKind.Real } count)
    context.Log($"{count.AsInt} saves");
```

`GmValue` also has GameMaker's arithmetic and comparisons (`+ - * / %`, `< > <= >=`, `==`), so `player.HP < player.max_hp * 0.25` works on values straight from the game.

## Arrays and structs: GmArray, GmStruct

`GmArray` and `GmStruct` are the game's own arrays and structs, held **by reference**. Changing one changes the game's, and passing one back to the game passes that same one.

```csharp
// The game's own: the player's sprite rows.
if (Game.Global["playerSpriteArray"].AsArray is { } sprites)
{
    using (sprites)
        context.Log($"{sprites.Length} rows, the first is sprite {sprites[0]}");
}

// Made from C#, to hand to the game.
using GmArray numbers = GmArray.From(new GmValue[] { 1, 2, 3 });
numbers.Push(4);
numbers[0] = 10;

using GmStruct hero = GmStruct.Create();
hero["name"] = "Felice";
hero["level"] = 3;
hero["kit"] = numbers;
```

| `GmArray` | `GmStruct` |
|---|---|
| `Length`, `this[int]` (setting past the end grows it) | `this[string]`, `Has(name)`, `Remove(name)` |
| `Push`, `Insert`, `Delete`, `ToArray()`, `foreach` | `Names`, `Count` |
| `GmArray.Create(length, fill)`, `GmArray.From(values)` | `GmStruct.Create()` |

**Lifetime.** While C# holds a `GmArray` or `GmStruct`, it's kept alive for GameMaker's garbage collector. `Dispose` it (or `using`) to let go at once; otherwise it's let go of once C# no longer refers to it.

## The game's maps and lists: DsMap, DsList

Stoneshard keeps most of its state in `ds_map`s and `ds_list`s: the save data, characters, contracts, locations. In GameMaker a map or list is just a number; `DsMap` and `DsList` wrap that number so you can read and change it in place.

```csharp
DsMap? save = SaveData.Map;                       // the game's own: don't destroy it
DsMap? game = SaveData.Section("gameDataMap");
GmValue value = game?["some_key"] ?? GmValue.Undefined;

DsMap mine = DsMap.Create();                      // yours: destroy it, or nest it
mine["visits"] = 1;
mine.AddList("seen", DsList.Create());            // nested: `mine` now owns the list
string json = mine.ToJson();
mine.Destroy();                                   // destroys the nested list too
```

| Member | |
|---|---|
| `this[key]` / `this[index]` | A value. Setting one replaces it (a nested map or list there is destroyed first). |
| `Has`, `Get(key, fallback)`, `Remove`, `Keys`, `Count` | Map lookups (`DsMap`). |
| `Add`, `RemoveAt`, `Clear`, `Count` | List editing (`DsList`). |
| `GetMap`, `GetList`, `IsMap`, `IsList` | Nested maps and lists. |
| `AddMap`, `AddList` | Nest one: the outer one owns it from then on, destroys it with itself, and writes it into JSON as an object or array. |
| `AssignFrom(source)` | Make it a copy of another, in place: everything holding it sees the new contents. |
| `ToJson()`, `ToJsonNode()`, `FromJson(json)` | As the game writes and reads them (`json_encode` / `json_decode`). |
| `Create()`, `Destroy()`, `Exists` | Make your own (and destroy it when done); whether it's still there. |

**Ownership.** A map or list you `Create` (or get from `FromJson`, or as a copy such as `LocationPreset.Entities`) is yours: `Destroy` it, or nest it in another so that one owns it. One the game hands you (`SaveData.Map`, `SaveData.Section(...)`) is the game's: never destroy it.

## JSON

Every value converts to and from `System.Text.Json`, for saving, sending or logging:

```csharp
JsonNode? node = value.ToJsonNode();          // arrays and structs with everything in them
GmValue back = GmValue.FromJsonNode(node);    // arrays and objects become new GmArray / GmStruct
using GmStruct? copy = GmStruct.FromJson(hero.ToJson());
```

An instance becomes its id; `undefined` becomes `null`.
