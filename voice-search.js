 class AdvancedSearch {
            constructor() {
                this.searchInput = document.getElementById('searchInput');
                this.voiceSearchBtn = document.getElementById('voiceSearch');
                this.searchSuggestions = document.querySelector('.search-suggestions');
                this.recognition = null;
                this.searchResults = [];
                this.isListening = false;
        
                this.initVoiceRecognition();
                this.initEventListeners();
            }
        
            initVoiceRecognition() {
                if ('webkitSpeechRecognition' in window) {
                    this.recognition = new webkitSpeechRecognition();
                    this.recognition.continuous = false;
                    this.recognition.interimResults = true;
                    this.recognition.lang = 'en-US'; //search language 
        
                    this.recognition.onstart = () => {
                        this.isListening = true;
                        this.voiceSearchBtn.classList.add('listening');
                        this.showVoiceSearchFeedback('Listening...');
                    };
        
                    this.recognition.onresult = (event) => {
                        const transcript = Array.from(event.results)
                            .map(result => result[0])
                            .map(result => result.transcript)
                            .join('');
        
                        this.searchInput.value = transcript;
                        this.performSearch(transcript);
                    };
        
                    this.recognition.onerror = (event) => {
                        console.error('Voice Recognition Error:', event.error);
                        this.stopVoiceRecognition();
                        this.showVoiceSearchFeedback('Voice recognition error occurred.');
                    };
        
                    this.recognition.onend = () => {
                        this.stopVoiceRecognition();
                    };
                } else {
                    this.voiceSearchBtn.style.display = 'none';
                }
            }
        
            initEventListeners() {
                this.searchInput.addEventListener('input', this.debounce((e) => {
                    this.handleSearch(e.target.value);
                }, 300));
        
                this.voiceSearchBtn.addEventListener('click', () => {
                    if (!this.isListening) {
                        this.startVoiceRecognition();
                    } else {
                        this.stopVoiceRecognition();
                    }
                });
        
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.search-container')) {
                        this.searchSuggestions.style.display = 'none';
                    }
                });
            }
        
            async handleSearch(query) {
                if (!query.trim()) {
                    this.searchSuggestions.style.display = 'none';
                    return;
                }
        
                try {
                    // تنقية وتحسين كلمات البحث
                    const cleanQuery = this.sanitizeSearchQuery(query);
                    const results = await this.fetchSearchResults(cleanQuery);
                    this.displaySearchResults(results);
                } catch (error) {
                    console.error('Search error:', error);
                    this.showErrorMessage('An error occurred in the search');
                }
            }
        
            sanitizeSearchQuery(query) {
                // تنقية وتحسين كلمات البحث
                return query.trim()
                    .replace(/[^\w\s\u0600-\u06FF]/gi, '') // يسمح بالحروف العربية والإنجليزية والأرقام
                    .replace(/\s+/g, ' ');
            }
        
            async fetchSearchResults(query) {
                // محاكاة طلب API
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            }
        
            displaySearchResults(results) {
                if (!results || results.length === 0) {
                    this.searchSuggestions.innerHTML = '<div class="suggestion-section"><p>No results found</p></div>';
                    this.searchSuggestions.style.display = 'block';
                    return;
                }
        
                const categorizedResults = this.categorizeResults(results);
                let html = '';
        
                // عرض النتائج حسب الفئة
                for (const [category, items] of Object.entries(categorizedResults)) {
                    if (items.length > 0) {
                        html += `
                            <div class="suggestion-section">
                                <h4>${this.getCategoryTitle(category)}</h4>
                                ${items.map(item => this.createResultItemHTML(item, category)).join('')}
                            </div>
                        `;
                    }
                }
        
                this.searchSuggestions.innerHTML = html;
                this.searchSuggestions.style.display = 'block';
            }
        
            categorizeResults(results) {
                return {
                    artists: results.filter(r => r.type === 'artist'),
                    tracks: results.filter(r => r.type === 'track'),
                    albums: results.filter(r => r.type === 'album')
                };
            }
        
            getCategoryTitle(category) {
                const titles = {
                    artists: 'Artists',
                    tracks: 'Songs',
                    albums: 'Albums'
                };
                return titles[category] || category;
            }
        
            createResultItemHTML(item, category) {
                return `
                    <div class="suggestion-item" data-id="${item.id}" data-type="${category}">
                        <img src="${item.thumbnail}" alt="${item.name}" class="suggestion-thumb">
                        <div class="suggestion-info">
                            <div class="suggestion-title">${this.highlightSearchTerm(item.name, this.searchInput.value)}</div>
                            ${item.artist ? `<div class="suggestion-subtitle">${item.artist}</div>` : ''}
                        </div>
                    </div>
                `;
            }
        
            highlightSearchTerm(text, searchTerm) {
                if (!searchTerm) return text;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                return text.replace(regex, '<mark>$1</mark>');
            }
        
            startVoiceRecognition() {
                if (this.recognition) {
                    this.recognition.start();
                }
            }
        
            stopVoiceRecognition() {
                if (this.recognition) {
                    this.recognition.stop();
                    this.isListening = false;
                    this.voiceSearchBtn.classList.remove('listening');
                }
            }
        
            showVoiceSearchFeedback(message) {
                const feedback = document.createElement('div');
                feedback.classList.add('voice-feedback');
                feedback.textContent = message;
                this.searchInput.parentElement.appendChild(feedback);
                
                setTimeout(() => feedback.remove(), 3000);
            }
        
            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        
            showErrorMessage(message) {
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('search-error');
                errorDiv.textContent = message;
                this.searchSuggestions.innerHTML = '';
                this.searchSuggestions.appendChild(errorDiv);
                this.searchSuggestions.style.display = 'block';
            }
        }
        
        // إضافة الأنماط الجديدة
        const styles = `
            .voice-feedback{
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: var(--hover-bg1);
                padding: 8px 16px;
                border-radius: 20px;
                margin-top: 10px;
                font-size: 0.9rem;
                color: var(--text-color);
                backdrop-filter: blur(10px);
                z-index: 1000;
            }
        
            #voiceSearch {
                position: absolute;
                right: 0px;
                border-top-right-radius: 20px;
                border-bottom-right-radius: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--text-color);
                background-color: var(--spotify-green);
                padding: 12px 18px;
                cursor: pointer;
            }
        
            #voiceSearch.listening {
                animation: pulse 1.5s infinite;
                color: var(--spotify-green);
            }
        
            .suggestion-thumb {
                width: 40px;
                height: 40px;
                border-radius: 4px;
                margin-right: 12px;
                object-fit: cover;
            }
        
            .suggestion-info {
                flex: 1;
            }
        
            .suggestion-title {
                font-weight: 500;
                margin-bottom: 4px;
            }
        
            .suggestion-subtitle {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
        
            mark {
                background-color: rgba(var(--spotify-green-rgb), 0.2);
                color: var(--spotify-green);
                padding: 0 2px;
                border-radius: 2px;
            }
        
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        
        // إضافة الأنماط إلى الصفحة
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // تهيئة البحث المتقدم
        const advancedSearch = new AdvancedSearch();
