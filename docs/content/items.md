# Items

Mods add three kinds of items, each starting as a copy of one of the game's - its stats, sprites, sounds and behaviour - under the mod's own name, changing what they like:

| | Base class | Starts from |
|---|---|---|
| Weapons | `Weapon` | A game weapon: `StoneForge.GameItems.DrifterSword`... |
| Armour (helmets, chests, shields, rings...) | `Armor` | A game armour: `StoneForge.GameItems.LinenShirt`... |
| Consumables (food, drinks, potions, scrolls) | `Consumable` | A game consumable: `StoneForge.GameItems.Wine`... |

Every game item has a generated class in `StoneForge.GameItems` to inherit, named after it (`DrifterSword`, `LinenShirt`, `Wine`).

## A weapon

```csharp
using StoneForge;
using StoneForge.GameItems;

public class ExampleBlade : DrifterSword
{
    public ExampleBlade() : base("Example Blade")
    {
        Description = "A blade made in C#.";
        InventorySprite = "blade_inv.png";     // Assets\blade_inv.png
        LootSprite = "blade_loot.png";
        Set(WeaponColumn.Slashing_Damage, 40);
        Set(WeaponColumn.CRT, 15);
        Set(WeaponColumn.Price, 999);
    }

    protected override void OnEquip(Item item) => Context.Log("Drawn");

    // While it's on: a point of durability back each turn.
    protected override void OnEquippedTurn(Item item)
    {
        if (item.Durability < item.MaxDurability)
            item.Durability += 1;
    }

    // A blow that lands.
    protected override void OnHit(Item item, Attack attack)
    {
        if (attack.Result == AttackResult.Crit)
            attack.DealExtraDamage(5);
    }
}
```

Add it in `Load`, and give it to the player:

```csharp
var blade = new ExampleBlade();
context.Items.Add(blade);
// later, in game:
context.Items.Give(blade);
```

Once the game has loaded its item tables, a mod's item is like the game's own: it can be given, sold, worn, saved, and found in loot if `InRandomLoot` is set.

## Armour

```csharp
public class ExampleShirt : LinenShirt
{
    public ExampleShirt() : base("Example Shirt")
    {
        Description = "A linen shirt dyed blue in C#.";
        InventorySprite = "shirt_inv.png";
        InventoryFrames = 2;
        LootSprite = "shirt_loot.png";
        WornSprite = "shirt_worn.png";               // on the character: 48x40 frames
        WornSpriteFemale = "shirt_worn_female.png";
        CorpseSprite = "shirt_corpse.png";
        Set(ArmorColumn.DEF, 3);
        Set(ArmorColumn.Magic_Resistance, 10);
    }

    protected override void OnHitTaken(Item item, Attack attack) => Context.Log($"Took {attack.Damage:0}");
}
```

## Weapons and armour: ModItem

| Property | |
|---|---|
| `Key` | Its name in the game's tables, and the name shown unless `DisplayName` is set. Saves refer to it: don't change it once players have it. |
| `Id` | `"yourmod:Example Blade"`, set when it's added. |
| `BasedOn` | The game item it started as. |
| `DisplayName`, `Description` | Shown in game. |
| `InventorySprite`, `InventoryFrames` | A PNG in `Assets`: 27 pixels per inventory cell (a sword is 27x81). The game's have a frame per state of wear, side by side: 3 for weapons (good, worn, broken), 2 for armour. |
| `LootSprite` | On the ground, centred on its tile. |
| `EquippedSprite` | In its equipment slot (default: `InventorySprite`). |
| `WornSprite`, `WornSpriteFemale`, `WornUpperSprite`... | On the character while worn: the game item's frames side by side, each the game's size (48x40). `SetWornSprite(character, file)` gives a helmet its own per character. |
| `CorpseSprite` | On the player's corpse. |
| `InRandomLoot` | Whether it can turn up in random loot. |
| `ShowModName` | Whether its tooltip says which mod it's from. |
| `InGame` | Every one of it in the game now. |

`Set(WeaponColumn..., value)` / `Set(ArmorColumn..., value)` change its stats: the columns are generated from the game's tables.

| Event | |
|---|---|
| `OnCreated(item)` | A new one was made (given, looted, bought): not one loaded from a save. |
| `OnEquip(item)`, `OnUnequip(item)` | Put on (or loaded with it on); taken off. |
| `OnEquippedTurn(item)` | Every turn it's worn. |
| `OnAttack(item, attack)`, `OnHit(item, attack)` | Weapons: any attack with it; one that struck. |
| `OnAttacked(item, attack)`, `OnHitTaken(item, attack)` | Armour: the player was attacked; was struck. |

Each event gets the `Item` it happened to:

| `Item` | |
|---|---|
| `Durability`, `MaxDurability`, `DurabilityPercent` | Its condition. |
| `Quality` | `ItemQuality.Common`, `Enchanted`, `Magical`, `Cursed`. |
| `IsEquipped`, `Exists` | Whether it's worn; still in the game. |
| `Data(key)`, `SetData(key, value)` | Values of its own, saved with it. |
| `ModData(context)` | The mod's own values on it, under keys only it uses (see [ModData](../core/mod-context.md#values-of-your-own-moddata)). |
| `Type`, `Name`, `Instance` | The mod item it is; its name in the tables; the game's instance. |

## Consumables

```csharp
public class ExampleTonic : Wine
{
    public ExampleTonic() : base("tonic")
    {
        DisplayName = "Example Tonic";
        Description = "A teal tonic: it soothes wounds.";
        InventorySprite = "tonic_inv.png";
        LootSprite = "tonic_loot.png";
        Set(ConsumableColumn.Health_Restoration, 15);
        Set(ConsumableColumn.Price, 120);
    }

    // As it's drunk: this, then the game item's own effect.
    protected override void OnUse(Instance item) => Context.Log("Drunk!");
}
```

{% hint style="warning" %}
A consumable's key must be a **string literal** in the `base(...)` call. StoneForge's patcher reads it from your source to give the game an object for it (`o_inv_yourmod__tonic`) at the game's next start, so the game makes, saves, stacks and drops it as its own. A new consumable needs a game restart.
{% endhint %}

## Giving and querying

| `context.Items` | |
|---|---|
| `Add(item)`, `Add(consumable)` | Register (in `Load`). |
| `Give(item, quality, durabilityPercent)` | Give a mod's weapon or armour. False if there's no player or no room (a weapon that doesn't fit is dropped at the player's feet). |
| `Give(consumable, count)` | Give some of a consumable, stacked. |
| `Give(name, ...)` | Give a game item by name (`"Drifter Sword"`), a mod's by id (`"othermod:Blade"`), or another game item by its `o_inv_` object name less `o_inv_` (`"wine"`). |
| `Exists(name)` | Whether the game knows a weapon or armour by that name. |
| `Items.Get<T>()` | The mod item of type `T` a mod added (throws if none was). |
| `Stat(name, column)` | A weapon's or armour's value in its table: `context.Items.Stat("Drifter Sword", WeaponColumn.Price)`. |

To give items with values of their own (a condition, a mod's data), take them away, or put them in chests, see [Inventory and containers](../world/inventory-and-containers.md).
