
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const DEVICE_JWT_SECRET = Deno.env.get("DEVICE_JWT_SECRET");
const JWT_ISSUER = Deno.env.get("JWT_ISSUER") ?? "gameguardian";
const JWT_AUDIENCE = Deno.env.get("JWT_AUDIENCE") ?? "device";

if (!DEVICE_JWT_SECRET) {
  throw new Error("DEVICE_JWT_SECRET environment variable is not set");
}

// Create a proper key for HS256
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(DEVICE_JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

// Sign a token for a device code with optional parent_id for CPE devices
export async function signDeviceJWT(deviceCode: string, parentId?: string, ttlSeconds?: number) {
  try {
    const defaultTtl = ttlSeconds || (60 * 60 * 24 * 30); // 30 days default
    const payload: any = {
      sub: deviceCode,
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      iat: Math.floor(Date.now() / 1000),
      exp: getNumericDate(defaultTtl),
    };
    
    // Add parent_id for CPE devices to enable RLS
    if (parentId) {
      payload.parent_id = parentId;
    }
    
    return await create({ alg: "HS256", typ: "JWT" }, payload, key);
  } catch (error) {
    console.error("JWT signing error:", error);
    console.error("deviceCode:", deviceCode);
    throw new Error(`Failed to sign JWT: ${error.message}`);
  }
}

export async function verifyDeviceJWT(token: string) {
  try {
    const payload = await verify(token, key, "HS256");
    if (!payload?.sub || payload.aud !== JWT_AUDIENCE) {
      return { ok: false, error: "aud/sub invalid" };
    }
    return { ok: true, deviceCode: String(payload.sub) };
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("expired") || msg.includes("exp")) {
      return { ok: false, expired: true };
    }
    return { ok: false, error: msg };
  }
}

// Legacy function for backward compatibility
export async function mintDeviceJWT(device_code: string, minutes = 15) {
  return await signDeviceJWT(device_code);
}
