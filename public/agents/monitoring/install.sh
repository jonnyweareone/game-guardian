#!/usr/bin/env bash
set -euo pipefail

log() { echo "[monitoring-install $(date +'%H:%M:%S')] $*"; }

log "📦 Setting up Guardian Monitoring Agent..."

# Create monitoring directory
mkdir -p /opt/guardian/monitoring

# Create monitoring agent script
cat > /opt/guardian/monitoring/agent.sh << 'SH'
#!/usr/bin/env bash
# Guardian Monitoring Agent - replace with real binary or node/python service
while true; do
  echo "$(date) monitoring heartbeat" >> /var/log/guardian-monitoring.log
  sleep 60
done
SH

chmod +x /opt/guardian/monitoring/agent.sh

# Create systemd service unit
cat > /etc/systemd/system/guardian-monitoring.service << 'UNIT'
[Unit]
Description=Guardian Monitoring Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/opt/guardian/monitoring/agent.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT

# Enable and start the service
systemctl daemon-reload
systemctl enable guardian-monitoring.service
systemctl restart guardian-monitoring.service || true

log "✅ Guardian Monitoring Agent installed and started."