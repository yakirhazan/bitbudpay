import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// POST /api/kyc
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
      walletAddress: data.wallet_address
    });
  } catch (err) {
    console.error('KYC error:', err);
    res.status(500).json({ error: 'Internal server error' });
    next(err);
  }
};

app.post('/api/kyc', kycHandler);

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
