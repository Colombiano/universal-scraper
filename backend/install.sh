#!/bin/bash
set -e

echo "=========================================="
echo "  Universal Scraper - Instalador"
echo "=========================================="
echo ""

echo "[1/3] Instalando dependencias Python..."
pip install -r requirements.txt

echo ""
echo "[2/3] Instalando navegadores Playwright..."
playwright install chromium

echo ""
echo "[3/3] Instalacao concluida!"
echo ""
echo "=========================================="
echo "  Para iniciar o servidor:"
echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo "=========================================="
