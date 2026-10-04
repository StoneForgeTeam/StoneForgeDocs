# Buffs and debuffs

A mod's buff or debuff works like the game's own effects: an icon by the unit's others, a name and description on hover, a duration in turns, and stat changes while it lasts.

```csharp
using StoneForge;

public class Shocked : ModBuff
{
    public Shocked() : base("shocked", BuffKind.Debuff)
    {
        DisplayName = "Shocked";
        Description = "Less accurate and slower to dodge, and 3 damage at the start of each turn.";
        Icon = "shocked.png";              // Assets\shocked.png, 27x26
        Set(BuffStat.Hit_Chance, -15);
        Set(BuffStat.EVS, -10);
        // Lightning over the unit while it lasts, glowing blue.
        SetAura(Sprite.s_lightinge_twohand, new FxOptions { Light = Draw.Rgb(110, 170, 255) });
    }

    protected override void OnTurn(Effect effect) => effect.DealDamage(3);
}
```

Add it in `Load` and apply it to any unit:

```csharp
var shocked = new Shocked();
context.Buffs.Add(shocked);

// later: on an enemy for 3 turns, put there by the player
Effect? effect = context.Buffs.Apply(shocked, attack.Target, 3, attack.Attacker);
```

`Apply` returns `null` if the game wouldn't apply it (the unit is immune, dead, or not a unit).

## ModBuff

| | |
|---|---|
| `base(key, kind)` | Its key (saves refer to it: don't change it once players have it) and `BuffKind.Buff` or `BuffKind.Debuff`. A debuff's duration is shortened by its target's Fortitude, as the game's are. |
| `DisplayName`, `Description`, `Icon` | Shown on hover; a 27x26 PNG in `Assets`. |
| `Set(BuffStat stat, value)` | A stat change while it lasts, added to the unit's own (negative lowers it): `BuffStat.CRT`, `Hit_Chance`, `EVS`... |
| `SetAura(Sprite sprite, options)` | A looping animation on its unit while it lasts: one of the game's sprites. |
| `SetAura(file, frames, options)` | The same, from a PNG strip in `Assets`, each frame drawn with its bottom middle at the unit's feet. |
| `Active` | Every one of it on a unit now. |

| Event | |
|---|---|
| `OnApplied(effect)` | Put on a unit (not when a save is loaded with it on). |
| `OnTurn(effect)` | At the start of each of its unit's turns. |
| `OnRemoved(effect)` | Run out, removed, or its unit died. |

## Effect

One buff on one unit:

| | |
|---|---|
| `Target`, `Owner` | The unit it's on; who put it there. |
| `Duration` | Turns left. |
| `Remove()` | Takes it off now. |
| `DealDamage(amount)` | Damages its unit, straight off its health (inside its events only). |
| `Type`, `Instance` | The `ModBuff` it is; the game's instance. |

## The game's own effects

```csharp
context.Buffs.ApplyGame("o_db_daze", enemy, 3, player);
bool has = context.Buffs.Has(enemy, shocked);
```

`ApplyGame` takes the effect's object name: `"o_db_daze"`, `"o_db_poison"`, `"o_db_bleed_tors"`...
