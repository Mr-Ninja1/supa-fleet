import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
const hasClientBuild = fs.existsSync(clientIndexPath);

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Home anchor coordinate in Kitwe, Zambia
const HOME_LAT = -12.943;
const HOME_LNG = 28.639;

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function classifyStatus(distanceMeters) {
  if (distanceMeters < 150) return 'immediate';
  if (distanceMeters < 500) return 'near';
  return 'far';
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Supa-Fleet API gateway' });
});

app.post('/location', async (req, res) => {
  try {
    const { device_id, latitude, longitude, speed, nickname } = req.body;

    if (!device_id || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'device_id, latitude, and longitude are required' });
    }

    const distanceKm = haversineDistanceKm(HOME_LAT, HOME_LNG, latitude, longitude);
    const distanceMeters = distanceKm * 1000;
    const status = classifyStatus(distanceMeters);

    // Use a Postgres function so vehicles + location_logs are updated atomically
    const { data: vehicle, error } = await supabase.rpc('update_vehicle_location', {
      p_device_id: device_id,
      p_lat: latitude,
      p_lng: longitude,
      p_status: status,
      p_speed: typeof speed === 'number' ? speed : null,
      p_nickname: typeof nickname === 'string' && nickname.trim() !== '' ? nickname.trim() : null,
    });

    if (error) {
      console.error('Supabase rpc update_vehicle_location error:', error);
      return res.status(500).json({ error: 'Failed to update vehicle location' });
    }

    return res.json({ success: true, status, distance_meters: distanceMeters, vehicle });
  } catch (err) {
    console.error('Error handling /location:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

if (hasClientBuild) {
  app.use(express.static(clientDistPath));

  app.get('*', (_req, res) => {
    res.sendFile(clientIndexPath);
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Supa-Fleet API gateway (client build not found)'
    });
  });
}

app.listen(PORT, () => {
  console.log(`Supa-Fleet API listening on port ${PORT}`);
});
