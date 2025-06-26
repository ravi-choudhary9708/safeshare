// utils/aesClient.js

export async function encryptBufferClient(buffer, otp) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(otp),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-512",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    buffer
  );

  return {
    encryptedBuffer: new Uint8Array(encrypted),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

export async function decryptBufferClient(encryptedArrayBuffer, otp, ivBase64, saltBase64) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(otp),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0)),
      iterations: 100000,
      hash: "SHA-512",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0)),
    },
    key,
    encryptedArrayBuffer
  );

  return decrypted;
}


export function generateOtp(length=6){
    const chars='123456789qwertyuioplkjhgfdsazxcvbnmMAQWERTYUIPOLKJHGFDSZXCVB'
    let otp ='';
    for(let i=0;i<length;i++){
        otp+=chars.charAt(Math.floor(Math.random()*chars.length))
      }
      return otp;
}