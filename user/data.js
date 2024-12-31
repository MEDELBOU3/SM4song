function toggleStorageSection() {
    const content = document.getElementById('storageContent');
    const chevron = document.querySelector('.settings-header .fa-chevron-down');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
        displayStoredData();
        updateAnalytics();
    } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

function displayStoredData() {
    const filesGrid = document.getElementById('filesGrid');
    const timestamps = JSON.parse(localStorage.getItem('storage_timestamps') || '{}');
    
    if (localStorage.length === 0) {
        filesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <p>No stored data found</p>
            </div>
        `;
        return;
    }

    let html = '';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === 'storage_timestamps') continue;

        const value = localStorage.getItem(key);
        const timestamp = timestamps[key] ? new Date(timestamps[key]) : new Date();
        const fileSize = new Blob([value]).size;

        html += `
            <div class="file-card" id="file-${key}">
                <div class="file-icon" style="background: ${getRandomPastelColor()}">
                    ${getFileIcon(value)}
                </div>
                <div class="file-info">
                    <div class="file-name">${key}</div>
                    <div class="file-meta">
                        <span>${formatFileSize(fileSize)}</span>
                        <span>${formatDate(timestamp)}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="action-btn" onclick="editFile('${key}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="showFileMenu('${key}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                <div class="file-menu" id="menu-${key}">
                    <div class="menu-item" onclick="downloadData('${key}', 'json')">
                        <i class="fas fa-file-code"></i> Download JSON
                    </div>
                    <div class="menu-item" onclick="downloadData('${key}', 'csv')">
                        <i class="fas fa-file-csv"></i> Download CSV
                    </div>
                    <div class="menu-item" onclick="downloadData('${key}', 'txt')">
                        <i class="fas fa-file-alt"></i> Download Text
                    </div>
                    <div class="menu-item" onclick="deleteStorageItem('${key}')">
                        <i class="fas fa-trash"></i> Delete
                    </div>
                </div>
            </div>
        `;
    }
    filesGrid.innerHTML = html;
}

function downloadData(key, format) {
    const data = localStorage.getItem(key);
    let content, filename, type;

    switch (format) {
        case 'json':
            content = data;
            filename = `${key}.json`;
            type = 'application/json';
            break;
        case 'csv':
            try {
                const jsonData = JSON.parse(data);
                content = jsonToCSV(jsonData);
                filename = `${key}.csv`;
                type = 'text/csv';
            } catch {
                content = data;
                filename = `${key}.csv`;
                type = 'text/csv';
            }
            break;
        case 'txt':
            content = data;
            filename = `${key}.txt`;
            type = 'text/plain';
            break;
    }

    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function jsonToCSV(json) {
    if (typeof json !== 'object') return json;
    
    // Handle array of objects
    if (Array.isArray(json)) {
        if (json.length === 0) return '';
        const headers = Object.keys(json[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of json) {
            const values = headers.map(header => {
                const value = row[header];
                return `"${value}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    }
    
    // Handle single object
    const headers = Object.keys(json);
    const values = headers.map(key => `"${json[key]}"`);
    return `${headers.join(',')}\n${values.join(',')}`;
}

function getRandomPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 95%)`;
}

function getFileIcon(value) {
    try {
        JSON.parse(value);
        return '<i class="fas fa-file-code"></i>';
    } catch {
        return '<i class="fas fa-file-alt"></i>';
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(date) {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showFileMenu(key) {
    const menu = document.getElementById(`menu-${key}`);
    document.querySelectorAll('.file-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.action-btn')) {
        document.querySelectorAll('.file-menu').forEach(m => {
            m.classList.remove('show');
        });
    }
});


let currentEditingKey = null;

        function updateAnalytics() {
            const totalFiles = Object.keys(localStorage).length;
            let totalSize = 0;
            let lastModifiedDate = null;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                totalSize += new Blob([value]).size;

                const timestamp = JSON.parse(localStorage.getItem('storage_timestamps') || '{}')[key];
                if (timestamp) {
                    const date = new Date(timestamp);
                    if (!lastModifiedDate || date > lastModifiedDate) {
                        lastModifiedDate = date;
                    }
                }
            }

            document.getElementById('totalFiles').textContent = totalFiles;
            document.getElementById('totalStorage').textContent = formatFileSize(totalSize);
            document.getElementById('avgFileSize').textContent = formatFileSize(totalSize / totalFiles);
            document.getElementById('lastModified').textContent = lastModifiedDate ? 
                formatDate(lastModifiedDate) : 'Never';
        }

        function editFile(key) {
            currentEditingKey = key;
            const value = localStorage.getItem(key);
            const modal = document.getElementById('editModal');
            const editor = document.getElementById('fileEditor');
            
            try {
                const parsed = JSON.parse(value);
                editor.value = JSON.stringify(parsed, null, 2);
            } catch {
                editor.value = value;
            }

            modal.classList.add('show');
        }

        function saveFile() {
            if (!currentEditingKey) return;

            const editor = document.getElementById('fileEditor');
            localStorage.setItem(currentEditingKey, editor.value);
            updateTimestamp(currentEditingKey);
            closeModal();
            displayStoredData();
            updateAnalytics();
        }

        function closeModal() {
            document.getElementById('editModal').classList.remove('show');
            currentEditingKey = null;
        }

        function addNewFile() {
            const key = prompt('Enter file name:');
            if (key) {
                localStorage.setItem(key, '');
                updateTimestamp(key);
                displayStoredData();
                updateAnalytics();
                editFile(key);
            }
        }

        // Initialize the display
        displayStoredData();
        updateAnalytics();
  
  
  
 // Add this function to handle AI analysis

 async function analyzeDataWithAI() {
    const aiResults = document.getElementById('aiAnalysisResults');
    const loadingElement = document.querySelector('.ai-loading');
    
    if (!aiResults || !loadingElement) {
        console.error('Required elements not found');
        return;
    }

    loadingElement.style.display = 'flex';
    aiResults.innerHTML = '';

    try {
        // Collect data from localStorage
        const storageData = collectStorageData();
        
        // Basic analysis if API calls fail
        const analysis = {
            keywords: extractKeywords(storageData),
            insights: generateBasicInsights(storageData),
            recommendations: generateBasicRecommendations(storageData)
        };

        displayEnhancedAnalysis({
            geminiInsights: analysis,
            images: { hits: [] }, // Empty images array as fallback
            recommendations: analysis.recommendations
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        loadingElement.style.display = 'none';
        aiResults.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error generating analysis: ${error.message}</p>
            </div>
        `;
    }
}


function collectStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'storage_timestamps') {
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                data[key] = localStorage.getItem(key);
            }
        }
    }
    return data;
}


async function generateGeminiAnalysis(data) {
    const GEMINI_API_KEY = 'AIzaSyBnKZOpnLn18aiuDMT5B2CCbEHHOXSUYeY';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

    const prompt = {
        text: `Analyze this data and provide insights: ${JSON.stringify(data)}. 
               Include key themes, patterns, and recommendations.
               Format response as JSON with sections: keywords, insights, recommendations`
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: JSON.stringify(prompt) }] }]
        })
    });

    const result = await response.json();
    return JSON.parse(result.candidates[0].content.parts[0].text);
}

async function getRelatedImages(keywords) {
    const PIXABAY_API_KEY = '42636651-cfb9c563a2e43f1a099ee33b8';
    const query = keywords.slice(0, 3).join('+');
    
    const response = await fetch(
        `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&per_page=6`
    );
    return await response.json();
}

function extractKeywords(data) {
    const keywords = new Set();
    Object.keys(data).forEach(key => {
        keywords.add(key.toLowerCase());
    });
    return Array.from(keywords).slice(0, 5);
}

function generateBasicInsights(data) {
    const insights = [];
    const totalItems = Object.keys(data).length;
    
    insights.push({
        title: 'Storage Overview',
        description: `Total ${totalItems} items stored in local storage.`
    });

    return insights;
}


function generateRecommendations(analysis) {
    return analysis.keywords.map(keyword => ({
        title: `Exploring ${keyword}`,
        type: 'article',
        description: `Deep dive into ${keyword} and its applications`,
        link: `https://example.com/learn/${keyword}`,
        relevance: 'High'
    })).slice(0, 5);
}

