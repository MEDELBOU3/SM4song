class AdvancedUserTracker {
            
    constructor() {
        this.dailyUsage = this.loadDailyUsage();
        this.startTime = this.loadOrInitStartTime();
        this.currentSession = this.loadCurrentSession();
        this.audioPlaybackTime = this.loadAudioPlaybackTime();
        this.audioStartTime = null;
        this.lastUpdateTime = Date.now(); 
        this.chart = null;
        this.initializeTracker();
        this.usageData = this.loadUsageData();
        this.lastMeasurement = this.loadLastMeasurement();
        this.internetTracker = new InternetUsageTracker();
        this.chart = null;
        this.initializeTracker();
        
    }

    loadUsageData() {
        const savedData = localStorage.getItem('internetUsageData');
        return savedData ? JSON.parse(savedData) : {
            dayTime: {},    // 6:00 - 18:00
            nightTime: {}   // 18:00 - 6:00
        };
    }

    loadLastMeasurement() {
        return localStorage.getItem('lastInternetMeasurement') || Date.now();
    }

    async measureInternetSpeed() {
        try {

            // Use a larger file for more accurate measurement
            const testFiles = [
                'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
                'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png'
            ];
            
            const speeds = [];
            
            for (const url of testFiles) {
                const startTime = performance.now();
                const response = await fetch(url, { cache: 'no-store' });
                const blob = await response.blob();
                const endTime = performance.now();
                
                const duration = (endTime - startTime) / 1000; // Convert to seconds
                const fileSize = blob.size / (1024 * 1024); // Convert to MB
                const speed = fileSize / duration; // MB/s
                
                speeds.push(speed * 8); // Convert to Mbps
            }
            
            // Return average speed
            return speeds.reduce((a, b) => a + b, 0) / speeds.length;
        } catch (error) {
            console.error('Error measuring speed:', error);
            return this.getFallbackSpeed();
        }
    }

    getFallbackSpeed() {
        // If measurement fails, estimate based on navigation timing API
        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const transferSize = navigation.transferSize; // in bytes
                const duration = navigation.responseEnd - navigation.requestStart; // in ms
                return ((transferSize * 8) / (1024 * 1024)) / (duration / 1000); // Convert to Mbps
            }
        } catch (error) {
            console.error('Fallback speed measurement failed:', error);
        }
        return 0;
    }


    async recordMeasurement() {
        const speed = await this.measureInternetSpeed();
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const hour = now.getHours();
        
        // Determine if it's day time (6:00-18:00) or night time
        const isDayTime = hour >= 6 && hour < 18;
        const timeCategory = isDayTime ? 'dayTime' : 'nightTime';
        
        // Initialize the date object if it doesn't exist
        if (!this.usageData[timeCategory][date]) {
            this.usageData[timeCategory][date] = [];
        }
        
        // Add the measurement with timestamp
        this.usageData[timeCategory][date].push({
            time: now.toISOString(),
            speed: speed
        });

        // Keep only last 100 measurements per category per day to manage storage
        if (this.usageData[timeCategory][date].length > 100) {
            this.usageData[timeCategory][date] = this.usageData[timeCategory][date].slice(-100);
        }

        // Clean up old data (older than 30 days)
        this.cleanOldMeasurements();

        localStorage.setItem('internetUsageData', JSON.stringify(this.usageData));
        localStorage.setItem('lastInternetMeasurement', Date.now().toString());
        
        this.updateInternetChart();
    }

    cleanOldMeasurements() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        ['dayTime', 'nightTime'].forEach(timeCategory => {
            Object.keys(this.usageData[timeCategory]).forEach(date => {
                if (new Date(date) < thirtyDaysAgo) {
                    delete this.usageData[timeCategory][date];
                }
            });
        });
    }

    // إضافة هذه الدالة
    loadCurrentSession() {
        const savedSession = localStorage.getItem('currentSession');
        return savedSession ? parseFloat(savedSession) : 0;
    }

    initializeTracker() {
        this.createStatsButton();
        this.createModal();
        this.initializeChart();
        this.startTracking();
        this.setupEventListeners();
        setInterval(() => this.recordMeasurement(), 3 * 60 * 60 * 1000); // Measure every 3 hours
        this.recordMeasurement();    // Initial measurement
        setInterval(() => this.recordMeasurement(), 5 * 60 * 1000); // Measure every 5 minutes instead of 3 hours for more accurate tracking
        this.recordMeasurement();      // Initial measurement
        this.createStatsButton();
        this.createSpeedTestButton(); //  this line if not already present
    }

    createStatsButton() {
        const button = document.createElement('button');
        button.id = 'statsButton';
        button.innerHTML = `
            <i class="fas fa-chart-bar"></i>
            Usage Statistics
        `;
        document.body.appendChild(button);
    }

    
    loadDailyUsage() {
        const savedData = localStorage.getItem('dailyUsage');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Clean up old data (older than 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            Object.keys(parsedData).forEach(date => {
                if (new Date(date) < thirtyDaysAgo) {
                    delete parsedData[date];
                }
            });
            return parsedData;
        }
        return {};
    }

    loadOrInitStartTime() {
        const saved = localStorage.getItem('sessionStartTime');
        const today = new Date().toISOString().split('T')[0];
        if (saved) {
            const savedDate = new Date(parseInt(saved)).toISOString().split('T')[0];
            if (savedDate === today) {
                return parseInt(saved);
            }
        }
        const newStartTime = Date.now();
        localStorage.setItem('sessionStartTime', newStartTime.toString());
        return newStartTime;
    }

    loadAudioPlaybackTime() {
        const today = new Date().toISOString().split('T')[0];
        return this.dailyUsage[today]?.playbackTime || 0;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'stats-modal';
        modal.innerHTML = `
            <div class="modal-cont">
                <div class="modal-header">
                    <h2>Usage Statistics</h2>
                    <div class="modal-controls">
                      
                        <button id="closeModal" style=" color: var(--text-color); size: 25px; padding: 12px 14px;"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="today-summary">
                    <div class="summary-item">
                        <i class="fas fa-clock"></i>
                        <div class="summary-details">
                            <h3>Today's Usage</h3>
                            <span id="todayTotal">0:00</span>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-music"></i>
                        <div class="summary-details">
                            <h3>Music Played</h3>
                            <span id="todayMusic">0:00</span>
                        </div>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="usageChart"></canvas>
                </div>
                <div class="chart-controls">
                    <select id="viewRange" class="custom-select">
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                    <select id="chartType" class="custom-select">
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                    </select>
                </div>
                <div class="stats-details">
                    <h3>Usage Patterns</h3>
                    <div id="usagePatterns"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const internetSection = `
        <div class="internet-usage-section">
            <h3>Internet Usage Statistics</h3>
            <div class="internet-chart-controls">
                <select id="internetViewRange" class="custom-select">
                    <option value="7">Last 7 Days</option>
                    <option value="14">Last 14 Days</option>
                    <option value="30">Last 30 Days</option>
                </select>
            </div>
            <div class="internet-chart-container">
                <canvas id="internetUsageChart"></canvas>
            </div>
            <div class="internet-stats-summary">
                <div class="summary-box day-summary">
                    <h4>Day Time Usage (6AM-6PM)</h4>
                    <span id="dayTimeAverage">0 Mbps</span>
                </div>
                <div class="summary-box night-summary">
                    <h4>Night Time Usage (6PM-6AM)</h4>
                    <span id="nightTimeAverage">0 Mbps</span>
                </div>
            </div>
        </div>
    `;

    // Insert the internet section before the closing div
    modal.querySelector('.modal-cont').insertAdjacentHTML('beforeend', internetSection);

    // Add styles
    const styles = `
        <style>
            .internet-usage-section {
                padding: 20px;
                background: var(--bg-color);
                border-radius: 10px;
                margin-top: 20px;
            }

            .internet-chart-container {
                height: 300px;
                margin: 20px 0;
            }

            .internet-stats-summary {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin-top: 20px;
            }

            .summary-box {
                flex: 1;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }

            .day-summary {
                background: rgba(54, 162, 235, 0.1);
                border: 1px solid rgba(54, 162, 235, 0.5);
            }

            .night-summary {
                background: rgba(153, 102, 255, 0.1);
                border: 1px solid rgba(153, 102, 255, 0.5);
            }
        </style>
    `;

      document.head.insertAdjacentHTML('beforeend', styles);
    }

    initializeInternetChart() {
        const ctx = document.getElementById('internetUsageChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Day Time Usage',
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        data: []
                    },
                    {
                        label: 'Night Time Usage',
                        borderColor: 'rgb(153, 102, 255)',
                        backgroundColor: 'rgba(153, 102, 255, 0.1)',
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Speed (Mbps)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y.toFixed(2)} Mbps`
                        }
                    }
                }
            }
        });
        
        return chart;
    }

    updateInternetChart(days = 7) {
        const dates = [];
        const dayData = [];
        const nightData = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayAvg = this.calculateAverageSpeed('dayTime', dateStr);
            const nightAvg = this.calculateAverageSpeed('nightTime', dateStr);
            
            dates.push(date.toLocaleDateString());
            dayData.push(dayAvg);
            nightData.push(nightAvg);
        }
        
        this.chart.data.labels = dates;
        this.chart.data.datasets[0].data = dayData;
        this.chart.data.datasets[1].data = nightData;
        this.chart.update();
        
        // Update summary
        document.getElementById('dayTimeAverage').textContent = 
            `${this.calculateOverallAverage('dayTime', days).toFixed(2)} Mbps`;
        document.getElementById('nightTimeAverage').textContent = 
            `${this.calculateOverallAverage('nightTime', days).toFixed(2)} Mbps`;
    }
    
    calculateAverageSpeed(timeCategory, date) {
        const measurements = this.usageData[timeCategory][date] || [];
        if (measurements.length === 0) return 0;
        
        const sum = measurements.reduce((acc, m) => acc + m.speed, 0);
        return sum / measurements.length;
    }
    
    calculateOverallAverage(timeCategory, days) {
        let sum = 0;
        let count = 0;
        
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const measurements = this.usageData[timeCategory][dateStr] || [];
            
            measurements.forEach(m => {
                sum += m.speed;
                count++;
            });
        }
        
        return count > 0 ? sum / count : 0;
    }

    initializeChart() {
        const ctx = document.getElementById('usageChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: this.getChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const hours = Math.floor(context.raw);
                                const minutes = Math.round((context.raw - hours) * 60);
                                return `${hours}h ${minutes}m`;
                            }
                        }
                    }
                }
            }
        });
    }
    
  

    // تحسين تتبع الصوت
    startTracking() {
        // Update stats every minute
        setInterval(() => {
            this.updateStats();
            this.resetDailyStats();
        }, 60000);

        // Add audio tracking
        if (window.audioPlayer) {
            audioPlayer.addEventListener('play', () => this.handleAudioStart());
            audioPlayer.addEventListener('pause', () => this.handleAudioStop());
            audioPlayer.addEventListener('ended', () => this.handleAudioStop());
            
            // Check audio status every second
            setInterval(() => {
                if (audioPlayer.played && !audioPlayer.paused) {
                    this.updateAudioTime();
                }
            }, 1000);
        }
    }

     // Optional: Add method to validate and repair data
     validateAndRepairData() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.dailyUsage[today]) {
            this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
        }
        
        // Ensure values are numbers
        if (typeof this.dailyUsage[today].totalTime !== 'number') {
            this.dailyUsage[today].totalTime = 0;
        }
        if (typeof this.dailyUsage[today].playbackTime !== 'number') {
            this.dailyUsage[today].playbackTime = 0;
        }
    }

   // تعديل في updateStats
   updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = Date.now();
    const timeSinceLastUpdate = (currentTime - this.lastUpdateTime) / 1000; // Time in seconds
    
    if (!this.dailyUsage[today]) {
        this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
    }

    // Add only the time since last update
    this.currentSession += timeSinceLastUpdate;
    this.dailyUsage[today].totalTime += timeSinceLastUpdate;
    
    // Update last update time
    this.lastUpdateTime = currentTime;
    
    localStorage.setItem('currentSession', this.currentSession.toString());
    this.saveStats();
    this.updateDisplay();
}

