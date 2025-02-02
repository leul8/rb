import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; // Ensure you import Tailwind CSS
import ClipLoader from 'react-spinners/ClipLoader'; // Import the spinner

function App() {
    const [query, setQuery] = useState('');
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]); // State for filtered cars
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(false); // State for dark mode
    const [selectedBrand, setSelectedBrand] = useState(''); // State for selected brand
    const [minPrice, setMinPrice] = useState(''); // State for minimum price
    const [maxPrice, setMaxPrice] = useState(''); // State for maximum price
    const [location, setLocation] = useState('Addis Ababa'); // Default location set to Addis Ababa
    const [loading, setLoading] = useState(false); // State for loading
    const [platform, setPlatform] = useState('both'); // State for selected platform ('mekina', 'jiji', or 'both')
    const [isSearchPerformed, setIsSearchPerformed] = useState(false); // To track if search was performed
    const [searchCache, setSearchCache] = useState({}); // Cache for search results

    const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes']; // Example brands

    const fetchCars = async () => {
        if (!query) return;

        setLoading(true); // Set loading to true when fetching starts
        setIsSearchPerformed(true); // Mark that a search has been performed

        // Check if the query is already in the cache
        if (searchCache[query]) {
            setCars(searchCache[query]);
            setFilteredCars(searchCache[query]); // Initialize filtered cars with cached data
            setLoading(false);
            return;
        }

        try {
            let response = [];

            // Fetch from Mekina or both platforms if selected
            if (platform === 'mekina' || platform === 'both') {
                const mekinaResponse = await axios.get(`http://localhost:3000/api/cars?platform=mekina&query=${encodeURIComponent(query)}`);
                response = [...response, ...mekinaResponse.data];
            }

            // Fetch from Jiji or both platforms if selected
            if (platform === 'jiji' || platform === 'both') {
                const jijiResponse = await axios.get(`http://localhost:3000/api/cars?platform=jiji&query=${encodeURIComponent(query)}`);
                response = [...response, ...jijiResponse.data];
            }

            // Set location to Addis Ababa for all cars
            const updatedCars = response.map(car => ({
                ...car,
                location: 'Addis Ababa', // Set location to Addis Ababa
            }));

            // Store the result in cache
            setSearchCache(prevCache => ({ ...prevCache, [query]: updatedCars }));

            setCars(updatedCars);
            setFilteredCars(updatedCars); // Initialize filtered cars with updated data
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch car listings');
        } finally {
            setLoading(false); // Set loading to false when fetching ends
        }
    };

    const handleSearch = () => {
        fetchCars();
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark', !darkMode); // Toggle dark class on the root element
    };

    const handleFilter = () => {
        let filtered = cars;

        // Filter by brand
        if (selectedBrand) {
            filtered = filtered.filter(car => car.title.includes(selectedBrand));
        }

        // Filter by price range
        if (minPrice) {
            filtered = filtered.filter(car => {
                const price = parseFloat(car.price.replace(/ETB|[^0-9.-]+/g, "").trim());
                return price >= parseFloat(minPrice);
            });
        }
        if (maxPrice) {
            filtered = filtered.filter(car => {
                const price = parseFloat(car.price.replace(/ETB|[^0-9.-]+/g, "").trim());
                return price <= parseFloat(maxPrice);
            });
        }

        // Filter by location (now default is Addis Ababa)
        if (location) {
            filtered = filtered.filter(car => car.location && car.location.toLowerCase().includes(location.toLowerCase()));
        }

        setFilteredCars(filtered); // Update the filtered cars state
    };

    return (
        <div className={`App min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <header className="p-5 text-center relative">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Search for Cars in Ethiopia</h1>

                {/* Dark mode toggle below the title on mobile */}
                <div className="sm:absolute sm:top-5 sm:right-5 sm:mt-0 mt-4 flex justify-center items-center">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 bg-transparent text-white rounded flex items-center"
                    >
                        {darkMode ? (
                            <i className="fas fa-sun text-xl"></i> // Sun icon for dark mode
                        ) : (
                            <i className="fas fa-moon text-xl text-black"></i> // Moon icon for light mode, moon color is black
                        )}
                    </button>
                </div>

                {/* Platform Dropdown */}
                <div className="mt-4 flex justify-center">
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className={`p-2 border border-gray-300 rounded mb-2 sm:mb-0 w-full sm:w-1/4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                    >
                        <option value="both">Both Jiji and Mekina</option>
                        <option value="mekina">Mekina.net</option>
                        <option value="jiji">Jiji</option>
                    </select>
                </div>

                {/* Search Input and Filter Inputs */}
                <div className="mt-4 flex flex-col sm:flex-row justify-center items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value.trim())} // Trimming the input
                        placeholder="Search for cars..."
                        className={`p-2 w-full sm:w-1/3 border border-gray-300 rounded mb-2 sm:mb-0 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                    />
                    <button
                        onClick={handleSearch}
                        className="ml-2 p-2 bg-green-500 text-white rounded w-full sm:w-auto"
                    >
                        Search
                    </button>
                </div>

                {/* Filter Inputs */}
                <div className="mt-4 flex flex-col sm:flex-row justify-center items-center">
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className={`p-2 border border-gray-300 rounded mb-2 sm:mb-0 w-full sm:w-1/4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                    >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min Price"
                        className={`p-2 border border-gray-300 rounded mb-2 sm:mb-0 w-full sm:w-1/4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                    />
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max Price"
                        className={`p-2 border border-gray-300 rounded mb-2 sm:mb-0 w-full sm:w-1/4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                    />
                    <button
                        onClick={handleFilter}
                        className="ml-2 p-2 bg-blue-500 text-white rounded w-full sm:w-auto"
                    >
                        Apply Filters
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <ClipLoader loading={loading} size={50} color={darkMode ? '#ffffff' : '#000000'} />
                </div>
            ) : (
                <main className="p-5">
                    {error && <p className="text-red-500">{error}</p>}
                    <div id="results" className="mt-4">
                        {/* Only show "No results found" after a search has been performed */}
                        {isSearchPerformed && filteredCars.length === 0 ? (
                            <p>No results found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredCars.map((car, index) => (
                                    <div
                                        className={`p-4 mb-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                                        key={index}
                                    >
                                        <img src={car.image} alt={car.title} className="mt-2 rounded w-full h-48 object-cover" />
                                        <h2 className="text-xl font-bold">{car.title}</h2>
                                        <p className="text-lg font-semibold">{car.price}</p>
                                        <p className={`text-gray-600 ${darkMode ? 'text-white' : 'text-gray-600'}`}>{car.description}</p>
                                        <p className="text-gray-500">Location: {car.location}</p>
                                        <a href={car.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 mt-2 inline-block">
                                            View Listing
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
}

export default App;
