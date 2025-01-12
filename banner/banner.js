const banner = document.querySelector('.advanced-banner');
const handle = document.querySelector('.resize-handle');
let isResizing = false;
let startY;
let startHeight;

// Show banner when track plays
function onTrackPlay(trackId) {
    banner.classList.add('active');
    fetchAndUpdateTrackData(trackId);
}

// Resize functionality
handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = parseInt(document.defaultView.getComputedStyle(banner).height, 10);
    
    document.documentElement.style.cursor = 'ns-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const deltaY = startY - e.clientY;
    const newHeight = startHeight + deltaY;

    // Set minimum and maximum heights
    if (newHeight >= 200 && newHeight <= window.innerHeight * 0.8) {
        banner.style.height = `${newHeight}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.documentElement.style.cursor = '';
    }
});

// Close banner
document.querySelector('.banner-close').addEventListener('click', () => {
    banner.classList.remove('active');
});


class SpotifyAuth {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        // If not, get a new token
        const authString = btoa(`${this.clientId}:${this.clientSecret}`);
        
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();

            if (data.access_token) {
                this.accessToken = data.access_token;
                // Set token expiry (subtract 60 seconds as safety margin)
                this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
                return this.accessToken;
            } else {
                throw new Error('Failed to get access token');
            }
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            throw error;
        }
    }
}

const spotifyAuth = new SpotifyAuth(
    '52055e9524af40dcac80249b98ddb7db',
    '71e2042b2b614c2cb035672ac98ed69c'
);

// Function to fetch and update track data
async function fetchAndUpdateTrackData(trackId) {
    try {
        // Get fresh access token
        const accessToken = await spotifyAuth.getAccessToken();

        // Fetch track data
        const [trackData, audioFeatures, relatedTracks] = await Promise.all([
            // Get track details
            fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then(res => res.json()),

            // Get audio features
            fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then(res => res.json()),

            // Get recommendations
            fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then(res => res.json())
        ]);

        updateBannerContent(trackData, audioFeatures, relatedTracks);
    } catch (error) {
        console.error('Error fetching track data:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Spotify auth with your credentials
    const spotify = new SpotifyAuth(
        '52055e9524af40dcac80249b98ddb7db',
        '71e2042b2b614c2cb035672ac98ed69c'
    );

    // Example: Search for a track
    async function searchTrack(query) {
        try {
            const accessToken = await spotify.getAccessToken();
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            const data = await response.json();
            if (data.tracks.items.length > 0) {
                const track = data.tracks.items[0];
                // Update player and show banner
                updateNowPlaying(track);
                onTrackPlay(track.id);
            }
        } catch (error) {
            console.error('Error searching track:', error);
        }
    }

    // Example of how to test it
    // searchTrack('Bohemian Rhapsody'); // This will search and display the track
});

// Helper function to format the auth header
function getAuthHeader(accessToken) {
    return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
}

// Update banner content with real data
function updateBannerContent(trackData, audioFeatures, relatedTracks) {
    // Update track info
    document.getElementById('albumName').textContent = trackData.album.name;
    document.getElementById('releaseDate').textContent = new Date(trackData.album.release_date).toLocaleDateString();
    document.getElementById('genre').textContent = trackData.album.genres?.join(', ') || 'N/A';
    document.getElementById('label').textContent = trackData.album.label || 'N/A';

    // Update stats
    document.getElementById('playCount').textContent = formatNumber(trackData.popularity * 1000);
    document.getElementById('likeCount').textContent = formatNumber(trackData.popularity * 500);
    document.getElementById('popularity').textContent = `${trackData.popularity}%`;
    document.getElementById('duration').textContent = formatDuration(trackData.duration_ms);

    // Update related tracks
    const relatedList = document.getElementById('relatedTracksList');
    relatedList.innerHTML = relatedTracks.tracks.map(track => `
        <div class="related-track" data-track-id="${track.id}">
            <img src="${track.album.images[0].url}" alt="${track.name}">
            <div class="related-track-info">
                <div class="title">${track.name}</div>
                <div class="artist">${track.artists[0].name}</div>
            </div>
        </div>
    `).join('');

    // Fetch and update lyrics
    fetchLyrics(trackData.name, trackData.artists[0].name);
}

async function fetchLyrics(title, artist) {
    // Implement lyrics fetching from your preferred lyrics API
    document.getElementById('lyrics').textContent = 'Loading lyrics...';
    try {
        // Replace with your lyrics API call
        const lyrics = await fetchLyricsFromAPI(title, artist);
        document.getElementById('lyrics').textContent = lyrics || 'Lyrics not available';
    } catch (error) {
        document.getElementById('lyrics').textContent = 'Lyrics not available';
    }
}

// Listen for track changes in your player
function onTrackChange(track) {
    if (track) {
        onTrackPlay(track.id);
    }
}

// Test the functionality
async function testSpotifyAPI() {
    try {
        // Search for a track
        await searchTrack('Bohemian Rhapsody');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testSpotifyAPI();
