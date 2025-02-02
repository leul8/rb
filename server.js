import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Fetch cars from Mekina.net using Cheerio
async function fetchCarsFromMekina(searchQuery) {
    const url = `https://www.mekina.net/cars/search?q=${encodeURIComponent(searchQuery)}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Parsing the cars data
        const cars = [];
        $('.relative .m-1 a').each((index, element) => {
            const title = $(element).find('.text-sm').text() || '';
            const price = $(element).find('.flex.flex-col.justify-between.bg-primary-main').text() || '';
            const link = $(element).attr('href') || '';
            const image = $(element).find('img').attr('src') || '';
            const location = ''; // Adjust if location is available in the HTML structure

            cars.push({ title, price, link, location, image });
        });

        return cars;
    } catch (error) {
        console.error('Error fetching data from Mekina:', error);
        throw new Error('Failed to fetch car listings from Mekina');
    }
}

// Fetch cars from Jiji (Similar to Mekina, you need to implement scraping logic for Jiji)
async function fetchCarsFromJiji(searchQuery) {
    // Implement your scraping logic here using Cheerio or Axios, similar to Mekina
    return []; // Replace with actual scraping results from Jiji
}

app.get('/api/cars', async (req, res) => {
    const { query, platform } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        let cars = [];

        // Fetch from Mekina or both platforms if selected
        if (platform === 'mekina' || platform === 'both') {
            const mekinaCars = await fetchCarsFromMekina(query);
            cars = [...cars, ...mekinaCars];
        }

        // Fetch from Jiji or both platforms if selected
        if (platform === 'jiji' || platform === 'both') {
            const jijiCars = await fetchCarsFromJiji(query);
            cars = [...cars, ...jijiCars];
        }

        res.json(cars);
    } catch (error) {
        console.error('Error fetching car listings:', error);
        res.status(500).json({ error: 'Failed to fetch car listings' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
