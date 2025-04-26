import * as crypto from 'crypto';

/**
 * Encrypts text using AES-256-GCM with JWT_SECRET as the key
 */
export function encrypt(text: string): string {
  // Use JWT_SECRET as the encryption key (ensure it's at least 32 bytes)
  const key = crypto
    .createHash('sha256')
    .update(String(process.env.JWT_SECRET))
    .digest();
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return the IV, encrypted data, and auth tag as a combined string
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

/**
 * Decrypts text that was encrypted with the encrypt function
 */
export function decrypt(ciphertext: string): string {
  // Split the stored value to get the IV, encrypted data, and auth tag
  const [ivHex, encrypted, authTagHex] = ciphertext.split(':');
  
  // Use JWT_SECRET as the decryption key (ensure it's at least 32 bytes)
  const key = crypto
    .createHash('sha256')
    .update(String(process.env.JWT_SECRET))
    .digest();
  
  // Convert the IV and auth tag back to Buffers
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt the data
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
} 