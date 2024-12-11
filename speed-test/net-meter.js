 class SpeedTest {
            
            constructor() {
                this.modal = document.querySelector('.speed-test-modal');
                this.downloadGauge = document.querySelector('.speed-gauge.download .speed-value');
                this.uploadGauge = document.querySelector('.speed-gauge.upload .speed-value');
                this.progressBar = document.querySelector('.progress-bar-fill');
                this.status = document.querySelector('.test-status');
                this.testButton = document.querySelector('.test-button');
                this.closeButton = document.querySelector('.close-speed-test');
                this.speedHistory = this.loadSpeedHistory();
                this.charts = {};

                this.initializeEventListeners();
                this.initializeCharts();

                this.testServers = [
                    'https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
                    'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
                ];
            }

            async measureLatency() {
                const start = performance.now();
                await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
                    mode: 'no-cors',
                    cache: 'no-store'
                });
                return performance.now() - start;
            }


            async measureDownloadSpeed() {
                const testDuration = 8000; // 8 seconds test
                const chunks = [];
                let bytesReceived = 0;
                const startTime = performance.now();
                
                try {
                    // Test multiple files concurrently for more accurate measurement
                    const downloadPromises = this.testServers.map(async (server) => {
                        const response = await fetch(server, {
                            cache: 'no-store'
                        });
            
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
            
                        const reader = response.body.getReader();
                        
                        while (performance.now() - startTime < testDuration) {
                            const {value, done} = await reader.read();
                            if (done) break;
                            bytesReceived += value.length;
                            chunks.push(value);
            
                            // Update progress in real-time
                            const elapsedSeconds = (performance.now() - startTime) / 1000;
                            const currentSpeed = (bytesReceived * 8) / elapsedSeconds / 1000000;
                            this.downloadGauge.textContent = currentSpeed.toFixed(2);
                        }
            
                        reader.cancel();
                    });
            
                    // Wait for all download tests to complete
                    await Promise.all(downloadPromises);
            
                    const duration = (performance.now() - startTime) / 1000;
                    const bitsReceived = bytesReceived * 8;
                    const speedMbps = (bitsReceived / duration) / 1000000;
            
                    // Apply correction factor based on network conditions
                    const correctionFactor = 1.1; // Adjust this based on testing
                    return speedMbps * correctionFactor;
            
                } catch (error) {
                    console.error('Download test error:', error);
                    return 0;
                }
            }

            

            async measureUploadSpeed() {
                const chunkSize = 1024 * 256; // 256KB chunks
                const testDuration = 8000; // 5 seconds test
                let bytesSent = 0;
                const startTime = performance.now();
                const testData = new Uint8Array(chunkSize);
        
                try {
                    while (performance.now() - startTime < testDuration) {
                        await fetch('https://httpbin.org/post', {
                            method: 'POST',
                            body: testData,
                            headers: {
                                'Content-Type': 'application/octet-stream'
                            }
                        });
                        bytesSent += chunkSize;
                    }
        
                    const duration = (performance.now() - startTime) / 1000; // Convert to seconds
                    const bitsSent = bytesSent * 8;
                    return (bitsSent / duration) / 1000000; // Convert to Mbps
                } catch (error) {
                    console.error('Upload test error:', error);
                    return 0;
                }
            }

            loadSpeedHistory() {
                return JSON.parse(localStorage.getItem('speedTestHistory')) || [];
            }

            saveSpeedHistory() {
                localStorage.setItem('speedTestHistory', JSON.stringify(this.speedHistory));
            }

            async measureSpeed(type) {
                const testFile = type === 'download' 
                    ? 'https://cdn.jsdelivr.net/npm/chart.js' // Use actual large file in production
                    : new Blob([new ArrayBuffer(1024 * 1024)]); // 1MB test file for upload

                const start = performance.now();
                
                if (type === 'download') {
                    const response = await fetch(testFile);
                    await response.blob();
                } else {
                    await fetch('https://httpbin.org/post', {
                        method: 'POST',
                        body: testFile
                    });
                }

                const end = performance.now();
                const duration = (end - start) / 1000; // seconds
                const size = type === 'download' ? 0.17 : 1; // MB
                return (size * 8) / duration; // Mbps
            }

            async runSpeedTest() {
                this.testButton.disabled = true;
                this.progressBar.style.width = '0%';
                
                try {
                    // Measure latency
                    this.status.textContent = 'Measuring latency...';
                    this.progressBar.style.width = '10%';
                    const latency = await this.measureLatency();
                    
                    // Download test
                    this.status.textContent = 'Testing download speed...';
                    this.progressBar.style.width = '25%';
                    const downloadSpeed = await this.measureDownloadSpeed();
                    this.downloadGauge.textContent = downloadSpeed.toFixed(2);
                    this.progressBar.style.width = '50%';
        
                    // Upload test
                    this.status.textContent = 'Testing upload speed...';
                    this.progressBar.style.width = '75%';
                    const uploadSpeed = await this.measureUploadSpeed();
                    this.uploadGauge.textContent = uploadSpeed.toFixed(2);
                    this.progressBar.style.width = '100%';
        
                    // Save results
                    this.speedHistory.push({
                        timestamp: new Date().toISOString(),
                        latency: latency,
                        download: downloadSpeed,
                        upload: uploadSpeed
                    });
                    this.saveSpeedHistory();
                    this.updateCharts();
        
                    this.status.textContent = `Test completed! Latency: ${latency.toFixed(0)}ms`;
                } catch (error) {
                    this.status.textContent = 'Test failed. Please try again.';
                    console.error('Speed test error:', error);
                }
        
                this.testButton.disabled = false;
            }
        
          


         
            initializeCharts() {
                // Speed History Chart
                this.charts.history = new Chart(
                    document.getElementById('speedHistoryChart'),
                    {
                        type: 'line',
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: 'Download Speed',
                                    borderColor: '#007bff',
                                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                    fill: true,  
                                    borderWidth: 1,
                                    barPercentage: 0.8,  
                                    categoryPercentage: 0.9 , 
                                    data: []
                                },
                                {
                                    label: 'Upload Speed',
                                    borderColor: '#28a745',
                                    backgroundColor: 'rgba(40, 167, 69, 0.3)',
                                    fill: true,  
                                    borderWidth: 1,
                                    barPercentage: 0.8,  
                                    categoryPercentage: 0.9 , 
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
                            }
                        }
                    }
                );

                // Daily Average Chart
                this.charts.daily = new Chart(
                    document.getElementById('dailyAverageChart'),
                    {
                        type: 'bar',
                        data: {
                            labels: [],
                            datasets: [
                                {
                                    label: 'Average Download',
                                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                                    data: []
                                },
                                {
                                    label: 'Average Upload',
                                    backgroundColor: 'rgba(40, 167, 69, 0.5)',
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
                            }
                        }
                    }
                );

                this.updateCharts();
            }

            updateCharts() {
                // Update Speed History Chart
                const last10Tests = this.speedHistory.slice(-10);
                this.charts.history.data.labels = last10Tests.map(test => 
                    new Date(test.timestamp).toLocaleTimeString()
                );
                this.charts.history.data.datasets[0].data = last10Tests.map(test => test.download);
                this.charts.history.data.datasets[1].data = last10Tests.map(test => test.upload);
                this.charts.history.update();

                // Update Daily Average Chart
                const dailyAverages = this.calculateDailyAverages();
                this.charts.daily.data.labels = Object.keys(dailyAverages);
                this.charts.daily.data.datasets[0].data = Object.values(dailyAverages).map(day => day.download);
                this.charts.daily.data.datasets[1].data = Object.values(dailyAverages).map(day => day.upload);
                this.charts.daily.update();
            }

            calculateDailyAverages() {
                const dailyData = {};
                
                this.speedHistory.forEach(test => {
                    const date = new Date(test.timestamp).toLocaleDateString();
                    if (!dailyData[date]) {
                        dailyData[date] = {
                            download: [],
                            upload: []
                        };
                    }
                    dailyData[date].download.push(test.download);
                    dailyData[date].upload.push(test.upload);
                });

                // Calculate averages
                Object.keys(dailyData).forEach(date => {
                    dailyData[date] = {
                        download: average(dailyData[date].download),
                        upload: average(dailyData[date].upload)
                    };
                });

                return dailyData;
            }

            initializeEventListeners() {
                this.testButton.addEventListener('click', () => this.runSpeedTest());
                this.closeButton.addEventListener('click', () => this.modal.style.display = 'none');
                window.addEventListener('click', (e) => {
                    if (e.target === this.modal) {
                        this.modal.style.display = 'none';
                    }
                });
            }

            show() {
                this.modal.style.display = 'block';
            }
        }

        function average(arr) {
            return arr.reduce((a, b) => a + b, 0) / arr.length;
        }

        // Initialize speed test
        const speedTest = new SpeedTest();
