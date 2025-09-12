document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const currentWeatherDiv = document.getElementById('current-weather');
    const airQualityDiv = document.getElementById('air-quality');
    const forecastDiv = document.getElementById('forecast');
    const errorDiv = document.getElementById('error-message');
    const body = document.body;
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Add event listeners
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    
    // Theme buttons functionality
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
        });
    });

    function searchWeather() {
        const city = cityInput.value.trim();
        if (city === '') return;

        // Clear previous results
        hideError();
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

    function changeTheme(theme) {
        // Remove all theme classes
        body.classList.remove('default', 'sunny', 'rainy', 'cloudy', 'breezy', 'night');
        
        // Add the selected theme
        body.classList.add(theme);
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
                        temp: Math.round(Math.random() * 30 + 5),
                        condition: ['Sunny', 'Rainy', 'Cloudy', 'Breezy', 'Night'][Math.floor(Math.random() * 5)],
                        humidity: Math.round(Math.random() * 100),
                        wind: Math.round(Math.random() * 30)
                    },
                    aqi: Math.round(Math.random() * 300),
                    forecast: [
                        { day: 'Mon', temp: Math.round(Math.random() * 30 + 5), condition: 'Sunny' },
                        { day: 'Tue', temp: Math.round(Math.random() * 30 + 5), condition: 'Cloudy' },
                        { day: 'Wed', temp: Math.round(Math.random() * 30 + 5), condition: 'Rainy' },
                        { day: 'Thu', temp: Math.round(Math.random() * 30 + 5), condition: 'Breezy' },
                        { day: 'Fri', temp: Math.round(Math.random() * 30 + 5), condition: 'Night' }
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
        changeTheme(data.current.condition.toLowerCase());
        
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

    function hideError() {
        errorDiv.style.display = 'none';
    }
});
