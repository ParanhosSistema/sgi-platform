#!/usr/bin/env bash
set -euo pipefail
cd "${1:-/opt/sgi-platform}"
SECRET=$(openssl rand -base64 48)
echo "JWT_SECRET=$SECRET" >> .env
docker compose up -d api
echo "JWT rotacionado e API reiniciada."
