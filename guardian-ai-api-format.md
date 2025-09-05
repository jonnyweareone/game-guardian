# Device Apps & Activation API Guide

## Base URLs and Authentication

**Supabase Base URL:** `https://xzxjwuzwltoapifcyzww.supabase.co`  
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eGp3dXp3bHRvYXBpZmN5end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTQwNzksImV4cCI6MjA3MDEzMDA3OX0.w4QLWZSKig3hdoPOyq4dhTS6sleGsObryIolphhi9yo`

**Activation Web URL:** `https://lovable.dev/activate?device_id=GG-XXXX-XXXX`

## Phase 1: Device Registration & Token Polling

### 1. Device Registration
**POST** `/functions/v1/device-registration`
```bash
curl -X POST "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-registration" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "device_code": "GG-1234-5678",
    "platform": "linux",
    "arch": "x86_64",
    "version": "1.0.0"
  }'
```

**Response:**
```json
{
  "ok": true,
  "device_id": "abc123...",
  "activation_url": "https://lovable.dev/activate?device_id=GG-1234-5678",
  "message": "Device registered. Visit activation_url to continue setup."
}
```

### 2. Poll for Device JWT
**GET** `/functions/v1/device-status?device_id=GG-1234-5678`
```bash
# Poll this every 3-5 seconds until JWT is available
curl "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-status?device_id=GG-1234-5678" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (not activated yet):**
```json
{
  "activated": false,
  "device_jwt": null,
  "message": "Device not activated yet. Visit activation URL."
}
```

**Response (activated):**
```json
{
  "activated": true,
  "device_jwt": "eyJ0eXAiOiJKV1Qi...",
  "message": "Device activated successfully"
}
```

## Phase 2: Parent Web Activation

### Web URL Format
```
https://lovable.dev/activate?device_id=GG-1234-5678
```

Parent visits this URL, signs in, selects/creates child profile, configures DNS settings, and approves device. **No app selection needed - OS will send preinstalled apps.**

## Phase 3: Device-Authenticated Operations

All following calls require the Device JWT from Phase 1:

### 3. Send App Inventory
**POST** `/functions/v1/device-app-inventory`
```bash
curl -X POST "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-app-inventory" \
  -H "Authorization: Bearer ${DEVICE_JWT}" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "app_id": "org.mozilla.Firefox",
      "name": "Firefox",
      "version": "121.0",
      "source": "flatpak",
      "installed_by": "agent"
    },
    {
      "app_id": "com.github.joseexposito.touche",
      "name": "Touché",
      "version": "2.0.21",
      "source": "flatpak",
      "installed_by": "agent"
    }
  ]'
```

**Response:** HTTP 204 (success)

### 4. Send App Usage Data
**POST** `/functions/v1/device-app-usage`
```bash
curl -X POST "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-app-usage" \
  -H "Authorization: Bearer ${DEVICE_JWT}" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "app_id": "org.mozilla.Firefox",
      "name": "Firefox", 
      "started_at": "2025-01-15T10:00:00Z",
      "ended_at": "2025-01-15T10:30:00Z",
      "duration_s": 1800
    }
  ]'
```

**Response:** HTTP 204 (success)

### 5. Heartbeat
**POST** `/functions/v1/device-heartbeat`
```bash
curl -X POST "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-heartbeat" \
  -H "Authorization: Bearer ${DEVICE_JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "device_code": "GG-1234-5678",
    "status": "online",
    "battery": 85,
    "location": {"lat": 51.5074, "lng": -0.1278}
  }'
```

### 6. Poll for Jobs
**GET** `/functions/v1/device-jobs-poll`
```bash
curl "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-jobs-poll" \
  -H "Authorization: Bearer ${DEVICE_JWT}"
```

**Response:**
```json
{
  "id": "job-uuid-123",
  "type": "install_app",
  "payload": {
    "method": "flatpak",
    "source": "flathub",
    "name": "GIMP",
    "app_id": "org.gimp.GIMP"
  }
}
```

### 7. Report Job Status
**POST** `/functions/v1/device-jobs-report`
```bash
curl -X POST "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-jobs-report" \
  -H "Authorization: Bearer ${DEVICE_JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "job-uuid-123",
    "status": "completed",
    "result": {"installed": true, "version": "2.10.36"}
  }'
