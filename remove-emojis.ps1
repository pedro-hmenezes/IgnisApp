# Script para remover emojis dos arquivos TypeScript

# Lista de emojis para remover
$emojis = @{
    '✅' = ''
    '❌' = ''
    '⚠️' = ''
    '📝' = ''
    '📋' = ''
    '📸' = ''
    '🚀' = ''
    '📤' = ''
    '🗑️' = ''
    '👤' = ''
    '✍️' = ''
    '🏷️' = ''
    '📞' = ''
    '🔍' = ''
    '📍' = ''
    '🏠' = ''
    '📊' = ''
    '⏰' = ''
    '👥' = ''
}

# Arquivos para processar
$files = @(
    "Services\OccurrenceFinalizationService.ts",
    "Controllers\CloudinaryMediaController.ts",
    "Controllers\MediaRegistrationController.ts",
    "Controllers\SignatureControllers.ts",
    "Controllers\OccurrenceControllers.ts",
    "Middleware\uploadMediaCloudinary.ts",
    "Middleware\errorMiddleware.ts"
)

foreach ($file in $files) {
    $filePath = "ignisApp\$file"
    if (Test-Path $filePath) {
        Write-Host "Processando: $file"
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        foreach ($emoji in $emojis.Keys) {
            $content = $content -replace [regex]::Escape($emoji), $emojis[$emoji]
        }
        
        Set-Content $filePath $content -Encoding UTF8 -NoNewline
        Write-Host "✓ Concluído: $file"
    } else {
        Write-Host "✗ Não encontrado: $file"
    }
}

Write-Host "`n=== CONCLUÍDO ==="
Write-Host "Todos os emojis foram removidos dos arquivos TypeScript!"
