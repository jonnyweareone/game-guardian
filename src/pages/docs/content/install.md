
# Install Guardian OS

1. **Download the ISO** and create a bootable USB.
2. Boot the target PC from USB and launch **Install Guardian OS**.
3. **Parent Admin**: create the parent (sudo) account.
4. **Child Account**: create the primary child user (autologin).
5. Connect to Wi‑Fi. **Live activation** contacts your Guardian dashboard (Supabase) and prepares device policy.
6. Click **Install**. After reboot, the child logs in automatically; optional apps install on first boot.

### Requirements
- 4 GB RAM (8 GB recommended), 20 GB storage, x86_64 CPU.
- Internet for activation, NextDNS, and app installation.

### Troubleshooting
- Stuck offline? The installer continues, then syncs on first boot.
- You can re‑run activation: `sudo systemctl restart guardian-live-activate`.
