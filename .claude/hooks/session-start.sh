#!/bin/bash
# Installs REA (reverse-engineering MCP server + skill) and the Ghidra
# decompiler it uses for native binaries. Cloud sessions only; idempotent.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

pip install -q -r "${CLAUDE_PROJECT_DIR:-.}/requirements.txt"

REA_VERSION="6.7.0"
GHIDRA_VERSION="12.1.4"
GHIDRA_BUILD_DATE="20260921"
GHIDRA_DIR="/opt/ghidra_${GHIDRA_VERSION}_PUBLIC"
GHIDRA_ZIP="ghidra_${GHIDRA_VERSION}_PUBLIC_${GHIDRA_BUILD_DATE}.zip"
GHIDRA_URL="https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_${GHIDRA_VERSION}_build/${GHIDRA_ZIP}"

# Ghidra 12.1.x needs a JDK 21.
if ! java -version 2>&1 | grep -q 'version "21'; then
  apt-get update -qq && apt-get install -y -qq openjdk-21-jdk-headless
fi

if [ ! -x "${GHIDRA_DIR}/support/analyzeHeadless" ]; then
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  curl -fsSL --retry 3 -o "${tmp}/${GHIDRA_ZIP}" "${GHIDRA_URL}"
  unzip -q "${tmp}/${GHIDRA_ZIP}" -d /opt
fi

# setup copies GHIDRA_INSTALL_DIR into REA's MCP registration.
export GHIDRA_INSTALL_DIR="${GHIDRA_DIR}"
echo "export GHIDRA_INSTALL_DIR=\"${GHIDRA_DIR}\"" >> "${CLAUDE_ENV_FILE:-/dev/null}"

npx -y "rea-agents@${REA_VERSION}" setup --client claude_code --yes >/dev/null
