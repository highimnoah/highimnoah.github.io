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

  const [preferredActivity, setPreferredActivity] = useState(null);
  const [gameDurationStr, setGameDurationStr] = useState("");

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
      setActivityText(prefAct ? getDisplayActivityName(prefAct.name) : "—");

      if (prefAct) {
        const name = prefAct.name || "";
        const displayName = getDisplayActivityName(name);

        setActivityName(displayName);

        let imgUrl = "";

        if (name === "Apple Music") {
          imgUrl = buildLocalIconPath(name);
        } else {
          let assetKey = (prefAct.assets && prefAct.assets.large_image) || "";

          if (assetKey) {
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

      const applemusicActivity = activities.find(
        (act) =>
          act &&
          ((act.type === 2 && act.name === "Apple Music") ||
            act.name === "Windows Media Player" ||
            act.name === "Cider" ||
            act.name === "mprisence"),
      );

      if (applemusicActivity) {
        const song = applemusicActivity.details;
        let artist = "";
        let album = "";

        if (
          applemusicActivity.state &&
          applemusicActivity.state.includes("—")
        ) {
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
        if (
          applemusicActivity.assets &&
          applemusicActivity.assets.large_image
        ) {
          var rawImageUrl = applemusicActivity.assets.large_image;
          var indicator2 = "/https/";
          var idx2 = rawImageUrl.indexOf(indicator2);
          if (idx2 !== -1)
            albumArtUrl = "https://" + rawImageUrl.substring(idx2 + 7);
          else if (rawImageUrl.startsWith("https://"))
            albumArtUrl = rawImageUrl;
        }

        const start =
          applemusicActivity.timestamps && applemusicActivity.timestamps.start;
        const end =
          applemusicActivity.timestamps && applemusicActivity.timestamps.end;

        if (song && artist) {
          setMusicData({ song, artist, album, albumArtUrl, start, end });
        }
      } else {
        setMusicData(null);
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
      return `${hours} hr${hours > 1 ? "s" : ""}${
        minutes > 0 ? `, ${minutes} min` : ""
      }`;
    }
    return `${minutes} min`;
  }

  const isUsernameLoading = username === "Loading...";

  const marqueeContainerRef = useRef(null);
  const marqueeTextRef = useRef(null);
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
      const container = marqueeContainerRef.current;
      const text = marqueeTextRef.current;
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
                  // ↓ border + shadow via inline style, da Tailwind keine CSS-Vars in border-color unterstützt
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
                    {preferredActivity?.type === 0 && gameDurationStr
                      ? `${activityText} for ${gameDurationStr}`
                      : activityText}
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

          <div className="grid grid-cols-2 gap-0.5 sm:gap-6">
            <AnimatedContent distance={30} direction="vertical" duration={1}>
              <section
                className="relative overflow-hidden flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm min-h-[328px] transition-all duration-200 scale-[0.85] sm:scale-100"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "color-mix(in srgb, var(--accent) 60%, transparent)";
                  e.currentTarget.style.transform = "translateY(-2px) scale(1)";
                  e.currentTarget.style.background = "rgb(24 24 27 / 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.background = "";
                }}
              >
                {/* Radial glow mit accent */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%)",
                  }}
                />

                <div className="relative z-10 flex flex-col items-center">
                  {rawStatus === "offline" ? (
                    <p className="text-sm sm:text-base text-slate-400">
                      Offline
                    </p>
                  ) : activityName && activityImageUrl ? (
                    <>
                      <img
                        src={activityImageUrl}
                        alt={activityName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm object-cover mb-3"
                        style={{
                          border:
                            "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                          boxShadow:
                            "0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <p
                        className="text-sm sm:text-base font-medium"
                        style={{
                          color: "color-mix(in srgb, var(--accent) 90%, white)",
                        }}
                      >
                        {activityName}
                      </p>
                    </>
                  ) : activityName ? (
                    <p
                      className="text-sm sm:text-base font-medium"
                      style={{
                        color: "color-mix(in srgb, var(--accent) 90%, white)",
                      }}
                    >
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
                className="relative overflow-hidden flex flex-col items-center justify-center gap-3 text-center p-4 sm:p-5 rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm min-h-[328px] transition-all duration-200 scale-[0.85] sm:scale-100"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "color-mix(in srgb, var(--accent) 60%, transparent)";
                  e.currentTarget.style.transform = "translateY(-2px) scale(1)";
                  e.currentTarget.style.background = "rgb(24 24 27 / 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.background = "";
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%)",
                  }}
                />

                {musicData === undefined ? (
                  <p className="relative z-10 text-sm text-slate-400">
                    Fetching currently playing track...
                  </p>
                ) : musicData ? (
                  <>
                    {musicData.albumArtUrl && (
                      <img
                        src={musicData.albumArtUrl}
                        className="relative z-10 rounded-sm w-24 h-24 sm:w-28 sm:h-28 object-cover"
                        alt={musicData.album || "Album Art"}
                        style={{
                          border:
                            "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                          boxShadow:
                            "0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)",
                        }}
                      />
                    )}
                    <div className="relative z-10 text-center w-full px-4">
                      <h2 className="text-md sm:text-lg font-semibold overflow-hidden">
                        {!isOverflowing ? (
                          <span
                            className="bg-clip-text text-transparent overflow-x-hidden whitespace-nowrap"
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
                    </div>
                    {musicData.start && musicData.end && (
                      <div className="relative z-10 w-full flex flex-col mt-2 px-4">
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
                    {musicData && (
                      <a
                        href={`https://www.last.fm/music/${formatForLastfm(musicData.artist)}/_/${formatForLastfm(musicData.song)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 mt-3 px-3 sm:px-4 py-1.5 rounded-sm bg-zinc-950/70 text-[11px] sm:text-xs transition"
                        style={{
                          border:
                            "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                          color: "color-mix(in srgb, var(--accent) 90%, white)",
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
