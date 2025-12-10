import React, { useState, useEffect } from "react";
import "./weather.css"; // your CSS file

const API_KEY = process.env.REACT_APP_OPENWEATHER_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => {
    const saved = localStorage.getItem("recentCities");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("recentCities", JSON.stringify(recent));
  }, [recent]);

  const fetchWeather = async (cityName) => {
    if (!API_KEY) {
      setError("Please add your API key inside .env");
      return;
    }

    setError("");
    setLoading(true);
    setWeather(null);

    try {
      const url = `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 404) throw new Error("City not found");
        if (res.status === 401) throw new Error("Invalid API key");
        throw new Error("Unable to fetch weather");
      }

      const data = await res.json();

      setWeather({
        name: data.name,
        temp: data.main.temp,
        desc: data.weather[0].description,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        icon: data.weather[0].icon,
      });

      setRecent((prev) => {
        const updated = [cityName, ...prev.filter((c) => c !== cityName)];
        return updated.slice(0, 5);
      });
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    fetchWeather(city.trim());
  };

  return (
    <div className="container">
      <h1>Weather App</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      {error && <p id="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.temp}°C</p>
          <p>Condition: {weather.desc}</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind: {weather.wind} m/s</p>
          <div id="icon">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="Weather Icon"
            />
          </div>
        </div>
      )}

      <div id="recentSearches">
        {recent.length > 0 && <strong>Recent:</strong>}
        {recent.map((c) => (
          <button
            key={c}
            className="recent-btn"
            onClick={() => {
              setCity(c);
              fetchWeather(c);
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
