document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const currentWeatherDiv = document.getElementById('current-weather');
    const airQualityDiv = document.getElementById('air-quality');
    const forecastDiv = document.getElementById('forecast');
    const errorDiv = document.getElementById('error-message');
    const body = document.body;

    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });

    function searchWeather() {
        const city = cityInput.value.trim();
        if (city === '') return;

        // Clear previous results
        errorDiv.style.display = 'none';
        currentWeatherDiv.innerHTML = '';
        airQualityDiv.innerHTML = '';
        forecastDiv.innerHTML = '';

        // Show loading state
        body.classList.add('loading');

        // Fetch weather data
        fetchWeatherData(city)
            .then(data => {
                updateWeatherUI(data);
                body.classList.remove('loading');
            })
            .catch(error => {
                showError(error.message);
                body.classList.remove('loading');
            });
    }

    async function fetchWeatherData(city) {
        // This would be replaced with actual API calls
        // For demonstration, we'll use mock data
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate API response
                const mockData = {
                    city: city,
                    current: {
                        temp: 22,
                        condition: 'Sunny',
                        humidity: 65,
                        wind: 12
                    },
                    aqi: 45,
                    forecast: [
                        { day: 'Mon', temp: 22, condition: 'Sunny' },
                        { day: 'Tue', temp: 20, condition: 'Cloudy' },
                        { day: 'Wed', temp: 18, condition: 'Rainy' },
                        { day: 'Thu', temp: 21, condition: 'Breezy' },
                        { day: 'Fri', temp: 19, condition: 'Cloudy' }
                    ]
                };
                
                // Randomly reject to simulate errors
                if (Math.random() > 0.2) {
                    resolve(mockData);
                } else {
                    reject(new Error('City not found. Please try again.'));
                }
            }, 1000);
        });
    }

    function updateWeatherUI(data) {
        // Update theme based on condition
        updateTheme(data.current.condition);
        
        // Display current weather
        currentWeatherDiv.innerHTML = `
            <h2>Current Weather in ${data.city}</h2>
            <p>Temperature: ${data.current.temp}°C</p>
            <p>Condition: ${data.current.condition}</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <p>Wind: ${data.current.wind} km/h</p>
        `;
        
        // Display air quality
        const aqiLevel = getAqiLevel(data.aqi);
        airQualityDiv.innerHTML = `
            <h2>Air Quality</h2>
            <p class="aqi-value ${aqiLevel.class}">${data.aqi} - ${aqiLevel.text}</p>
        `;
        
        // Display forecast
        data.forecast.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';
            dayElement.innerHTML = `
                <h3>${day.day}</h3>
                <p>${day.temp}°C</p>
                <p>${day.condition}</p>
            `;
            forecastDiv.appendChild(dayElement);
        });
    }

    function updateTheme(condition) {
        // Remove all theme classes
        body.classList.remove('default', 'sunny', 'rainy', 'cloudy', 'breezy', 'night');
        
        // Add appropriate theme based on condition
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('sun')) {
            body.classList.add('sunny');
        } else if (conditionLower.includes('rain')) {
            body.classList.add('rainy');
        } else if (conditionLower.includes('cloud')) {
            body.classList.add('cloudy');
        } else if (conditionLower.includes('breeze')) {
            body.classList.add('breezy');
        } else if (conditionLower.includes('night')) {
            body.classList.add('night');
        } else {
            body.classList.add('default');
        }
    }

    function getAqiLevel(aqi) {
        if (aqi <= 50) return { class: 'good', text: 'Good' };
        if (aqi <= 100) return { class: 'fair', text: 'Fair' };
        if (aqi <= 150) return { class: 'moderate', text: 'Moderate' };
        if (aqi <= 200) return { class: 'unhealthy', text: 'Unhealthy' };
        if (aqi <= 300) return { class: 'very-unhealthy', text: 'Very Unhealthy' };
        return { class: 'hazardous', text: 'Hazardous' };
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
});
