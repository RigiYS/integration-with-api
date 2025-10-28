$base = 'C:\Integration-with-api---sesion-6-main\node_modules\react-native-worklets\android\build\intermediates'
$srcRoot = Join-Path $base 'cxx\Debug\5h3w2452\obj'
$dstRoot = Join-Path $base 'merged_jni_libs\debug\lib'
$abis = @('armeabi-v7a','arm64-v8a','x86','x86_64')
foreach($abi in $abis) {
    $src = Join-Path $srcRoot ($abi + '\\libworklets.so')
    $dstDir = Join-Path $dstRoot $abi
    New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
    if (Test-Path $src) {
        Copy-Item -Force $src -Destination (Join-Path $dstDir 'libworklets.so')
        Write-Host "Copied $src to $dstDir"
    } else {
        Write-Host "Missing $src"
    }
}
