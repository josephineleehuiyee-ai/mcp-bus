/**
 * Singapore Land Transport Authority (LTA) DataMall v3 Bus Arrival API Endpoint
 * 
 * Target Endpoint:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121[&ServiceNo=7]
 * Header: AccountKey: process.env.LTA_ACCOUNT_KEY
 * 
 * Parameters:
 * - BusStopCode: 5-digit bus stop code (required, e.g. "04121")
 * - ServiceNo: Bus service number (optional, e.g. "7")
 * 
 * Note: LTA data refreshes every 20 seconds.
 */

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  // Parse query parameters
  const query = req.query || {};
  // If running in minimal middleware without req.query, parse from req.url
  let busStopCode = query.BusStopCode || query.busStopCode;
  let serviceNo = query.ServiceNo || query.serviceNo;

  if (!busStopCode && req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      busStopCode = parsedUrl.searchParams.get('BusStopCode') || parsedUrl.searchParams.get('busStopCode');
      serviceNo = parsedUrl.searchParams.get('ServiceNo') || parsedUrl.searchParams.get('serviceNo');
    } catch (e) {
      // URL parse fallback
    }
  }

  if (!busStopCode) {
    return res.status(400).json({
      error: 'Missing required query parameter: BusStopCode',
      example: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7'
    });
  }

  // Read AccountKey from environment
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env['LTA+ACCOUNT_KEY'] ||
    process.env.LTA_KEY ||
    process.env.ACCOUNT_KEY;

  // If LTA AccountKey is configured, call the live DataMall endpoint
  if (accountKey) {
    try {
      let ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
      if (serviceNo) {
        ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
      }

      const ltaResponse = await fetch(ltaUrl, {
        method: 'GET',
        headers: {
          AccountKey: accountKey,
          accept: 'application/json',
        },
      });

      if (!ltaResponse.ok) {
        const errorText = await ltaResponse.text();
        return res.status(ltaResponse.status).json({
          error: 'Failed to retrieve data from LTA DataMall',
          status: ltaResponse.status,
          details: errorText,
          accountKeyPresent: true
        });
      }

      const ltaData = await ltaResponse.json();

      // Cache for 20 seconds as advised by LTA
      res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=10');
      return res.status(200).json({
        ...ltaData,
        source: 'live_lta_datamall',
        accountKeyConfigured: true
      });
    } catch (err) {
      return res.status(502).json({
        error: 'Error connecting to LTA DataMall API service',
        message: err.message,
        accountKeyPresent: true
      });
    }
  }

  // Fallback: If AccountKey is not yet set in Vercel environment variables,
  // return structured realistic simulated LTA data so the application functions properly
  const now = new Date();
  const makeArrival = (offsetMinutes, load = 'SEA', type = 'SD') => {
    const arrivalTime = new Date(now.getTime() + offsetMinutes * 60000);
    return {
      OriginCode: '04121',
      DestinationCode: '17009',
      EstimatedArrival: arrivalTime.toISOString(),
      Latitude: '1.290270',
      Longitude: '103.851959',
      VisitNumber: '1',
      Load: load, // SEA: Seats Available, SDA: Standing Available, LSD: Limited Standing
      Feature: 'WAB', // Wheelchair Accessible Bus
      Type: type // SD: Single Deck, DD: Double Deck, BD: Bendy
    };
  };

  const sampleServices = [
    {
      ServiceNo: '7',
      Operator: 'SBST',
      NextBus: makeArrival(2, 'SEA', 'DD'),
      NextBus2: makeArrival(9, 'SDA', 'SD'),
      NextBus3: makeArrival(18, 'SEA', 'DD'),
    },
    {
      ServiceNo: '14',
      Operator: 'SBST',
      NextBus: makeArrival(4, 'SDA', 'DD'),
      NextBus2: makeArrival(12, 'SEA', 'SD'),
      NextBus3: makeArrival(22, 'SEA', 'DD'),
    },
    {
      ServiceNo: '61',
      Operator: 'SMRT',
      NextBus: makeArrival(6, 'SEA', 'SD'),
      NextBus2: makeArrival(15, 'LSD', 'SD'),
      NextBus3: makeArrival(24, 'SEA', 'SD'),
    },
    {
      ServiceNo: '124',
      Operator: 'SBST',
      NextBus: makeArrival(1, 'LSD', 'SD'),
      NextBus2: makeArrival(11, 'SEA', 'SD'),
      NextBus3: makeArrival(19, 'SEA', 'SD'),
    },
    {
      ServiceNo: '174',
      Operator: 'SBST',
      NextBus: makeArrival(5, 'SEA', 'DD'),
      NextBus2: makeArrival(14, 'SEA', 'DD'),
      NextBus3: makeArrival(25, 'SDA', 'SD'),
    },
    {
      ServiceNo: '851',
      Operator: 'SMRT',
      NextBus: makeArrival(8, 'SEA', 'DD'),
      NextBus2: makeArrival(17, 'SDA', 'DD'),
      NextBus3: makeArrival(28, 'SEA', 'SD'),
    }
  ];

  const matchedServices = serviceNo
    ? sampleServices.filter((s) => s.ServiceNo.toLowerCase() === serviceNo.toLowerCase())
    : sampleServices;

  res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=10');
  return res.status(200).json({
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival',
    BusStopCode: busStopCode,
    Services: matchedServices.length > 0 ? matchedServices : [
      {
        ServiceNo: serviceNo || '7',
        Operator: 'SBST',
        NextBus: makeArrival(3, 'SEA', 'SD'),
        NextBus2: makeArrival(12, 'SEA', 'DD'),
        NextBus3: makeArrival(21, 'SEA', 'SD')
      }
    ],
    source: 'simulated_fallback',
    accountKeyConfigured: false,
    notice: 'LTA_ACCOUNT_KEY environment variable is not yet configured. Providing preview fallback data. Add LTA_ACCOUNT_KEY in Vercel settings to stream live data.'
  });
}
