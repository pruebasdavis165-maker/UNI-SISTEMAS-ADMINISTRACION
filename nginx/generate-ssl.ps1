# Generador PowerShell de Certificados SSL para NicaLogistics Reverse Proxy (RNF-01)
$sslDir = Join-Path $PSScriptRoot "ssl"
if (!(Test-Path $sslDir)) {
    New-Item -ItemType Directory -Force -Path $sslDir | Out-Null
}

$opensslPath = "openssl"
if (!(Get-Command "openssl" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\Git\usr\bin\openssl.exe") {
        $opensslPath = "C:\Program Files\Git\usr\bin\openssl.exe"
    }
}

& $opensslPath req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout (Join-Path $sslDir "key.pem") `
  -out (Join-Path $sslDir "cert.pem") `
  -subj "/C=NI/ST=Managua/L=Managua/O=NicaLogistics/OU=DevOps/CN=localhost"

Write-Host "Certificados SSL generados exitosamente en nginx/ssl/" -ForegroundColor Green
