// API Keys - Replace with your actual API keys
/*const weatherApiKey = "885c3ebb634376afb234c9fbcd22e4fd";
// Note: For AQI, you'll need to sign up for a service like IQAir and get an API key

// Fetch Weather + AQI
async function getWeatherAndAQI() {
  let city = document.getElementById("cityInput").value || "Delhi";
  
  // Show loading state
  document.body.classList.add('loading');
  
  try {
    // Weather API
    let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    if (!weatherRes.ok) throw new Error('City not found');
    let weatherData = await weatherRes.json();
    
    // Get forecast data
    let forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`);
    let forecastData = await forecastRes.json();
    
    // For AQI, we'll use OpenWeatherMap's air pollution API
    // Note: This requires coordinates, so we'll use the weather data's coordinates
    const { lat, lon } = weatherData.coord;
    let aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
    let aqiData = await aqiRes.json();
    
    displayData(weatherData, forecastData, aqiData);
    updateTheme(weatherData.weather[0].main);
  } catch (error) {
    showError(error.message);
  } finally {
    document.body.classList.remove('loading');
  }
}

// Display Data
function displayData(weather, forecast, aqi) {
  // Display current weather
  document.getElementById("weather").innerHTML = `
    <h3>Weather in ${weather.name}, ${weather.sys.country}</h3>
    <p>🌡️ Temp: ${weather.main.temp}°C (Feels like ${weather.main.feels_like}°C)</p>
    <p>💧 Humidity: ${weather.main.humidity}%</p>
    <p>🌬️ Wind: ${weather.wind.speed} m/s</p>
    <p>🌤️ Condition: ${weather.weather[0].main} - ${weather.weather[0].description}</p>
  `;
  
  // Display 5-day forecast
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";
  
  // Group forecast by day (API returns data for every 3 hours)
  const dailyForecast = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toDateString();
    
    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        temps: [],
        conditions: [],
        date: date
      };
    }
    
    dailyForecast[day].temps.push(item.main.temp);
    dailyForecast[day].conditions.push(item.weather[0].main);
  });
  
  // Display forecast for next 5 days
  let count = 0;
  for (const day in dailyForecast) {
    if (count >= 5) break;
    
    const dayData = dailyForecast[day];
    const avgTemp = (dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length).toFixed(1);
    const mostCommonCondition = getMostCommon(dayData.conditions);
    
    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `
      <h4>${dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}</h4>
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
      health = "✅ Good – Air quality is satisfactory, and air pollution poses little or no risk.";
      break;
    case 2:
      aqiLevel = "Fair";
      health = "🙂 Fair – Air quality is acceptable. However, there may be a risk for some people.";
      break;
    case 3:
      aqiLevel = "Moderate";
      health = "⚠️ Moderate – Members of sensitive groups may experience health effects.";
      break;
    case 4:
      aqiLevel = "Poor";
      health = "🚫 Poor – Some members of the general public may experience health effects.";
      break;
    case 5:
      aqiLevel = "Very Poor";
      health = "❌ Very Poor – Health alert: The risk of health effects is increased for everyone.";
      break;
    default:
      aqiLevel = "Unknown";
      health = "Data not available";
  }
  
  document.getElementById("aqi").innerHTML = `
    <h3>Air Quality Index</h3>
    <p class="aqi-value ${aqiLevel.toLowerCase().replace(' ', '-')}">${aqiVal} - ${aqiLevel}</p>
    <p>PM2.5: ${pollutants.pm2_5} μg/m³</p>
    <p>PM10: ${pollutants.pm10} μg/m³</p>
    <p>CO: ${pollutants.co} μg/m³</p>
    <p>NO₂: ${pollutants.no2} μg/m³</p>
    <p>O₃: ${pollutants.o3} μg/m³</p>
    <p>SO₂: ${pollutants.so2} μg/m³</p>
  `;
  
  // Display health tips
  document.getElementById("healthTips").innerHTML = `
    <h3>Health Recommendations</h3>
    <p>${health}</p>
    ${getHealthTips(aqiVal, weather.weather[0].main)}
  `;
}

// Get most common value in array
function getMostCommon(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

// Get health tips based on AQI and weather
function getHealthTips(aqi, weather) {
  let tips = "";
  
  // AQI-based tips
  if (aqi >= 4) {
    tips += "<p>• Wear a mask outdoors</p>";
    tips += "<p>• Avoid prolonged outdoor exertion</p>";
    tips += "<p>• Keep windows closed</p>";
  } else if (aqi >= 3) {
    tips += "<p>• Sensitive groups should reduce outdoor activities</p>";
  }
  
  // Weather-based tips
  if (weather.includes("Rain")) {
    tips += "<p>• Carry an umbrella</p>";
  } else if (weather.includes("Snow")) {
    tips += "<p>• Drive carefully, roads may be slippery</p>";
  } else if (weather.includes("Clear")) {
    tips += "<p>• Apply sunscreen if going outside</p>";
  } else if (weather.includes("Extreme")) {
    tips += "<p>• Avoid outdoor activities</p>";
  }
  
  return tips;
}

// Update theme based on weather condition
function updateTheme(weatherCondition) {
  document.body.className = "";
  
  if (weatherCondition.includes("Clear")) {
    const hours = new Date().getHours();
    document.body.classList.add(hours > 6 && hours < 20 ? 'sunny' : 'night');
  } else if (weatherCondition.includes("Rain") || weatherCondition.includes("Drizzle")) {
    document.body.classList.add('rainy');
  } else if (weatherCondition.includes("Cloud") || weatherCondition.includes("Fog")) {
    document.body.classList.add('cloudy');
  } else {
    document.body.classList.add('sunny');
  }
}

// Get user's location
function getLocation() {
  if (navigator.geolocation) {
    document.body.classList.add('loading');
    navigator.geolocation.getCurrentPosition(
      position => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      error => {
        showError("Location access denied. Please enter a city name manually.");
        document.body.classList.remove('loading');
      }
    );
  } else {
    showError("Geolocation is not supported by this browser.");
  }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    // Weather API
    let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`);
    let weatherData = await weatherRes.json();
    
    // Get forecast data
    let forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`);
    let forecastData = await forecastRes.json();
    
    // Get AQI data
    let aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
    let aqiData = await aqiRes.json();
    
    displayData(weatherData, forecastData, aqiData);
    updateTheme(weatherData.weather[0].main);
    
    // Update city input with detected location
    document.getElementById("cityInput").value = weatherData.name;
  } catch (error) {
    showError("Failed to get weather data for your location.");
  } finally {
    document.body.classList.remove('loading');
  }
}

// Show error message
function showError(message) {
  // Remove any existing errors
  const existingErrors = document.querySelectorAll('.error');
  existingErrors.forEach(error => error.remove());
  
  // Create error element
  const errorEl = document.createElement('div');
  errorEl.className = 'error';
  errorEl.textContent = message;
  
  // Insert after search container
  const searchContainer = document.querySelector('.search-container');
  searchContainer.parentNode.insertBefore(errorEl, searchContainer.nextSibling);
  
  // Remove error after 5 seconds
  setTimeout(() => {
    errorEl.remove();
  }, 5000);
}

// Allow pressing Enter to search
document.getElementById("cityInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    getWeatherAndAQI();
  }
});*/

