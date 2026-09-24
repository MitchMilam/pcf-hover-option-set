<#
.SYNOPSIS
    Rewrites a packaged solution zip so the control is named without the
    publisher prefix, and stamps it with a distinct solution version.

.DESCRIPTION
    Current PCF tooling names a control <prefix>_<namespace>.<constructor>, so
    this repo packages subtil_nunosubtil.PCFHoverOptionSet. Some environments
    hold the control as the bare nunosubtil.PCFHoverOptionSet, installed from a
    zip that was assembled programmatically rather than by the packager.
    Importing the prefixed build over one of those fails with 0x80160000,
    "already created by another publisher", and the bare name cannot be produced
    by the packager: it always writes <prefix>_, and an empty
    CustomizationPrefix is rejected on import because the prefix must be 2 to 8
    characters. So the rename has to happen after packaging.

    Only the control component name is touched, in the four places it appears:
    the Controls folder, customizations.xml (twice), solution.xml and
    [Content_Types].xml. The publisher and its prefix are left exactly as the
    packager wrote them.

    The solution version's last octet is also incremented, so 1.1.6.0 becomes
    1.1.6.1. The two builds are otherwise identical in version, which makes them
    easy to confuse: they differ only in the control name, and Dataverse binds
    forms by name. With the stamp, an org running 1.1.6.1 is unambiguously on
    the unprefixed build, visible from the Solutions list without querying
    customcontrols.

    Bytes outside the name and version are copied through untouched, so
    byte-order marks and line endings survive the rewrite.

.PARAMETER ZipPath
    The packaged solution zip to read. Not modified.

.PARAMETER Prefix
    The publisher prefix to strip. Defaults to the repo's own, 'subtil'.

.PARAMETER SolutionVersion
    Overrides the stamped version. Defaults to the input's version with its last
    octet incremented.

.PARAMETER OutputPath
    Where to write the rewritten zip. Defaults to the input name with the new
    version substituted and '_unprefixed' appended.

.EXAMPLE
    .\tools\New-UnprefixedSolution.ps1 `
        -ZipPath HoverOptionSetSolution\bin\Release\HoverOptionSetSolution_1.1.6.0_managed.zip
    # -> HoverOptionSetSolution_1.1.6.1_managed_unprefixed.zip
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $ZipPath,

    [string] $Prefix = 'subtil',

    [string] $SolutionVersion,

    [string] $OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$ZipPath = (Resolve-Path -LiteralPath $ZipPath).Path

$work = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())

# Latin1 maps every byte to exactly one char and back, so replacements only
# touch the ASCII text and leave all other bytes, BOM included, intact.
$latin1 = [System.Text.Encoding]::GetEncoding(28591)

try {
    [System.IO.Compression.ZipFile]::ExtractToDirectory($ZipPath, $work)

    $controls = Join-Path $work 'Controls'
    if (-not (Test-Path -LiteralPath $controls)) {
        throw "No Controls folder in '$ZipPath'. Is this a PCF solution package?"
    }

    # Rename every control folder that carries the prefix. There is only one in
    # this solution, but the loop keeps the script honest if that changes.
    $renames = @()
    foreach ($folder in Get-ChildItem -LiteralPath $controls -Directory) {
        if (-not $folder.Name.StartsWith("${Prefix}_")) { continue }

        $bare = $folder.Name.Substring($Prefix.Length + 1)
        Rename-Item -LiteralPath $folder.FullName -NewName $bare
        Write-Host "  Controls/$($folder.Name) -> Controls/$bare"
        $renames += [pscustomobject]@{ From = $folder.Name; To = $bare }
    }

    if ($renames.Count -eq 0) {
        throw "No control folder under Controls/ starts with '${Prefix}_'. Nothing to rewrite."
    }

    # Work out the version to stamp, from the manifest the packager wrote.
    $solutionXmlPath = Join-Path $work 'solution.xml'
    $solutionXml = $latin1.GetString([System.IO.File]::ReadAllBytes($solutionXmlPath))

    $versionMatches = [regex]::Matches($solutionXml, '<Version>(?<v>[\d.]+)</Version>')
    if ($versionMatches.Count -ne 1) {
        throw "Expected exactly one <Version> in solution.xml, found $($versionMatches.Count)."
    }

    $oldVersion = $versionMatches[0].Groups['v'].Value

    if (-not $SolutionVersion) {
        $octets = $oldVersion.Split('.')
        if ($octets.Count -ne 4) {
            throw "Cannot increment version '$oldVersion': expected four octets."
        }
        $octets[3] = [string]([int]$octets[3] + 1)
        $SolutionVersion = $octets -join '.'
    }

    $solutionXml = $solutionXml.Replace(
        "<Version>$oldVersion</Version>", "<Version>$SolutionVersion</Version>")
    [System.IO.File]::WriteAllBytes($solutionXmlPath, $latin1.GetBytes($solutionXml))
    Write-Host "  version $oldVersion -> $SolutionVersion"

    foreach ($file in Get-ChildItem -LiteralPath $work -File) {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $text  = $latin1.GetString($bytes)
        $updated = $text

        # Replace the full control name rather than the bare prefix, so a
        # publisher prefix that happens to occur elsewhere is left alone.
        foreach ($rename in $renames) {
            $updated = $updated.Replace($rename.From, $rename.To)
        }

        if ($updated -eq $text) { continue }

        [System.IO.File]::WriteAllBytes($file.FullName, $latin1.GetBytes($updated))
        Write-Host "  rewrote $($file.Name)"
    }

    if (-not $OutputPath) {
        $dir  = Split-Path -Parent $ZipPath
        $name = [System.IO.Path]::GetFileNameWithoutExtension($ZipPath)
        $name = $name.Replace($oldVersion, $SolutionVersion)
        $OutputPath = Join-Path $dir "${name}_unprefixed.zip"
    }

    if (Test-Path -LiteralPath $OutputPath) {
        Remove-Item -LiteralPath $OutputPath -Force
    }

    [System.IO.Compression.ZipFile]::CreateFromDirectory($work, $OutputPath)
    Write-Host "Wrote $OutputPath"
}
finally {
    if (Test-Path -LiteralPath $work) {
        Remove-Item -LiteralPath $work -Recurse -Force
    }
}
