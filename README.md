# Guardian AI Platform

This is the Guardian AI platform for device management, child safety monitoring, and digital parenting tools.

## Two-Phase Device Registration Flow

The Guardian AI platform supports a streamlined device registration flow:

### Phase 1: Device Self-Registration
Devices register themselves and poll for activation without parent involvement:

```bash
# Register device
curl -X POST "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-registration" \
  -H "x-device-id: GG-XXXX-XXXX" \
  -H "Content-Type: application/json"

# Poll for activation
while true; do
  response=$(curl -s "https://xzxjwuzwltoapifcyzww.supabase.co/functions/v1/device-status?device_id=GG-XXXX-XXXX")
  activated=$(echo "$response" | jq -r '.activated // false')
  
  if [ "$activated" = "true" ]; then
    device_jwt=$(echo "$response" | jq -r '.device_jwt')
    echo "Device activated! JWT: ${device_jwt:0:20}..."
    break
  fi
  
  echo "Waiting for parent activation..."
  sleep 5
done
```

### Phase 2: Parent Activation
Parents visit `/activate?device_id=GG-XXXX-XXXX` to bind device and assign child.

See [guardian-ai-api-format.md](guardian-ai-api-format.md) for complete API documentation.

---

## Project Info

**URL**: https://lovable.dev/projects/b6873be6-9802-4a65-98b2-98a8e5918419

## Technologies

This project is built with:
- Vite + React + TypeScript
- shadcn-ui + Tailwind CSS  
- Supabase (Database, Auth, Edge Functions)

## Development

```sh
# Clone and install
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i

# Start dev server
npm run dev
```

## Deployment

Open [Lovable](https://lovable.dev/projects/b6873be6-9802-4a65-98b2-98a8e5918419) and click Share → Publish.

## License

Proprietary software. All rights reserved. See [LICENSE](LICENSE) for details.
