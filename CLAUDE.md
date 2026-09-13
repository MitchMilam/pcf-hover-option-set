# pcf-hover-option-set — working notes

PCF virtual control (React 16.8, TypeScript) that renders a choice column as a row of
hover-animated pills. Forked from nunosubtil/pcf-hover-option-set; this clone's `origin`
is the MitchMilam fork. Goal: land enhancements here, then open a PR upstream.

## Layout
- `HoverOptionSet/index.ts` — PCF wrapper (init/updateView/getOutputs). Reads value and
  option list from context on every updateView; returns explicit `null` to clear.
- `HoverOptionSet/HoverOptionSet.tsx` — React component (radiogroup of pills).
- `HoverOptionSet/colorUtils.ts` — hex normalise, WCAG contrast text, alpha tint.
- `HoverOptionSet/styles/styles.ts` — light/dark palette + style functions
  (`HOVER_SCALE`, edge gutter constants live here).
- `HoverOptionSet/ControlManifest.Input.xml` — inputs: `optionsetFieldControl` (bound),
  `allowClear`, `useOptionColors` (TwoOptions, default true).
- `HoverOptionSetSolution/` — cdsproj that packages the control into a solution.

## Build / package
```
npm install
npm run build                       # quick TS + lint check
dotnet build HoverOptionSetSolution\HoverOptionSetSolution.cdsproj -c Release
# -> HoverOptionSetSolution\bin\Release\HoverOptionSetSolution_managed.zip
#    plus HoverOptionSetSolution_<version>[_managed].zip (versioned copies)
```
Only zips from `dotnet build` go into Dataverse.

### The publisher prefix, and why kmicrocompdev needs an extra step
The packager names the control `<CustomizationPrefix>_<namespace>.<constructor>`, so a
normal build produces `subtil_nunosubtil.PCFHoverOptionSet`. There is no way to make it
emit the bare name: an empty `<CustomizationPrefix>` packages without complaint but the
*import* rejects it — the prefix must be 2 to 8 characters.

kmicrocompdev holds the control as `nunosubtil.PCFHoverOptionSet`, installed from a zip
that was built programmatically (by a Claude chat without tool access) rather than by
PAC, so it never picked up the prefix. Importing a normal build over it fails with
`0x80160000`, "Custom Control with name nunosubtil.PCFHoverOptionSet already created by
another publisher" — the publisher in the manifest is byte for byte the original's, so
the name is the only thing that differs. Deleting the control is not an option: it is
managed, and managed components only leave when their solution is uninstalled, which
would mean rebinding every form bound to the control.

So for that environment, build normally and then rename the control in the zip:
```
pwsh tools\New-UnprefixedSolution.ps1 -ZipPath HoverOptionSetSolution\bin\Release\HoverOptionSetSolution_1.1.6.0_managed.zip
# -> ..._managed_unprefixed.zip
```
It rewrites the Controls folder and the four references to the name, and leaves the
manifest, publisher and prefix exactly as the packager wrote them. Not wired into the
build, so a stock `dotnet build` is still a stock package.

Only environments already holding the bare-named control need this. An org with no
prior install takes the stock prefixed zip — confirmed on an org whose Account form
uses the control. Check before reaching for the script:
```
GET {org}/api/data/v9.2/customcontrols?$select=name&$filter=contains(name,'PCFHoverOptionSet')
```
A bare `nunosubtil.PCFHoverOptionSet` means the unprefixed zip; `subtil_...` or nothing
at all means the stock one.

Version bump on every rebuild that will be imported, in two places:
`version="x.y.z"` in ControlManifest.Input.xml and `<Version>x.y.z.0</Version>` in
`HoverOptionSetSolution/src/Other/Solution.xml`. Same version = import silently no-ops.

## Current state (13 Sep 2026)
Branch `feature/clear-and-option-colors`, control 1.1.6 / solution 1.1.6.0. Imported and
working in two orgs: kmicrocompdev via the unprefixed zip, and a second org via the stock
prefixed zip. Label alignment verified on a real form in both. Commits on top of upstream
main:

| | |
|---|---|
| `7fea212` | the original enhancements (was 6d90cbcc) |
| `5992d62` | label alignment: control now occupies a stock field's 32px box |
| `ec765ca` | versioned zip filenames |
| `a6a7093` + `fa362af` | empty-prefix attempt and its revert — a no-op pair |
| `c8e279b` | `tools/New-UnprefixedSolution.ps1` |

- Enhancements in the first commit: clear-on-reclick, option colors (fill when selected,
  tint on hover, auto-contrast text, no dot when unselected), keyboard-only focus ring,
  edge gutter so hover zoom doesn't clip, disabled dimming, value re-read from context,
  Fluent platform-library dependency removed (unused).
- The label alignment fix: the control was 44px tall with its pill text 22px from the top
  against 32px/16px for a stock field, so the platform's top-anchored label sat ~6px high.
  Pill height plus vertical gutters now sums to 32px. See `CHOICE_HEIGHT` in styles.ts.
- **History was rewritten** (to drop `commit-message.txt` from the first commit and reword
  it), so `origin/feature/clear-and-option-colors` is still at the old `6d90cbc`. The next
  push needs `--force-with-lease`. The stale GitHub credential may still bite: clear
  `git:https://github.com` in Windows Credential Manager, push again, sign in via browser.
- `commit-message.txt` is the intended PR text and is now excluded via
  `.git/info/exclude` — local only, so the exclusion does not travel with the repo.
- **Before opening the upstream PR**, drop the four packaging commits (`ec765ca`,
  `a6a7093`, `fa362af`, `c8e279b`) and ship just `7fea212` + `5992d62`. `commit-message.txt`
  covers both.

## Conventions
- Keep PRs focused and matching upstream style; no lock-file churn (skip `npm audit fix`).
- No author trailers or co-author lines in commits.
- Don't touch `.vs/`, `out/`, `node_modules/`, `HoverOptionSet/generated/` (all gitignored).
