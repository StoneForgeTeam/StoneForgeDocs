# Instances and objects

An **instance** is one thing in the room: the player, an enemy, an item on the ground, a menu button. Each is an instance of a GameMaker **object** (`o_player`, `o_loot`...), and objects inherit from each other (`o_player` is an `o_unit`).

StoneForge gives you instances two ways:

- **`Instance`**: untyped, every variable by name: `instance["HP"]`.
- **A generated object class**, from `StoneForge.Objects`: typed, with the object's own variables as properties: `player.HP`. Every class derives from `GameInstance`, and follows the game's inheritance (`o_player : o_unit : ...`).

```csharp
using StoneForge.Objects;

o_player? player = Instances.First<o_player>(GameObjectId.o_player);
if (player != null)
{
    double hp = player.HP;             // the object's own variable, typed
    player.X += 16;                    // a built-in, on every GameInstance
    player.Instance.Set("my_flag", true); // anything else, by name
}
```

## Finding instances

| `Instances` | |
|---|---|
| `First<T>(GameObjectId obj)` | The first instance of an object (or a child of it), or `null`. |
| `All<T>(GameObjectId obj)` | Every instance, as `T`. |
| `All(GameObjectId obj)`, `All(int objectIndex)`, `All(GameObject obj)` | Every instance, untyped (the last for a [mod's own object](../content/game-objects.md)). |
| `Nearest<T>(x, y, GameObjectId obj)`, `Nearest(x, y, int objectIndex)` | The one nearest a point. |
| `Count(int objectIndex)` | How many there are (not those culled). |

```csharp
foreach (var enemy in Instances.All<GameInstance>(GameObjectId.o_enemy))
    if (enemy.Exists && enemy.IsA((int)GameObjectId.o_enemy))
        count++;
```

`Gm` has the common built-ins typed: `Gm.InstanceExists(obj)`, `Gm.InstanceNumber(obj)`, `Gm.Create<T>(x, y, depth, obj)`, `Gm.ObjectIsAncestor`, `Gm.AssetGetIndex(name)`, and where the game is: `Gm.InMainMenu`, `Gm.InGame`, `Gm.Room`.

## GameInstance

Every typed instance has GameMaker's built-in variables as properties:

| | |
|---|---|
| `X`, `Y`, `XPrevious`, `YPrevious`, `Depth` | Where it is. |
| `Visible`, `SpriteIndex`, `ImageIndex`, `ImageSpeed`, `ImageXScale`, `ImageYScale`, `ImageAngle`, `ImageAlpha` | How it's drawn. |
| `ObjectIndex`, `IsA(obj)`, `Id` | What it is (compare `ObjectIndex` with `(int)GameObjectId.o_...`). |
| `Exists`, `Destroy()` | Whether it's still there; remove it (its Destroy event runs). |
| `Alarm[0..11]` | Its alarms: steps until each goes off, `-1` when off. `player.Alarm[2] = -1` stops one. |
| `Instance` | The untyped instance underneath. |

The generated classes add each object's own variables, the ones its events assign: `player.HP`, `player.max_hp`, `nav.buttonsOffset`.

## Instance

| | |
|---|---|
| `this[name]`, `Get(name)`, `Set(name, value)` | A variable, by name. Missing: `undefined`. Setting creates it. |

On a typed instance, set variables by name with `Set`: `player.Instance.Set("my_flag", true)`. C# won't let you assign through the indexer of a value a property returns (`player.Instance["my_flag"] = true` doesn't compile); a local or field works either way.
| `Exists`, `IsNone`, `Id`, `Instance.FromId(id)` | Whether it's there; the GameMaker id; an instance from an id. |
| `Instance.Of(value)` | The instance a value the game keeps names - a reference, or its id as a number (a unit's target, an effect's owner) - or none (`noone`, `-4`, `undefined`). |
| `As<T>()` | As a generated class: `instance.As<o_player>()`. |
| `Persist()` | A reference by id, safe to keep between callbacks (see below). |
| `Destroy(runDestroyEvent = true)` | Remove it, culled or not. |
| `IsCulled`, `IsGone` | See [culling](#culling). |
| `Alarm[...]` | Its alarms. |

## Keeping instances between callbacks

An `Instance` handed to an event or hook can be used freely inside that callback. To keep one for later - in a field, between frames - keep it by id:

```csharp
private Instance _target;

Events.o_player.Step_0.After(context, player => _target = player.Instance.Persist());

public void Tick(double deltaTime)
{
    if (_target.Exists)
        _target["image_alpha"] = 0.5;
}
```

Always check `Exists` before using a kept instance: the game may have destroyed it since. Ids identify instances in the running game only, not across saves.

## Culling

To save work, the game *culls* some instances that are off screen - ground loot, decorations - deactivating them until they're on screen again. A culled instance is still in the world, but GameMaker's own `with` and `instance_exists` skip it, and its own variables can't be read or set (its built-ins, such as `x` and `object_index`, can).

- `Instances.All(..., includeCulled: true)` lists culled instances too.
- `instance.IsCulled`: deactivated by the game, still in the world.
- `instance.IsGone`: really gone (destroyed, picked up); `Exists` is false for a culled one too.
- `instance.Destroy()` handles culled instances safely.

Keep a mod's data about an instance by its id, not on the instance, so it survives culling:

```csharp
using System.Linq;

var loot = Instances.All(GameObjectId.o_loot, includeCulled: true);
int offScreen = loot.Count(item => item.IsCulled);
```

## Creating instances

```csharp
var mark = Gm.Create<GameInstance>(x, y, depth: 0, GameObjectId.o_invisible_mark);
```

For objects of your own, with events written in C#, see [Game objects](../content/game-objects.md).
