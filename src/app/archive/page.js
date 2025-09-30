"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AnimatedContent from "../../../components/AnimatedContent";
import songs from "./songs.json";
import "../font.css"
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
                <link rel="icon" href="public\icon.png" />
            </Head>
            <Starfield />
            <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900/80 text-slate-100 px-4">
                <div className="text-center">
                    <AnimatedContent distance={30} direction="vertical" duration={1}>
                        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent gradient-animated">
                            Edit Archive
                        </h1>
                        <p className="font-medium text-indigo-300 opacity-50 text-sm sm:text-base gradient-animated mb-5">
                            Use the search function of your browser (Ctrl + F) to search for edits
                        </p>
                    </AnimatedContent>
                </div>

                <AnimatedContent distance={30} direction="vertical" duration={1}>
                    <div className="flex flex-col gap-4 w-full max-w-lg max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-2">
                        {songs.map((track, i) => (
                            <button
                                key={i}
                                onClick={() => handleDownload(track)}
                                className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-slate-800/70 hover:bg-slate-700 transition shadow-md cursor-pointer"
                            >
                                <p className="font-medium text-indigo-300 hover:text-indigo-200 text-sm sm:text-base">
                                    {track.title}
                                </p>
                                <p className="text-[11px] sm:text-xs text-slate-500">
                                    Choose format to download
                                </p>
                            </button>
                        ))}
                    </div>
                </AnimatedContent>

                <AnimatedContent distance={30} direction="vertical" duration={1}>
                    <div className="mt-8">
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm text-indigo-300 hover:text-indigo-200 transition cursor-pointer"
                        >
                            Back Home
                        </Link>
                    </div>
                </AnimatedContent>

                {selectedTrack && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full max-w-xs sm:max-w-sm">
                            <h2 className="text-base sm:text-lg font-semibold mb-4 text-indigo-300">
                                Download {selectedTrack.title} as:
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button
                                    onClick={() => downloadFile("wav")}
                                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition cursor-pointer w-full sm:w-auto"
                                >
                                    .wav
                                </button>
                                <button
                                    onClick={() => downloadFile("mp3")}
                                    className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white transition cursor-pointer w-full sm:w-auto"
                                >
                                    .mp3
                                </button>
                            </div>
                            <button
                                onClick={closeModal}
                                className="mt-4 text-sm text-slate-400 hover:text-slate-200 cursor-pointer"
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
