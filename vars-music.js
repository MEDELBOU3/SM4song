 async function displayVariousMusic() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="various-music-section">
            <div class="section-header">
                <h2>Various Music</h2>
                <div class="music-search">
                    <input type="text" id="musicSearchInput" placeholder="Search music...">
                </div>
            </div>
            <div class="music-grid" id="musicGrid"></div>
        </div>
    `;

    // Initialize YouTube API if not already initialized
    if (typeof YT === 'undefined') {
        loadYouTubeAPI();
    } else {
        fetchMusicVideos();
    }
}
  

function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    fetchMusicVideos();
}

async function fetchMusicVideos() {
    const API_KEY = 'AIzaSyB0-q2rcbRKwE_mNZTg7uV8WTqpeot5q84';
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${API_KEY}`);
        const data = await response.json();
        displayMusicGrid(data.items);
    } catch (error) {
        console.error('Error fetching music videos:', error);
    }
}

function displayMusicGrid(videos) {
    const musicGrid = document.getElementById('musicGrid');
    musicGrid.innerHTML = '';

    videos.forEach(video => {
        const card = createMusicCard(video);
        musicGrid.appendChild(card);
    });
}

function createMusicCard(video) {
    const card = document.createElement('div');
    card.className = 'music-card';
    card.innerHTML = `
        <div class="music-thumbnail">
            <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="music-info">
            <h3>${video.snippet.title}</h3>
            <p>${video.snippet.channelTitle}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        playYoutubeVideo(video);
    });

    return card;
}

function playYoutubeVideo(video) {
    // Update now playing section
    document.getElementById('nowPlayingImg').src = video.snippet.thumbnails.default.url;
    document.getElementById('nowPlayingTitle').textContent = video.snippet.title;
    document.getElementById('nowPlayingArtist').textContent = video.snippet.channelTitle;

    // Update player
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.innerHTML = '<i class="fas fa-pause-circle"></i>';

    // Start playing the video (you'll need to implement the actual playback logic)
    // This could involve using the YouTube IFrame API to play the video
}

// Add search functionality
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'musicSearchInput') {
        debounce(searchMusic(e.target.value), 500);
    }
});

async function searchMusic(query) {
    if (query.length < 3) return;

    const API_KEY = 'AIzaSyB0-q2rcbRKwE_mNZTg7uV8WTqpeot5q84';
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=20&key=${API_KEY}`);
        const data = await response.json();
        const videos = data.items.map(item => ({
            ...item,
            id: item.id.videoId
        }));
        displayMusicGrid(videos);
    } catch (error) {
        console.error('Error searching music:', error);
    }
}

// YouTube Video Player and Queue Management
let videoPlayer;
let queue = [];
const API_KEY = 'AIzaSyB0-q2rcbRKwE_mNZTg7uV8WTqpeot5q84';
let currentVideoIndex = -1;
let isPlayerExpanded = false;

// Video Player Container HTML - Add this to your displayVariousMusic function
function getVideoPlayerHTML() {
    return `
        <div id="youtube-player-container" class="youtube-player-container collapsed">
            <div class="player-header">
                <div class="drag-handle">
                    <i class="fas fa-grip-lines"></i>
                </div>
                <div class="player-controls-top">
                    <button class="expand-toggle" onclick="togglePlayerExpansion()">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="close-player" onclick="closeVideoPlayer()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="video-wrapper">
                <div id="youtube-player"></div>
            </div>
            <div class="video-controls">
                <div class="video-progress">
                    <div id="video-progress-bar" class="progress-bar">
                        <div id="video-progress" class="progress"></div>
                    </div>
                    <span id="video-time">0:00 / 0:00</span>
                </div>
                <div class="control-buttons">
                    <button onclick="playPreviousVideo()"><i class="fas fa-backward"></i></button>
                    <button id="video-play-pause" onclick="toggleVideoPlayPause()">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="playNextVideo()"><i class="fas fa-forward"></i></button>
                    <button onclick="toggleQueue()"><i class="fas fa-list"></i></button>
                </div>
            </div>
            <div id="queue-container" class="queue-container hidden">
                <div class="queue-header">
                    <h3>Queue</h3>
                    <button style="padding: 6px 4px;
                    outline: none;
                    border-radius: 8px;
                    border: none;
                    background-color: #1DB954;
                    color: var(--text-color);
                    " onclick="clearQueue()">Clear Queue <i class="fa fa-stream"></i></button>
                </div>
                <div id="queue-list" class="queue-list"></div>
            </div>
        </div>
    `;
}

