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

The game's effects - a stun, a bleed, No Retreat... - are objects, named `o_db_...` (debuffs) and `o_b_...` (buffs). `UnitEffects` works with them on any unit, the player's or another, as the game's own attacks and skills do:

```csharp
using System.Linq;

UnitEffects.Create("o_db_stun", enemy, 2, owner: player);
if (UnitEffects.Has(enemy, "o_db_poison"))
    context.Log("Poisoned");
foreach (var effect in UnitEffects.On(enemy).Where(e => e.Shown && e.Harmful))
    context.Log($"{effect.Name}: {effect.Duration} turns left");
```

| `UnitEffects` | |
|---|---|
| `On(unit)` | The effects on a unit, in its order, as `GameEffect`s: `Instance`, `Object`, `Name`, `Duration` (turns left), `Shown` (an icon, not one of the game's invisible workings), `Harmful` (a debuff). |
| `Has(unit, effect)` | Whether a unit has an effect, by its object's name. |
| `Create(effect, target, turns, owner, stage)` | Puts one on as the game does: its immunities apply (`Stun_Immunity`...), a debuff's turns are shortened by the target's fortitude, and the target's HUD shows it. None if it couldn't (immune, dead, not a unit). |
| `Refresh(effect, target, turns, stacks)` | Refreshes one as the game does: its turns set, and one made if the unit has fewer than `stacks` of it. |
| `IconOf(effect)`, `IsShown(obj)` | An effect's icon; whether an effect object shows. |
| `RemoveAll(unit)` | Takes every effect on a unit off, with their Destroy events. Do this before a unit is taken out without its own Destroy event (`Units.Remove` does it for you): effects left pointing at a unit that's gone crash the game. |

`context.Buffs.ApplyGame(effect, target, turns, source)` and `context.Buffs.Has(unit, modBuff)` remain for applying a game effect and checking a mod's buff.
