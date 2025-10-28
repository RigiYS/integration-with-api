# Patch node_modules CMakeLists to link c++_shared where needed
# Creates .bak backups for each modified file (safe to revert)

$root = Resolve-Path .\
Write-Host "Patching CMakeLists.txt under $root..."

$found = 0
Get-ChildItem -Path .\node_modules -Recurse -Filter CMakeLists.txt -ErrorAction SilentlyContinue |
ForEach-Object {
  $file = $_.FullName
  try {
    $text = Get-Content -Raw -Path $file -ErrorAction Stop
  } catch {
    Write-Warning "Failed to read $file"
    return
  }

  # If file already contains an explicit reference to c++_shared anywhere, skip
  if ($text -match 'c\+\+_shared') {
    Write-Host "Skipping (already references c++_shared): $file"
    return
  }

  # Find a SHARED add_library target
  $addLibraryRegex = [regex]'add_library\s*\(\s*([^\s\)]+)\s+SHARED'
  $m = $addLibraryRegex.Match($text)
  if (-not $m.Success) {
    Write-Host "No SHARED add_library found in: $file"
    return
  }

  $target = $m.Groups[1].Value

  # Determine whether the file uses the keyword or plain signature for the first target_link_libraries occurrence
  $tlRegex = [regex]("target_link_libraries\s*\(\s*" + [regex]::Escape($target) + "\s+([^\)]*)\)")
  $form = 'plain'
  $mTL = $tlRegex.Matches($text)
  if ($mTL.Count -gt 0) {
    $firstArgs = $mTL[0].Groups[1].Value.Trim()
    if ($firstArgs -match '^(PUBLIC|PRIVATE|INTERFACE)\b') { $form = 'keyword' } else { $form = 'plain' }
  }

  # Backup original file (create if not exists)
  $bak = "$file.bak"
  if (-not (Test-Path $bak)) {
    Copy-Item -LiteralPath $file -Destination $bak -ErrorAction SilentlyContinue
  }

  # Build snippet in the same style as existing usage (plain vs keyword)
  if ($form -eq 'plain') {
    $snippetBody = "if (TARGET $target)`n  target_link_libraries($target c++_shared)`nendif()`n"
  } else {
    $snippetBody = "if (TARGET $target)`n  target_link_libraries($target PUBLIC c++_shared)`nendif()`n"
  }

  $snippet = "# --- added by patch: ensure this module links the shared C++ runtime so STL symbols resolve ---`n$snippetBody# --- end patch ---`n"

  # If we previously added a patch block, replace it; otherwise append
  $patchBlockRegex = [regex]'# --- added by patch: ensure this module links the shared C\+\+ runtime[\s\S]*?# --- end patch ---\s*'
  if ($text -match $patchBlockRegex) {
    # Remove previous block and append new consistent snippet
    $text = $text -replace $patchBlockRegex, ''
    $text = $text + "`n" + $snippet
    Set-Content -LiteralPath $file -Value $text -Force
    Write-Host "Replaced previous patch block in: $file (target: $target, form: $form) -- backup: $bak"
    $found++
  } else {
    Add-Content -LiteralPath $file -Value "`n" + $snippet
    Write-Host "Patched: $file (target: $target, form: $form) -- backup: $bak"
    $found++
  }
}

if ($found -eq 0) {
  Write-Host "No files patched. Either no CMakeLists.txt with SHARED targets were found, or files already referenced c++_shared."
} else {
  Write-Host "Patched $found files under node_modules. Backups saved as .bak next to each file."
}

Write-Host "Done. Now run a clean build: gradlew.bat clean assembleDebug --info (from android/)"
