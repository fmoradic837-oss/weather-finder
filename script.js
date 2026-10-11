const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status");
const result = document.querySelector("#weather-result");
const locationDisplay = document.querySelector("#location");
const descriptionDisplay = document.querySelector("#description");
const iconDisplay = document.querySelector("#weather-icon");
const temperatureDisplay = document.querySelector("#temperature");
const feelsLikeDisplay = document.querySelector("#feels-like");
const humidityDisplay = document.querySelector("#humidity");
const windDisplay = document.querySelector("#wind");

const weatherDescriptions = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Heavy showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"]
};

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not search for that city. Try again.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try again.");
  }
  return data.results[0];
}

async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather data is unavailable right now.");
  return response.json();
}

function renderWeather(place, data) {
  const current = data.current;
  const [description, icon] = weatherDescriptions[current.weather_code] || ["Current conditions", "🌡️"];
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  locationDisplay.textContent = region ? `${place.name}, ${region}` : place.name;
  descriptionDisplay.textContent = description;
  iconDisplay.textContent = icon;
  temperatureDisplay.textContent = `${Math.round(current.temperature_2m)}°C`;
  feelsLikeDisplay.textContent = `${Math.round(current.apparent_temperature)}°C`;
  humidityDisplay.textContent = `${current.relative_humidity_2m}%`;
  windDisplay.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  result.hidden = false;
  statusMessage.textContent = "Weather updated successfully.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  result.hidden = true;
  statusMessage.textContent = "Loading weather…";

  try {
    const place = await getCoordinates(city);
    const weather = await getWeather(place.latitude, place.longitude);
    renderWeather(place, weather);
  } catch (error) {
    statusMessage.textContent = error.message || "Something went wrong. Please try again.";
  }
});