// API Keys - Replace with your actual API keys
const weatherApiKey = "885c3ebb634376afb234c9fbcd22e4fd";
// Note: For AQI, you'll need to sign up for a service like IQAir and get an API key

// Fetch Weather + AQI
async function getWeatherAndAQI() {
  let city = document.getElementById("cityInput").value || "Delhi";
  
  // Show loading state
  document.body.classList.add('loading');
  
  try {
    // Weather API
    let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    if (!weatherRes.ok) throw new Error('City not found');
    let weatherData = await weatherRes.json();
    
    // Get forecast data
    let forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`);
    let forecastData = await forecastRes.json();
    
    // For AQI, we'll use OpenWeatherMap's air pollution API
    // Note: This requires coordinates, so we'll use the weather data's coordinates
    const { lat, lon } = weatherData.coord;
    let aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
    let aqiData = await aqiRes.json();
    
    displayData(weatherData, forecastData, aqiData);
    updateTheme(weatherData.weather[0].main, weatherData.wind.speed);
  } catch (error) {
    showError(error.message);
  } finally {
    document.body.classList.remove('loading');
  }
}

// Display Data
function displayData(weather, forecast, aqi) {
  // Display current weather
  document.getElementById("weather").innerHTML = `
    <h3>Weather in ${weather.name}, ${weather.sys.country}</h3>
    <p>🌡️ Temp: ${weather.main.temp}°C (Feels like ${weather.main.feels_like}°C)</p>
    <p>💧 Humidity: ${weather.main.humidity}%</p>
    <p>🌬️ Wind: ${weather.wind.speed} m/s</p>
    <p>🌤️ Condition: ${weather.weather[0].main} - ${weather.weather[0].description}</p>
  `;
  
  // Display 5-day forecast
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";
  
  // Group forecast by day (API returns data for every 3 hours)
  const dailyForecast = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toDateString();
    
    if (!dailyForecast[day]) {
      dailyForecast[day] = {
        temps: [],
        conditions: [],
        date: date
      };
    }
    
    dailyForecast[day].temps.push(item.main.temp);
    dailyForecast[day].conditions.push(item.weather[0].main);
  });
  
  // Display forecast for next 5 days
  let count = 0;
  for (const day in dailyForecast) {
    if (count >= 5) break;
    
    const dayData = dailyForecast[day];
    const avgTemp = (dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length).toFixed(1);
    const mostCommonCondition = getMostCommon(dayData.conditions);
    
    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `
      <h4>${dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}</h4>
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
      health = "✅ Good – Air quality is satisfactory, and air pollution poses little or no risk.";
      break;
    case 2:
      aqiLevel = "Fair";
      health = "🙂 Fair – Air quality is acceptable. However, there may be a risk for some people.";
      break;
    case 3:
      aqiLevel = "Moderate";
      health = "⚠️ Moderate – Members of sensitive groups may experience health effects.";
      break;
    case 4:
      aqiLevel = "Poor";
      health = "🚫 Poor – Some members of the general public may experience health effects.";
      break;
    case 5:
      aqiLevel = "Very Poor";
      health = "❌ Very Poor – Health alert: The risk of health effects is increased for everyone.";
      break;
    default:
      aqiLevel = "Unknown";
      health = "Data not available";
  }
  
  document.getElementById("aqi").innerHTML = `
    <h3>Air Quality Index</h3>
    <p class="aqi-value ${aqiLevel.toLowerCase().replace(' ', '-')}">${aqiVal} - ${aqiLevel}</p>
    <p>PM2.5: ${pollutants.pm2_5} μg/m³</p>
    <p>PM10: ${pollutants.pm10} μg/m³</p>
    <p>CO: ${pollutants.co} μg/m³</p>
    <p>NO₂: ${pollutants.no2} μg/m³</p>
    <p>O₃: ${pollutants.o3} μg/m³</p>
    <p>SO₂: ${pollutants.so2} μg/m³</p>
  `;
  
  // Display health tips
  document.getElementById("healthTips").innerHTML = `
    <h3>Health Recommendations</h3>
    <p>${health}</p>
    ${getHealthTips(aqiVal, weather.weather[0].main)}
  `;
}

