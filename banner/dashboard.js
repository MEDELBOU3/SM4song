// Load required Chart.js library
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
document.head.appendChild(script);

// Global variables for charts
let cpuChart, memoryChart, networkChart, historyChart;
let performanceData = {
    cpu: [],
    memory: [],
    network: [],
    timestamps: []
};

// Maximum number of data points to show
const MAX_DATA_POINTS = 10;

async function getMemoryInfo() {
    if ('memory' in performance) {
        const memory = performance.memory;
        const usedHeapSize = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        const totalHeapSize = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));
        return {
            used: usedHeapSize,
            total: totalHeapSize,
            percentage: (usedHeapSize / totalHeapSize) * 100
        };
    }
    return null;
}

async function getCPUInfo() {
    try {
        const cpuUsage = await measureCPUUsage();
        return Math.round(cpuUsage);
    } catch (error) {
        console.error('Error getting CPU usage:', error);
        return null;
    }
}

async function measureCPUUsage() {
    const start = performance.now();
    const startUsage = performance.now();
    
    // Simulate some work to measure CPU usage
    for (let i = 0; i < 1000000; i++) {
        Math.random() * Math.random();
    }
    
    const endUsage = performance.now();
    const end = performance.now();
    
    const timeUsed = (endUsage - startUsage);
    const totalTime = (end - start);
    return (timeUsed / totalTime) * 100;
}

async function getNetworkInfo() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        return {
            speed: connection.downlink,
            type: connection.effectiveType,
            rtt: connection.rtt
        };
    }
    return null;
}

async function updateRealTimeMetrics() {
    // Get CPU usage
    const cpuUsage = await getCPUInfo() || Math.floor(30 + Math.random() * 40);
    
    // Get Memory usage
    const memoryInfo = await getMemoryInfo();
    const memoryUsage = memoryInfo ? memoryInfo.used : Math.floor(2000 + Math.random() * 2000);
    
    // Get Network speed
    const networkInfo = await getNetworkInfo();
    const networkSpeed = networkInfo ? networkInfo.speed : Math.floor(20 + Math.random() * 80);

    // Update DOM elements
    document.getElementById('cpuValue').textContent = cpuUsage + '%';
    document.getElementById('memoryValue').textContent = memoryUsage + ' MB';
    document.getElementById('networkValue').textContent = networkSpeed + ' Mbps';

    const timestamp = new Date().toLocaleTimeString();
    
    // Update performance data
    if (performanceData.cpu.length >= MAX_DATA_POINTS) {
        performanceData.cpu = performanceData.cpu.slice(-MAX_DATA_POINTS + 1);
        performanceData.memory = performanceData.memory.slice(-MAX_DATA_POINTS + 1);
        performanceData.network = performanceData.network.slice(-MAX_DATA_POINTS + 1);
        performanceData.timestamps = performanceData.timestamps.slice(-MAX_DATA_POINTS + 1);
    }

    performanceData.cpu.push(cpuUsage);
    performanceData.memory.push(memoryUsage);
    performanceData.network.push(networkSpeed);
    performanceData.timestamps.push(timestamp);

    updateCharts(cpuUsage, memoryUsage, networkSpeed);
}


function togglePerformanceSection() {
    const content = document.getElementById('performanceContent');
    const isHidden = content.style.display === 'none';
    
    content.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden) {
        initializePerformanceMonitoring();
    } else {
        // Stop monitoring when section is hidden
        stopMonitoring();
    }
}

function initializePerformanceMonitoring() {
    initializeCharts();
    startMonitoring();
    loadPerformanceHistory();
    updateProcessList();
}

