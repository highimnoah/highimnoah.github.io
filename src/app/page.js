"use client";

import { useState, useEffect, useRef } from "react";
import "./font.css"
import Head from "next/head";
import AnimatedContent from "../../components/AnimatedContent";
import "./OnlineStatus.css";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState("https://cdn.discordapp.com/avatars/619810098465734666/9ce1bc5c251c401107a6b2c0b43981f6.png");
  const [statusClass, setStatusClass] = useState("status-offline");
  const [statusText, setStatusText] = useState("");
  const [activityText, setActivityText] = useState("—");
  const [musicData, setMusicData] = useState(undefined);
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");

  const socketRef = useRef(null);

  const userId = "619810098465734666";

  const statusColors = {
    online: "status-online",
    idle: "status-idle",
    dnd: "status-dnd",
    offline: "status-offline",
  };

  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!musicData?.start || !musicData?.end) return;

    const updateProgress = () => {
      const now = Date.now();
      const total = musicData.end - musicData.start;
      const passed = now - musicData.start;
      setProgress(Math.min(passed / total, 1));
      setElapsed(Math.min(passed, total));
      setDuration(total);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [musicData]);

  useEffect(() => {
    const socket = new WebSocket("wss://api.lanyard.rest/socket");
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          op: 2,
          d: { subscribe_to_ids: [userId] },
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.t || !data.d) return;

      let presence = null;
      if (data.t === "INIT_STATE") presence = data.d[userId];
      else if (data.t === "PRESENCE_UPDATE") presence = data.d;
      else return;

      if (!presence?.discord_user) return;

      const user = presence.discord_user;
      setAvatarUrl(
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      );
      setFaviconUrl(
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      );
      setUsername(user.username);

      const discordStatus = presence.discord_status || "offline";
      setStatusClass(`status-icon ${statusColors[discordStatus] || ""}`);
      setStatusText(
        discordStatus.charAt(0).toUpperCase() + discordStatus.slice(1)
      );

      const currentActivity = presence.activities?.find(
        (act) => act.name && act.name !== "Custom Status"
      );
      setActivityText(currentActivity ? currentActivity.name : "—");

      const applemusicActivity = presence.activities?.find(
        (act) => act.type === 2 && act.name === "Apple Music"
      );

      if (applemusicActivity) {
        const song = applemusicActivity.details;
        const artistFull = applemusicActivity.state;
        let artist = artistFull;
        let album = "";
        const parts = artistFull?.split(" — ");
        if (parts?.length >= 2) {
          artist = parts[0];
          album = parts.slice(1).join(" — ");
        }

        let albumArtUrl = "";
        if (applemusicActivity.assets?.large_image) {
          let rawImageUrl = applemusicActivity.assets.large_image;
          const indicator = "/https/";
          const idx = rawImageUrl.indexOf(indicator);
          if (idx !== -1)
            albumArtUrl = "https://" + rawImageUrl.substring(idx + 7);
          else if (rawImageUrl.startsWith("https://")) albumArtUrl = rawImageUrl;
        }

        const start = applemusicActivity.timestamps?.start;
        const end = applemusicActivity.timestamps?.end;

        if (song && artist) {
          setMusicData({ song, artist, album, albumArtUrl, start, end });
        }
      } else {
        setMusicData(null);
      }
    };

    const heartbeat = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ op: 3 }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      socketRef.current?.close();
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href={faviconUrl} />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 w-full max-w-3xl">
          {/* User Card */}
          <AnimatedContent distance={30} direction="vertical" duration={1}>
            <div className="flex flex-col items-center justify-center gap-2 text-center p-4 rounded-xl bg-gray-800/50 shadow-md min-w-[200px] max-w-[220px] flex-1 h-full">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 shadow-md"
              />
              <h1 className="text-xl font-semibold">{username}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={statusClass}></span>
                <span>{statusText}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{activityText}</p>
            </div>
          </AnimatedContent>

          {/* Music Section */}
          <AnimatedContent distance={30} direction="vertical" duration={1}>
            <section className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-gray-800/50 shadow-md min-w-[200px] max-w-[220px] flex-1 h-full min-h-[280px]">
              {musicData === undefined ? (
                <p className="text-sm text-gray-400">Fetching data...</p>
              ) : musicData ? (
                <>
                  {musicData.albumArtUrl && (
                    <img
                      src={musicData.albumArtUrl}
                      className="rounded-xl w-32 h-32 border-2"
                      alt={musicData.album || "Album Art"}
                    />
                  )}
                  <div className="text-center">
                    <h2 className="text-md font-semibold text-white">{musicData.song}</h2>
                    {musicData.album && (
                      <p className="text-sm text-gray-400">{musicData.album}</p>
                    )}
                    <p className="text-sm text-gray-400">{musicData.artist}</p>
                  </div>
                  {musicData.start && musicData.end && (
                    <div className="w-full flex flex-col mt-2">
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-gray-500">{formatTime(elapsed)}</span>
                        <div className="flex-1 bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center">Not listening to anything right now</p>
              )}
            </section>
          </AnimatedContent>
        </div>

        <AnimatedContent distance={30} direction="vertical" duration={1}>
          <div className="flex gap-3 mt-6">
            <a
              href="https://www.youtube.com/@opiategalore?sub_confirmation=1"
              target="_blank"
              className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm"
            >
              YouTube
            </a>
            <a
              href="https://twitter.com/ctgadse"
              target="_blank"
              className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Twitter
            </a>
            <Link
              href="https://pixeldrain.com/d/RDrPaMcL"
              target="_blank"
              className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm"
            >
              Archive
            </Link>
          </div>
        </AnimatedContent>
      </main>
    </>
  );
}
