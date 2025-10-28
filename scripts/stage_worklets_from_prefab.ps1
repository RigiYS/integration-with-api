<#
Copies libworklets.so from the prefab package produced under
node_modules/react-native-worklets/android/build/intermediates/prefab_package/debug/prefab
into the merged_jni_libs path that react-native-reanimated's CMake expects:

  node_modules/react-native-worklets/android/build/intermediates/merged_jni_libs/debug/lib/<ABI>/libworklets.so

This is a safe, local staging helper for developer builds.
#>

param(
    [string[]]$Abis = @('arm64-v8a','armeabi-v7a','x86','x86_64'),
    [string]$BuildType = 'debug'
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')

$prefabBase = Join-Path $repoRoot 'node_modules\react-native-worklets\android\build\intermediates\prefab_package\debug\prefab\modules\worklets\libs'
$destBase = Join-Path $repoRoot "node_modules\react-native-worklets\android\build\intermediates\merged_jni_libs\$BuildType\lib"

$found = $false
foreach ($abi in $Abis) {
    $srcDir = Join-Path $prefabBase "android.$abi"
    $srcFile = Join-Path $srcDir 'libworklets.so'
    if (Test-Path $srcFile) {
        $destDir = Join-Path $destBase $abi
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        }
        $destFile = Join-Path $destDir 'libworklets.so'
        Copy-Item -Force -Path $srcFile -Destination $destFile
        Write-Output "Staged: $srcFile -> $destFile"
        $found = $true
    }
    else {
        Write-Output ("Source missing for ABI {0}: {1}" -f $abi, $srcFile)
    }
}

if (-not $found) {
    Write-Output 'No libworklets.so files were found in the prefab package. You may need to build react-native-worklets or run a Gradle task that produces the prefab artifacts first.'
    exit 0
}

Write-Output 'Staging complete.'
