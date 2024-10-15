const playlistId = 'YOUR_PLAYLIST_ID'; // Ganti dengan ID Playlist Anda

async function getAccessToken() {
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function fetchPlaylist(playlistId) {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    const data = await response.json();
    loadPlaylist(data.items);
}

function loadPlaylist(videos) {
    const container = document.getElementById('playlist-container');
    videos.forEach((video) => {
        const playlistItem = `
            <div class="playlist-item">
                <img src="${video.track.album.images[0].url}" alt="${video.track.name}">
                <h3>${video.track.name}</h3>
                <p>${video.track.artists.map(artist => artist.name).join(', ')}</p>
                <a href="${video.track.external_urls.spotify}" target="_blank">Listen on Spotify</a>
            </div>
        `;
        container.innerHTML += playlistItem;
    });
}

window.onload = () => {
    fetchPlaylist(playlistId);
};
