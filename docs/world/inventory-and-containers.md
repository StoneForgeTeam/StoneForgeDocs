# Inventory and containers

## Inventory

`Inventory` is what the player carries: the items in their inventory, worn and in hand included, as the game's save counts them. What's in a bag isn't in it. A bag's contents are kept in the bag (see [Containers](#containers)).

```csharp
foreach (InventoryItem item in Inventory.Items())
    context.Log($"{item.Name} x{item.Stack}{(item.IsEquipped ? " (worn)" : "")}");

Inventory.Add("wine", stack: 2);                                   // one of the game's items
Inventory.Add<MyBlade>(setup: blade => blade.Durability = 50);     // a mod's weapon, half worn
int taken = Inventory.Remove("wine", 1);
```

| `Inventory` | |
|---|---|
| `Items()` | Every item the player carries (none with no game). |
| `Owner` | The player's inventory instance (`o_inventory`): the owner of what they carry. |
| `Add(name, stack, quality, setup)` | Gives the player an item as the game does, in their first free cell. The item, or `null` if there's no such item, no game, or no room (the game drops it at the player's feet then). |
| `Add<T>(quality, setup)`, `Add(modItem, ...)`, `Add(consumable, stack, setup)` | A mod's weapon, armour or consumable. |
| `Remove(item)` | Takes an item away, as the game does (taken off first if it's on). |
| `Remove(name, count)`, `Remove<T>(count)`, `Remove(consumable, count)` | Takes up to `count` away by name, from its stacks and then whole items: how many were taken. |

Names are those of [`Items.Give`](../content/items.md#giving-and-querying): one of the game's items by its `o_inv_` object's name less `o_inv_` (`"wine"`), or a weapon or armour by its name. `quality` is an `ItemQuality`: `Rolled` (as loot is, the default), `Common`, `Enchanted`, `Magical` or `Cursed`.

### Inventory events

```csharp
Inventory.OnAdded(context, item => context.Log($"Picked up {item.Name} x{item.Stack}"));
Inventory.OnRemoved(context, item => context.Log($"Lost {item.Name}"));
Inventory.OnEquipped(context, (item, on) => context.Log($"{item.Name} {(on ? "on" : "off")}"));
```

| | |
|---|---|
| `OnAdded(context, item => ...)` | The player comes to carry an item: picked up, bought, taken from a chest, made, given. Not the items a game loads with. |
| `OnRemoved(context, item => ...)` | An item stops being the player's: dropped, sold, put in a chest, used up, destroyed. An item used up is gone by then: only its `Slot` is left to compare. |
| `OnEquipped(context, (item, on) => ...)` | The player puts an item on or takes it off. |

The inventory is compared once a frame, after the game's done with it, so every way an item comes or goes counts. A game loaded starts afresh.

## Items: InventoryItem

An `InventoryItem` is one item, as a slot: one the player carries, or one in an open container. It's kept by id, so it can be kept between frames; check `Exists` first.

Each item has its own data, kept with it wherever it goes (a chest, the ground, a save):

```csharp
if (Inventory.Add<MyBlade>() is { } blade)
{
    blade.Durability = 50;
    blade.SetData("mymod:kills", 0);
}

Combat.OnHit(context, attack =>
{
    if (attack.Killed && Inventory.Items().FirstOrDefault(i => i.IsEquipped && i.Name == "My Blade") is { Exists: true } worn)
        worn.SetData("mymod:kills", worn.Data("mymod:kills").AsInt + 1);
});
```

| `InventoryItem` | |
|---|---|
| `Name` | Its name as the game keeps it (`"Wine"`, `"Linen Shirt"`). |
| `Stack` | How many in its stack (1 for an item that doesn't stack). |
| `IsEquipped` | Whether the player has it on, worn or in hand. |
| `Owner` | What holds it: the player's inventory, or an open container's window. |
| `Slot`, `Exists` | Its instance (`o_inv_slot` or one of its kinds); whether it's still there. |
| `Durability`, `MaxDurability`, `DurabilityPercent` | Its condition in points, as its tooltip shows, and in %. `Durability` can be set (kept between none and full). 0 for an item without one. |
| `Quality` | Its quality (the game's rarity). |
| `IsIdentified` | Whether it's identified (an unidentified one shows as "?"). Settable. |
| `Data(key)`, `SetData(key, value)` | A value of its own: the game's (`"Duration"`, `"quality"`...) or a mod's. Name a mod's keys for the mod (`"mymod:kills"`). |

Every `Add` takes a `setup` that sets an item's values as it's made: `Inventory.Add("wine", setup: wine => wine.SetData("mymod:gift", true))`.

## Containers

`Containers` are the chests, barrels, tombs and the like in the world, and the player's bags (a backpack, a casket, a quiver). A container holds its items three ways, as the game keeps them:

- **Never opened** (a container in the world): nothing yet. Its loot is rolled as it's first opened, from a seed of its place, from its [loot table](loot-tables.md). `HasBeenOpened` tells.
- **Open:** a window whose items are ordinary item slots, as the inventory's are: an `OpenContainer`.
- **Closed:** saved in it, one entry an item, in the game's own save format (`ContentsJson`).

`Containers.AddItem` and `RemoveItem` work in all three:

```csharp
// A bottle of wine in the chest, open or closed.
Containers.AddItem(chest, "wine");
Containers.AddItem<MyBlade>(chest, setup: blade => blade.Durability = 50);
int taken = Containers.RemoveItem(chest, "wine", 1);
```

An item put in a closed one is saved in it as the game's save does, and goes in its first free cell as it opens. A never-opened one stays unopened: its loot is rolled as it's first opened, and the item joins it then.

| `Containers` | |
|---|---|
| `Open()` | The containers open now, each an `OpenContainer`. |
| `IsOpen(container)`, `HasBeenOpened(container)` | Whether one is open now; whether one in the world has been opened (a bag: always). |
| `AddItem(container, name, stack, quality, setup)` | Puts an item in, open or closed. False if there's no such item, it isn't a container, or an open one has no room (the game drops it on the ground then). |
| `AddItem<T>(container, ...)`, `AddItem(container, consumable, ...)` | A mod's weapon, armour or consumable. |
| `RemoveItem(container, name, count)`, `RemoveItem<T>`, `RemoveItem(container, consumable, count)` | Takes up to `count` out, open or closed: how many were taken. |
| `ContentsJson(container)` | A closed one's items as JSON, in the game's save format (for one never opened: the items waiting to join its loot). `null` if it's open. |
| `SetContents(container, json)` | Makes a closed one's items these, as the game's own save of it does. A never-opened one counts as opened then: its loot is these, not rolled. |
| `LootTableOf(container)`, `SetLootTable(container, key, tier)` | The loot table one rolls from as it's first opened (see [Loot tables](loot-tables.md)). |

| `OpenContainer` | |
|---|---|
| `Window`, `Container` | Its window (`o_container`, or `o_container_inventory` for a bag); what it's the window of. |
| `Items()` | The items in it now. |
| `Add(name, ...)`, `Add<T>(...)`, `Add(consumable, ...)` | Puts an item in its first free cell: the item, or `null` if there's no room (the game drops it on the ground then). |
| `Remove(item)`, `Remove(name, count)`, `Remove<T>(count)`, `Remove(consumable, count)` | Takes items out. |
| `IsOpen` | Whether it's still open. |

### Container events

```csharp
Containers.OnOpened(context, open => context.Log($"{open.Items().Count} items inside"));
Containers.OnClosed(context, chest => context.Log($"Closed: {Containers.ContentsJson(chest)}"));
Containers.OnItemAdded(context, (open, item) => context.Log($"Put {item.Name} in"));
```

| | |
|---|---|
| `OnOpened(context, open => ...)` | A container has been opened: on the next frame, its items in its window (a chest's first time: its loot rolled). |
| `OnClosed(context, container => ...)` | A container has been closed: its items are saved in it now. |
| `OnItemAdded(context, (open, item) => ...)` | An item comes into an open container, put in by the player. Not the items it opens with. |
| `OnItemRemoved(context, (open, item) => ...)` | An item leaves an open container: taken, or used up. Not its items as it closes. |
