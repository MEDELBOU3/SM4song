        // Add these constants at the top of your main.js
        const TMDB_API_KEY = '431fb541e27bceeb9db2f4cab69b54e1';
        const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
        const TMDB_IMAGE_BASE_URL1 = 'https://image.tmdb.org/t/p/w1280';

        // Add these functions to fetch movie data
        async function fetchTMDBData(endpoint, params = '') {
           const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}${params}`);
           return await response.json();
        }


        // Add a movies button to your navigation
        function addMoviesButton() {
            // First check if button already exists
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

        // Create and add movies modal to the DOM
        function createMoviesModal() {
            const moviesModal = document.createElement('div');
            moviesModal.id = 'moviesContainer';
            moviesModal.className = 'side-modal';
            moviesModal.innerHTML = `
                <div class="modal-header">
                    <h2>Movies</h2>
                    <div class="modal-controls">
                        <button id="closeMovies"><i class="fa fa-times"></i></button>
                    </div>
                </div>
                <div class="modal-search">
                    <input type="text" id="movieSearch" placeholder="Search movies...">
                    <button id="searchMovieBtn"><i class="fas fa-search"></i></button>
                </div>
                <div class="movies-tabs">
                    <button class="tab-btn active" data-category="popular">Popular</button>
                    <button class="tab-btn" data-category="top_rated">Top Rated</button>
                    <button class="tab-btn" data-category="upcoming">Upcoming</button>
                </div>
                <div class="movies-content"></div>
                
            `;
            document.body.appendChild(moviesModal);
            setupMoviesEventListeners();
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
        
        async function showMovieDetails(movieId) {
            const [movieData, credits, videos] = await Promise.all([
                fetchTMDBData(`/movie/${movieId}`),
                fetchTMDBData(`/movie/${movieId}/credits`),
                fetchTMDBData(`/movie/${movieId}/videos`)
            ]);
        
            const trailer = videos.results.find(video => video.type === "Trailer");
            const director = credits.crew.find(person => person.job === "Director");
            const cast = credits.cast.slice(0, 5);
        
            const detailsModal = document.createElement('div');
            detailsModal.className = 'movie-details-modal';
            detailsModal.innerHTML = `
                <div class="details-content">
                    <button class="close-details">&times;</button>
                    <div class="movie-backdrop" style="background-image: url('${TMDB_IMAGE_BASE_URL1}${movieData.backdrop_path}')">
                        <div class="backdrop-overlay"></div>
                    </div>
                    <div class="details-main">
                        <img src="${TMDB_IMAGE_BASE_URL}${movieData.poster_path}" alt="${movieData.title}" class="detail-poster">
                        <div class="detail-info">
                            <h2>${movieData.title}</h2>
                            <p class="tagline">${movieData.tagline}</p>
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
                                <button class="play-trailer" data-key="${trailer.key}">
                                    <i class="fas fa-play"></i> Watch Trailer
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        
            document.querySelector('.movies-content').appendChild(detailsModal);
            
            detailsModal.querySelector('.close-details').onclick = () => detailsModal.remove();
            
            const trailerBtn = detailsModal.querySelector('.play-trailer');
            if (trailerBtn) {
                trailerBtn.onclick = () => {
                    const trailerKey = trailerBtn.dataset.key;
                    playMovieTrailer(trailerKey);
                };
            }
        }
        function addMovieEventListeners() {
            document.querySelectorAll('.movie-details-btn').forEach(btn => {
                btn.onclick = () => showMovieDetails(btn.dataset.id);
            });
        }
        
        

        // Initialize movies feature
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing movies feature');
            addMoviesButton();
            createMoviesModal();
        });

        // Alternatively, you can try running it immediately if the DOM is already loaded
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            addMoviesButton();
            createMoviesModal();
        }