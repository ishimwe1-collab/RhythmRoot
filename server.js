const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

function getFetchImpl() {
  if (typeof globalThis.fetch === 'function' && globalThis.fetch.name !== 'fetch') {
    return globalThis.fetch;
  }

  const nodeFetch = require('node-fetch');
  return nodeFetch.default || nodeFetch.default?.default || nodeFetch;
}

function getApiKey() {
  return process.env.OPENWEATHER_API_KEY?.trim();
}

function buildWeatherAdvice(weatherData) {
  const city = weatherData?.name || 'your location';
  const temp = weatherData?.main?.temp ?? weatherData?.current?.temperature ?? 0;
  const rawDescription = weatherData?.weather?.[0]?.description || weatherData?.current?.weather_description || '';
  const weatherCode = weatherData?.current?.weather_code;
  let description = rawDescription || 'unknown conditions';

  if (!rawDescription && typeof weatherCode === 'number') {
    const descriptions = {
      0: 'clear sky',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'rime fog',
      51: 'light drizzle',
      53: 'moderate drizzle',
      55: 'dense drizzle',
      61: 'light rain',
      63: 'moderate rain',
      65: 'heavy rain',
      71: 'light snow',
      73: 'moderate snow',
      75: 'heavy snow',
      95: 'thunderstorm',
      96: 'thunderstorm with hail',
      99: 'thunderstorm with hail',
    };
    description = descriptions[weatherCode] || 'unknown conditions';
  }

  const isRainy = /rain|storm|snow|drizzle|mist/i.test(description);
  const advice = isRainy
    ? 'A rainy day is a great time for an indoor habit like reading, journaling, or stretching.'
    : 'The weather looks friendly for an outdoor habit like walking, gardening, or a quick workout.';

  return {
    city,
    temp: `${Math.round(temp)}°C`,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    advice,
  };
}

app.get('/api/weather', async (req, res) => {
  const city = req.query.city || 'Kigali';

  try {
    const fetchImpl = getFetchImpl();
    const response = await fetchImpl(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}`);
    }

    const data = await response.json();
    const current = data?.current_condition?.[0] || {};
    const weatherDescription = current?.weatherDesc?.[0]?.value || '';
    const weatherData = {
      name: city,
      main: { temp: Number(current?.temp_C) || 0 },
      weather: [{ description: weatherDescription }],
      current: {
        temperature: Number(current?.temp_C) || 0,
        weather_code: current?.weatherCode ? Number(current.weatherCode) : undefined,
        weather_description: weatherDescription,
      },
    };

    return res.json(buildWeatherAdvice(weatherData));
  } catch (error) {
    return res.status(502).json({ error: 'Unable to fetch weather right now.', details: error.message });
  }
});

app.use(express.static('.'));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RhythmRoot server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, buildWeatherAdvice, getApiKey };
