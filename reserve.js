        //consts
        const CLIENT_ID = '31f25c15fa8a4c4a845595ffbcb2d076';
        const CLIENT_SECRET = 'b6d93473aaeb4079aadbd1973854ec9f';
        const modeToggle = document.getElementById('mode-toggle');
        let accessToken = '';
        let audioPlayer = new Audio();
        let currentPlaylist = [];
        let currentTrackIndex = 0;

        modeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            updateModeIcon();
        });

         //modal-advanced
         const expandBtn = document.getElementById("expandBtn");
         const maximizeBtn = document.getElementById("maximizeBtn");
         const minimizeBtn = document.getElementById("minimizeBtn");
         const modalContent = document.querySelector(".modal-content");
         const header = document.querySelector(".header");
         const resizeHandles = document.querySelectorAll(".resize-handle");
 
         let isExpanded = false;
         let isMaximized = false;
         let originalSize = { width: modalContent.style.width, height: modalContent.style.height };
         let isDragging = false;
         let startX, startY, startLeft, startTop, startWidth, startHeight;
         let currentResizeHandle;
         // this at the beginning of your script with other constants
         let navigationHistory = [];
         let currentHistoryIndex = -1;

        // Enhanced navigation functions
        function navigateBack() {
          if (currentHistoryIndex > 0) {
             currentHistoryIndex--;
             const previousPage = navigationHistory[currentHistoryIndex];
             loadPage(previousPage, false);
             updateNavigationButtons();
          }
        }
        function navigateForward() {
            if (currentHistoryIndex < navigationHistory.length - 1) {
               currentHistoryIndex++;
               const nextPage = navigationHistory[currentHistoryIndex];
               loadPage(nextPage, false);
               updateNavigationButtons();
             }
        }
         function addToHistory(pageData) {
           // Remove any forward history when adding new page
          if (currentHistoryIndex < navigationHistory.length - 1) {
              navigationHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
          }
    
          navigationHistory.push(pageData);
          currentHistoryIndex++;
          updateNavigationButtons();
         }

          function updateNavigationButtons() {
            const backButton = document.getElementById('backButton');
            const forwardButton = document.getElementById('forwardButton');
    
            if (backButton && forwardButton) {
               backButton.disabled = currentHistoryIndex <= 0;
               forwardButton.disabled = currentHistoryIndex >= navigationHistory.length - 1;
            }
           }

        function loadPage(pageData, addToHistoryFlag = true) {
    if (!pageData) return;

    if (addToHistoryFlag) {
        addToHistory(pageData);
    }

    switch (pageData.type) {
        case 'featured':
            displayFeaturedPlaylists();
            break;
        case 'new-releases':
            displayNewReleases();
            break;
        case 'playlist':
            displayPlaylistTracks(pageData.id);
            break;
        case 'artist':
            displayArtistDetails(pageData.id);
            break;
        case 'album':
            displayAlbumTracks(pageData.id);
            break;
        case 'category':
            displayCategoryPlaylists(pageData.id);
            break;
        case 'search':
            // Handle search results
            break;
    }
}


