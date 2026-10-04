# Skills

Mods add **active skills** (`ModSkill`) and **passive skills** (`ModPassive`). Both go on a tab of the game's skills menu, are learnt with ability points, and can require levels, attributes or other skills.

## An active skill

An active skill starts as one of the game's - its targeting (a unit, a tile, an area, none), cast, cooldown, energy cost and sounds - and replaces its effect with yours. Every game skill has a generated class in `StoneForge.GameSkills` to inherit:

```csharp
using StoneForge;
using StoneForge.GameSkills;

public class ShockBolt : ChainLightning
{
    private readonly Shocked _shocked;

    public ShockBolt(Shocked shocked) : base("shock_bolt")
    {
        _shocked = shocked;
        DisplayName = "Shock Bolt";
        Description = "10 shock damage, and its target Shocked for 4 turns.";
        Icon = "shock_bolt.png";
        Tab = "Stormcalling";
        Group = SkillGroup.Sorcery;
        Cooldown = 3;
        EnergyCost = 20;
    }

    protected override void OnCast(SkillCast cast)
    {
        Fx.Play(cast.Target, Sprite.s_weapondamage_electricity, new FxOptions { OffsetY = -14 });
        Combat.Damage(cast.Target, DamageType.Shock, 10, cast.Caster);
        Context.Buffs.Apply(_shocked, cast.Target, 4, cast.Caster);
    }
}
```

```csharp
context.Skills.Add(new ShockBolt(shocked));
```

{% hint style="warning" %}
A skill's key must be a **string literal** in the `base(...)` call. StoneForge's patcher reads it from your source to give the game objects for it (`o_skill_<key>` and its icon) at the game's next start. A new skill needs a game restart.
{% endhint %}

| `ModSkill` | |
|---|---|
| `BasedOn` | The game skill it starts as (its id). |
| `Cooldown`, `EnergyCost`, `Range` | Default: the game skill's. |
| `KeepGameEffect` | Whether the game skill's own effect happens too, after `OnCast` (default: no). |
| `KeepGameConditions` | Whether the game skill's own conditions for use stay (default: no). Some game skills only work in some cases; a mod's effect usually shouldn't inherit that. |
| `Set(SkillColumn..., value)` | A column of the skills table. |
| `OnCast(cast)` | Its effect: energy is paid and the cooldown started by the game. |

`SkillCast` has `Caster`, `Target` (the unit, or the game's mark on the tile aimed at; the caster for a skill without a target), `X`, `Y`, `IsCrit` (a miracle: a spell's critical cast) and `Skill` (its instance).

## A passive skill

A passive is always on once learnt. It changes the character's stats, shown in the character sheet as the game's passives are, and reacts to fights:

```csharp
using System;
using StoneForge;

public class StaticCharge : ModPassive
{
    private readonly Shocked _shocked;

    public StaticCharge(Shocked shocked) : base("static_charge")
    {
        _shocked = shocked;
        DisplayName = "Static Charge";
        Description = "+5% Crit Chance, and weapon hits may shock.";
        Icon = "static_charge.png";
        Tab = "Stormcalling";
        Set(BuffStat.CRT, 5);
    }

    protected override void OnHit(Attack attack)
    {
        if (Random.Shared.NextDouble() < 0.25)
            Context.Buffs.Apply(_shocked, attack.Target, 3, attack.Attacker);
    }
}
```

| `ModPassive` | |
|---|---|
| `Set(BuffStat stat, value)` | A stat change while it's learnt. |
| `IsLearnt` | Whether the player has learnt it. |
| `OnAttack`, `OnHit`, `OnKill` | The player attacked; hit; killed. |
| `OnAttacked`, `OnHitTaken` | The player was attacked; was hit. |

## Where it goes, and what it takes

Shared by both kinds (`ModSkillBase`):

| | |
|---|---|
| `DisplayName`, `Description`, `Icon` | Its name, tooltip and icon (the size and frames of the game's skill icons). |
| `Tab` | The skills menu tab it's on, with the mod's other skills of that tab (9 to a tab; more go on "Tab 2"...). Default: the mod's name. |
| `Group` | The section its tab is in. `SkillGroup.Weaponry`, `SkillGroup.Utility` or `SkillGroup.Sorcery` put it among the game's; any other name makes a section of the mods' own after the game's (default: `SkillGroup.Mods`). |
| `RequiredLevel` | The character level it can be learnt from. |
| `RequireAttributes(points, attributes...)` | Attribute points needed in these, together, over the 10 each starts at: `RequireAttributes(2, CharacterAttribute.Perception, CharacterAttribute.Willpower)`. |
| `RequireSkill(skill)` | Learnt only once another mod skill is. |
| `RequireSkill(gameSkillId)` | Learnt only once a game skill is: `RequireSkill(ChainLightning.GameName)`. |

The skill's tooltip tells the player what's missing.
