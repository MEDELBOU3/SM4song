// News Modal
function createNewsModal() {
    const newsModal = document.createElement('div');
    newsModal.id = 'newsContainer';
    newsModal.className = 'news-modal'; // حذفنا side-modal لأننا سنضع تنسيق مختلف
    newsModal.innerHTML = `
        <div class="modal-header">
            <h2>News Feed</h2>
            <div class="modal-controls">
                <button id="closeNews"><i class="fa fa-times"></i></button>
            </div>
        </div>
        <div class="modal-search">
            <input type="text" id="newsSearch" placeholder="Search news...">
            <button id="searchNewsBtn"><i class="fas fa-search"></i></button>
        </div>
        <div class="news-tabs">
            <button class="tab-btn active" data-category="headlines">Headlines</button>
            <button class="tab-btn" data-category="technology">Technology</button>
            <button class="tab-btn" data-category="saved">Saved</button>
        </div>
        <div class="news-content"></div>
    `;
    document.body.appendChild(newsModal);
    setupNewsEventListeners();
}

// setup News Event Listeners
function setupNewsEventListeners() {
    const openNewsBtn = document.getElementById('openNews');
    const closeNewsBtn = document.getElementById('closeNews');
    const newsModal = document.getElementById('newsContainer');
    const moviesModal = document.getElementById('moviesContainer');
    const searchInput = document.getElementById('newsSearch');
    const searchBtn = document.getElementById('searchNewsBtn');
    
    if (!openNewsBtn || !closeNewsBtn || !newsModal || !moviesModal) {
        console.error('Required elements not found');
        return;
    }
    
    openNewsBtn.addEventListener('click', () => {
        moviesModal.classList.add('with-news');
        newsModal.classList.add('visible');
        loadNews('headlines');
    });

    closeNewsBtn.addEventListener('click', () => {
        moviesModal.classList.remove('with-news');
        newsModal.classList.remove('visible');
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) searchNews(query);
        }
    });

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) searchNews(query);
    });

    document.querySelectorAll('.news-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.news-tabs .tab-btn')
                .forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            loadNews(e.target.dataset.category);
        });
    });
}

// download news from API
async function loadNews(category) {
    const newsContent = document.querySelector('.news-content');
    newsContent.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading news...</span></div>';
    
    try {
        if (category === 'saved') {
            let savedNews = [];
            try {
                savedNews = JSON.parse(localStorage.getItem('savedNews')) || [];
                if (!Array.isArray(savedNews)) savedNews = [];
            } catch (e) {
                savedNews = [];
            }
            
            if (savedNews.length === 0) {
                newsContent.innerHTML = `
                    <div class="no-saved-news">
                        <i class="fas fa-bookmark"></i>
                        <p>No saved articles yet</p>
                        <span>Articles you save will appear here</span>
                    </div>
                `;
                return;
            }
            
            displayNews(savedNews);
            return;
        }
        
        const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&apikey=${GNEWS_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid data format received');
        }
        
        displayNews(data.articles);
    } catch (error) {
        console.error('Error loading news:', error);
        newsContent.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading news</p>
                <span>Please try again later</span>
                <button onclick="loadNews('${category}')" class="retry-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loading');
    
    // Simulate a delay to hide the loader
    setTimeout(() => {
      loader.style.display = 'none';
    }, 5000); // Adjust time as needed
  });
  
// display news
function displayNews(articles) {
    const newsContent = document.querySelector('.news-content');
    if (!articles.length) {
        newsContent.innerHTML = '<div class="no-news">No news articles found</div>';
        return;
    }
    
    newsContent.innerHTML = articles.map(article => {
        // Sanitize the article data before encoding
        const sanitizedArticle = {
            title: article.title || '',
            description: article.description || '',
            url: article.url || '',
            image: article.image || ''
        };
        
        const encodedArticle = encodeURIComponent(JSON.stringify(sanitizedArticle));
        
        return `
            <div class="news-card">
                <div class="news-image" style="background-image: url('${sanitizedArticle.image || 'path/to/default-image.jpg'}')"></div>
                <div class="news-details">
                    <h3>${sanitizedArticle.title}</h3>
                    <p>${sanitizedArticle.description}</p>
                    <div class="news-actions">
                        <button onclick="saveNews('${encodedArticle}')" class="save-btn">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button onclick="shareNews('${sanitizedArticle.url}')" class="share-btn">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <a href="${sanitizedArticle.url}" target="_blank" class="read-more">Read More</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// save news
function saveNews(encodedArticle) {
    try {
        const article = JSON.parse(decodeURIComponent(encodedArticle));
        let savedNews = [];
        
        // Safely get saved news from localStorage
        try {
            savedNews = JSON.parse(localStorage.getItem('savedNews')) || [];
            if (!Array.isArray(savedNews)) savedNews = [];
        } catch (e) {
            savedNews = [];
        }
        
        // Check if article already exists
        const isDuplicate = savedNews.some(news => news.url === article.url);
        
        if (!isDuplicate) {
            // Add timestamp for sorting
            article.savedAt = new Date().toISOString();
            savedNews.push(article);
            
            // Sort by saved date, newest first
            savedNews.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            
            // Save to localStorage
            localStorage.setItem('savedNews', JSON.stringify(savedNews));
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'save-notification';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Article saved successfully!</span>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after animation
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        } else {
            // Show already saved notification
            const notification = document.createElement('div');
            notification.className = 'save-notification warning';
            notification.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>Article already saved</span>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }
    } catch (error) {
        console.error('Error saving news:', error);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'save-notification error';
        notification.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <span>Error saving article</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}


// share news
function shareNews(url) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this news',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
}

// Search news
async function searchNews(query) {
    const newsContent = document.querySelector('.news-content');
    try {
        const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&apikey=${GNEWS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        displayNews(data.articles);
    } catch (error) {
        console.error('Error searching news:', error);
        newsContent.innerHTML = '<p class="error">Error searching news. Please try again later.</p>';
    }
}





