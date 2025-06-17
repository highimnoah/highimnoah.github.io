import './styles.css';
import { getActivity } from './activity';
import { createLinks } from './links';
import { createYouTubeEmbed } from './youtube-embed';

document.querySelector('#app').innerHTML = `
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
`

document.addEventListener('DOMContentLoaded', () => {
  getActivity();
  createLinks();
  createYouTubeEmbed();
});