function initializeDraggable() {
    const playerContainer = document.getElementById('youtube-player-container');
    const dragHandle = playerContainer.querySelector('.drag-handle');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function setTranslate(xPos, yPos) {
        playerContainer.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === dragHandle || e.target.parentElement === dragHandle) {
            isDragging = true;
        }
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            // Add boundaries to keep the player within the viewport
            const rect = playerContainer.getBoundingClientRect();
            const parentRect = playerContainer.parentElement.getBoundingClientRect();

            if (currentX < -rect.width/2) currentX = -rect.width/2;
            if (currentX > parentRect.width - rect.width/2) currentX = parentRect.width - rect.width/2;
            if (currentY < 0) currentY = 0;
            if (currentY > parentRect.height - rect.height) currentY = parentRect.height - rect.height;

            setTranslate(currentX, currentY);
        }
    }

    // Add event listeners
    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    dragHandle.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for the player to be added to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const playerContainer = document.getElementById('youtube-player-container');
                if (playerContainer) {
                    initializeDraggable();
                    observer.disconnect();
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

async function displayVariousMusic() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="various-music-section">
            <div class="section-header">
                <h2>Various Music</h2>
                <div class="music-search">
                    <input type="text" id="musicSearchInput" placeholder="Search music...">
                </div>
            </div>
            <div class="music-grid" id="musicGrid"></div>
        </div>
        ${getVideoPlayerHTML()}
    `;

    initializeYouTubePlayer();
    fetchMusicVideos();
}

function initializeYouTubePlayer() {
    if (typeof YT === 'undefined' || !YT.loaded) {
        loadYouTubeAPI();
    } else {
        createYouTubePlayer();
    }
}

function createYouTubePlayer() {
    videoPlayer = new YT.Player('youtube-player', {
        height: '360',
        width: '640',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'rel': 0
        },
        events: {
            'onStateChange': onPlayerStateChange,
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    updateProgressBar();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextVideo();
    }
    updatePlayPauseButton();
}

function updateProgressBar() {
    if (videoPlayer && videoPlayer.getCurrentTime) {
        const currentTime = videoPlayer.getCurrentTime();
        const duration = videoPlayer.getDuration();
        const progress = (currentTime / duration) * 100;
        
        document.getElementById('video-progress').style.width = `${progress}%`;
        document.getElementById('video-time').textContent = 
            `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
    requestAnimationFrame(updateProgressBar);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function playYoutubeVideo(video) {
    const playerContainer = document.getElementById('youtube-player-container');
    playerContainer.classList.remove('hidden');
    
    // Add to queue if not already present
    if (!queue.find(v => v.id === video.id)) {
        queue.push(video);
        currentVideoIndex = queue.length - 1;
        updateQueueDisplay();
    }

    videoPlayer.loadVideoById(video.id);
    updatePlayPauseButton();
}

function togglePlayerExpansion() {
    const container = document.getElementById('youtube-player-container');
    isPlayerExpanded = !isPlayerExpanded;
    container.classList.toggle('expanded', isPlayerExpanded);
    container.classList.toggle('collapsed', !isPlayerExpanded);
}

function closeVideoPlayer() {
    videoPlayer.stopVideo();
    document.getElementById('youtube-player-container').classList.add('hidden');
}

function toggleQueue() {
    document.getElementById('queue-container').classList.toggle('hidden');
}

function updateQueueDisplay() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = queue.map((video, index) => `
        <div class="queue-item ${index === currentVideoIndex ? 'active' : ''}"
             onclick="playFromQueue(${index})">
            <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
            <div class="queue-item-info">
                <span class="title">${video.snippet.title}</span>
                <span class="channel">${video.snippet.channelTitle}</span>
            </div>
            <button style=" width: 8px hieght: 8px; justify-content: center; algin-items: center; border-radius: 50%;
            background-color: #fff;" onclick="removeFromQueue(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function playFromQueue(index) {
    currentVideoIndex = index;
    playYoutubeVideo(queue[index]);
}

function removeFromQueue(index) {
    event.stopPropagation();
    queue.splice(index, 1);
    if (currentVideoIndex === index) {
        playNextVideo();
    } else if (currentVideoIndex > index) {
        currentVideoIndex--;
    }
    updateQueueDisplay();
}

function clearQueue() {
    queue = [];
    currentVideoIndex = -1;
    closeVideoPlayer();
    updateQueueDisplay();
}

function playNextVideo() {
    if (currentVideoIndex < queue.length - 1) {
        currentVideoIndex++;
        playYoutubeVideo(queue[currentVideoIndex]);
    }
}

function playPreviousVideo() {
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        playYoutubeVideo(queue[currentVideoIndex]);
    }
}

function toggleVideoPlayPause() {
    if (videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        videoPlayer.pauseVideo();
    } else {
        videoPlayer.playVideo();
    }
}

function updatePlayPauseButton() {
    const button = document.getElementById('video-play-pause');
    const isPlaying = videoPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    button.innerHTML = `<i class="fas fa-${isPlaying ? 'pause' : 'play'}"></i>`;
}


// Constants and Configuration

const GENRES = {
    'All': '',
    'Pop': 'pop music',
    'Rock': 'rock music',
    'Hip Hop': 'hip hop music',
    'Electronic': 'electronic music',
    'Classical': 'classical music',
    'Jazz': 'jazz music',
    'R&B': 'r&b music',
    'Country': 'country music',
    'Latin': 'latin music',
    'Funks': 'Funks music'
};

// Enhanced Genre Implementation
async function filterByGenre(genre) {
    const query = GENRES[genre];
    if (genre === 'All') {
        fetchMusicVideos();
        return;
    }
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=20&key=${API_KEY}`
        );
        const data = await response.json();
        const videos = data.items.map(item => ({
            ...item,
            id: item.id.videoId
        }));
        displayMusicGrid(videos);
    } catch (error) {
        console.error('Error filtering by genre:', error);
    }
}

