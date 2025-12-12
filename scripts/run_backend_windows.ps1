Set-Location (Join-Path $PSScriptRoot "..")
if (Test-Path ".\.venv\Scripts\Activate.ps1") { . .\.venv\Scripts\Activate.ps1 }
uvicorn app:app --host 127.0.0.1 --port 8001
