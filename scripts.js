const token = 'BQD2HWw940__tSX5ytW8mLkZUjTxGjvLsltsYKnCXUU-lQQ2PYDYrs1uCO4b5tBD6lXxzu5uv8ODzixugug0akmr05nBNpkdmXwQWA5e1MvV6mAj6Eqel-lm-77eKTwWR-myBVoXnkffy3VAPoXrCBPLg8szq7C0rDCckPTs5-Pg9qY6-vRLYNVmD2HsNtBNUr2sdaBltpkUOBSmp1ARjvyEAA'; // Ganti dengan token akses pengguna Spotify
let currentTrackIndex = -1; // Menyimpan indeks lagu saat ini
let player; // Pemutar Spotify
let deviceId; // ID perangkat Spotify
let isPlaying = false; // Menyimpan status pemutar

// Inisialisasi Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
        name: 'Stereonism Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    // Siapkan event listeners
    player.addListener('ready', ({ device_id }) => {
        deviceId = device_id;
        console.log('Ready with Device ID', device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', state => {
        if (!state) return;
        const playPauseIcon = document.getElementById(`playPauseIcon-${currentTrackIndex}`);
        isPlaying = !state.paused;
        playPauseIcon.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9658;';

        // Update slider
        const seekSlider = document.getElementById(`seekSlider-${currentTrackIndex}`);
        if (seekSlider) {
            seekSlider.max = state.duration; // Set max to track duration
            setInterval(() => {
                seekSlider.value = state.position; // Update slider value to current position
            }, 1000); // Update every second
        }
    });

    player.connect();
};

async function playTrack(uri, index) {
    currentTrackIndex = index; // Simpan indeks track saat ini
    const playUrl = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    await fetch(playUrl, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
}

function playPauseAudio(index, uri) {
    if (currentTrackIndex === index && isPlaying) {
        player.pause();
    } else if (currentTrackIndex === index && !isPlaying) {
        player.resume();
    } else {
        playTrack(uri, index);
    }
}

async function searchTracks(query) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    const response = await fetch(searchUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    const tracks = data.tracks.items;
    loadSearchResults(tracks);
}

function loadSearchResults(tracks) {
    const container = document.getElementById('playlist-container');
    container.innerHTML = ''; // Bersihkan konten sebelumnya

    tracks.forEach((track, index) => {
        const trackUri = track.uri;
        const duration = formatDuration(track.duration_ms); // Format durasi

        const searchResult = `
            <div class="playlist-item">
                <img src="${track.album.images[0].url}" alt="${track.name}">
                <h3>${track.name}</h3>
                <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                <p>Duration: ${duration}</p>
                <div class="controls">
                    <span class="icon" id="backwardIcon" onclick="seekBackward()">&#9664;&#9664;</span> <!-- Backward icon -->
                    <span class="icon" id="playPauseIcon-${index}" onclick="playPauseAudio(${index}, '${trackUri}')">&#9658;</span> <!-- Play/Pause icon -->
                    <span class="icon" id="forwardIcon" onclick="seekForward()">&#9654;&#9654;</span> <!-- Forward icon -->
                </div>
                <input type="range" id="seekSlider-${index}" class="slider" min="0" max="${track.duration_ms}" value="0" step="1" />
            </div>
        `;
        container.innerHTML += searchResult;

        // Set up the slider functionality
        const seekSlider = document.getElementById(`seekSlider-${index}`);
        seekSlider.addEventListener('input', function() {
            const position = (this.value / this.max) * track.duration_ms;
            player.seek(position);
        });
    });
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function seekBackward() {
    if (player) {
        player.getCurrentState().then(state => {
            if (state) {
                player.seek(Math.max(0, state.position - 10000)); // Move back 10 seconds
            }
        });
    }
}

function seekForward() {
    if (player) {
        player.getCurrentState().then(state => {
            if (state) {
                player.seek(Math.min(state.duration, state.position + 10000)); // Move forward 10 seconds
            }
        });
    }
}

// Event listener for search form submission
document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput').value;
    searchTracks(searchInput);
});
