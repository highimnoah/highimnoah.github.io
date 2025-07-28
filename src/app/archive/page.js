"use client";

import Head from 'next/head';
import AnimatedContent from "../../../components/AnimatedContent";

export default function Archive() {
    return (
        <div className="font-[family-name:var(--font-geist-sans)] antialiased">
            <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen">
                <div className="flex gap-4 items-center justify-center flex-col">
                    <Head>
                        <link rel="icon" href="/avatar.png" />
                    </Head>
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
                            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-12 px-4 w-25 sm:w-30 sm:scale-100 scale-120 sm:m-0 sm:mb-2 m-1"
                            href="http://192.168.178.67:9002/api/raw/fileserver/chalice%202018%20452%20v1.1%20laced%20open%2087bpm.wav?"
                        >
                            Laced ⬇️
                        </a>
                    </AnimatedContent>
                </div>
            </main>
        </div>
    );
}