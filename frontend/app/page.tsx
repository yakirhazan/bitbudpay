'use client';

import { useState } from 'react';
import Image from 'next/image';

interface KycResponse {
  success: boolean;
  walletId: string;
  walletAddress: string;
  circleId?: string;
}

interface ErrorResponse {
  error: string;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState<KycResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    const apiUrl = 'https://bitbudpay-backend-4l8mxehxk-yakirs-projects-fb10a48e.vercel.app';
    const kycEndpoint = `${apiUrl}/api/kyc`;
    console.log('Hardcoded API URL:', apiUrl);
    console.log('Constructed fetch URL:', kycEndpoint);

    try {
      const res = await fetch(kycEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ username, email }),
      });
      console.log('Fetch response status:', res.status);
      const data: KycResponse | ErrorResponse = await res.json();
      console.log('Fetch response data:', data);
      if (!res.ok) {
        if ('error' in data) {
          throw new Error(data.error);
        }
        throw new Error(`Request failed: ${res.status}`);
      }
      if ('success' in data) {
        setResponse(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-md">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="BitBudPay logo"
          width={180}
          height={38}
          priority
          style={{ width: 'auto', height: 'auto' }}
        />
        <h1 className="text-2xl font-bold">KYC Verification</h1>
        <p>API URL Debug: Hardcoded to {apiUrl}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-foreground text-background font-medium h-12 px-5 hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit KYC'}
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        {response && (
          <div className="mt-4 p-4 border rounded-md w-full">
            <p><strong>Wallet ID:</strong> {response.walletId}</p>
            <p><strong>Wallet Address:</strong> {response.walletAddress}</p>
            {response.circleId && <p><strong>Circle ID:</strong> {response.circleId}</p>}
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline"
          href="https://bitbudpay.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/globe.svg" alt="Globe icon" width={16} height={16} />
          BitBudPay
        </a>
      </footer>
    </div>
  );
}
