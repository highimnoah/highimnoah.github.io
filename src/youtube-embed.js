export function createYouTubeEmbed() {
    const youtubeChannelId = "UCLOxpFqdyAab5eCWtHWZ-Zg";
    const youtubeApiKey = "AIzaSyBt_Yeacmt8K41HZMXGF6K_isMv_eM14mg";

    const container = document.getElementById("youtube-embed-container");

    if (!container) {
        console.error("Container element not found.");
        return;
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&channelId=${youtubeChannelId}&part=snippet,id&order=date&maxResults=1&type=video`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.error.message}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                if (videoId) {
                    const iframe = document.createElement("iframe");
                    iframe.width = "640px";
                    iframe.height = "360px";
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`;
                    iframe.title = "YouTube Video Player";
                    iframe.frameBorder = "0";
                    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                    iframe.allowFullscreen = true;

                    container.innerHTML = "";
                    container.appendChild(iframe);
                }
                else {
                    container.innerHTML = "<p>No video ID found for the latest upload.</p>";
                }
            }
            else {
                container.innerHTML = "<p>No videos found on this channel, or an issue occurred with the API response.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching YouTube video:", error);
            container.innerHTML = `<p>Failed to load the latest video. Error: ${error.message}</p>`
        });
}