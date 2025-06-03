import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = 'nador,Beni Enssar';

router.get('/current', async (req, res) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(CITY)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.main || !data.weather) {
      return res.status(500).json({ error: 'Invalid weather data from API', details: data });
    }
    res.json({
      temperature: data.main.temp,
      weather: data.weather[0].description,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      icon: data.weather[0].icon
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather', details: err.message });
  }
});

export default router; 