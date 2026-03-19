"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AnimatedContent from "../../../components/AnimatedContent";
import songs from "./songs.json";
import "../font.css";

export default function Archive() {
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [query, setQuery] = useState("");
    const backgroundImgRef = useRef(null);

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

    // ── Dominant Color ────────────────────────────────────────────────

    function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function lightenColor(r, g, b, targetLuminance = 0.4) {
        let luminance = getLuminance(r, g, b);
        if (luminance >= targetLuminance) return { r, g, b };

        let factor = 1;
        while (luminance < targetLuminance && factor < 10) {
            factor += 0.1;
            r = Math.min(255, Math.round(r * factor));
            g = Math.min(255, Math.round(g * factor));
            b = Math.min(255, Math.round(b * factor));
            luminance = getLuminance(r, g, b);
        }
        return { r, g, b };
    }

    function getDominantColor(imgElement, callback) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const sampleSize = 50;

        canvas.width = sampleSize;
        canvas.height = sampleSize;

        const process = () => {
            ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
            const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

            const colorMap = {};
            for (let i = 0; i < data.length; i += 4) {
                const r = Math.round(data[i] / 32) * 32;
                const g = Math.round(data[i + 1] / 32) * 32;
                const b = Math.round(data[i + 2] / 32) * 32;
                const a = data[i + 3];
                if (a < 128) continue;
                const key = `${r},${g},${b}`;
                colorMap[key] = (colorMap[key] || 0) + 1;
            }

            const dominant = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])[0][0]
                .split(",")
                .map(Number);

            let [r, g, b] = dominant;

            const luminance = getLuminance(r, g, b);
            if (luminance < 0.15) {
                ({ r, g, b } = lightenColor(r, g, b, 0.35));
            }

            callback(`rgb(${r}, ${g}, ${b})`);
        };

        if (imgElement.complete && imgElement.naturalWidth > 0) {
            process();
        } else {
            imgElement.addEventListener("load", process);
        }
    }

    useEffect(() => {
        const img = backgroundImgRef.current;
        if (!img) return;

        getDominantColor(img, (color) => {
            document.documentElement.style.setProperty("--accent", color);
        });
    }, []);

    // ─────────────────────────────────────────────────────────────────

    return (
        <>
            <img
                ref={backgroundImgRef}
                className="fixed inset-0 w-full h-full object-cover -z-50"
                src="/img/9902119.jpg"
                id="background-img"
            />

            <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-950 via-slate-900 to-zinc-950 text-slate-100 px-4">
                {/* Radial glow mit accent */}
                <div
                    className="pointer-events-none fixed inset-0"
                    style={{
                        background:
                            "radial-gradient(circle at top, color-mix(in srgb, var(--accent) 15%, transparent), transparent 55%), radial-gradient(circle at bottom, rgba(15,23,42,0.9), #020617)",
                    }}
                />

                <div className="relative z-10 w-full max-w-3xl">
                    <div className="text-center mb-6">
                        <AnimatedContent distance={30} direction="vertical" duration={1}>
                            <h1
                                className="text-2xl font-bold mb-2 bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(to right, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                                }}
                            >
                                Edit Archive
                            </h1>
                            <div className="mt-3 flex flex-col items-center gap-2">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search edits…"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                                    style={{
                                        // focus border via onFocus/onBlur da Tailwind focus: keine CSS-Vars auflöst
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "color-mix(in srgb, var(--accent) 70%, transparent)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "";
                                    }}
                                    type="text"
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                                <div className="w-full text-[11px] sm:text-xs text-slate-500">
                                    Showing {filteredSongs.length} of {songs.length}
                                </div>
                            </div>
                        </AnimatedContent>
                    </div>

                    <AnimatedContent distance={30} direction="vertical" duration={1}>
                        <div className="w-full max-h-[55vh] sm:max-h-[65vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shadow-md overflow-hidden">
                            <div className="flex flex-col divide-y divide-zinc-800">
                                {filteredSongs.map((track, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDownload(track)}
                                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-zinc-900/80 transition-colors cursor-pointer"
                                    >
                                        <p
                                            className="font-medium text-sm sm:text-base opacity-90"
                                            style={{ color: "color-mix(in srgb, var(--accent) 70%, white)" }}
                                        >
                                            {track.title}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                                            Click to select a format: .mp3 or .wav
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </AnimatedContent>

                    <AnimatedContent distance={20} direction="vertical" duration={1}>
                        <div className="mt-6 flex justify-center">
                            <Link
                                href="/"
                                className="px-4 py-2 rounded-full bg-zinc-950/70 text-sm transition cursor-pointer"
                                style={{
                                    border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)",
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
                                Back Home
                            </Link>
                        </div>
                    </AnimatedContent>
                </div>

                {/* Download Modal */}
                {selectedTrack && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 px-4">
                        <div className="bg-zinc-950/95 border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full max-w-xs sm:max-w-sm">
                            <h2
                                className="text-base sm:text-lg font-semibold mb-4"
                                style={{ color: "color-mix(in srgb, var(--accent) 70%, white)" }}
                            >
                                Download {selectedTrack.title} as
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button
                                    onClick={() => downloadFile("wav")}
                                    className="px-4 py-2 rounded-xl text-white text-sm transition cursor-pointer w-full sm:w-auto"
                                    style={{ background: "color-mix(in srgb, var(--accent) 80%, black)" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "var(--accent)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "color-mix(in srgb, var(--accent) 80%, black)";
                                    }}
                                >
                                    .wav
                                </button>
                                <button
                                    onClick={() => downloadFile("mp3")}
                                    className="px-4 py-2 rounded-xl text-white text-sm transition cursor-pointer w-full sm:w-auto"
                                    style={{ background: "color-mix(in srgb, var(--accent) 65%, black)" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "color-mix(in srgb, var(--accent) 80%, black)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "color-mix(in srgb, var(--accent) 65%, black)";
                                    }}
                                >
                                    .mp3
                                </button>
                            </div>
                            <button
                                onClick={closeModal}
                                className="mt-4 text-xs sm:text-sm text-slate-400 hover:text-slate-200 cursor-pointer transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
