require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bitbudpay-frontend-hd9b52hri-yakirs-projects-fb10a48e.vercel.app',
    'https://bitbudpay-frontend-7bnnsdrtx-yakirs-projects-fb10a48e.vercel.app',
    'https://bitbudpay-frontend-cwrjoyvwa-yakirs-projects-fb10a48e.vercel.app',
    'https://bitbudpay-frontend-k75hjniqu-yakirs-projects-fb10a48e.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Explicitly handle OPTIONS preflight
app.options('*', cors());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// KYC handler
const kycHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email } = req.body;
  if (!username || !email) {
    res.status(400).json({ error: 'Missing username or email' });
    return;
  }
  try {
    console.log(`Creating Circle user: ${username}`);
    const userResponse = await axios.post(
      'https://api-sandbox.circle.com/v1/w3s/users',
      { userId: username },
      {
        headers: {
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    await supabase.from('users').upsert({
      username,
      email,
      circle_id: userResponse.data.data.userId
    });
    console.log(`Querying user: username=${username}, email=${email}`);
    const { data, error } = await supabase
      .from('users')
      .select('wallet_id, wallet_address, circle_id')
      .eq('username', username)
      .eq('email', email)
      .single();
    if (error) {
      console.error('Supabase query error:', error);
      res.status(404).json({ error: 'User not found', details: error.message });
      return;
    }
    if (!data) {
      console.error('No user found for:', { username, email });
      res.status(404).json({ error: 'User not found' });
      return;
    }
    console.log('User found:', data);
    res.json({
      success: true,
      walletId: data.wallet_id,
      walletAddress: data.wallet_address,
      circleId: data.circle_id
    });
  } catch (err) {
    console.error('KYC error);
    res.status(500).json({ error: 'Internal server error' });
    next(err);
  }
};

// Routes
app.post('/api/kyc', kycHandler);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'BitBudPay Backend is running!' });
});

// Catch-all for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
