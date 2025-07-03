let apiKey = "babuji";
const apiBase = "babuji";

const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const darkToggle = document.getElementById("darkToggle");

searchBtn.addEventListener("click", () => {
  const city = document.getElementById("searchInput").value;
  if (city) getWeather(city);
});

geoBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      getWeatherByCoords(latitude, longitude);
    },
    err => showError("Location access denied.")
  );
});

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function getWeather(city) {
  fetch(`${apiBase}weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return showError(data.message);
      updateUI(data);
      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(() => showError("Failed to fetch weather data."));
}

function getWeatherByCoords(lat, lon) {
  fetch(`${apiBase}weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return showError(data.message);
      updateUI(data);
      getForecast(lat, lon);
    })
    .catch(() => showError("Failed to fetch weather data."));
}

function updateUI(data) {
  document.getElementById("error").textContent = "";
  document.getElementById("city").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("desc").textContent = data.weather[0].description;
  document.getElementById("feels").textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;
  document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById("date").textContent = new Date().toDateString();
}

function getForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const labels = [];
      const temps = [];
      data.daily.slice(0, 7).forEach(day => {
        const date = new Date(day.dt * 1000);
        labels.push(date.toLocaleDateString(undefined, { weekday: 'short' }));
        temps.push(day.temp.day);
      });
      renderChart(labels, temps);
      renderForecastCards(data.daily.slice(0, 7));
    });
}

let weatherChart;
function renderChart(labels, temps) {
  const ctx = document.getElementById("forecastChart").getContext("2d");
  if (weatherChart) weatherChart.destroy();
  weatherChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "7-Day Temp (°C)",
        data: temps,
        borderColor: "#0077ff",
        backgroundColor: "rgba(0,119,255,0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function renderForecastCards(days) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";
  days.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    const desc = day.weather[0].description;
    const temp = Math.round(day.temp.day);

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `
      <h4>${dayName}</h4>
      <img src="${iconUrl}" alt="${desc}" />
      <p>${temp}°C</p>
      <small>${desc}</small>
    `;
    forecastContainer.appendChild(card);
  });
}

function showError(msg) {
  document.getElementById("error").textContent = msg;
}
