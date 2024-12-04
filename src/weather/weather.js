  
     
     // إنشاء modal الطقس
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
                    <input type="text" id="citySearch" placeholder="Search city...">
                    <button id="searchCityBtn"><i class="fas fa-search"></i></button>
                    <button id="showSavedCitiesBtn"><i class="fas fa-list"></i> Show Saved Cities</button>
                </div>
                <div class="weather-current">
                    <div class="location-info">
                        <h3>Current Location</h3>
                        <p class="city-name">Loading...</p>
                        <button class="save-city-btn">
                            <i class="fas fa-bookmark"></i> Save City
                        </button>
                    </div>
                    <div class="weather-info">
                        <div class="temp-container">
                            <span class="temperature">--°C</span>
                            <img class="weather-icon" src="" alt="Weather">
                        </div>
                        <div class="weather-details">
                            <p class="description">--</p>
                            <p class="humidity">Humidity: --%</p>
                            <p class="wind">Wind: -- km/h</p>
                            <p class="pressure">Pressure: -- hPa</p>
                        </div>
                    </div>
                </div>
                
                <div class="weather-chart-container">
                    <h3>Weekly Temperature Trends</h3>
                    <canvas id="weatherChart"></canvas>
                </div>
    
                <div class="detailed-forecast">
                    <h3>Detailed Forecast</h3>
                    <div class="forecast-container"></div>
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
            height: 300px;
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
        async  function updateWeatherUI(data) {
            const cityName = document.querySelector('.city-name');
            const temperature = document.querySelector('.temperature');
            const description = document.querySelector('.description');
            const humidity = document.querySelector('.humidity');
            const wind = document.querySelector('.wind');
            const weatherIcon = document.querySelector('.weather-icon');
    
            cityName.textContent = data.name;
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
}
