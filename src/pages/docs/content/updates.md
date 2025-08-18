
# Updates & Sync (Supabase Agent)

Guardian keeps itself up‑to‑date and in sync with your dashboard.

- **Guardian Agent**: phones home to Supabase, fetches device config, applies policy.
- **NextDNS Lock**: profile ID pinned; DNS tampering blocked with nftables + polkit.
- **Auto‑Install Optional Apps**: child's first login completes queued installs.

### Manual Controls
- Restart agent: `sudo systemctl restart guardian-agent`
- Check logs: `sudo journalctl -u guardian-agent -e`
- NextDNS config: `/etc/nextdns/nextdns.conf` (managed)
