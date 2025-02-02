import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function fetchCarsFromMekina(searchQuery) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://www.mekina.net/cars/search?q=${encodeURIComponent(searchQuery)}`;

    await page.goto(url, { waitUntil: 'networkidle2' });

    const cars = await page.evaluate(() => {
        const carElements = document.querySelectorAll('.relative .m-1 a');
        return Array.from(carElements).map(element => {
            const title = element.querySelector('.text-sm')?.innerText || '';
            const price = element.querySelector('.flex.flex-col.justify-between.bg-primary-main')?.innerText || '';
            const link = element.href || '';
            const image = element.querySelector('img')?.src || ''; // Get the image source
            const location = ''; // Adjust if location is available in the HTML structure

            return { title, price, link, location, image };
        });
    });

    await browser.close();
    console.log(cars); // Log the cars array to see what is being scraped
    return cars;
}

app.get('/api/cars', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const cars = await fetchCarsFromMekina(query);
        res.json(cars);
    } catch (error) {
        console.error('Error fetching car listings:', error);
        res.status(500).json({ error: 'Failed to fetch car listings' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});