```

### 8. Fetch Configuration
**GET** `/functions/v1/device-config`
```bash
curl "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-config" \
  -H "Authorization: Bearer ${DEVICE_JWT}"
```

**Response:**
```json
{
  "device_code": "GG-1234-5678",
  "child_id": "child-uuid-456", 
  "apps": [
    {
      "app_id": "org.mozilla.Firefox",
      "name": "Firefox",
      "allowed": true,
      "schedule": {"Mon": ["09:00-17:00"], "Tue": ["09:00-17:00"]}
    }
  ],
  "dns_config": {
    "nextdns_profile": "abc123",
    "social_media_blocked": true,
    "gaming_blocked": false
  }
}
```

## Web App Real-Time Features

### Push App to Device
Web app calls Supabase RPC to queue install job:
```typescript
await supabase.rpc('queueInstall', {
  deviceId: 'device-uuid',
  appId: 'org.gimp.GIMP'
});
```

### Toggle App Approval
Web app calls RPC to approve/block apps:
```typescript
// Approve app
await supabase.rpc('toggle_app_policy', {
  p_device_id: 'device-uuid',
  p_app_id: 'org.mozilla.Firefox',
  p_enable: true
});

// Block app with reason
await supabase.rpc('toggle_app_policy', {
  p_device_id: 'device-uuid', 
  p_app_id: 'com.discord.Discord',
  p_enable: false,
  p_reason: 'Inappropriate for age'
});
```

### Real-time App Updates
Web app subscribes to real-time changes:
```typescript
supabase.channel('device-apps')
  .on('postgres_changes', {
    event: '*',
    schema: 'public', 
    table: 'device_app_inventory'
  }, handleAppUpdate)
  .subscribe();
```

## Minimal End-to-End Test

```bash
#!/bin/bash
BASE="https://xzxjwuzwltoapifcyzww.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 1. Register device
echo "1. Registering device..."
curl -s -X POST "$BASE/functions/v1/device-registration" \
  -H "apikey: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"device_code":"GG-TEST-0001","platform":"linux"}' | jq

# 2. Poll for activation (would normally loop)
echo "2. Polling for activation..."
curl -s "$BASE/functions/v1/device-status?device_id=GG-TEST-0001" \
  -H "apikey: $KEY" | jq

# Parent visits: https://lovable.dev/activate?device_id=GG-TEST-0001
echo "Parent should visit: https://lovable.dev/activate?device_id=GG-TEST-0001"

