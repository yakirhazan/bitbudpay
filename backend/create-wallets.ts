import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

async function createWallets() {
  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.ENTITY_SECRET;
    const walletSetId = process.env.WALLET_SET_ID;

    if (!apiKey || !entitySecret || !walletSetId) {
      throw new Error('CIRCLE_API_KEY, ENTITY_SECRET, or WALLET_SET_ID not set in .env');
    }

    const circle = initiateDeveloperControlledWalletsClient({
      apiKey,
      entitySecret
    });

    const response = await circle.createWallets({
      idempotencyKey: uuidv4(),
      walletSetId,
      blockchains: ['ETH-SEPOLIA'],
      accountType: 'SCA',
      count: 2,
      metadata: [
        { name: 'user1', refId: 'user1' },
        { name: 'testuser2', refId: 'testuser2' }
      ]
    });

    console.log('Wallets Created:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Error creating wallets:', error.message);
    throw error;
  }
}

createWallets().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
