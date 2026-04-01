#!/usr/bin/env pwsh
# Script para instalar hooks do Git

Write-Host "📦 Instalando hooks do Git..." -ForegroundColor Cyan

$hookContent = @'
#!/usr/bin/env pwsh
# Hook para validar LinkCard.tsx antes de commitar

Write-Host "🔍 Validando LinkCard.tsx..." -ForegroundColor Cyan

# Verificar se LinkCard.tsx está sendo commitado
$changedFiles = git diff --cached --name-only
if ($changedFiles -match "src/components/LinkCard.tsx") {
  $content = Get-Content "src/components/LinkCard.tsx" -Raw
  
  # Verificar se há funções entre imports
  if ($content -match "import[^\n]*\n[^\n]*\nfunction[^\n]*\n[^\n]*import") {
    Write-Host "❌ ERRO: LinkCard.tsx tem função entre imports!" -ForegroundColor Red
    Write-Host "   Isso causa erro de sintaxe. Por favor, mova a função para depois dos imports." -ForegroundColor Yellow
    exit 1
  }
  
  # Verificar se compila com npm run build
  Write-Host "   Verificando build..." -ForegroundColor Gray
  $buildOutput = npm run build 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERRO: Build falhou!" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
  }
  
  Write-Host "✅ LinkCard.tsx está válido!" -ForegroundColor Green
}

exit 0
'@

# Criar diretório de hooks se não existir
$hooksDir = ".git/hooks"
if (-not (Test-Path $hooksDir)) {
  New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

# Escrever o hook
$hookPath = Join-Path $hooksDir "pre-commit"
Set-Content -Path $hookPath -Value $hookContent -Encoding UTF8

Write-Host "✅ Hook pre-commit instalado com sucesso!" -ForegroundColor Green
Write-Host "   O hook validará LinkCard.tsx antes de cada commit." -ForegroundColor Gray
