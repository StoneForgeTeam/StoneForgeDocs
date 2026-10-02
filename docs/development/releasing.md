# Releasing

Pushing a version tag such as `v0.2.0` to the StoneForge repository runs the [Release workflow](https://github.com/StoneForgeTeam/StoneForge/blob/main/.github/workflows/release.yml). It:

1. checks the tag matches `Version` in `Directory.Build.props`,
2. builds and packages StoneForge with `build\Package.ps1`,
3. runs `StoneForge.Tests` and `StoneForge.Patcher.Tests`,
4. publishes a GitHub release named `StoneForge <version>` with `StoneForge-<version>.zip` attached. The release notes come from that version's section of `CHANGELOG.md`.

A version with a suffix, such as `0.2.0-beta.1`, is published as a pre-release.

## Making a release

1. Set `<Version>` in `Directory.Build.props` to the new version.
2. Add a section to `CHANGELOG.md` headed `## <version>`, for example `## 0.2.0 — Skill trees`. Everything under it, up to the next `## ` heading, becomes the release notes.
3. Merge those changes to `main`.
4. Tag that commit and push the tag:

   ```powershell
   git tag v0.2.0
   git push origin v0.2.0
   ```

Follow the run under the repository's **Actions** tab. If it fails, fix the problem and use **Re-run jobs**. If the fix needed a new commit, delete the tag (`git push origin :refs/tags/v0.2.0`) and tag the new commit.

## The release runner

StoneForge.API is generated from Stoneshard's own game data, and that data can't be put on GitHub's hosted runners. Releases are therefore built on a **self-hosted runner**: a Windows PC of yours that GitHub sends the release job to. The job only runs while the runner is online.

### What the machine needs

* Stoneshard from Steam, on the **VM modbranch**, with **StoneForge installed**. The integration tests need StoneForge's preserved unpatched data, `dotnet\data_base.win`. A release fails if that data is missing, rather than skipping the tests.
* Visual Studio with MSBuild and the C++ tools for toolset `v145`.
* The .NET 10 SDK.
* Git.

These are the same tools as a normal development build; see [Building and testing](building-and-testing.md).

### Registering the runner

1. On GitHub, open the StoneForge repository's **Settings → Actions → Runners** and choose **New self-hosted runner**, then **Windows** and **x64**.
2. Follow the commands GitHub shows to download the runner and run `config.cmd`. When it asks for extra labels, enter `stoneshard`. The workflow only runs on a runner with the labels `self-hosted`, `windows` and `stoneshard`.
3. Let PowerShell run the workflow's scripts. In an administrator PowerShell, run:

   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope LocalMachine
   ```

4. Start the runner with `run.cmd`, or install it as a Windows service when `config.cmd` offers to.

{% hint style="warning" %}
A runner installed as a **service** runs as a different Windows account, which can't see your user's Steam settings. Unless Stoneshard is in Steam's default folder (`C:\Program Files (x86)\Steam`), set these as **system** environment variables, then restart the service:

* `STONESHARD_DIR`: the game folder, for example `D:\SteamLibrary\steamapps\common\Stoneshard`.
* `STONEFORGE_TEST_DATA`: the unpatched data, for example `D:\SteamLibrary\steamapps\common\Stoneshard\dotnet\data_base.win`.

Running `run.cmd` from your own account avoids this.
{% endhint %}

### Keeping the runner safe

A self-hosted runner runs workflow code on your PC. On a public repository, a pull request from a fork can change workflow files, including making them run on your runner.

* In **Settings → Actions → General → Fork pull request workflows**, require approval for all external contributors. Never approve a run for a pull request that changes `.github/workflows/` unless you've read the change.
* Only the Release workflow targets the `stoneshard` label. Keep other workflows on GitHub's hosted runners.
* Use the runner machine for building, not for anything that holds secrets you couldn't afford to lose.
