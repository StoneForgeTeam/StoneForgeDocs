# Custom quests and contracts

A mod can add quests of its own, and dungeon contracts built on the game's. Their progress is saved in the game's own quest and contract records.

Register them in `Load`. That doesn't start a quest or offer a contract: StoneForge waits for the game's data to be there.

## Quests

```csharp
var definition = new QuestDefinition("bounty", "A local bounty", "Defeat three enemies")
{
    TitleKey = "quests.bounty.title",
    DescriptionKey = "quests.bounty.description",
    RewardCrowns = 100,
    RewardExperience = 50,
    DeadlineHours = 24,
    Objectives =
    {
        new QuestObjective("hunt", "Defeat enemies", 3) { TextKey = "quests.bounty.hunt" }
    }
};
CustomQuest bounty = context.Quests.Add(definition);

// Start it from a dialogue, a menu or an event, once a game is loaded.
bounty.Start();

Units.OnDied(context, (unit, killer) =>
{
    if (bounty.IsStarted && Units.IsPlayer(killer))
        bounty.Advance("hunt");
});
```

The quest's ID is `context.ContentId("bounty")`, such as `mymod:bounty`. The [`Quests` events](player.md#quests) see it start, progress, complete and fail like any other.

| `QuestDefinition` | |
|---|---|
| `Key`, `Title`, `Description` | Given to the constructor. |
| `TitleKey`, `DescriptionKey` | Keys in the mod's [localization](../core/localization.md) catalog, used in place of the text. |
| `Objectives` | Its `QuestObjective`s: a key, text, a target count, and optionally a `TextKey` and a world-map `Location`. |
| `RewardCrowns`, `RewardExperience`, `OnReward` | What it gives on completion: once for each saved quest. |
| `DeadlineHours` | Game hours from `Start` before it fails. |
| `AutoComplete` | Complete when the last objective is done (default true). Set false for a conversation to confirm it. |

| `CustomQuest` | |
|---|---|
| `Start()`, `Complete()`, `Fail()` | Start it; complete it (only once every objective is done); fail it, in the journal as normal. |
| `Advance(objective, amount)`, `SetProgress(objective, count)`, `Progress(objective)` | Its counters: never below zero, and never past their target. |
| `IsStarted`, `IsCompleted`, `IsFailed`, `RewardClaimed`, `IsAvailable` | Where it is. |
| `ClaimReward()` | Gives the reward, if it hasn't been. |
| `Id`, `Data` | Its ID; its saved record. |

- An unknown objective key throws, and a finished or failed quest can't advance.
- Keep quest and objective keys the same from one version of your mod to the next.
- A deadline counts game time from `Start`. It's checked each frame, including just after a save loads.
- **Rewards are paid once.** With no player, a reward waits for a later frame. The claim is saved before `OnReward` runs, so a callback that fails won't run again: check what it needs before giving items.

## Contracts

A contract is built on one of the game's, its **template**, such as `bastion_Clearing`. The template keeps the game's dungeon and settlement machinery: the dungeon's faction, its generation, which settlements offer it, its boss, and the game's reward and reputation rules.

```csharp
var definition = new ContractDefinition("brigand_job", "bastion_Clearing",
    "A tougher assignment", "Defeat three enemies in the assigned dungeon")
{
    TitleKey = "contracts.brigand_job.title",
    DescriptionKey = "contracts.brigand_job.description",
    RewardCrowns = 250,
    DeadlineHours = 72,
    Objectives = { new QuestObjective("hunt", "Defeat enemies", 3) }
};
CustomContractType job = context.Contracts.Add(definition);
```

| `ContractDefinition` | |
|---|---|
| `Key`, `BasedOn`, `Title`, `Description` | Given to the constructor: `BasedOn` is the template. |
| `RewardCrowns` | The base reward: the dungeon's tier and the game's other modifiers still apply. |
| `Settlement`, `Faction`, `ReputationReward`, `DeadlineHours`, `ExpirationHours` | Override the template's. |
| `GenerateNaturally` | Offered among the game's own contracts (default true). New ones appear as the game next generates contracts. |
| `Objectives` | None: the template's own objectives and tracking. Some: the mod's counters in place of the middle ones. |
| `TravelText`, `ReturnText` (and their `...Key`s) | The journal's "go to the dungeon" and "claim the reward" lines. |
| `OnGenerated`, `OnReward` | A contract of this type was made; one was turned in (and can give extra items). |

`job.Create(dungeonCell)` makes one for a dungeon without a contract (a world-map `Cell`), whether or not it's generated naturally. Pick a dungeon the template suits: this doesn't make dungeons.

With objectives of its own, the player still enters the dungeon and returns for payment, and the mod counts its objectives. Track your events and call `Advance` or `SetProgress` on a taken contract from `job.Instances`, scoped to the assigned dungeon where that matters. Entering the dungeon and finishing every objective come before turn-in.

| `CustomContract` | |
|---|---|
| `Accept()`, `ClaimReward()`, `Fail()` | Through the game's own contract scripts. Turning it in to the NPC works too. |
| `Advance`, `SetProgress`, `Progress` | Its objectives, as a quest's. |
| `IsTaken`, `IsReady`, `IsCompleted`, `IsFailed` | Where it is. |
| `Id`, `Index`, `Data` | Its ID, its place in the game's contracts, its record. |

The game's own deadlines, journal entries, reputation and settlement consequences all still apply.

## Translations, saves and switching mods off

- **Text keys.** `TitleKey`, `DescriptionKey` and objectives' `TextKey` come from the mod's [localization](../core/localization.md) catalog. The journal shows the current translation, and refreshes when it changes. Contract text can use the game's `%dungeon_name%` and `%village_name%` placeholders: keep them in translations.
- **Registering again** picks up the saved state, reward claims included. It doesn't restart a quest or regenerate a contract.
- **Switching the mod off** removes its callbacks and stops new contracts of its types. Saved records keep their text and template, so the game can still run their deadlines and turn-ins. The mod's own objectives stop counting until it's back.

These add quests and dungeon contracts. New settlements, dungeon layouts and notice-board jobs aren't covered. To offer them through NPCs, see [NPC dialogues](../ui/npc-dialogues.md). The [Example Mod](https://github.com/StoneForgeTeam/ExampleMod)'s `ExampleNpcJobs.cs` has three Osbrook jobs offered by NPCs, with saved employers, partial deliveries and tracked kills.
