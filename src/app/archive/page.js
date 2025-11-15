"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedContent from "../../../components/AnimatedContent";
import songs from "./songs.json";
import "../font.css";
import Starfield from "../../../components/Starfield";
import Head from "next/head";

export default function Archive() {
    const [selectedTrack, setSelectedTrack] = useState(null);

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
            <Head>
                <title>Noah • Edit Archive</title>
            </Head>

            <Starfield />

            <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-950 via-slate-900 to-zinc-950 text-slate-100 px-4">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_#020617)]" />

                <div className="relative z-10 w-full max-w-3xl">
                    <div className="text-center mb-6">
                        <AnimatedContent distance={30} direction="vertical" duration={1}>
                            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                                Edit Archive
                            </h1>
                            <p className="text-[11px] sm:text-xs text-slate-500">
                                Use your browser&apos;s search function (Ctrl + F) to search for edits.
                            </p>
                        </AnimatedContent>
                    </div>

                    <AnimatedContent distance={30} direction="vertical" duration={1}>
                        <div className="w-full max-h-[60vh] sm:max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shadow-md overflow-hidden">
                            <div className="flex flex-col divide-y divide-zinc-800">
                                {songs.map((track, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleDownload(track)}
                                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-zinc-900/80 transition-colors cursor-pointer"
                                    >
                                        <p className="font-medium text-emerald-200/90 text-sm sm:text-base">
                                            {track.title}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                                            Click to select a format (.mp3 or .wav)
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
                                className="px-4 py-2 rounded-full border border-emerald-700/60 bg-zinc-950/70 hover:bg-emerald-900/50 text-sm text-emerald-200/90 hover:text-emerald-100 transition cursor-pointer"
                            >
                                Back Home
                            </Link>
                        </div>
                    </AnimatedContent>
                </div>

                {selectedTrack && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 px-4">
                        <div className="bg-zinc-950/95 border border-zinc-800 p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full max-w-xs sm:max-w-sm">
                            <h2 className="text-base sm:text-lg font-semibold mb-4 text-emerald-200">
                                Download {selectedTrack.title} as
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button
                                    onClick={() => downloadFile("wav")}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition cursor-pointer w-full sm:w-auto"
                                >
                                    .wav
                                </button>
                                <button
                                    onClick={() => downloadFile("mp3")}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm transition cursor-pointer w-full sm:w-auto"
                                >
                                    .mp3
                                </button>
                            </div>
                            <button
                                onClick={closeModal}
                                className="mt-4 text-xs sm:text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
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
