import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;
const userId = 'bitbudpay-entity'; // Replace with actual userId from Circle Console or SDK setup
const entitySecretCiphertext = `TPnbB1L7Dbn8t5ued8aPHRPKpux6FlOZ/JkSMhdqSCVB5re4LqWYaCIpJPF7lLkcF8h5FLzkz5FHT2wgg5B0KeUjM3+F9iiJSw0BePCS7JtlBsTBtKXkD8eTFkFW9T++sWB67bJJen/jcWNnzasRUOyBbJKnDumEAMorFHXCO2+zdjSdypEpFY8h2+lTKFUb2Y1DYRvat7b1BfD1BSxQQI84kxESK7hudT+ufrFZR/3T/0MdfcexcAoOtzFRbadvpr08MI3GMSOFSpTtqtt7ferxy+8ynvQUfkXd8i8o499GRsTehGS1gUhE02aurF+bni4xrxIkDyX4TyrnMuC/69BuJw9GreDc7qlnARhMITjxIhzGgus2ePbs74Yzacdkza0+ha/EpeM50HSkYkjqPELbCDzDqxVqUNsJ96w2G25hvIC1+vItEQsgNv1ll9/wwUAFiBp1iNEP+W8Pncjva676w3an5Xlq5XO/p/KbHWfc5eUJXGnFmTdtSuSLC24y48NmN88TSpshP6f9LfH/3AbpAOBDbM8Xv3UHOvuyOgKQm5/ewRcFETuRD+CwBmDOtsv9ZASLApk+jdAljeIMUFVVkN/nffLdjrPt4J4Pem5RsXUQti8VoCnQbWXvSqjho2e7oBjZze+dMb6ZqG+2fXPV0V84ums8z56AZiNX+J8=`;

async function registerEntitySecret() {
  try {
    if (!CIRCLE_API_KEY) {
      throw new Error('CIRCLE_API_KEY is not set in .env');
    }

    const response = await axios.post(
      'https://api-sandbox.circle.com/v1/w3s/entity-secrets',
      {
        userId,
        entitySecretCiphertext
      },
      {
        headers: {
          Authorization: `Bearer ${CIRCLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Entity secret registered:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error registering entity secret:', error.response?.data || error.message);
    throw error;
  }
}

registerEntitySecret().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
