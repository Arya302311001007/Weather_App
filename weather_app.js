
const apiKey = "caaf78398c7c90dcca6048b66001304d";


const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorEl = document.getElementById("error");

const weatherCard = document.getElementById("weatherResult");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("icon");

const recentContainer = document.getElementById("recentSearches");

function showError(msg) {
  errorEl.textContent = msg || "";
}

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Loading..." : "Get Weather";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name");

  if (!apiKey || apiKey.includes("PASTE_YOUR")) {
    return showError("Please paste your OpenWeather API key in weather_app.js");
  }

  fetchWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

async function fetchWeather(city) {
  showError("");
  weatherCard.classList.add("hidden");

  setLoading(true);
  try {
    const url = `${baseUrl}?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(apiKey)}&units=metric`;

    const response = await fetch(url);

    
    if (!response.ok) {
      let msg = "Failed to fetch weather data";
      try {
        const errData = await response.json();
        if (errData && errData.message) msg = errData.message;
      } catch (_) {}

      if (response.status === 404) msg = "City not found";
      if (response.status === 401) msg = "Invalid API key (check your apiKey)";
      if (response.status === 429) msg = "Too many requests. Try again later.";

      throw new Error(msg);
    }

    const data = await response.json();
    displayWeather(data);

    saveToRecentSearches(city);
    renderRecentSearches();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function displayWeather(data) {
  const city = data?.name ?? "";
  const temp = Math.round(data?.main?.temp);
  const desc = data?.weather?.[0]?.description ?? "";
  const humidity = data?.main?.humidity;
  const wind = data?.wind?.speed;
  const iconCode = data?.weather?.[0]?.icon ?? "";

  cityNameEl.textContent = city;
  tempEl.textContent = `Temperature: ${temp} °C`;
  descEl.textContent = `Condition: ${desc}`;
  humidityEl.textContent = `Humidity: ${humidity}%`;
  windEl.textContent = `Wind: ${wind} m/s`;

  iconEl.innerHTML = iconCode
    ? `<img src="https://openweathermap.org/img/wn/${escapeHtml(iconCode)}@2x.png" alt="${escapeHtml(desc)}" />`
    : "";

  weatherCard.classList.remove("hidden");
}


const RECENT_KEY = "recentWeatherCities";

function getRecentSearches() {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToRecentSearches(city) {
  let recent = getRecentSearches();
  recent = [city, ...recent.filter(c => c.toLowerCase() !== city.toLowerCase())];
  recent = recent.slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

function renderRecentSearches() {
  const recent = getRecentSearches();

  if (recent.length === 0) {
    recentContainer.innerHTML = "";
    return;
  }

 
  recentContainer.innerHTML = "";
  const title = document.createElement("div");
  title.innerHTML = "<strong>Recent:</strong>";
  recentContainer.appendChild(title);

  recent.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "recent-btn";
    btn.textContent = city;
    btn.addEventListener("click", () => {
      cityInput.value = city;
      if (!apiKey || apiKey.includes("PASTE_YOUR")) {
        showError("Please paste your OpenWeather API key in weather_app.js");
        return;
      }
      fetchWeather(city);
    });
    recentContainer.appendChild(btn);
  });
}


renderRecentSearches();
