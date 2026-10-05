# Third-party native binaries

{% hint style="info" %}
Paths and commands on this page are relative to a checkout of the [StoneForge repository](https://github.com/StoneForgeTeam/StoneForge).
{% endhint %}

Aurie (`AurieCore.dll`, `AuriePatcher.exe`) and YYToolkit (`YYToolkit.dll`) are prebuilt in `lib/Aurie` and `lib/YYToolkit`, so packaging needs nothing outside the repository. Each folder's README names the upstream commit, the SHA-256 of the binaries and the patch applied: Aurie's (`lib/Aurie/stoneforge.patch`) loads modules from `<game>\aurie`, and YYToolkit's (`lib/YYToolkit/stoneforge.patch`) stops its GML error hook from naming scripts (which faults on this GameMaker version and crashed the game on every GML error) and opens its console window only on request (see [Crash windows and reports](crash-reports.md)). Both are AGPL-3.0; releases include the licences, the patches and those notes under `LICENSES\`.

To rebuild them from source (needs git and Visual Studio's C++ tools; clones into `build\.thirdparty`):

```powershell
powershell -ExecutionPolicy Bypass -File build\BuildThirdParty.ps1
```

It prints the new checksums; update the READMEs with them. To move to a newer upstream version, change the commit in the script and check the patch still applies.
