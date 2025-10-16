#!/usr/bin/env bash
set -euo pipefail
REPO_DIR="${1:-.}"
mkdir -p "$REPO_DIR/docs/SECURITY"
docker run --rm -v "$REPO_DIR:/repo" zricethezav/gitleaks:latest detect --source=/repo --report-format markdown --report-path /repo/docs/SECURITY/SECRET_SCAN.md || true
echo "Relatório em docs/SECURITY/SECRET_SCAN.md"
