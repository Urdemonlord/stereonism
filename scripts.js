const playlistId = '3r1TosTnTfujrOVgnsxho7'; // Ganti dengan ID Playlist Anda
let currentTrackIndex = -1; // Menyimpan indeks lagu saat ini
let player; // Pemutar Spotify
let deviceId; // ID perangkat Spotify

// Inisialisasi Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQD2HWw940__tSX5ytW8mLkZUjTxGjvLsltsYKnCXUU-lQQ2PYDYrs1uCO4b5tBD6lXxzu5uv8ODzixugug0akmr05nBNpkdmXwQWA5e1MvV6mAj6Eqel-lm-77eKTwWR-myBVoXnkffy3VAPoXrCBPLg8szq7C0rDCckPTs5-Pg9qY6-vRLYNVmD2HsNtBNUr2sdaBltpkUOBSmp1ARjvyEAA'; // Ganti dengan token akses pengguna Spotify

    player = new Spotify.Player({
        name: 'Stereonism Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    // Siapkan event listeners
    player.addListener('ready', ({ device_id }) => {
        deviceId = device_id;
        console.log('Ready with Device ID', device_id);
        fetchPlaylist(playlistId); // Ambil daftar putar saat pemutar siap
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', state => {
        if (!state) return;
        const playPauseIcon = document.getElementById(`playPauseIcon-${currentTrackIndex}`);
        if (state.paused) {
            playPauseIcon.innerHTML = '&#9658;'; // Ubah ikon ke play jika dijeda
        } else {
            playPauseIcon.innerHTML = '&#10074;&#10074;'; // Ubah ikon ke pause jika diputar
        }
    });

    player.connect();
};

async function playTrack(uri) {
    const playUrl = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    await fetch(playUrl, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${'BQD2HWw940__tSX5ytW8mLkZUjTxGjvLsltsYKnCXUU-lQQ2PYDYrs1uCO4b5tBD6lXxzu5uv8ODzixugug0akmr05nBNpkdmXwQWA5e1MvV6mAj6Eqel-lm-77eKTwWR-myBVoXnkffy3VAPoXrCBPLg8szq7C0rDCckPTs5-Pg9qY6-vRLYNVmD2HsNtBNUr2sdaBltpkUOBSmp1ARjvyEAA'}` // Ganti dengan access token
        }
    });
}

async function fetchPlaylist(playlistId) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': 'Bearer ' + 'BQD2HWw940__tSX5ytW8mLkZUjTxGjvLsltsYKnCXUU-lQQ2PYDYrs1uCO4b5tBD6lXxzu5uv8ODzixugug0akmr05nBNpkdmXwQWA5e1MvV6mAj6Eqel-lm-77eKTwWR-myBVoXnkffy3VAPoXrCBPLg8szq7C0rDCckPTs5-Pg9qY6-vRLYNVmD2HsNtBNUr2sdaBltpkUOBSmp1ARjvyEAA' // Ganti dengan access token
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
    container.innerHTML = ''; // Bersihkan konten sebelumnya

    tracks.forEach((track, index) => {
        const trackUri = track.track.uri; // URI track
        const duration = formatDuration(track.track.duration_ms); // Format durasi

        const playlistItem = `
            <div class="playlist-item">
                <img src="${track.track.album.images[0].url}" alt="${track.track.name}">
                <h3>${track.track.name}</h3>
                <p>${track.track.artists.map(artist => artist.name).join(', ')}</p>
                <p>Duration: ${duration}</p>
                <div class="controls">
                    <span class="icon" id="backwardIcon-${index}" onclick="backwardSong(${index})">&#9664;&#9664;</span>
                    <span class="icon" id="playPauseIcon-${index}" onclick="playPauseAudio(${index}, '${trackUri}')">&#9658;</span>
                    <span class="icon" id="forwardIcon-${index}" onclick="forwardSong(${index})">&#9654;&#9654;</span>
                </div>
            </div>
        `;
        container.innerHTML += playlistItem;
    });
}

function playPauseAudio(index, uri) {
    const playPauseIcon = document.getElementById(`playPauseIcon-${index}`);

    if (currentTrackIndex === index) {
        player.togglePlay().then(() => {
            console.log('Toggling play/pause');
        });
    } else {
        currentTrackIndex = index; // Simpan indeks lagu saat ini
        playTrack(uri);
    }
}

function forwardSong(index) {
    player.seek(10000).then(() => {
        console.log('Forwarded 10 seconds');
    }); // Lompat ke depan 10 detik
}

function backwardSong(index) {
    player.seek(0).then(() => {
        console.log('Rewinded to start');
    }); // Lompat ke belakang 10 detik atau kembali ke awal
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

window.onload = () => {
    fetchPlaylist(playlistId);
};