// Get most common value in array
function getMostCommon(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

// Get health tips based on AQI and weather
function getHealthTips(aqi, weather) {
  let tips = "";
  
  // AQI-based tips
  if (aqi >= 4) {
    tips += "<p>• Wear a mask outdoors</p>";
    tips += "<p>• Avoid prolonged outdoor exertion</p>";
    tips += "<p>• Keep windows closed</p>";
  } else if (aqi >= 3) {
    tips += "<p>• Sensitive groups should reduce outdoor activities</p>";
  }
  
  // Weather-based tips
  if (weather.includes("Rain")) {
    tips += "<p>• Carry an umbrella</p>";
  } else if (weather.includes("Snow")) {
    tips += "<p>• Drive carefully, roads may be slippery</p>";
  } else if (weather.includes("Clear")) {
    tips += "<p>• Apply sunscreen if going outside</p>";
  } else if (weather.includes("Extreme")) {
    tips += "<p>• Avoid outdoor activities</p>";
  }
  
  return tips;
}

// Update theme based on weather condition and wind speed
function updateTheme(weatherCondition, windSpeed) {
  document.body.className = "";
  
  if (weatherCondition.includes("Clear")) {
    const hours = new Date().getHours();
    document.body.classList.add(hours > 6 && hours < 20 ? 'sunny' : 'night');
  } else if (weatherCondition.includes("Rain") || weatherCondition.includes("Drizzle")) {
    document.body.classList.add('rainy');
  } else if (weatherCondition.includes("Cloud") || weatherCondition.includes("Fog")) {
    document.body.classList.add('cloudy');
  } else if (windSpeed > 5) { // Breezy condition (wind speed > 5 m/s)
    document.body.classList.add('breezy');
  } else {
    document.body.classList.add('default');
  }
}

// Get user's location
function getLocation() {
  if (navigator.geolocation) {
    document.body.classList.add('loading');
    navigator.geolocation.getCurrentPosition(
      position => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      error => {
        showError("Location access denied. Please enter a city name manually.");
        document.body.classList.remove('loading');
      }
    );
  } else {
    showError("Geolocation is not supported by this browser.");
  }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    // Weather API
    let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`);
    let weatherData = await weatherRes.json();
    
    // Get forecast data
    let forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`);
    let forecastData = await forecastRes.json();
    
    // Get AQI data
    let aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`);
    let aqiData = await aqiRes.json();
    
    displayData(weatherData, forecastData, aqiData);
    updateTheme(weatherData.weather[0].main, weatherData.wind.speed);
    
    // Update city input with detected location
    document.getElementById("cityInput").value = weatherData.name;
  } catch (error) {
    showError("Failed to get weather data for your location.");
  } finally {
    document.body.classList.remove('loading');
  }
}

// Show error message
function showError(message) {
  // Remove any existing errors
  const existingErrors = document.querySelectorAll('.error');
  existingErrors.forEach(error => error.remove());
  
  // Create error element
  const errorEl = document.createElement('div');
  errorEl.className = 'error';
  errorEl.textContent = message;
  
  // Insert after search container
  const searchContainer = document.querySelector('.search-container');
  searchContainer.parentNode.insertBefore(errorEl, searchContainer.nextSibling);
  
  // Remove error after 5 seconds
  setTimeout(() => {
    errorEl.remove();
  }, 5000);
}

// Allow pressing Enter to search
document.getElementById("cityInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    getWeatherAndAQI();
  }
});

// Initialize with default city
window.onload = function() {
  getWeatherAndAQI();
};

// Initialize with default city
window.onload = function() {
  getWeatherAndAQI();

};
