"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from "gsap";
import Head from 'next/head';
import AnimatedContent from "../../components/AnimatedContent";
import "./OnlineStatus.css"
import Image from 'next/image';

export default function Home() {
  const [username, setUsername] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState("https://cdn.discordapp.com/avatars/619810098465734666/0481ff1a167a987fa41790d3079ed7d7.webp?size=80");
  const [statusClass, setStatusClass] = useState("status-offline");
  const [statusText, setStatusText] = useState("");
  const [activityText, setActivityText] = useState("—");
  const [musicData, setMusicData] = useState(null);
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
  const [showMusicContainer, setShowMusicContainer] = useState(false);
  const [shouldRenderMusicContainer, setShouldRenderMusicContainer] = useState(false);

  const mainUserCardRef = useRef(null);
  const musicContainerRef = useRef(null);
  const musicContainerAnimRef = useRef(null);
  const socketRef = useRef(null);

  const userId = "619810098465734666";

  const statusColors = {
    online: "status-online",
    idle: "status-idle",
    dnd: "status-dnd",
    offline: "status-offline"
  };

  const adjustMusicContainerHeight = () => {
    if (mainUserCardRef.current && musicContainerRef.current) {
      const userCardHeight = mainUserCardRef.current.offsetHeight;
      musicContainerRef.current.style.height = `${userCardHeight}px`;
    }
  };

  useEffect(() => {
    const wrapper = musicContainerAnimRef.current;
    if (!wrapper) return;

    const duration = 1.2;
    const ease = "power3.out";

    if (showMusicContainer) {
      setShouldRenderMusicContainer(true);
      gsap.fromTo(
        wrapper,
        { height: 0, opacity: 0 },
        {
          height: 184,
          opacity: 1,
          duration,
          ease,
        }
      );
    } else {
      gsap.to(wrapper, {
        height: 0,
        opacity: 0,
        duration,
        ease,
        onComplete: () => {
          setShouldRenderMusicContainer(false);
        },
      });
    }
  }, [showMusicContainer]);

  useEffect(() => {
    const socket = new WebSocket("wss://api.lanyard.rest/socket");
    socketRef.current = socket;

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

      let presence = null;
      if (data.t === "INIT_STATE") {
        presence = data.d[userId];
      } else if (data.t === "PRESENCE_UPDATE") {
        presence = data.d;
      } else {
        return;
      }

      if (!presence || !presence.discord_user) {
        setUsername("User data not found");
        setStatusClass("status-offline");
        setStatusText("");
        setActivityText("No activity data available");
        setAvatarUrl("https://cdn.discordapp.com/avatars/619810098465734666/0481ff1a167a987fa41790d3079ed7d7.webp?size=80");
        setFaviconUrl("/avatar.png");
        setMusicData(null);
        return;
      }

      const user = presence.discord_user;
      setAvatarUrl(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`);
      setFaviconUrl(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`);
      setUsername(user.username);

      let discordStatus = presence.discord_status || "offline";
      let newStatusClass = "status-icon";
      if (statusColors[discordStatus]) {
        newStatusClass += ` ${statusColors[discordStatus]}`;
      }
      setStatusClass(newStatusClass);
      setStatusText(discordStatus.charAt(0).toUpperCase() + discordStatus.slice(1));

      if (presence.activities && presence.activities.length > 0) {
        const currentActivity = presence.activities.find(
          (act) => act.name && act.name !== "Custom Status"
        );
        setActivityText(
          currentActivity ? `${currentActivity.name}` : "No activity data available."
        );
      } else {
        setActivityText("No activity data available.");
      }

      let newMusicData = null;
      const applemusicActivity = presence.activities?.find(
        (act) => act.type === 2 && act.name === "Apple Music"
      );

      if (applemusicActivity) {
        const song = applemusicActivity.details;
        const artistFull = applemusicActivity.state;
        let artist = artistFull;
        let album = "";
        const parts = artistFull?.split(" — ");
        if (parts && parts.length >= 2) {
          artist = parts[0];
          album = parts.slice(1).join(" — ");
        }

        let albumArtUrl = "";
        if (applemusicActivity.assets?.large_image) {
          let rawImageUrl = applemusicActivity.assets.large_image;
          const indicator = "/https/";
          const indicatorIndex = rawImageUrl.indexOf(indicator);

          if (indicatorIndex !== -1) {
            const urlSegment = rawImageUrl.substring(indicatorIndex + indicator.length);
            albumArtUrl = "https://" + urlSegment;
          } else if (rawImageUrl.startsWith("https://")) {
            albumArtUrl = rawImageUrl;
          } else {
            console.warn("Could not find a valid HTTP(S) URL in large_image:", rawImageUrl);
          }
        }

        if (song && artist) {
          newMusicData = { song, artist, album, albumArtUrl };
        }
      }
      setMusicData(newMusicData);
      if (!newMusicData) {
        setShowMusicContainer(false);
      }
    };

    const heartbeatInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ op: 3 }));
      }
    }, 30000);

    window.addEventListener("resize", adjustMusicContainerHeight);

    const initialAdjustTimeout = setTimeout(adjustMusicContainerHeight, 0);

    return () => {
      clearInterval(heartbeatInterval);
      if (socketRef.current) {
        socketRef.current.close();
      }
      window.removeEventListener("resize", adjustMusicContainerHeight);
      clearTimeout(initialAdjustTimeout);
    };
  }, []);

  useEffect(() => {
    adjustMusicContainerHeight();
  }, [musicData, username]);

  return (
    <>
      <Head>
        <link rel="icon" href={faviconUrl} />
      </Head>
      <div className="font-[family-name:var(--font-geist-sans)] antialiased">
        <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen">
          <div className="flex gap-4 items-center justify-center flex-col">
            <AnimatedContent
              distance={50}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.4}
            >
              <div className="flex flex-col gap-5 items-center justify-center text-center">
                <section>
                  <div ref={mainUserCardRef} className="flex w-fit">
                    <div className="flex flex-col items-center">
                      <img src={avatarUrl} alt="Avatar" id="avatar" className="rounded-full m-0 mb-2 border-2"/>
                      <div>
                        <div>
                          <span id="username">{username}</span>
                        </div>
                        <div id="user-status">
                          <span id="status-icon" className={statusClass}></span>
                          <span id="status-text">{statusText}</span>
                        </div>
                        <p
                          id="activity"
                          className={activityText === "Apple Music" ? "cursor-pointer hover:underline hover:scale-105 transition-transform duration-300 ease-out" : ""}
                          onClick={() => {
                            if (activityText === "Apple Music") {
                              setShowMusicContainer((prev) => !prev);
                            }
                          }}
                        >
                          {activityText}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
                <section
                  id="music-wrapper"
                  ref={musicContainerAnimRef}
                  style={{ overflow: "hidden", height: "fit-content" }}
                >
                  {shouldRenderMusicContainer && (
                    <section>
                      <div
                        id="music-container"
                        className="flex w-fit"
                      >
                        {musicData ? (
                          <div className="flex flex-col items-center h-fit">
                            {musicData.albumArtUrl && (
                              <img
                                src={musicData.albumArtUrl}
                                className="rounded-2xl m-0 mb-2 border-2"
                                alt={musicData.album ? musicData.album : 'Album Art'}
                              />
                            )}
                            {!musicData.albumArtUrl && <p>Album art not available.</p>}
                            <div>{musicData.song}</div>
                            {musicData.album && <div>{musicData.album}</div>}
                            <div>{musicData.artist}</div>
                          </div>
                        ) : (
                          <p>...</p>
                        )}
                      </div>
                    </section>
                  )}
                </section>
              </div>
            </AnimatedContent>

            <AnimatedContent
              distance={50}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.3}
            >
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-12 px-4 w-20 sm:w-25 sm:scale-100 scale-120 sm:m-0 m-1"
                href="https://www.youtube.com/@opiategalore?sub_confirmation=1"
                target="_blank"
              >
                YouTube
              </a>
            </AnimatedContent>

            <AnimatedContent
              distance={50}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.35}
            >
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-12 px-4 w-20 sm:w-25 sm:scale-100 scale-120 sm:m-0 m-1"
                href="https://twitter.com/ctgadse"
                target="_blank"
              >
                Twitter
              </a>
            </AnimatedContent>

            <AnimatedContent
              distance={50}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.4}
            >
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-12 px-4 w-20 sm:w-25 sm:scale-100 scale-120 sm:m-0 sm:mb-2 m-1"
                href="https://pixeldrain.com/d/RDrPaMcL"
                target="_blank"
              >
                Archive
              </a>
            </AnimatedContent>

            <AnimatedContent
              distance={50}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.2}
              delay={0.4}
            >

            </AnimatedContent>
          </div>
        </main>
      </div>
    </>
  );
}