// Enhanced Channel Implementation
async function fetchPopularMusicChannels() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=music&maxResults=10&key=${API_KEY}`
        );
        const data = await response.json();
        displayChannels(data.items);
    } catch (error) {
        console.error('Error fetching channels:', error);
    }
}

function displayChannels(channels) {
    const channelList = document.querySelector('.channel-list');
    channelList.innerHTML = channels.map(channel => `
        <div class="channel-item" onclick="loadChannelContent('${channel.id.channelId}')">
            <div class="channel-avatar">
                <img src="${channel.snippet.thumbnails.medium.url}" alt="${channel.snippet.title}">
            </div>
            <span class="channel-name" style="font-weight: bold;">${channel.snippet.title}</span>
            <span class="channel-subscribers">Loading...</span>
        </div>
    `).join('');

    // Fetch subscriber counts
    channels.forEach(async channel => {
        const subscribers = await fetchChannelStats(channel.id.channelId);
        updateChannelSubscribers(channel.id.channelId, subscribers);
    });

    updateArrowState();
}


async function fetchChannelStats(channelId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`
        );
        const data = await response.json();
        return formatSubscriberCount(data.items[0].statistics.subscriberCount);
    } catch (error) {
        console.error('Error fetching channel stats:', error);
        return 'N/A';
    }
}

function formatSubscriberCount(count) {
    const num = parseInt(count);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function updateChannelSubscribers(channelId, subscribers) {
    const channelItem = document.querySelector(`[onclick="loadChannelContent('${channelId}')"]`);
    if (channelItem) {
        const subscriberSpan = channelItem.querySelector('.channel-subscribers');
        subscriberSpan.textContent = subscribers + ' subscribers';
    }
}

// Enhanced Playlist Implementation
async function loadChannelContent(channelId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=10&key=${API_KEY}`
        );
        const data = await response.json();
        displayPlaylists(data.items);
    } catch (error) {
        console.error('Error loading channel content:', error);
    }
}

function displayPlaylists(playlists) {
    const playlistsSection = document.createElement('div');
    playlistsSection.className = 'playlists-section';
    playlistsSection.innerHTML = `
        <h3>Channel Playlists</h3>
        <div class="playlist-grid">
            ${playlists.map(playlist => `
                <div class="playlist-card" onclick="loadPlaylistVideos('${playlist.id}')">
                    <div class="playlist-thumbnail">
                        <img src="${playlist.snippet.thumbnails.medium.url}" alt="${playlist.snippet.title}">
                        <div class="playlist-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="playlist-info">
                        <h4>${playlist.snippet.title}</h4>
                        <p>${playlist.snippet.channelTitle}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const musicGrid = document.querySelector('.music-grid');
    musicGrid.parentNode.insertBefore(playlistsSection, musicGrid);
}

async function loadPlaylistVideos(playlistId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=20&key=${API_KEY}`
        );
        const data = await response.json();
        const videos = data.items.map(item => ({
            ...item,
            id: item.snippet.resourceId.videoId
        }));
        displayMusicGrid(videos);
    } catch (error) {
        console.error('Error loading playlist videos:', error);
    }
}



//18.50 28/12
// Music Platform Enhancement

// Initialize state management
const state = {
    currentGenre: 'All',
    currentPlaylist: null,
    currentChannel: null,
    searchQuery: '',
    filteredResults: []
};

// Add genre selector HTML
function getGenreSelectorHTML() {
    return `
        <div class="genre-selector">
            ${Object.keys(GENRES).map(genre => `
                <button class="genre-btn ${state.currentGenre === genre ? 'active' : ''}" 
                        onclick="handleGenreSelect('${genre}')">
                    ${genre}
                </button>
            `).join('')}
        </div>
    `;
}

// Add channel section HTML
function getChannelSectionHTML() {
    return `
    <div class="channels-wrapper">
        <button class="arrow left" onclick="scrollLeft()"><i class="bx bx-chevron-left" style="font-size: 14px;"></i></button>
        <div class="channels-section">
           <h3>Popular Music Channels</h3>
           <div class="channel-list"></div>
        </div>
        <button class="arrow right" onclick="scrollRight()"><i class="bx bx-chevron-right" style="font-size: 14px;"></i></button>
    </div>
    `;
}

function scrollLeft() {
    const channelList = document.querySelector('.channel-list');
    const scrollAmount = channelList.offsetWidth * 0.8;
    channelList.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
    });
    setTimeout(updateArrowState, 300);
}

