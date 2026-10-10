# Bug reports

The Esc menu has a **Report a bug** form, for StoneForge itself and for any C# mod that asks for reports.

## Reporting a bug

Open the Esc menu in a game and choose **Report a bug**. Pick StoneForge or a mod, then write a title (5 to 120 characters) and a description of what happened, what you expected and how to make it happen again (20 to 4000 characters; several lines, with paste, selection and scrolling). You can include the last StoneForge console messages: up to 50 lines, 512 characters each, 8 KiB in all.

The report goes to the project's GitHub repository through the BugDrop service, with StoneForge's and the mod's versions, Windows' version, the game's language and the window size. Screenshots and attachments aren't sent. If sending fails, your draft is kept. If StoneForge can't tell whether a report arrived, check the repository's issues before sending it again.

To keep reports from becoming spam, StoneForge limits how often you can send:

- one report at a time, and 10 minutes between them;
- 3 an hour and 10 a day;
- the same title and description to the same project only once a day. A report the service turned down (an HTTP error such as 404) can be sent again after the 10 minutes, once corrected.

Failed attempts count too, and nothing is retried automatically. The limits are kept in `dotnet\report-limits.json` as hashes and times: your report's text isn't saved there.

## Taking reports for your mod

Add your mod's GitHub repository to its `mod.json`:

```json
"github": "YourAccount/YourMod"
```

A URL such as `https://github.com/YourAccount/YourMod` works too. The form then lists your mod while it's running.

StoneForge only checks how the repository is written. For reports to arrive, the repository must exist and be set up to receive them through BugDrop.

To install BugDrop into your repository add it through the GitHub marketplace here (It is free) https://github.com/marketplace/bugdrop-in-app-feedback-to-github-issues
