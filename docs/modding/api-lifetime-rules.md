# API lifetime rules

## Context content APIs

Prefer `context.Items.Add(item)`, `context.Buffs.Add(buff)` and `context.Skills.Add(skill)` in `Load(ModContext context)`. The owning context is supplied automatically. Use `context.Items.Give(item)` and `context.Buffs.Apply(buff, target, turns)` for operations. Inside item, consumable, buff and skill subclasses, use the inherited `Context` property, for example `Context.Buffs.Apply(buff, target, 3)`.

This allows your mod to use namespaces such as `MyMod.Items`, `MyMod.Buffs` and `MyMod.Skills` without qualifying the StoneForge static classes. The old static APIs continue working. Registration, duplicate checks and unload cleanup share their existing implementations; content keys remain game-wide and must still be unique. Item queries and buff operations are not restricted to content owned by the context.

## Instances, handles and assets

- Store room instances as `Instance` or call `Persist()` for an explicitly ID-only reference. Check `Exists` before use; IDs are identities in the running game, not save-file identities.
- An `Instance` handed to a callback is good for that callback; keep one longer with `Persist()`. A struct read through `Instance` (not as a `GmStruct`) is the same. Arrays and structs held as `GmArray` / `GmStruct` are kept alive for the game's garbage collector until they're disposed or C# stops referring to them (see [Values](../gml/values.md)).
- Native function failures raise `GameCallException`. Missing variable reads still return `Undefined`. Native engine crashes or GML failures that bypass the bridge's status return are not converted into recoverable managed exceptions.
- Load sprites and sounds through `ModContext` for ownership tracking. Do not manually delete an owned sprite/stream: the loader needs its ID for retirement and cleanup.
- A paused mod keeps imported sprites alive until unload. Its registered callbacks stop, and its windows close on the next frame. Resetting failure state/reloading is explicit.
