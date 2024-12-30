   // Function to get current timestamp
   function getCurrentTimestamp() {
    return new Date().toLocaleString();
}

function updateTimestamp(key) {
    let timestamps = JSON.parse(localStorage.getItem('storage_timestamps') || '{}');
    timestamps[key] = new Date().toISOString();
    localStorage.setItem('storage_timestamps', JSON.stringify(timestamps));
}

function initializeTimestamps() {
    let timestamps = JSON.parse(localStorage.getItem('storage_timestamps') || '{}');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'storage_timestamps' && !timestamps[key]) {
            timestamps[key] = getCurrentTimestamp();
        }
    }
    localStorage.setItem('storage_timestamps', JSON.stringify(timestamps));
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    return date.toLocaleString(undefined, options);
}

function formatValue(value) {
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' ? 
            JSON.stringify(parsed, null, 2) : 
            parsed.toString();
    } catch {
        return value;
    }
}

// Function to convert data to CSV
function convertToCSV(data) {
    try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (typeof parsedData === 'object') {
            const fields = Object.keys(parsedData);
            const csv = [
                fields.join(','),
                Object.values(parsedData).map(value => `"${value}"`).join(',')
            ];
            return csv.join('\n');
        }
        return data.toString();
    } catch {
        return data.toString();
    }
}

// Function to download data in different formats
function downloadData(key, format) {
    const value = localStorage.getItem(key);
    const timestamps = JSON.parse(localStorage.getItem('storage_timestamps') || '{}');
    const timestamp = timestamps[key];
    
    let content, filename, type;
    
    switch(format) {
        case 'json':
            content = JSON.stringify({
                key: key,
                value: value,
                timestamp: timestamp,
                exportDate: new Date().toISOString()
            }, null, 2);
            filename = `${key}_${new Date().toISOString()}.json`;
            type = 'application/json';
            break;
            
        case 'csv':
            content = convertToCSV({
                key: key,
                value: value,
                timestamp: timestamp,
                exportDate: new Date().toISOString()
            });
            filename = `${key}_${new Date().toISOString()}.csv`;
            type = 'text/csv';
            break;
            
        case 'txt':
            content = `Key: ${key}\nValue: ${value}\nTimestamp: ${timestamp}\nExport Date: ${new Date().toISOString()}`;
            filename = `${key}_${new Date().toISOString()}.txt`;
            type = 'text/plain';
            break;
    }
    
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function displayLocalStorage() {
    const container = document.getElementById('content');
    const timestamps = JSON.parse(localStorage.getItem('storage_timestamps') || '{}');
    const totalSize = new Blob([JSON.stringify(localStorage)]).size;
    
    let html = `
        <div class="storage-container">
            <div class="storage-header">
                <h2>Local Storage Explorer</h2>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="displayLocalStorage()">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <button id="colorToggle" class="toggle-button"><i class="fa fa-palette" style="font-size: 24px;"></i><span id="toggleText">On</span></button>
                    <button class="btn btn-danger" onclick="clearAllStorage()">
                        <i class="fas fa-trash"></i> Clear All
                    </button>
                </div>
            </div>
            
            <div class="storage-stats">
                <div class="stat-card">
                    <div class="stat-title">Stored Items</div>
                    <div class="stat-value">${localStorage.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Total Size</div>
                    <div class="stat-value">${(totalSize / 1024).toFixed(2)} KB</div>
                </div>
            </div>
            
            <div class="storage-items">
    `;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === 'storage_timestamps') continue;
        
        const value = localStorage.getItem(key);
        const formattedValue = formatValue(value);
        const timestamp = timestamps[key] ? formatDateTime(timestamps[key]) : 'N/A';
        
        html += `
            <div class="storage-item">
                <div class="item-header">
                    <span class="item-key">${key}</span>
                    <div class="item-meta">
                        <span class="item-type">${typeof value}</span>
                        <span class="item-timestamp">
                            <i class="far fa-clock"></i> ${timestamp}
                        </span>
                    </div>
                </div>
                <div class="item-content">
                    <pre class="item-value">${formattedValue}</pre>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary" onclick="editStorageItem('${key}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="copyToClipboard('${key}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <div class="dropdown">
                        <button class="btn btn-secondary" onclick="showDownloadOptions('${key}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <div id="download-${key}" class="download-options">
                            <div class="download-option" onclick="downloadData('${key}', 'json')">
                                <span class="file-type-icon json-icon">J</span> JSON
                            </div>
                            <div class="download-option" onclick="downloadData('${key}', 'csv')">
                                <span class="file-type-icon csv-icon">C</span> CSV
                            </div>
                            <div class="download-option" onclick="downloadData('${key}', 'txt')">
                                <span class="file-type-icon txt-icon">T</span> Text
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-danger" onclick="deleteStorageItem('${key}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function showDownloadOptions(key) {
    const dropdown = document.getElementById(`download-${key}`);
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        // Hide all other dropdowns first
        document.querySelectorAll('.download-options').forEach(el => {
            el.style.display = 'none';
        });
        dropdown.style.display = 'block';
    }
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.download-options').forEach(el => {
            el.style.display = 'none';
        });
    }
});

// Add this helper function for copying to clipboard
function copyToClipboard(key) {
    const value = localStorage.getItem(key);
    navigator.clipboard.writeText(value).then(() => {
        alert('Copied to clipboard!');
    });
}

// Function to clear all storage
function clearAllStorage() {
    if (confirm('Are you sure you want to clear all local storage data?')) {
        localStorage.clear();
        displayLocalStorage();
    }
}

function deleteStorageItem(key) {
    if (confirm(`Are you sure you want to delete "${key}"?`)) {
        localStorage.removeItem(key);
        let timestamps = JSON.parse(localStorage.getItem('storage_timestamps') || '{}');
        delete timestamps[key];
        localStorage.setItem('storage_timestamps', JSON.stringify(timestamps));
        displayLocalStorage();
    }
}

// Function to edit storage item
function editStorageItem(key) {
    const currentValue = localStorage.getItem(key);
    const newValue = prompt('Edit value:', currentValue);
    
    if (newValue !== null) {
        localStorage.setItem(key, newValue);
        updateTimestamp(key);
        displayLocalStorage();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTimestamps();
    
    // Override localStorage.setItem to update timestamps
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key !== 'storage_timestamps') {
            updateTimestamp(key);
        }
    };
});


// Initialize timestamps when the page loads
initializeTimestamps();

// Add event listener for the settings menu item
document.querySelector('[data-page="settings"]').addEventListener('click', () => {
    displayLocalStorage();
});

// Hook into your existing storage operations
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    updateTimestamp(key);
};