function generateContentRecommendations(keywords) {
    const recommendations = [
        {
            type: 'article',
            title: 'Best Practices for Data Storage',
            description: 'Learn how to optimize your data storage and management techniques.',
            relevance: 'High'
        },
        {
            type: 'tool',
            title: 'Data Visualization Tools',
            description: 'Explore tools to better visualize and understand your stored data.',
            relevance: 'Medium'
        },
        {
            type: 'resource',
            title: 'Security Guidelines',
            description: 'Essential security practices for protecting stored data.',
            relevance: 'High'
        }
    ];

    // Add keyword-specific recommendations
    keywords.forEach(keyword => {
        recommendations.push({
            type: 'article',
            title: `Understanding ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
            description: `Deep dive into ${keyword} and its implications for your data.`,
            relevance: 'Medium'
        });
    });

    return recommendations.slice(0, 5);
}

function generateBasicRecommendations(data) {
    return [
        {
            title: 'Data Organization',
            description: 'Consider organizing your data into categories',
            type: 'recommendation',
            relevance: 'High'
        },
        {
            title: 'Storage Usage',
            description: 'Monitor your storage usage regularly',
            type: 'recommendation',
            relevance: 'Medium'
        }
    ];
}

function displayEnhancedAnalysis(data) {
    const aiResults = document.getElementById('aiAnalysisResults');
    const loadingElement = document.querySelector('.ai-loading');

    if (!aiResults || !loadingElement) return;

    const html = `
        <div class="enhanced-analysis">
            <div class="insights-section">
                <h3>Analysis Results</h3>
                <div class="insights-grid">
                    ${data.geminiInsights.insights.map(insight => `
                        <div class="insight-card" style="background: ${getRandomPastelColor()}">
                            <div class="insight-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <h4>${insight.title}</h4>
                            <p>${insight.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="recommendations">
                <h3>Recommendations</h3>
                <div class="recommendations-grid">
                    ${data.recommendations.map(rec => `
                        <div class="recommendation-card">
                            <div class="rec-icon">
                                <i class="fas fa-lightbulb"></i>
                            </div>
                            <div class="rec-content">
                                <h4>${rec.title}</h4>
                                <p>${rec.description}</p>
                                <span class="relevance">${rec.relevance}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    loadingElement.style.display = 'none';
    aiResults.innerHTML = html;
}


function getInsightColor(type) {
    const colors = {
        pattern: '#4CAF50',
        recommendation: '#2196F3',
        alert: '#FF5722'
    };
    return colors[type] || '#9E9E9E';
}

function getContentTypeIcon(type) {
    const icons = {
        article: 'fas fa-newspaper',
        tool: 'fas fa-tools',
        resource: 'fas fa-book'
    };
    return icons[type] || 'fas fa-link';
}

// Add this to your HTML content (inside the settings-section, after the files-container)
function addAIAnalysisSection() {
    const aiSection = `
        <div class="ai-analysis-section">
            <div class="ai-header">
                <h3>AI Data Analysis</h3>
                <button class="btn btn-primary" onclick="analyzeDataWithAI()">
                    <i class="fas fa-robot"></i> Generate Analysis
                </button>
            </div>
            <div class="ai-content">
                <div class="ai-loading" style="display: none;">
                    <div class="spinner"></div>
                    <p>Analyzing data...</p>
                </div>
                <div id="aiAnalysisResults" class="ai-results"></div>
            </div>
        </div>
    `;

    const filesContainer = document.querySelector('.files-container');
    filesContainer.insertAdjacentHTML('afterend', aiSection);
}

// Function to display AI analysis results
function displayAIAnalysis(analysis) {
    const aiResults = document.getElementById('aiAnalysisResults');
    const loadingElement = document.querySelector('.ai-loading');
    
    // Parse potential insights from the AI response
    const insights = parseAIInsights(analysis);
    
    let html = `
        <div class="analysis-container">
            <div class="analysis-summary">
                <h4>Key Insights</h4>
                <div class="insights-grid">
                    ${insights.map(insight => `
                        <div class="insight-card">
                            <div class="insight-icon">
                                <i class="${getInsightIcon(insight.type)}"></i>
                            </div>
                            <div class="insight-content">
                                <div class="insight-title">${insight.title}</div>
                                <div class="insight-description">${insight.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="analysis-details">
                <h4>Detailed Analysis</h4>
                <div class="analysis-text">${analysis}</div>
            </div>
        </div>
    `;
    
    loadingElement.style.display = 'none';
    aiResults.innerHTML = html;
}

// Helper function to parse AI insights
function parseAIInsights(analysis) {
    // This is a simple example - you might want to enhance this based on your AI's output format
    return [
        {
            type: 'pattern',
            title: 'Data Patterns',
            description: 'Common patterns found in the stored data'
        },
        {
            type: 'recommendation',
            title: 'Recommendations',
            description: 'Suggested actions based on data analysis'
        },
        {
            type: 'alert',
            title: 'Potential Issues',
            description: 'Areas that might need attention'
        }
    ];
}

// Helper function to get insight icons
function getInsightIcon(type) {
    const icons = {
        pattern: 'fas fa-chart-line',
        recommendation: 'fas fa-lightbulb',
        alert: 'fas fa-exclamation-triangle',
        default: 'fas fa-info-circle'
    };
    return icons[type] || icons.default;
}


// Add this to your initialization code
function initializeAISection() {
    // Add the styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Add the AI analysis section when displaying storage
    document.addEventListener('DOMContentLoaded', () => {
        addAIAnalysisSection();
    });

}
