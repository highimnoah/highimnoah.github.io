import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DISCORD_USER_ID = "619810098465734666";

export async function generateMetadata() {
  let icon = "/avatar.png";

  try {
    const res = await fetch(
      `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const json = await res.json();
      const user = json?.data?.discord_user;

      if (user?.id && user?.avatar) {
        icon = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
      }
    }
  } catch (e) {
    
  }

  return {
    title: "idontnoahthing's Links",
    description: "Created by @iidontnoahthing on Discord",
    icons: {
      icon,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
