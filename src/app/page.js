"use client";

import { useState, useEffect, useRef } from "react";
import "./font.css";
import Head from "next/head";
import AnimatedContent from "../../components/AnimatedContent";
import "./OnlineStatus.css";
import Link from "next/link";
import Starfield from "../../components/Starfield";

export default function Home() {
  const [username, setUsername] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.png");
  const [statusClass, setStatusClass] = useState("status-offline");
  const [statusText, setStatusText] = useState("");
  const [activityText, setActivityText] = useState("—");

  const [rawStatus, setRawStatus] = useState("offline");
  const [activityName, setActivityName] = useState("");
  const [activityImageUrl, setActivityImageUrl] = useState("");

  const [musicData, setMusicData] = useState(undefined);

  const formatForLastfm = (text) => {
    return text.replace(/\s+/g, "+");
  };

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

  const activityTitleToFilename = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const buildLocalIconPath = (title) => {
    const slug = activityTitleToFilename(title);
    if (!slug) return "";
    return `/presence-icons/${slug}.webp`;
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

      if (!presence || !presence.discord_user) return;

      const user = presence.discord_user;
      setAvatarUrl(
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      );
      setUsername(user.username);

      const discordStatus = presence.discord_status || "offline";
      setRawStatus(discordStatus);
      setStatusClass(`status-icon ${statusColors[discordStatus] || ""}`);
      setStatusText(
        discordStatus.charAt(0).toUpperCase() + discordStatus.slice(1)
      );

      const activities = presence.activities || [];

      const nonCustomActivities = activities.filter(
        (act) =>
          act &&
          act.name &&
          act.name !== "Custom Status" &&
          act.type !== 4
      );

      let preferredActivity = null;
      for (const act of nonCustomActivities) {
        if (
          !preferredActivity ||
          (typeof act.type === "number" &&
            act.type < (preferredActivity.type != null ? preferredActivity.type : Number.POSITIVE_INFINITY))
        ) {
          preferredActivity = act;
        }
      }

      setActivityText(preferredActivity ? preferredActivity.name : "—");

      if (preferredActivity) {
        const name = preferredActivity.name || "";
        setActivityName(name);

        let imgUrl = "";

        if (name === "Apple Music") {
          imgUrl = buildLocalIconPath(name);
        } else {
          let assetKey =
            (preferredActivity.assets && preferredActivity.assets.large_image) || "";

          if (assetKey) {
            const indicator = "/https/";
            const idx = assetKey.indexOf(indicator);

            if (idx !== -1) {
              imgUrl = "https://" + assetKey.substring(idx + indicator.length);
            } else if (assetKey.startsWith("https://")) {
              imgUrl = assetKey;
            } else if (preferredActivity.application_id) {
              imgUrl =
                "https://cdn.discordapp.com/app-assets/" +
                preferredActivity.application_id +
                "/" +
                assetKey +
                ".png";
            }
          }

          if (!imgUrl && name) {
            imgUrl = buildLocalIconPath(name);
          }
        }

        setActivityImageUrl(imgUrl || "");
      } else {
        setActivityName("");
        setActivityImageUrl("");
      }

      const applemusicActivity = activities.find(
        (act) =>
          act &&
          ((act.type === 2 && act.name === "Apple Music") ||
            act.name === "Windows Media Player" ||
            act.name === "Cider")
      );

      if (applemusicActivity) {
        const song = applemusicActivity.details;
        let artist = "";
        let album = "";

        if (applemusicActivity.state && applemusicActivity.state.includes("—")) {
          const artistFull = applemusicActivity.state;
          const parts = artistFull.split("—");
          if (parts.length >= 2) {
            artist = parts[0].trim();
            album = parts.slice(1).join("—").trim();
          }
        } else {
          artist = applemusicActivity.state;
          album =
            (applemusicActivity.assets &&
              applemusicActivity.assets.large_text) ||
            "";
        }

        let albumArtUrl = "";
        if (applemusicActivity.assets && applemusicActivity.assets.large_image) {
          var rawImageUrl = applemusicActivity.assets.large_image;
          var indicator2 = "/https/";
          var idx2 = rawImageUrl.indexOf(indicator2);
          if (idx2 !== -1)
            albumArtUrl = "https://" + rawImageUrl.substring(idx2 + 7);
          else if (rawImageUrl.startsWith("https://"))
            albumArtUrl = rawImageUrl;
        }

        const start =
          applemusicActivity.timestamps &&
          applemusicActivity.timestamps.start;
        const end =
          applemusicActivity.timestamps && applemusicActivity.timestamps.end;

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
      <Starfield />

      <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-950 via-slate-900 to-zinc-950 text-slate-100 px-3 sm:px-6">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_#020617)]" />

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 w-full max-w-4xl">
          <AnimatedContent distance={20} direction="vertical" duration={0.9}>
            <header className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-emerald-700/70 shadow-md shadow-emerald-900/40 object-cover"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                    {username}
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mt-1">
                    <span className={statusClass}></span>
                    <span className="uppercase tracking-wide text-[11px] sm:text-xs text-emerald-200/80">
                      {statusText || "Offline"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400/80">
                    {activityText === "—" ? "No current activity" : activityText}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <a
                  href="https://www.youtube.com/@iidontnoahthing?sub_confirmation=1"
                  target="_blank"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-700/60 bg-zinc-950/60 hover:bg-emerald-900/50 text-[11px] sm:text-xs text-emerald-200/90 hover:text-emerald-100 transition"
                >
                  YouTube
                </a>
                <a
                  href="https://twitter.com/iidontnoahthing"
                  target="_blank"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-700/60 bg-zinc-950/60 hover:bg-emerald-900/50 text-[11px] sm:text-xs text-emerald-200/90 hover:text-emerald-100 transition"
                >
                  Twitter
                </a>
                <Link
                  href="/archive"
                  target="_self"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-600/70 bg-zinc-950/60 hover:bg-emerald-800/60 text-[11px] sm:text-xs text-emerald-100/90 hover:text-emerald-50 transition"
                >
                  Archive
                </Link>
              </div>
            </header>
          </AnimatedContent>

          <div className="grid grid-cols-2 gap-0.5 sm:gap-6">
            <AnimatedContent distance={30} direction="vertical" duration={1}>
              <section
                className="relative overflow-hidden flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm min-h-[328px]
                           transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-zinc-900/90 scale-[0.85] sm:scale-100"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_60%)]" />

                <div className="relative z-10 flex flex-col items-center">
                  {rawStatus === "offline" ? (
                    <p className="text-sm sm:text-base text-slate-400">Offline</p>
                  ) : activityName && activityImageUrl ? (
                    <>
                      <img
                        src={activityImageUrl}
                        alt={activityName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-emerald-700/70 shadow-md shadow-emerald-900/40 object-cover mb-3"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <p className="text-sm sm:text-base text-emerald-100 font-medium">
                        {activityName}
                      </p>
                    </>
                  ) : activityName ? (
                    <p className="text-sm sm:text-base text-emerald-100 font-medium">
                      {activityName}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base text-slate-400">
                      No activity detected.
                    </p>
                  )}
                </div>
              </section>
            </AnimatedContent>

            <AnimatedContent distance={30} direction="vertical" duration={1}>
              <section
                className="relative overflow-hidden flex flex-col items-center justify-center gap-3 text-center p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm min-h-[328px]
                           transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-zinc-900/90 scale-[0.85] sm:scale-100"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.18),_transparent_60%)]" />

                {musicData === undefined ? (
                  <p className="relative z-10 text-sm text-slate-400">
                    Fetching currently playing track...
                  </p>
                ) : musicData ? (
                  <>
                    {musicData.albumArtUrl && (
                      <img
                        src={musicData.albumArtUrl}
                        className="relative z-10 rounded-xl w-24 h-24 sm:w-28 sm:h-28 border border-emerald-600/70 shadow-md shadow-emerald-900/40 object-cover"
                        alt={musicData.album || "Album Art"}
                      />
                    )}
                    <div className="relative z-10 text-center">
                      <h2 className="text-md sm:text-lg font-semibold bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                        {musicData.song}
                      </h2>
                      {musicData.album && (
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                          {musicData.album}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        {musicData.artist}
                      </p>
                    </div>
                    {musicData.start && musicData.end && (
                      <div className="relative z-10 w-full flex flex-col mt-2">
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-[10px] sm:text-xs text-slate-500 font-['Geist Mono',monospace] w-7 text-left">
                            {formatTime(elapsed)}
                          </span>
                          <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300"
                              style={{ width: `${progress * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] sm:text-xs text-slate-500 font-['Geist Mono',monospace] w-7 text-right">
                            {formatTime(duration)}
                          </span>
                        </div>
                      </div>
                    )}
                    {musicData && (
                      <a
                        href={`https://www.last.fm/music/${formatForLastfm(
                          musicData.artist
                        )}/_/${formatForLastfm(musicData.song)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 mt-3 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-600/70 bg-zinc-950/70 hover:bg-emerald-900/50 text-[11px] sm:text-xs text-emerald-100/90 hover:text-emerald-50 transition"
                      >
                        View on Last.fm
                      </a>
                    )}
                  </>
                ) : (
                  <p className="relative z-10 text-sm text-slate-400 text-center">
                    Not listening to anything right now.
                  </p>
                )}
              </section>
            </AnimatedContent>
          </div>
        </div>
      </main>
    </>
  );
}
