# NPC dialogues

`context.Dialogues` adds branching conversations to Stoneshard's own dialogue window: its portraits, history, text paging and response buttons. A conversation can open on its own, or as a topic in an NPC's normal Talk menu that returns to the NPC's own topics when it's done.

## A conversation

```csharp
var saved = SaveData.ModData(context);
var dialogue = context.Dialogues.Add(new DialogueDefinition("smith_work", "offer")
{
    Nodes =
    {
        new DialogueNode("offer", "Could you help me?")
        {
            TextKey = "smith.offer",
            Choices =
            {
                new DialogueChoice("accept", "I'll help.", "thanks")
                {
                    TextKey = "smith.accept",
                    EnabledWhen = _ => !saved["accepted_help"].AsBool,
                    OnSelected = _ => saved["accepted_help"] = true
                },
                new DialogueChoice("decline", "Not now.") { TextKey = "smith.decline" }
            }
        },
        new DialogueNode("thanks", "Thank you. Come back when you're done.")
        {
            TextKey = "smith.thanks",
            Choices = { new DialogueChoice("leave", "Goodbye.") { TextKey = "smith.leave" } }
        }
    }
});

// A topic in the smith's Talk menu.
dialogue.AddTopic(npc => npc.Get("id_name").AsString == "osbrook_smith",
    _ => context.Localization.Get("smith.topic"));
```

