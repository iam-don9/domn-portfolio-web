#!/usr/bin/env bash
# One-shot CloudBase static-hosting deploy for domn-portfolio-web.
#
# Runs on your own machine (Git Bash / WSL / macOS / Linux). It builds the
# site, logs into CloudBase with your API key, and uploads dist/ to static
# hosting. Secrets come from environment variables — nothing is written to disk.
#
# Usage:
#   export CLOUDBASE_ENV_ID=domn-portfolio-7gxxxx
#   export CLOUDBASE_SECRET_ID=AKIDxxxxxxxx
#   export CLOUDBASE_SECRET_KEY=xxxxxxxx
#   bash scripts/deploy-cloudbase.sh
set -euo pipefail

: "${CLOUDBASE_ENV_ID:?Set CLOUDBASE_ENV_ID (CloudBase environment ID)}"
: "${CLOUDBASE_SECRET_ID:?Set CLOUDBASE_SECRET_ID (Tencent Cloud API SecretId)}"
: "${CLOUDBASE_SECRET_KEY:?Set CLOUDBASE_SECRET_KEY (Tencent Cloud API SecretKey)}"

# Ensure the CloudBase CLI is available
if ! command -v tcb >/dev/null 2>&1; then
  echo "==> Installing @cloudbase/cli ..."
  npm install -g @cloudbase/cli
fi

echo "==> Building site (astro build)"
NODE_OPTIONS="" npm run build

echo "==> Logging in to CloudBase"
tcb login --apiKeyId "$CLOUDBASE_SECRET_ID" --apiKey "$CLOUDBASE_SECRET_KEY"

echo "==> Deploying ./dist to static hosting (env: $CLOUDBASE_ENV_ID)"
tcb hosting deploy ./dist -e "$CLOUDBASE_ENV_ID" --verify

echo "==> Done. Default domain: https://${CLOUDBASE_ENV_ID}.tcloudbaseapp.com"
