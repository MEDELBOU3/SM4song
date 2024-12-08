
    
    //  the  template in createWeatherModal function
    function createWeatherModal() {
        const weatherModal = document.createElement('div');
        weatherModal.id = 'weatherContainer';
        weatherModal.className = 'side-modal weather-modal';
        weatherModal.innerHTML = `
            <div class="modal-header">
                <h2>Weather Forecast</h2>
                <div class="modal-controls">
                    <button id="closeWeather"><i class="fa fa-times"></i></button>
                </div>
            </div>
            <div class="weather-content">
                <div class="modal-search">
                    <div class="search-wrapper">
                        <input type="text" id="citySearch" placeholder="Search city...">
                        <div id="searchSuggestions" class="search-suggestions"></div>
                    </div>
                    <button id="searchCityBtn"><i class="fas fa-search"></i></button>
                    <button id="showSavedCitiesBtn"><i class="fas fa-list"></i> Saved Cities</button>
                </div>
                <div class="weather-current">
                    <div class="location-info">
                        <div class="location-header">
                            <h3>Current Location</h3>
                            <img class="country-flag" src="" alt="Country Flag">
                        </div>
                        <p class="city-name">Loading...</p>
                        <p class="country-info">--</p>
                        <p class="local-time">--</p>
                        <div class="location-actions">
                            <button class="save-city-btn">
                                <i class="fas fa-bookmark"></i> Save City
                            </button>
                            <button id="toggleUnit" class="settings" title="Toggle Temperature Unit">°C/°F</button>
                            <button id="refreshWeather" class="settings" title="Refresh"><i class="fas fa-sync-alt"></i></button>
                            <button class="share-weather-btn">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="weather-info">
                        <div class="temp-container">
                            <span class="temperature">--°C</span>
                            <img class="weather-icon" src="" alt="Weather">
                        </div>
                        <div class="weather-details">
                            <p class="description">--</p>
                            <div class="details-grid">
                                <div class="detail-item">
                                    <i class="fas fa-tint"></i>
                                    <p class="humidity">Humidity: --%</p>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-wind"></i>
                                    <p class="wind">Wind: -- km/h</p>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-compress-alt"></i>
                                    <p class="pressure">Pressure: -- hPa</p>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-eye"></i>
                                    <p class="visibility">Visibility: -- km</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="sun-info">
                        <div class="sunrise">
                            <i class="fas fa-sunrise"></i>
                            <span>--:--</span>
                        </div>
                        <div class="sunset">
                            <i class="fas fa-sunset"></i>
                            <span>--:--</span>
                        </div>
                    </div>
                </div>
                
                <div class="weather-chart-container">
                    <div class="chart-header">
                        <h3>Temperature Trends</h3>
                        <div class="chart-controls">
                            <button class="chart-type-btn active" data-type="weekly">Weekly</button>
                            <button class="chart-type-btn" data-type="hourly">24 Hours</button>
                        </div>
                    </div>
                    <canvas id="weatherChart"></canvas>
                </div>
    
                <div class="detailed-forecast">
                    <h3>Detailed Forecast</h3>
                    <div class="forecast-container"></div>
                </div>
    
                <div class="weather-alerts">
                    <h3>Weather Alerts</h3>
                    <div class="alerts-container"></div>
                </div>
    
                <div class="saved-cities">
                    <h3>Saved Cities</h3>
                    <div class="cities-list"></div>
                </div>
            </div>
        `;
        document.body.appendChild(weatherModal);
        setupWeatherEventListeners();
    }
   

    // css styles
    const weatherStyles = `
    <style>
        .weather-modal {
            position: fixed;
            top: 0;
            right: -50%;
            height: 100vh;
            width: 41.5%;
            transition: right var(--transition-speed);
            background: var(--spotify-black);
            z-index: 1000;
        }

        .weather-modal.active {
            right: 58.5%;
        }

        .weather-content{
            overflow-y: auto;
            height: 85vh;
            padding: 10px;
            background-color: var(--spotify-black);
        
        }

        #citySearch{
            width: 100%;
        }
        .save-city-btn {
            background: var(--spotify-green);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
        }
    
        .save-city-btn:hover {
            background: var(--spotify-green1);
            transform: scale(1.05);
        }
    
        #weatherChart {
            width: 95% !important;
            height: 90% !important;
            margin: 10px auto;
        }

        .weather-chart-container {
            background: var(--hover-bg3);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            height: 400px;
            width: 100%; /* Add this */
        }
    
        .weather-current {
            background: var(--hover-bg3);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            position: relative;
            overflow: hidden;
        }
    
        .weather-current::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--active-bg);
        }
    
        .forecast-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 15px  auto;
        }
    
        .forecast-day {
            background: var(--hover-bg2);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 15px;
            text-align: center;
            transition: transform 0.3s;
            position: relative;
            overflow: hidden;
        }
    
        .forecast-day:hover {
            transform: translateY(-5px);
        }
    
        .forecast-day::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--active-bg);
            transform: scaleX(0);
            transition: transform 0.3s;
        }
    
        .forecast-day:hover::after {
            transform: scaleX(1);
        }
    
      
    
        @media (max-width: 768px) {
            .weather-modal {
                width: 100%;
            }
        }
    </style>
    `;


    // إضافة الأنماط إلى head
    document.head.insertAdjacentHTML('beforeend', weatherStyles);

    
    // تهيئة أحداث modal الطقس
    function setupWeatherEventListeners() {
        const apiKey = 'f458a708df95ee78be02eb6eb535560e';
        let weatherChart;
        const weatherModal = document.getElementById('weatherContainer');
        const openWeatherBtn = document.getElementById('openWeather');
        const closeWeatherBtn = document.getElementById('closeWeather');
        const searchInput = document.getElementById('citySearch');
        const searchButton = document.getElementById('searchCityBtn');
        const moviesModal = document.getElementById('moviesContainer'); 


        openWeatherBtn.addEventListener('click', () => {
            moviesModal.classList.add('with-weather');
            weatherModal.classList.add('visible');
            getCurrentLocation();
        });
    
        closeWeatherBtn.addEventListener('click', () => {
            moviesModal.classList.remove('with-weather');
            weatherModal.classList.remove('visible');
        });

        
            
        searchButton.addEventListener('click', () => {
            const city = searchInput.value.trim();
            if (city) {
                getWeatherData(city);
            }
        });

        document.getElementById('showSavedCitiesBtn').addEventListener('click', () => {
            updateSavedCitiesList();
            document.querySelector('.saved-cities').style.display = 'block';
        });

        const showSavedCitiesBtn = document.getElementById('showSavedCitiesBtn');
        if (showSavedCitiesBtn) {
            showSavedCitiesBtn.addEventListener('click', () => {
                console.log('Show Saved Cities button clicked'); // Debug log
                updateSavedCitiesList();
            });
        }

        function initializeChart(dates, temperatures) {
            const canvas = document.getElementById('weatherChart');
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }
        
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Could not get canvas context');
                return;
            }
        
            if (weatherChart) {
                weatherChart.destroy();
            }
        
            try {
                weatherChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'Temperature (°C)',
                            data: temperatures,
                            borderColor: getComputedStyle(document.documentElement)
                                .getPropertyValue('--spotify-green').trim(),
                            backgroundColor: 'rgba(29, 185, 84, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    callback: value => `${value}°C`
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error initializing chart:', error);
            }
        }
      
        function saveCityToLocalStorage(cityData) {
            let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
            if (!savedCities.find(city => city.name === cityData.name)) {
                savedCities.push(cityData);
                localStorage.setItem('savedCities', JSON.stringify(savedCities));
                updateSavedCitiesList();
            }
        }

        //Update Saved Cities
        function updateSavedCitiesList() {
            const citiesList = document.querySelector('.cities-list');
            const savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
            const currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
        
            console.log('Saved Cities:', savedCities); // Debug log
            console.log('Current Location:', currentLocation); // Debug log
        
            let citiesHTML = '';
            
            // Add current location at the top if available
            if (currentLocation) {
                citiesHTML += `
                    <div class="city-item current-location" data-city="${currentLocation.name}">
                        <h4>${currentLocation.name} (Current Location)</h4>
                        <p>${Math.round(currentLocation.temp)}°C</p>
                        <p>${currentLocation.description}</p>
                    </div>
                `;
            }
        
            // Add saved cities
            if (savedCities.length > 0) {
                citiesHTML += savedCities.map(city => `
                    <div class="city-item" data-city="${city.name}">
                        <button class="delete-city">
                            <i class="fas fa-trash"></i>
                        </button>
                        <h4>${city.name}</h4>
                        <p>${Math.round(city.temp)}°C</p>
                        <p>${city.description}</p>
                    </div>
                `).join('');
            } else {
                citiesHTML += '<p>No cities saved yet</p>';
            }
        
            citiesList.innerHTML = citiesHTML;
            
            // Make sure the saved cities container is visible
            const savedCitiesContainer = document.querySelector('.saved-cities');
            savedCitiesContainer.style.display = 'block';
        
            // Add event listeners for saved cities
            document.querySelectorAll('.city-item').forEach(cityItem => {
                cityItem.addEventListener('click', () => {
                    getWeatherData(cityItem.dataset.city);
                });
            });
        
            document.querySelectorAll('.delete-city').forEach(deleteBtn => {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const cityName = e.target.closest('.city-item').dataset.city;
                    deleteCity(cityName);
                });
            });
        }

        const style = document.createElement('style');
        style.textContent = `
        .location-info{
            padding: 1rem;
            background-color: rgba(0, 0, 0, 0.25);
            border-radius: 12px;
        }
        .location-header {
            display: grid;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
    
        .country-flag {
            width: 160px;
            height: 90px;
            object-fit: cover;
            margin-top: 2rem auto;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
    
        .location-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
    
        .share-weather-btn {
            background: var(--spotify-green);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
            transition: all 0.3s;
        }
    
        .share-weather-btn:hover {
            background: var(--spotify-green1);
        }

        .settings{
            background: var(--spotify-green);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
        }
    
        .settings:hover {
            background: var(--spotify-green1);
            transform: scale(1.05);
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
    
        .detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: var(--hover-bg2);
            border-radius: 8px;
        }
    
        .detail-item i {
            color: var(--spotify-green);
        }
    
        .sun-info {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
            padding: 15px;
            background: var(--hover-bg2);
            border-radius: 8px;
        }
    
        .sunrise, .sunset {
            display: flex;
            align-items: center;
            gap: 10px;
        }

       
    
        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
    
        .chart-controls {
            display: flex;
            gap: 10px;
        }
    
        .chart-type-btn {
            padding: 5px 10px;
            background: var(--hover-bg2);
            border: none;
            border-radius: 15px;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.3s;
        }
    
        .chart-type-btn.active {
            background: var(--spotify-green);
        }
    
        .search-wrapper {
            position: relative;
            flex: 1;
        }
    
        .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--spotify-black);
            border-radius: 8px;
            max-height: 200px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        }
    
        .search-suggestion-item {
            padding: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
        }
    
        .search-suggestion-item:hover {
            background: var(--hover-bg2);
        }
    
        .weather-alerts {
            margin-top: 20px;
        }
    
        .alert-item {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            background: var(--hover-bg2);
            border-left: 4px solid #ff4444;
        }
    
        .alert-item.warning {
            border-left-color: #ffbb33;
        }
    
        .alert-item.notice {
            border-left-color: #00C851;
        }
   
        .country-info {
            font-size: 0.9em;
            color: var(--text-color);
            margin: 5px 0;
            opacity: 0.8;
        }
    
        .local-time {
            font-size: 0.9em;
            color: var(--text-color);
            margin-bottom: 10px;
            opacity: 0.8;
        }

        .cities-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
    
        .city-item {
            background: var(--hover-bg2);
            box-shadow: 0 0.3rem 0.8rem rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
            position: relative;
        }
    
        .city-item:hover {
            transform: translateY(-3px);
            background: var(--spotify-green1);
        }
    
        .delete-city {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.2);
            padding: 6px 8px;
            border-radius: 50%;
            justify-content: center;
            align-items: center;
            border: none;
            color: var(--text-color);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .delete-city:hover {
            background-color: red;
        }
        .city-item:hover .delete-city {
            opacity: 1;
        }

        .saved-cities {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--hover-bg3);
            border-radius: 8px;
        }
        .current-location {
            border-left: 4px solid #4CAF50;
        }

        #weatherContainer {
            position: fixed;
            top: 0;
            right: -100%;
            width: 45%;
            height: 100vh;
            background: var(--spotify-black);
            z-index: 1000;
            overflow-y: auto;
            transition: right 0.3s ease-in-out;
        }
    
        #weatherContainer.visible {
            right: 0;
        }
    
        .side-modal.with-weather {
            width: 55%;
            transition: all var(--transition-speed);
        }

        .side-modal.with-weather {
            right: 45%;
        }

        
        
        
        
        `;
        document.head.appendChild(style);

        

        function deleteCity(cityName) {
            let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
            savedCities = savedCities.filter(city => city.name !== cityName);
            localStorage.setItem('savedCities', JSON.stringify(savedCities));
            updateSavedCitiesList();
        }
    
        // Add save city button event listener
        document.querySelector('.save-city-btn').addEventListener('click', () => {
            const cityName = document.querySelector('.city-name').textContent;
            const temperature = document.querySelector('.temperature').textContent;
            const description = document.querySelector('.description').textContent;
            
            saveCityToLocalStorage({
                name: cityName,
                temp: parseFloat(temperature),
                description: description
            });
        });

        
        // Get Current Location
        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const { latitude, longitude } = position.coords;
                        getWeatherByCoords(latitude, longitude, true); // Added true parameter to indicate current location
                    },
                    error => {
                        console.error('Error getting location:', error);
                        getWeatherData('London');
                    }
                );
            }
        }
        

        // Get Coords
        async function getWeatherByCoords(lat, lon, isCurrentLocation = false) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
                );
                const data = await response.json();
                updateWeatherUI(data);
                if (isCurrentLocation) {
                    // Save current location to localStorage
                    const currentLocation = {
                        name: data.name,
                        temp: data.main.temp,
                        description: data.weather[0].description
                    };
                    localStorage.setItem('currentLocation', JSON.stringify(currentLocation));
                }
                getForecast(lat, lon);
            } catch (error) {
                console.error('Error fetching weather:', error);
            }
        }

        // Get Weather Data
        async function getWeatherData(city) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
                );
                const data = await response.json();
                updateWeatherUI(data);
                getForecast(data.coord.lat, data.coord.lon);
            } catch (error) {
                console.error('Error fetching weather:', error);
            }
        }

        // Update UI
        async function updateWeatherUI(data) {
            const cityName = document.querySelector('.city-name');
            const countryInfo = document.querySelector('.country-info');
            const localTime = document.querySelector('.local-time');
            const temperature = document.querySelector('.temperature');
            const description = document.querySelector('.description');
            const humidity = document.querySelector('.humidity');
            const wind = document.querySelector('.wind');
            const weatherIcon = document.querySelector('.weather-icon');
        
            // Get country name using the country code
            const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${data.sys.country}`);
            const countryData = await countryResponse.json();
            const countryName = countryData[0].name.common;
        
            // Update country flag
            const countryFlag = document.querySelector('.country-flag');
            countryFlag.src = `https://flagcdn.com/w1280/${data.sys.country.toLowerCase()}.png`;

            
            // Update sun time
            const sunrise = document.querySelector('.sunrise span');
    const sunset = document.querySelector('.sunset span');
    sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Update visibility
    const visibility = document.querySelector('.visibility');
    visibility.textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;

    // Check for weather alerts
    const alertsContainer = document.querySelector('.alerts-container');
    alertsContainer.innerHTML = '';
    
    if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${getAlertLevel(alert.event)}`;
            alertElement.innerHTML = `
                <h4>${alert.event}</h4>
                <p>${alert.description}</p>
                <small>Valid until: ${new Date(alert.end * 1000).toLocaleString()}</small>
            `;
            alertsContainer.appendChild(alertElement);
        });
    } else {
        alertsContainer.innerHTML = '<p>No current weather alerts</p>';
    }

            // Calculate local time using timezone offset
            const localDateTime = new Date(Date.now() + (data.timezone * 1000));
            const timeString = localDateTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        
            cityName.textContent = data.name;
            countryInfo.textContent = countryName;
            localTime.textContent = `Local Time: ${timeString}`;
            temperature.textContent = `${Math.round(data.main.temp)}°C`;
            description.textContent = data.weather[0].description;
            humidity.textContent = `Humidity: ${data.main.humidity}%`;
            wind.textContent = `Wind: ${data.wind.speed} km/h`;
            weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        
            // Get forecast data for the chart
            const forecast = await getForecast(data.coord.lat, data.coord.lon);
            const dates = forecast.list
                .filter(item => item.dt_txt.includes('12:00:00'))
                .map(item => new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }));
            const temperatures = forecast.list
                .filter(item => item.dt_txt.includes('12:00:00'))
                .map(item => Math.round(item.main.temp));
        
            initializeChart(dates, temperatures);
        }

       

        // Get Forecast
        async function getForecast(lat, lon) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
                );
                const data = await response.json();
                updateForecastUI(data);
                
                // Process data for chart
                const dates = data.list
                    .filter(item => item.dt_txt.includes('12:00:00'))
                    .map(item => new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }));
                const temperatures = data.list
                    .filter(item => item.dt_txt.includes('12:00:00'))
                    .map(item => Math.round(item.main.temp));
                    
                initializeChart(dates, temperatures);
                
                return data;
            } catch (error) {
                console.error('Error fetching forecast:', error);
            }
        }

        // Updat Forecast Ui
        function updateForecastUI(data) {
            const forecastContainer = document.querySelector('.forecast-container');
            forecastContainer.innerHTML = '';
    
            const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
            
            dailyData.forEach(day => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                const forecastDay = document.createElement('div');
                forecastDay.className = 'forecast-day';
                forecastDay.innerHTML = `
                    <h4>${dayName}</h4>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather">
                    <p>${Math.round(day.main.temp)}°C</p>
                    <p>${day.weather[0].description}</p>
                `;
                forecastContainer.appendChild(forecastDay);
            });
        }

        // helper functions
        function getAlertLevel(event) {
            const severityKeywords = {
                warning: ['warning', 'severe', 'extreme', 'danger'],
                notice: ['watch', 'advisory', 'statement']
            };
            
            event = event.toLowerCase();
            if (severityKeywords.warning.some(keyword => event.includes(keyword))) {
                return 'warning';
            } else if (severityKeywords.notice.some(keyword => event.includes(keyword))) {
                return 'notice';
            }
            return '';
        }


        // Add city search suggestions
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                document.getElementById('searchSuggestions').style.display = 'none';
                return;
            }
            searchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
                    );
                    const cities = await response.json();
                    
                    const suggestionsContainer = document.getElementById('searchSuggestions');
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = cities.length ? 'block' : 'none';
        
                    cities.forEach(city => {
                        const div = document.createElement('div');
                        div.className = 'search-suggestion-item';
                        div.innerHTML = `
                            <img src="https://flagcdn.com/w20/${city.country.toLowerCase()}.png" 
                                 alt="${city.country}" style="width: 20px;">
                            <span>${city.name}, ${city.state || ''} ${city.country}</span>
                        `;
                        div.addEventListener('click', () => {
                            searchInput.value = city.name;
                            suggestionsContainer.style.display = 'none';
                            getWeatherData(city.name);
                        });
                        suggestionsContainer.appendChild(div);
                    });
                } catch (error) {
                    console.error('Error fetching city suggestions:', error);
                }
            }, 300);
        });

        // Add temperature unit toggle
        let isCelsius = true;
        document.getElementById('toggleUnit').addEventListener('click', () => {
            isCelsius = !isCelsius;
            const tempElement = document.querySelector('.temperature');
            const currentTemp = parseFloat(tempElement.textContent);
            
            if (isCelsius) {
                tempElement.textContent = `${Math.round((currentTemp - 32) * 5/9)}°C`;
            } else {
                tempElement.textContent = `${Math.round(currentTemp * 9/5 + 32)}°F`;
            }
        });

        // Add share weather feature
        document.querySelector('.share-weather-btn').addEventListener('click', async () => {
            const cityName = document.querySelector('.city-name').textContent;
            const temp = document.querySelector('.temperature').textContent;
            const desc = document.querySelector('.description').textContent;
            
            const shareText = `Current weather in ${cityName}: ${temp} - ${desc}`;
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Weather Update',
                        text: shareText,
                        url: window.location.href
                    });
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(shareText)
                    .then(() => alert('Weather information copied to clipboard!'))
                    .catch(err => console.error('Error copying to clipboard:', err));
            }
        });
}