//navigation buttons in the UI
function createNavigationButtons() {
    const navigationContainer = document.createElement('div');
    navigationContainer.className = 'navigation-buttons';
    navigationContainer.innerHTML = `
        <button id="backButton" onclick="navigateBack()" disabled>
            <i class="fas fa-arrow-left"></i> Back
        </button>
        <button id="forwardButton" onclick="navigateForward()" disabled>
            <i class="fas fa-arrow-right"></i> Forward
        </button>
    `;
    
    // Insert at the top of the content area
    const contentArea = document.getElementById('content');
    if (contentArea) {
        contentArea.insertBefore(navigationContainer, contentArea.firstChild);
    }
}

        
         // Expand button functionality
         expandBtn.onclick = function() {
             if (!isExpanded) {
                 originalSize = { width: modalContent.style.width, height: modalContent.style.height };
                 modalContent.style.width = "90%";
                 modalContent.style.height = "90%";
                 isExpanded = true;
             } else {
                 modalContent.style.width = originalSize.width;
                 modalContent.style.height = originalSize.height;
                 isExpanded = false;
             }
         }
 
         // Maximize button functionality
         maximizeBtn.onclick = function() {
             if (!isMaximized) {
                 originalSize = { width: modalContent.style.width, height: modalContent.style.height };
                 modalContent.style.width = "100%";
                 modalContent.style.height = "100%";
                 modalContent.style.top = "0";
                 modalContent.style.left = "0";
                 modalContent.style.transform = "none";
                 isMaximized = true;
             } else {
                 modalContent.style.width = originalSize.width;
                 modalContent.style.height = originalSize.height;
                 modalContent.style.top = "50%";
                 modalContent.style.left = "50%";
                 modalContent.style.transform = "translate(-50%, -50%)";
                 isMaximized = false;
             }
         }
 
         // Minimize button functionality
         minimizeBtn.onclick = function() {
             modal.style.display = "none";
         }
 
         // Dragging functionality
         header.onmousedown = function(e) {
             isDragging = true;
             startX = e.clientX;
             startY = e.clientY;
             startLeft = modalContent.offsetLeft;
             startTop = modalContent.offsetTop;
         }
 
         // Resizing functionality
         resizeHandles.forEach(handle => {
             handle.addEventListener('mousedown', (e) => {
                 isResizing = true;
                 currentResizeHandle = handle;
                 startX = e.clientX;
                 startY = e.clientY;
                 startWidth = parseInt(document.defaultView.getComputedStyle(modalContent).width, 10);
                 startHeight = parseInt(document.defaultView.getComputedStyle(modalContent).height, 10);
                 document.addEventListener('mousemove', resize);
                 document.addEventListener('mouseup', stopResize);
                 e.preventDefault();
             });
         });
 
         function resize(e) {
             if (isResizing) {
                 const dx = e.clientX - startX;
                 const dy = e.clientY - startY;
         
                 if (currentResizeHandle.classList.contains('bottom-right')) {
                     modalContent.style.width = `${startWidth + dx}px`;
                     modalContent.style.height = `${startHeight + dy}px`;
                 } else if (currentResizeHandle.classList.contains('bottom-left')) {
                     modalContent.style.width = `${startWidth - dx}px`;
                     modalContent.style.height = `${startHeight + dy}px`;
                     modalContent.style.left = `${startLeft + dx}px`;
                 } else if (currentResizeHandle.classList.contains('top-right')) {
                     modalContent.style.width = `${startWidth + dx}px`;
                     modalContent.style.height = `${startHeight - dy}px`;
                     modalContent.style.top = `${startTop + dy}px`;
                 } else if (currentResizeHandle.classList.contains('top-left')) {
                     modalContent.style.width = `${startWidth - dx}px`;
                     modalContent.style.height = `${startHeight - dy}px`;
                     modalContent.style.top = `${startTop + dy}px`;
                     modalContent.style.left = `${startLeft + dx}px`;
                 }
             }
         }
 
         function stopResize() {
             isResizing = false;
             document.removeEventListener('mousemove', resize);
         }
 
         document.onmousemove = function(e) {
             if (isDragging) {
                 const dx = e.clientX - startX;
                 const dy = e.clientY - startY;
                 modalContent.style.left = startLeft + dx + "px";
                 modalContent.style.top = startTop + dy + "px";
             }
         }
 
         document.onmouseup = function() {
             isDragging = false;
         }


        //Spotiy fetch
        async function getAccessToken() {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
                },
                body: 'grant_type=client_credentials'
            });
            const data = await response.json();
            accessToken = data.access_token;
        }

        async function fetchSpotifyData(endpoint) {
            if (!accessToken) {
                await getAccessToken();
            }
            const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return await response.json();
        }

        //playlist-content
          async function displayFeaturedPlaylists() {
            const data = await fetchSpotifyData('browse/featured-playlists');
            const playlists = data.playlists.items;
            let html = '<h2>Featured Playlists</h2><div class="grid">';
            playlists.forEach(playlist => {
                html += `
                    <div  class="grid-item" data-type="playlist" data-id="${playlist.id}">
                        <img src="${playlist.images[0].url}" alt="${playlist.name}">
                        <p>${playlist.name}</p>
                    </div>
                `;
            });
            html += '</div>';
            document.getElementById('content').innerHTML = html;
            addGridItemListeners();
        }     

      async function displayNewReleases() {
            const data = await fetchSpotifyData('browse/new-releases');
            const albums = data.albums.items;
            let html = '<h2>New Releases</h2><div class="grid">';
            albums.forEach(album => {
                html += `
                    <div class="grid-item" data-type="album" data-id="${album.id}">
                        <img src="${album.images[0].url}" alt="${album.name}">
                        <p>${album.name}</p>
                        <p>${album.artists[0].name}</p>
                    </div>
                `;
            });
            html += '</div>';
            document.getElementById('content').innerHTML = html;
            addGridItemListeners();
        }         
    
        async function displayCategories() {
            const data = await fetchSpotifyData('browse/categories');
            const categories = data.categories.items;
            let html = '<h2>Categories</h2><div class="grid">';
            categories.forEach(category => {
                html += `
                    <div class="grid-item" data-type="category" data-id="${category.id}">
                        <img src="${category.icons[0].url}" alt="${category.name}">
                        <p>${category.name}</p>
                    </div>
                `;
            });
            html += '</div>';
            document.getElementById('content').innerHTML = html;
            addGridItemListeners();
        }

       async function displayPlaylistTracks(playlistId) {
            const data = await fetchSpotifyData(`playlists/${playlistId}/tracks`);
            displayTracks(data.items.map(item => item.track));
        }    
        //  this CSS for navigation buttons
        const navigationStyles = document.createElement('style');
        navigationStyles.textContent = `
        .navigation-buttons {
        padding: 10px;
        margin-bottom: 20px;
    }

    .navigation-buttons button {
        background-color: #1db954;
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: background-color 0.3s ease;
    }

    .navigation-buttons button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .navigation-buttons button:not(:disabled):hover {
        background-color: #1ed760;
    }

    .dark-mode .navigation-buttons button {
        background-color: #1db954;
    }

    .dark-mode .navigation-buttons button:disabled {
        background-color: #444444;
    }
`;
document.head.appendChild(navigationStyles);

