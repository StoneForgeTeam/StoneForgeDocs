# Combat and damage

## Attacks

Weapons, armour and passives get an `Attack` in their events (`OnHit`, `OnAttacked`...). It has already happened: its damage is dealt.

| `Attack` | |
|---|---|
| `Attacker`, `Target` | Who attacked whom. |
| `Result` | `AttackResult.Hit`, `Crit`, `Block`, `Dodge` or `Fumble`. |
| `IsHit` | A hit or a crit. |
| `Damage` | The damage it dealt, after armour and blocking. |
| `IsRanged`, `ByPlayer`, `OnPlayer` | A shot or throw; by the player; on the player. |
| `Killed` | The target has no health left. |
| `DealExtraDamage(amount)` | More damage now, straight off the target's health. |

### Every attack

`Combat.OnAttack` runs for every attack resolved, anyone's (a melee blow or a shot, a hit, crit, block, dodge or fumble), after its damage is dealt. `Combat.OnHit` runs for those that strike: a hit or a crit. The attacker and target are kept by id, so the `Attack` can be kept.

```csharp
Combat.OnHit(context, attack =>
{
    if (attack.ByPlayer && attack.Result == AttackResult.Crit)
        attack.DealExtraDamage(3);
});
```

## Dealing damage

`Combat.Damage` deals damage as the game does: the target's protection, armour piercing and resistances apply, the number shows over it, the combat log says so, and with a source, the hit is the source's (for who attacked whom, crimes and kills).

```csharp
using System.Collections.Generic;

int done = Combat.Damage(target, DamageType.Shock, 12, source: caster);

// Several kinds as one hit, as a weapon's mixed damage is.
Combat.Damage(target, new Dictionary<DamageType, double>
{
    [DamageType.Fire] = 8,
    [DamageType.Slashing] = 4,
}, attacker);

// With options.
Combat.Damage(target, DamageType.Pure, 5, caster, new DamageOptions { ArmorPiercing = 50, Name = "Shock Bolt", Log = true });
```

It returns the damage done, after protection and resistances.

The game's kinds of damage are generated as `DamageType.Shock`, `DamageType.Fire`, `DamageType.Slashing`..., each resisted by its own stat with its own effects (fire burns, frost chills). `DamageType.Pure` goes past protection and every resistance.

| `DamageOptions` | |
|---|---|
| `ArmorPiercing` | 0-100: how much of the target's protection it ignores. |
| `Log` | Whether the combat log says so (default: yes). |
| `Name` | What dealt it, in the combat log (default: the source's name). |

## Attacks and plain hits

To have one unit attack another with its weapon, as the game resolves it - hit, dodge, block, crit, its damage, counterattacks - and the attacker's turn taken:

```csharp
Combat.Attack(attacker, target);                 // as its turn chose it
Combat.Attack(attacker, target, forced: true);   // a forced attack: its turn is left alone
```

`Combat.Hit(target, amount, source)` takes health off a unit as the game's plain damage does: the flash and the number, its morale, its reaction to being hit (turning on `source`), with no damage types or resistances. Use `Combat.Damage` for those.

## Kills and factions

A unit's **damage list** records who fought it, for who gets the kill. `Combat.DamageShare(unit, attacker)` is how much of it one attacker has (more than 0: they took part); `Combat.AddDamageShare(unit, attacker, amount)` adds one.

`Factions.Join(unit)` puts a unit in its faction's list (its own faction variables say which), so enemies hostile to that faction go for it and its allies don't; `Factions.Leave(unit)` takes it out.

## Damage of your own

A kind of your own inherits one of the game's (from `StoneForge.GameDamageTypes`) and is dealt as it, with its resistance and effects, changing what it likes:

```csharp
using StoneForge.GameDamageTypes;

// Shock that's half as hard again on the Shocked.
public class Overcharge : Shock
{
    private readonly Shocked _shocked;

    public Overcharge(Shocked shocked)
    {
        _shocked = shocked;
        Name = "Overcharge";
    }

    protected override double Modify(DamageHit hit)
        => StoneForge.Buffs.Has(hit.Target, _shocked) ? hit.Amount * 1.5 : hit.Amount;
}

// Dealt like any other:
Combat.Damage(cast.Target, new Overcharge(shocked), 10, cast.Caster);
```

Inherit `Pure` for a kind no game resistance applies to, resisted as you decide in `Modify`.

| `DamageType` | |
|---|---|
| `Name` | Its name in the combat log's breakdown ("9 overcharge"). |
| `GameName`, `Resistance` | The game's kind it's dealt as, and the stat that resists it. |
| `Modify(hit)` | The amount it deals, before the game's calculation: bonuses, or a resistance of your own. |
| `OnDealt(hit)` | After it's dealt: `hit.Dealt` is what the whole hit did. |

`DamageHit` has `Target`, `Source`, `Type`, `Amount` and `Dealt`.
