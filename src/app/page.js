"use client";
import { useState, useEffect, useRef } from "react";
import "./font.css";
import "./marquee.css";
import AnimatedContent from "../../components/AnimatedContent";
import "./OnlineStatus.css";
import Link from "next/link";
import { FaYoutube } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { FolderOpen } from "lucide-react";

// CSS für die rotierende CD (inline, damit keine extra Datei nötig ist)
const cdCss = `
@keyframes cdSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.cd-disc {
  position: relative;
  width: 9.5rem;
  height: 9.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
  box-shadow:
    0 8px 22px color-mix(in srgb, var(--accent) 30%, transparent),
    inset 0 0 10px rgba(0, 0, 0, 0.4);
  animation: cdSpin 7s linear infinite;
}

/* Regenbogen-Reflexion (typisch CD) */
.cd-disc::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.18) 25deg,
    rgba(120, 200, 255, 0.10) 50deg,
    rgba(255, 160, 200, 0.10) 80deg,
    transparent 110deg,
    transparent 180deg,
    rgba(255, 255, 255, 0.12) 205deg,
    rgba(160, 255, 200, 0.08) 230deg,
    transparent 260deg,
    transparent 360deg
  );
  z-index: 2;
  pointer-events: none;
}

/* Glanzlicht oben links */
.cd-disc::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.30), transparent 45%);
  z-index: 3;
  pointer-events: none;
}

.cd-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  object-fit: cover;
  z-index: 1;
}

.cd-cover-empty {
  background: radial-gradient(circle at 35% 35%, #2a2a2e, #101012 70%);
}

/* Innerer Ring um das Loch (typisch CD) */
.cd-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2.4rem;
  height: 2.4rem;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05) 70%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.4),
    inset 0 0 6px rgba(255, 255, 255, 0.1);
  z-index: 4;
}

.cd-hole {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 13px;
  height: 13px;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: #060606;
  border: 2px solid #444;
  z-index: 5;
}

@media (min-width: 640px) {
  .cd-disc {
    width: 10.5rem;
    height: 10.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cd-disc {
    animation: none;
  }
}
`;

const MUSIC_ACTIVITY_NAMES = new Set([
  "Apple Music",
  "Windows Media Player",
  "Cider",
  "mprisence",
  "Feishin",
  "Spotify",
]);

const isMusicLikeActivity = (activity) => {
  if (!activity) return false;
  return activity.type === 2 || MUSIC_ACTIVITY_NAMES.has(activity.name);
};

