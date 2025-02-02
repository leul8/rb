import axios from 'axios';

export default async function handler(req, res) {
  // Get query and platform from the request query params
  const { query, platform } = req.query;

  // Return error if query is not provided
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    let response = [];

    // Fetch data from Mekina if platform is selected or if both platforms are selected
    if (platform === 'mekina' || platform === 'both') {
      const mekinaResponse = await axios.get(`https://rb-4.onrender.com/api/cars?platform=mekina&query=${encodeURIComponent(query)}`);
      response = [...response, ...mekinaResponse.data];
    }

    // Fetch data from Jiji if platform is selected or if both platforms are selected
    if (platform === 'jiji' || platform === 'both') {
      const jijiResponse = await axios.get(`https://rb-4.onrender.com/api/cars?platform=jiji&query=${encodeURIComponent(query)}`);
      response = [...response, ...jijiResponse.data];
    }

    // Return the combined car listings from both platforms (if any)
    res.json(response);
  } catch (error) {
    // Log error to server console
    console.error('Error fetching car listings:', error);
    
    // Respond with an error message if fetching fails
    res.status(500).json({ error: 'Failed to fetch car listings' });
  }
}
