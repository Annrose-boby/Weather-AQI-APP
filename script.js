// API Keys
const weatherApiKey = "885c3ebb634376afb234c9fbcd22e4fd";

// Fetch Weather + AQI
async function getWeatherAndAQI() {
  let city = document.getElementById("cityInput").value || "Delhi";
  
  // Show loading state
  document.body.classList.add('loading');
  document.getElementById('weather-spinner').style.display = 'block';
  
  try {
    // Weather API
    let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    if (!weatherRes.ok) throw new Error('City not found');
    let weatherData = await weatherRes.json();
    
    // Get forecast data
    let forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`);
    let forecastData = await forecastRes.json();
    
    // For AQI, we'll use OpenWeatherMap's air pollution API
    const { lat, lon } = weatherData.coord;
    let aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
    let aqiData = await aqiRes.json();
    
    displayData(weatherData, forecastData, aqiData);
    updateTheme(weatherData.weather[0].main, weatherData.wind.speed);
    updateTime();
  } catch (error) {
    showError(error.message);
  } finally {
    document.body.classList.remove('loading');
    document.getElementById('weather-spinner').style.display = 'none';
  }
}

// Display Data
function displayData(weather, forecast, aqi) {
  // Display current weather
  document.getElementById("weather").innerHTML = `
    <h3>${weather.name}, ${weather.sys.country}</h3>
    <p><i class="fas fa-temperature-high"></i> Temperature: ${weather.main.temp}°C (Feels like ${weather.main.feels_like}°C)</p>
    <p><i class="fas fa-tint"></i> Humidity: ${weather.main.humidity}%</p>
    <p><i class="fas fa-wind"></i> Wind: ${weather.wind.speed} m/s</p>
    <p><i class="fas fa-compress-arrows-alt"></i> Pressure: ${weather.main.pressure} hPa</p>
    <p><i class="fas fa-eye"></i> Visibility: ${(weather.visibility / 1000).toFixed(1)} km</p>
    <p><i class="fas fa-cloud"></i> Condition: ${weather.weather[0].main} - ${weather.weather[0].description}</p>
  `;
  
  // Display 5-day forecast
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";
  
  // Group forecast by day (API returns data for every 3 hours)
  const dailyForecast = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toDateString();
    
    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        temps: [],
        conditions: [],
        icons: [],
        date: date
      };
    }
    
    dailyForecast[day].temps.push(item.main.temp);
    dailyForecast[day].conditions.push(item.weather[0].main);
    dailyForecast[day].icons.push(getWeatherIcon(item.weather[0].main));
  });
  
  // Display forecast for next 5 days
  let count = 0;
  for (const day in dailyForecast) {
    if (count >= 5) break;
    
    const dayData = dailyForecast[day];
    const avgTemp = (dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length).toFixed(1);
    const mostCommonCondition = getMostCommon(dayData.conditions);
    const icon = getWeatherIcon(mostCommonCondition);
    
    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `
      <h4>${dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}</h4>
      <p>${dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
      <p><i class="${icon}"></i></p>
      <p>${mostCommonCondition}</p>
      <p>${avgTemp}°C</p>
    `;
    
    forecastContainer.appendChild(forecastDay);
    count++;
  }
  
  // Display AQI data
  const aqiVal = aqi.list[0].main.aqi;
  const pollutants = aqi.list[0].components;
  
  let aqiLevel, health;
  switch(aqiVal) {
    case 1:
      aqiLevel = "Good";
      health = "Air quality is satisfactory, and air pollution poses little or no risk.";
      break;
    case 2:
      aqiLevel = "Fair";
      health = "Air quality is acceptable. However, there may be a risk for some people.";
      break;
    case 3:
      aqiLevel = "Moderate";
      health = "Members of sensitive groups may experience health effects.";
      break;
    case 4:
      aqiLevel = "Poor";
      health = "Everyone may begin to experience health effects.";
      break;
    case 5:
      aqiLevel = "Very Poor";
      health = "Health warning of emergency conditions.";
      break;
    default:
      aqiLevel = "Unknown";
      health = "No data available.";
  }
  
  document.getElementById("aqi").innerHTML = `
    <div class="aqi-value ${aqiLevel.toLowerCase().replace(' ', '-')}">${aqiVal} - ${aqiLevel}</div>
    <p><span>PM2.5:</span> <span>${pollutants.pm2_5} μg/m³</span></p>
    <p><span>PM10:</span> <span>${pollutants.pm10} μg/m³</span></p>
    <p><span>Ozone (O3):</span> <span>${pollutants.o3} μg/m³</span></p>
    <p><span>Nitrogen (NO2):</span> <span>${pollutants.no2} μg/m³</span></p>
    <p><span>Sulfur (SO2):</span> <span>${pollutants.so2} μg/m³</span></p>
    <p><span>Carbon (CO):</span> <span>${pollutants.co} μg/m³</span></p>
  `;
  
  // Display health recommendations
  document.getElementById("healthTips").innerHTML = `
    <p><i class="fas fa-heart"></i> <strong>Health Status:</strong> ${health}</p>
    <p><i class="fas fa-running"></i> <strong>Outdoor Activities:</strong> ${getActivityRecommendation(aqiVal)}</p>
    <p><i class="fas fa-mask"></i> <strong>Protection:</strong> ${getProtectionRecommendation(aqiVal)}</p>
    <p><i class="fas fa-home"></i> <strong>Indoors:</strong> ${getIndoorRecommendation(aqiVal)}</p>
  `;
}

// Get most common element in array
function getMostCommon(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
  condition = condition.toLowerCase();
  if (condition.includes("cloud")) return "fas fa-cloud";
  if (condition.includes("rain")) return "fas fa-cloud-rain";
  if (condition.includes("clear")) return "fas fa-sun";
  if (condition.includes("snow")) return "fas fa-snowflake";
  if (condition.includes("thunder")) return "fas fa-bolt";
  return "fas fa-cloud";
}

// Get activity recommendation based on AQI
function getActivityRecommendation(aqi) {
  switch(aqi) {
    case 1: return "Ideal for outdoor activities";
    case 2: return "Good for outdoor activities";
    case 3: return "Reduce prolonged outdoor exertion";
    case 4: return "Avoid prolonged outdoor activities";
    case 5: return "Avoid all outdoor activities";
    default: return "No recommendation available";
  }
}

// Get protection recommendation based on AQI
function getProtectionRecommendation(aqi) {
  switch(aqi) {
    case 1: case 2: return "No protection needed";
    case 3: return "Sensitive people should consider reducing outdoor activity";
    case 4: return "Wear a mask outdoors if necessary";
    case 5: return "Wear a mask outdoors and limit time outside";
    default: return "No recommendation available";
  }
}

// Get indoor recommendation based on AQI
function getIndoorRecommendation(aqi) {
  switch(aqi) {
    case 1: case 2: return "Ventilate your home normally";
    case 3: return "Consider reducing ventilation if outdoor air is polluted";
    case 4: case 5: return "Keep windows closed and use air purifiers if available";
    default: return "No recommendation available";
  }
}

// Update theme based on weather condition
function updateTheme(condition, windSpeed) {
  document.body.className = "";
  
  condition = condition.toLowerCase();
  
  if (condition.includes("clear")) {
    document.body.classList.add("sunny");
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    document.body.classList.add("rainy");
  } else if (condition.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (windSpeed > 5) {
    document.body.classList.add("breezy");
  } else {
    // Default theme for night or other conditions
    const hour = new Date().getHours();
    if (hour > 18 || hour < 6) {
      document.body.classList.add("night");
    } else {
      document.body.classList.add("default");
    }
  }
}

// Update time
function updateTime() {
  const now = new Date();
  document.getElementById("update-time").textContent = now.toLocaleString();
}

// Show error message
function showError(message) {
  // Remove any existing errors
  const existingError = document.querySelector('.error');
  if (existingError) existingError.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.innerHTML = `<p><i class="fas fa-exclamation-circle"></i> Error: ${message}</p>`;
  
  document.querySelector('.app-container').insertBefore(errorDiv, document.querySelector('.weather-card'));
  
  // Auto remove error after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Get user location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      error => {
        showError("Location access denied. Using default city.");
        getWeatherAndAQI();
      }
    );
  } else {
    showError("Geolocation is not supported by this browser.");
  }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    document.body.classList.add('loading');
    
    let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`);
    let weatherData = await weatherRes.json();
    
    document.getElementById("cityInput").value = weatherData.name;
    getWeatherAndAQI();
  } catch (error) {
    showError("Failed to get location data.");
  } finally {
    document.body.classList.remove('loading');
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", function() {
  getWeatherAndAQI();
  
  // Add event listener for Enter key in search box
  document.getElementById("cityInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      getWeatherAndAQI();
    }
  });
  
  // Update time every minute
  setInterval(updateTime, 60000);
});