// Initialize the first page in history when loading featured playlists
const originalDisplayFeaturedPlaylists = displayFeaturedPlaylists;
displayFeaturedPlaylists = async function() {
    await originalDisplayFeaturedPlaylists();
    if (navigationHistory.length === 0) {
        addToHistory({ type: 'featured' });
    }
};

        async function displayAlbumTracks(albumId) {
            const data = await fetchSpotifyData(`albums/${albumId}/tracks`);
            displayTracks(data.items);
        }

        async function displayCategoryPlaylists(categoryId) {
            const data = await fetchSpotifyData(`browse/categories/${categoryId}/playlists`);
            const playlists = data.playlists.items;
            let html = '<h2>Category Playlists</h2><div class="grid">';
            playlists.forEach(playlist => {
                html += `
                    <div class="grid-item" data-type="playlist" data-id="${playlist.id}">
                        <img src="${playlist.images[0].url}" alt="${playlist.name}">
                        <p>${playlist.name}</p>
                    </div>
                `;
            });
            html += '</div>';
            document.getElementById('content').innerHTML = html;
            addGridItemListeners();
        }

        //shearch artist and play song list
       
        async function searchSpotify() {
            const query = document.getElementById('searchInput').value;
            if (query) {
                const data = await fetchSpotifyData(`search?q=${encodeURIComponent(query)}&type=artist,track`);
                displaySearchResults(data);
            }
        }

        //displayArtists
        function displaySearchResults(data) {
            let html = '<h2>Search Results</h2>';
        
            if (data.artists && data.artists.items.length > 0) {
                html += '<h3>Artists</h3><div class="artists-container">';
                data.artists.items.forEach(artist => {
                    html += createArtistCardHTML(artist);
                });
                html += '</div>';
            }
        
            if (data.tracks && data.tracks.items.length > 0) {
                html += '<h3>Songs</h3><div class="tracks-container">';
                data.tracks.items.forEach((track, index) => {
                    html += createTrackHTML(track, index);
                });
                html += '</div>';
                currentPlaylist = data.tracks.items;
            }
        
            document.getElementById('content').innerHTML = html;
        }
        

        //creat card Artist 
        function createArtistCardHTML(artist) {
            const formattedFollowers = formatNumber(artist.followers.total);
            const backgroundImage = artist.images[0]?.url || 'https://via.placeholder.com/400';
            return `
                <div class="artist-card">
                    <img src="${backgroundImage}" alt="${artist.name}" class="artist-image">
                    <div class="artist-info">
                        <h3>${artist.name}</h3>
                        <p>${formattedFollowers} Followers</p>
                        <p>Popularity: ${artist.popularity}</p>
                        <button onclick="displayArtistDetails('${artist.id}')" class="artist-button">View details</button>
                        <a href="spotify:artist:${artist.id}" class="spotify-link">Open in Spotify</a>
                    </div>
                </div>
            `;
        }


        //format Numbrr
        function formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num;
        }

        //display Artist tracks
        async function displayArtistDetails(artistId) {
            const artist = await fetchSpotifyData(`artists/${artistId}`);
            const topTracks = await fetchSpotifyData(`artists/${artistId}/top-tracks?market=US`);
            const relatedArtists = await fetchSpotifyData(`artists/${artistId}/related-artists`);
            
            // Update currentPlaylist with the artist's top tracks
            currentPlaylist = topTracks.tracks;


            let html = `
                <div class="artist-profile" style="background-image: url('${artist.images[0]?.url || 'https://via.placeholder.com/1000'}');">
                    <div class="artist-info">
                        <h2>${artist.name}</h2>
                        <p>${formatNumber(artist.followers.total)} Followers</p>
                        <p>Popularity: ${artist.popularity}</p>
                        <p>Genres: ${artist.genres.join(', ')}</p>
                        <a href="spotify:artist:${artist.id}" class="spotify-link">Open in Spotify</a>
                    </div>
                </div>
                <h3>Top Tracks</h3>
                <div class="tracks-container">
            `;
            
            topTracks.tracks.forEach((track, index) => {
                html += createTrackHTML(track, index);
            });
            
            html += '</div>';
            html += '<div id="videoContainer"></div>';
            html += '<h3>Gallery</h3><div id="imageGallery" class="image-gallery"></div>';
            
            html += '<h3>Similar Artists</h3><div class="related-artists">';
            relatedArtists.artists.slice(0, 10).forEach(relatedArtist => {
                html += `
                    <div class="related-artist-card">
                        <img src="${relatedArtist.images[0]?.url || 'https://via.placeholder.com/100'}" alt="${relatedArtist.name}">
                        <p>${relatedArtist.name}</p>
                        <button onclick="displayArtistDetails('${relatedArtist.id}')">View</button>
                    </div>
                `;
            });
            html += '</div>';
            
            document.getElementById('content').innerHTML = html;
            fetchArtistVideos(artist.name);
            fetchArtistImages(artist.id);
        }
       

        //creat Track html
        function createTrackHTML(track, index) {
            return `
                <div class="track-item">
                    <img src="${track.album.images[0].url}" alt="${track.name}">
                    <div class="track-info">
                        <p>${track.name}</p>
                        <p>${track.artists[0].name}</p>
                    </div>
                    <div class="track-controls">
                        <button class="like-btn ${track.liked ? 'active' : ''}" onclick="toggleLike('${track.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button onclick="playTrack(${index})" class="play-button">
                            <i class="fas fa-play"></i>
                        </button>
                        <button onclick="addToPersonalPlaylist(currentPlaylist[${index}])" class="add-button">
                            <i class="fas fa-plus"></i>
                        </button>
                        <a href="spotify:track:${track.id}" class="spotify-link">
                            <i class="fab fa-spotify"></i>
                        </a>
                    </div>
                </div>
            `;
        }

        //artist Videos
        async function fetchArtistVideos(artistName) {
            // هنا يجب استخدام YouTube API لجلب الفيديوهات الفعلية
            const videoContainer = document.getElementById('videoContainer');
            videoContainer.innerHTML = '<h3>Arist Videos</h3><div class="video-gallery"></div>';
            const videoGallery = videoContainer.querySelector('.video-gallery');
            
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artistName)}&type=video&key=AIzaSyDULbpO4E6_GML55UQVVjIEkR3oicW3820`);
                const data = await response.json();
                
                data.items.forEach(item => {
                    videoGallery.innerHTML += `
                        <div class="video-item">
                            <iframe width="280" height="157" src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
                            <p>${item.snippet.title}</p>
                        </div>
                    `;
                });
            } catch (error) {
                console.error('Error fetching videos:', error);
                videoGallery.innerHTML = '<p>An error occurred while processing your request</p>';
            }
        }

        //gallery
        async function fetchArtistImages(artistId) {
            const data = await fetchSpotifyData(`artists/${artistId}`);
            const imageGallery = document.getElementById('imageGallery');
            
            if (data.images && data.images.length > 0) {
                data.images.forEach(image => {
                    imageGallery.innerHTML += `
                        <div class="gallery-item">
                            <img src="${image.url}" alt="${data.name}" onclick="openImageModal('${image.url}')">
                        </div>
                    `;
                });
            } else {
                imageGallery.innerHTML = '<p>No images available</p>';
            }
        }

      
        //tabs function
        function initTabs() {
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabPanes = document.querySelectorAll('.tab-pane');
        
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabId = button.getAttribute('data-tab');
                    
                    // Deactivate all tabs
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));
                    
                    // Activate the clicked tab
                    button.classList.add('active');
                    document.getElementById(tabId).classList.add('active');
        
                    // Update content for the active tab
                    if (tabId === 'playlistStats') {
                        updatePlaylistStats();
                    } else if (tabId === 'recentAdditions') {
                        updateRecentAdditions();
                    } else if (tabId === 'playlistItems') {
                        updatePlaylistItems();
                    }
                });
            });
        }
        
        

        //Modal image function
        function openImageModal(imageUrl) {
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.innerHTML = `
                <span class="close-modal">&times;</span>
                <img src="${imageUrl}" alt="صورة مكبرة">
            `;
            document.body.appendChild(modal);
            modal.querySelector('.close-modal').onclick = () => modal.remove();
        }

        //save PersonalPLaylist
        function savePersonalPlaylist() {
            localStorage.setItem('personalPlaylist', JSON.stringify(personalPlaylist));
        }

        //liste of music
        let personalPlaylist = JSON.parse(localStorage.getItem('personalPlaylist')) || [];

        // فتح الـ modal
        function openPlaylistModal() {
            document.getElementById("playlistModal").style.display = "block";
            renderPersonalPlaylist(); // عرض قائمة التشغيل عند الفتح
            initTabs();
            updatePlaylistItems();
        }
        
        // إغلاق الـ modal
        function closePlaylistModal() {
            document.getElementById("playlistModal").style.display = "none";
        }
        

        //Updates remove & like
        function removeFromPersonalPlaylist(trackId) {
            personalPlaylist = personalPlaylist.filter(track => track.id !== trackId);
            savePersonalPlaylist();
            renderPersonalPlaylist();
            updatePlaylistStats(); // Add this line
        }
        
        function toggleLike(trackId) {
            const track = personalPlaylist.find(t => t.id === trackId);
            if (track) {
                track.liked = !track.liked;
                savePersonalPlaylist();
                renderPersonalPlaylist();
                updatePlaylistStats(); // Add this line
            }
        }
       

       

        //render-personal-list
        function renderPersonalPlaylist() {
            const playlistItems = document.getElementById('playlistItems');
            playlistItems.innerHTML = '';
            personalPlaylist.forEach((track, index) => {
                const item = document.createElement('div');
                item.className = 'playlist-item';
                item.innerHTML = `
                    <img src="${track.image}" alt="${track.name}">
                    <div class="playlist-item-info">
                        <p>${track.name}</p>
                        <p>${track.artist}</p>
                    </div>
                    <div class="playlist-item-actions">
                        <button onclick="playTrack(${index}, true)" style="font-size: 18px; border: none; outlin: none; 
                        background-color: transparent; cursor: pointer; color: black;"><i class="fas fa-play" style="font-size: 18px;"></i></button>
                        <button class="like-btn ${track.liked ? 'active' : ''}" onclick="toggleLike('${track.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="remove-btn" onclick="removeFromPersonalPlaylist('${track.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                playlistItems.appendChild(item);
            });
        }
        
        //State playliste
        function updatePlaylistStats() {
            const totalTracks = personalPlaylist.length;
            const likedTracks = personalPlaylist.filter(track => track.liked).length;

            
            // Genre statistics
            const genreCounts = {};
            personalPlaylist.forEach(track => {
                genreCounts[track.genre] = (genreCounts[track.genre] || 0) + 1;
            });
            
        
            const genreChart = new Chart(document.getElementById('genreChart'), {
                type: 'pie',
                data: {
                    labels: Object.keys(genreCounts),
                    datasets: [{
                        data: Object.values(genreCounts),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Genre Distribution'
                    }
                }
            });
        
            // 2. نسبة الأغاني المفضلة
            const likedChart = new Chart(document.getElementById('likedChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Liked', 'Not Liked'],
                    datasets: [{
                        data: [likedTracks, totalTracks - likedTracks],
                        backgroundColor: ['#FF6384', '#36A2EB']
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Liked vs Not Liked Tracks'
                    }
                }
            });
        
            // 3. أكثر الفنانين تكرارًا
            const artistCounts = {};
            personalPlaylist.forEach(track => {
                if (!artistCounts[track.artist]) {
                    artistCounts[track.artist] = { count: 1, imageUrl: track.image };
                } else {
                    artistCounts[track.artist].count++;
                    // Update imageUrl if it's not set
                    if (!artistCounts[track.artist].imageUrl) {
                        artistCounts[track.artist].imageUrl = track.image;
                    }
                }
            });
            
            const sortedArtists = Object.entries(artistCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 8);
            
            const topArtistsElement = document.getElementById('topArtists');
            topArtistsElement.innerHTML = '<h3>Top 8 Artists</h3>';
            
            sortedArtists.forEach(([artist, { count, imageUrl }]) => {
                topArtistsElement.innerHTML += `
                    <div class="artist-container">
                        <div class="top-art">
                          <img src="${imageUrl || 'https://via.placeholder.com/50'}" alt="${artist}" class="artist-img">
                          <p class="artist-info">${artist}: ${count} track${count > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <style>
                        .artist-container {
                            display: inline-block;
                            flex-wrap: nowrap;
                            overflow-x: hidden;
                            gap: 10px;
                            padding: 15px;
                        }
                    
                        .top-art {
                            flex: 0 0 auto;
                            width: 200px;
                            display: flex;
                            align-items: center;
                            padding: 15px;
                            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                            border-radius: 15px;
                            font-size: 14px;
                            background-color: var(--hover-bg1);
                            transition: transform 0.3s ease, box-shadow 0.3s ease;
                        }

                        
                        .artist-img {
                            width: 50px; /* Adjust size as needed */
                            height: 50px;
                            border-radius: 50%; /* Makes the image circular */
                            float: left;
                            margin-right: 8px;
                            shape-outside; circle(50%);
                            object-fit: cover;
                            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Optional shadow */
                        }
                        
                        .artist-info {
                            font-size: 14px;
                            max-widht: 100px;
                            font-weight: bold;
                            color: var(--text-color);
                        }
                        
                    </style>
                `;
            });

            
        
             // Total playlist duration
             const totalDuration = personalPlaylist.reduce((sum, track) => sum + (track.duration_ms || 0), 0);
             const hours = Math.floor(totalDuration / 3600000);
             const minutes = Math.floor((totalDuration % 3600000) / 60000);
         
             const durationElement = document.getElementById('playlistDuration');
             durationElement.innerHTML = `<h3>Total Playlist Duration</h3>
                 <p>${hours} hours ${minutes} minutes</p>`;
         
             // Average track length
             if (totalTracks > 0) {
                 const avgDuration = totalDuration / totalTracks;
                 const avgMinutes = Math.floor(avgDuration / 60000);
                 const avgSeconds = Math.floor((avgDuration % 60000) / 1000);
                 durationElement.innerHTML += `<p>Average Track Length: ${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}</p>`;
             }
         
             // Latest additions
             const recentAdditions = [...personalPlaylist]
             .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
             .slice(0, 12);

            const recentElement = document.getElementById('recentAdditions');
            recentElement.innerHTML = '<h3>Recent Additions</h3>';
            recentAdditions.forEach(track => {
            recentElement.innerHTML += `
                <div class="recent-tracks-container">
                    <div class="recent-track">
                        <img src="${track.image}" alt="${track.name}" class="recent-track-img">
                        <div class="recent-track-info">
                            <p class="track-name">${track.name}</p>
                            <p class="track-artist">${track.artist}</p>
                        </div>
                    </div>
                </div>
                
                <style>
                    .recent-tracks-container {
                        display: inline-block;
                        flex-wrap: nowrap;
                        overflow-x: auto;
                        gap: 20px;
                        padding: 20px 0;
                    }
                
                    .recent-track {
                        flex: 0 0 auto;
                        width: 300px;
                        display: flex;
                        align-items: center;
                        padding: 15px;
                        margin-left: 10px;
                        box-shadow: 0 1rem 2rem rgba(92, 92, 92, 0.1);
                        border-radius: 15px;
                        background-color: var(--hover-bg3);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                
                    .recent-track:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
                    }
                
                    .recent-track-img {
                        width: 100px;
                        height: 100px;
                        object-fit: cover;
                        border-radius: 12px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                        transition: transform 0.3s ease;
                    }
                
                    .recent-track:hover .recent-track-img {
                        transform: scale(1.05);
                    }
                
                    .recent-track-info {
                        flex-grow: 1;
                        margin-left: 15px;
                        color: var(--text-color);
                        background-color: transparent;
                    }
                
                    .recent-track-info p{
                        max-width: 150px;
                        background-color: transparent;
                    }
                    .track-name {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 0 0 5px 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        background-color: transparent;
                    }
                
                    .track-artist {
                        font-size: 14px;
                        opacity: 0.8;
                        margin: 0;
                        white-space: nowrap;
                        overflow: hidden;
                        background-color:transparent;
                        text-overflow: ellipsis;
                    }
                
                    @media (max-width: 768px) {
                        .recent-track {
                            width: 250px;
                        }
                
                        .recent-track-img {
                            width: 80px;
                            height: 80px;
                        }
                    }
                </style>
            `;
            });

             
         }
          
        
        // تحديث البيانات الإحصائية
        function updateTrackStats(track) {
            // تحديث تاريخ الإضافة عند إضافة أغنية جديدة
            track.dateAdded = new Date().toISOString();
            
            // إضافة معلومات النوع الموسيقي (يمكن تحديثها من API إذا كان متاحًا)
            track.genre = track.genre || 'Unknown';
            
            // تحديث مدة الأغنية (يمكن الحصول عليها من API)
            track.duration_ms = track.duration_ms || 180000; // افتراضيًا 3 دقائق
        }
        
        //add tracks to personalPlaylist
        function addToPersonalPlaylist(track) {
            const existingTrack = personalPlaylist.find(t => t.id === track.id);
            if (!existingTrack) {
                const newTrack = {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    image: track.album?.images[0]?.url || 'https://via.placeholder.com/50',
                    preview_url: track.preview_url,
                    liked: false,
                    genre: track.genre || 'Unknown',
                    duration_ms: track.duration_ms || 180000,
                    dateAdded: new Date().toISOString()
                };
                
                personalPlaylist.push(newTrack);
                savePersonalPlaylist();
                renderPersonalPlaylist();
                updatePlaylistStats(); // Make sure this is called here
            }
        }

        function addToPersonalPlaylist(track) {
            const existingTrack = personalPlaylist.find(t => t.id === track.id);
            if (!existingTrack) {
                const newTrack = {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    image: track.album?.images[0]?.url || 'https://via.placeholder.com/50',
                    preview_url: track.preview_url,
                    liked: false,
                    genre: track.genre || 'Unknown',
                    duration_ms: track.duration_ms || 180000,
                    dateAdded: new Date().toISOString()
                };
                
                personalPlaylist.push(newTrack);
                savePersonalPlaylist();
                renderPersonalPlaylist();
                updatePlaylistStats(); // Make sure this is called here
            }
        }
        

        // Add this to your initialization code
        window.addEventListener('load', () => {
            personalPlaylist = JSON.parse(localStorage.getItem('personalPlaylist')) || [];
            renderPersonalPlaylist();
            updatePlaylistStats();
        });

        
        
        // استدعاء الدالة بعد تحميل القائمة وعند كل تحديث
        renderPersonalPlaylist();
        updatePlaylistStats();
       
        //display trsacks
        function displayTracks(tracks) {
        let html = `
           <div class="navigation-buttons">
            <button onclick="navigateBack()" ${navigationHistory.length <= 1 ? 'disabled' : ''}>
                <i class="fas fa-arrow-left"></i> Back
            </button>
        </div>
        <div class="tracks-container">
    `;
    
    tracks.forEach((track, index) => {
        if (track) {  // Check if track exists
            html += createTrackHTML(track, index);
        }
    });
    
    html += '</div>';
    document.getElementById('content').innerHTML = html;
}
       

        async function searchTracks() {
            const query = document.getElementById('searchInput').value;
            if (query) {
                const data = await fetchSpotifyData(`search?q=${encodeURIComponent(query)}&type=track`);
                displayTracks(data.tracks.items);
            }
        }

       // Modify your existing event listeners to use the navigation system
       function addGridItemListeners() {
           const gridItems = document.querySelectorAll('.grid-item');
           gridItems.forEach(item => {
                 item.addEventListener('click', () => {
                     const type = item.dataset.type;
                     const id = item.dataset.id;
                     loadPage({ type, id });
                });
           });
        }

 document.addEventListener('DOMContentLoaded', () => {
    createNavigationButtons();
    // Load initial featured playlists
    loadPage({ type: 'featured' });
});
        //play-track
      
            function playTrack(index, isPersonalPlaylist = false) {
                currentTrackIndex = index;
                const track = isPersonalPlaylist ? personalPlaylist[index] : currentPlaylist[index];
                audioPlayer.src = track.preview_url;
                audioPlayer.play();
                updateNowPlaying(track);
                updatePlayPauseButton();
                fetchLyrics(track.artists[0].name, track.name); // Add this line
            }

        function updateNowPlaying(track) {
            document.getElementById('nowPlayingImg').src = track.album?.images[0]?.url || 'https://via.placeholder.com/56';
            document.getElementById('nowPlayingTitle').textContent = track.name;
            document.getElementById('nowPlayingArtist').textContent = track.artists[0].name;
        }

        function updatePlayPauseButton() {
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (audioPlayer.paused) {
                playPauseBtn.innerHTML = '<i class="fas fa-play-circle"></i>';
            } else {
                playPauseBtn.innerHTML = '<i class="fas fa-pause-circle"></i>';
            }
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }

        //layrics
        async function fetchLyrics(artist, title) {
            try {
                const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
                const data = await response.json();
                document.getElementById('lyricsContent').textContent = data.lyrics || 'Lyrics not found';
            } catch (error) {
                console.error('Error fetching lyrics:', error);
                document.getElementById('lyricsContent').textContent = 'Lyrics not available';
            }
        }
      

        async function displayRecommendedTracks() {
            const data = await fetchSpotifyData('recommendations?seed_genres=pop,rock,hip-hop&limit=100');
            displayTracks(data.tracks);
        }

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const page = e.target.closest('.menu-item').dataset.page;
                switch(page) {
                    case 'home':
                        document.getElementById('content').innerHTML = `
                        <style>
                            #content {
                                max-width: 1200px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                    
                            #hero {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 3rem;
                                margin-bottom: 2rem;
                                background-color: var(--hover-bg1);
                                border-radius: 20px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            }
                    
                            #hero img {
                                max-width: 45%;
                                height: auto;
                                border-radius: 10px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                            }
                    
                            .hero-text {
                                max-width: 50%;
                            }
                    
                            .hero-text h1 {
                                font-size: 3rem;
                                margin-bottom: 1rem;
                            }
                    
                            .hero-text p {
                                font-size: 1.2rem;
                                margin-bottom: 2rem;
                            }
                    
                            .cta-button {
                                display: inline-block;
                                padding: 12px 24px;
                                background-color: var(--spotify-green);
                                color: var(--text-color);
                                text-decoration: none;
                                border-radius: 30px;
                                font-weight: bold;
                                transition: background-color 0.3s ease;
                            }
                    
                            .cta-button:hover {
                                background-color: #1ED760;
                            }
                    
                            .social-media {
                                margin-top: 2rem;
                            }
                    
                            .social-media i {
                                font-size: 24px;
                                margin-right: 15px;
                                color: var(--text-color);
                                transition: color 0.3s ease;
                            }
                    
                            .social-media i:hover {
                                color: var(--primary-color);
                            }
                    
                            #features {
                                display: grid;
                                grid-template-columns: repeat(4, 1fr);
                                gap: 20px;
                                margin-bottom: 3rem;
                            }
                    
                            .feature {
                                background-color: var(--hover-bg1);
                                padding: 20px;
                                border-radius: 10px;
                                text-align: center;
                                transition: transform 0.3s ease;
                            }
                    
                            .feature:hover {
                                transform: translateY(-5px);
                            }
                    
                            .feature i {
                                font-size: 48px;
                                color: var(--primary-color);
                                margin-bottom: 15px;
                            }
                    
                            .feature h3 {
                                font-size: 1.5rem;
                                margin-bottom: 10px;
                            }
                    
                            #discover, #genres, #top-playlists, #live-events {
                                margin-bottom: 3rem;
                            }
                    
                            .section-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 20px;
                            }
                    
                            
                            .section-header h2 {
                                display: flex;
                                align-items: center;
                                font-size: 2rem;
                            }
                    
                            .section-header h2 i {
                                margin-right: 10px;
                                color: var(--primary-color);
                            }
                    
                            .view-all {
                                color: var(--primary-color);
                                text-decoration: none;
                                font-weight: bold;
                            }
                    
                            .content-slider {
                                display: flex;
                                backgound-image: var(--hover-bg1);
                                gap: 20px;
                                overflow-x: auto;
                                padding-bottom: 20px;
                                scrollbar-width: thin;
                                scrollbar-color: red var(--hover-bg1);
                            }
                    
                            .content-slider::-webkit-scrollbar {
                                height: 8px;
                            }
                    
                            .content-slider::-webkit-scrollbar-track {
                                background: var(--hover-bg1);
                            }
                    
                            .content-slider::-webkit-scrollbar-thumb {
                                background-color: var(--spotify-green);
                                border-radius: 20px;
                            }
                    
                            .content-item {
                                flex: 0 0 auto;
                                width: 200px;
                                text-align: center;
                            }
                    
                            .content-item img {
                                width: 100%;
                                height: 200px;
                                object-fit: cover;
                                border-radius: 10px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                transition: transform 0.3s ease;
                            }
                    
                            .content-item img:hover {
                                transform: scale(1.05);
                            }
                    
                            .content-item p {
                                margin-top: 10px;
                                font-size: 1rem;
                            }
                    
                            #music-news {
                                background-color: var(--hover-bg1);
                                padding: 2rem;
                                border-radius: 20px;
                                margin-bottom: 3rem;
                            }
                    
                            #music-news h2 {
                                font-size: 2rem;
                                margin-bottom: 1rem;
                            }
                            #featured-video {
                                 background-color: var(--hover-bg1);
                                 padding: 2rem;
                                 border-radius: 20px;
                                 margin-bottom: 3rem;
                             }
                             
                             #featured-video h2 {
                                 font-size: 2rem;
                                 margin-bottom: 1rem;
                             }

                             .video-grid {
                                 display: grid;
                                 grid-template-columns: 1fr;
                                 gap: 20px;
                             }

                            .video-item {
                                 background-color: var(--hover-bg2);
                                 padding: 1rem;
                                 border-radius: 10px;
                            }

                            .video-item h3 {
                                 font-size: 1.2rem;
                                 margin-bottom: 0.5rem;
                            }

                           .video-item p {
                                 font-size: 0.9rem;
                                 color: var(--secondary-text-color);
                            }

                            .video-iframe{
                                width: 100%;
                                height: 600px;
                            }
                            .news-grid {
                                display: grid;
                                grid-template-columns: repeat(3, 1fr);
                                gap: 20px;
                            }
                            
                            .news-item {
                                background-color: var(--background-color);
                                padding: 1rem;
                                border-radius: 10px;
                            }
                    
                            .news-item h3 {
                                font-size: 1.2rem;
                                margin-bottom: 0.5rem;
                            }
                    
                            .news-item p {
                                font-size: 0.9rem;
                                color: var(--secondary-text-color);
                            }
                    
                            #spotify-connect {
                                background-image: url(https://ouch-cdn2.icons8.com/diZLGVvQvVLHwQ03qhlwRwdGco-xwkGZ7qTLbNQs9-s/rs:fit:368:368/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMzQw/L2FlYjY5ZGNiLWFh/YjgtNGFhMy1iN2Ez/LTFmNWViMmUxYWE1/MS5zdmc.png);
                                background-position: 0 0;
                                background-size: 30% auto;
                                background-repeat: no-repeat;
                                text-align: center;
                                margin-bottom: 3rem;
                                padding: 2rem;
                                border-radius: 20px;
                                box-shadow: 0 2rem 3rem rgba(0, 0, 0, 0.3);
                                background-color: var(--hover-bg1);
                            }
                    
                            #spotify-connect h2 {
                                font-size: 2rem;
                                margin-bottom: 1rem;
                            }
                    
                            .device-icons {
                                display: flex;
                                justify-content: center;
                                gap: 30px;
                                margin-top: 2rem;
                            }
                    
                            .device-icons i {
                                font-size: 48px;
                                color: var(--primary-color);
                            }
                    
                            @media (max-width: 768px) {
                                #hero {
                                    flex-direction: column;
                                    text-align: center;
                                }
                    
                                #hero img {
                                    max-width: 100%;
                                    margin-bottom: 2rem;
                                }
                    
                                .hero-text {
                                    max-width: 100%;
                                }
                    
                                #features {
                                    grid-template-columns: 1fr 1fr;
                                }
                    
                                .news-grid {
                                    grid-template-columns: 1fr;
                                }
                            }
                        </style>
                        <div id="content">
                            <section id="hero">
                                <div class="hero-text">
                                    <h1>Welcome to SM4music</h1>
                                    <p>Made by-SM.studio</p>
                                    <p>Discover, stream, and share a constantly expanding mix of music from emerging and major artists around the world.</p>
                                    <a onclick="goToNewReleases()" class="cta-button">Start Listening</a>
                                    <div class="social-media">
                                        <i class='bx bxl-instagram'></i>
                                        <i class='bx bxl-facebook'></i>
                                        <i class='bx bxl-youtube'></i>
                                        <i class='bx bxl-twitter'></i>
                                    </div>
                                </div>
                                <img src="brandmark.png" alt="Hero Image">
                            </section>
                    
                            <section id="features">
                                <div class="feature">
                                    <i class='bx bx-music'></i>
                                    <h3>Millions of Songs</h3>
                                    <p>Listen to millions of songs from any genre.</p>
                                </div>
                                <div class="feature">
                                    <i class='bx bx-playlist'></i>
                                    <h3>Personalized Playlists</h3>
                                    <p>Get custom playlists based on your taste.</p>
                                </div>
                                <div class="feature">
                                    <i class='bx bx-podcast'></i>
                                    <h3>Podcasts & Shows</h3>
                                    <p>Explore a wide variety of podcasts and shows.</p>
                                </div>
                                <div class="feature">
                                    <i class='bx bx-radio'></i>
                                    <h3>Live Radio</h3>
                                    <p>Tune in to live radio stations from around the globe.</p>
                                </div>
                            </section>
                    
                            <section id="discover">
                                <div class="section-header">
                                    <h2><i class='bx bx-music'></i> Discover New Music</h2>
                                    <a href="#" class="view-all">View All</a>
                                </div>
                                <div class="content-slider">
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/805764964/photo/rock-n-roll-drummer-sparkles-in-the-air.jpg?s=612x612&w=0&k=20&c=qJueIqqbAld7VM-dtGhIMVPHvZRoe991XTH6tAu1G_w=" alt="Discover Music 1">
                                        <p>Top Hits</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/1258103236/vector/vector-linear-character-illustration-of-man-flying-in-arrow-shape.jpg?s=612x612&w=0&k=20&c=mFBtvjw29QkY8eQOm-CIocnzlGUTHpfLxaxR-TUYy8M=" alt="Discover Music 2">
                                        <p>Trending Now</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/1352280323/vector/new-release-stamp-imprint-seal-template-grunge-effect-vector-stock-illustration.jpg?s=1024x1024&w=is&k=20&c=otnUkKS_SRi1ijT_7Sx_pOG82Jx5u2fr0ZQK4L418dk=" alt="Discover Music 3">
                                        <p>New Releases</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/165750139/vector/children-with-rocket-in-space.jpg?s=612x612&w=0&k=20&c=_EeRlg33pTyWEuqSxcq_ubaIjkeW3doaSiYNM8MCZAo=" alt="Discover Music 4">
                                        <p>Mood Boosters</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/2161140346/photo/family-stretching-in-the-park.jpg?s=612x612&w=0&k=20&c=aZDaNDe1GS3fxXiHeVmr7BGKHs1l5o95k7GF5Hq38Ws=" alt="Discover Music 5">
                                        <p>Workout Mix</p>
                                    </div>
                                </div>
                            </section>
                    
                            <section id="genres">
                                <div class="section-header">
                                    <h2><i class='bx bx-category'></i> Genres</h2>
                                    <a href="#" class="view-all">View All</a>
                                </div>
                                <div class="content-slider">
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/1474498315/photo/the-young-female-rock-musician.jpg?s=612x612&w=0&k=20&c=eXuzTQpH1wrMqc5RZ4TbzKH_jEI8DS9Ln5SL90mAGpQ=" alt="Genre 1">
                                        <p>Pop</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/131935239/vector/retro-drawing-of-guitar-amplifier-with-lighting-bolts.jpg?s=612x612&w=0&k=20&c=RaA-yEddqd7rmTEi-tWQCGPqwgmEGFJC5X58QDVhQ5U=" alt="Genre 2">
                                        <p>Rock</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/1820130635/photo/young-man-hip-hop-street-style-dancer-in-motion-over-green-background-energy-and-freedom.jpg?s=612x612&w=0&k=20&c=BSALs_wy2PJqsiSbi2pR4Lwx3mK497tJJ-Mj_CqWD64=" alt="Genre 3">
                                        <p>Hip-Hop</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/2155554093/vector/cartoon-retro-radio-player-vintage-doodle-radio-boombox-with-antenna-old-music-hand-device.jpg?s=612x612&w=0&k=20&c=WWOrVWxviaGEeZbPh-ib_sFx3qnfo72KavOHPKnoqrE=" alt="Genre 4">
                                        <p>Electronic</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://media.istockphoto.com/id/1138103719/photo/african-american-jazz-musician-playing-the-saxophone.jpg?s=612x612&w=0&k=20&c=7RQAD0XgvLB_b-3qwpvax2hki6SwoVxzC5s_JQaeSLk=" alt="Genre 5">
                                        <p>Jazz</p>
                                    </div>
                                </div>
                            </section>
                    
                            <section id="top-playlists">
                                <div class="section-header">
                                    <h2><i class='bx bx-list-ul'></i> Top Playlists</h2>
                                    <a href="#" class="view-all">View All</a>
                                </div>
                                <div class="content-slider">
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=1" alt="Playlist 1">
                                        <p>Today's Top Hits</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=2" alt="Playlist 2">
                                        <p>RapCaviar</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=3" alt="Playlist 3">
                                        <p>All Out 2010s</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=4" alt="Playlist 4">
                                        <p>Rock Classics</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=5" alt="Playlist 5">
                                        <p>Chill Hits</p>
                                    </div>
                                </div>
                            </section>
                    
                            <section id="live-events">
                                <div class="section-header">
                                    <h2><i class='bx bx-calendar-event'></i> Live Events</h2>
                                    <a href="#" class="view-all">View All</a>
                                </div>
                                <div class="content-slider">
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=6" alt="Event 1">
                                        <p>Summer Music Festival</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=7" alt="Event 2">
                                        <p>Jazz in the Park</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=8" alt="Event 3">
                                        <p>Electronic Dance Night</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=9" alt="Event 4">
                                        <p>Rock the Stadium</p>
                                    </div>
                                    <div class="content-item">
                                        <img src="https://picsum.photos/200/200?random=10" alt="Event 5">
                                        <p>Country Music Jamboree</p>
                                    </div>
                                </div>
                            </section>

                            <section id="featured-video">
                               <h2>Featured Tutorial Video</h2>
                               <div class="video-grid">
                                   <div class="video-item">
                                      <h3>Introduction to Music Production</h3>
                                      <iframe class="video-iframe"  src="https://www.youtube.com/embed/s1iPXBny9Ec" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                                      </iframe>
                                      <p>This video provides an introduction to music production, perfect for beginners who want to explore the basics. Follow along to learn essential techniques and get started on your music journey.</p>
                                   </div>
                               </div>
                            </section>
                            
                            <section id="music-news">
                                <h2>Music News</h2>
                                <div class="news-grid">
                                    <div class="news-item">
                                        <h3>New Album Release</h3>
                                        <p>Popular artist XYZ drops a surprise album. Fans are going wild!</p>
                                    </div>
                                    <div class="news-item">
                                        <h3>Grammy Nominations</h3>
                                        <p>The latest Grammy nominations are out. See who made the cut!</p>
                                    </div>
                                    <div class="news-item">
                                        <h3>Upcoming World Tour</h3>
                                        <p>Global superstar ABC announces dates for their upcoming world tour.</p>
                                    </div>
                                </div>
                            </section>
                    
                            <section id="spotify-connect">
                                <h2>Spotify Connect</h2>
                                <p>Listen to Spotify on your favorite devices</p>
                                <div class="device-icons">
                                    <i class='bx bx-laptop'></i>
                                    <i class='bx bx-mobile-alt'></i>
                                    <i class='bx bx-tv'></i>
                                    <i class='bx bx-speaker'></i>
                                </div>
                            </section>
                        </div>
                        
                       
                      `;
                        break;
                    case 'featured-playlists':
                        await displayFeaturedPlaylists();
                        break;
                    case 'new-releases':
                        await displayNewReleases();
                        break;
                    case 'categories':
                        await displayCategories();
                        break;
                    case 'search':
                        document.getElementById('searchInput').focus();
                        break;
                    case 'recommended':
                        await displayRecommendedTracks();
                        break;
                }
            });
        });

         // تحديث مستمع الحدث للبحث
         document.getElementById('searchButton').addEventListener('click', searchSpotify);
         document.getElementById('searchInput').addEventListener('keypress', (e) => {
             if (e.key === 'Enter') {
                 searchSpotify();
             }
         });
    

        document.getElementById('playPauseBtn').addEventListener('click', () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.pause();
            }
            updatePlayPauseButton();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            if (currentTrackIndex > 0) {
                playTrack(currentTrackIndex - 1);
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            if (currentTrackIndex < currentPlaylist.length - 1) {
                playTrack(currentTrackIndex + 1);
            }
        });

        document.getElementById('volumeControl').addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value / 100;
            updateVolumeIcon();
        });

        function updateVolumeIcon() {
            const volumeIcon = document.getElementById('volumeIcon');
            const volume = audioPlayer.volume;
            if (volume > 0.5) {
                volumeIcon.className = 'fas fa-volume-up';
            } else if (volume > 0) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-mute';
            }
        }

        document.getElementById('progressBar').addEventListener('click', (e) => {
            const progressBar = document.getElementById('progressBar');
            const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
            audioPlayer.currentTime = clickPosition * audioPlayer.duration;
        });

        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            document.getElementById('progress').style.width = `${progress}%`;
            document.getElementById('currentTime').textContent = formatTime(audioPlayer.currentTime);
        });

        audioPlayer.addEventListener('loadedmetadata', () => {
            document.getElementById('totalTime').textContent = formatTime(audioPlayer.duration);
        });

        audioPlayer.addEventListener('ended', () => {
            if (currentTrackIndex < currentPlaylist.length - 1) {
                playTrack(currentTrackIndex + 1);
            } else {
                updatePlayPauseButton();
            }
        });

        document.getElementById('toggleLyrics').addEventListener('click', () => {
            document.getElementById('lyricsContainer').classList.toggle('show');
        });


        // Initialize the app
        getAccessToken().then(() => {
            displayFeaturedPlaylists();
            renderPersonalPlaylist();
            
        });
