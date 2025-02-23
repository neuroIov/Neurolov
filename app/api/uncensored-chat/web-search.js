import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { query } = req.body;
        const apiKey = process.env.SERPAPI_KEY; // Store API key in .env.local

        if (!query) {
            return res.status(400).json({ status: 'error', error: 'Query is required' });
        }

        try {
            // SerpAPI endpoint
            const searchUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}`;

            // Fetch search results
            const response = await axios.get(searchUrl);
            const searchResults = response.data.organic_results || [];

            res.status(200).json({ status: 'success', results: searchResults });
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    } else {
        res.status(405).json({ status: 'error', error: 'Method not allowed' });
    }
}
