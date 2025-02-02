        //const for apis and URL
        const TMDB_API_KEY = '431fb541e27bceeb9db2f4cab69b54e1';
        const GNEWS_API_KEY = 'd605509d52ed69ee619920835a0a60e8';
        const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
        const TMDB_IMAGE_BASE_URL1 = 'https://image.tmdb.org/t/p/w1280';
        
        //these functions to fetch movie data
        async function fetchTMDBData(endpoint, params = '') {
           const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}${params}`);
           return await response.json();
        }
        
        
        // movies button 
        function addMoviesButton() {
            //  checking if button already exists
            if (document.getElementById('movies-btn')) return;
            
            // Create button directly in body instead of nav
            const moviesButton = document.createElement('button');
            moviesButton.innerHTML = '<i class="fas fa-film"></i> Movies';
            moviesButton.id = 'movies-btn';
            moviesButton.onclick = toggleMoviesModal;
            document.body.appendChild(moviesButton);
            
            // Log to check if function is called
            console.log('Movies button added');
        }
        
        
        // Create  movies modal to the DOM
        function createMoviesModal() {
            const moviesModal = document.createElement('div');
            moviesModal.id = 'moviesContainer';
            moviesModal.className = 'side-modal';
            moviesModal.innerHTML = `
                <div class="modal-header">
                    <h2>Movies</h2>
                    <div class="modal-controls">
                        <button id="openNews" class="news-btn">
                           <i class="fas fa-newspaper"></i>
                        </button>
                        <button id="openWeather" class="weather-btn">
                          <i class="fas fa-cloud-sun"></i>
                        </button>
                        <button id="openSports" class="sports-btn">
                          <i class="fas fa-futbol"></i>
                        </button>
                        <button id="closeMovies"><i class="fa fa-times"></i></button>
                        
                    </div>
                </div>
                <div class="main-cont">
                    <div class="modal-search">
                       <input type="text" id="movieSearch" placeholder="Search movies...">
                        <select id="genreSelect">
                          <option value="">All Genres</option>
                        </select>
                       <button id="searchMovieBtn"><i class="fas fa-search"></i></button>
                    </div>
                    <div class="movies-tabs">
                       <button class="tab-btn active" data-category="popular">Popular</button>
                       <button class="tab-btn" data-category="top_rated">Top Rated</button>
                       <button class="tab-btn" data-category="upcoming">Upcoming</button>
                       
                        <button id="savedMovies" class="saved-btn">
                            <i class="fas fa-bookmark"></i> Saved
                        </button>
                        <button id="favorites" class="favorite-btn">
                            <i class="fas fa-heart"></i> Favorite
                        </button>
                       
                    </div>
                    <div class="movies-content"></div>
                </div>
                
            `;
            document.body.appendChild(moviesModal);
            setupMoviesEventListeners();
            createNewsModal();
            loadGenres();
            createWeatherModal();
            createSportsModal();
        
        }

        // Load genres for select dropdown
        async function loadGenres() {
            const data = await fetchTMDBData('/genre/movie/list');
            const select = document.getElementById('genreSelect');
            data.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                select.appendChild(option);
            });
        }

       

        function playMovieTrailer(trailerKey) {
            const trailerContainer = document.createElement('div');
            trailerContainer.className = 'trailer-modal';
            trailerContainer.innerHTML = `
                <div class="trailer-content">
                    <button class="close-trailer">&times;</button>
                    <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${trailerKey}"
                        frameborder="0" allowfullscreen>
                    </iframe>
                </div>
            `;
            document.body.appendChild(trailerContainer);
            
            trailerContainer.querySelector('.close-trailer').onclick = () => 
                trailerContainer.remove();
        }
        
        
        function toggleMoviesModal() {
            const moviesContainer = document.getElementById('moviesContainer');
            if (moviesContainer.classList.contains('active')) {
                moviesContainer.classList.remove('active');
            } else {
                moviesContainer.classList.add('active');
                displayMovies('popular');
            }
        }
        
        function setupMoviesEventListeners() {
            document.getElementById('closeMovies').onclick = toggleMoviesModal;
            document.getElementById('searchMovieBtn').onclick = searchMovies;
            document.getElementById('movieSearch').onkeyup = (e) => {
                if (e.key === 'Enter') searchMovies();
            };
            
            document.querySelectorAll('.movies-tabs .tab-btn').forEach(btn => {
                btn.onclick = () => {
                    document.querySelectorAll('.movies-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    displayMovies(btn.dataset.category);
                };
            });

           
        }
        
        async function searchMovies() {
            const query = document.getElementById('movieSearch').value;
            if (query.trim()) {
                const data = await fetchTMDBData('/search/movie', `&query=${encodeURIComponent(query)}`);
                displayMovieResults(data.results);
            }
        }
        
        async function displayMovies(category) {
            const data = await fetchTMDBData(`/movie/${category}`);
            displayMovieResults(data.results);
        }
        
        function displayMovieResults(movies) {
            let html = '<div class="movie-grid">';
            movies.forEach(movie => {
                html += createMovieCard(movie);
            });
            html += '</div>';
            document.querySelector('.movies-content').innerHTML = html;
            addMovieEventListeners();
        }
        // Display saved movies
        async function displaySavedMovies() {
            const savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');
            const movieDetails = await Promise.all(
                savedMovies.map(id => fetchTMDBData(`/movie/${id}`))
            );
            document.querySelector('.movies-content').innerHTML = '<div class="saved-movies-container"></div>';
            const container = document.querySelector('.saved-movies-container');
            movieDetails.forEach(movie => {
                container.innerHTML += createMovieCardWithDelete(movie, 'saved');
            });
            addMovieEventListeners();
            addDeleteEventListeners();
        }

        
        
        
        // Display favorite movies
        async function displayFavoriteMovies() {
            const favorites = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
            const movieDetails = await Promise.all(
                favorites.map(id => fetchTMDBData(`/movie/${id}`))
            );
            document.querySelector('.movies-content').innerHTML = '<div class="favorite-movies-container"></div>';
            const container = document.querySelector('.favorite-movies-container');
            movieDetails.forEach(movie => {
                container.innerHTML += createMovieCardWithDelete(movie, 'favorite');
            });
            addMovieEventListeners();
            addDeleteEventListeners();
        }
        
        
        function addDeleteEventListeners() {
            document.querySelectorAll('.delete-movie-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const movieId = btn.dataset.id;
                    const type = btn.dataset.type;
                    
                    if (type === 'saved') {
                        deleteFromSaved(movieId);
                        displaySavedMovies();
                    } else if (type === 'favorite') {
                        deleteFromFavorites(movieId);
                        displayFavoriteMovies();
                    }
                };
            });
        }
        
        function deleteFromSaved(movieId) {
            let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');
            savedMovies = savedMovies.filter(id => id != movieId);
            localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
            showToast('Movie removed from saved list!');
        }
        
        function deleteFromFavorites(movieId) {
            let favorites = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
            favorites = favorites.filter(id => id != movieId);
            localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
            showToast('Movie removed from favorites!');
        }

       
        function createMovieCard(movie) {
            const posterPath = movie.poster_path 
                ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                : 'path/to/default/movie/poster.jpg';
            
            return `
                <div class="movie-card" data-id="${movie.id}">
                    <div class="movie-poster">
                        <img src="${posterPath}" alt="${movie.title}">
                        <div class="movie-overlay">
                            <button class="movie-details-btn" data-id="${movie.id}">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                            
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <div class="movie-meta">
                            <span class="rating">
                                <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                            </span>
                            <span class="year">${movie.release_date?.split('-')[0] || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function createMovieCardWithDelete(movie, type) {
            const posterPath = movie.poster_path 
                ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                : 'path/to/default/movie/poster.jpg';
            
            return `
                <div class="movie-card" data-id="${movie.id}">
                    <div class="movie-poster">
                        <img src="${posterPath}" alt="${movie.title}">
                        <div class="movie-overlay">
                            <button class="movie-details-btn" data-id="${movie.id}">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                            <button class="delete-movie-btn" data-id="${movie.id}" data-type="${type}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3>${movie.title}</h3>
                        <div class="movie-meta">
                            <span class="rating">
                                <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                            </span>
                            <span class="year">${movie.release_date?.split('-')[0] || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `;
        }
         async function getImageColors(imageUrl) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = imageUrl;
                
                img.onerror = () => {
                    resolve([
                        [33, 33, 33],
                        [66, 66, 66],
                        [99, 99, 99]
                    ]);
                };
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    
                    const colorMap = {};
                    for(let i = 0; i < imageData.length; i += 4) {
                        const r = Math.floor(imageData[i] / 10) * 10;
                        const g = Math.floor(imageData[i + 1] / 10) * 10;
                        const b = Math.floor(imageData[i + 2] / 10) * 10;
                        const rgb = `${r},${g},${b}`;
                        colorMap[rgb] = (colorMap[rgb] || 0) + 1;
                    }
                    
                    const sortedColors = Object.entries(colorMap)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([color]) => color.split(',').map(Number));
                        
                    resolve(sortedColors);
                };
            });
        }
        
         async function showMovieDetails(movieId) {
            const existingModal = document.querySelector('.modal-container');
            if (existingModal) {
                existingModal.remove();
            }
        
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            document.body.appendChild(modalContainer);
        
            const [movieData, credits, videos, recommendations] = await Promise.all([
                fetchTMDBData(`/movie/${movieId}`),
                fetchTMDBData(`/movie/${movieId}/credits`),
                fetchTMDBData(`/movie/${movieId}/videos`),
                fetchTMDBData(`/movie/${movieId}/recommendations`)
            ]);
        
            const backdropUrl = `${TMDB_IMAGE_BASE_URL1}${movieData.backdrop_path}`;
            const dominantColors = await getImageColors(backdropUrl);
        
            const gradientColors = dominantColors.map(([r, g, b]) => `rgba(${r}, ${g}, ${b}, 0.85)`);
            const gradientStyle = `linear-gradient(to bottom, transparent, ${gradientColors[0]} 0%, ${gradientColors[1]} 50%, ${gradientColors[2]} 100%)`;
        
            const trailer = videos.results.find(video => video.type === "Trailer");
            const director = credits.crew.find(person => person.job === "Director");
            const cast = credits.cast.slice(0, 5);
        
            const castHTML = credits.cast.slice(0, 10).map(actor => `
                <div class="cast-card">
                    <img src="${actor.profile_path ? TMDB_IMAGE_BASE_URL + actor.profile_path : 'default-avatar.jpg'}" 
                        alt="${actor.name}">
                    <p>${actor.name}</p>
                    <span>${actor.character}</span>
                </div>
            `).join('');
        
            const recommendationsHTML = recommendations.results.slice(0, 10).map(movie => `
                <div class="recommendation-card" data-id="${movie.id}">
                    <img src="${TMDB_IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}">
                    <p>${movie.title}</p>
                </div>
            `).join('');
        
            const detailsModal = document.createElement('div');
            detailsModal.className = 'movie-details-modal';
            detailsModal.innerHTML = `
                <div class="details-content">
                    <button class="close-details">&times;</button>
                    <button class="expand-modal"><i class="fas fa-expand"></i></button>
                    <div class="movie-backdrop" style="background-image: url('${TMDB_IMAGE_BASE_URL1}${movieData.backdrop_path}')">
                        <div class="backdrop-overlay"></div>
                    </div>
                    <div class="details-main" style="background: linear-gradient(to bottom, 
                        transparent 0%,
                        ${gradientColors[0]} 20%,
                        ${gradientColors[1]} 50%,
                        ${gradientColors[2]} 100%) !important;">
        
                        <img src="${TMDB_IMAGE_BASE_URL}${movieData.poster_path}" alt="${movieData.title}" class="detail-poster">
                        <div class="detail-info">
                            <h2>${movieData.title}</h2>
                            <p class="tagline">${movieData.tagline}</p>
                            <div class="action-buttons">
                                <button class="save-movie" data-id="${movieId}">
                                    <i class="fas fa-bookmark"></i> Save
                                </button>
                                <button class="add-favorite" data-id="${movieId}">
                                    <i class="fas fa-heart"></i> Favorite
                                </button>
                            </div>
                            <div class="meta-info">
                                <span>${movieData.release_date.split('-')[0]}</span>
                                <span>${movieData.runtime} min</span>
                                <span>${movieData.vote_average.toFixed(1)} ⭐</span>
                            </div>
                            <div class="genres">
                                ${movieData.genres.map(genre => `<span>${genre.name}</span>`).join('')}
                            </div>
                            <p class="overview">${movieData.overview}</p>
                            <div class="credits">
                                <p><strong>Director:</strong> ${director?.name || 'N/A'}</p>
                                <p><strong>Cast:</strong> ${cast.map(actor => actor.name).join(', ')}</p>
                            </div>
                            ${trailer ? `
                                <button class="play-movie" data-id="${movieId}">
                                    <i class="fas fa-play"></i> Play Movie
                                </button>
                                <button class="play-trailer" data-key="${trailer.key}">
                                    <i class="fas fa-play"></i> Watch Trailer
                                </button>
                            ` : ''}
                            <div class="cast-section">
                                <h3>Cast</h3>
                                <div class="cast-grid">
                                    ${castHTML}
                                </div>
                            </div>
                            <div class="recommendations-section">
                                <h3>Recommendations</h3>
                                <div class="recommendations-grid">
                                    ${recommendationsHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        
            modalContainer.appendChild(detailsModal);
        
            // Event Listeners
            const expandBtn = detailsModal.querySelector('.expand-modal');
            expandBtn.onclick = () => {
                const modal = document.querySelector('.movie-details-modal');
                modal.classList.toggle('fullscreen');
        
                // تغيير أيقونة الزر
                const icon = expandBtn.querySelector('i');
                if (modal.classList.contains('fullscreen')) {
                    icon.classList.remove('fa-expand');
                    icon.classList.add('fa-compress');
                } else {
                    icon.classList.remove('fa-compress');
                    icon.classList.add('fa-expand');
                }
            };
        
            // إضافة دعم مفتاح Escape للخروج من وضع ملء الشاشة
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const modal = document.querySelector('.movie-details-modal');
                    if (modal && modal.classList.contains('fullscreen')) {
                        modal.classList.remove('fullscreen');
                        const icon = document.querySelector('.expand-modal i');
                        icon.classList.remove('fa-compress');
                        icon.classList.add('fa-expand');
                    }
                }
            });
        
            detailsModal.querySelector('.close-details').onclick = () => {
                modalContainer.style.animation = 'modalFadeOut 0.3s ease-in forwards';
                setTimeout(() => modalContainer.remove(), 300);
            };
        
            const trailerBtn = detailsModal.querySelector('.play-trailer');
            if (trailerBtn) {
                trailerBtn.onclick = () => {
                    const trailerKey = trailerBtn.dataset.key;
                    playMovieTrailer(trailerKey);
                };
            }
        
            const playMovieBtn = detailsModal.querySelector('.play-movie');
            if (playMovieBtn) {
                playMovieBtn.onclick = () => {
                    const movieId = playMovieBtn.dataset.id;
                    playMovie(movieId);
                };
            }
        
            modalContainer.addEventListener('click', (e) => {
                if (e.target === modalContainer) {
                    modalContainer.style.animation = 'modalFadeOut 0.3s ease-in forwards';
                    setTimeout(() => modalContainer.remove(), 300);
                }
            });
        
            // Setup recommendation click handlers
            const recommendationCards = detailsModal.querySelectorAll('.recommendation-card');
            recommendationCards.forEach(card => {
                card.addEventListener('click', () => {
                    const movieId = card.dataset.id;
                    modalContainer.remove();
                    showMovieDetails(movieId);
                });
            });
        
            if (typeof setupDetailEventListeners === 'function') {
                setupDetailEventListeners(detailsModal, movieId);
            }
        }
        // Add server configuration
        const SERVERS = {
            VIDSRC: {
              name: "VidSrc",
              qualities: ["360p", "480p", "720p", "1080p"],
              getUrl: (id, q) => `https://vidsrc.me/embed/${id}?quality=${q}`
            },
            VIDPRO: {
              name: "VidPro",
              qualities: ["720p", "1080p", "2K", "4K"],
              getUrl: (id, q) => `https://vidpro.stream/embed/${id}/${q}`
            },
            SUPEREMBED: {
              name: "SuperEmbed",
              qualities: ["1080p", "2K", "4K"],
              getUrl: (id, q) => `https://superembed.xyz/${id}?q=${q}`
            },
            VIDIN: {
              name: "Vid.in",
              qualities: ["480p", "720p", "1080p"],
              getUrl: (id, q) => `https://vid.in/player/${id}?res=${q}`
            }
          };
          
          async function playMovie(movieId) {
            const playerContainer = document.createElement('div');
            playerContainer.className = 'player-container';
            playerContainer.innerHTML = `
              <div class="player-content">
                <button class="close-player">&times;</button>
                <div class="server-controls">
                  <select class="server-select">
                    ${Object.entries(SERVERS).map(([key, s]) => 
                      `<option value="${key}">${s.name}</option>`
                    ).join('')}
                  </select>
                  <div class="quality-selector" id="qualitySelector"></div>
                </div>
                <div class="player">
                  <iframe id="moviePlayer" width="100%" height="100%" src="" frameborder="0" allowfullscreen></iframe>
                </div>
              </div>
            `;
          
            document.body.appendChild(playerContainer);
          
            // Quality buttons generator
            const updateQualities = () => {
              const server = SERVERS[document.querySelector('.server-select').value];
              const qualitySelector = document.getElementById('qualitySelector');
              qualitySelector.innerHTML = server.qualities.map(q => `
                <button class="quality-btn" data-quality="${q}">${q}</button>
              `).join('');
            };
          
            // Initial setup
            updateQualities();
            
            // Event listeners
            document.querySelector('.server-select').addEventListener('change', updateQualities);
            
            document.getElementById('qualitySelector').addEventListener('click', (e) => {
              if(e.target.classList.contains('quality-btn')) {
                const quality = e.target.dataset.quality;
                const server = SERVERS[document.querySelector('.server-select').value];
                document.getElementById('moviePlayer').src = server.getUrl(movieId, quality);
              }
            });
          
            // Set default
            const defaultServer = SERVERS.VIDSRC;
            document.getElementById('moviePlayer').src = defaultServer.getUrl(movieId, '720p');
          
            // Close button
            playerContainer.querySelector('.close-player').onclick = () => 
              playerContainer.remove();
          }

       

        
        function addMovieEventListeners() {
            document.querySelectorAll('.movie-details-btn').forEach(btn => {
                btn.onclick = () => showMovieDetails(btn.dataset.id);
            });

            // Add event listeners for saved and favorites buttons
            document.getElementById('savedMovies').onclick = displaySavedMovies;
            document.getElementById('favorites').onclick = displayFavoriteMovies;

           // Genre filtering
            document.getElementById('genreSelect').addEventListener('change', async function() {
               const genreId = this.value;
                if (genreId) {
                   const data = await fetchTMDBData('/discover/movie', `&with_genres=${genreId}`);
                   displayMovieResults(data.results);
                } else {
                   displayMovies('popular');
                }
            });
        }
        
        //event listeners for new functionality
        function setupDetailEventListeners(modal, movieId) {
            modal.querySelector('.close-details').onclick = () => modal.remove();
            
            const trailerBtn = modal.querySelector('.play-trailer');
            if (trailerBtn) {
                trailerBtn.onclick = () => playMovieTrailer(trailerBtn.dataset.key);
            }
        
            modal.querySelector('.save-movie').onclick = () => saveMovie(movieId);
            modal.querySelector('.add-favorite').onclick = () => addToFavorites(movieId);
            
            modal.querySelectorAll('.recommendation-card').forEach(card => {
                card.onclick = () => {
                    modal.remove();
                    showMovieDetails(card.dataset.id);
                };
            });

              
        }

        // Save and Favorite functionality
        function saveMovie(movieId) {
            let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');
            if (!savedMovies.includes(movieId)) {
                savedMovies.push(movieId);
                localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
                showToast('Movie saved successfully!');
            }
        }

        function addToFavorites(movieId) {
            let favorites = JSON.parse(localStorage.getItem('favoriteMovies') || '[]');
            if (!favorites.includes(movieId)) {
                favorites.push(movieId);
                localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
                showToast('Added to favorites!');
            }
        }

        // Toast notification
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
        // Initialize movies feature
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing movies feature');
            addMoviesButton();
            createMoviesModal();
        });
        
        // Alternatively, trying running it immediately if the DOM is already loaded
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            addMoviesButton();
            createMoviesModal();
        }

        function createSportsModal() {
            const sportsModal = document.createElement('div');
            sportsModal.id = 'sportsModal';
            sportsModal.className = 'sports-modal';
            sportsModal.innerHTML = `
                <div class="modal-header">
                    <h2>Sports News</h2>
                    <div class="modal-controls">
                        <button id="closeSports"><i class="fa fa-times"></i></button>
                    </div>
                </div>
                <div class="main-cont">
                    <div class="modal-search">
                        <input type="text" id="sportsSearch" placeholder="Search sports...">
                        <button id="searchSportsBtn"><i class="fas fa-search"></i></button>
                    </div>
                    <div class="sports-tabs">
                        <button class="tab-btn active" data-sport="soccer">Soccer</button>
                        <button class="tab-btn" data-sport="basketball">Basketball</button>
                        <button class="tab-btn" data-sport="tennis">Tennis</button>
                        <button class="tab-btn" data-sport="formula1">Formula 1</button>
                    </div>
                    <div class="sports-content"></div>
                </div>
            `;
            document.body.appendChild(sportsModal);
            setupSportsEventListeners();
        }

        async function loadSportsData(sport) {
            const API_KEY = '72fbdc1a00cf1ee326120b73ccf61375';
            const sportsContent = document.querySelector('.sports-content');
            sportsContent.innerHTML = '<div class="loading">Loading...</div>';
        
            try {
                // نستخدم API مختلف حسب نوع الرياضة
                let endpoint;
                switch(sport) {
                    case 'soccer':
                        endpoint = 'https://v3.football.api-sports.io/fixtures?live=all';
                        break;
                    case 'basketball':
                        endpoint = 'https://v1.basketball.api-sports.io/games?live=all';
                        break;
                    case 'formula1':
                        endpoint = 'https://v1.formula-1.api-sports.io/races';
                        break;
                    case 'tennis':
                        endpoint = 'https://v1.tennis.api-sports.io/games?live=all';
                        break;
                }
        
                const response = await fetch(endpoint, {
                    headers: {
                        'x-apisports-key': API_KEY
                    }
                });
                
                const data = await response.json();
                
                if (data.response) {
                    displaySportsData(data.response, sport);
                } else {
                    throw new Error('No data available');
                }
            } catch (error) {
                sportsContent.innerHTML = `
                    <div class="error">
                        <p>Unable to load sports data</p>
                        <small>Please try again later</small>
                    </div>`;
            }
        }
        
        function displaySportsData(data, sportType) {
            const sportsContent = document.querySelector('.sports-content');
            
            if (data.length === 0) {
                sportsContent.innerHTML = `
                    <div class="no-matches">
                        <p>No live matches available at the moment</p>
                    </div>`;
                return;
            }
        
            let html = '';
            
            switch(sportType) {
                case 'soccer':
                    html = data.map(match => `
                        <div class="sport-card">
                            <div class="league-info">
                                <img src="${match.league.logo}" alt="${match.league.name}" class="league-logo">
                                <span>${match.league.name}</span>
                            </div>
                            <div class="match-info">
                                <div class="team">
                                    <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="team-logo">
                                    <span>${match.teams.home.name}</span>
                                </div>
                                <div class="score">
                                    <span class="time">${match.fixture.status.elapsed}'</span>
                                    <div class="result">
                                        ${match.goals.home} - ${match.goals.away}
                                    </div>
                                </div>
                                <div class="team">
                                    <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="team-logo">
                                    <span>${match.teams.away.name}</span>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    break;
        
                case 'basketball':
                    html = data.map(game => `
                        <div class="sport-card">
                            <div class="league-info">
                                <span>${game.league.name}</span>
                            </div>
                            <div class="match-info">
                                <div class="team">
                                    <span>${game.teams.home.name}</span>
                                </div>
                                <div class="score">
                                    <span class="time">${game.status.long}</span>
                                    <div class="result">
                                        ${game.scores.home.total} - ${game.scores.away.total}
                                    </div>
                                </div>
                                <div class="team">
                                    <span>${game.teams.away.name}</span>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    break;
        
                // يمكن إضافة المزيد من أنواع الرياضات هنا
            }
        
            sportsContent.innerHTML = html;
        }

        function setupSportsEventListeners() {
            const moviesModal = document.getElementById('moviesContainer');
            const sportsModal = document.getElementById('sportsModal');
            const openSportsBtn = document.getElementById('openSports');
            const closeSportsBtn = document.getElementById('closeSports');
            const sportsTabs = document.querySelectorAll('.sports-tabs .tab-btn');
            
            openSportsBtn.addEventListener('click', () => {
                moviesModal.classList.add('with-sports');
                sportsModal.classList.add('visible');
                loadSportsData('soccer'); // تحميل افتراضي لكرة القدم
            });
        
            closeSportsBtn.addEventListener('click', () => {
                moviesModal.classList.remove('with-sports');
                sportsModal.classList.remove('visible');
            });
        
            sportsTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    sportsTabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    loadSportsData(e.target.dataset.sport);
                });
            });
        }
