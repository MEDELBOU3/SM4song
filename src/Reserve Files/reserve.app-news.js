const API_KEY = 'c3f1f1ea2b14265deb409dc3208001d7';
        let currentCategory = 'general';
        let currentPage = 1;
        let isLoading = false;
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

        const themeSwitch = document.getElementById('themeSwitch');
        const newsContainer = document.getElementById('newsContainer');
        const loader = document.getElementById('loader');
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        const scrollTop = document.getElementById('scrollTop');
        const notification = document.getElementById('notification');

        // Theme Switching
        themeSwitch.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            themeSwitch.classList.toggle('light');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            showNotification('Theme updated!');
        });

        // Load saved theme
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeSwitch.classList.add('light');
        }

        // Category Selection
        document.getElementById('categories').addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                document.querySelectorAll('.category-btn').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.dataset.category;
                currentPage = 1;
                newsContainer.innerHTML = '';
                fetchNews();
                showNotification(`Showing ${currentCategory} news`);
            }
        });

        // Search Functionality
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentPage = 1;
            newsContainer.innerHTML = '';
            fetchNews(searchInput.value);
            showNotification(`Searching for: ${searchInput.value}`);
        });

        // Infinite Scroll
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000 && !isLoading) {
                currentPage++;
                fetchNews();
            }

            scrollTop.classList.toggle('visible', window.scrollY > 500);
        });

        // Scroll to top functionality
        scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Notification function
        function showNotification(message) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Bookmark functionality
        function toggleBookmark(article) {
            const index = bookmarks.findIndex(bookmark => bookmark.title === article.title);
            if (index === -1) {
                bookmarks.push(article);
                showNotification('Article bookmarked!');
            } else {
                bookmarks.splice(index, 1);
                showNotification('Bookmark removed!');
            }
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            return index === -1;
        }

        // Share functionality
        async function shareArticle(article) {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: article.title,
                        text: article.description,
                        url: article.url
                    });
                    showNotification('Article shared successfully!');
                } catch (err) {
                    showNotification('Error sharing article');
                }
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(article.url);
                showNotification('Link copied to clipboard!');
            }
        }

        async function fetchNews(searchQuery = '') {
            if (isLoading) return;
            isLoading = true;
            loader.style.display = 'block';

            let url = searchQuery
                ? `https://gnews.io/api/v4/search?q=${searchQuery}&token=${API_KEY}&lang=en&page=${currentPage}`
                : `https://gnews.io/api/v4/top-headlines?category=${currentCategory}&token=${API_KEY}&lang=en&page=${currentPage}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                displayNews(data.articles);
            } catch (error) {
                console.error('Error fetching news:', error);
                newsContainer.innerHTML += '<div class="col-12 text-center">Error loading news. Please try again later.</div>';
                showNotification('Error loading news');
            } finally {
                loader.style.display = 'none';
                isLoading = false;
            }
        }

        function displayNews(articles) {
            const newsHTML = articles.map(article => {
                const isBookmarked = bookmarks.some(bookmark => bookmark.title === article.title);
                return `
                    <div class="col-md-4 mb-4 animate__animated animate__fadeIn">
                        <div class="news-card h-100">
                            <div class="news-image-container">
                                <img src="${article.image || 'https://via.placeholder.com/300x200'}" alt="${article.title}" class="news-image">
                                <span class="category-badge">${currentCategory}</span>
                                <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-bookmark"></i>
                                </button>
                                <button class="share-btn" onclick="shareArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-share-alt"></i>
                                </button>
                            </div>
                            <div class="card-body" style="padding: 1rem;">
                                <h5 class="card-title">${article.title}</h5>
                                <div class="news-meta">
                                    <span><i class="far fa-clock"></i> ${new Date(article.publishedAt).toLocaleDateString()}</span>
                                    <span class="news-source"><i class="far fa-newspaper"></i> ${article.source.name}</span>
                                </div>
                                <p class="card-text">${article.description}</p>
                                <a href="${article.url}" class="read-more-btn" target="_blank">Read More</a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            newsContainer.innerHTML += newsHTML;
        }

        // Initial load
        fetchNews();
