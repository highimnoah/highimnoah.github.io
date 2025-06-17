(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))d(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&d(s)}).observe(document,{childList:!0,subtree:!0});function i(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function d(t){if(t.ep)return;t.ep=!0;const e=i(t);fetch(t.href,e)}})();function M(){const u=document.getElementById("favicon"),a="619810098465734666",i=document.getElementById("avatar"),d=document.getElementById("username"),t=document.getElementById("status-icon"),e=document.getElementById("status-text"),s=document.getElementById("activity"),$=document.querySelector(".user-card"),y=document.getElementById("music-container");let n=null;const I={online:"status-online",idle:"status-idle",dnd:"status-dnd",offline:"status-offline"},m=new WebSocket("wss://api.lanyard.rest/socket");m.onopen=()=>{m.send(JSON.stringify({op:2,d:{subscribe_to_ids:[a]}}))},m.onmessage=w=>{const c=JSON.parse(w.data);if(!c.t||!c.d)return;if(c.t==="INIT_STATE")n=c.d[a];else if(c.t==="PRESENCE_UPDATE")n=c.d;else return;if(!n||!n.discord_user){d.textContent="User data not found",t.className="status-icon",e.textContent="",s.textContent="No activity data available",i.src="https://cdn.discordapp.com/avatars/619810098465734666/0481ff1a167a987fa41790d3079ed7d7.webp?size=80",b();return}const p=n.discord_user;i.src=`https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`,u.href=`https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`,d.textContent=p.username;let h=n.discord_status||"offline";if(t.className="status-icon",I[h]?t.classList.add(I[h]):t.style.backgroundColor="gray",e.textContent=h.charAt(0).toUpperCase()+h.slice(1),n.activities&&n.activities.length>0){const r=n.activities.find(o=>o.name&&o.name!=="Custom Status");s.textContent=r?`Activity: ${r.name}`:"No activity data available."}else s.textContent="No activity data available.";let E=!1;if(n.activities&&n.activities.length>0){const r=n.activities.find(o=>o.type===2&&o.name==="Apple Music");if(r){const o=r.details,C=r.state;let f=C,l="";const L=C.split(" — ");L.length>=2&&(f=L[0],l=L.slice(1).join(" — "));let v="";if(r.assets&&r.assets.large_image){let g=r.assets.large_image;const T="/https/",k=g.indexOf(T);k!==-1?v="https://"+g.substring(k+T.length):g.startsWith("https://")?v=g:(console.warn("Could not find a valid HTTP(S) URL in large_image:",g),v="")}o&&f&&v?(y.innerHTML=`<div class="track">
                        <img src="${v}" class="album-art" alt="${l||"Album Art"}">
                        <div class="track-name">${o}</div>
                        ${l?`<div class="track-album">${l}</div>`:""}
                        <div class="track-artist">${f}</div>
                    </div>`,E=!0):o&&f&&(y.innerHTML=`<div class="track">
                        <p>Album art not available.</p>
                        <div class="track-name">${o}</div>
                        ${l?`<div class="track-album">${l}</div>`:""}
                        <div class="track-artist">${f}</div>
                    </div>`,E=!0)}E||(y.innerHTML="<p>Not listening to music right now.</p>")}},setInterval(()=>{m.readyState===WebSocket.OPEN&&m.send(JSON.stringify({op:3}))},3e4);function b(){const w=$.offsetHeight,c=Math.max(w-42.5,100);y.style.height=`${c}px`}window.addEventListener("resize",b),window.addEventListener("DOMContentLoaded",b)}function x(){const u=document.getElementById("youtube"),a=document.getElementById("twitter"),i=document.getElementById("mega");u.addEventListener("click",()=>{window.open("https://www.youtube.com/@opiategalore?sub_confirmation=1","_blank")}),a.addEventListener("click",()=>{window.open("https://twitter.com/ctgadse","_blank")}),i.addEventListener("click",()=>{window.open("https://mega.nz/folder/XCx22aYZ#IZykt57yG1StXceL8XqlUQ","_blank")})}function A(){const u="UCLOxpFqdyAab5eCWtHWZ-Zg",a="AIzaSyBt_Yeacmt8K41HZMXGF6K_isMv_eM14mg",i=document.getElementById("youtube-embed-container");if(!i){console.error("Container element not found.");return}const d=`https://www.googleapis.com/youtube/v3/search?key=${a}&channelId=${u}&part=snippet,id&order=date&maxResults=1&type=video`;fetch(d).then(t=>t.ok?t.json():t.json().then(e=>{throw new Error(`HTTP error! Status: ${t.status}, Message: ${e.error.message}`)})).then(t=>{if(t.items&&t.items.length>0){const e=t.items[0].id.videoId;if(e){const s=document.createElement("iframe");s.width="640px",s.height="360px",s.src=`https://www.youtube.com/embed/${e}?autoplay=0&controls=1&rel=0`,s.title="YouTube Video Player",s.frameBorder="0",s.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",s.allowFullscreen=!0,i.innerHTML="",i.appendChild(s)}else i.innerHTML="<p>No video ID found for the latest upload.</p>"}else i.innerHTML="<p>No videos found on this channel, or an issue occurred with the API response.</p>"}).catch(t=>{console.error("Error fetching YouTube video:",t),i.innerHTML=`<p>Failed to load the latest video. Error: ${t.message}</p>`})}document.querySelector("#app").innerHTML=`
  <div class="main-content-wrapper">
        <section>
            <div class="user-card">
                <div class="user-main-info">
                    <img src="/placeholder.png" alt="Avatar" id="avatar" class="avatar">
                    <div class="user-details">
                        <div class="user-info">
                            <span id="username">Loading...</span>
                        </div>
                        <div class="user-status" id="user-status">
                            <span class="status-icon status-offline" id="status-icon"></span>
                            <span id="status-text"></span>
                        </div>
                        <p id="activity">Activity: —</p>
                    </div>
                </div>
                <div class="social-links">
                    <img src="/youtube.png" alt="YouTube" class="link-logo" id="youtube" title="YouTube">
                    <img src="/twitter.png" alt="Twitter" class="link-logo" id="twitter" title="Twitter">
                    <img src="/mega.png" alt="Mega" class="link-logo" id="mega" title="Mega">
                </div>
            </div>
        </section>
        <section>
            <div class="user-card" style="width: fit-content;" id="music-container">
                <p>Loading music data...</p>
            </div>
        </section>
    </div>
    <br>
    <section>
        <div class="user-card" style="width: fit-content;" id="youtube-embed-container">
            <p>Loading latest video...</p>
        </div>
    </section>
`;document.addEventListener("DOMContentLoaded",()=>{M(),x(),A()});
