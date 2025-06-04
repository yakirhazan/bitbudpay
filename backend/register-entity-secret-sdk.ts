import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import * as dotenv from 'dotenv';

dotenv.config();

async function registerEntitySecret() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.ENTITY_SECRET;

    if (!apiKey || !entitySecret) {
      throw new Error('CIRCLE_API_KEY or ENTITY_SECRET not set in .env');
    }

    const response = await registerEntitySecretCiphertext({
      apiKey,
      entitySecret
      // No recoveryFileDownloadPath to avoid directory issues
    });

    console.log('Entity Secret Registered:', response);
    console.warn('Warning: No recovery file saved. Store entitySecret securely.');
  } catch (error: any) {
    console.error('Error registering Entity Secret:', error.message);
    throw error;
  }
}

registerEntitySecret().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
