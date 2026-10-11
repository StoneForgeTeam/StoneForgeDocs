# Save backups

StoneForge keeps backups of your saves, whatever mods you play with (since 0.9.4). Before the game writes a save over an older one, or deletes one (its oldest, to make room, or one you delete in the save menu), StoneForge copies it first. A mod's bug, an error box or a crash in the middle of saving can't take your last good save with it.

| | |
|---|---|
| Your saves | `%LOCALAPPDATA%\StoneShard\characters_v1\<character>\<save>` |
| The backups | `%LOCALAPPDATA%\StoneShard\StoneForge\save-backups\<character>\<time>_<save>` |

The newest 20 of each character's backups are kept. They're outside the game's save folder, so neither its save menu nor Steam Cloud sees them. A backup that fails is only logged: it never stops the game saving.

## After a mod's error

The first time any mod's handler throws in a game, StoneForge:

1. keeps the save you're playing (the last one made before the error) as a `before-error_...` backup, which is never deleted with the others;
2. asks whether to leave to the main menu **without saving**. The game may be in a bad state now, and saving would keep it.

It asks once a game.

## Restoring a backup

1. Close the game.
2. Copy the backup's folder into its character's folder in `characters_v1`.
3. Rename it to the save's own name (drop the time from the front: `autosave_1`, say), replacing the save that went wrong.

For mods: `SaveBackups.Keep(label)` keeps a copy of the save being played that's never deleted. See [Rooms and saves](../world/rooms-and-saves.md#save-backups).
