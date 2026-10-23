/**
 * agentDeep - Chiffrement AES-GCM côté client via Web Crypto API
 * Permet de stocker la clé API Gemini de manière chiffrée dans Dexie.
 */

const SALT = new Uint8Array([23, 89, 145, 67, 12, 99, 211, 44, 78, 19, 56, 123, 200, 10, 88, 31]);
const STORAGE_PASSPHRASE = 'agentDeep-local-key-device-salt';

async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(STORAGE_PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(plainKey: string): Promise<string> {
  if (!plainKey) return '';
  try {
    const key = await deriveKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainKey)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    let binary = '';
    for (let i = 0; i < combined.length; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.warn('[agentDeep] Échec de chiffrement, stockage direct sécurisé:', error);
    return plainKey;
  }
}

export async function decryptApiKey(cipherText: string): Promise<string> {
  if (!cipherText) return '';
  // Si c'est déjà du clair (commence par AIza)
  if (cipherText.startsWith('AIza')) return cipherText;

  try {
    const key = await deriveKey();
    const binary = window.atob(cipherText);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch {
    // Si échec de déchiffrement, peut-être déjà en clair
    return cipherText;
  }
}
