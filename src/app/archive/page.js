"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedContent from "../../../components/AnimatedContent";
import songs from "./songs.json";
import "../font.css";
import { ArrowLeft, X } from "lucide-react";

export default function Archive() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSongs = songs.filter((track) => {
    const title = (track?.title ?? "").toLowerCase();
    return normalizedQuery === "" || title.includes(normalizedQuery);
  });

  const handleDownload = (track) => {
    setSelectedTrack(track);
  };

  const closeModal = () => {
    setSelectedTrack(null);
  };

  const downloadFile = (ext) => {
    if (!selectedTrack) return;

    const url = selectedTrack[ext];
    window.open(url, "_blank");
    closeModal();
  };

  return (
    <>
      <main
        className="relative flex flex-col items-center justify-center min-h-screen bg-[rgb(6,6,6)] text-slate-100 px-3 sm:px-6"
        style={{ "--accent": "#F5A9B8" }}
      >
        <div className="relative z-10 flex flex-col gap-6 sm:gap-8 w-full max-w-4xl overflow-hidden backdrop-blur-sm bg-black/30 rounded-sm p-3">
          <AnimatedContent distance={20} direction="vertical" duration={0.9}>
            <header className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              <div className="text-center sm:text-left">
                <h1
                  className="text-2xl sm:text-3xl font-semibold tracking-tight bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, var(--accent), var(--accent))",
                  }}
                >
                  Edit Archive
                </h1>

                <p className="mt-1 text-xs sm:text-sm text-slate-400/80">
                  Browse and download available edits.
                </p>
              </div>

              <Link
                href="/"
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
                aria-label="Back to home"
              >
                <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </Link>
            </header>
          </AnimatedContent>

          <AnimatedContent distance={30} direction="vertical" duration={1}>
            <section className="relative overflow-hidden flex flex-col gap-4 p-4 sm:p-5 rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm">
              <div
                className="pointer-events-none absolute inset-0"
                // style={{
                //   background:
                //     "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 12%, transparent), transparent 60%)",
                // }}
              />

              <div className="relative z-10 flex flex-col gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search edits..."
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full rounded-sm border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "color-mix(in srgb, var(--accent) 70%, transparent)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                />

                <p className="text-[11px] sm:text-xs text-slate-500">
                  Showing {filteredSongs.length} of {songs.length}
                </p>
              </div>
            </section>
          </AnimatedContent>

          <AnimatedContent distance={30} direction="vertical" duration={1}>
            <section className="relative overflow-hidden rounded-sm bg-zinc-950/80 border border-zinc-800 shadow-md backdrop-blur-sm">
              <div
                className="pointer-events-none absolute inset-0"
                // style={{
                //   background:
                //     "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)",
                // }}
              />

              <div className="relative z-10 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
                {filteredSongs.length > 0 ? (
                  <div className="flex flex-col divide-y divide-zinc-800">
                    {filteredSongs.map((track, i) => (
                      <button
                        key={`${track.title}-${i}`}
                        onClick={() => handleDownload(track)}
                        className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 transition cursor-pointer bg-transparent"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "color-mix(in srgb, var(--accent) 10%, transparent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <p
                          className="font-medium text-sm sm:text-base"
                          style={{
                            color:
                              "color-mix(in srgb, var(--accent) 90%, white)",
                          }}
                        >
                          {track.title}
                        </p>

                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                          Click to select a format: .mp3 or .wav
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="min-h-40 flex items-center justify-center p-6">
                    <p className="text-sm text-slate-400">
                      No edits found for “{query}”.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </AnimatedContent>
        </div>

        {selectedTrack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-3 sm:px-6">
            <AnimatedContent distance={15} direction="vertical" duration={0.3}>
              <section className="relative overflow-hidden w-full max-w-sm p-5 sm:p-6 rounded-sm bg-zinc-950 border border-zinc-800 shadow-xl">
                <div
                  className="pointer-events-none absolute inset-0"
                  // style={{
                  //   background:
                  //     "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 14%, transparent), transparent 65%)",
                  // }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Download track
                      </p>

                      <h2
                        className="mt-1 text-base sm:text-lg font-semibold break-words"
                        style={{
                          color: "color-mix(in srgb, var(--accent) 90%, white)",
                        }}
                      >
                        {selectedTrack.title}
                      </h2>
                    </div>

                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-sm bg-zinc-950/60 transition cursor-pointer"
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
                      aria-label="Close download menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => downloadFile("mp3")}
                      className="px-4 py-2.5 rounded-sm text-sm font-medium transition cursor-pointer"
                      style={{
                        border:
                          "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                        background: "rgb(9 9 11 / 0.7)",
                        color: "color-mix(in srgb, var(--accent) 90%, white)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "color-mix(in srgb, var(--accent) 20%, transparent)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgb(9 9 11 / 0.7)";
                        e.currentTarget.style.color =
                          "color-mix(in srgb, var(--accent) 90%, white)";
                      }}
                    >
                      .wav
                    </button>

                    <button
                      onClick={() => downloadFile("mp3")}
                      className="px-4 py-2.5 rounded-sm text-sm font-medium transition cursor-pointer"
                      style={{
                        border:
                          "1px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                        background: "rgb(9 9 11 / 0.7)",
                        color: "color-mix(in srgb, var(--accent) 90%, white)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "color-mix(in srgb, var(--accent) 20%, transparent)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgb(9 9 11 / 0.7)";
                        e.currentTarget.style.color =
                          "color-mix(in srgb, var(--accent) 90%, white)";
                      }}
                    >
                      .mp3
                    </button>
                  </div>
                </div>
              </section>
            </AnimatedContent>
          </div>
        )}
      </main>
    </>
  );
}
