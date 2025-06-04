import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

async function encryptSecret() {
  try {
    const developerSDK = initiateDeveloperControlledWalletsClient({
      apiKey: 'TEST_API_KEY:d9c9a49df749e45e2f1993646c6e1d66:4d132aaab2d574d03042434bcd9563e2',
      entitySecret: '47a6e7c81b890b16e66d8f043ed65a51894c43c4ca99e4587e25a0851de2785d'
    });

    const entitySecretCiphertext = await developerSDK.generateEntitySecretCiphertext();
    console.log('Entity Secret Ciphertext:', entitySecretCiphertext);
  } catch (error) {
    console.error('Encryption Error:', error);
  }
}

encryptSecret();
