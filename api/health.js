/**
 * Health check endpoint for PulseBus Civic Velocity API
 * Monitors API status, server uptime, and external LTA DataMall configuration
 */
export default async function handler(req, res) {
  const ltaKeyConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY ||
    process.env['LTA+ACCOUNT_KEY'] ||
    process.env.LTA_KEY ||
    process.env.ACCOUNT_KEY
  );

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    service: 'PulseBus Civic Velocity API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    ltaIntegration: {
      provider: 'Singapore Land Transport Authority (LTA DataMall v3)',
      accountKeyConfigured: ltaKeyConfigured,
      endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
      status: ltaKeyConfigured ? 'ready' : 'awaiting_key_in_vercel_env'
    },
    endpoints: {
      health: '/api/health',
      busArrival: '/api/bus-arrival?BusStopCode=04121[&ServiceNo=7]'
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json(healthData);
}
