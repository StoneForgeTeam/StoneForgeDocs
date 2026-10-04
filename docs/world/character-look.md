# Character looks

`CharacterLook` is a character's appearance as the game composites the player's sprite: its layers - body, head, hair, each piece of equipment worn - each a sprite drawn at an offset, clipped and masked. Read the player's, carry it elsewhere as JSON (sprite ids are the same in every game from the same game data), and build another character's sprites from it with the game's own compositor: a companion, a mannequin, another player.

```csharp
CharacterLook? look = CharacterLook.OfPlayer();
string json = look?.ToJson() ?? "";
// elsewhere, perhaps another game:
CharacterLook? same = CharacterLook.FromJson(json);
```

## Building sprites

`Build()` draws to surfaces, so call it in a Draw event. The sprites are yours: `Dispose` them when done.

```csharp
private CharacterLook? _look;
private CharacterSprites? _twin;

public void Load(ModContext context)
{
    // Draw a twin a tile to the player's right, in the player's own Draw event.
    context.OnCode("gml_Object_o_player_Draw_0", after: (player, _) =>
    {
        if (_look == null)
            return;
        _twin ??= _look.Build();
        if (_twin == null)
            return;
        Game.CallBuiltin("draw_sprite_ext", _twin.For(0, false), player["image_index"], player["x"].AsReal + 26, player["y"],
            player["image_xscale"], player["image_yscale"], 0, Draw.White, 1);
    });
}

private void ToggleTwin()
{
    _twin?.Dispose();
    _twin = null;
    _look = _look == null ? CharacterLook.OfPlayer() : null;
}
```

| `CharacterLook` | |
|---|---|
| `OfPlayer()` | The player's look (`null` before there's a character). |
| `ToJson()`, `FromJson(json)` | To keep or send. |
| `Build()` | A character's sprites made from it (`null` if it can't). |
| `Layers` | Its layers (`LookLayer`: `Sprite`, `Frame`, `Mask`, and the compositor's values). |
| `FramesX`, `FramesY`, `Body`, `Ground` | Its frame grid; its body and ground sprites. |

| `CharacterSprites` | |
|---|---|
| `Normal`, `Blinking`, `FlashNegative`, `FlashPositive`, `Mask`, `All` | The five sprites the game draws a character with. |
| `For(flash, blinking)` | The one to draw now, as the player picks its own: by its hit flash, then blinking. |
| `Dispose()`, `IsDisposed` | Delete them. |
