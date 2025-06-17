export function getActivity() {
    const favicon = document.getElementById("favicon");
    const userId = "619810098465734666";
    const avatar = document.getElementById("avatar");
    const username = document.getElementById("username");
    const statusIcon = document.getElementById("status-icon");
    const statusText = document.getElementById("status-text");
    const activity = document.getElementById("activity");
    const mainUserCard = document.querySelector(".user-card"); // Select the first user-card
    const musicContainer = document.getElementById("music-container");

    let presence = null;

    const statusColors = {
        online: "status-online",
        idle: "status-idle",
        dnd: "status-dnd",
        offline: "status-offline"
    };

    const socket = new WebSocket("wss://api.lanyard.rest/socket");

    socket.onopen = () => {
        socket.send(
            JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_ids: [userId]
                }
            })
        );
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (!data.t || !data.d) return;

        if (data.t === "INIT_STATE") {
            presence = data.d[userId];
        }
        else if (data.t === "PRESENCE_UPDATE") {
            presence = data.d;
        }
        else return;

        if (!presence || !presence.discord_user) {
            username.textContent = "User data not found";
            statusIcon.className = "status-icon";
            statusText.textContent = "";
            activity.textContent = "No activity data available";
            avatar.src = "https://cdn.discordapp.com/avatars/619810098465734666/0481ff1a167a987fa41790d3079ed7d7.webp?size=80";
            adjustMusicContainerHeight(); // Call after content update
            return;
        }

        const user = presence.discord_user;
        avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        favicon.href = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        username.textContent = user.username;

        let discordStatus = presence.discord_status || "offline";

        statusIcon.className = "status-icon";

        if (statusColors[discordStatus]) {
            statusIcon.classList.add(statusColors[discordStatus]);
        }
        else {
            statusIcon.style.backgroundColor = "gray";
        }

        statusText.textContent = discordStatus.charAt(0).toUpperCase() + discordStatus.slice(1);

        if (presence.activities && presence.activities.length > 0) {
            const currentActivity = presence.activities.find(
                (act) => act.name && act.name !== "Custom Status"
            );
            activity.textContent = currentActivity
                ? `Activity: ${currentActivity.name}`
                : "No activity data available.";
        }
        else {
            activity.textContent = "No activity data available.";
        }

        let musicDataFound = false;
        if (presence.activities && presence.activities.length > 0) {
            const applemusicActivity = presence.activities.find(
                (act) => act.type === 2 && act.name === "Apple Music"
            );

            if (applemusicActivity) {
                const song = applemusicActivity.details;
                const artistFull = applemusicActivity.state;

                let artist = artistFull;
                let album = "";
                const parts = artistFull.split(" — ");
                if (parts.length >= 2) {
                    artist = parts[0];
                    album = parts.slice(1).join(" — ");
                }

                let albumArtUrl = "";

                if (applemusicActivity.assets && applemusicActivity.assets.large_image) {
                    let rawImageUrl = applemusicActivity.assets.large_image;
                    // console.log("Raw image URL from Lanyard:", rawImageUrl);

                    const indicator = "/https/";
                    const indicatorIndex = rawImageUrl.indexOf(indicator);

                    if (indicatorIndex !== -1) {
                        const urlSegment = rawImageUrl.substring(indicatorIndex + indicator.length);
                        albumArtUrl = "https://" + urlSegment;
                    }
                    else if (rawImageUrl.startsWith("https://")) {
                        albumArtUrl = rawImageUrl;
                    }
                    else {
                        console.warn("Could not find a valid HTTP(S) URL in large_image:", rawImageUrl);
                        albumArtUrl = "";
                    }
                }

                if (song && artist && albumArtUrl) {
                    musicContainer.innerHTML =
                        `<div class="track">
                        <img src="${albumArtUrl}" class="album-art" alt="${album ? album : 'Album Art'}">
                        <div class="track-name">${song}</div>
                        ${album ? `<div class="track-album">${album}</div>` : ""}
                        <div class="track-artist">${artist}</div>
                    </div>`;
                    musicDataFound = true;
                }
                else if (song && artist) {
                    musicContainer.innerHTML =
                        `<div class="track">
                        <p>Album art not available.</p>
                        <div class="track-name">${song}</div>
                        ${album ? `<div class="track-album">${album}</div>` : ""}
                        <div class="track-artist">${artist}</div>
                    </div>`;
                    musicDataFound = true;
                }
            }

            if (!musicDataFound) {
                musicContainer.innerHTML = `<p>Not listening to music right now.</p>`;
            }
        }
    };

    setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ op: 3 }));
        }
    }, 30000);

    function adjustMusicContainerHeight() {
        const userCardHeight = mainUserCard.offsetHeight;
        const musicContainerHeight = Math.max(userCardHeight - 42.5, 100); // Ensure a minimum height of 100px
        musicContainer.style.height = `${musicContainerHeight}px`;
    }

    window.addEventListener("resize", adjustMusicContainerHeight);
    window.addEventListener("DOMContentLoaded", adjustMusicContainerHeight);
}