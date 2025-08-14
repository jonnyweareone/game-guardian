
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const secretRaw = Deno.env.get("DEVICE_JWT_SECRET");
if (!secretRaw) {
  throw new Error("DEVICE_JWT_SECRET environment variable is not set");
}

// Create a proper key for HS256
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(secretRaw),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

export async function mintDeviceJWT(device_code: string, minutes = 15) {
  try {
    const payload = {
      sub: device_code,
      aud: "guardian-device",
      iss: "guardian-edge",
      iat: getNumericDate(0),
      nbf: getNumericDate(0),
      exp: getNumericDate(minutes * 60),
    };
    
    // Use the proper create function with imported key
    return await create({ alg: "HS256", typ: "JWT" }, payload, key);
  } catch (error) {
    console.error("JWT minting error:", error);
    console.error("device_code:", device_code);
    throw new Error(`Failed to mint JWT: ${error.message}`);
  }
}

export async function verifyDeviceJWT(jwt: string) {
  try {
    const payload = await verify(jwt, key, "HS256");
    return { ok: true, payload };
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("expired") || msg.includes("exp")) {
      return { ok: false, expired: true };
    }
    return { ok: false, expired: false, error: msg };
  }
}
