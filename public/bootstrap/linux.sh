#!/usr/bin/env bash
set -euo pipefail

log() { echo "[bootstrap $(date +'%H:%M:%S')] $*"; }

log "📥 Updating system..."
apt update && apt -y upgrade

log "📥 Installing Creator tools..."
apt install -y krita inkscape gimp blender obs-studio kdenlive

log "📥 Installing Monitoring agent..."
curl -fsSL https://gameguardian.ai/agents/monitoring/install.sh | bash

log "🔗 Linking to Guardian Control..."
mkdir -p /etc/guardian/modules
echo "creator_installed=true" > /etc/guardian/modules/creator.status
echo "monitoring_installed=true" > /etc/guardian/modules/monitoring.status

log "✅ Bootstrap complete."