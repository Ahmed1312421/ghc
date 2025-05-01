// led.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = {
    async getLedState(req, res) {
        try {
            const result = await pool.query('SELECT state FROM led_status ORDER BY updated_at DESC LIMIT 1');
            res.status(200).json({ state: result.rows[0].state });
        } catch (error) {
            console.error('Database error (GET):', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateLedState(req, res) {
        const { state } = req.body;
        try {
            await pool.query('UPDATE led_status SET state = $1, updated_at = CURRENT_TIMESTAMP', [state]);
            res.status(200).json({ state });
        } catch (error) {
            console.error('Database error (POST):', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
