# Skylark Executive Intelligence Platform — Quick Start
# 
# Run this script to start the backend API server.
# Requirements: Python 3.10+, packages installed via pip install -r requirements.txt

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Skylark Founder Executive Intelligence Agent" -ForegroundColor White
Write-Host "  Backend API Server (FastAPI + Uvicorn)" -ForegroundColor Gray
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARN] .env file not found. Monday.com integration will operate in degraded mode." -ForegroundColor Yellow
    Write-Host "       Create a .env file with: MONDAY_API_KEY=your_key_here" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "[INFO] Starting FastAPI backend on http://localhost:8000" -ForegroundColor Green
Write-Host "[INFO] Docs available at http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
