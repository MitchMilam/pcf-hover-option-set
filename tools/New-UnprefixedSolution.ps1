<#
.SYNOPSIS
    Rewrites a packaged solution zip so the control is named without the
    publisher prefix.

.DESCRIPTION
    Current PCF tooling names a control <prefix>_<namespace>.<constructor>, so
    this repo packages subtil_nunosubtil.PCFHoverOptionSet. The original
    publisher's release was built with older tooling that did not prepend the
    prefix, and environments that installed it hold the control as the bare
    nunosubtil.PCFHoverOptionSet. Importing the prefixed build alongside it
    fails with 0x80160000, "already created by another publisher".

    The bare name cannot be produced by the packager: it always writes
    <prefix>_, and an empty CustomizationPrefix is rejected on import because
    the prefix must be 2 to 8 characters. So the rename has to happen after
    packaging.

    Only the control component name is touched, in the four places it appears:
    the Controls folder, customizations.xml (twice), solution.xml and
    [Content_Types].xml. The solution manifest is left alone, so the publisher
    and its prefix stay exactly as the packager wrote them.

    Bytes outside the name are copied through untouched, so byte-order marks
    and line endings survive the rewrite.

.PARAMETER ZipPath
    The packaged solution zip to read. Not modified.

.PARAMETER Prefix
    The publisher prefix to strip. Defaults to the repo's own, 'subtil'.

.PARAMETER OutputPath
    Where to write the rewritten zip. Defaults to the input name with
    '_unprefixed' appended.

.EXAMPLE
    .\tools\New-UnprefixedSolution.ps1 `
        -ZipPath HoverOptionSetSolution\bin\Release\HoverOptionSetSolution_1.1.6.0_managed.zip
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $ZipPath,

    [string] $Prefix = 'subtil',

    [string] $OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$ZipPath = (Resolve-Path -LiteralPath $ZipPath).Path

if (-not $OutputPath) {
    $dir  = Split-Path -Parent $ZipPath
    $name = [System.IO.Path]::GetFileNameWithoutExtension($ZipPath)
    $OutputPath = Join-Path $dir "${name}_unprefixed.zip"
}

$work = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())

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

    # Latin1 maps every byte to exactly one char and back, so the replace only
    # touches the ASCII name and leaves all other bytes, BOM included, intact.
    $latin1 = [System.Text.Encoding]::GetEncoding(28591)

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
