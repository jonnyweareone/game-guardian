
import { create, verify, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const secretRaw = Deno.env.get("DEVICE_JWT_SECRET");
if (!secretRaw) {
  throw new Error("DEVICE_JWT_SECRET environment variable is not set");
}

// Handle the secret as a plain string for HS256
const SECRET = new TextEncoder().encode(secretRaw);

export async function mintDeviceJWT(device_code: string, minutes = 15) {
  try {
    const header: Header = { alg: "HS256", typ: "JWT" };
    const payload: Payload = {
      sub: device_code,
      aud: "guardian-device",
      iss: "guardian-edge",
      iat: getNumericDate(0),
      nbf: getNumericDate(0),
      exp: getNumericDate(minutes * 60),
    };
    return await create(header, payload, SECRET);
  } catch (error) {
    console.error("JWT minting error:", error);
    console.error("SECRET length:", SECRET?.length);
    console.error("device_code:", device_code);
    throw new Error(`Failed to mint JWT: ${error.message}`);
  }
}

export async function verifyDeviceJWT(jwt: string) {
  try {
    const { payload } = await verify(jwt, SECRET, "HS256");
    return { ok: true, payload };
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("expired") || msg.includes("exp")) {
      return { ok: false, expired: true };
    }
    return { ok: false, expired: false, error: msg };
  }
}
