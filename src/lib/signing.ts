// Minimal Ed25519 helpers using @noble/ed25519
import * as ed from '@noble/ed25519';

export async function generateKeyPair() {
  const priv = ed.utils.randomPrivateKey();
  const pub = await ed.getPublicKeyAsync(priv);
  return { privateKey: priv, publicKey: pub };
}

export async function sign(message: Uint8Array, privateKey: Uint8Array) {
  return ed.signAsync(message, privateKey);
}

export async function verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array) {
  return ed.verifyAsync(signature, message, publicKey);
}

export function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
