"use client";
import { useRef, useEffect } from "react";

export default function Starfield() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let stars = [];
        const numStars = 150;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            stars = Array.from({ length: numStars }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 0.5,
                alpha: Math.random(),
                twinkle: Math.random() * 0.02 + 0.005,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
            }));
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach((star) => {
                star.x += star.vx;
                star.y += star.vy;

                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;

                star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
                if (star.alpha < 0.1) star.alpha = 0.1;
                if (star.alpha > 1) star.alpha = 1;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        resize();
        animate();
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10"
        />
    );
}
