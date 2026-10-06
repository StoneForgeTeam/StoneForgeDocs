# Loot tables

The containers in the world roll their loot from the game's **loot tables** as they're first opened. A container names a table by its loot key, and the place's tier picks the row: `"cryptTomb"` in a tier 3 place rolls `"cryptTomb3"` (or `"cryptTomb"`, if there's no such row).

`LootTables` reads and changes them:

```csharp
using System.Linq;

// Wine in every tier 3 crypt tomb, a third of the time: one or two bottles.
LootTables.Edit(context, "cryptTomb3", table => table.Add("wine", 33, 1, 2));

// No bones in any crypt tomb.
LootTables.EditAll(context, name => name.StartsWith("cryptTomb"), table =>
{
    foreach (var slot in table.Slots.Where(s => s.Items.Any(i => i.Contains("bone"))))
        slot.Clear();
});
```

The game loads its tables as it starts, after mods load: `Edit` and `EditAll` called from `Load` wait until they're there. A change lasts for the rest of the game's run, so make it from `Load`; containers already opened have their loot.

| `LootTables` | |
|---|---|
| `Loaded` | Whether the game has loaded its tables. |
| `Names` | Every table's name (none before they're loaded). |
| `Get(name)` | A table by name (`"cryptTomb3"`); `null` if there's none, or they aren't loaded yet. |
| `Edit(context, name, table => ...)` | Changes a table, now or as soon as the game loads them. Nothing if there's no table by that name. |
| `EditAll(context, name => ..., table => ...)` | Changes every table the first function picks by name. |

## A table

A `LootTable` has item slots and five equipment slots, each with its chance of giving anything each roll. The game's own roll reads nine item slots. Once those are taken, `Add` puts an item in one of StoneForge's own beyond them, which StoneForge rolls just after the game's roll, the same way (the game's own loot script, for the same container and tier). So every mod's additions get in, however many there are.

| `LootTable` | |
|---|---|
| `Name` | Its name: a loot key and a tier (`"cryptTomb3"`), or the key alone. |
| `Slots` | Its item slots (`LootSlot`): the game's nine, then any extra ones. |
| `EquipmentSlots` | Its five equipment slots (`LootEquipmentSlot`). |
| `TierMod` | The tiers its items are of: `""` for the place's own, `"4"` for one, `"4,5"` for a range. |
| `Add(item, chance, min, max, tags)` | Puts an item in its first empty slot (an extra one, with the nine taken): `min` to `max` of it, `chance`% of rolls. The slot. |
| `Add(consumable, chance, min, max)` | A mod's consumable. |

An item is one of the game's items by its `o_inv_` object's name less `o_inv_` (`"wine"`), a kind of item the game picks one of (`"gem"`, `"valuable"`, `"treatise"`..., narrowed by `tags`), or several of either separated by commas, to choose one from.

| `LootSlot` | |
|---|---|
| `Number`, `IsEmpty` | Its number (1 to 9 the game's, 10 on StoneForge's); whether it gives nothing. |
| `IsExtra` | Whether it's one of StoneForge's beyond the game's nine. |
| `Items` | What it may give, as the game names them (`"o_inv_wine"`, `"gem"`): one is chosen at random each roll. |
| `Chance` | How likely it gives anything each roll, in %. Settable. |
| `Count` | How many it gives when it does: `(Min, Max)`. Settable. |
| `Tags` | What narrows a kind of item (`"crypt"`, `"common uncommon rare"`). Settable. |
| `Set(item, chance, min, max, tags)`, `Clear()` | Makes it give this; makes it give nothing. |

| `LootEquipmentSlot` | |
|---|---|
| `Number`, `IsEmpty` | Its number, 1 to 5; whether it gives nothing. |
| `Kinds` | The kinds of equipment it may give: `"weapon"`, `"armor"`, `"jewelry"`, or a weapon's type (`"dagger"`, `"2HStaff"`...). |
| `Tags` | What narrows the pick (`"aldor"`, `"magic"`...). |
| `Rarities` | The rarities it may be: `"common"`, `"uncommon"`, `"rare"`, `"unique"`. |
| `Durability` | Its condition, between `(Min, Max)` % of full. |
| `Chance` | How likely it gives anything each roll, in %. |
| `Clear()` | Makes it give nothing. |

A mod's weapons and armour join the equipment slots' pick as the game's do, when they have [`InRandomLoot`](../content/items.md#weapons-and-armour-moditem) set.

## One container's table

A container in the world can be made to roll from another table, before it's first opened:

```csharp
if (!Containers.HasBeenOpened(chest))
    Containers.SetLootTable(chest, "cryptBossChest", tier: 0);   // tier 0: the place's own
```

`Containers.LootTableOf(container)` is the `(Key, Tier)` one rolls from, or `null` if it doesn't roll from the tables. `SetLootTable` is too late once it's been opened, and returns false then. To fill one with exactly what you choose instead, see [`Containers.SetContents`](inventory-and-containers.md#containers).
