# Game objects

A mod can add GameMaker objects of its own, with their events written in C#. Each is a child of one of the game's objects, so the game treats its instances as that object's: a child of `o_enemy` is a unit.

```csharp
using StoneForge;

public class Marker : GameObject
{
    public Marker() : base("marker", "o_invisible_mark")
    {
        Sprite = "s_dummy";
    }

    protected override void OnCreate(Instance self) => self["life"] = 60;

    protected override void OnStep(Instance self)
    {
        self["life"] = self["life"] - 1;
        if (self["life"] <= 0)
            self.Destroy();
    }
}
```

```csharp
var marker = new Marker();
context.Objects.Add(marker);

// later, in game:
Instance made = marker.Create(x, y, depth: 0);
```

{% hint style="warning" %}
The key and parent must be **string literals** in the `base(...)` call. StoneForge's patcher reads them from your source and adds the object (`o_yourmod__marker`) to the game data at the game's next start. A new object, or a changed parent, needs a restart; its C# events reload with the mod.
{% endhint %}

## GameObject

| | |
|---|---|
| `base(key, parent)` | Its key, and the game object it's a child of (`""` for none). |
| `ObjectName`, `Index` | `"o_yourmod__marker"`; its object index (`-1` until the game has it). |
| `Sprite` | One of the game's sprites by name (default: its parent's). |
| `Persistent`, `Visible` | Whether its instances stay from room to room (default no); are drawn (default yes). |
| `ReplacesDraw` | Override to `true` for `OnDraw` to draw in place of the parent's Draw. |
| `Create(x, y, depth)` | A new instance (its Create event has run when it's returned). |
| `Instances`, `Owns(instance)` | Its instances now; whether an instance is one of its. |

## Events

Override the ones you need. Each gets the instance it runs for:

`OnCreate`, `OnDestroy`, `OnCleanUp`, `OnBeginStep`, `OnStep`, `OnEndStep`, `OnDrawBegin`, `OnDraw`, `OnDrawEnd`, `OnDrawGui`, `OnAlarm(self, n)`, `OnUserEvent(self, n)`, `OnLeftPressed`, `OnRightPressed`, `OnMouseEnter`, `OnMouseLeave`.

Every event runs the parent's first (as `event_inherited()` would), then yours - except Destroy and Clean Up, which run yours first, and Draw, which yours replaces when `ReplacesDraw` is set. With no parent's Draw, the instance's sprite is drawn, as GameMaker does.

Its instances are destroyed when the mod is switched off. To find them: `Instances.All(marker)`.
