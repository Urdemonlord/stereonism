const playlistId = '3r1TosTnTfujrOVgnsxho7'; // Ganti dengan ID Playlist Anda

let currentAudio = null; // Menyimpan referensi audio yang sedang diputar
let currentTrackIndex = -1; // Menyimpan indeks lagu saat ini
let tracks = []; // Menyimpan daftar lagu

async function getAccessToken() {
    const clientId = 'd6d692508c5841deb1ca000f8332667c';
    const clientSecret = '4f461e20d5314c2fb30758c885a4d749';

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch access token');
    }

    const data = await response.json();
    return data.access_token;
}

async function fetchPlaylist(playlistId) {
    try {
        const token = await getAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch playlist');
        }

        const data = await response.json();
        tracks = data.items; // Simpan daftar lagu
        loadPlaylist(tracks);
    } catch (error) {
        console.error('Error fetching playlist:', error);
    }
}

function loadPlaylist(tracks) {
    const container = document.getElementById('playlist-container');
    container.innerHTML = ''; // Clear previous content

    tracks.forEach((track, index) => {
        const audioUrl = track.track.preview_url; // Mendapatkan URL pratinjau
        if (!audioUrl) return; // Jika tidak ada URL pratinjau, lewati item ini

        const duration = formatDuration(track.track.duration_ms); // Format durasi

        const playlistItem = `
            <div class="playlist-item">
                <img src="${track.track.album.images[0].url}" alt="${track.track.name}">
                <h3>${track.track.name}</h3>
                <p>${track.track.artists.map(artist => artist.name).join(', ')}</p>
                <p>Duration: ${duration}</p>
                <audio class="audio" src="${audioUrl}"></audio>
                <div class="controls">
                    <span class="icon" id="backwardIcon-${index}" onclick="backwardSong(${index})">&#9664;&#9664;</span> <!-- Tombol Backward -->
                    <span class="icon" id="playPauseIcon-${index}" onclick="playPauseAudio(${index})">&#9658;</span> <!-- Tombol Play/Pause -->
                    <span class="icon" id="forwardIcon-${index}" onclick="forwardSong(${index})">&#9654;&#9654;</span> <!-- Tombol Forward -->
                    <input type="range" class="slider" id="slider-${index}" value="0" step="0.01" onchange="seekAudio(${index}, this.value)">
                </div>
            </div>
        `;
        container.innerHTML += playlistItem;
    });
}

function formatDuration(durationMs) {
    const minutes = Math.floor((durationMs / 60000) % 60);
    const seconds = Math.floor((durationMs / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`; // Format: mm:ss
}

function playPauseAudio(index) {
    const playPauseIcon = document.getElementById(`playPauseIcon-${index}`);
    const slider = document.getElementById(`slider-${index}`);
    
    // Jika audio sudah diputar sebelumnya, hentikan
    if (currentAudio && currentTrackIndex !== index) {
        currentAudio.pause(); // Hentikan audio yang sedang diputar
        document.getElementById(`playPauseIcon-${currentTrackIndex}`).innerHTML = '&#9658;'; // Set ikon sebelumnya ke play
    }

    if (currentTrackIndex === index && currentAudio) {
        // Jika lagu yang sama dipilih, toggle antara play dan pause
        if (currentAudio.paused) {
            currentAudio.play().catch(error => {
                console.error('Error trying to play audio:', error);
            });
            playPauseIcon.innerHTML = '&#10074;&#10074;'; // Ubah ikon ke pause
        } else {
            currentAudio.pause();
            playPauseIcon.innerHTML = '&#9658;'; // Ubah ikon ke play
        }
    } else {
        // Memilih lagu baru
        currentTrackIndex = index; // Set indeks lagu yang akan diputar
        currentAudio = new Audio(tracks[currentTrackIndex].track.preview_url);
        
        currentAudio.play().catch(error => {
            console.error('Error trying to play audio:', error);
        });
        playPauseIcon.innerHTML = '&#10074;&#10074;'; // Ubah ikon ke pause

        // Update slider saat audio dimainkan
        currentAudio.addEventListener('timeupdate', () => {
            if (currentAudio.duration > 0) {
                slider.value = currentAudio.currentTime / currentAudio.duration; // Update slider
            }
        });
        
        currentAudio.addEventListener('ended', () => {
            playPauseIcon.innerHTML = '&#9658;'; // Set ke play ketika lagu selesai
            slider.value = 0; // Reset slider
        });
    }
}

function seekAudio(index, value) {
    if (currentAudio) {
        const duration = currentAudio.duration;
        currentAudio.currentTime = value * duration; // Set waktu audio berdasarkan slider
    }
}

function forwardSong(index) {
    if (currentAudio) {
        currentAudio.currentTime = Math.min(currentAudio.currentTime + 10, currentAudio.duration); // Tambah 10 detik
    }
}

function backwardSong(index) {
    if (currentAudio) {
        currentAudio.currentTime = Math.max(currentAudio.currentTime - 10, 0); // Kurangi 10 detik
    }
}

window.onload = () => {
    fetchPlaylist(playlistId);
};
