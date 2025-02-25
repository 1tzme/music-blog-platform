require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET);

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const getSpotifyToken = async () => {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        console.log('Spotify token response:', data.body);
        spotifyApi.setAccessToken(data.body['access_token']);
    } catch (error) {
        console.error('Spotify auth error:', error);
        throw new Error('Failed to get Spotify token: ' + error.message);
    }
};

const getSpotifyData = async (url) => {
    try {
        await getSpotifyToken();
        const id = url.split('/').pop().split('?')[0];
        const type = url.includes('track') ? 'track' : url.includes('album') ? 'album' : url.includes('playlist') ? 'playlist' : null;

        if (!type) throw new Error('Invalid Spotify URL');

        if (type === 'track') {
            const track = await spotifyApi.getTrack(id);
            return {
                name: track.body.name,
                artist: track.body.artists[0].name,
                image: track.body.album.images[0]?.url,
                url
            };
        } else if (type === 'album') {
            const album = await spotifyApi.getAlbum(id);
            return {
                name: album.body.name,
                artist: album.body.artists[0].name,
                image: album.body.images[0]?.url,
                url
            };
        } else if (type === 'playlist') {
            const playlist = await spotifyApi.getPlaylist(id);
            return {
                name: playlist.body.name,
                artist: playlist.body.owner.display_name,
                image: playlist.body.images[0]?.url,
                url
            };
        }
    } catch (error) {
        throw new Error('Failed to fetch Spotify data: ' + error.message);
    }
};

module.exports = { getSpotifyData };