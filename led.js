import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT state FROM led_status ORDER BY updated_at DESC LIMIT 1');
      res.status(200).json({ state: result.rows[0]?.state ?? false });
    } catch (error) {
      console.error('GET error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { state } = req.body;
      await pool.query('UPDATE led_status SET state = $1, updated_at = CURRENT_TIMESTAMP', [state]);
      res.status(200).json({ state });
    } catch (error) {
      console.error('POST error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
