// netlify/functions/fetchWeather.js

const axios = require('axios');

// 1. GET THE KEYS SECURELY from the environment variables set on Netlify
const METEOMATICS_USERNAME = process.env.METEOMATICS_USERNAME;
const METEOMATICS_PASSWORD = process.env.METEOMATICS_PASSWORD;

exports.handler = async (event, context) => {
    
    // Check for missing coordinates from the frontend request
    const { lat, lng } = event.queryStringParameters;

    if (!METEOMATICS_USERNAME || !METEOMATICS_PASSWORD) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Configuration Error: Meteomatics credentials are not set in Netlify Environment Variables." })
        };
    }
    
    if (!lat || !lng) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Latitude (lat) and Longitude (lng) parameters are required.' })
        };
    }

    // 2. USE THE KEYS to create the authentication header
    const AUTH_HEADER = 'Basic ' + Buffer.from(`${METEOMATICS_USERNAME}:${METEOMATICS_PASSWORD}`).toString('base64');
    
    // --- Meteomatics URL Configuration (7-Day Daily Forecast) ---
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const startTimestamp = startDate.toISOString().split('.')[0] + 'Z';
    const endTimestamp = endDate.toISOString().split('.')[0] + 'Z';

    const parameters = [
        't_max_2m_7d:C',        // Max Temperature
        'precip_24h:mm',        // Total 24h Precipitation
        'wind_speed_10m:km/h',  // Wind Speed
        'humidity_2m:p',        // Humidity
        'weather_symbol_7d:idx' // Weather Icon/Symbol
    ].join(',');
    
    const location = `${lat},${lng}`;
    const METEOMATICS_URL = 
        `https://api.meteomatics.com/${startTimestamp}--${endTimestamp}:P1D/${parameters}/${location}/json`;

    try {
        // 3. Make the secure, authenticated call to the Meteomatics API
        const apiResponse = await axios.get(METEOMATICS_URL, {
            headers: { 'Authorization': AUTH_HEADER },
        });

        // 4. Data Parsing Logic: Transforming the raw data for the React frontend
        const rawData = apiResponse.data.data;
        
        // Find the index of the 'dates' array in the response (usually at index 0, for simplicity)
        const dateDataArray = rawData.find(item => item.parameter === 'precip_24h:mm')?.coordinates[0]?.dates;
        
        if (!dateDataArray) {
             throw new Error("Meteomatics response structure invalid or empty.");
        }

        const forecast = dateDataArray.map((dayData, i) => {
            // Helper function to extract parameter values for the specific date
            const getValue = (param) => rawData.find(p => p.parameter.startsWith(param))?.coordinates[0]?.dates[i]?.value || 0;
            
            const rainfall = getValue('precip_24h');
            const condition = rainfall > 20 ? 'Heavy Rain' : rainfall > 5 ? 'Light Rain' : 'Sunny';
            
            return {
                date: new Date(dayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                temp: Math.round(getValue('t_max_2m_7d')), 
                rainfall: parseFloat(rainfall).toFixed(1), 
                windSpeed: Math.round(getValue('wind_speed_10m')),
                humidity: Math.round(getValue('humidity_2m')),
                condition: condition
            };
        });
        
        const totalRainfall = forecast.reduce((sum, d) => sum + parseFloat(d.rainfall), 0).toFixed(1);

        const formattedWeather = {
            current: forecast[0] || {},
            forecast: forecast.slice(0, 7),
            totalRainfall: totalRainfall
        };

        // 5. Send the formatted, secure data back to the React app
        return {
            statusCode: 200,
            body: JSON.stringify(formattedWeather)
        };

    } catch (error) {
        console.error('Meteomatics API Call Failed:', error.response ? error.response.data : error.message);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to retrieve weather data securely.', 
                detail: error.response ? error.response.data : error.message 
            })
        };
    }
};