# 3. After activation, get JWT and send inventory
echo "3. Send app inventory (after getting JWT)..."
# JWT=$(curl -s "$BASE/functions/v1/device-status?device_id=GG-TEST-0001" -H "apikey: $KEY" | jq -r .device_jwt)
# curl -X POST "$BASE/functions/v1/device-app-inventory" \
#   -H "Authorization: Bearer $JWT" \
#   -H "Content-Type: application/json" \
#   -d '[{"app_id":"test.app","name":"Test App","version":"1.0","source":"flatpak","installed_by":"agent"}]'
```

---

# Original Guardian AI Device API Documentation

## Two-Phase Desktop OS Agent Flow

### Overview
The Guardian AI device registration flow uses a two-phase approach:
1. **Phase 1**: Device boots, registers, and polls for activation (no parent involved)
2. **Phase 2**: Parent uses `/activate` page to bind device and assign child

### Base URLs
- **Production**: `https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/`
- **Key Endpoints**: `device-registration`, `device-status`, `guardian-data-handler`, `device-bootstrap`

---

## Phase 1: Device Self-Registration & Polling

### Step 1: Register Device
**POST** `/device-registration`

**Headers:**
```
x-device-id: GG-XXXX-XXXX
Content-Type: application/json
```

**Body (optional):**
```json
{
  "device_info": {
    "os": "GuardianOS", 
    "version": "1.0.0",
    "hardware_id": "unique-hw-id"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "status": "pending", 
  "approval_required": true
}
```

### Step 2: Poll for Device Token
**GET** `/device-status?device_id=GG-XXXX-XXXX`

Poll every 3-5 seconds until activated. Returns when parent completes activation:

**Response (activated):**
```json
{
  "activated": true,
  "is_active": true, 
  "device_jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-02-07T10:30:00Z"
}
```

### Step 3: Use Device JWT for Operations
Once you have `device_jwt`, use it for all device operations:

**Headers for authenticated requests:**
```
Authorization: Bearer <device_jwt>
x-device-id: GG-XXXX-XXXX
```

---

## Phase 2: Parent Activation (Web UI)

Parent visits `/activate?device_id=GG-XXXX-XXXX` which:
1. Calls `bind-device` with parent's auth token
2. Sets `parent_id`, `is_active=true`, `status=active`
3. Mints `device_jwt` and stores in database
4. Optionally assigns a child to the device

The device's polling of `/device-status` will immediately pick up the new JWT.

---

## Authenticated Device Operations

### Heartbeat
**POST** `/device-heartbeat`
```json
{
  "status": "online",
  "agent_version": "1.2.3",
  "metrics": {
    "uptime": 3600,
    "memory_usage": 0.75
  },
  "alerts": []
}
```

### Jobs Polling
**POST** `/device-jobs-poll`
```json
{
  "limit": 10
}
```

### Job Reporting
**POST** `/device-jobs-report` 
```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "result": {
    "success": true,
    "data": "..."
  }
}
```

### Configuration Fetch
**GET** `/device-config`

Returns device-specific configuration including web filters, app policies, etc.

---

## Optional: Perpetual Token Refresh

For devices that need long-term autonomy without parent involvement:

### Device Bootstrap (before activation)
**POST** `/device-bootstrap`
```json
{
  "device_code": "GG-XXXX-XXXX",
  "refresh_secret": "base64url-encoded-secret"
}
```

This allows the device to later use `/device-refresh` for JWT rotation without parent tokens.

### Token Refresh
**POST** `/device-refresh`
```json
{
  "device_code": "GG-XXXX-XXXX", 
  "refresh_secret": "original-secret-from-bootstrap"
}
```

**Response:**
```json
{
  "ok": true,
  "device_jwt": "new-jwt-here"
}
```

---

## Data Ingestion

### Send Data to Dashboard
**POST** `/guardian-data-handler`

**Headers:**
```
Authorization: Bearer <device_jwt>
x-device-id: GG-XXXX-XXXX
Content-Type: application/json
```

### Data Format Options

#### 1. Heartbeat (Device Status)
```json
{
  "device_id": "GG-ABCD-1234",
  "heartbeat": {
    "status": "online",
    "last_seen": "2024-01-07T10:30:00Z"
  }
}
```

#### 2. Conversation Data
```json
{
  "device_id": "GG-ABCD-1234",
  "child_id": "child-uuid",
  "conversation_data": {
    "platform": "Discord",
    "participants": ["ChildName", "Friend1", "Friend2"],
    "transcript": [
      {
        "timestamp": "2024-01-07T10:30:00Z",
        "speaker": "ChildName",
        "message": "Hey guys, want to play Minecraft?"
      }
    ],
    "session_start": "2024-01-07T10:30:00Z",
    "session_end": "2024-01-07T11:30:00Z",
    "conversation_type": "voice_chat"
  }
}
```

#### 3. Alert Data (AI-Detected Issues)
```json
{
  "device_id": "GG-ABCD-1234",
  "child_id": "child-uuid",
  "alert_data": {
    "alert_type": "cyberbullying",
    "risk_level": "high",
    "ai_summary": "Child experienced verbal harassment from multiple players...",
    "transcript_snippet": "\"You're terrible\" - \"Nobody wants you here\"",
    "confidence_score": 0.95,
    "emotional_impact": "high",
    "social_context": "group_chat"
  }
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "device_id": "GG-ABCD-1234", 
  "processed_at": "2024-01-07T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "Device not found or inactive",
  "timestamp": "2024-01-07T10:30:00Z"
}
```

---

## Alert Types & Risk Levels

### Alert Types
- `inappropriate_sharing` - Child sharing personal information
- `cyberbullying` - Harassment or bullying behavior  
- `stranger_contact` - Unknown person initiating contact
- `inappropriate_content` - Exposure to adult/harmful content
- `positive_interaction` - Good social behavior (for highlights)
- `suspicious_behavior` - Unusual patterns detected
- `gaming_addiction` - Excessive gaming time patterns
- `other` - Other concerns not covered above

### Risk Levels
- `low` - Informational, no immediate action needed
- `medium` - Monitor situation, may require attention
- `high` - Requires parental review and possible discussion  
- `critical` - Immediate parental intervention recommended

---

## Implementation Examples

### Minimal Agent Sequence
```bash
#!/bin/bash

