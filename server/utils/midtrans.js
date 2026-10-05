import midtransClient from 'midtrans-client';

const isProd = process.env.NODE_ENV === 'production';

// Initialize Snap client
export const snap = new midtransClient.Snap({
  isProduction: isProd,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-...', // Replace with real one in .env
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-...',
});
