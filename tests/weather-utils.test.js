const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWeatherAdvice } = require('../server');

test('suggests indoor habits for rainy weather', () => {
  const advice = buildWeatherAdvice({
    name: 'Kigali',
    main: { temp: 20 },
    weather: [{ description: 'light rain' }],
  });

  assert.equal(advice.city, 'Kigali');
  assert.match(advice.advice, /indoor/i);
});

test('suggests outdoor habits for clear weather', () => {
  const advice = buildWeatherAdvice({
    name: 'Kigali',
    main: { temp: 28 },
    weather: [{ description: 'clear sky' }],
  });

  assert.match(advice.advice, /outdoor/i);
});

test('handles weather codes when description is unavailable', () => {
  const advice = buildWeatherAdvice({
    name: 'Kigali',
    temp: 24,
    current: { weather_code: 0 },
  });

  assert.equal(advice.city, 'Kigali');
  assert.match(advice.description, /clear/i);
});
