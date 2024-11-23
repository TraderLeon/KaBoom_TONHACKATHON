// dexscreener_api.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Endpoint to get latest pool info
router.get('/api/latest-pool-info/:network/:address', async (req, res) => {
    const { network, address } = req.params;
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${network}/${address}`);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch data from DexScreener' });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;