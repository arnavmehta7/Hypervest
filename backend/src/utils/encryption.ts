import CryptoJS from 'crypto-js';
import { config } from '../config/env';

export class EncryptionService {
  private static readonly algorithm = 'AES';
  private static readonly key = config.ENCRYPTION_KEY;

  static encrypt(text: string): string {
    try {
        
      const encrypted = CryptoJS.AES.encrypt(text, this.key).toString();
      return encrypted;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.key);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!originalText) {
        throw new Error('Failed to decrypt');
      }
      
      return originalText;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }
} 