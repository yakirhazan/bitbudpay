import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Update CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bitbudpay-frontend-hd9b52hri-yakirs-projects-fb10a48e.vercel.app',
    'https://bitbudpay-frontend-7bnnsdrtx-yakirs-projects-fb10a48e.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

const kycHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email } = req.body;
  if (!username || !email) {
    res.status(400).json({ error: 'Missing username or email' });
    return;
  }
  try {
    console.log(`Fetching user: ${username}, ${email}`);
    const { data, error } = await supabase
      .from('users')
      .select('wallet_id, wallet_address')
      .eq('username', username)
      .eq('email', email)
      .single();
    if (error || !data) {
      console.error('Supabase error:', error);
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      success: true,
      walletId: data.wallet_id,
      walletAddress: data.wallet_address,
    });
  } catch (err) {
    console.error('KYC error:', err);
    res.status(500).json({ error: 'Internal server error' });
    next(err);
  }
};

app.post('/api/kyc', kycHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
