import { create, verify, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const secretRaw = Deno.env.get("DEVICE_JWT_SECRET")!;
const SECRET = new TextEncoder().encode(secretRaw);

export function mintDeviceJWT(device_code: string, minutes = 15) {
  const header: Header = { alg: "HS256", typ: "JWT" };
  const payload: Payload = {
    sub: device_code,
    aud: "guardian-device",
    iss: "guardian-edge",
    iat: getNumericDate(0),
    nbf: getNumericDate(0),
    exp: getNumericDate(minutes * 60),
  };
  return create(header, payload, SECRET);
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