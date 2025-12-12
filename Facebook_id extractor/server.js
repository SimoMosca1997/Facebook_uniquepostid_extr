const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

// Servire front-end statico
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint per estrarre Facebook IDs
app.post('/extract-facebook', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36'
            }
        });

        const html = response.data;

        const fbidMatch = html.match(/fbid=(\d+)/);
        const postIdMatch = html.match(/post_id\\?":(\d+)/);

        const fbid = fbidMatch ? fbidMatch[1] : null;
        const post_id = postIdMatch ? postIdMatch[1] : null;

        if (!fbid && !post_id) return res.status(404).json({ error: "IDs not found in page source" });

        res.json({ fbid, post_id });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch page" });
    }
});

// Port di Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
