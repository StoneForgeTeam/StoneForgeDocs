# Visual effects

`Fx.Play` plays an animation on a unit, following it, as the game's own effect animations do. Use one of the game's sprites, or a strip of your own:

```csharp
// The game's electric weapon hit, at chest height, glowing blue.
Fx.Play(attack.Target, Sprite.s_weapondamage_electricity, new FxOptions
{
    OffsetY = -14,
    Light = Draw.Rgb(110, 170, 255),
});

// A mod's own: a PNG in Assets, its frames side by side.
int spark = context.LoadSprite("spark.png", frames: 6);
Visual? aura = Fx.Play(player, spark, new FxOptions { Loop = true, Under = true });
// later
aura?.Stop();
```

`Play` returns a `Visual` (`Playing`, `Stop()`, `Instance`), or `null` if there's no such unit.

| `FxOptions` | |
|---|---|
| `Speed` | Frames per game frame (the game's effects mostly play at 0.5). |
| `Loop` | Plays until stopped (an aura) instead of once. |
| `OffsetX`, `OffsetY` | From where the unit is drawn (its feet): -16 is about chest height. |
| `Colour`, `Alpha` | Its tint (`Draw.Rgb`) and opacity. |
| `Under` | Drawn behind the unit: a glow on the ground at its feet. |
| `Light` | The colour of the light it casts (default: the game's warm orange). |

For an animation that lasts as long as a buff, use the buff's `SetAura` (see [Buffs](buffs.md)).