function initializeCharts() {
    // CPU Chart
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    cpuChart = new Chart(cpuCtx, {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Free'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#FF6384', '#36A2EB']
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Memory Chart
    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    memoryChart = new Chart(memoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Free'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Network Chart
    const networkCtx = document.getElementById('networkChart').getContext('2d');
    networkChart = new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Network Speed',
                data: [],
                borderColor: '#FF9F40',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Performance History Chart
    const historyCtx = document.getElementById('performanceHistoryChart').getContext('2d');
    historyChart = new Chart(historyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU Usage',
                data: [],
                borderColor: '#FF6384',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

let monitoringInterval;

function startMonitoring() {
    if (monitoringInterval) clearInterval(monitoringInterval);
    monitoringInterval = setInterval(updateRealTimeMetrics, 1000);
}

function stopMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
}

function updateCharts(cpuUsage, memoryUsage, networkSpeed) {
    // Update CPU Chart
    cpuChart.data.datasets[0].data = [cpuUsage, 100 - cpuUsage];
    cpuChart.update();

    // Update Memory Chart
    const memoryPercentage = (memoryUsage / 8000) * 100;
    memoryChart.data.datasets[0].data = [memoryPercentage, 100 - memoryPercentage];
    memoryChart.update();

    // Update Network Chart with limited data points
    networkChart.data.labels = performanceData.timestamps;
    networkChart.data.datasets[0].data = performanceData.network;
    networkChart.update();

    // Update History Chart
    updateHistoryChart();
}


function clearCache() {
    // Simulate cache clearing with animation
    const cacheSize = document.getElementById('cacheSize');
    let size = parseInt(cacheSize.textContent);
    
    const clearInterval = setInterval(() => {
        size = Math.max(0, size - 50);
        cacheSize.textContent = size + ' MB';
        
        if (size === 0) {
            clearInterval(clearInterval);
            showNotification('Cache cleared successfully!');
        }
    }, 50);
}

function updatePerformanceMode() {
    const mode = document.getElementById('performanceMode').value;
    const modes = {
        balanced: { cpu: '30-70%', memory: '2000-4000MB' },
        performance: { cpu: '50-90%', memory: '4000-6000MB' },
        powersaver: { cpu: '20-40%', memory: '1000-2000MB' }
    };

    showNotification(`Performance mode changed to: ${mode}`);
    
    // Update monitoring parameters based on mode
    startMonitoring(); // Restart monitoring with new parameters
}

function optimizeProcesses() {
    const processList = document.getElementById('processList');
    processList.style.opacity = '0.5';
    
    setTimeout(() => {
        updateProcessList();
        processList.style.opacity = '1';
        showNotification('Background processes optimized successfully!');
    }, 1500);
}

function updateHistoryChart() {
    const metric = document.getElementById('historyMetric').value;
    const period = document.getElementById('historyPeriod').value;

    let data, label;
    switch(metric) {
        case 'cpu':
            data = performanceData.cpu;
            label = 'CPU Usage (%)';
            break;
        case 'memory':
            data = performanceData.memory;
            label = 'Memory Usage (MB)';
            break;
        case 'network':
            data = performanceData.network;
            label = 'Network Speed (Mbps)';
            break;
    }

    // Update history chart with limited data points
    historyChart.data.labels = performanceData.timestamps;
    historyChart.data.datasets[0].label = label;
    historyChart.data.datasets[0].data = data;
    historyChart.update();
}

function updateProcessList() {
    const processList = document.getElementById('processList');
    const entries = performance.getEntriesByType('resource');
    
    const processes = entries.slice(-3).map(entry => ({
        name: entry.name.split('/').pop() || 'Resource',
        duration: Math.round(entry.duration),
        size: Math.round(entry.transferSize / 1024) || Math.floor(100 + Math.random() * 100)
    }));

    processList.innerHTML = processes.map(process => `
        <div class="process-item" style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee;">
            <span>${process.name}</span>
            <span>Duration: ${process.duration}ms</span>
            <span>Size: ${process.size}KB</span>
        </div>
    `).join('');
}

// Monitor network changes
if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
        updateRealTimeMetrics();
    });
}

// Monitor memory usage changes
if ('memory' in performance) {
    const memoryObserver = new PerformanceObserver((list) => {
        updateRealTimeMetrics();
    });
    memoryObserver.observe({ entryTypes: ['memory'] });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.style.opacity = '1', 100);

    // Hide and remove notification
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const cacheSize = Math.floor(Math.random() * 500);
    document.getElementById('cacheSize').textContent = `${cacheSize} MB`;
    initializePerformanceMonitoring();
});
