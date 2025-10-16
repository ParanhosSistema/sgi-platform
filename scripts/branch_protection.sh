#!/usr/bin/env bash
set -euo pipefail
OWNER="${1:?owner}"
REPO="${2:?repo}"
gh api -X PUT "repos/$OWNER/$REPO/branches/main/protection" -f required_status_checks='null' -f enforce_admins=true -f required_pull_request_reviews='{"required_approving_review_count":1}' -f restrictions='null' -H "Accept: application/vnd.github+json"
echo "Proteção aplicada em $OWNER/$REPO (main)."
