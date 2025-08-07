# Guardian AI Client API Documentation

## Base URLs
- **Production**: `https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/`
- **Data Handler**: `guardian-data-handler`
- **Device Registration**: `device-registration`

## Authentication
All requests require the device ID in the `x-device-id` header:
```
x-device-id: GG-XXXX-XXXX
```

## 1. Device Registration

### Register New Device
**POST** `/device-registration`

```json
{
  "device_code": "GG-ABCD-1234", // Optional, will be generated if not provided
  "device_info": {               // Optional
    "os": "GuardianOS",
    "version": "1.0.0",
    "hardware_id": "unique-hw-id"
  }
}
```

**Response:**
```json
{
  "device_code": "GG-ABCD-1234",
  "device_id": "uuid-here",
  "status": "registered",
  "pairing_required": true
}
```

### Check Device Status
**GET** `/device-registration?device_code=GG-ABCD-1234`

**Response:**
```json
{
  "device_code": "GG-ABCD-1234",
  "is_paired": true,
  "parent_name": "John Doe",
  "child_name": "Alex",
  "paired_at": "2024-01-07T10:30:00Z"
}
```

## 2. Data Ingestion

### Send Data to Dashboard
**POST** `/guardian-data-handler`

**Headers:**
```
Content-Type: application/json
x-device-id: GG-ABCD-1234
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
  "child_id": "child-uuid", // Optional if device is assigned to specific child
  "conversation_data": {
    "platform": "Discord",
    "participants": ["ChildName", "Friend1", "Friend2"],
    "transcript": [
      {
        "timestamp": "2024-01-07T10:30:00Z",
        "speaker": "ChildName",
        "message": "Hey guys, want to play Minecraft?"
      },
      {
        "timestamp": "2024-01-07T10:30:15Z",
        "speaker": "Friend1", 
        "message": "Sure! I'll join your server"
      }
    ],
    "session_start": "2024-01-07T10:30:00Z",
    "session_end": "2024-01-07T11:30:00Z", // Optional if ongoing
    "conversation_type": "voice_chat" // voice_chat, text_chat, gaming
  }
}
```

#### 3. Alert Data (AI-Detected Issues)
```json
{
  "device_id": "GG-ABCD-1234",
  "child_id": "child-uuid",
  "alert_data": {
    "alert_type": "cyberbullying", // See enum values below
    "risk_level": "high",          // low, medium, high, critical
    "ai_summary": "Child experienced verbal harassment from multiple players who used degrading language.",
    "transcript_snippet": "\"You're terrible\" - \"Nobody wants you here\" - \"Just quit\"",
    "confidence_score": 0.95,      // 0.0 to 1.0
    "emotional_impact": "high",    // low, medium, high
    "social_context": "group_chat" // private_chat, group_chat, public_forum
  }
}
```

#### 4. Combined Data (Conversation + Alert)
```json
{
  "device_id": "GG-ABCD-1234",
  "child_id": "child-uuid",
  "conversation_data": {
    "platform": "Xbox Live",
    "participants": ["ChildName", "Bully1", "Bully2"],
    "transcript": [
      {
        "timestamp": "2024-01-07T10:30:00Z",
        "speaker": "Bully1",
        "message": "You're terrible at this game"
      },
      {
        "timestamp": "2024-01-07T10:30:15Z",
        "speaker": "ChildName",
        "message": "I'm still learning"
      }
    ],
    "session_start": "2024-01-07T10:30:00Z",
    "session_end": "2024-01-07T11:00:00Z",
    "conversation_type": "voice_chat"
  },
  "alert_data": {
    "alert_type": "cyberbullying",
    "risk_level": "critical",
    "ai_summary": "Severe cyberbullying detected with multiple attackers targeting child's gaming abilities.",
    "transcript_snippet": "\"You're terrible\" - \"Nobody wants you here\"",
    "confidence_score": 0.98,
    "emotional_impact": "high",
    "social_context": "group_chat"
  }
}
```

## Alert Types Enum
- `inappropriate_sharing` - Child sharing personal information
- `cyberbullying` - Harassment or bullying behavior
- `stranger_contact` - Unknown person initiating contact
- `inappropriate_content` - Exposure to adult/harmful content
- `positive_interaction` - Good social behavior (for highlights)
- `suspicious_behavior` - Unusual patterns detected
- `gaming_addiction` - Excessive gaming time patterns
- `other` - Other concerns not covered above

## Risk Levels
- `low` - Informational, no immediate action needed
- `medium` - Monitor situation, may require attention
- `high` - Requires parental review and possible discussion
- `critical` - Immediate parental intervention recommended

## Response Format
All successful requests return:
```json
{
  "success": true,
  "device_id": "GG-ABCD-1234",
  "processed_at": "2024-01-07T10:30:00Z"
}
```

Error responses:
```json
{
  "error": "Device not found or inactive",
  "timestamp": "2024-01-07T10:30:00Z"
}
```

## Implementation Notes

1. **Device Registration**: Call once when device first boots up
2. **Status Checks**: Poll periodically to check if device has been paired
3. **Heartbeats**: Send every 5-10 minutes to maintain connection status
4. **Conversation Data**: Send when gaming sessions end or every 30 minutes for long sessions
5. **Alerts**: Send immediately when AI detects concerning behavior

## Example Client Flow

```python
# 1. Register device on first boot
response = requests.post(f"{BASE_URL}/device-registration", json={
    "device_info": {"os": "GuardianOS", "version": "1.0.0"}
})
device_code = response.json()["device_code"]

# 2. Display device code to user for pairing
print(f"Pair this device with code: {device_code}")

# 3. Check pairing status
while not is_paired:
    response = requests.get(f"{BASE_URL}/device-registration?device_code={device_code}")
    is_paired = response.json()["is_paired"]
    time.sleep(30)  # Check every 30 seconds

# 4. Send conversation data
conversation_data = {
    "device_id": device_code,
    "conversation_data": {...},
    "alert_data": {...}  # If AI detected issues
}

response = requests.post(
    f"{BASE_URL}/guardian-data-handler",
    headers={"x-device-id": device_code},
    json=conversation_data
)
```