A conversation is a set of **nodes** (what the NPC says), each with **choices** (the player's responses). A choice goes to its `NextNode`, or ends the conversation if it has none.

| `DialogueDefinition` | |
|---|---|
| `Key`, `StartNode` | Given to the constructor. Its ID is the mod's: `mymod:smith_work`. |
| `Nodes` | Its nodes: up to 128, each with up to 32 choices. Loops are fine. |
| `MaximumDistance` | How far the speaker can be: two cells by default; `null` for no limit. |
| `OnClosed` | Runs once as it closes, with why (`DialogueCloseReason`: `Completed`, `Cancelled`, `SpeakerUnavailable`, `RoomChanged`, `ModUnloaded`, `CallbackFailed`). Not when the mod unloads. |

| `DialogueNode` | |
|---|---|
| `Key`, `Text` | Given to the constructor. |
| `TextKey`, `TextProvider`, `TextArguments` | Its text from the mod's [localization](../core/localization.md) catalog; computed; or with live values in a template (see below). |
| `Choices` | Its responses. |
| `OnEnter` | Runs once each time the conversation goes to it. |

| `DialogueChoice` | |
|---|---|
| `Key`, `Text`, `NextNode` | Given to the constructor. |
| `TextKey`, `TextProvider`, `TextArguments` | As a node's. |
| `VisibleWhen`, `EnabledWhen` | Hide it; grey it out. |
| `OnSelected` | Runs once each time it's chosen. |

The definition is checked as it's registered. Duplicate keys, a missing start node or an unknown `NextNode` are refused. Its lists are copied then, so changing them later changes nothing.

### Opening it

| `RegisteredDialogue` | |
|---|---|
| `Start(npc, node)` | Opens it with an NPC, at its start node or another. The conversation; `null` if a window or conversation is already open, there's no player or speaker, or the speaker is too far. |
| `AddTopic(appliesTo, text, startNode)` | A topic in the Talk menu of every NPC `appliesTo` matches. `startNode` picks where it starts, by NPC. |
| `AddTopic(appliesTo, text, position, startNode)` | The same, in a slot of the menu (from 1). Past the last, it goes at the end. |

Choosing the topic opens the conversation in the same window. Finishing or closing it goes back to the NPC's own topics. Match NPCs by their `id_name`: their instance IDs change from room to room and save to save.

### The open conversation

| `DialogueConversation` | |
|---|---|
| `Speaker`, `SpeakerName`, `NodeKey`, `Text`, `Responses` | Who, where, what's shown. |
| `GoTo(node)`, `Choose(key)`, `Close()` | Go to a node; choose an available response; cancel. |
| `Refresh()` | Re-reads text and conditions. |
| `State` | Values for this conversation only. |
| `IsOpen`, `CloseReason` | Whether it's open; why it closed. |

`Dialogues.Active` is the open conversation, if any.

- **Conditions are checked again on selection**, so an old button can't get round a change.
- **Actions run once** for each successful choice, and `OnEnter` once for each visit. A choice's callback that calls `GoTo` or `Close` overrides its `NextNode`.
- **Keep text and conditions free of side effects.** They're refreshed while the window is open, so they can run many times. Do quest progress, hand-ins and rewards in `OnSelected`.
- **It closes** when the speaker disappears or walks out of range, the room changes, or the mod unloads. A callback that fails closes it too, and the failure is the mod's.
- **Nothing is saved.** A conversation isn't resumed after loading. Keep outcomes in [quests](../world/quests-and-contracts.md) or [ModData](../core/mod-context.md#values-of-your-own-moddata), and open the right node from them.

### Live values in translated text

`TextArguments` fills a template's placeholders, so the template stays editable and translatable:

```csharp
new DialogueNode("report", "How is the job going?")
{
    TextKey = "smith.progress",   // "Delivered {0}/{1} supplies."
    TextArguments = conversation => new object?[] { saved["help_progress"].AsInt, 3 }
};
```

`TextProvider` replaces the key and the text altogether.

## Actions and conditions by name

Methods marked `[DialogOption]` and `[DialogCondition]` can be attached to any response, the game's own included, from the [in-game editor](#the-in-game-dialogue-editor). They register as the mod loads, as `modid:key`.

```csharp
[DialogOption("work")]
public static void Work(DialogOptionContext dialogue)
{
    dialogue.Mod.Log("Selected " + dialogue.Id);
}

[DialogCondition("can_afford")]
public static DialogConditionResult CanAfford(DialogOptionContext dialogue)
    => Game.CallScript("scr_gold_count", dialogue.Player, false, true).AsInt >= 100
        ? DialogConditionResult.Enabled
        : DialogConditionResult.Visible;
```

- **Actions** are `static void` methods with a `DialogOptionContext`, or with no parameters. They run when the player picks the response; editing and refreshing never run them. `TextKey` on the attribute gives a new response its label from the catalog.
- **Conditions** are `static` methods returning a `DialogConditionResult`: `Enabled` (can be chosen), `Visible` (shown greyed out) or `Hidden`. They're refreshed while the window is open, and checked again on selection. A missing method, an exception or a bad result shows the response greyed out.
- Instance, async and generic methods, and duplicate keys, are refused as the mod loads.
- Keep the keys the same between versions: a response whose action is missing is hidden.

| `DialogOptionContext` | |
|---|---|
| `Mod`, `Id` | The mod; the action's ID. |
| `Speaker`, `Player`, `Panel` | The NPC, the player, the dialogue window. |
| `Conversation` | The mod's conversation open in this window, if any. |
| `Open(dialogue, node)` | Opens a registered conversation in this window. |

On one of the game's responses, the action runs once the game has handled the click, and then the response's own action goes on, unless the action closed the window or removed the speaker.

### Built-in actions

| Action (`stoneforge:...`) | |
|---|---|
| `exit_dialogue` | Closes the dialogue window. |
| `return_topics` | Back to the NPC's own topics. |
| `finish_conversation`, `restart_conversation` | Finish the StoneForge conversation; start it again. |
| `refresh_dialogue` | Refresh the text and conditions. |
| `back`, `continue`, `next_page` | The game's own Back, Continue and next page. |
| `open_trade`, `ask_rumors`, `learn_skills`, `rent_room` | The NPC's own Trade, news, training and room responses, if it has them and they're available now: their costs and checks apply. |

## The in-game dialogue editor

Mods can change and add NPC lines in the game, and ship the result.

### Turning it on

The editor is for a mod's **contributors**: Steam accounts listed in its `mod.json`:

```json
"contributors": ["76561197960278073", "12345"]
```

Each is a string: a 32-bit Steam account ID, or a SteamID64 (the number in a Steam profile URL). The `author` field doesn't count. Reload the mod after changing the list.

Before going into a game, open **Mods**, choose the mod and click **Enable dev**. Only one mod can have it on at a time, and it's off at each start. Players without it still get the mod's saved edits.

`context.IsContributor` says whether the current Steam account is one of the mod's contributors (whether or not dev is on): use it for dev tools of your own, and check it again in their actions. `Steam.AccountId` is the current account.

### Editing

Talk to an NPC and right-click its text or a response:

| | |
|---|---|
| **Edit text** | Edit in place: **Enter** saves, **Escape** cancels. Arrows, Home/End, Shift to select and Ctrl+A/C/X/V work. |
| **Move up**, **Move down** | Reorder responses. |
| **Add above**, **Add below** | A new topic beside it, with a reply to write. |
| **Delete option**, **Restore deleted options** | Hide a response (or delete a new topic); bring them back. |
| **Restore original**, **Restore dialogue** | Undo one entry's edits; all of this mod's edits to this NPC. |
| **Trigger Code** | Attach an action (above), or add a new response that runs one. **Remove trigger** takes it off. |
| **Add condition**, **Remove condition** | Attach a condition. |

The **language** dropdown at the top right shows every line in another language, to edit its translation. It doesn't change the game's language. Missing translations fall back to the saved English, then the game's text.

**Ctrl+F8** opens the editing strip: **Add** a topic (its label, the NPC's reply and its place), **Apply** to see it, **Save**, **Reset**, **Done**. While editing, clicking a response selects it without running its trade, quest or other action.

In a mod's own conversation, the strip edits the current node's and responses' text and order. Type `\n` for a line break.

### Where edits go

| | |
|---|---|
| `Dialogue/npc_<id>.json` | Edits to an NPC's dialogue: text, translations, order, hidden responses, new topics, actions and conditions. By the NPC's `id_name`. |
| `Dialogue/<key>.editor.json` | Edits to one of the mod's own conversations. |

Both are in the mod's folder, with the previous version kept as `.bak`. They load with the mod (dev on or off) and stop applying when it's switched off: ship them with the mod.

- **Edits apply to what was shown.** An edit is for one language and the variant of the line that was showing: the game still picks lines by context (a first meeting, say), and other variants keep their text. Positions apply in every language.
- **Placeholders must stay valid.** Templates keep `{0}`, `{1}`: keep them for values that should stay live. Unknown or malformed placeholders are refused.
