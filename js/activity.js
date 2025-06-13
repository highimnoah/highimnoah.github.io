const userId = "619810098465734666";
const avatar = document.getElementById("avatar");
const username = document.getElementById("username");
const statusIcon = document.getElementById("status-icon");
const statusText = document.getElementById("status-text");
const activity = document.getElementById("activity");

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
        return;
    }

    const user = presence.discord_user;
    avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
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
            : "No activity data available";
    }
    else {
        activity.textContent = "No activity data available";
    }
};

const youtube = document.getElementById("youtube");
const twitter = document.getElementById("twitter");
const mega = document.getElementById("mega");

youtube.addEventListener("click", () => {
    window.open("https://www.youtube.com/@opiategalore?sub_confirmation=1", "_blank");
});

twitter.addEventListener("click", () => {
    window.open("https://twitter.com/ctgadse", "_blank");
});

mega.addEventListener("click", () => {
    window.open("https://mega.nz/folder/XCx22aYZ#IZykt57yG1StXceL8XqlUQ", "_blank");
});