DEVICE_CODE="GG-04EA-7EE4"
BASE_URL="https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1"

# 1. Register device
echo "Registering device $DEVICE_CODE..."
curl -X POST "$BASE_URL/device-registration" \
  -H "x-device-id: $DEVICE_CODE" \
  -H "Content-Type: application/json" \
  -d '{"device_info": {"os": "GuardianOS", "version": "1.0.0"}}'

# 2. Poll for activation
echo "Polling for activation..."
while true; do
  response=$(curl -s "$BASE_URL/device-status?device_id=$DEVICE_CODE")
  activated=$(echo "$response" | jq -r '.activated // false')
  
  if [ "$activated" = "true" ]; then
    device_jwt=$(echo "$response" | jq -r '.device_jwt')
    echo "Device activated! JWT: ${device_jwt:0:20}..."
    break
  fi
  
  echo "Waiting for activation..."
  sleep 5
done

# 3. Send heartbeat
echo "Sending heartbeat..."
curl -X POST "$BASE_URL/device-heartbeat" \
  -H "Authorization: Bearer $device_jwt" \
  -H "x-device-id: $DEVICE_CODE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "online",
    "agent_version": "1.0.0",
    "metrics": {"uptime": 60}
  }'
```

### Python Client Example
```python
import requests
import time
import json

BASE_URL = "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1"
DEVICE_CODE = "GG-04EA-7EE4"

# 1. Register device
response = requests.post(f"{BASE_URL}/device-registration", 
    headers={"x-device-id": DEVICE_CODE, "Content-Type": "application/json"},
    json={"device_info": {"os": "GuardianOS", "version": "1.0.0"}})

if response.ok:
    print(f"Device {DEVICE_CODE} registered successfully")
    
    # 2. Poll for activation
    device_jwt = None
    while not device_jwt:
        status_response = requests.get(f"{BASE_URL}/device-status", 
            params={"device_id": DEVICE_CODE})
        
        if status_response.ok:
            data = status_response.json()
            if data.get("activated") and data.get("device_jwt"):
                device_jwt = data["device_jwt"]
                print("Device activated!")
                break
        
        print("Waiting for activation...")
        time.sleep(5)
    
    # 3. Use JWT for operations
    headers = {
        "Authorization": f"Bearer {device_jwt}",
        "x-device-id": DEVICE_CODE,
        "Content-Type": "application/json"
    }
    
    # Send heartbeat
    heartbeat_response = requests.post(f"{BASE_URL}/device-heartbeat",
        headers=headers,
        json={"status": "online", "agent_version": "1.0.0"})
    
    if heartbeat_response.ok:
        print("Heartbeat sent successfully")
```

---

## Key Implementation Notes

1. **Device Registration**: Call once on first boot
2. **Status Polling**: Poll every 3-5 seconds during activation
3. **JWT Storage**: Securely store device_jwt for subsequent requests
4. **Heartbeats**: Send every 5-10 minutes to maintain connection
5. **Error Handling**: Implement retry logic with exponential backoff
6. **Security**: Always use HTTPS and validate JWT expiry dates

The device agent should display the device code to the user and instruct them to visit the activation URL to complete setup.