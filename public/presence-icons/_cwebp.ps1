Get-ChildItem -Filter *.png | ForEach-Object {
    $input  = $_.FullName
    $output = Join-Path $_.DirectoryName ($_.BaseName + ".webp")

    Write-Host "Converting $($input) -> $($output)"

    & cwebp.exe -lossless "$input" -o "$output"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Conversion succeeded. Deleting original PNG..."
        Remove-Item $input
    }
    else {
        Write-Host "Conversion FAILED. PNG will NOT be deleted."
    }
}

Write-Host "Done!"