updateAudioTime() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.dailyUsage[today]) {
        this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
    }
    
    if (this.audioStartTime) {
        const currentPlaybackTime = (Date.now() - this.audioStartTime) / 1000;
        this.dailyUsage[today].playbackTime = this.audioPlaybackTime + currentPlaybackTime;
        this.saveStats();
    }
}


    updateDisplay() {
        const today = new Date().toISOString().split('T')[0];
        const stats = this.dailyUsage[today] || { totalTime: 0, playbackTime: 0 };

        document.getElementById('todayTotal').textContent = this.formatTime(stats.totalTime);
        document.getElementById('todayMusic').textContent = this.formatTime(stats.playbackTime);

        this.updateChart();
        this.updateUsagePatterns();
    }

    initializeNightTimeChecker() {
        setInterval(() => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();

            if ((hours === 1 && minutes === 0) || (hours === 1 && minutes === 30)) {
                this.showNightTimeWarning();
            }
        }, 60000);
    }

    showNightTimeWarning() {
        const warning = document.createElement('div');
        warning.className = 'night-warning animate__animated animate__slideInRight';
        warning.innerHTML = `
            <div class="warning-content">
                <h3>🌙 Time to Rest</h3>
                <p>It's getting late! Consider getting some sleep for better health.</p>
                <div class="warning-actions">
                    <button class="snooze-btn">Snooze 30min</button>
                    <button class="dismiss-btn">Got it</button>
                </div>
                <div class="usage-summary">
                    <p>You've been using the app for ${this.formatTime(this.dailyUsage[new Date().toISOString().split('T')[0]].totalTime)}</p>
                </div>
            </div>
        `;

        document.body.appendChild(warning);
        this.setupWarningControls(warning);
    }

    saveStats() {
        try {
            localStorage.setItem('dailyUsage', JSON.stringify(this.dailyUsage));
            localStorage.setItem('lastUpdate', Date.now().toString());
        } catch (e) {
            console.error('Error saving stats:', e);
            // تنظيف البيانات القديمة إذا كان التخزين ممتلئًا
            this.cleanOldData();
        }
    }

    
    cleanOldData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        Object.keys(this.dailyUsage).forEach(date => {
            if (new Date(date) < thirtyDaysAgo) {
                delete this.dailyUsage[date];
            }
        });
        
        this.saveStats();
    }

    // إضافة دالة للتحقق من صحة البيانات
    validateData() {
       const today = new Date().toISOString().split('T')[0];
        if (!this.dailyUsage[today] || typeof this.dailyUsage[today].totalTime !== 'number') {
           this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
        }
    }

    // Call this when audio starts playing
    handleAudioStart() {
        if (!this.audioStartTime) {
            this.audioStartTime = Date.now();
            const today = new Date().toISOString().split('T')[0];
            if (!this.dailyUsage[today]) {
                this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
            }
        }
    }

    // Call this when audio stops or pauses
    handleAudioStop() {
        if (this.audioStartTime) {
            const today = new Date().toISOString().split('T')[0];
            const playbackDuration = (Date.now() - this.audioStartTime) / 1000;
            
            if (!this.dailyUsage[today]) {
                this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
            }
            
            this.dailyUsage[today].playbackTime += playbackDuration;
            this.audioPlaybackTime += playbackDuration;
            this.audioStartTime = null;
            
            this.saveStats();
            this.updateDisplay();
        }
    }

     // Add this method to reset daily stats at midnight
     resetDailyStats() {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            const today = now.toISOString().split('T')[0];
            this.dailyUsage[today] = { totalTime: 0, playbackTime: 0 };
            this.currentSession = 0;
            this.audioPlaybackTime = 0;
            this.saveStats();
        }
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('statsButton').addEventListener('click', () => {
            document.querySelector('.stats-modal').style.display = 'block';
            this.updateDisplay();
        });

        
        document.getElementById('internetViewRange').addEventListener('change', (e) => {
            this.internetTracker.updateInternetChart(parseInt(e.target.value));
        });
        
        document.getElementById('closeModal').addEventListener('click', () => {
            document.querySelector('.stats-modal').style.display = 'none';
        });

        // Chart controls
        document.getElementById('viewRange').addEventListener('change', (e) => {
            this.updateChart(e.target.value);
        });

        document.getElementById('chartType').addEventListener('change', (e) => {
            this.updateChartType(e.target.value);
        });
    }

    getChartData(days = 7) {
        const data = [];
        const labels = [];
        const today = new Date();
    
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const stats = this.dailyUsage[dateStr] || { totalTime: 0, playbackTime: 0 };
            
            labels.push(date.toLocaleDateString(undefined, { weekday: 'short' }));
            data.push({
                total: stats.totalTime / 3600,
                playback: stats.playbackTime / 3600
            });
        }
    
        return {
            labels: labels,
            datasets: [{
                label: 'Total Usage',
                data: data.map(d => d.total),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,  
                barPercentage: 0.8,  
                categoryPercentage: 0.9  
            }, {
                label: 'Audio Playback',
                data: data.map(d => d.playback),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: true,  
                barPercentage: 0.8,  
                categoryPercentage: 0.9  
            }]
        };
    }
   
   

    updateChart(days = 7) {
        this.chart.data = this.getChartData(days);
        this.chart.update();
    }

    updateChartType(type) {
        this.chart.config.type = type;
        this.chart.update();
    }

    updateUsagePatterns() {
        const patternsContainer = document.getElementById('usagePatterns');
        const today = new Date().toISOString().split('T')[0];
        const stats = this.dailyUsage[today];

        if (!stats) {
            patternsContainer.innerHTML = '<p>No usage data available for today.</p>';
            return;
        }

        const totalHours = stats.totalTime / 3600;
        const musicHours = stats.playbackTime / 3600;
        const musicPercentage = (musicHours / totalHours * 100).toFixed(1);

        patternsContainer.innerHTML = `
            <p>🎵 Music makes up ${musicPercentage}% of your total usage today.</p>
            <p>💡 Peak usage times are typically in the ${this.getPeakUsageTime()}</p>
        `;
    }

    getPeakUsageTime() {
        // Simple implementation - can be enhanced with actual usage time tracking
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) return "morning";
        if (currentHour >= 12 && currentHour < 17) return "afternoon";
        if (currentHour >= 17 && currentHour < 22) return "evening";
        return "night";
    }

    setupWarningControls(warning) {
        warning.querySelector('.snooze-btn').addEventListener('click', () => {
            warning.classList.remove('animate__slideInRight');
            warning.classList.add('animate__slideOutRight');
            setTimeout(() => warning.remove(), 500);
        });

        warning.querySelector('.dismiss-btn').addEventListener('click', () => {
            warning.classList.remove('animate__slideInRight');
            warning.classList.add('animate__slideOutRight');
            setTimeout(() => warning.remove(), 500);
        });
    }

    // this method to your existing class
    createSpeedTestButton() {
        const button = document.createElement('button');
        button.id = 'speedTestButton';
        button.innerHTML = `
            <i class="fas fa-tachometer-alt"></i>
            Speed Test
        `;
        document.body.appendChild(button);
        
        // click event listener
        button.addEventListener('click', () => {
            this.showSpeedTestModal();
        });
    }

    showSpeedTestModal() {
        // Create modal if it doesn't exist
        let modal = document.querySelector('.speed-test-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'speed-test-modal';
            modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                   <h2>Internet Speed Test</h2>
                   <button class="close-btn"><i class="fas fa-times"></i></button>
                 </div>
                <div class="speed-test-container">
                <div class="speed-indicator">
                    <div class="speed-value">0</div>
                    <div class="speed-unit">Mbps</div>
                </div>
                <button class="start-test-btn">Start Test</button>
                <div class="test-status">Click Start Test to begin</div>
            </div>
            </div>
            `;

            document.body.appendChild(modal);
    
            document.head.appendChild(styles);
    
            // Add event listeners
            const closeBtn = modal.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
    
            const startTestBtn = modal.querySelector('.start-test-btn');
            startTestBtn.addEventListener('click', async () => {
                const statusEl = modal.querySelector('.test-status');
                const speedValueEl = modal.querySelector('.speed-value');
                
                statusEl.textContent = 'Testing...';
                startTestBtn.disabled = true;
                
                try {
                    const speed = await this.measureInternetSpeed();
                    speedValueEl.textContent = speed.toFixed(2);
                    statusEl.textContent = 'Test completed';
                } catch (error) {
                    statusEl.textContent = 'Test failed. Please try again.';
                } finally {
                    startTestBtn.disabled = false;
                }
            });
        }
    
        // Show the modal
        modal.style.display = 'flex';
}
   
}

let dailyListeningTime = 0;
let lastDay = new Date().getDate();

// دالة لحساب وقت الاستماع
function trackListeningTime() {
    let currentDay = new Date().getDate();
    
    // التحقق إذا كان يوم جديد
    if (currentDay !== lastDay) {
        // حفظ وقت الاستماع لليوم السابق
        saveDailyStats(lastDay, dailyListeningTime);
        // إعادة تعيين العداد لليوم الجديد
        dailyListeningTime = 0;
        lastDay = currentDay;
    }
    
    // إضافة الوقت المستمع إليه
    dailyListeningTime += 1; // يزيد كل ثانية
}

// دالة لحفظ إحصائيات اليوم
function saveDailyStats(day, time) {
    const stats = {
        date: new Date(new Date().setDate(day)).toISOString().split('T')[0],
        totalTime: time
    };
    
    // حفظ في LocalStorage
    const history = JSON.parse(localStorage.getItem('listeningHistory') || '[]');
    history.push(stats);
    localStorage.setItem('listeningHistory', JSON.stringify(history));
}

// تشغيل المتتبع كل ثانية عندما يكون المستخدم يستمع للموسيقى
setInterval(trackListeningTime, 1000);

// دالة لعرض سجل الاستماع
function displayListeningHistory() {
    const history = JSON.parse(localStorage.getItem('listeningHistory') || '[]');
    return history;
}


// Add styles
const styles = `
   

    .stats-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1001;
    }

    .modal-cont {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--spotify-black);
        padding: 2rem;
        color: var(--text-color);
        border-radius: 15px;
        width: 80%;
        max-width: 1000px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .modal-controls button {
        background-color: rgba(0, 0, 0, 0.2);

        border: none;
        color: var(--text-color);
        font-size: 1.2em;
        cursor: pointer;
        padding: 15px 12px;
        margin-left: 10px;
    }

    .modal-controls button:hover {
        background-color: red;
        
    }


    .today-summary {
        display: flex;
        justify-content: space-around;
        margin-bottom: 30px;
    }

    .summary-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: var(--spotify-light-black);
        border-radius: 10px;
        min-width: 200px;
    }

    .chart-container {
        height: 400px;
        margin: 20px 0;
        background-color: var(--spotify-light-black);
        padding: 1rem;
        border-radius: 12px;
    }

    .night-warning {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2c3e50, #3498db);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1002;
    }

    .warning-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .warning-actions button {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .snooze-btn {
        background: #34495e;
        color: white;
    }

    .dismiss-btn {
        background: #e74c3c;
        color: white;
    }

    .chart-controls{
        padding: 10px;
        background-color: var(--spotify-light-black);
        border-radius: 20px;
    }

    .custom-select{
        width: 200px;
        padding: 10px;
        margin: 10px;
        border: 2px solid #fff;
        border-radius: 5px;
        background: var(--spotify-black);
        color: var(--text-color);
        font-size: 16px;
        appearance: none;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    }

    .custom-select:hover{
        border-color: #00f2fe;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        
    }

    .custom-select:focus{
        outline: none;
        border-color: #4facfe;
    }

    .stats-details{
        background-color: var(--spotify-light-black);
        padding: 1rem;
        margin: 10px auto;
        border-radius: 12px;
    }

    .stats-details h3{
        margin-bottom: 10px;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .animate__animated {
        animation-duration: 0.5s;
        animation-fill-mode: both;
    }

    .animate__slideInRight {
        animation-name: slideInRight;
    }

    .animate__slideOutRight {
        animation-name: slideOutRight;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize tracker
const userTracker = new AdvancedUserTracker();


//this near the top of your file
document.addEventListener('DOMContentLoaded', () => {
    // Navigation event listeners
    document.getElementById('featured').addEventListener('click', displayFeaturedPlaylists);
    document.getElementById('new-releases').addEventListener('click', displayNewReleases);
    document.getElementById('categories').addEventListener('click', displayCategories);
});

async function initializePage() {
    try {
        await getAccessToken();
        await displayFeaturedPlaylists();
        addEventListeners();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

function addEventListeners() {
    // Add click listeners for grid items
    document.addEventListener('click', async (e) => {
        const gridItem = e.target.closest('.grid-item');
        if (gridItem) {
            const type = gridItem.dataset.type;
            const id = gridItem.dataset.id;
            
            if (type === 'playlist') {
                await displayPlaylistTracks(id);
            } else if (type === 'album') {
                await displayAlbumTracks(id);
            } else if (type === 'category') {
                await displayCategoryPlaylists(id);
            }
        }
    });
}