export default function Home() {
  const [username, setUsername] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.png");
  const [statusClass, setStatusClass] = useState("status-offline");
  const [statusText, setStatusText] = useState(" ");
  const [activityText, setActivityText] = useState(
    "Not doing anything right now",
  );
  const [rawStatus, setRawStatus] = useState("offline");
  const [activityName, setActivityName] = useState(" ");
  const [activityImageUrl, setActivityImageUrl] = useState(" ");
  const [musicData, setMusicData] = useState(undefined);
  const [preferredActivity, setPreferredActivity] = useState(null);
  const [gameDurationStr, setGameDurationStr] = useState(" ");
  const [hasNonMusicActivity, setHasNonMusicActivity] = useState(false);

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

  const getDisplayActivityName = (name) => {
    if (name === "mprisence") return "AIMP";
    return name || "";
  };

  const buildLocalIconPath = (title) => {
    const slug = activityTitleToFilename(title);
    if (!slug) return "";
    return `/presence-icons/${slug}.webp`;
  };

  const iconClass = "w-4 h-4 sm:w-[18px] sm:h-[18px]";

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
        }),
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
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      );
      setUsername(user.username);

      const discordStatus = presence.discord_status || "offline";
      setRawStatus(discordStatus);
      setStatusClass(`status-icon ${statusColors[discordStatus] || ""}`);
      setStatusText(
        discordStatus.charAt(0).toUpperCase() + discordStatus.slice(1),
      );

      const activities = presence.activities || [];
      const nonCustomActivities = activities.filter(
        (act) =>
          act &&
          act.name &&
          act.name !== "Custom Status" &&
          act.type !== 4 &&
          act.type !== 6,
      );

      setHasNonMusicActivity(
        nonCustomActivities.some((act) => !isMusicLikeActivity(act)),
      );

      let prefAct = null;
      for (const act of nonCustomActivities) {
        if (
          !prefAct ||
          (typeof act.type === "number" &&
            act.type <
              (prefAct.type != null ? prefAct.type : Number.POSITIVE_INFINITY))
        ) {
          prefAct = act;
        }
      }

      setPreferredActivity(prefAct);
      setActivityText(
        prefAct
          ? getDisplayActivityName(prefAct.name)
          : "Not doing anything right now",
      );

      if (prefAct) {
        const name = prefAct.name || "";
        const displayName = getDisplayActivityName(name);
        setActivityName(displayName);

        let imgUrl = "";
        if (name === "Apple Music") {
          imgUrl = buildLocalIconPath(name);
        } else {
          const assetKey = (prefAct.assets && prefAct.assets.large_image) || "";
          if (assetKey && !assetKey.startsWith("spotify:")) {
            const indicator = "/https/";
            const idx = assetKey.indexOf(indicator);
            if (idx !== -1) {
              imgUrl = "https://" + assetKey.substring(idx + indicator.length);
            } else if (assetKey.startsWith("https://")) {
              imgUrl = assetKey;
            } else if (prefAct.application_id) {
              imgUrl =
                "https://cdn.discordapp.com/app-assets/" +
                prefAct.application_id +
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

      // MUSIK-ERKENNUNG
      const spotify = presence.listening_to_spotify;
      if (spotify && spotify.song) {
        setMusicData({
          song: spotify.song,
          artist: spotify.artist || "",
          album: spotify.album || "",
          albumArtUrl: spotify.album_art_url || "",
          start: spotify.timestamps ? spotify.timestamps.start : undefined,
          end: spotify.timestamps ? spotify.timestamps.end : undefined,
        });
      } else {
        const musicActivity =
          activities.find((act) => act && act.type === 2) ||
          activities.find(
            (act) =>
              act &&
              (act.name === "Apple Music" ||
                act.name === "Windows Media Player" ||
                act.name === "Cider" ||
                act.name === "mprisence"),
          );

        if (musicActivity && musicActivity.details) {
          const song = musicActivity.details;
          let artist = "";
          let album = "";

          if (musicActivity.state && musicActivity.state.includes("—")) {
            const artistFull = musicActivity.state;
            const parts = artistFull.split("—");
            if (parts.length >= 2) {
              artist = parts[0].trim();
              album = parts.slice(1).join("—").trim();
            }
          } else {
            artist = musicActivity.state || "";
            album =
              (musicActivity.assets && musicActivity.assets.large_text) || "";
          }

          let albumArtUrl = "";
          const rawImageUrl =
            musicActivity.assets && musicActivity.assets.large_image;
          if (rawImageUrl) {
            const indicator = "/https/";
            const idx = rawImageUrl.indexOf(indicator);
            if (idx !== -1) {
              albumArtUrl =
                "https://" + rawImageUrl.substring(idx + indicator.length);
            } else if (rawImageUrl.startsWith("https://")) {
              albumArtUrl = rawImageUrl;
            }
          }

          setMusicData({
            song,
            artist,
            album,
            albumArtUrl,
            start: musicActivity.timestamps && musicActivity.timestamps.start,
            end: musicActivity.timestamps && musicActivity.timestamps.end,
          });
        } else {
          setMusicData(null);
        }
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (
      preferredActivity?.type === 0 &&
      preferredActivity.timestamps?.start &&
      rawStatus !== "offline"
    ) {
      const start = preferredActivity.timestamps.start;
      const updateGameDuration = () => {
        const now = Date.now();
        const msPlayed = now - start;
        setGameDurationStr(formatDuration(msPlayed));
      };
      updateGameDuration();
      const interval = setInterval(updateGameDuration, 60000);
      return () => clearInterval(interval);
    } else {
      setGameDurationStr("");
    }
  }, [preferredActivity, rawStatus]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ op: 3 }));
      }
    }, 30000);
    return () => clearInterval(heartbeat);
  }, []);

  function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours >= 1) {
      return `${hours} hr${hours > 1 ? "s" : ""}${minutes > 0 ? `, ${minutes} min` : ""}`;
    }
    return `${minutes} min`;
  }

  const isUsernameLoading = username === "Loading...";
  const showListeningInHeader =
    rawStatus !== "offline" && Boolean(musicData?.song && !hasNonMusicActivity);

  const marqueeContainerRef = useRef(null);
  const marqueeTextRef = useRef(null);
  const plainTitleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [marqueeVars, setMarqueeVars] = useState({
    total: 0,
    duration: 0,
    gap: 40,
  });

  useEffect(() => {
    let ro = null;
    let raf = null;
    let mounted = true;

    const compute = () => {
      const text = marqueeTextRef.current || plainTitleRef.current;
      const container =
        marqueeContainerRef.current || (text ? text.parentElement : null);

      if (!container || !text) {
        setIsOverflowing(false);
        return;
      }

      const containerWidth = container.getBoundingClientRect().width;
      const textWidth = text.getBoundingClientRect().width;

      if (textWidth > containerWidth) {
        const gap = 40;
        const total = textWidth + gap;
        const speed = 100;
        const duration = Math.max(6, total / speed);

        if (mounted) {
          setMarqueeVars({ total, duration, gap });
          setIsOverflowing(true);
          container.style.setProperty("--total", `${total}px`);
          container.style.setProperty("--gap", `${gap}px`);
          container.style.setProperty("--duration", `${duration}s`);
        }
      } else {
        if (mounted) setIsOverflowing(false);
      }
    };

    const delayedCompute = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTimeout(compute, 40));
    };

    delayedCompute();
    window.addEventListener("resize", delayedCompute);

    try {
      ro = new ResizeObserver(delayedCompute);
      if (marqueeContainerRef.current) ro.observe(marqueeContainerRef.current);
      if (marqueeTextRef.current) ro.observe(marqueeTextRef.current);
      if (plainTitleRef.current) ro.observe(plainTitleRef.current);
    } catch (e) {}

    const imgs = document.querySelectorAll(".relative.z-10 img");
    imgs.forEach((img) => img.addEventListener("load", delayedCompute));

    return () => {
      mounted = false;
      window.removeEventListener("resize", delayedCompute);
      if (ro) ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", delayedCompute));
      if (raf) cancelAnimationFrame(raf);
    };
  }, [musicData?.song]);

  return (
    <>
      <style>{cdCss}</style>
      <main
        className="relative flex flex-col items-center justify-center min-h-screen bg-[rgb(6,6,6)] text-slate-100 px-3 sm:px-6"
        style={{ "--accent": "#F5A9B8" }}
      >
        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 w-full max-w-4xl overflow-y-hidden backdrop-blur-sm bg-black/30 rounded-sm p-3">
          <AnimatedContent distance={20} direction="vertical" duration={0.9}>
            <header className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm object-cover"
                  style={{
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                    boxShadow:
                      "0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)",
                  }}
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, var(--accent), var(--accent))",
                      }}
                    >
                      {username}
                    </span>
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mt-1">
                    <span className={statusClass}></span>
                    <span
                      className="uppercase tracking-wide text-[11px] sm:text-xs opacity-80"
                      style={{ color: "var(--accent)" }}
                    >
                      {statusText || "Offline"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400/80">
                    {showListeningInHeader ? (
                      <>
                        Listening to{" "}
                        <span
                          className="font-medium bg-clip-text text-transparent"
                          style={{
                            backgroundImage:
                              "linear-gradient(to right, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                          }}
                        >
                          {musicData.song}
                        </span>
                        {musicData.artist ? (
                          <>
                            {" "}
                            by{" "}
                            <span
                              className="font-medium bg-clip-text text-transparent"
                              style={{
                                backgroundImage:
                                  "linear-gradient(to right, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                              }}
                            >
                              {musicData.artist}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : preferredActivity?.type === 0 && gameDurationStr ? (
                      `${activityText} for ${gameDurationStr}`
                    ) : (
                      activityText
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <a
                  href="https://www.youtube.com/@iidontnoahthing?sub_confirmation=1"
                  target="_blank"
                  className="p-1.5 sm:p-2 rounded-sm bg-zinc-950/60 transition"
                  style={{
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 60%, transparent)",
                    color: "color-mix(in srgb, var(--accent) 90%, white)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "color-mix(in srgb, var(--accent) 20%, transparent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgb(9 9 11 / 0.6)";
                    e.currentTarget.style.color =
                      "color-mix(in srgb, var(--accent) 90%, white)";
                  }}
                  aria-label="YouTube"
                >
                  <FaYoutube className={iconClass} />
                </a>
                <a
                  href="https://twitter.com/iidontnoahthing"
                  target="_blank"
                  className="p-1.5 sm:p-2 rounded-sm bg-zinc-950/60 transition"
                  style={{
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 60%, transparent)",
                    color: "color-mix(in srgb, var(--accent) 90%, white)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "color-mix(in srgb, var(--accent) 20%, transparent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgb(9 9 11 / 0.6)";
                    e.currentTarget.style.color =
                      "color-mix(in srgb, var(--accent) 90%, white)";
                  }}
                  aria-label="Twitter / X"
                >
                  <FaXTwitter className={iconClass} />
                </a>
                <Link
                  href="/archive"
                  target="_self"
                  className="p-1.5 sm:p-2 rounded-sm bg-zinc-950/60 transition"
                  style={{
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                    color: "color-mix(in srgb, var(--accent) 90%, white)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "color-mix(in srgb, var(--accent) 25%, transparent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgb(9 9 11 / 0.6)";
                    e.currentTarget.style.color =
                      "color-mix(in srgb, var(--accent) 90%, white)";
                  }}
                  aria-label="Archive"
                >
                  <FolderOpen className={iconClass} />
                </Link>
              </div>
            </header>
          </AnimatedContent>

          <div className="grid grid-cols-1 items-stretch gap-0.5 sm:gap-6">
            <div className="h-full min-w-0 [&>*]:h-full">
              <AnimatedContent distance={30} direction="vertical" duration={1}>
                <section
                  className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 p-4 sm:p-6 rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm min-h-[320px] sm:min-h-[240px] w-full min-w-0 transition-all duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "color-mix(in srgb, var(--accent) 60%, transparent)";
                    e.currentTarget.style.transform =
                      "translateY(-2px) scale(1)";
                    e.currentTarget.style.background = "rgb(24 24 27 / 0.9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.background = "";
                  }}
                >
                  <div className="pointer-events-none absolute inset-0" />

                  {musicData === undefined ? (
                    <p className="relative z-10 text-sm text-slate-400">
                      Fetching currently playing track...
                    </p>
                  ) : musicData ? (
                    <>
                      {/* CD links */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className="cd-disc"
                          style={{
                            animationPlayState:
                              musicData.start && musicData.end
                                ? "running"
                                : "paused",
                          }}
                        >
                          {musicData.albumArtUrl ? (
                            <img
                              src={musicData.albumArtUrl}
                              className="cd-cover"
                              alt={musicData.album || "Album Art"}
                            />
                          ) : (
                            <div className="cd-cover cd-cover-empty" />
                          )}
                          <div className="cd-ring" />
                          <div className="cd-hole" />
                        </div>
                      </div>

                      {/* Infos rechts */}
                      <div className="relative z-10 flex-1 min-w-0 text-center sm:text-left">
                        <h2 className="text-md sm:text-lg font-semibold overflow-hidden">
                          {!isOverflowing ? (
                            <span
                              ref={plainTitleRef}
                              className="bg-clip-text text-transparent overflow-x-hidden whitespace-nowrap block"
                              style={{
                                backgroundImage:
                                  "linear-gradient(to right, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                              }}
                            >
                              {musicData.song}
                            </span>
                          ) : (
                            <div
                              ref={marqueeContainerRef}
                              className="marquee w-full overflow-hidden"
                              style={{
                                "--gap": `${marqueeVars.gap}px`,
                                "--duration": `${marqueeVars.duration}s`,
                                "--total": `${marqueeVars.total}px`,
                              }}
                            >
                              <div className="marqueeInner" aria-hidden>
                                <span
                                  ref={marqueeTextRef}
                                  className="marqueeItem"
                                >
                                  {musicData.song}
                                </span>
                                <span className="marqueeItem">
                                  {musicData.song}
                                </span>
                              </div>
                            </div>
                          )}
                        </h2>

                        {musicData.album && (
                          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                            {musicData.album}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                          {musicData.artist}
                        </p>

                        {musicData.start && musicData.end && (
                          <div className="relative z-10 w-full flex flex-col mt-3">
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] sm:text-xs text-slate-500 font-['Geist_Mono',monospace] w-7 text-left">
                                {formatTime(elapsed)}
                              </span>
                              <div className="flex-1 bg-zinc-800 rounded-sm h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-sm transition-all duration-300"
                                  style={{
                                    width: `${progress * 100}%`,
                                    background:
                                      "linear-gradient(to right, color-mix(in srgb, var(--accent) 70%, white), var(--accent))",
                                  }}
                                />
                              </div>
                              <span className="text-[10px] sm:text-xs text-slate-500 font-['Geist_Mono',monospace] w-7 text-right">
                                {formatTime(duration)}
                              </span>
                            </div>
                          </div>
                        )}

                        <a
                          href={`https://www.last.fm/music/${formatForLastfm(
                            musicData.artist,
                          )}/_/${formatForLastfm(musicData.song)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-block mt-4 px-3 sm:px-4 py-1.5 rounded-sm bg-zinc-950/70 text-[11px] sm:text-xs transition"
                          style={{
                            border:
                              "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                            color:
                              "color-mix(in srgb, var(--accent) 90%, white)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "color-mix(in srgb, var(--accent) 20%, transparent)";
                            e.currentTarget.style.color = "var(--accent)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgb(9 9 11 / 0.7)";
                            e.currentTarget.style.color =
                              "color-mix(in srgb, var(--accent) 90%, white)";
                          }}
                        >
                          View on Last.fm
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="relative z-10 text-sm text-slate-400 text-center">
                      Not listening to anything right now
                    </p>
                  )}
                </section>
              </AnimatedContent>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
