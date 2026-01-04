"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coffee,
  Gamepad2,
  Code,
  Music,
  Heart,
  MessageSquare,
  Github,
  Headphones,
  ExternalLink,
  Disc,
  Instagram,
  Clock,
  RefreshCw,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define types
type Theme = "persona" | "ultrakill" | "madoka" | "lain" | "sailor";

interface ThemeBannerProps {
  theme: string;
  bannerImages: Record<string, string>;
}

interface AnimeEntry {
  media: {
    title: { romaji: string };
    coverImage: { medium: string };
    episodes?: number;
    chapters?: number;
  };
  progress: number;
  updatedAt: number;
}

interface Track {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  playedAt: string | null;
  nowPlaying: boolean;
}

// Theme Banner component
export function ThemeBanner({ theme, bannerImages }: ThemeBannerProps) {
  const bannerSrc = bannerImages[theme] || "/placeholder.svg";

  return (
    <div className="relative w-full" style={{ aspectRatio: "3/1" }}>
      <Image
        src={bannerSrc}
        alt={`${theme} theme banner`}
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority={true}
      />
    </div>
  );
}

export default function AboutMe() {
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>("persona");
  const [lastAnime, setLastAnime] = useState<AnimeEntry | null>(null);
  const [lastTrack, setLastTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastfmLoading, setLastfmLoading] = useState(false);
  const [lastfmError, setLastfmError] = useState<string | null>(null);

  // Banner images for each theme
  const bannerImages: Record<Theme, string> = {
    persona: "/images/61076.gif",
    ultrakill: "/images/0_AnGNKvtS4Xx-hNUJ.gif",
    madoka: "/images/RWUW8o.gif",
    lain: "/images/87f3f1425b217691da645e97dbb50d55.gif",
    sailor: "/images/1ef13818807b60475c01ce63b56e7a6450bb5516r1-500-275_hq.gif",
  };

  // Profile pictures for each theme
  const profileImages: Record<Theme, string> = {
    persona: "/images/ALz3AvV.gif",
    ultrakill: "/images/ultrakill-v1.gif",
    madoka: "/images/Madoka_Gif_8.webp",
    lain: "/images/171282.gif",
    sailor: "/images/d8dd27b6f50af32408cab32104786f65.gif",
  };

  // Background images for each theme
  const backgroundImages: Record<Theme, string> = {
    persona: "/background/persona.png",
    ultrakill: "/background/ultrakill.png",
    madoka: "/background/madoka.jpg",
    lain: "/background/lain.png",
    sailor: "/background/sailor.jpg",
  };

  // Glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (currentTheme === "lain") {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, [currentTheme]);

  // Fetch AniList data
  useEffect(() => {
    async function fetchAniListData() {
      try {
        const animeEntry = await fetchData("Xhrkz", "ANIME");
        const mangaEntry = await fetchData("Xhrkz", "MANGA");
        const mostRecentEntry = getMostRecentEntry(animeEntry, mangaEntry);
        setLastAnime(mostRecentEntry);
      } catch (error) {
        console.error("Error fetching AniList data:", error);
      }
    }
    fetchAniListData();
  }, []);

  // Fetch Last.fm data
  useEffect(() => {
    fetchLastFmData();
  }, []);

  // AniList API functions
  async function fetchData(
    userName: string,
    type: "ANIME" | "MANGA",
  ): Promise<AnimeEntry | null> {
    const query = `
      query ($userName: String!, $type: MediaType!) {
        MediaListCollection(userName: $userName, type: $type) {
          lists {
            entries {
              media {
                title {
                  romaji
                }
                coverImage {
                  medium
                }
                episodes
                chapters
              }
              progress
              updatedAt
            }
          }
        }
      }
    `;

    const url = "https://graphql.anilist.co";
    const variables = { userName, type };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const lists = data.data?.MediaListCollection?.lists ?? [];

      const allEntries: AnimeEntry[] = lists.flatMap(
        (list: { entries: AnimeEntry[] }) => list.entries ?? [],
      );

      allEntries.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

      return allEntries[0] ?? null;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  function getMostRecentEntry(
    animeEntry: AnimeEntry | null,
    mangaEntry: AnimeEntry | null,
  ): AnimeEntry | null {
    if (!animeEntry && !mangaEntry) return null;
    if (
      animeEntry &&
      (!mangaEntry || animeEntry.updatedAt > mangaEntry.updatedAt)
    )
      return animeEntry;
    return mangaEntry;
  }

  // Last.fm API functions
  async function fetchLastFmData() {
    setLastfmLoading(true);
    setLastfmError(null);

    try {
      const API_KEY = "23da7e2ee86b66645ef248b41343d80e";
      const username = "Ecztassy";
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${API_KEY}&limit=1&format=json`;
      const response = await fetch(url);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const track = data.recenttracks?.track?.[0];

      if (track) {
        setLastTrack({
          name: track.name,
          artist: track.artist["#text"],
          album: track.album["#text"],
          albumArt:
            track.image[2]["#text"] || "/placeholder.svg?height=64&width=64",
          playedAt: track.date?.uts
            ? new Date(track.date.uts * 1000).toISOString()
            : null,
          nowPlaying: track["@attr"]?.nowplaying === "true",
        });
      } else {
        setLastTrack(null);
      }
    } catch (error) {
      console.error("Error fetching Last.fm data:", error);
      setLastfmError("Failed to load Last.fm data");
    } finally {
      setLastfmLoading(false);
      setLoading(false);
    }
  }

  const themeClasses: Record<Theme, string> = {
    persona: "text-white",
    ultrakill: "text-white",
    madoka: "text-white",
    lain: "text-green-400",
    sailor: "text-indigo-900",
  };

  const themeAccentClasses: Record<Theme, string> = {
    persona: "bg-red-600",
    ultrakill: "bg-red-700",
    madoka: "bg-pink-500",
    lain: "bg-green-500",
    sailor: "bg-pink-400",
  };

  const themeBorderClasses: Record<Theme, string> = {
    persona: "border-red-500",
    ultrakill: "border-orange-500",
    madoka: "border-pink-400",
    lain: "border-green-400",
    sailor: "border-yellow-300",
  };

  const themeButtonClasses: Record<Theme, string> = {
    persona: "bg-red-600 hover:bg-red-700",
    ultrakill: "bg-red-700 hover:bg-red-800",
    madoka: "bg-pink-500 hover:bg-pink-600",
    lain: "bg-green-500 hover:bg-green-600 text-black",
    sailor: "bg-pink-400 hover:bg-pink-500",
  };

  // Define scrollbar styles per theme
  const scrollbarStyles: Record<Theme, React.CSSProperties> = {
    persona: {
      scrollbarWidth: "thin",
      scrollbarColor: "#dc2626 #000000", // red-600 thumb, black track
    },
    ultrakill: {
      scrollbarWidth: "thin",
      scrollbarColor: "#b91c1c #000000", // red-700 thumb, black track
    },
    madoka: {
      scrollbarWidth: "thin",
      scrollbarColor: "#ec4899 #000000", // pink-500 thumb, black track
    },
    lain: {
      scrollbarWidth: "thin",
      scrollbarColor: "#22c55e #000000", // green-500 thumb, black track
    },
    sailor: {
      scrollbarWidth: "thin",
      scrollbarColor: "#f472b6 #000000", // pink-400 thumb, black track
    },
  };

  // Webkit scrollbar styles per theme (since scrollbar-color doesn't cover all browsers)
  const webkitScrollbarStyles = {
    persona: {
      trackBackground: "#000000",
      thumbBackground: "#dc2626", // red-600
      thumbBorderRadius: "0.5rem",
      thumbBorder: "2px solid #000000",
    },
    ultrakill: {
      trackBackground: "#000000",
      thumbBackground: "#b91c1c", // red-700
      thumbBorderRadius: "0.5rem",
      thumbBorder: "2px solid #000000",
    },
    madoka: {
      trackBackground: "#000000",
      thumbBackground: "#ec4899", // pink-500
      thumbBorderRadius: "0.5rem",
      thumbBorder: "2px solid #000000",
    },
    lain: {
      trackBackground: "#000000",
      thumbBackground: "#22c55e", // green-500
      thumbBorderRadius: "0.5rem",
      thumbBorder: "2px solid #000000",
    },
    sailor: {
      trackBackground: "#000000",
      thumbBackground: "#f472b6", // pink-400
      thumbBorderRadius: "0.5rem",
      thumbBorder: "2px solid #000000",
    },
  };

  return (
    <>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #000;
          color: white;
          width: 100%;
          height: 100%;
        }

        *::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        *::-webkit-scrollbar-track {
          background: ${webkitScrollbarStyles[currentTheme].trackBackground};
          border-radius: ${webkitScrollbarStyles[currentTheme]
            .thumbBorderRadius};
        }

        *::-webkit-scrollbar-thumb {
          background: ${webkitScrollbarStyles[currentTheme].thumbBackground};
          border-radius: ${webkitScrollbarStyles[currentTheme]
            .thumbBorderRadius};
          border: ${webkitScrollbarStyles[currentTheme].thumbBorder};
        }

        *::-webkit-scrollbar-thumb:hover {
          background: ${webkitScrollbarStyles[currentTheme].thumbBackground}cc;
        }

        *::-webkit-scrollbar-corner {
          background: ${webkitScrollbarStyles[currentTheme].trackBackground};
        }
      `}</style>

      <div
        className={`min-h-screen w-full text-white ${themeClasses[currentTheme]}`}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: `url(${backgroundImages[currentTheme]})`,
            filter: "blur(8px) brightness(0.3)",
            backgroundColor: "#000",
          }}
        ></div>

        <div className="relative z-10 p-0">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative overflow-hidden rounded-lg border-2 ${themeBorderClasses[currentTheme]} backdrop-blur-sm bg-black/60 p-6 md:p-8 text-white`}
            >
              <div className="absolute top-0 right-4 z-10 p-1">
                <Tabs
                  defaultValue="persona"
                  onValueChange={(value) => setCurrentTheme(value as Theme)}
                >
                  <TabsList className="grid grid-cols-5 w-fit bg-black">
                    <TabsTrigger
                      value="persona"
                      className="text-xs px-2 text-white"
                    >
                      Persona
                    </TabsTrigger>
                    <TabsTrigger
                      value="ultrakill"
                      className="text-xs px-2 text-white"
                    >
                      Ultrakill
                    </TabsTrigger>
                    <TabsTrigger
                      value="madoka"
                      className="text-xs px-2 text-white"
                    >
                      Madoka
                    </TabsTrigger>
                    <TabsTrigger
                      value="lain"
                      className="text-xs px-2 text-white"
                    >
                      Lain
                    </TabsTrigger>
                    <TabsTrigger
                      value="sailor"
                      className="text-xs px-2 text-white"
                    >
                      Sailor
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTheme}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`relative w-32 h-32 rounded-full overflow-hidden border-4 top-5 ${themeBorderClasses[currentTheme]}`}
                  >
                    <Image
                      src={
                        profileImages[currentTheme] ||
                        "/placeholder.svg?height=128&width=128"
                      }
                      alt="Profile"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                    {glitchEffect && (
                      <div className="absolute inset-0 bg-green-500/30 mix-blend-overlay"></div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="text-center md:text-left top-5 relative">
                  <motion.h1
                    className={`text-4xl md:text-5xl font-bold text-white ${currentTheme === "lain" ? "font-mono" : ""}`}
                    animate={{
                      x: glitchEffect ? [0, -3, 5, -2, 0] : 0,
                      filter: glitchEffect
                        ? ["blur(0px)", "blur(1px)", "blur(0px)"]
                        : "blur(0px)",
                    }}
                  >
                    XTassy
                  </motion.h1>
                  <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${themeAccentClasses[currentTheme]} text-white`}
                    >
                      INTP / 5w4
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${themeAccentClasses[currentTheme]} text-white`}
                    >
                      He/Him
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${themeAccentClasses[currentTheme]} text-white`}
                    >
                      Demisexual
                    </span>
                  </div>
                  <div className="mt-4 flex justify-center md:justify-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href="https://github.com/Ecztassy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                      >
                        <Github className="w-5 h-5 text-white" />
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href="https://www.instagram.com/ecztassy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5 text-white" />
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href="https://steamcommunity.com/id/CrazynessIsTheKey/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Steam"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 32 32"
                          fill="#ffffff"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-white"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <g id="SVGRepo_iconCarrier">
                            <title>steam</title>
                            <path d="M18.102 12.129c0-0 0-0 0-0.001 0-1.564 1.268-2.831 2.831-2.831s2.831 1.268 2.831 2.831c0 1.564-1.267 2.831-2.831 2.831-0 0-0 0-0.001 0h0c-0 0-0 0-0.001 0-1.563 0-2.83-1.267-2.83-2.83 0-0 0-0 0-0.001v0zM24.691 12.135c0-2.081-1.687-3.768-3.768-3.768s-3.768 1.687-3.768 3.768c0 2.081 1.687 3.768 3.768 3.768v0c2.080-0.003 3.765-1.688 3.768-3.767v-0zM10.427 23.76l-1.841-0.762c0.524 1.078 1.611 1.808 2.868 1.808 1.317 0 2.448-0.801 2.93-1.943l0.008-0.021c0.155-0.362 0.246-0.784 0.246-1.226 0-1.757-1.424-3.181-3.181-3.181-0.405 0-0.792 0.076-1.148 0.213l0.022-0.007 1.903 0.787c0.852 0.364 1.439 1.196 1.439 2.164 0 1.296-1.051 2.347-2.347 2.347-0.324 0-0.632-0.066-0.913-0.184l0.015 0.006zM15.974 1.004c-7.857 0.001-14.301 6.046-14.938 13.738l-0.004 0.054 8.038 3.322c0.668-0.462 1.495-0.737 2.387-0.737 0.001 0 0.002 0 0.002 0h-0c0.079 0 0.156 0.005 0.235 0.008l3.575-5.176v-0.074c0.003-3.12 2.533-5.648 5.653-5.648 3.122 0 5.653 2.531 5.653 5.653s-2.531 5.653-5.653 5.653h-0.131l-5.094 3.638c0 0.065 0.005 0.131 0.005 0.199 0 0.001 0 0.002 0 0.003 0 2.342-1.899 4.241-4.241 4.241-2.047 0-3.756-1.451-4.153-3.38l-0.005-0.027-5.755-2.383c1.841 6.345 7.601 10.905 14.425 10.905 8.281 0 14.994-6.713 14.994-14.994s-6.713-14.994-14.994-14.994c-0 0-0.001 0-0.001 0h0z" />
                          </g>
                        </svg>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => {
                        if (
                          navigator.clipboard &&
                          navigator.clipboard.writeText
                        ) {
                          navigator.clipboard
                            .writeText("ecztassy") // Replace with your actual Discord username
                            .then(() =>
                              alert("Discord username copied to clipboard!"),
                            )
                            .catch(() =>
                              alert("Failed to copy Discord username."),
                            );
                        } else {
                          const textArea = document.createElement("textarea");
                          textArea.value = "ecztassy"; // Replace with your actual Discord username
                          document.body.appendChild(textArea);
                          textArea.select();
                          try {
                            document.execCommand("copy");
                            alert("Discord username copied to clipboard!");
                          } catch (err) {
                            alert("Failed to copy Discord username.");
                          }
                          document.body.removeChild(textArea);
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        fill="#ffffff"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-white"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <g id="SVGRepo_iconCarrier">
                          <defs>
                            <style>
                              {`.a{fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;}`}
                            </style>
                          </defs>
                          <path
                            className="a"
                            d="M17.59,34.1733c-.89,1.3069-1.8944,2.6152-2.91,3.8267C7.3,37.79,4.5,33,4.5,33A44.83,44.83,0,0,1,9.31,13.48,16.47,16.47,0,0,1,18.69,10l1,2.31A32.6875,32.6875,0,0,1,24,12a32.9643,32.9643,0,0,1,4.33.3l1-2.31a16.47,16.47,0,0,1,9.38,3.51A44.8292,44.8292,0,0,1,43.5,33s-2.8,4.79-10.18,5a47.4193,47.4193,0,0,1-2.86-3.81m6.46-2.9c-3.84,1.9454-7.5555,3.89-12.92,3.89s-9.08-1.9446-12.92-3.89"
                          />
                          <circle
                            className="a"
                            cx="17.847"
                            cy="26.23"
                            r="3.35"
                          />
                          <circle
                            className="a"
                            cx="30.153"
                            cy="26.23"
                            r="3.35"
                          />
                        </g>
                      </svg>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href="https://open.spotify.com/user/31ofiy4tfdrv7ek4gv3gyu7pjonm"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Spotify"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-white"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14.5c2.5-1 5.5-1 8 0" />
                          <path d="M6.5 12c3.5-1 7.5-1 11 0" />
                          <path d="M8 9.5c2.5-1 5.5-1 8 0" />
                        </svg>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href="https://spacehey.com/ecztassy_"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="MySpace"
                      >
                        <svg
                          fill="#ffffff"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          viewBox="0 0 420 420"
                          xmlSpace="preserve"
                          stroke="#ffffff"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <g id="SVGRepo_iconCarrier">
                            <g>
                              <path d="M370,172.5h-90c-11.246,0-21.638,3.733-30,10.023V182.5c0-27.57-22.43-50-50-50h-50c-11.64,0-22.362,3.998-30.869,10.692 C114.757,120.055,94.39,102.5,70,102.5H50c-27.57,0-50,22.43-50,50v75c0,5.523,4.477,10,10,10h90v65c0,5.523,4.477,10,10,10h120 v90c0,5.523,4.477,10,10,10h170c5.523,0,10-4.477,10-10v-180C420,194.93,397.57,172.5,370,172.5z M400,392.5H250v-90 c0-5.523-4.477-10-10-10H120v-65c0-5.523-4.477-10-10-10H20v-65c0-16.542,13.458-30,30-30h20c16.542,0,30,13.458,30,30v50h20v-20 c0-16.542,13.458-30,30-30h50c16.542,0,30,13.458,30,30v90h20v-50c0-16.542,13.458-30,30-30h90c16.542,0,30,13.458,30,30V392.5z" />
                              <path d="M330,157.5c38.598,0,70-31.402,70-70s-31.402-70-70-70c-38.598,0-70,31.402-70,70S291.402,157.5,330,157.5z M330,37.5 c27.57,0,50,22.43,50,50s-22.43,50-50,50s-50-22.43-50-50S302.43,37.5,330,37.5z" />
                              <path d="M175,117.5c27.57,0,50-22.43,50-50s-22.43-50-50-50s-50,22.43-50,50S147.43,117.5,175,117.5z M175,37.5 c16.542,0,30,13.458,30,30s-13.458,30-30,30s-30-13.458-30-30S158.458,37.5,175,37.5z" />
                              <path d="M60,87.5c22.056,0,40-17.944,40-40c0-22.056-17.944-40-40-40c-22.056,0-40,17.944-40,40C20,69.556,37.944,87.5,60,87.5z M60,27.5c11.028,0,20,8.972,20,20s-8.972,20-20,20s-20-8.972-20-20S48.972,27.5,60,27.5z" />
                            </g>
                          </g>
                        </svg>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Link
                        href="https://portfoliodiogof.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                      >
                        <Book className="w-5 h-5 text-white" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="mb-8 h-64 rounded-lg overflow-hidden border border-white/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTheme}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <ThemeBanner
                      theme={currentTheme}
                      bannerImages={bannerImages}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                      <Heart className="w-5 h-5 text-white" /> Interests &
                      Hobbies
                    </h2>
                    <ul className="space-y-2 text-white">
                      <li className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 flex-shrink-0 text-white" />
                        <span>Gaming, RPG maker horror</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 flex-shrink-0 text-white" />
                        <span>Anime: Madoka Magica, Lain, Sailor Moon</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 flex-shrink-0 text-white" />
                        <span>
                          ULTRAKILL (blood is fuel), Persona, MTG, YGO
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Code className="w-4 h-4 flex-shrink-0 text-white" />
                        <span>Programming & internet stuff</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                      <Coffee className="w-5 h-5 text-white" /> Likes
                    </h2>
                    <ul className="space-y-2 text-white">
                      <li className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 flex-shrink-0 text-white" />
                        <span>Coffee (trying to quit caffeine though)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Heart className="w-4 h-4 flex-shrink-0 text-white" />
                        <span>Animals and cute stuff ʕ•ᴥ•ʔ</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                      <Music className="w-5 h-5 text-white" /> Music
                    </h2>
                    <p className="text-white">Everything goes.</p>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                      <MessageSquare className="w-5 h-5 text-white" /> About Me
                    </h2>
                    <div className="space-y-3 text-white">
                      <p>
                        Autistic Powerhouse. I'm a 17-year-old INTP/5w4 with a
                        passion for anime, gaming, and all things internet.
                      </p>
                      <p>
                        I like a lot of things so, if u have anything new or
                        something I have forgotten please do try to reach me. I
                        love psychological horror, manga, anime, gundam, lego,
                        mecha, yugioh, magic n much more.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                      <Headphones className="w-5 h-5 text-white" /> Currently
                      Watching
                    </h2>
                    {loading ? (
                      <div className="flex items-center justify-center h-16">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : lastAnime ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              lastAnime.media.coverImage.medium ||
                              "/placeholder.svg?height=64&width=64"
                            }
                            alt={lastAnime.media.title.romaji}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <div className="text-white">
                          <h3 className="font-medium">
                            {lastAnime.media.title.romaji}
                          </h3>
                          <p className="text-sm opacity-80">
                            Progress: {lastAnime.progress}/
                            {lastAnime.media.episodes ||
                              lastAnime.media.chapters ||
                              "?"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white">
                        No recent anime or manga found.
                      </p>
                    )}
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <Disc className="w-5 h-5 text-white" /> Last Listened
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchLastFmData}
                        disabled={lastfmLoading}
                        className="h-8 w-8 text-white"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${lastfmLoading ? "animate-spin" : ""} text-white`}
                        />
                        <span className="sr-only">Refresh</span>
                      </Button>
                    </div>

                    {lastfmLoading ? (
                      <div className="flex items-center justify-center h-16">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : lastfmError ? (
                      <div className="text-red-400 text-sm">
                        <p>{lastfmError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchLastFmData}
                          className="mt-2 text-white"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : lastTrack ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              lastTrack.albumArt ||
                              "/placeholder.svg?height=64&width=64"
                            }
                            alt={lastTrack.album}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                        <div className="text-white">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{lastTrack.name}</h3>
                            {lastTrack.nowPlaying && (
                              <span className="px-2 py-0.5 text-xs bg-green-500 text-black rounded-full">
                                Now Playing
                              </span>
                            )}
                          </div>
                          <p className="text-sm opacity-80">
                            {lastTrack.artist}
                          </p>
                          <p className="text-xs opacity-60">
                            {lastTrack.album}
                          </p>
                          {lastTrack.playedAt && !lastTrack.nowPlaying && (
                            <p className="text-xs opacity-60">
                              {new Date(lastTrack.playedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-white">No recent tracks found.</p>
                    )}
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg backdrop-blur-sm bg-black/50 border ${themeBorderClasses[currentTheme]}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5 text-white" /> Difficulties
                    </h2>
                    <ul className="space-y-2 text-white">
                      <li>Socializing</li>
                      <li>Expressing myself</li>
                      <li>Organizing feelings</li>
                      <li>Quitting caffeine ☕</li>
                    </ul>
                  </motion.div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm opacity-70 text-white">
                  {currentTheme === "lain" ? (
                    <motion.div
                      animate={{
                        x: glitchEffect ? [0, -2, 3, -1, 0] : 0,
                      }}
                    >
                      <span className="font-mono">
                        And you don't seem to understand...
                      </span>
                    </motion.div>
                  ) : currentTheme === "persona" ? (
                    <span>You'll never see it coming</span>
                  ) : currentTheme === "ultrakill" ? (
                    <span>MANKIND IS DEAD. BLOOD IS FUEL. HELL IS FULL.</span>
                  ) : currentTheme === "madoka" ? (
                    <span>Being meguca is suffering</span>
                  ) : (
                    <span>In the name of the moon, I'll punish you!</span>
                  )}
                </div>
                <div className="text-sm opacity-70 text-white">
                  Created by 4chan and YouTube chaos
                </div>
              </div>

              {currentTheme === "persona" && (
                <div className="absolute top-0 right-0 w-32 h-32 -rotate-12 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M50,10 L50,90 M10,50 L90,50"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}

              {currentTheme === "ultrakill" && (
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M10,10 L90,90 M10,90 L90,10"
                      stroke="red"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="orange"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              )}

              {currentTheme === "madoka" && (
                <div className="absolute bottom-0 left-0 w-40 h-40 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M50,10 A40,40 0 0,1 90,50 A40,40 0 0,1 50,90 A40,40 0 0,1 10,50 A40,40 0 0,1 50,10 Z"
                      fill="none"
                      stroke="pink"
                      strokeWidth="2"
                    />
                    <path
                      d="M30,30 L70,70 M30,70 L70,30"
                      stroke="purple"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}

              {currentTheme === "lain" && (
                <>
                  <div className="absolute inset-0 pointer-events-none">
                    {glitchEffect && (
                      <div className="absolute inset-0 bg-green-500/5"></div>
                    )}
                    <div className="absolute top-0 left-0 right-0 h-px bg-green-400/30"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-green-400/30"></div>
                    <div className="absolute top-0 bottom-0 left-0 w-px bg-green-400/30"></div>
                    <div className="absolute top-0 bottom-0 right-0 w-px bg-green-400/30"></div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-xs font-mono text-green-500"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                      >
                        {Math.random() > 0.5 ? "0" : "1"}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {currentTheme === "sailor" && (
                <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M50,10 L55,30 L75,30 L60,45 L65,65 L50,55 L35,65 L40,45 L25,30 L45,30 Z"
                      fill="none"
                      stroke="yellow"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
