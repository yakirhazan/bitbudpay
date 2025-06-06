import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'https://bitbudpay-frontend-abh63796b-yakirs-projects-fb10a48e.vercel.app',
  'https://bitbudpay-frontend-kkj0evgrc-yakirs-projects-fb10a48e.vercel.app',
  'http://localhost:3000', // For local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Handle preflight OPTIONS requests
app.options('/api/kyc', (req, res) => {
  res.status(200).end();
});

// KYC endpoint
app.post('/api/kyc', async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  console.log(`Processing KYC for username: ${username}`);

  // Generate wallet data
  const walletId = uuidv4();
  const walletAddress = `0x${Math.random().toString(16).slice(2, 42)}`;

  // Circle API integration
  let circleId = null;
  try {
    console.log(`Creating Circle user: ${username}`);
    const userResponse = await axios.post(
      'https://api-sandbox.circle.com/v1/w3s/users',
      { userId: username },
      {
        headers: {
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    circleId = userResponse.data.data.userId;
    console.log(`Circle user created: ${circleId}`);
  } catch (circleErr: any) {
    console.error(
      'Circle API error:',
      circleErr.response?.data || circleErr.message,
      circleErr.stack
    );
  }

  // Return response
  res.json({
    success: true,
    walletId,
    walletAddress,
    circleId,
  });
});

// Export for Vercel
export default app;
