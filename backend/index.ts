require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();

// Middleware
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Request: ${req.method} ${req.url} Origin: ${req.headers.origin}`);
  next();
});
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://bitbudpay-frontend-hd9b52hri-yakirs-projects-fb10a48e.vercel.app',
      'https://bitbudpay-frontend-7bnnsdrtx-yakirs-projects-fb10a48e.vercel.app',
      'https://bitbudpay-frontend-cwrjoyvwa-yakirs-projects-fb10a48e.vercel.app',
      'https://bitbudpay-frontend-k75hjniqu-yakirs-projects-fb10a48e.vercel.app',
      'https://bitbudpay-frontend-o1zf9azi7-yakirs-projects-fb10a48e.vercel.app'
    ];
    console.log(`CORS check for origin: ${origin}`);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS rejected for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Explicitly handle OPTIONS preflight
app.options('*', cors());

// Supabase client
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Missing');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.error('Supabase connection test error:', error);
      throw error;
    }
    console.log('Supabase connection test successful:', data);
  } catch (err: any) {
    console.error('Supabase connection test failed:', err.message, err.stack);
  }
};
testSupabaseConnection();

// KYC handler
const kycHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email } = req.body;
  if (!username || !email) {
    res.status(400).json({ error: 'Missing username or email' });
    return;
  }
  try {
    // Check if user already exists
    console.log(`Checking for existing user: username=${username}, email=${email}`);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('wallet_id, wallet_address, circle_id, email')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      console.log(`User found: ${username}`);
      if (existingUser.email !== email) {
        res.status(409).json({ error: 'Username already exists with a different email' });
        return;
      }
      // Return existing user data
      res.json({
        success: true,
        walletId: existingUser.wallet_id,
        walletAddress: existingUser.wallet_address,
        circleId: existingUser.circle_id
      });
      return;
    }
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Supabase check error:', checkError);
      res.status(500).json({ error: 'Supabase check failed', details: checkError.message });
      return;
    }

    // Create Circle user
    console.log(`Creating Circle user: ${username}`);
    let circleId = null;
    try {
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
      circleId = userResponse.data.data.userId;
      console.log(`Circle user created: ${circleId}`);
    } catch (circleErr: any) {
      console.error('Circle API error:', circleErr.response?.data || circleErr.message);
    }

    // Upsert new user
    console.log(`Upserting user: username=${username}, email=${email}, circle_id=${circleId}`);
    const { data, error: upsertError } = await supabase.from('users').upsert({
      username,
      email,
      circle_id: circleId,
      wallet_id: `e100f4c8-e9ff-500f-92db-4165510e3ff4`, // Placeholder
      wallet_address: `0xf0070f42abb054fcac702d7c163905bcf2e6d409` // Placeholder
    }).select('wallet_id, wallet_address, circle_id').single();
    
    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      res.status(500).json({ error: 'Supabase upsert failed', details: upsertError.message });
      return;
    }
    
    console.log('User created:', data);
    res.json({
      success: true,
      walletId: data.wallet_id,
      walletAddress: data.wallet_address,
      circleId: data.circle_id
    });
  } catch (err: any) {
    console.error('KYC error:', err.message, err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
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
