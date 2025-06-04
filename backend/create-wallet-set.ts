import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import * as dotenv from 'dotenv';

dotenv.config();

async function createWalletSet() {
  try {
    if (!process.env.CIRCLE_API_KEY) {
      throw new Error('CIRCLE_API_KEY is not set in .env');
    }
    if (!process.env.ENTITY_SECRET) {
      throw new Error('ENTITY_SECRET is not set in .env');
    }

    console.log('Using API Key:', process.env.CIRCLE_API_KEY);

    const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.ENTITY_SECRET
    });

    const response = await circleDeveloperSdk.createWalletSet({
      name: 'BitBudPay Wallet Set'
    });

    if (!response.data?.walletSet?.id) {
      throw new Error('Failed to create wallet set: Invalid response');
    }

    console.log('Wallet Set Created:', response.data);
    return response.data.walletSet.id;
  } catch (error) {
    console.error('Error creating wallet set:', error);
    throw error;
  }
}

createWalletSet().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
