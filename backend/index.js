import express, { Request, Response } from 'express';
import { Circle, CircleEnvironments } from '@circle-fin/circle-sdk';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Initialize Circle (sandbox)
const circle = new Circle(
  process.env.CIRCLE_API_KEY!,
  CircleEnvironments.sandbox
);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// API Routes
app.post('/api/transact', async (req: Request, res: Response) => {
  const { fromUsername, toUsername, amount, asset } = req.body;
  try {
    // Fetch user IDs from Supabase
    const { data: fromUser } = await supabase
      .from('users')
      .select('circle_id')
      .eq('username', fromUsername)
      .single();
    const { data: toUser } = await supabase
      .from('users')
      .select('circle_id')
      .eq('username', toUsername)
      .single();

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create transfer via Circle
    const transfer = await circle.transfers.create({
      source: { type: 'wallet', id: fromUser.circle_id },
      destination: { type: 'wallet', id: toUser.circle_id },
      amount: { amount: amount.toString(), currency: asset }
    });

    // Update sub-ledgers
    await supabase.from('sub_ledgers').insert([
      {
        user_id: fromUser.id,
        asset,
        amount: -amount,
        timestamp: new Date().toISOString(),
      },
      {
        user_id: toUser.id,
        asset,
        amount,
        timestamp: new Date().toISOString(),
      },
    ]);

    res.status(200).json({ success: true, transferId: transfer.data.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/balance', async (req: Request, res: Response) => {
  const { username } = req.query;
  try {
    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('circle_id')
      .eq('username', username as string)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get balance from Circle
    const balances = await circle.wallets.getWalletBalances(user.circle_id);

    // Aggregate from sub-ledgers
    const { data: ledger } = await supabase
      .from('sub_ledgers')
      .select('asset, amount')
      .eq('user_id', user.id);

    res.status(200).json({ balances: balances.data, ledger });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/kyc', async (req: Request, res: Response) => {
  const { username, email } = req.body;
  try {
    // Create Circle user
    const user = await circle.users.createUser({ email });

    // Store in Supabase
    await supabase.from('users').insert([
      { username, email, circle_id: user.data.userId }
    ]);

    res.status(201).json({ success: true, userId: user.data.userId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