function scrollRight() {
    const channelList = document.querySelector('.channel-list');
    const scrollAmount = channelList.offsetWidth * 0.8;
    channelList.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
    setTimeout(updateArrowState, 300);
}

function updateArrowState() {
    const channelList = document.querySelector('.channel-list');
    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');

    // Check if scrolling is possible
    const isAtStart = channelList.scrollLeft === 0;
    const isAtEnd = channelList.scrollLeft + channelList.offsetWidth >= channelList.scrollWidth;

    leftArrow.classList.toggle('disabled', isAtStart);
    rightArrow.classList.toggle('disabled', isAtEnd);
}

// Initialize the channels section
document.getElementById('channelsContainer').innerHTML = getChannelSectionHTML();

// Add scroll event listener to update arrow states
document.querySelector('.channel-list').addEventListener('scroll', updateArrowState);

// Add window resize listener to update arrow states
window.addEventListener('resize', updateArrowState);

// Enhanced displayVariousMusic function
async function displayVariousMusic() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="various-music-section">
            <div class="section-header">
                <h2>Music Explorer</h2>
                <div class="music-search">
                    <input type="text" id="musicSearchInput" placeholder="Search music...">
                </div>
            </div>
            ${getGenreSelectorHTML()}
            ${getChannelSectionHTML()}
            <div class="music-content">
                <div class="music-grid" id="musicGrid"></div>
                <div class="featured-section" id="featuredSection"></div>
            </div>
        </div>
        ${getVideoPlayerHTML()}
    `;

    // Initialize components
    initializeYouTubePlayer();
    fetchPopularMusicChannels();
    fetchMusicVideos();
    initializeEventListeners();
}

// Initialize event listeners
function initializeEventListeners() {
    const searchInput = document.getElementById('musicSearchInput');
    searchInput.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value;
        if (state.searchQuery.length >= 3) {
            searchMusic(state.searchQuery);
        } else if (state.searchQuery.length === 0) {
            fetchMusicVideos();
        }
    }, 500));

    // Add scroll listener for infinite loading
    window.addEventListener('scroll', debounce(() => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            loadMoreContent();
        }
    }, 200));
}

// Handle genre selection
async function handleGenreSelect(genre) {
    state.currentGenre = genre;
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === genre);
    });
    await filterByGenre(genre);
}

// Load more content when scrolling
async function loadMoreContent() {
    if (state.currentGenre) {
        // Implement pagination logic here
        const nextPage = await fetchNextPage();
        if (nextPage.items) {
            appendToMusicGrid(nextPage.items);
        }
    }
}

// Append new items to music grid
function appendToMusicGrid(items) {
    const musicGrid = document.getElementById('musicGrid');
    items.forEach(item => {
        const card = createMusicCard(item);
        musicGrid.appendChild(card);
    });
}

// Enhanced fetchNextPage implementation
async function fetchNextPage() {
    // Implement pagination token logic here
    return { items: [] }; // Placeholder
}

// Debounce utility function
function debounce(func, wait) {
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
